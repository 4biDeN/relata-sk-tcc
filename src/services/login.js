const db = require('../configs/pg')
const jwt = require('jsonwebtoken')
const cript = require('../utils/salt')

const getUserLogin_sql = 
`
    SELECT 
        user_documento,
        user_salt,
        user_password
    FROM t_usuario
    WHERE user_documento = $1 
`;

const login = async(params) => {
    const {user_documento, passed_password} = params
    result = await db.query(getUserLogin_sql, [user_documento])
    if (!result.rows.length) throw new Error ("Usuário não existe")
    else {
        const salt = result.rows[0].user_salt
        const password = result.rows[0].user_password
        if (cript.verifyPassword(password, salt, passed_password)){
            let accessProfile = result.rows[0].user_documento
            let token = jwt.sign({accessProfile}, process.env.JWT_ACCESS_SECRET, { expiresIn: '3d'})
            return {
                status: "Logado com Sucesso!",
                user: result.rows[0].user_documento,
                token: token
            }
        } else {
            throw {status: 400, type:'WARN', message: 'Senha Inválida!', detail: ''}
        }
    }
};

module.exports = {
    login
};