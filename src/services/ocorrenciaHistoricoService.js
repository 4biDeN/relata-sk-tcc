const db = require("../configs/pg");

const appendOcorrenciaHistorico = async (data, { userId } = {}) => {
    const client = await db.getClient();
    try {
        await client.query("BEGIN");
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);

        const sel = `
      select
        historico_id,
        acao,
        entidade,
        campo,
        valor_novo
      from t_ocorrencia_historico
      where ocorrencia_id = $1
        and entidade = $2
        and coalesce(campo, '') = coalesce($3, '')
      order by changed_at desc, historico_id desc
      limit 1
    `;
        const lastRes = await client.query(sel, [
            data.ocorrencia_id,
            data.entidade,
            data.campo ?? null,
        ]);
        const last = lastRes.rows[0];

        const sameAction = last && last.acao === data.acao && last.entidade === data.entidade;
        const sameField = last && (last.campo ?? "") === (data.campo ?? "");
        const sameNewValue = last && (last.valor_novo ?? "") === (data.valor_novo ?? "");

        if (sameAction && sameField && sameNewValue) {
            await client.query("COMMIT");
            return null;
        }

        const ins = `
      insert into t_ocorrencia_historico (
        ocorrencia_id,
        acao,
        entidade,
        campo,
        valor_anterior,
        valor_novo,
        entidade_id,
        changed_by,
        changed_at,
        meta
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8,
        coalesce($9, current_timestamp),
        coalesce($10, '{}'::jsonb)
      )
      returning *
    `;

        const params = [
            data.ocorrencia_id,
            data.acao,
            data.entidade,
            data.campo ?? null,
            data.valor_anterior ?? null,
            data.valor_novo ?? null,
            data.entidade_id ?? null,
            data.changed_by ?? (userId != null ? Number(userId) : null),
            data.changed_at ?? null,
            data.meta ?? null,
        ];

        const result = await client.query(ins, params);

        await client.query("COMMIT");
        return result.rows[0];
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
};

const createOcorrenciaHistorico = appendOcorrenciaHistorico;

const getOcorrenciaHistoricoByOcorrencia = async (ocorrencia_id, limit = 20, offset = 0) => {
    const sql = `
    select
      count(*) over() as total_count,
      h.*,
      u.user_username as changed_by_username
    from t_ocorrencia_historico h
    left join t_usuario u on u.user_id = h.changed_by
    where h.ocorrencia_id = $1
    order by h.changed_at desc, h.historico_id desc
    limit $2 offset $3
  `;
    const { rows } = await db.query(sql, [ocorrencia_id, limit, offset]);
    const total = Number(rows[0]?.total_count || 0);
    return { rows, total };
};

const updateOcorrenciaHistorico = async (id, data, { userId } = {}) => {
    const client = await db.getClient();
    try {
        await client.query("BEGIN");
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);

        const fields = [];
        const values = [];
        let idx = 1;

        if (data.ocorrencia_id !== undefined) { fields.push(`ocorrencia_id = $${idx++}`); values.push(data.ocorrencia_id); }
        if (data.acao !== undefined) { fields.push(`acao = $${idx++}`); values.push(data.acao); }
        if (data.entidade !== undefined) { fields.push(`entidade = $${idx++}`); values.push(data.entidade); }
        if (data.campo !== undefined) { fields.push(`campo = $${idx++}`); values.push(data.campo); }
        if (data.valor_anterior !== undefined) { fields.push(`valor_anterior = $${idx++}`); values.push(data.valor_anterior); }
        if (data.valor_novo !== undefined) { fields.push(`valor_novo = $${idx++}`); values.push(data.valor_novo); }
        if (data.entidade_id !== undefined) { fields.push(`entidade_id = $${idx++}`); values.push(data.entidade_id); }
        if (data.changed_by !== undefined || userId != null) {
            fields.push(`changed_by = $${idx++}`);
            values.push(data.changed_by !== undefined ? data.changed_by : Number(userId));
        }
        if (data.changed_at !== undefined) { fields.push(`changed_at = $${idx++}`); values.push(data.changed_at); }
        if (data.meta !== undefined) { fields.push(`meta = $${idx++}`); values.push(data.meta); }

        if (fields.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        values.push(id);
        const sql = `
      update t_ocorrencia_historico
      set ${fields.join(", ")}
      where historico_id = $${idx}
      returning *
    `;
        const result = await client.query(sql, values);

        await client.query("COMMIT");
        return result.rows.length ? result.rows[0] : null;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

const deleteOcorrenciaHistorico = async (id, { userId } = {}) => {
    const client = await db.getClient();
    try {
        await client.query("BEGIN");
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);

        const sql = `
      delete from t_ocorrencia_historico
      where historico_id = $1
    `;
        await client.query(sql, [id]);

        await client.query("COMMIT");
        return true;
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
};

module.exports = {
    createOcorrenciaHistorico,
    appendOcorrenciaHistorico,
    getOcorrenciaHistoricoByOcorrencia,
    updateOcorrenciaHistorico,
    deleteOcorrenciaHistorico,
};
