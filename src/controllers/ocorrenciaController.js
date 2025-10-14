const ocorrenciaService = require("../services/ocorrenciaService");

const createOcorrencia = async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || [];
    const erros = [];

    if (typeof body.local === "string") {
      try {
        body.local = JSON.parse(body.local);
      } catch {
        erros.push("Formato inválido para o campo local");
      }
    }

    if (!req.user?.sub && !body.ocorrencia_anonima)
      erros.push("ocorrencia_user_id é obrigatório quando não for anônima");
    if (!body.ocorrencia_titulo) erros.push("ocorrencia_titulo é obrigatório");
    if (!body.ocorrencia_descricao)
      erros.push("ocorrencia_descricao é obrigatório");
    if (
      !body.local ||
      !body.local.local_municipio_id ||
      !body.local.local_estado ||
      !body.local.local_bairro ||
      !body.local.local_rua
    )
      erros.push(
        "local.local_municipio_id, local.local_estado, local.local_bairro e local.local_rua são obrigatórios"
      );
    if (
      body.ocorrencia_prioridade &&
      ![1, 2, 3, 4].includes(Number(body.ocorrencia_prioridade))
    )
      erros.push("ocorrencia_prioridade inválida");

    if (erros.length)
      return res
        .status(422)
        .json({ message: "Validação falhou", errors: erros });

    const payload = {
      ocorrencia_user_id: req.user?.sub || body.ocorrencia_user_id,
      ocorrencia_anonima:
        body.ocorrencia_anonima === "true" || body.ocorrencia_anonima === true,
      ocorrencia_titulo: String(body.ocorrencia_titulo).trim(),
      ocorrencia_descricao: String(body.ocorrencia_descricao).trim(),
      ocorrencia_prioridade: body.ocorrencia_prioridade
        ? Number(body.ocorrencia_prioridade)
        : 2,
      local:
        typeof body.local === "string" ? JSON.parse(body.local) : body.local,
      files,
    };

    const ocorrencia = await ocorrenciaService.createOcorrencia(payload);
    return res.status(201).json(ocorrencia);
  } catch (err) {
    const isConflict = String(err.message || "")
      .toLowerCase()
      .includes("unique");
    if (isConflict)
      return res
        .status(409)
        .json({ message: "Conflito de dados", detail: err.message });
    return res
      .status(500)
      .json({ message: "Erro ao criar ocorrência", detail: err.message });
  }
};

const getOcorrenciaById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).json({ message: "Parâmetro id inválido" });

    const ocorrencia = await ocorrenciaService.getOcorrenciaById(id);
    if (!ocorrencia)
      return res.status(404).json({ message: "Ocorrência não encontrada" });

    return res.status(200).json(ocorrencia);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao buscar ocorrência", detail: err.message });
  }
};

const getOcorrenciaByUser = async (req, res) => {
  try {
    const userId = Number(req.params.user_id);
    if (!Number.isInteger(userId) || userId <= 0)
      return res.status(400).json({ message: "Parâmetro user_id inválido" });

    const ocorrencias = await ocorrenciaService.getOcorrenciaByUser(userId);

    return res.status(200).json(Array.isArray(ocorrencias) ? ocorrencias : []);
    // if (!ocorrencias || ocorrencias.length === 0)
    //   return res.status(404).json({ message: "Nenhuma ocorrência encontrada para este usuário" })
    // return res.status(200).json(ocorrencias)
  } catch (err) {
    return res.status(500).json({
      message: "Erro ao buscar ocorrências do usuário",
      detail: err.message,
    });
  }
};

const deleteOcorrencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).json({ message: "Parâmetro id inválido" });
    const existente = await ocorrenciaService.getOcorrenciaById(id);
    if (!existente)
      return res.status(404).json({ message: "Ocorrência não encontrada" });
    await ocorrenciaService.deleteOcorrencia(id);
    return res.status(200).json({ message: "Ocorrência excluída com sucesso" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao excluir ocorrência", detail: err.message });
  }
};

const updateOcorrencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).json({ message: "Parâmetro id inválido" });
    const allowedFields = [
      "ocorrencia_titulo",
      "ocorrencia_descricao",
      "ocorrencia_status",
      "ocorrencia_prioridade",
      "ocorrencia_anonima",
      "ocorrencia_atribuida",
    ];
    const updateData = {};
    for (const f of allowedFields)
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    if (Object.keys(updateData).length === 0)
      return res.status(400).json({
        message: "Nenhum campo válido para atualização foi fornecido",
      });
    if (
      updateData.ocorrencia_prioridade &&
      ![1, 2, 3, 4].includes(Number(updateData.ocorrencia_prioridade))
    )
      return res
        .status(422)
        .json({ message: "ocorrencia_prioridade inválida" });
    if (
      updateData.ocorrencia_status &&
      ![1, 2, 3, 4, 5].includes(Number(updateData.ocorrencia_status))
    )
      return res.status(422).json({ message: "ocorrencia_status inválido" });
    const updated = await ocorrenciaService.updateOcorrencia(id, updateData);
    if (!updated)
      return res.status(404).json({ message: "Ocorrência não encontrada" });
    return res.status(200).json({
      message: "Ocorrência atualizada com sucesso",
      ocorrencia: updated,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao atualizar ocorrência", detail: err.message });
  }
};

const searchOcorrenciaByFieldValue = async (req, res) => {
  try {
    const field = String(req.query.field || "titulo");
    const value = String(req.query.value || "");
    const orderField = String(req.query.orderField || "data");
    const orderDir = String(req.query.orderDir || "desc");
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);
    const allowedFields = ["status", "prioridade", "titulo", "descricao"];
    const allowedOrderFields = ["data", "status", "prioridade", "titulo"];
    const allowedOrderDir = ["asc", "desc"];
    if (!allowedFields.includes(field))
      return res.status(400).json({ message: "Campo de filtro inválido" });
    if (!allowedOrderFields.includes(orderField))
      return res.status(400).json({ message: "Campo de ordenação inválido" });
    if (!allowedOrderDir.includes(orderDir.toLowerCase()))
      return res.status(400).json({ message: "Direção de ordenação inválida" });
    if (
      !Number.isInteger(limit) ||
      !Number.isInteger(offset) ||
      limit < 1 ||
      offset < 0
    )
      return res
        .status(400)
        .json({ message: "Parâmetros de paginação inválidos" });
    const ocorrencias = await ocorrenciaService.searchOcorrenciaByFieldValue(
      field,
      value,
      orderField,
      orderDir,
      limit,
      offset
    );
    if (!ocorrencias || ocorrencias.length === 0)
      return res.status(404).json({ message: "Nenhuma ocorrência encontrada" });
    return res.status(200).json(ocorrencias);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao buscar ocorrências", detail: err.message });
  }
};

const getOcorrenciasByPrioridade = async (req, res) => {
  try {
    const prioridade = Number(req.query.prioridade);
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);
    if (![1, 2, 3, 4].includes(prioridade))
      return res.status(400).json({ message: "prioridade inválida" });
    const data = await ocorrenciaService.getOcorrenciasByPrioridade(
      prioridade,
      limit,
      offset
    );
    if (!data || data.length === 0)
      return res.status(404).json({
        message: "Nenhuma ocorrência encontrada para a prioridade informada",
      });
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao listar por prioridade", detail: err.message });
  }
};

const getOcorrenciasByStatus = async (req, res) => {
  try {
    const status = Number(req.query.status);
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);
    if (!Number.isInteger(status) || status < 1 || status > 5)
      return res.status(400).json({ message: "status inválido" });
    const data = await ocorrenciaService.getOcorrenciasByStatus(
      status,
      limit,
      offset
    );
    if (!data || data.length === 0)
      return res.status(404).json({
        message: "Nenhuma ocorrência encontrada para o status informado",
      });
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao listar por status", detail: err.message });
  }
};

