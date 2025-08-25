const loginService = require('../services/login')
const { cookieOptions } = require('../auth/jwt')

const login = async (req, res) => {
    const { user_doc, user_password } = req.body;
    if (!user_doc || !user_password) {
        return res.status(400).json({ type: 'ERRO', message: 'Informe usuário e senha!' });
    }

    try {
        const ret = await loginService.login({ user_doc, passed_password: user_password });
        res.cookie('access_token', ret.token, cookieOptions());
        res.status(201).json({ status: ret.status, usuario: ret.user });
    } catch (err) {
        res.status(err.status ? err.status : 500).json({ type: err.type, message: err.message, detail: err.detail });
    }
};

module.exports = { 
    login 
};