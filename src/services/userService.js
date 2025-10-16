const db = require("../configs/pg");
const crypt = require("../auth/salt");

const createUser = async (params) => {
  const { user_username, user_email, user_documento, user_password } = params;
  const { salt, hashedPassword } = crypt.createPassword(user_password);
  const sql = `
    insert into t_usuario (
      user_username,
      user_email,
      user_documento,
      user_password,
      user_salt,
      user_token_version
    )
    values ($1, $2, $3, $4, $5, 0)
    returning user_id, user_username, user_email, user_documento, user_tipo, user_token_version
  `;
  const result = await db.query(sql, [
    user_username,
    user_email,
    user_documento,
    hashedPassword,
    salt,
  ]);
  return result.rows[0];
};

const getAllUsers = async (params = {}) => {
  const {
    field,
    q,
    limit = 20,
    offset = 0,
    sortBy = "user_username",
    sortDir = "asc",
    includeInactive,
  } = params;

  const allowFields = new Set([
    "user_username",
    "user_email",
    "user_documento",
    "user_tipo",
  ]);
  const allowSort = new Set([
    "user_username",
    "user_email",
    "user_documento",
    "user_tipo",
  ]);

  const where = [];
  const vals = [];
  let i = 1;

  // ativos por padrão
  if (!includeInactive) where.push("u.user_is_active = true");

  if (q && field && allowFields.has(field)) {
    if (field === "user_documento") {
      where.push(
        `regexp_replace(u.user_documento, '[^0-9]', '', 'g') ILIKE '%' || regexp_replace($${i++}, '[^0-9]', '', 'g') || '%'`
      );
      vals.push(q);
    } else if (field === "user_tipo") {
      where.push(`u.user_tipo = $${i++}`);
      vals.push(Number(q));
    } else {
      where.push(`u.${field} ILIKE '%' || $${i++} || '%'`);
      vals.push(q);
    }
  } else if (q) {
    where.push(`(
      u.user_username ILIKE '%' || $${i} || '%' OR
      u.user_email ILIKE '%' || $${i} || '%' OR
      regexp_replace(u.user_documento, '[^0-9]', '', 'g') ILIKE '%' || regexp_replace($${i}, '[^0-9]', '', 'g') || '%'
    )`);
    vals.push(q);
    i++;
  }

  const whereSql = where.length ? `where ${where.join(" and ")}` : "";

  const order = allowSort.has(String(sortBy))
    ? `u.${String(sortBy)}`
    : "u.user_username";
  const dir = String(sortDir).toLowerCase() === "desc" ? "desc" : "asc";

  const sql = `
    select
      u.user_id,
      u.user_username,
      u.user_email,
      u.user_documento,
      u.user_tipo,
      u.user_is_active,
      u.user_token_version,
      count(*) over() as _total
    from t_usuario u
    ${whereSql}
    order by ${order} ${dir}
    limit $${i++} offset $${i++}
  `;
  vals.push(Number(limit), Number(offset));

  const result = await db.query(sql, vals);
  const total = result.rows.length ? Number(result.rows[0]._total) : 0;
  const rows = result.rows.map(({ _total, ...r }) => r);
  return { total, rows };
};

const getUserById = async (user_id) => {
  const sql = `
    select u.user_id, u.user_username, u.user_email, u.user_documento, u.user_tipo, u.user_is_active, u.user_token_version
    from t_usuario u
    where u.user_id = $1
  `;
  const result = await db.query(sql, [user_id]);
  return result.rows.length ? result.rows[0] : null;
};

const updateUser = async (user_id, fields) => {
  const allow = new Set([
    "user_username",
    "user_email",
    "user_tipo",
    "user_is_active",
  ]);

  const setClauses = [];
  const values = [];
  let i = 1;

  if (fields.user_password) {
    const { salt, hashedPassword } = crypt.createPassword(fields.user_password);
    setClauses.push(`user_password = $${i++}`);
    values.push(hashedPassword);
    setClauses.push(`user_salt = $${i++}`);
    values.push(salt);
  }

  for (const [key, value] of Object.entries(fields)) {
    if (!allow.has(key)) continue;
    setClauses.push(`${key} = $${i++}`);
    values.push(value);
  }

  if (setClauses.length === 0) return false;

  values.push(user_id);
  const sql = `
    update t_usuario
    set ${setClauses.join(", ")}
    where user_id = $${i}
    returning user_id
  `;
  const result = await db.query(sql, values);
  return result.rowCount > 0;
};

const deleteUser = async (user_id) => {
  const sql = `
    update t_usuario
    set user_is_active = false
    where user_id = $1
  `;
  await db.query(sql, [user_id]);
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
