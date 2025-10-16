// src/services/ocorrenciaImagem.service.js
const path = require("path");
const fs = require("fs/promises");
const db = require("../configs/pg");
const { toPublicUrl } = require("../storage");

// limites (mantenha alinhado ao seu multer: local.js => 5MB e 6 arquivos)
const MAX_FILES_PER_REQUEST = Number(process.env.MAX_FILES_PER_REQUEST || 6);
const MAX_FILES_PER_OCORRENCIA = Number(
  process.env.MAX_FILES_PER_OCORRENCIA || 50
);

// suporte a remoção do arquivo quando DRIVER=local
const DRIVER = process.env.STORAGE_DRIVER || "local";
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");
const PUBLIC_UPLOAD_URL = (
  process.env.PUBLIC_UPLOAD_URL || "http://localhost:3000/uploads"
).replace(/\/+$/, "");

// ---- helpers internos ----
const _countByOcorrencia = async (client, ocorrencia_id) => {
  const { rows } = await client.query(
    `select count(*)::int as c from t_ocorrencia_imagem where ocorrencia_id = $1`,
    [ocorrencia_id]
  );
  return rows[0]?.c || 0;
};

const _insert = async (client, ocorrencia_id, url) => {
  const { rows } = await client.query(
    `insert into t_ocorrencia_imagem (ocorrencia_id, ocorrencia_imagem_url)
     values ($1, $2)
     returning ocorrencia_imagem_id, ocorrencia_imagem_url`,
    [ocorrencia_id, url]
  );
  return rows[0];
};

const _getOne = async (client, ocorrencia_id, imagem_id) => {
  const { rows } = await client.query(
    `select ocorrencia_imagem_id, ocorrencia_imagem_url
       from t_ocorrencia_imagem
      where ocorrencia_id = $1 and ocorrencia_imagem_id = $2`,
    [ocorrencia_id, imagem_id]
  );
  return rows[0] || null;
};

const _unlinkLocalByPublicUrl = async (publicUrl) => {
  if (DRIVER !== "local" || !publicUrl) return;
  try {
    // mapeia URL pública -> caminho físico
    const name = publicUrl.replace(PUBLIC_UPLOAD_URL, "").replace(/^\/+/, "");
    if (!name) return;
    const full = path.join(UPLOAD_DIR, name);
    await fs.unlink(full);
  } catch {
    // idempotente: se não existir, ignorar
  }
};

// ---- API pública do service ----

/**
 * Lista imagens da ocorrência.
 * @param {number} ocorrencia_id
 * @returns {Promise<Array<{ocorrencia_imagem_id:number, ocorrencia_imagem_url:string}>>}
 */
const listOcorrenciaImagens = async (ocorrencia_id) => {
  const sql = `
    select ocorrencia_imagem_id, ocorrencia_imagem_url
    from t_ocorrencia_imagem
    where ocorrencia_id = $1
    order by ocorrencia_imagem_id
  `;
  const { rows } = await db.query(sql, [ocorrencia_id]);
  return rows;
};

/**
 * Adiciona N imagens (arquivos do multer: req.files) à ocorrência.
 * Respeita limites e retorna registros inseridos.
 * @param {number} ocorrencia_id
 * @param {Array<multer.File>} files
 */
const addOcorrenciaImagens = async (ocorrencia_id, files = []) => {
  if (!Array.isArray(files) || files.length === 0) return [];

  if (files.length > MAX_FILES_PER_REQUEST) {
    const err = new Error(
      `LIMIT_FILES_PER_REQUEST: máximo ${MAX_FILES_PER_REQUEST} arquivos por envio`
    );
    err.status = 413;
    throw err;
  }

  // validação defensiva (multer já filtra image/*)
  for (const f of files) {
    if (!f?.mimetype?.startsWith("image/")) {
      const e = new Error("UNSUPPORTED_MEDIA_TYPE");
      e.status = 415;
      throw e;
    }
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const totalAtual = await _countByOcorrencia(client, ocorrencia_id);
    if (totalAtual + files.length > MAX_FILES_PER_OCORRENCIA) {
      const err = new Error(
        `LIMIT_FILES_PER_OCORRENCIA: máximo ${MAX_FILES_PER_OCORRENCIA} imagens por ocorrência`
      );
      err.status = 413;
      throw err;
    }

    // gera URLs públicas com seu helper
    const urls = files.map((f) => toPublicUrl(f));

    const inserted = [];
    for (const url of urls) {
      const row = await _insert(client, ocorrencia_id, url);
      inserted.push(row);
    }

    await client.query("COMMIT");
    return inserted;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Remove uma imagem específica da ocorrência (registro + arquivo local se aplicável).
 * @param {number} ocorrencia_id
 * @param {number} imagem_id
 */
const deleteOcorrenciaImagem = async (ocorrencia_id, imagem_id) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const row = await _getOne(client, ocorrencia_id, imagem_id);
    if (!row) {
      await client.query("ROLLBACK");
      const err = new Error("NOT_FOUND");
      err.status = 404;
      throw err;
    }

    // tenta remover arquivo local (quando DRIVER=local)
    await _unlinkLocalByPublicUrl(row.ocorrencia_imagem_url);

    await client.query(
      `delete from t_ocorrencia_imagem
        where ocorrencia_id = $1 and ocorrencia_imagem_id = $2`,
      [ocorrencia_id, imagem_id]
    );

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  listOcorrenciaImagens,
  addOcorrenciaImagens,
  deleteOcorrenciaImagem,
};
