const ocorrenciaService = require('../services/ocorrenciaService');

const createOcorrencia = async (req, res) => {
    try {
        const ocorrencia = await ocorrenciaService.createOcorrencia(req.body);
        res.status(201).json(ocorrencia);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getOcorrenciaById = async (req, res) => {
    try {
        const ocorrencia = await ocorrenciaService.getOcorrenciaById(req.params.id);
        if (!ocorrencia) {
            return res.status(404).json({ message: 'Reclamação não encontrada' });
        }
        res.status(200).json(ocorrencia);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getOcorrenciaByUser = async (req, res) => {
    try {
        const reclamacoes = await ocorrenciaService.getOcorrenciaByUser(req.params.user_id);
        if (!reclamacoes || reclamacoes.length === 0) {
            return res.status(404).json({ message: 'Nenhuma reclamação encontrada para este usuário' });
        }
        res.status(200).json(reclamacoes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteOcorrencia = async (req, res) => {
    try {
        await ocorrenciaService.deleteOcorrencia(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createOcorrencia,
    getOcorrenciaById,
    getOcorrenciaByUser,
    deleteOcorrencia
};