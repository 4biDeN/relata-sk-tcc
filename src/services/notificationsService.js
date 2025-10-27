const db = require('../configs/pg');

const OUTBOX_TYPES = new Set([
    'status_change', 'comment', 'image_added', 'assigned', 'updated', 'created', 'deleted', 'generic'
]);

async function enqueueNotificacao(data = {}, { userId } = {}) {
    if (!Number.isInteger(data?.ocorrencia_id)) {
        throw new Error('ocorrencia_id é obrigatório.');
    }

    const eventType = String(data?.tipo || 'generic').trim();
    if (!OUTBOX_TYPES.has(eventType)) {
        throw new Error(`tipo inválido: ${eventType}`);
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);
        const payload = {
            source: 'manual',
            titulo: data?.titulo ?? null,
            mensagem: data?.mensagem ?? null,
            action_url: data?.action_url ?? null,
            prioridade: Number.isInteger(data?.prioridade) ? data.prioridade : null,
            meta: data?.meta ?? {}
        };
        const sql = `
      insert into t_outbox_event (aggregate, aggregate_id, event_type, payload, occurred_at)
      values ('ocorrencia', $1::bigint, $2::text, $3::jsonb, current_timestamp)
      returning outbox_id
    `;
        const { rows } = await client.query(sql, [
            data.ocorrencia_id,
            eventType,
            payload
        ]);
        await client.query('COMMIT');
        return { outbox_id: rows[0].outbox_id };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

const listNotificacoes = async (userId, userTypeId, options = {}) => {
    const canal = String(options.canal || 'in_app').trim();

    const includeStatus = Array.isArray(options.includeStatus) && options.includeStatus.length
        ? options.includeStatus.map(s => String(s).trim()).filter(Boolean)
        : ['queued', 'sent', 'read'];

    const tipos = Array.isArray(options.tipo)
        ? options.tipo.map(t => String(t).trim()).filter(Boolean)
        : (options.tipo ? [String(options.tipo).trim()] : []);

    const toValidDateOrNull = (v) => {
        const d = v instanceof Date ? v : (v ? new Date(v) : null);
        return (d && !isNaN(d.getTime())) ? d : null;
    };
    const cursor = toValidDateOrNull(options.cursor);

    const limit = Math.min(Number(options.limit || 50) || 50, 100);

    const wheres = [
        `n.notificacao_canal = $1`,
        `n.status = ANY($2::text[])`,
        `(
      ($3::int IS NOT NULL AND n.notificacao_user_id = $3::int)
      OR
      ($4::int IS NOT NULL AND n.notificacao_user_type = $4::int)
    )`,
        `($5::timestamptz IS NULL OR n.created_at < $5::timestamptz)`,
    ];

    const params = [canal, includeStatus, userId ?? null, userTypeId ?? null, cursor ?? null];
    let idx = 6;

    if (tipos.length) {
        wheres.push(`n.notificacao_tipo = ANY($${idx++}::text[])`);
        params.push(tipos);
    }

    const sql = `
    WITH base AS (
      SELECT n.*
      FROM t_notificacao n
      WHERE ${wheres.join(' AND ')}
      ORDER BY n.created_at DESC, n.notificacao_id DESC
      LIMIT $${idx}
    )
    SELECT * FROM base
    ORDER BY created_at DESC, notificacao_id DESC
  `;
    params.push(limit);

    const { rows } = await db.query(sql, params);
    const nextCursor = rows.length ? rows[rows.length - 1].created_at : null;
    return { rows, nextCursor };
};


async function getNotificacaoById(notificacaoId, { userId, userTypeId } = {}) {
    const sql = `
    select *
      from t_notificacao n
     where n.notificacao_id = $1
       and ($2::int is null or n.notificacao_user_id = $2 or n.notificacao_user_type = $3)
     limit 1
  `;
    const { rows } = await db.query(sql, [notificacaoId, userId ?? null, userTypeId ?? null]);
    return rows[0] || null;
}

async function unreadCount(userId, userTypeId, { canal = 'in_app' } = {}) {
    const sql = `
    select count(*)::int as unread
      from t_notificacao n
     where n.notificacao_canal = $1
       and n.status in ('queued','sent')
       and (n.notificacao_user_id = $2 or n.notificacao_user_type = $3)
  `;
    const { rows } = await db.query(sql, [canal, userId, userTypeId]);
    return rows[0]?.unread ?? 0;
}

async function markNotificacaoRead(notificacaoId, { userId, userTypeId } = {}) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);
        const sql = `
      update t_notificacao n
         set status = 'read'
       where n.notificacao_id = $1
         and (n.notificacao_user_id = $2 or n.notificacao_user_type = $3)
      returning n.*
    `;
        const { rows } = await client.query(sql, [notificacaoId, userId, userTypeId]);
        await client.query('COMMIT');
        return rows[0] || null;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function markAllNotificacoesRead({ userId, userTypeId, canal = 'in_app' } = {}) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);
        const sql = `
      update t_notificacao n
         set status = 'read'
       where n.notificacao_canal = $1
         and n.status in ('queued','sent')
         and (n.notificacao_user_id = $2 or n.notificacao_user_type = $3)
    `;
        await client.query(sql, [canal, userId, userTypeId]);
        await client.query('COMMIT');
        return true;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

module.exports = {
    enqueueNotificacao,
    listNotificacoes,
    getNotificacaoById,
    unreadCount,
    markNotificacaoRead,
    markAllNotificacoesRead,
};
