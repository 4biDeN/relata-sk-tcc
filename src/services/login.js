const db = require("../configs/pg");
const cript = require("../auth/salt");
const { signAccess } = require("../auth/jwt");

const getUserLogin_sql = `
  select
    u.user_id,
    u.user_documento,
    u.user_salt,
    u.user_password,
    u.user_tipo,
    u.user_token_version,
    u.user_is_active
  from t_usuario u
  where u.user_documento = $1
`;

const login = async (params) => {
  const { user_documento, passed_password } = params;
  const result = await db.query(getUserLogin_sql, [user_documento]);
  if (!result.rows.length)
    throw {
      status: 404,
      type: "WARN",
      message: "Usuário Não Encontrado",
      detail: "",
    };

  const row = result.rows[0];

  if (row.user_is_active === false) {
    throw { status: 403, type: "WARN", message: "Usuário inativo", detail: "" };
  }

  const okNew = cript.verifyPassword(
    row.user_password,
    row.user_salt,
    passed_password,
    cript.ITER
  );
  let valid = okNew;
  if (!okNew) {
    const okOld = cript.verifyPassword(
      row.user_password,
      row.user_salt,
      passed_password,
      cript.OLD_ITER
    );
    if (!okOld)
      throw {
        status: 400,
        type: "WARN",
        message: "Senha Inválida!",
        detail: "",
      };
    const { salt, hashedPassword } = cript.createPassword(passed_password);
    await db.query(
      "update t_usuario set user_password = $1, user_salt = $2 where user_id = $3",
      [hashedPassword, salt, row.user_id]
    );
    valid = true;
  }

  const payload = {
    sub: row.user_id,
    doc: row.user_documento,
    role: row.user_tipo,
    ver: row.user_token_version,
  };
  const token = signAccess(payload);

  return {
    status: "Logado com Sucesso!",
    user: {
      id: row.user_id,
      documento: row.user_documento,
      tipo: row.user_tipo,
      token_version: row.user_token_version,
    },
    token,
  };
};

module.exports = { login };
