const ocorrenciaImagemController = require("../controllers/ocorrenciaImagemController");
const { upload } = require("../storage");
const requireAuth = require("../auth/requireAuth");

module.exports = (app) => {
  app.get(
    "/ocorrencias/:id/imagens",
    requireAuth,
    ocorrenciaImagemController.listar
  );

  app.post(
    "/ocorrencias/:id/imagens",
    requireAuth,
    upload.array("files"),
    ocorrenciaImagemController.adicionar
  );

  app.delete(
    "/ocorrencias/:id/imagens/:imagemId",
    requireAuth,
    ocorrenciaImagemController.remover
  );
};