const searchOcorrenciasFullText = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);
    if (!q)
      return res.status(400).json({ message: "Parâmetro q é obrigatório" });
    const data = await ocorrenciaService.searchOcorrenciasFullText(
      q,
      limit,
      offset
    );
    if (!data || data.length === 0)
      return res.status(404).json({
        message: "Nenhuma ocorrência encontrada para o termo informado",
      });
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro na busca full-text", detail: err.message });
  }
};

const getOcorrenciasByDate = async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    const orderDir = String(req.query.orderDir || "desc");
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);
    if (from && isNaN(from.getTime()))
      return res.status(400).json({ message: "from inválido" });
    if (to && isNaN(to.getTime()))
      return res.status(400).json({ message: "to inválido" });
    if (!["asc", "desc"].includes(orderDir.toLowerCase()))
      return res.status(400).json({ message: "orderDir inválido" });
    const data = await ocorrenciaService.getOcorrenciasByDate(
      from,
      to,
      orderDir,
      limit,
      offset
    );
    if (!data || data.length === 0)
      return res.status(404).json({
        message: "Nenhuma ocorrência encontrada no período informado",
      });
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao listar por data", detail: err.message });
  }
};

const getOcorrenciasByLocal = async (req, res) => {
  try {
    const municipio = req.query.municipio
      ? String(req.query.municipio)
      : undefined;
    const bairro = req.query.bairro ? String(req.query.bairro) : undefined;
    const rua = req.query.rua ? String(req.query.rua) : undefined;
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);
    if (!municipio && !bairro && !rua)
      return res.status(400).json({
        message: "Informe ao menos um parâmetro: municipio, bairro ou rua",
      });
    const data = await ocorrenciaService.getOcorrenciasByLocal(
      { municipio, bairro, rua },
      limit,
      offset
    );
    if (!data || data.length === 0)
      return res.status(404).json({
        message: "Nenhuma ocorrência encontrada para o local informado",
      });
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao listar por local", detail: err.message });
  }
};

const getOcorrenciaBySetor = async (req, res) => {
  try {
    const ocorrencia_atribuida = Number(req.params.ocorrencia_atribuida);
    if (!Number.isInteger(userId) || userId <= 0)
      return res
        .status(400)
        .json({ message: "Parâmetro ocorrencia_atribuida inválido" });
    const ocorrencias = await ocorrenciaService.getOcorrenciaBySetor(
      ocorrencia_atribuida
    );
    if (!ocorrencias || ocorrencias.length === 0)
      return res
        .status(404)
        .json({ message: "Nenhuma ocorrência encontrada para este usuário" });
    return res.status(200).json(ocorrencias);
  } catch (err) {
    return res.status(500).json({
      message: "Erro ao buscar ocorrências do usuário",
      detail: err.message,
    });
  }
};

const getOcorrenciasProximas = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        message: "Parâmetros lat e lng são obrigatórios e devem ser numéricos",
      });
    }

    const radius_km =
      req.query.radius_km != null ? Number(req.query.radius_km) : 3;
    const status_id =
      req.query.status != null ? Number(req.query.status) : null;
    const prioridade_id =
      req.query.prioridade != null ? Number(req.query.prioridade) : null;
    const com_imagens =
      String(req.query.com_imagens || "").toLowerCase() === "1" ||
      String(req.query.com_imagens || "").toLowerCase() === "true";

    const limit = req.query.limit != null ? Number(req.query.limit) : 20;
    const offset = req.query.offset != null ? Number(req.query.offset) : 0;

    if (radius_km <= 0)
      return res
        .status(400)
        .json({ message: "radius_km deve ser maior que zero" });
    if (limit <= 0 || limit > 100)
      return res
        .status(400)
        .json({ message: "limit deve estar entre 1 e 100" });
    if (offset < 0)
      return res.status(400).json({ message: "offset não pode ser negativo" });
    if (status_id !== null && !Number.isInteger(status_id))
      return res.status(400).json({ message: "status inválido" });
    if (prioridade_id !== null && !Number.isInteger(prioridade_id))
      return res.status(400).json({ message: "prioridade inválida" });

    const data = await ocorrenciaService.getOcorrenciasProximas({
      lat,
      lng,
      radius_km,
      status_id,
      prioridade_id,
      com_imagens,
      limit,
      offset,
    });

    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch (err) {
    return res.status(500).json({
      message: "Erro ao buscar ocorrências próximas",
      detail: err.message,
    });
  }
};

