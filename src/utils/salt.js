const crypto = require('crypto');

function createPassword (password) {
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);
    return { salt, hashedPassword };
}

function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function verifyPassword(storePassword, salt, providedPassword) {
    const hashedProvidedPassword = hashPassword(providedPassword, salt);
    return storePassword === hashedProvidedPassword;
}

module.exports = {
    createPassword,
    verifyPassword
};