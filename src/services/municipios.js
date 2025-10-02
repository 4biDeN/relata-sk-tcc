const db = require("../configs/pg");

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 50;

function coerceLimit(limit) {
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.trunc(n), MAX_LIMIT);
}

function buildLikeTerm(nome) {
  const cleaned = String(nome || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[%_]/g, "");
  if (!cleaned) return "%";
  return `%${cleaned.split(" ").join("%")}%`;
}

async function suggestMunicipios({ nome, limit } = {}) {
  const term = buildLikeTerm(nome);
  const finalLimit = coerceLimit(limit);
  const q = `
    select
      municipio_id as id,
      municipio_nome as nome,
      municipio_uf as uf
    from t_municipio
    where translate(lower(municipio_nome),
           'áàâãäéèêëíìîïóòôõöúùûüç',
           'aaaaaeeeeiiiiooooouuuuc')
      ilike translate(lower($1),
           'áàâãäéèêëíìîïóòôõöúùûüç',
           'aaaaaeeeeiiiiooooouuuuc')
    order by municipio_nome asc
    limit $2
  `;
  const { rows } = await db.query(q, [term, finalLimit]);
  return rows;
}

module.exports = {
  suggestMunicipios,
};
