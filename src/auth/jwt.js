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

const cookieOptions = (isProd = process.env.NODE_ENV === "production") => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "lax" : "lax",
});

module.exports = {
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
  cookieOptions,
};
