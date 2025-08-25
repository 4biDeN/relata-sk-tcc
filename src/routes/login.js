const loginController = require('../controllers/login')

module.exports = (app) => {
    app.post('/login', loginController.login
    /*
        #swagger.tags = ["Login"]
        #swagger.summary = "Realiza o login do usuário"
        #swagger.description = 'Realiza o login do usuário com as credenciais fornecidas. Se as credenciais estiverem corretas, retorna status de sucesso e define um cookie httpOnly chamado access_token para autenticação nas próximas requisições.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados do novo usuário',
            required: true,
            schema: {
                user_documento: "12345678900",
                user_password: "senha123"
            }
        }
        #swagger.responses[201] = {
            description: "Login realizado com sucesso",
            headers: {
                "Set-Cookie": {
                    description: "Cookie httpOnly com o token de acesso",
                    schema: { type: "string" }
                }
            },
            schema: {
                status: "Logado com Sucesso!",
                usuario: "12345678900"
            }
        }
        #swagger.responses[400] = {
            description: "Usuário ou senha não informados",
            schema: { type: "object", properties: { type: { type: "string" }, message: { type: "string" } } }
        }
        #swagger.responses[401] = {
            description: "Credenciais inválidas",
            schema: { type: "object", properties: { type: { type: "string" }, message: { type: "string" } } }
        }
        #swagger.responses[500] = {
            description: "Erro interno do servidor",
            schema: { message: "Erro interno" }
        }
    */);
}