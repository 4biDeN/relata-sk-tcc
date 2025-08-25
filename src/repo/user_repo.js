const db = require('../configs/pg');

const findByDocumneto = async (documento) => {
    const sql = `
        SELECT u.user_id, u.user_documento, u.user_password, u.user_salt, u.user_token_version, t.user_type_name
        FROM t_usuario u
        INNER JOIN t_user_type t ON u.user_tipo = t.user_type_id
        WHERE u.user_doumento = $1
`;
    const result = await db.query(sql, [documento]);
    return result.rows.length ? result.rows[0] : null;
};

const createUser = async ({ user_username, user_email, user_documento, user_password, user_salt }) => {
    const sql = `
    INSERT INTO t_usuario (
        user_username, 
        user_email, 
        user_documento, 
        user_password, 
        user_salt, 
        user_token_version
        )
    VALUES ($1, $2, $3, $4, $5, 0)
    RETURNING user_id, user_username, user_email, user_documento
    `;

    const result = await db.query(sql, [
        user_username,
        user_email,
        user_documento,
        user_password,
        user_salt,
    ]);
    return result.rows[0];
};

const getAll = async () => {
    const sql = `
        SELECT user_id, user_username, user_email, user_documento, user_tipo
        FROM t_usuario
    `;
    const result = await db.query(sql);
    return result.rows;
};

const getById = async (user_id) => {
    const sql = `
        SELECT user_id, user_username, user_email, user_documento, user_tipo
        FROM t_usuario
        WHERE user_id = $1
    `;
    const result = await db.query(sql, [user_id]);
    return result.rows.length ? result.rows[0] : null;
};

const updateUser = async (user_id, fields) => {
    const setClauses = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
            setClauses.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }
    }

    if (setClauses.length === 0) return false;

    console.log(setClauses)
    console.log(values)
    values.push(user_id);
    const sql = `
        UPDATE t_usuario
        SET ${setClauses.join(', ')}
        WHERE user_id = $${index}
    `;
    console.log(sql)
    const result = await db.query(sql, values);
    return result.rowCount > 0;
};

const incrementTokenVersion = async (userId) => {
    const sql = `
        UPDATE t_usuario
        SET user_token_version = user_token_version + 1
        WHERE user_id = $1
    `;
    await db.query(sql, [userId]);
};

module.exports = {
    findByDocumneto,
    createUser,
    getAll,
    getById,
    updateUser,
    incrementTokenVersion,
};