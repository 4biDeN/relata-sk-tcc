const User = require('./user_route')
const Login = require('./login')


module.exports = (app) => {
    User(app);
    Login(app)
};