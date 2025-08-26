const User = require('./userRoute')
const Login = require('./login')
const Reclamacao = require('./reclamacaoRoute')


module.exports = (app) => {
    Login(app)
    User(app)
    Reclamacao(app)
};