const userController = require('../controllers/user_controller');

module.exports = (app) => {
    app.post('/user', userController.newUser);
    app.get('/user', userController.getAllUsers);
}