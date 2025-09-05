const User = require('./userRoute')
const Login = require('./login')
const Ocorrencias = require('./ocorrenciaRoute')


module.exports = (app) => {
    Login(app)
    User(app)
    Ocorrencias(app)
};