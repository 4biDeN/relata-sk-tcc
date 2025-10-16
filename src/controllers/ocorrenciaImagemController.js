const {
  listOcorrenciaImagens,
  addOcorrenciaImagens,
  deleteOcorrenciaImagem,
} = require("../services/ocorrenciaImagemService.js");

const listar = async (req, res, next) => {
  try {
    const ocorrenciaId = Number(req.params.id);
    if (!Number.isInteger(ocorrenciaId) || ocorrenciaId <= 0) {
      return res.status(400).json({ error: "ocorrencia_id inválido" });
    }
    const imagens = await listOcorrenciaImagens(ocorrenciaId);
    return res.status(200).json({ imagens });
  } catch (err) {
    return next(err);
  }
};

const adicionar = async (req, res, next) => {
  try {
    const ocorrenciaId = Number(req.params.id);
    if (!Number.isInteger(ocorrenciaId) || ocorrenciaId <= 0) {
      return res.status(400).json({ error: "ocorrencia_id inválido" });
    }
    const files = Array.isArray(req.files) ? req.files : [];
    const imagens = await addOcorrenciaImagens(ocorrenciaId, files);
    return res.status(201).json({ imagens });
  } catch (err) {
    if (err && typeof err.status === "number") {
      return res
        .status(err.status)
        .json({ error: err.message, code: err.code });
    }
    if (err && err.name === "MulterError") {
      const code = err.code || "MulterError";
      const status =
        code === "LIMIT_FILE_SIZE"
          ? 413
          : code === "LIMIT_FILE_COUNT"
          ? 413
          : 400;
      return res.status(status).json({ error: err.message, code });
    }
    return next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    const ocorrenciaId = Number(req.params.id);
    const imagemId = Number(req.params.imagemId);
    if (!Number.isInteger(ocorrenciaId) || ocorrenciaId <= 0) {
      return res.status(400).json({ error: "ocorrencia_id inválido" });
    }
    if (!Number.isInteger(imagemId) || imagemId <= 0) {
      return res.status(400).json({ error: "imagem_id inválido" });
    }
    await deleteOcorrenciaImagem(ocorrenciaId, imagemId);
    return res.sendStatus(204);
  } catch (err) {
    if (err && typeof err.status === "number") {
      return res
        .status(err.status)
        .json({ error: err.message, code: err.code });
    }
    return next(err);
  }
};

module.exports = {
  listar,
  adicionar,
  remover,
};
