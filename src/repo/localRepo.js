const db = require('../configs/pg');

const getLocal = async ({ local_cidade, local_bairro, local_rua }) => {
    const sql = `
    select local_id from t_local
    where local_cidade=$1 and local_bairro=$2 and local_rua=$3
    `;

    const result = await db.query(sql, [
        local_cidade,
        local_bairro,
        local_rua
    ]);
    return result.rows[0];
}

const createLocal = async ( local ) => {
    const sql = `
    insert into t_local (
        local_cidade,
        local_estado,
        local_bairro,
        local_rua,
        local_complemento,
        local_latitude,
        local_longitude
    ) values ($1, $2, $3, $4, $5, $6, $7)
    returning local_id
    `;
    const result = await db.query (sql, [
        local.local_cidade,
        local.local_estado,
        local.local_bairro,
        local.local_rua,
        local.local_complemento,
        local.local_latitude,
        local.local_longitude
    ]);
    return result.rows[0];
}

module.exports = {
    getLocal,
    createLocal
}