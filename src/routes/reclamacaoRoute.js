const reclamacaoController = require('../controllers/reclamacaoController');
const requireAuth = require('../auth/requireAuth');

module.exports = (app) => {
    app.post('/reclamacao', requireAuth, reclamacaoController.createReclamacao
    /*
        #swagger.tags = ["Reclamações"]
        #swagger.summary = "Cria uma nova reclamação"
        #swagger.description = 'Cria uma nova reclamação com os dados fornecidos. Requer autenticação.'

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados da nova reclamação',
            required: true,
            schema: {
                reclamacao_titulo: "Título da Reclamação",
                reclmamacao_descricao: "Descrição detalhada da reclamação",
                reclamacao_status: 1,
                reclamacao_user_id: 1
            }
        }

        #swagger.responses[201] = {
            description: 'Reclamação criada com sucesso',
            schema: {
                reclamacao_id: 1,
                reclamacao_titulo: "Título da Reclamação",
                reclmamacao_descricao: "Descrição detalhada da reclamação",
                reclamacao_status: 1,
                reclamacao_user_id: 1
            }
        }

        #swagger.responses[400] = {
            description: 'Dados inválidos',
            schema: {
                mensagem: 'Erro de validação nos dados fornecidos'
            }
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: {
                mensagem: 'Token de autenticação inválido ou ausente'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                mensagem: 'Erro ao criar reclamação'
            }
        }
    */);

    app.get('/reclamacao/:reclamacao_id', requireAuth, reclamacaoController.getReclamacaoById
    /*
        #swagger.tags = ["Reclamações"]
        #swagger.summary = "Obtém uma reclamação pelo ID"
        #swagger.description = 'Recupera os detalhes de uma reclamação específica usando seu ID. Requer autenticação.'

        #swagger.parameters['reclamacao_id'] = {
            in: 'path',
            description: 'ID da reclamação a ser recuperada',
            required: true,
            type: 'integer'
        }

        #swagger.responses[200] = {
            description: 'Reclamação recuperada com sucesso',
            schema: {
                total: 1,
                reclamacoes: {
                    reclamacao_id: 1,
                    reclamacao_titulo: "Título da Reclamação",
                    reclmamacao_descricao: "Descrição detalhada da reclamação",
                    reclamacao_data: "2023-10-01T12:34:56.789Z",
                    reclamacao_status_nome: "Aberto",
                    user_username: "usuario_exemplo"
                }
            }
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: {
                mensagem: 'Token de autenticação inválido ou ausente'
            }
        }

        #swagger.responses[404] = {
            description: 'Reclamação não encontrada',
            schema: {
                mensagem: 'Reclamação não encontrada'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                mensagem: 'Erro ao recuperar reclamação'
            }
        }
    */);
};