const listOcorrencias = async (req, res) => {
  try {
    const role =
      Number(req.user?.role ?? req.user?.tipo ?? req.user?.user_type_id ?? 0) ||
      null;
    const userId =
      Number(req.user?.id ?? req.user?.user_id ?? req.user?.sub ?? 0) || null;
    if (!role || !userId)
      return res.status(401).json({ message: "Não autenticado" });

    const q = String(req.query.q || "").trim();
    const status_id =
      req.query.status != null ? Number(req.query.status) : null;
    const prioridade_id =
      req.query.prioridade != null ? Number(req.query.prioridade) : null;
    const withImages = String(req.query.withImages ?? "").toLowerCase();
    const com_imagens = withImages === "1" || withImages === "true";
    const orderDir =
      String(req.query.orderDir || "desc").toLowerCase() === "asc"
        ? "asc"
        : "desc";
    const limit = req.query.limit != null ? Number(req.query.limit) : 20;
    const offset = req.query.offset != null ? Number(req.query.offset) : 0;
    const nearbyLat =
      req.query.nearbyLat != null ? Number(req.query.nearbyLat) : null;
    const nearbyLng =
      req.query.nearbyLng != null ? Number(req.query.nearbyLng) : null;
    const nearbyRadiusM =
      req.query.nearbyRadiusM != null ? Number(req.query.nearbyRadiusM) : null;

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100)
      return res.status(400).json({ message: "limit inválido" });
    if (!Number.isInteger(offset) || offset < 0)
      return res.status(400).json({ message: "offset inválido" });
    if (status_id !== null && !Number.isInteger(status_id))
      return res.status(400).json({ message: "status inválido" });
    if (prioridade_id !== null && !Number.isInteger(prioridade_id))
      return res.status(400).json({ message: "prioridade inválida" });
    if (nearbyLat !== null && !Number.isFinite(nearbyLat))
      return res.status(400).json({ message: "nearbyLat inválido" });
    if (nearbyLng !== null && !Number.isFinite(nearbyLng))
      return res.status(400).json({ message: "nearbyLng inválido" });
    if (
      nearbyRadiusM !== null &&
      (!Number.isFinite(nearbyRadiusM) || nearbyRadiusM <= 0)
    )
      return res.status(400).json({ message: "nearbyRadiusM inválido" });

    const rows = await ocorrenciaService.listOcorrenciasRoleAware({
      q,
      status_id,
      prioridade_id,
      com_imagens,
      orderDir,
      limit,
      offset,
      role,
      userId,
      nearbyLat,
      nearbyLng,
      nearbyRadiusM,
    });

    const total = rows.length ? Number(rows[0].total_count || 0) : 0;
    const items = rows.map((r) => {
      const { total_count, ...rest } = r;
      return rest;
    });

    res.set("X-Total-Count", String(total));
    return res.status(200).json(items);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao listar ocorrências", detail: err.message });
  }
};

module.exports = {
  createOcorrencia,
  getOcorrenciaById,
  getOcorrenciaByUser,
  deleteOcorrencia,
  updateOcorrencia,
  searchOcorrenciaByFieldValue,
  getOcorrenciasByPrioridade,
  getOcorrenciasByStatus,
  searchOcorrenciasFullText,
  getOcorrenciasByDate,
  getOcorrenciasByLocal,
  getOcorrenciaBySetor,
  getOcorrenciasProximas,
  listOcorrencias,
};
