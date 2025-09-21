const ocorrenciaStatusHistoricoService = require('../services/histOcorrenciaService');

const createOcorrenciaStatusHistorico = async (req, res) => {
  try {
    const body = {
      ocorrencia_id: Number(req.params.ocorrencia_id ?? req.body.ocorrencia_id),
      ocorrencia_status_id: Number(req.body.ocorrencia_status_id),
      data_alteracao: req.body.data_alteracao ? new Date(req.body.data_alteracao) : null
    };
    if (!Number.isInteger(body.ocorrencia_id) || !Number.isInteger(body.ocorrencia_status_id)) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }
    const created = await ocorrenciaStatusHistoricoService.createOcorrenciaStatusHistorico(body);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOcorrenciaStatusHistoricoByOcorrencia = async (req, res) => {
  try {
    const ocorrencia_id = Number(req.params.ocorrencia_id);
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    if (!Number.isInteger(ocorrencia_id)) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }
    const rows = await ocorrenciaStatusHistoricoService.getOcorrenciaStatusHistoricoByOcorrencia(
      ocorrencia_id,
      limit,
      offset
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateOcorrenciaStatusHistorico = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = {};
    if (req.body.ocorrencia_status_id !== undefined) data.ocorrencia_status_id = Number(req.body.ocorrencia_status_id);
    if (req.body.data_alteracao !== undefined) data.data_alteracao = new Date(req.body.data_alteracao);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }
    const updated = await ocorrenciaStatusHistoricoService.updateOcorrenciaStatusHistorico(id, data);
    if (!updated) {
      return res.status(400).json({ message: 'Nada para atualizar' });
    }
    return res.json(updated);
  } catch (err) {
    if (err.message === 'Registro não encontrado') {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ message: err.message });
  }
};

const deleteOcorrenciaStatusHistorico = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }
    await ocorrenciaStatusHistoricoService.deleteOcorrenciaStatusHistorico(id);
    return res.status(204).send();
  } catch (err) {
    if (err.message === 'Registro não encontrado') {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOcorrenciaStatusHistorico,
  getOcorrenciaStatusHistoricoByOcorrencia,
  updateOcorrenciaStatusHistorico,
  deleteOcorrenciaStatusHistorico
};
