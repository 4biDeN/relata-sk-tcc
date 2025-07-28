const userService = require('../services/user_services');

const newUser = async (req, res) => {
    try {
        const response = await userService.newUser(req.body);
        res.status(201).json(response)
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const response = await userService.getAllUsers();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    newUser,
    getAllUsers
};