const db = require("../configs/pg");

const createComentario = async (data, { userId } = {}) => {
    const client = await db.getClient();
    try {
        await client.query("BEGIN");
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);

        const ocorrenciaId = Number(data?.comentario_ocorrencia_id);
        const user = Number(data?.comentario_user_id ?? userId);
        const texto = String(data?.comentario_texto ?? '').trim();
        const excluido = data?.comentario_excluido ?? null;

        if (!Number.isInteger(ocorrenciaId)) throw new Error("comentario_ocorrencia_id é obrigatório");
        if (!Number.isInteger(user)) throw new Error("comentario_user_id é obrigatório");
        if (!texto) throw new Error("comentario_texto é obrigatório");

        const sql = `
      insert into t_ocorrencia_comentario (
        comentario_ocorrencia_id,
        comentario_user_id,
        comentario_texto,
        comentario_excluido
      )
      values ($1, $2, $3, coalesce($4, false))
      returning *
    `;
        const params = [ocorrenciaId, user, texto, excluido];
        const { rows } = await client.query(sql, params);

        await client.query("COMMIT");
        return rows[0];
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
};

const getComentariosByOcorrencia = async (
    ocorrenciaId,
    { includeExcluidos = false, limit = 20, offset = 0, before = null } = {}
) => {
    const sql = `
    select
      count(*) over() as total_count,
      c.*,
      u.user_username as comentario_user_username
    from t_ocorrencia_comentario c
    left join t_usuario u on u.user_id = c.comentario_user_id
    where c.comentario_ocorrencia_id = $1
      and ($2::bool or c.comentario_excluido = false)
      and ($3::timestamptz is null or c.comentario_data < $3)
    order by c.comentario_data desc, c.comentario_id desc
    limit $4 offset $5
  `;
    const { rows } = await db.query(sql, [
        ocorrenciaId,
        includeExcluidos,
        before,
        limit,
        offset,
    ]);
    const total = Number(rows[0]?.total_count || 0);
    return { rows, total };
};

const getComentarioById = async (comentarioId) => {
    const sql = `
    select
      c.*,
      u.user_username as comentario_user_username
    from t_ocorrencia_comentario c
    left join t_usuario u on u.user_id = c.comentario_user_id
    where c.comentario_id = $1
  `;
    const { rows } = await db.query(sql, [comentarioId]);
    return rows[0] || null;
};

const updateComentario = async (comentarioId, data = {}, { userId } = {}) => {
    const client = await db.getClient();
    try {
        await client.query("BEGIN");
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);

        const fields = [];
        const values = [];
        let idx = 1;

        if (Object.prototype.hasOwnProperty.call(data, "comentario_texto")) {
            const texto = String(data.comentario_texto ?? "").trim();
            if (!texto) throw new Error("comentario_texto não pode ser vazio");
            fields.push(`comentario_texto = $${idx++}`);
            values.push(texto);
        }
        if (Object.prototype.hasOwnProperty.call(data, "comentario_data")) {
            fields.push(`comentario_data = $${idx++}`);
            values.push(data.comentario_data);
        }
        if (Object.prototype.hasOwnProperty.call(data, "comentario_excluido")) {
            fields.push(`comentario_excluido = $${idx++}`);
            values.push(!!data.comentario_excluido);
        }

        if (fields.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        values.push(comentarioId);
        const sql = `
      update t_ocorrencia_comentario
      set ${fields.join(", ")}
      where comentario_id = $${idx}
      returning *
    `;
        const { rows } = await client.query(sql, values);

        await client.query("COMMIT");
        return rows[0] || null;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

const softDeleteComentario = async (comentarioId, { userId } = {}) => {
    const client = await db.getClient();
    try {
        await client.query("BEGIN");
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);

        const sql = `
      update t_ocorrencia_comentario
      set comentario_excluido = true
      where comentario_id = $1
      returning *
    `;
        const { rows } = await client.query(sql, [comentarioId]);

        await client.query("COMMIT");
        return rows[0] || null;
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
};

const deleteComentario = async (comentarioId, { userId } = {}) => {
    const client = await db.getClient();
    try {
        await client.query("BEGIN");
        await client.query(`select set_config('app.user_id', $1, true)`, [String(userId ?? '')]);

        const sql = `
      delete from t_ocorrencia_comentario
      where comentario_id = $1
    `;
        await client.query(sql, [comentarioId]);

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
    createComentario,
    getComentariosByOcorrencia,
    getComentarioById,
    updateComentario,
    softDeleteComentario,
    deleteComentario,
};
