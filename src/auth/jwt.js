const jwt = require("jsonwebtoken");

const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRES || "7d",
  });

const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES || "7d",
  });

const verifyAccess = (t) => jwt.verify(t, process.env.JWT_ACCESS_SECRET);
const verifyRefresh = (t) => jwt.verify(t, process.env.JWT_REFRESH_SECRET);

const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production'
  const crossSite = process.env.CROSS_SITE_COOKIES === 'true' // ligue quando front e API forem origens diferentes

  if (crossSite) {
    return {
      httpOnly: true,
      secure: true,           // obrigatório com SameSite=None
      sameSite: 'none',       // necessário para cross-site
      path: '/',
      // domain: '.seu-dominio.com' // se usar subdomínios em prod
    }
  }

  return {
    httpOnly: true,
    secure: isProd,           // em prod use HTTPS
    sameSite: 'lax',          // ok para same-origin
    path: '/',
  }
}


module.exports = {
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
  cookieOptions,
};
