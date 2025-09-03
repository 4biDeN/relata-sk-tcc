const db = require('../configs/pg');

const createReclamacao = async ({
    reclamacao_user_id,
    reclamacao_titulo,
    reclamacao_descricao,
    reclamacao_prioridade,
    reclamacao_local_id
}) => {
    const sql = `
        insert into t_reclamacao (
            reclamacao_user_id,
            reclamacao_titulo,
            reclamacao_descricao,
            reclamacao_status,
            reclamacao_prioridade,
            reclamacao_local_id
        )
        values ($1, $2, $3, 1, $4, $5)
        returning reclamacao_id, reclamacao_protocolo, reclamacao_titulo, reclamacao_descricao
    `;

    const result = await db.query(sql, [
        reclamacao_user_id,
        reclamacao_titulo,
        reclamacao_descricao,
        reclamacao_prioridade,
        reclamacao_local_id
    ]);
    return result.rows[0];
};

const getReclamacaoById = async (reclamacao_id) => {
    const sql = `
        select 
            r.reclamacao_id,
            r.reclamacao_titulo,
            r.reclamacao_descricao,
            r.reclamacao_data,
            rs.reclamacao_status_nome,
            u.user_username
            l.local_cidade,
            l.local_estado,
            l.local_bairro,
            l.local_rua,
            l.local_complemento
        from t_reclamacao r
        join t_reclamacao_status rs on r.reclamacao_status = rs.reclamacao_status_id
        join t_usuario u on r.reclamacao_user_id = u.user_id
        join t_local l on r.reclamacao_local_id = l.local_id
        where r.reclamacao_id = $1 
    `;

    const result = await db.query(sql, [reclamacao_id]);
    return result.rows.length ? result.rows[0] : null;
};

const getReclamacaoByUser = async (userd_id) => {
    const sql = `
    select
        r.reclamacao_id,
        r.reclamacao_titulo,
        r.reclamacao_data,
        r.reclamacao_status
    from t_reclamacao r
    where r.reclamacao_user_id = $1
    `
    const result = await db.query(sql, [userd_id]);
    return result.rows.length ? result.rows : null;
}

const deleteReclamacao = async (reclamacao_id) => {
    const sql = `
    uptate t_reclamacao
        set reclamcao_excluida = true
    where reclamacao_id = $1
    `
    await db.query(sql, [reclamacao_id]);
}

module.exports = {
    createReclamacao,
    getReclamacaoById,
    getReclamacaoByUser,
    deleteReclamacao
};