const { Queue, Worker, QueueEvents } = require('bullmq');
const { redis } = require('../configs/redis');
const db = require('../configs/pg');

let io;

const notifQueue = new Queue('notifications', { connection: redis });
const notifEvents = new QueueEvents('notifications', { connection: redis });

notifEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`[queue] job ${jobId} failed: ${failedReason}`);
});


const DICT_KEYS = {
    status: 'dict:status',
    priority: 'dict:priority',
    userType: 'dict:user_type',
};
const DICT_TTL = 3600;

function mapToNotifType(ev) {
    const raw = String(ev?.event_type || '').toLowerCase();
    const entidade = String(ev?.payload?.entidade || '').toLowerCase();
    const campoRaw = String(ev?.payload?.campo || '').toLowerCase();
    const acao = String(ev?.payload?.acao || '').toLowerCase();

    const campo = (
        campoRaw === 'ocorrencia_status' ? 'status' :
            campoRaw === 'ocorrencia_prioridade' ? 'prioridade' :
                campoRaw === 'ocorrencia_atribuida' ? 'atribuicao' :
                    campoRaw
    );

    if (raw === 'status_change') return 'status_change';
    if (raw === 'comment') return 'comment';
    if (raw === 'image_added') return 'image_added';
    if (raw === 'assigned') return 'assigned';

    if (campo === 'status') return 'status_change';
    if (entidade === 'comentario' && acao === 'attach') return 'comment';
    if (entidade === 'imagem' && acao === 'attach') return 'image_added';
    if (campo === 'atribuicao') return 'assigned';

    return 'generic';
}


async function hgetWithTTL(hash, field) {
    const val = await redis.hget(hash, String(field));
    if (val != null) return val;
    return null;
}
async function hsetWithTTL(hash, field, value) {
    await redis.hset(hash, String(field), String(value));
    const ttl = await redis.ttl(hash);
    if (ttl < 0) await redis.expire(hash, DICT_TTL);
}

async function getStatusName(client, id) {
    if (!Number.isFinite(Number(id))) return null;
    const cached = await hgetWithTTL(DICT_KEYS.status, id);
    if (cached) return cached;
    const { rows } = await client.query(
        `select ocorrencia_status_nome as name
       from t_ocorrencia_status
      where ocorrencia_status_id = $1::int
      limit 1`,
        [Number(id)]
    );
    const name = rows[0]?.name || null;
    if (name) await hsetWithTTL(DICT_KEYS.status, id, name);
    return name;
}

async function getPriorityName(client, id) {
    if (!Number.isFinite(Number(id))) return null;
    const cached = await hgetWithTTL(DICT_KEYS.priority, id);
    if (cached) return cached;
    const { rows } = await client.query(
        `select ocorrencia_prioridade_nome as name
       from t_ocorrencia_prioridade
      where ocorrencia_prioridade_id = $1::int
      limit 1`,
        [Number(id)]
    );
    const name = rows[0]?.name || null;
    if (name) await hsetWithTTL(DICT_KEYS.priority, id, name);
    return name;
}

async function getUserTypeName(client, id) {
    if (!Number.isFinite(Number(id))) return null;
    const cached = await hgetWithTTL(DICT_KEYS.userType, id);
    if (cached) return cached;
    const { rows } = await client.query(
        `select user_type_name as name
       from t_user_type
      where user_type_id = $1::int
      limit 1`,
        [Number(id)]
    );
    const name = rows[0]?.name || null;
    if (name) await hsetWithTTL(DICT_KEYS.userType, id, name);
    return name;
}

async function resolveTargets(client, ocorrenciaId) {
    const base = await client.query(
        `select o.ocorrencia_user_id, o.ocorrencia_atribuida
       from t_ocorrencia o
      where o.ocorrencia_id = $1::int`,
        [ocorrenciaId]
    );
    if (!base.rowCount) return [];

    const creatorId = base.rows[0].ocorrencia_user_id;
    const userType = base.rows[0].ocorrencia_atribuida;

    const assignees = await client.query(
        `select user_id
       from t_usuario
      where user_tipo = $1::int
        and user_is_active = true`,
        [userType]
    );

    const ids = new Set([creatorId, ...assignees.rows.map((r) => r.user_id)]);
    return Array.from(ids).filter(Boolean);
}

