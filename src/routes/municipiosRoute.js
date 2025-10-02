const requireAuth = require("../auth/requireAuth");
const MunicipiosController = require("../controllers/municipiosController");

module.exports = (app) => {
  app.get(
    "/municipios/id-por-nome",
    requireAuth,
    MunicipiosController.sugerirMunicipios
  );
  app.get(
    "/municipios/sugestoes",
    requireAuth,
    MunicipiosController.sugerirMunicipios
  );
};
