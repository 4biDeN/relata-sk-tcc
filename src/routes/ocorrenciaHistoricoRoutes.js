const ocorrenciaHistoricoController = require("../controllers/ocorrenciaHistoricoController");
const requireAuth = require("../auth/requireAuth");

module.exports = (app) => {
    app.post(
        "/ocorrencias/:ocorrencia_id/historico",
        requireAuth,
        ocorrenciaHistoricoController.createOcorrenciaHistorico
    );

    app.get(
        "/ocorrencias/:ocorrencia_id/historico",
        requireAuth,
        ocorrenciaHistoricoController.getOcorrenciaHistoricoByOcorrencia
    );

    app.put(
        "/ocorrencias/historico/:id",
        requireAuth,
        ocorrenciaHistoricoController.updateOcorrenciaHistorico
    );

    app.delete(
        "/ocorrencias/historico/:id",
        requireAuth,
        ocorrenciaHistoricoController.deleteOcorrenciaHistorico
    );
};