async function buildMessageAndMeta(client, ev) {
    const ocId = ev.aggregate_id;

    if (ev?.payload && (ev.payload.titulo || ev.payload.mensagem)) {
        return {
            titulo: ev.payload.titulo || 'Notificação',
            mensagem: ev.payload.mensagem || '',
            meta: { outbox_id: ev.outbox_id, event_type: ev.event_type }
        };
    }

    const campoRaw = String(ev?.payload?.campo || '').toLowerCase();
    const campo = (
        campoRaw === 'ocorrencia_status' ? 'status' :
            campoRaw === 'ocorrencia_prioridade' ? 'prioridade' :
                campoRaw === 'ocorrencia_atribuida' ? 'atribuicao' :
                    campoRaw
    );

    const oldIdRaw = ev?.payload?.valor_anterior;
    const newIdRaw = ev?.payload?.valor_novo;

    let kind = null;
    if (campo === 'status') kind = 'status';
    else if (campo === 'prioridade') kind = 'priority';
    else if (campo === 'atribuicao') kind = 'userType';

    let oldName = null, newName = null;
    if (kind === 'status') {
        oldName = await getStatusName(client, Number(oldIdRaw));
        newName = await getStatusName(client, Number(newIdRaw));
    } else if (kind === 'priority') {
        oldName = await getPriorityName(client, Number(oldIdRaw));
        newName = await getPriorityName(client, Number(newIdRaw));
    } else if (kind === 'userType') {
        oldName = await getUserTypeName(client, Number(oldIdRaw));
        newName = await getUserTypeName(client, Number(newIdRaw));
    }

    const oldDisp = oldName ?? (oldIdRaw != null ? String(oldIdRaw) : '');
    const newDisp = newName ?? (newIdRaw != null ? String(newIdRaw) : '');

    if (kind === 'status') {
        return {
            titulo: `Ocorrência #${ocId} mudou de status`,
            mensagem: `De "${oldDisp}" para "${newDisp}".`,
            meta: {
                outbox_id: ev.outbox_id, event_type: ev.event_type,
                dict: kind, old_id: oldIdRaw ?? null, new_id: newIdRaw ?? null,
                old_name: oldName ?? null, new_name: newName ?? null
            }
        };
    }
    if (kind === 'priority') {
        return {
            titulo: `Ocorrência #${ocId} mudou de prioridade`,
            mensagem: `De "${oldDisp}" para "${newDisp}".`,
            meta: {
                outbox_id: ev.outbox_id, event_type: ev.event_type,
                dict: kind, old_id: oldIdRaw ?? null, new_id: newIdRaw ?? null,
                old_name: oldName ?? null, new_name: newName ?? null
            }
        };
    }
    if (kind === 'userType') {
        return {
            titulo: `#${ocId} atribuída`,
            mensagem: `De "${oldDisp}" para "${newDisp}".`,
            meta: {
                outbox_id: ev.outbox_id, event_type: ev.event_type,
                dict: kind, old_id: oldIdRaw ?? null, new_id: newIdRaw ?? null,
                old_name: oldName ?? null, new_name: newName ?? null
            }
        };
    }

    const rawType = String(ev.event_type || '').toLowerCase();
    if (rawType === 'comment') {
        return {
            titulo: `Novo comentário em #${ocId}`,
            mensagem: ev.payload?.meta?.preview || 'Veja os detalhes.',
            meta: { outbox_id: ev.outbox_id, event_type: ev.event_type }
        };
    }
    if (rawType === 'image_added') {
        return {
            titulo: `Imagem adicionada em #${ocId}`,
            mensagem: 'Um arquivo foi anexado.',
            meta: { outbox_id: ev.outbox_id, event_type: ev.event_type }
        };
    }
    if (rawType === 'created') {
        return {
            titulo: `Ocorrência #${ocId} criada`,
            mensagem: 'Uma nova ocorrência foi registrada.',
            meta: { outbox_id: ev.outbox_id, event_type: ev.event_type }
        };
    }
    if (rawType === 'deleted') {
        return {
            titulo: `Ocorrência #${ocId} excluída`,
            mensagem: 'Registro removido.',
            meta: { outbox_id: ev.outbox_id, event_type: ev.event_type }
        };
    }

    return {
        titulo: `Atualização em #${ocId}`,
        mensagem: 'Houve uma alteração.',
        meta: { outbox_id: ev.outbox_id, event_type: ev.event_type }
    };
}

