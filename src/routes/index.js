const User = require('./userRoute')
const Login = require('./login')


module.exports = (app) => {
    User(app);
    Login(app)
};