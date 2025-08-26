const db = require('../configs/pg')

const createReclamacao = async ({ reclamacao_titulo, reclmamacao_descricao, reclamacao_status, reclamacao_user_id }) => {
    const sql = `
    INSERT INTO t_reclamacao (
        reclamacao_titulo,
        reclamacao_descricao,
        reclamacao_status,
        reclamacao_user_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING reclamacao_id, reclamacao_titulo, reclamacao_descricao, reclamacao_status, reclamacao_user_id
    `;

    const result = await db.query(sql, [
        reclamacao_titulo,
        reclmamacao_descricao,
        reclamacao_status,
        reclamacao_user_id
    ]);
    return result.rows[0];
};

const getReclamacaoById = async (reclamacao_id) => {
    const sql = `
    SELECT 
        r.reclamacao_id,
        r.reclamacao_titulo,
        r.reclamacao_descricao,
        r.reclamacao_data,
        rs.reclamacao_status_nome,
        u.user_username
    FROM t_reclamacao r
    JOIN t_reclamacao_status rs ON r.reclamacao_status = rs.reclamacao_status_id
    JOIN t_usuario u ON r.reclamacao_user_id = u.user_id
    WHERE r.reclamacao_id = $1 
    `;

    const result = await db.query(sql, [reclamacao_id]);
    return result.rows.length ? result.rows[0] : null;
};

module.exports = {
    createReclamacao,
    getReclamacaoById
};