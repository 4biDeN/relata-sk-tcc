const User = require('./userRoute');
const Login = require('./login');
const Ocorrencias = require('./ocorrenciaRoute');
const Locais = require('./localRoute');
const Historicos = require ('./histOcorrenciaRoute');

module.exports = (app) => {
    Login(app)
    User(app)
    Ocorrencias(app)
    Locais(app)
    Historicos(app)
};