const userController = require('../controllers/userController');
const requireAuth = require('../auth/requireAuth');

module.exports = (app) => {
    app.post('/user', userController.createUser
    /*
        #swagger.tags = ["Usuários"]
        #swagger.summary = "Cria um novo usuário"
        #swagger.description = 'Cria um novo usuário com os dados fornecidos.'

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados do novo usuário',
            required: true,
            schema: {
                user_username: "usuario",
                user_email: "usuario@email.com",
                user_documento: "12345678900",
                user_password: "senha123"
            }
        }

        #swagger.responses[201] = {
            description: 'Usuário criado com sucesso',
            schema: {
                mensagem: 'Usuário criado'
            }
        }

        #swagger.responses[400] = {
            description: 'Dados inválidos',
            schema: {
                mensagem: 'Erro de validação nos dados fornecidos'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                mensagem: 'Erro ao criar usuário'
            }
        }
    */);

    app.get('/getUser', requireAuth, userController.getAllUsers
    /*
        #swagger.tags = ["Usuários"]
        #swagger.summary = "Obtém todos os usuários"
        #swagger.description = 'Retorna uma lista de todos os usuários cadastrados.'

        #swagger.responses[200] = {
            description: 'Lista de usuários',
            schema: [
                {
                    id: 1,
                    user_username: "usuario1",
                    user_email: "usuario1@email.com",
                    user_documento: "12345678900",
                    user_tipo: 1
                },
                {
                    id: 2,
                    user_username: "usuario2",
                    user_email: "usuario2@email.com",
                    user_documento: "98765432100",
                    user_tipo: 1
                }
            ]
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: {
                mensagem: 'Token inválido ou ausente'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                mensagem: 'Erro ao buscar usuários'
            }
        }
    */);

    app.get('/getUser/:id', requireAuth, userController.getUser
    /*
        #swagger.tags = ["Usuários"]
        #swagger.summary = "Obtém um usuário pelo ID"
        #swagger.description = 'Retorna os dados de um usuário específico com base no ID fornecido.'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do usuário a ser buscado',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.responses[200] = {
            description: 'Dados do usuário',
            schema: {
                id: 1,
                user_username: "usuario1",
                user_email: "usuario1@email.com",
                user_documento: "12345678900",
                user_tipo: 1
            }
        }

        #swagger.responses[404] = {
            description: 'Usuário não encontrado',
            schema: {
                mensagem: 'Usuário não encontrado'
            }
        }

        #swagger.responses[403] = {
            description: 'Acesso negado',
            schema: {
                mensagem: 'Permissão insuficiente'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                mensagem: 'Erro ao buscar usuário'
            }
        }
    */);

    app.put('/user/:id', requireAuth, userController.updateUser
    /*
        #swagger.tags = ["Usuários"]
        #swagger.summary = "Atualiza os dados de um usuário"
        #swagger.description = 'Atualiza um usuário existente com base no ID fornecido.'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID do usuário a ser atualizado',
            required: true,
            type: 'integer',
            example: 1
        }

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados do usuário a serem atualizados',
            required: true,
            schema: {
                user_username: "novousuario",
                user_email: "usuario@email.com",
                user_documento: "12345678900",
                user_tipo: 1,
                user_password: "senha123"
            }
        }

        #swagger.responses[200] = {
            description: 'Usuário atualizado com sucesso',
            schema: {
                mensagem: 'Usuário atualizado'
            }
        }

        #swagger.responses[400] = {
            description: 'Dados inválidos',
            schema: {
                mensagem: 'Erro de validação nos dados fornecidos'
            }
        }

        #swagger.responses[404] = {
            description: 'Usuário não encontrado',
            schema: {
                mensagem: 'ID não localizado'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                mensagem: 'Erro ao atualizar usuário'
            }
        }
    */);

    app.delete('./user/:id', requireAuth, userController.deleteUser
    /*
    #swagger.tags = ["Usuários"]
    #swagger.summary = "Deleta um usuário pelo ID"
    #swagger.description = 'Delelta (marca como excluído) os dados de um usuário específico com base no ID fornecido.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID do usuário a ser Deletado',
        required: true,
        type: 'integer',
        example: 1
    }

    #swagger.responses[204] = {
        description: 'Dados do usuário',
        schema: {
            id: 1,
            user_username: "usuario1",
            user_email: "usuario1@email.com",
            user_documento: "12345678900",
            user_tipo: 1
        }
    }

    #swagger.responses[404] = {
        description: 'Usuário não encontrado',
        schema: {
            mensagem: 'Usuário não encontrado'
        }
    }

    #swagger.responses[403] = {
        description: 'Acesso negado',
        schema: {
            mensagem: 'Permissão insuficiente'
        }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: {
            mensagem: 'Erro ao buscar usuário'
        }
    }
*/);
};