const reclamacaoController = require('../controllers/reclamacaoController');
const requireAuth = require('../auth/requireAuth');

module.exports = (app) => {
    app.post('/reclamacoes', requireAuth, reclamacaoController.createReclamacao
    /*
        #swagger.tags = ['Reclamações']
        #swagger.summary = 'Criar uma nova reclamação'
        #swagger.description = 'Endpoint para registrar uma reclamação vinculada a um local e a um usuário.'

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados da reclamação',
            required: true,
            schema: {
                reclamacao_user_id: 1,
                reclamacao_titulo: "Buraco na rua",
                reclamacao_descricao: "Existe um buraco grande na Rua das Flores",
                reclamacao_prioridade: 2,
                local: {
                    local_cidade: "Saudades",
                    local_estado: "SC",
                    local_bairro: "Centro",
                    local_rua: "Rua das Flores",
                    local_complemento: "Próximo ao mercado",
                    local_latitude: -27.1362,
                    local_longitude: -53.0022
                }
            }
        }

        #swagger.responses[201] = {
            description: 'Reclamação criada com sucesso',
            schema: {
                reclamacao_id: 10,
                reclamacao_protocolo: "2025-000010",
                reclamacao_titulo: "Buraco na rua",
                reclamacao_descricao: "Existe um buraco grande na Rua das Flores"
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

    app.get('/reclamacoes/:id', requireAuth, reclamacaoController.getReclamacaoById
    /*
        #swagger.tags = ['Reclamações']
        #swagger.summary = 'Buscar uma reclamação'
        #swagger.description = 'Retorna os detalhes de uma reclamação pelo seu ID.'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da reclamação',
            required: true
        }

        #swagger.responses[200] = {
            description: 'Dados da reclamação',
            schema: {
                reclamacao_id: 10,
                reclamacao_titulo: "Buraco na rua",
                reclamacao_descricao: "Existe um buraco grande na Rua das Flores",
                reclamacao_data: "2025-09-02T15:25:00.000Z",
                reclamacao_status_nome: "Aberta",
                user_username: "joao.silva"
            }
        }

        #swagger.responses[404] = {
            description: 'Reclamação não encontrada'
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { mensagem: 'Token de autenticação inválido ou ausente' }
        }
    */);
    app.get('/reclamacoes/user/:user_id', requireAuth, reclamacaoController.getReclamacaoByUser
    /*
        #swagger.tags = ['Reclamações']
        #swagger.summary = 'Buscar reclamações por usuário'
        #swagger.description = 'Retorna todas as reclamações feitas por um usuário específico.'
        #swagger.parameters['user_id'] = {
            in: 'path',
            description: 'ID do usuário',
            required: true
        }
        #swagger.responses[200] = {
            description: 'Lista de reclamações do usuário',
            schema: [
                {
                    reclamacao_id: 10,
                    reclamacao_titulo: "Buraco na rua",
                    reclamacao_data: "2025-09-02T15:25:00.000Z",
                    reclamacao_status: 1
                }
            ]
        }
    */);
    app.delete('/reclamacoes/:id', requireAuth, reclamacaoController.deleteReclamacao
    /*
        #swagger.tags = ['Reclamações']
        #swagger.summary = 'Deletar uma reclamação'
        #swagger.description = 'Marca uma reclamação como excluída pelo seu ID.'
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da reclamação',
            required: true
        }
        #swagger.responses[204] = {
            description: 'Reclamação deletada com sucesso'
        }
        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { mensagem: 'Token de autenticação inválido ou ausente' }
        }
    */);
};