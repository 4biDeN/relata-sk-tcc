const ocorrenciaRepo = require('../repo/ocorrenciaRepo');
const localRepo = require('../repo/localRepo');

const createOcorrencia = async (data) => {

    let local = await localRepo.getLocal(data.local);

    if (!local) {
        local = await localRepo.createLocal(data.local);
    }
    
    const ocorrencia = await ocorrenciaRepo.createOcorrencia({
        ocorrencia_user_id: data.ocorrencia_user_id,
        ocorrencia_titulo: data.ocorrencia_titulo,
        ocorrencia_descricao: data.ocorrencia_descricao,
        ocorrencia_prioridade: data.ocorrencia_prioridade,
        ocorrencia_local_id: local.local_id
    });
    return ocorrencia;
};

const getOcorrenciaById = async (id) => {
     return await ocorrenciaRepo.getOcorrenciaById(id); 
};

const getOcorrenciaByUser = async (user_id) => {
    return await ocorrenciaRepo.getOcorrenciaByUser(user_id); 
}

const deleteOcorrencia = async (ocorrencia_id) => {
    await ocorrenciaRepo.deleteOcorrencia(ocorrencia_id);
}

module.exports = {
    createOcorrencia,
    getOcorrenciaById,
    getOcorrenciaByUser,
    deleteOcorrencia
};