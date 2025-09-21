const express = require("express");
const ocorrenciaStatusHistoricoController = require("../controllers/histOcorrenciaController");
const requireAuth = require("../auth/requireAuth");

const router = express.Router();

module.exports = (app) => {
  router.post(
    "/ocorrencias/:ocorrencia_id/status-historico",
    requireAuth,
    ocorrenciaStatusHistoricoController.createOcorrenciaStatusHistorico
  );

  router.get(
    "/ocorrencias/:ocorrencia_id/status-historico",
    requireAuth,
    ocorrenciaStatusHistoricoController.getOcorrenciaStatusHistoricoByOcorrencia
  );

  router.put(
    "/ocorrencias/status-historico/:id",
    requireAuth,
    ocorrenciaStatusHistoricoController.updateOcorrenciaStatusHistorico
  );

  router.delete(
    "/ocorrencias/status-historico/:id",
    requireAuth,
    ocorrenciaStatusHistoricoController.deleteOcorrenciaStatusHistorico
  );
};
