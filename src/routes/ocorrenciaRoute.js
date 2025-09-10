const ocorrenciaController = require('../controllers/ocorrenciaController');
const requireAuth = require('../auth/requireAuth');

module.exports = (app) => {
    app.post('/ocorrencias', requireAuth, ocorrenciaController.createOcorrencia
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Criar uma nova ocorrência'
        #swagger.description = 'Endpoint para registrar uma ocorrência vinculada a um local e a um usuário.'

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados da ocorrência',
            required: true,
            schema: {
                "ocorrencia_user_id": 1,
                "ocorrencia_titulo": "Buraco na rua",
                "ocorrencia_descricao": "Existe um buraco grande na Rua das Flores",
                "ocorrencia_prioridade": 2,
                    "local": {
                    "local_municipio_id": 4569,
                    "local_estado": "SC",
                    "local_bairro": "Centro",
                    "local_rua": "Rua das Flores",
                    "local_complemento": "Próximo ao mercado",
                    "local_latitude": -27.1362,
                    "local_longitude": -53.0022
                    }
                }
            }
        }

        #swagger.responses[201] = {
            description: 'Ocorrência criada com sucesso',
            schema: {
                ocorrencia_id: 10,
                ocorrencia_protocolo: "2025-000010",
                ocorrencia_titulo: "Buraco na rua",
                ocorrencia_descricao: "Existe um buraco grande na Rua das Flores"
            }
        }

        #swagger.responses[400] = {
            description: 'Erro de validação ou dados inválidos'
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { mensagem: 'Token de autenticação inválido ou ausente' }
        }
    */);

    app.get('/ocorrencias/:id', requireAuth, ocorrenciaController.getOcorrenciaById
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Buscar uma ocorrência'
        #swagger.description = 'Retorna os detalhes de uma ocorrência pelo seu ID.'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da ocorrência',
            required: true
        }

        #swagger.responses[200] = {
            description: 'Dados da ocorrência',
            schema: {
                ocorrencia_id: 10,
                ocorrencia_titulo: "Buraco na rua",
                ocorrencia_descricao: "Existe um buraco grande na Rua das Flores",
                ocorrencia_data: "2025-09-02T15:25:00.000Z",
                ocorrencia_status_nome: "Aberta",
                user_username: "joao.silva"
            }
        }

        #swagger.responses[404] = {
            description: 'Ocorrência não encontrada'
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { mensagem: 'Token de autenticação inválido ou ausente' }
        }
    */);

    app.get('/ocorrencias/user/:user_id', requireAuth, ocorrenciaController.getOcorrenciaByUser
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Buscar ocorrências por usuário'
        #swagger.description = 'Retorna todas as ocorrências feitas por um usuário específico.'
        #swagger.parameters['user_id'] = {
            in: 'path',
            description: 'ID do usuário',
            required: true
        }
        #swagger.responses[200] = {
            description: 'Lista de ocorrências do usuário',
            schema: [
                {
                    ocorrencia_id: 10,
                    ocorrencia_titulo: "Buraco na rua",
                    ocorrencia_data: "2025-09-02T15:25:00.000Z",
                    ocorrencia_status: 1
                }
            ]
        }
    */);

    app.delete('/ocorrencias/:id', requireAuth, ocorrenciaController.deleteOcorrencia
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Deletar uma ocorrência'
        #swagger.description = 'Marca uma ocorrência como excluída pelo seu ID.'
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da ocorrência',
            required: true
        }
        #swagger.responses[204] = {
            description: 'Ocorrência deletada com sucesso'
        }
        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { mensagem: 'Token de autenticação inválido ou ausente' }
        }
    */);
};
