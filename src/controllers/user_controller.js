const userService = require('../services/user_services');

const newUser = async (req, res, next) => {
    try {
        const response = await userService.newUser(req.body);
        res.status(201).json(response)
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const response = await userService.getAllUsers();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const response = await userService.getUserById(userId);
        if (!response) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const updateUser = async (req, res) => {
    try {
        const user_id = parseInt(req.params.id);
        const data = req.body;

        const updated = await userService.updateUser(user_id, data);

        if (!updated) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado ou dados não informados.' });
        }

        res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: 'Erro ao atualizar usuário.' });
    }
};


module.exports = {
    newUser,
    getAllUsers,
    getUserById,
    updateUser
};