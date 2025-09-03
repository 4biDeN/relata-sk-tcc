const reclamacaoService = require('../services/reclamacaoService');

const createReclamacao = async (req, res) => {
    try {
        const reclamacao = await reclamacaoService.createReclamacao(req.body);
        res.status(201).json(reclamacao);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getReclamacaoById = async (req, res) => {
    try {
        const reclamacao = await reclamacaoService.getReclamacaoById(req.params.id);
        if (!reclamacao) {
            return res.status(404).json({ message: 'Reclamação não encontrada' });
        }
        res.status(200).json(reclamacao);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createReclamacao,
    getReclamacaoById
};