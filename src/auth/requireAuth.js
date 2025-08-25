const { verifyAccess } = require('./utils');

module.exports = function requireAuth(req, res, next) {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ message: 'Não Autenticado' });

    try {
        const decoded = verifyAccess(token)
        req.user = decoded;
        return next();
    } catch {
        return res.status(401).json({ message: 'Token inválido ou Expirado' });
    }
}