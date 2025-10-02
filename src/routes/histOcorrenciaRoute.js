const ocorrenciaStatusHistoricoController = require("../controllers/histOcorrenciaController");
const requireAuth = require("../auth/requireAuth");

module.exports = (app) => {
  app.post(
    "/ocorrencias/:ocorrencia_id/status-historico",
    requireAuth,
    ocorrenciaStatusHistoricoController.createOcorrenciaStatusHistorico
  );

  app.get(
    "/ocorrencias/:ocorrencia_id/status-historico",
    requireAuth,
    ocorrenciaStatusHistoricoController.getOcorrenciaStatusHistoricoByOcorrencia
  );

  app.put(
    "/ocorrencias/status-historico/:id",
    requireAuth,
    ocorrenciaStatusHistoricoController.updateOcorrenciaStatusHistorico
  );

  app.delete(
    "/ocorrencias/status-historico/:id",
    requireAuth,
    ocorrenciaStatusHistoricoController.deleteOcorrenciaStatusHistorico
  );
};
