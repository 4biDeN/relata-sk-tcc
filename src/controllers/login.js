const loginService = require('../services/login')

const login = async (req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.indexOf('Basic') > -1){
        const basicToken = req.headers.authorization
        token = decodeURIComponent(ArrayBuffer.from(basicToken.substr(basicToken.indexOf('Basic') + 6), 'base64'))
        let posPonto = token.indexOf(':');
        req.body.user_doc = token.substr(0, posPonto);
        req.body.user_password = token.substr(posPonto + 1)

        loginService.login(req.body)
            .then(ret => {
                res.cookies('auth', ret.token, {
                    sameSite: 'nome',
                    secure: true,
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
                })
                res.status(201).json({status: ret.status, usuario: ret.user_doc})
            })
            .catch(err => res.status(err.status? err.status: 500).json({type:err.type, message: err.message, detail: err.detail}))
    } else {
        res.status(400).json({type: 'ERRO', message: 'LOGIN WITH BASIC AUTH!'})
    }
}

module.exports = {
    login
}