const crypto = require("crypto");

const ITER = parseInt(process.env.PBKDF2_ITER || "310000", 10);
const OLD_ITER = 1000;

function createPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = hashPassword(password, salt, ITER);
  return { salt, hashedPassword };
}

function hashPassword(password, salt, iterations = ITER) {
  return crypto
    .pbkdf2Sync(password, salt, iterations, 64, "sha512")
    .toString("hex");
}

function verifyPassword(
  storePassword,
  salt,
  providedPassword,
  iterations = ITER
) {
  const hashedProvidedPassword = hashPassword(
    providedPassword,
    salt,
    iterations
  );
  return storePassword === hashedProvidedPassword;
}

module.exports = {
  ITER,
  OLD_ITER,
  createPassword,
  hashPassword,
  verifyPassword,
};
