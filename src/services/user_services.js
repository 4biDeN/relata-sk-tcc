const db = require('../configs/pg')
const crypt = require('../utils/salt')

const isert_user_sql  = 
    ` INSERT INTO t_user (user_username, user_email, user_password, user_salt, user_tipo)
        values ($1, $2, $3, $4, $5)
    `

const get_allUsers_sql =
    ` SELECT * FROM t_user
    `

const getAllUsers = async () => {
    result = await db.query(get_allUsers_sql)
    return {
        total: result.rows.length,
        users: result.rows
    }
}

const newUser = async(params) => {
    const { user_username, user_email, user_password, user_tipo } = params
    const {salt, hashedPassword} = crypt.createPassword(user_password)
    result = await db.query(isert_user_sql, [user_username, user_email, hashedPassword, salt, user_tipo])
    return result
};


module.exports = { 
    getAllUsers,
    newUser
};
