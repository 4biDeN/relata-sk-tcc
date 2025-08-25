const userService = require('../services/user_services');

const createUser = async (req, res) => {
    try {
        const user = await userService.newUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: "passou aqui" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const updated = await userService.updateUser(req.params.id, req.body);
        if (!updated) return res.status(400).json({ message: "Nada para atualizar" });
        res.json({ message: "Usuário atualizado com sucesso" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
};