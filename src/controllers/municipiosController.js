const { suggestMunicipios } = require("../services/municipios");

async function sugerirMunicipios(req, res) {
  const { nome = "", limit } = req.query || {};
  if (!String(nome).trim()) {
    return res.status(400).json({ message: 'Parâmetro "nome" é obrigatório' });
  }
  try {
    const itens = await suggestMunicipios({ nome, limit });
    return res.status(200).json({ itens });
  } catch (error) {
    console.error("[municipiosController] erro ao sugerir municipios", error);
    return res.status(500).json({
      message: "Erro ao consultar municipios",
      detail: error?.message || "falha inesperada",
    });
  }
}

module.exports = {
  sugerirMunicipios,
};
