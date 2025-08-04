const db = require('../configs/pg')
const crypt = require('../utils/salt')

const isertUser_sql  = 
    `
    INSERT INTO t_usuario (
        user_username, 
        user_email, 
        user_documento, 
        user_password, 
        user_salt, 
        user_tipo)
    values ($1, $2, $3, $4, $5, $6)
`

const newUser = async(params) => {
    const { user_username, user_email, user_documento, user_password, user_tipo } = params
    const {salt, hashedPassword} = crypt.createPassword(user_password)
    result = await db.query(isertUser_sql, [user_username, user_email, user_documento, hashedPassword, salt, user_tipo])
    return result
};

const getAllUsers_sql =
    `
    SELECT * FROM t_usuario
    `

const getAllUsers = async () => {
    result = await db.query(getAllUsers_sql)
    return {
        total: result.rows.length,
        users: result.rows
    }
};

const getUserById_sql = 
    `
    SELECT 
        user_id,
        user_username,
        user_email,
        user_documento,
        user_tipo 
    FROM t_usuario
        WHERE user_id = $1
`

const getUserById = async (user_id) => {
    const result = await db.query(getUserById_sql, [user_id])
    if (result.rows.length === 0) {
        return null
    }
    return result.rows[0]
}

const updateUser = async (user_id, data) => {
    if (!user_id) {
        throw new Error("O ID do usuário é obrigatório.");
    }

    const { user_password, ...fields } = data;

    const setClauses = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
            setClauses.push(`${(key)} = $${index++}`);
            values.push(value);
        }
    }

    if (user_password) {
        const { salt, hashedPassword } = crypt.createPassword(user_password);
        setClauses.push(`user_password = $${index++}`);
        setClauses.push(`user_salt = $${index++}`);
        values.push(hashedPassword, salt);
    }

    if (setClauses.length === 0) {
        return false;
    }

    values.push(user_id);
    const query = `
        UPDATE t_usuario
        SET ${setClauses.join(', ')}
        WHERE user_id = $${index}
    `;

    const result = await db.query(query, values);
    return result.rowCount > 0;
};

module.exports = { 
    getAllUsers,
    newUser,
    getUserById,
    updateUser
};