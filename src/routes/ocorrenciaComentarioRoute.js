const ocorrenciaComentarioController = require("../controllers/ocorrenciaComentarioController");
const requireAuth = require("../auth/requireAuth");

module.exports = (app) => {
    app.post(
        "/ocorrencias/:ocorrencia_id/comentarios",
        requireAuth,
        ocorrenciaComentarioController.createOcorrenciaComentario
    );

    app.get(
        "/ocorrencias/:ocorrencia_id/comentarios",
        requireAuth,
        ocorrenciaComentarioController.getComentariosByOcorrencia
    );

    app.get(
        "/ocorrencias/comentarios/:id",
        requireAuth,
        ocorrenciaComentarioController.getComentarioById
    );

    app.put(
        "/ocorrencias/comentarios/:id",
        requireAuth,
        ocorrenciaComentarioController.updateOcorrenciaComentario
    );

    app.patch(
        "/ocorrencias/comentarios/:id/excluir",
        requireAuth,
        ocorrenciaComentarioController.softDeleteOcorrenciaComentario
    );

    app.delete(
        "/ocorrencias/comentarios/:id",
        requireAuth,
        ocorrenciaComentarioController.deleteOcorrenciaComentario
    );
};
