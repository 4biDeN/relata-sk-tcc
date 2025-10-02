const { verifyAccess } = require("./jwt");

module.exports = function requireAuth(req, res, next) {
  const auth = req.headers?.authorization || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : null;
  const cookieTok = req.cookies?.access_token || null;
  const token = bearer || cookieTok;

  if (!token) return res.status(401).json({ message: "Não Autenticado" });

  try {
    const decoded = verifyAccess(token);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou Expirado" });
  }
};
