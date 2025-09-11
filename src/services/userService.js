const db = require('../configs/pg');
const crypt = require('../auth/salt');

// const findByDocumneto = async (documento) => {
//     const sql = `
//         select u.user_id, u.user_documento, u.user_password, u.user_salt, u.user_token_version, t.user_type_name
//         from t_usuario u
//         inner join t_user_type t on u.user_tipo = t.user_type_id
//         where u.user_doumento = $1
// `;
//     const result = await db.query(sql, [documento]);
//     return result.rows.length ? result.rows[0] : null;
// };

const createUser = async (params) => {
    const { user_username, user_email, user_documento, user_password } = params;
    const { salt, hashedPassword } = crypt.createPassword(user_password);

    const sql = `
    insert into t_usuario (
        user_username,
        user_email,
        user_documento,
        user_password,
        user_salt,
        user_token_version
        )
    values ($1, $2, $3, $4, $5, 0)
    returning user_id, user_username, user_email, user_documento
    `;
    
    const result = await db.query(sql, [
        user_username,
        user_email,
        user_documento,
        hashedPassword,
        salt,
    ]);
    return result.rows[0];
};

const getAllUsers = async () => {
    const sql = `
        select u.user_id, u.user_username, u.user_email, u.user_documento, u.user_tipo, u.user_token_version
        from t_usuario u
    `;
    const result = await db.query(sql);
    return result.rows;
};

const getUserById = async (user_id) => {
    const sql = `
        select u.user_id, u.user_username, u.user_email, u.user_documento, u.user_tipo, u.user_token_version
        from t_usuario u
        where u.user_id = $1 and u.user_is_active = true
    `;
    const result = await db.query(sql, [user_id]);
    return result.rows.length ? result.rows[0] : null;
};

const updateUser = async (user_id, fields) => {
    const setClauses = [];
    const values = [];
    let index = 1;

    if (fields.user_password) {
        const { salt, hashedPassword } = crypt.createPassword(fields.user_password);
        setClauses.push(`user_password = $${index++}`);
        values.push(hashedPassword);
        setClauses.push(`user_salt = $${index++}`);
        values.push(salt);
    };

    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && key !== 'user_password') {
            setClauses.push(`${key} = $${index++}`);
            values.push(value);
        }
    }

    if (setClauses.length === 0) return false;
    
    values.push(user_id);
    const sql = `
        update t_usuario
        set ${setClauses.join(', ')}
        where user_id = $${index}
    `;
    console.log(sql)
    const result = await db.query(sql, values);
    return result.rowCount > 0;
};

const deleteUser = async (user_id) => {
    const sql = `
        update t_usuario
            set user_is_active = false
        where user_id = $1
    `;
    await db.query(sql, [user_id]);
};

module.exports = {
    // findByDocumneto,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};