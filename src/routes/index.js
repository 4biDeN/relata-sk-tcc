const User = require('./userRoute');
const Login = require('./login');
const Ocorrencias = require('./ocorrenciaRoute');
const Locais = require('./localRoute');
const Historicos = require('./ocorrenciaHistoricoRoutes');
const Municipios = require('./municipiosRoute');
const Imagens = require('./ocorrenciaImagemRoute');
const Comentarios = require('./ocorrenciaComentarioRoute');
const Notifications = require('./notificationsRoute');

module.exports = (app) => {
    Login(app)
    User(app)
    Ocorrencias(app)
    Locais(app)
    Historicos(app)
    Municipios(app)
    Imagens(app)
    Comentarios(app)
    Notifications(app)
};