new Worker(
    'notifications',
    async (job) => {
        const ev = job.data;

        if (typeof ev.payload === 'string') {
            try {
                ev.payload = JSON.parse(ev.payload);
            } catch {
                ev.payload = {};
            }
        }

        const aggregateId = Number(ev.aggregate_id);
        const outboxId = Number(ev.outbox_id);
        const notifType = mapToNotifType(ev);

        const client = await db.getClient();
        try {
            const targets = await resolveTargets(client, aggregateId);
            if (!targets.length) return;

            const { titulo, mensagem, meta } = await buildMessageAndMeta(client, ev);
            const actionUrl = `/ocorrencias/${aggregateId}`;

            for (const uid of targets) {
                let notifId = null;

                try {
                    const ins = await client.query(
                        `insert into t_notificacao (
                            notificacao_user_id, notificacao_ocorrencia_id, notificacao_tipo,
                            notificacao_canal, notificacao_titulo, notificacao_mensagem,
                            action_url, prioridade, status, meta
                        ) values (
                            $1::int, $2::int, $3::text,
                            'in_app', $4::text, $5::text,
                            $6::text, 3, 'queued', $7::jsonb
                        )
                        returning notificacao_id`,
                        [
                            uid,
                            aggregateId,
                            notifType,
                            String(titulo),
                            String(mensagem),
                            String(actionUrl),
                            JSON.stringify(meta)
                        ]
                    );
                    notifId = ins.rows[0].notificacao_id;
                } catch (err) {
                    if (err?.code === '23505') {
                        const sel = await client.query(
                            `select notificacao_id
                                from t_notificacao
                            where coalesce(notificacao_user_id, -1) = $1::int
                                and coalesce(notificacao_user_type, -1) = -1
                                and coalesce(notificacao_ocorrencia_id, -1) = $2::int
                                and notificacao_tipo = $3::text
                                and notificacao_canal = 'in_app'
                                and status in ('queued','sending')
                            order by created_at desc, notificacao_id desc
                            limit 1`,
                            [uid, aggregateId, notifType]
                        );
                        notifId = sel.rows[0]?.notificacao_id ?? null;
                    } else {
                        throw err;
                    }
                }

                if (!notifId) continue;

                if (io) {
                    await client.query(
                        `update t_notificacao
                set status = 'sent',
                    enviada_em = current_timestamp
              where notificacao_id = $1::bigint
                and status in ('queued','sending')`,
                        [notifId]
                    );

                    io.to(`user:${uid}`).emit('notification:new', {
                        id: notifId,
                        title: titulo,
                        body: mensagem,
                        actionUrl,
                        ocorrenciaId: aggregateId
                    });
                }
            }
        } catch (e) {
            console.error('[worker] erro ao processar evento:', e);
            throw e;
        } finally {
            client.release();
        }
    },
    { connection: redis }
);

async function pumpOutbox(limit = 200) {
    const client = await db.getClient();
    try {
        await client.query('begin');

        const res = await client.query(
            `select *
         from t_outbox_event
        where processed_at is null
        order by occurred_at
        limit $1
        for update skip locked`,
            [limit]
        );

        for (const ev of res.rows) {
            await client.query(
                `update t_outbox_event
            set attempts = attempts + 1,
                processed_at = current_timestamp
          where outbox_id = $1::bigint`,
                [Number(ev.outbox_id)]
            );
            await notifQueue.add('domain_event', ev, {
                removeOnComplete: true,
                attempts: 5,
                backoff: { type: 'exponential', delay: 2000 }
            });
        }

        await client.query('commit');
    } catch (e) {
        await client.query('rollback');
        console.error('[outbox] erro:', e);
    } finally {
        client.release();
    }
}

function startOutboxPump(ioInstance) {
    io = ioInstance || null;
    setInterval(() => pumpOutbox().catch(console.error), 1500);
    console.log('[outbox] pump iniciado (1.5s)');
}

module.exports = { startOutboxPump };
