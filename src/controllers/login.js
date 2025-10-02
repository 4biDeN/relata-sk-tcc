const loginService = require("../services/login");
const { cookieOptions } = require("../auth/jwt");

const login = async (req, res) => {
  const { user_documento, user_password } = req.body;
  if (!user_documento || !user_password) {
    return res
      .status(400)
      .json({
        type: "ERRO",
        message: "Informe usuário e senha!",
        detail: null,
      });
  }

  try {
    const ret = await loginService.login({
      user_documento,
      passed_password: user_password,
    });

    if (!ret || !ret.user) {
      return res
        .status(404)
        .json({
          type: "NOT_FOUND",
          message: "Usuário não encontrado",
          detail: null,
        });
    }

    if (ret.status === "INVALID_PASSWORD") {
      return res
        .status(401)
        .json({
          type: "INVALID_CREDENTIALS",
          message: "Senha inválida",
          detail: null,
        });
    }

    res.cookie("access_token", ret.token, cookieOptions());
    return res.status(201).json({ status: ret.status, user: ret.user });
  } catch (err) {
    const status =
      err?.status ??
      (err?.type === "NOT_FOUND"
        ? 404
        : err?.type === "INVALID_CREDENTIALS"
        ? 401
        : 500);

    return res.status(status).json({
      type: err?.type || "ERRO",
      message: err?.message || "Falha ao autenticar",
      detail: err?.detail || null,
    });
  }
};

module.exports = { login };
