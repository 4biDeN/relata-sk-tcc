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

const getReclamacaoByUser = async (req, res) => {
    try {
        const reclamacoes = await reclamacaoService.getReclamacaoByUser(req.params.user_id);
        if (!reclamacoes || reclamacoes.length === 0) {
            return res.status(404).json({ message: 'Nenhuma reclamação encontrada para este usuário' });
        }
        res.status(200).json(reclamacoes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createReclamacao,
    getReclamacaoById,
    getReclamacaoByUser
};