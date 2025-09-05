const crypt = require('../auth/salt');
const userRepo = require('../repo/userRepo');

const newUser = async (params) => {
    const { user_username, user_email, user_documento, user_password } = params;
    const { salt, hashedPassword } = crypt.createPassword(user_password);

    return await userRepo.createUser({
        user_username,
        user_email,
        user_documento,
        user_password: hashedPassword,
        user_salt: salt
    });
};

const getAllUsers = async () => {
    const users = await userRepo.getAll();
    return { total: users.length, users }
};

const getUserById = async (id) => {
    return await userRepo.getById(id);
};

const updateUser = async (id, data) => {
    return await userRepo.updateUser(id, data);
};

const deleteUser = async (id) => {
    return userRepo.deleteUser(id);
}

module.exports = {
    newUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};