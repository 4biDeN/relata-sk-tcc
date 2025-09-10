const db = require('../configs/pg');

const getLocal = async ({ local_cidade, local_bairro, local_rua }) => {
    const sql = `
    select local_id from t_local
    where local_municipio_id=$1 and local_bairro=$2 and local_rua=$3
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
        local_municipio_id,
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
        local.local_municipio_id,
        local.local_estado,
        local.local_bairro,
        local.local_rua,
        local.local_complemento,
        local.local_latitude,
        local.local_longitude
    ]);
    return result.rows[0];
};

const updateLocal = async ( local_id, local ) => {
    const setClauses = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(local)) {
        if (value !== undefined) {
            setClauses.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }
    }
    if (setClauses.length === 0) return false;
    console.log(setClauses)
    console.log(values)
    values.push(local_id);
    const sql = `
        update t_local
        set ${setClauses.join(', ')}
        where local_id = $${index}
    `;
    console.log(sql)

    const result = await db.query(sql, values);

    return result.rowCount > 0;
};

/*
TODO: Criar função para deletar o local
TODO: Criar função para listar os locais
TODO: Criar função para buscar local por id
TODO: Criar função para buscar local por cidade, bairro ou rua
*/
module.exports = {
    getLocal,
    createLocal,
    updateLocal
}