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

    values.push(local_id);
    const sql = `
        update t_local
        set ${setClauses.join(', ')}
        where local_id = $${index}
    `;
    const result = await db.query(sql, values);
    return result.rowCount > 0;
};

const getLocais = async () => {
    const sql = `
        select
            l.local_id,
            l.local_estado,
            m.municipio_nome,
            l.local_bairro,
            l.local_rua,
            l.local_complemento,
            l.local_latitude,
            l.local_longitude
        from t_local l
        join t_municipio m on l.local_municipio_id = m.municipio_id
    `;
    const result = await db.query(sql);
    return result.rows;
};

const getLocalById = async ( local_id ) => {
    const sql = `
        select
            l.local_id,
            l.local_estado,
            m.municipio_nome,
            l.local_bairro,
            l.local_rua,
            l.local_complemento,
            l.local_latitude,
            l.local_longitude
        from t_local l
        join t_municipio m on l.local_municipio_id = m.municipio_id
        where l.local_id = $1
    `;
    const result = await db.query(sql, [local_id]);
    return result.rows[0];
};

const searchLocais = async ( query ) => {
    const sql = `
        select
            l.local_id,
            l.local_estado,
            m.municipio_nome,
            l.local_bairro,
            l.local_rua,
            l.local_complemento,
            l.local_latitude,
            l.local_longitude
        from t_local l
        join t_municipio m on l.local_municipio_id = m.municipio_id
        where m.municipio_nome ilike '%' || $1 || '%'
        or l.local_bairro ilike '%' || $1 || '%'
        or l.local_rua ilike '%' || $1 || '%'
    `;
    const result = await db.query(sql, [query]);
    return result.rows;
};

// TODO: Criar função para deletar o local (soft delete)
module.exports = {
    getLocal,
    createLocal,
    updateLocal,
    getLocais,
    getLocalById,
    searchLocais
}