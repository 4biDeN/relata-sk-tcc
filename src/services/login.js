const db = require('../configs/pg')
const jwt = require('jsonwebtoken')
const cript = require('../utils/salt')
const fs = require('fs')

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
    const {user_doc, passed_password} = params
    result = await db.query(getUserLogin_sql, user_doc)
    if (!result.rows.length) throw new Error ("Usuário não existe")
    else {
        const salt = result.rows[0].salt
        const password = result.rows[0].user_password
        if (cript.comparePassword(password, salt, passed_password)){
            let accessProfile = result.rows[0].user_documento
            const privateKey = fs.readFileSync("./src/private/private_key.pem");
            let token = jwt.sign({accessProfile}, privateKey, {algorithm: 'RS256', expiresIn: '3d'})
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