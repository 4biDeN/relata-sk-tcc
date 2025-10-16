const User = require('./userRoute');
const Login = require('./login');
const Ocorrencias = require('./ocorrenciaRoute');
const Locais = require('./localRoute');
const Historicos = require('./histOcorrenciaRoute');
const Municipios = require('./municipiosRoute');
const Imagens = require('./ocorrenciaImagemRoute')

module.exports = (app) => {
    Login(app)
    User(app)
    Ocorrencias(app)
    Locais(app)
    Historicos(app)
    Municipios(app)
    Imagens(app)
};
