const reclamacaoRepo = require('../repo/reclamacaoRepo');

const createReclamacao = async (data) => {
    return await reclamacaoRepo.createReclamacao(data);
};

const getReclamacaoById = async (reclamacao_id) => {
     return await reclamacaoRepo.getReclamacaoById(reclamacao_id); 
};

module.exports = {
    createReclamacao,
    getReclamacaoById
};