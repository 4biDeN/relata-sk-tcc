const reclamacaoRepo = require('../repo/reclamacaoRepo');
const localRepo = require('../repo/localRepo');

const createReclamacao = async (data) => {

    let local = await localRepo.getLocal(data.local);

    if (!local) {
        local = await localRepo.createLocal(data.local);
    }
    
    const reclamacao = await reclamacaoRepo.createReclamacao({
        reclamacao_user_id: data.reclamacao_user_id,
        reclamacao_titulo: data.reclamacao_titulo,
        reclamacao_descricao: data.reclamacao_descricao,
        reclamacao_prioridade: data.reclamacao_prioridade,
        reclamacao_local_id: local.local_id
    });
    return reclamacao;
};

const getReclamacaoById = async (id) => {
     return await reclamacaoRepo.getReclamacaoById(id); 
};

const getReclamacaoByUser = async (user_id) => {
    return await reclamacaoRepo.getReclamacaoByUser(user_id); 
}

const deleteReclamacao = async (reclamacao_id) => {
    await reclamacaoRepo.deleteReclamacao(reclamacao_id);
}

module.exports = {
    createReclamacao,
    getReclamacaoById,
    getReclamacaoByUser,
    deleteReclamacao
};