let mod;
const driver = process.env.STORAGE_DRIVER || "local";
try {
  mod = require(`./${driver}`);
} catch {
  mod = require("./local");
}
module.exports = mod;
