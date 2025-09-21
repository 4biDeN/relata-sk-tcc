const db = require("../configs/pg");

const createOcorrenciaStatusHistorico = async (data) => {
  const sql = `
    insert into t_ocorrencia_status_historico (ocorrencia_id, ocorrencia_status_id, data_alteracao)
    values ($1, $2, coalesce($3, current_timestamp))
    returning *
  `;
  const params = [
    data.ocorrencia_id,
    data.ocorrencia_status_id,
    data.data_alteracao || null,
  ];
  const result = await db.query(sql, params);
  return result.rows[0];
};

const getOcorrenciaStatusHistoricoByOcorrencia = async (
  ocorrencia_id,
  limit = 20,
  offset = 0
) => {
  const sql = `
    select h.*, s.ocorrencia_status_nome
    from t_ocorrencia_status_historico h
    join t_ocorrencia_status s on h.ocorrencia_status_id = s.ocorrencia_status_id
    where h.ocorrencia_id = $1
    order by h.data_alteracao desc
    limit $2 offset $3
  `;
  const result = await db.query(sql, [ocorrencia_id, limit, offset]);
  return result.rows;
};

const updateOcorrenciaStatusHistorico = async (id, data) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const fields = [];
    const values = [];
    let idx = 1;

    if (data.ocorrencia_status_id !== undefined) {
      fields.push(`ocorrencia_status_id = $${idx++}`);
      values.push(data.ocorrencia_status_id);
    }
    if (data.data_alteracao !== undefined) {
      fields.push(`data_alteracao = $${idx++}`);
      values.push(data.data_alteracao);
    }

    if (fields.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    values.push(id);
    const sql = `
      update t_ocorrencia_status_historico
      set ${fields.join(", ")}
      where ocorrencia_status_historico_id = $${idx}
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

const deleteOcorrenciaStatusHistorico = async (id) => {
  const sql = `
    delete from t_ocorrencia_status_historico
    where ocorrencia_status_historico_id = $1
  `;
  await db.query(sql, [id]);
  return true;
};

module.exports = {
  createOcorrenciaStatusHistorico,
  getOcorrenciaStatusHistoricoByOcorrencia,
  updateOcorrenciaStatusHistorico,
  deleteOcorrenciaStatusHistorico,
};