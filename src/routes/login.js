const loginController = require('../controllers/login')

module.exports = (app) => {
    app.post('/login', loginController.login
    /*
        #swagger.tags = ["Login"]
        #swagger.summary = "Realiza o login do usuário"
        #swagger.description = 'Realiza o login do usuário com as credenciais fornecidas.'
        
    */);
}