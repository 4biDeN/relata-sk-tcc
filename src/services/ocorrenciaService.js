const db = require("../configs/pg");
const { toPublicUrl } = require("../storage");

const createOcorrencia = async (data) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const hasCoords =
      data.local?.local_latitude != null && data.local?.local_longitude != null;

    const selLocalSql = `
      select local_id
      from t_local
      where local_municipio_id = $1
        and local_bairro = $2
        and local_rua = $3
        and coalesce(local_complemento,'') = coalesce($4,'')
        ${
          hasCoords
            ? "and ST_DWithin(location, ST_SetSRID(ST_MakePoint($5,$6),4326)::geography, 10)"
            : ""
        }
    `;
    const selLocalParams = [
      data.local?.local_municipio_id,
      data.local?.local_bairro,
      data.local?.local_rua,
      data.local?.local_complemento || null,
      ...(hasCoords
        ? [data.local.local_longitude, data.local.local_latitude]
        : []),
    ];
    let localRes = await client.query(selLocalSql, selLocalParams);
    let localId;

    if (localRes.rows.length) {
      localId = localRes.rows[0].local_id;
    } else {
      if (!hasCoords) {
        throw new Error(
          "Latitude e longitude são obrigatórias para criar um novo local."
        );
      }
      const insLocalSql = `
        insert into t_local (
          local_municipio_id, local_estado, local_bairro, local_rua,
          local_complemento, location
        ) values ($1,$2,$3,$4,$5, ST_SetSRID(ST_MakePoint($6,$7),4326)::geography)
        returning local_id
      `;
      const insLocalParams = [
        data.local?.local_municipio_id,
        data.local?.local_estado,
        data.local?.local_bairro,
        data.local?.local_rua,
        data.local?.local_complemento || null,
        data.local?.local_longitude,
        data.local?.local_latitude,
      ];
      const insLocalRes = await client.query(insLocalSql, insLocalParams);
      localId = insLocalRes.rows[0].local_id;
    }

    const insOcSql = `
      insert into t_ocorrencia (
        ocorrencia_user_id,
        ocorrencia_anonima,
        ocorrencia_titulo,
        ocorrencia_descricao,
        ocorrencia_status,
        ocorrencia_prioridade,
        ocorrencia_local_id
      )
      values ($1,$2,$3,$4,1,$5,$6)
      returning ocorrencia_id, ocorrencia_protocolo, ocorrencia_titulo, ocorrencia_descricao
    `;
    const insOcParams = [
      data.ocorrencia_user_id,
      data.ocorrencia_anonima ?? false,
      data.ocorrencia_titulo,
      data.ocorrencia_descricao,
      data.ocorrencia_prioridade ?? 2,
      localId,
    ];
    const ocorrenciaRes = await client.query(insOcSql, insOcParams);
    const ocorrencia = ocorrenciaRes.rows[0];

    const histSql = `
      insert into t_ocorrencia_status_historico (ocorrencia_id, ocorrencia_status_id)
      values ($1, $2)
    `;
    await client.query(histSql, [ocorrencia.ocorrencia_id, 1]);

    if (Array.isArray(data.files) && data.files.length) {
      const insImgSql = `
        insert into t_ocorrencia_imagem (ocorrencia_id, ocorrencia_imagem_url)
        values ($1, $2)
        returning ocorrencia_imagem_id, ocorrencia_imagem_url
      `;
      for (const f of data.files) {
        const url = toPublicUrl(f);
        await client.query(insImgSql, [ocorrencia.ocorrencia_id, url]);
      }
    }

    await client.query("COMMIT");
    return ocorrencia;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getOcorrenciaById = async (ocorrencia_id) => {
  const sql = `
    select 
      o.ocorrencia_id,
      o.ocorrencia_user_id,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      o.ocorrencia_data,
      o.ocorrencia_protocolo,
      o.ocorrencia_anonima,
      os.ocorrencia_status_nome,
      u.user_username,
      m.municipio_nome,
      l.local_estado,
      l.local_bairro,
      l.local_rua,
      l.local_complemento,
      round(ST_Y(l.location::geometry)::numeric, 6) as local_latitude,
      round(ST_X(l.location::geometry)::numeric, 6) as local_longitude,
      coalesce(
        json_agg(
          json_build_object(
            'ocorrencia_imagem_id', i.ocorrencia_imagem_id,
            'ocorrencia_imagem_url', i.ocorrencia_imagem_url
          )
          order by i.ocorrencia_imagem_id
        ) filter (where i.ocorrencia_imagem_id is not null),
        '[]'::json
      ) as imagens
    from t_ocorrencia o
    join t_ocorrencia_status os on o.ocorrencia_status = os.ocorrencia_status_id
    join t_usuario u on o.ocorrencia_user_id = u.user_id
    join t_local l on o.ocorrencia_local_id = l.local_id
    join t_municipio m on l.local_municipio_id = m.municipio_id
    left join t_ocorrencia_imagem i on i.ocorrencia_id = o.ocorrencia_id
    where o.ocorrencia_id = $1
      and o.ocorrencia_excluida = false
    group by
      o.ocorrencia_id, o.ocorrencia_user_id, o.ocorrencia_titulo, o.ocorrencia_descricao, o.ocorrencia_data,
      o.ocorrencia_protocolo, o.ocorrencia_anonima, os.ocorrencia_status_nome,
      u.user_username, m.municipio_nome, l.local_estado, l.local_bairro,
      l.local_rua, l.local_complemento, l.location
  `;
  const result = await db.query(sql, [ocorrencia_id]);
  return result.rows.length ? result.rows[0] : null;
};

const getOcorrenciaByUser = async (user_id) => {
  const sql = `
    with imgs as (
      select
        i.ocorrencia_id,
        count(*) as imagens_count,
        min(i.ocorrencia_imagem_id) as first_img_id
      from t_ocorrencia_imagem i
      group by i.ocorrencia_id
    ),
    capa as (
      select i.ocorrencia_id, i.ocorrencia_imagem_url as thumbnail_url
      from t_ocorrencia_imagem i
      join imgs x on x.first_img_id = i.ocorrencia_imagem_id
    )
    select
      o.ocorrencia_id,
      o.ocorrencia_titulo,
      o.ocorrencia_data,
      o.ocorrencia_protocolo,
      o.ocorrencia_anonima,
      os.ocorrencia_status_nome,
      coalesce(x.imagens_count, 0) as imagens_count,
      c.thumbnail_url
    from t_ocorrencia o
    join t_ocorrencia_status os on o.ocorrencia_status = os.ocorrencia_status_id
    left join imgs x on x.ocorrencia_id = o.ocorrencia_id
    left join capa c on c.ocorrencia_id = o.ocorrencia_id
    where o.ocorrencia_user_id = $1
      and o.ocorrencia_excluida = false
    order by o.ocorrencia_data desc
  `;
  const result = await db.query(sql, [user_id]);
  return result.rows.length ? result.rows : null;
};

const deleteOcorrencia = async (ocorrencia_id) => {
  const sql = `
    update t_ocorrencia
      set ocorrencia_excluida = true
    where ocorrencia_id = $1
  `;
  await db.query(sql, [ocorrencia_id]);
};

const updateOcorrencia = async (ocorrencia_id, data) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const allowedFields = [
      "ocorrencia_titulo",
      "ocorrencia_descricao",
      "ocorrencia_status",
      "ocorrencia_prioridade",
      "ocorrencia_anonima",
    ];

    const setClause = [];
    const values = [];
    let index = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        setClause.push(`${field} = $${index}`);
        values.push(data[field]);
        index++;
      }
    }
    if (setClause.length === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    values.push(ocorrencia_id);
    const updSql = `
      update t_ocorrencia
      set ${setClause.join(", ")}
      where ocorrencia_id = $${index}
        and ocorrencia_excluida = false
      returning ocorrencia_id, ocorrencia_status
    `;
    const updRes = await client.query(updSql, values);
    const updated = updRes.rows.length ? updRes.rows[0] : null;

    if (updated && data.ocorrencia_status !== undefined) {
      const histSql = `
        insert into t_ocorrencia_status_historico (ocorrencia_id, ocorrencia_status_id)
        values ($1, $2)
      `;
      await client.query(histSql, [ocorrencia_id, data.ocorrencia_status]);
    }

    await client.query("COMMIT");
    return updated || false;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

const searchOcorrenciaByFieldValue = async (
  field,
  value,
  orderField,
  orderDir,
  limit = 10,
  offset = 0
) => {
  const allowedFilterFields = ["status", "prioridade", "titulo", "descricao"];
  const allowedOrderFilterFields = ["data", "status", "prioridade", "titulo"];
  const allowedOrderDir = ["asc", "desc"];

  if (!allowedFilterFields.includes(field)) field = "titulo";
  if (!allowedOrderFilterFields.includes(orderField)) orderField = "data";
  if (!orderDir || !allowedOrderDir.includes((orderDir || "").toLowerCase()))
    orderDir = "desc";

  const sql = `
    select
      o.ocorrencia_id,
      o.ocorrencia_protocolo,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      s.ocorrencia_status_nome as status,
      p.ocorrencia_prioridade_nome as prioridade,
      o.ocorrencia_data,
      o.ocorrencia_anonima
    from t_ocorrencia o
    left join t_ocorrencia_status s on o.ocorrencia_status = s.ocorrencia_status_id
    left join t_ocorrencia_prioridade p on o.ocorrencia_prioridade = p.ocorrencia_prioridade_id
    where
      ($2 = '' or
        case
          when $1 = 'status'     then o.ocorrencia_status = cast($2 as integer)
          when $1 = 'prioridade' then o.ocorrencia_prioridade = cast($2 as integer)
          when $1 = 'titulo'     then o.ocorrencia_titulo ilike '%' || $2 || '%'
          when $1 = 'descricao'  then o.ocorrencia_descricao ilike '%' || $2 || '%'
          else false
        end
      )
      and o.ocorrencia_excluida = false
    order by
      case when $4 = 'asc' and $3 in ('status','prioridade','titulo')
        then case $3 when 'status' then s.ocorrencia_status_nome
                     when 'prioridade' then p.ocorrencia_prioridade_nome
                     when 'titulo' then o.ocorrencia_titulo end end asc,
      case when $4 = 'desc' and $3 in ('status','prioridade','titulo')
        then case $3 when 'status' then s.ocorrencia_status_nome
                     when 'prioridade' then p.ocorrencia_prioridade_nome
                     when 'titulo' then o.ocorrencia_titulo end end desc,
      case when $4 = 'asc' and $3 = 'data' then o.ocorrencia_data end asc,
      case when $4 = 'desc' and $3 = 'data' then o.ocorrencia_data end desc,
      o.ocorrencia_id desc
    limit $5
    offset $6;
  `;
  const params = [
    field,
    value || "",
    orderField,
    orderDir.toLowerCase(),
    limit,
    offset,
  ];
  const result = await db.query(sql, params);
  return result.rows.length ? result.rows : false;
};

const getOcorrenciasByPrioridade = async (
  prioridade_id,
  limit = 10,
  offset = 0
) => {
  const sql = `
    select
      o.ocorrencia_id,
      o.ocorrencia_protocolo,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      p.ocorrencia_prioridade_nome as prioridade,
      s.ocorrencia_status_nome as status,
      o.ocorrencia_data
    from t_ocorrencia o
    join t_ocorrencia_prioridade p on o.ocorrencia_prioridade = p.ocorrencia_prioridade_id
    join t_ocorrencia_status s on o.ocorrencia_status = s.ocorrencia_status_id
    where o.ocorrencia_excluida = false
      and o.ocorrencia_prioridade = $1
    order by o.ocorrencia_data desc
    limit $2 offset $3
  `;
  const result = await db.query(sql, [prioridade_id, limit, offset]);
  return result.rows;
};

const getOcorrenciasByStatus = async (status_id, limit = 10, offset = 0) => {
  const sql = `
    select
      o.ocorrencia_id,
      o.ocorrencia_protocolo,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      s.ocorrencia_status_nome as status,
      p.ocorrencia_prioridade_nome as prioridade,
      o.ocorrencia_data
    from t_ocorrencia o
    join t_ocorrencia_status s on o.ocorrencia_status = s.ocorrencia_status_id
    join t_ocorrencia_prioridade p on o.ocorrencia_prioridade = p.ocorrencia_prioridade_id
    where o.ocorrencia_excluida = false
      and o.ocorrencia_status = $1
    order by o.ocorrencia_data desc
    limit $2 offset $3
  `;
  const result = await db.query(sql, [status_id, limit, offset]);
  return result.rows;
};

const searchOcorrenciasFullText = async (query, limit = 10, offset = 0) => {
  const sql = `
    select
      o.ocorrencia_id,
      o.ocorrencia_protocolo,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      o.ocorrencia_data,
      s.ocorrencia_status_nome as status,
      p.ocorrencia_prioridade_nome as prioridade
    from t_ocorrencia o
    left join t_ocorrencia_status s on o.ocorrencia_status = s.ocorrencia_status_id
    left join t_ocorrencia_prioridade p on o.ocorrencia_prioridade = p.ocorrencia_prioridade_id
    where o.ocorrencia_excluida = false
      and o.ocorrencia_tsv @@ plainto_tsquery('portuguese', $1)
    order by o.ocorrencia_data desc
    limit $2 offset $3
  `;
  const result = await db.query(sql, [query, limit, offset]);
  return result.rows;
};

const getOcorrenciasByDate = async (
  from,
  to,
  orderDir = "desc",
  limit = 10,
  offset = 0
) => {
  const dir = (orderDir || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const params = [];
  let idx = 1;
  let where = "o.ocorrencia_excluida = false";

  if (from) {
    where += ` and o.ocorrencia_data >= $${idx++}`;
    params.push(from);
  }
  if (to) {
    where += ` and o.ocorrencia_data <= $${idx++}`;
    params.push(to);
  }
  params.push(limit, offset);

  const sql = `
    select
      o.ocorrencia_id,
      o.ocorrencia_protocolo,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      o.ocorrencia_data,
      s.ocorrencia_status_nome as status,
      p.ocorrencia_prioridade_nome as prioridade
    from t_ocorrencia o
    left join t_ocorrencia_status s on o.ocorrencia_status = s.ocorrencia_status_id
    left join t_ocorrencia_prioridade p on o.ocorrencia_prioridade = p.ocorrencia_prioridade_id
    where ${where}
    order by o.ocorrencia_data ${dir}
    limit $${idx++} offset $${idx}
  `;
  const result = await db.query(sql, params);
  return result.rows;
};

const getOcorrenciasByLocal = async (
  { municipio, bairro, rua } = {},
  limit = 10,
  offset = 0
) => {
  const clauses = ["o.ocorrencia_excluida = false", "l.local_excluido = false"];
  const params = [];
  let i = 1;

  if (municipio) {
    clauses.push(`m.municipio_nome ilike '%' || $${i++} || '%'`);
    params.push(municipio);
  }
  if (bairro) {
    clauses.push(`l.local_bairro ilike '%' || $${i++} || '%'`);
    params.push(bairro);
  }
  if (rua) {
    clauses.push(`l.local_rua ilike '%' || $${i++} || '%'`);
    params.push(rua);
  }

  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  params.push(limit, offset);

  const sql = `
    select
      o.ocorrencia_id,
      o.ocorrencia_protocolo,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      o.ocorrencia_data,
      s.ocorrencia_status_nome as status,
      p.ocorrencia_prioridade_nome as prioridade,
      m.municipio_nome,
      l.local_estado,
      l.local_bairro,
      l.local_rua
    from t_ocorrencia o
    join t_local l on o.ocorrencia_local_id = l.local_id
    join t_municipio m on l.local_municipio_id = m.municipio_id
    left join t_ocorrencia_status s on o.ocorrencia_status = s.ocorrencia_status_id
    left join t_ocorrencia_prioridade p on o.ocorrencia_prioridade = p.ocorrencia_prioridade_id
    ${where}
    order by o.ocorrencia_data desc
    limit $${i++} offset $${i}
  `;
  const result = await db.query(sql, params);
  return result.rows;
};

const getOcorrenciaBySetor = async (ocorrencia_atribuida) => {
  const sql = `
    select 
      o.ocorrencia_id,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      o.ocorrencia_data,
      o.ocorrencia_protocolo,
      o.ocorrencia_anonima,
      os.ocorrencia_status_nome,
      u.user_username,
      us.user_type_name,
      m.municipio_nome,
      l.local_estado,
      l.local_bairro,
      l.local_rua,
      l.local_complemento
    from t_ocorrencia o
    join t_ocorrencia_status os on o.ocorrencia_status = os.ocorrencia_status_id
    join t_usuario u on o.ocorrencia_user_id = u.user_id
    join t_local l on o.ocorrencia_local_id = l.local_id
    join t_municipio m on l.local_municipio_id = m.municipio_id
    join t_user_type us on o.ocorrencia_atribuida = us.user_type_id
    where o.ocorrencia_atribuida = $1
      and o.ocorrencia_excluida = false
  `;
  const result = await db.query(sql, [ocorrencia_atribuida]);
  return result.rows.length ? result.rows[0] : null;
};

const getOcorrenciasProximas = async ({
  lat,
  lng,
  radius_km = 3,
  status_id = null,
  prioridade_id = null,
  com_imagens = false,
  limit = 20,
  offset = 0,
}) => {
  // saneamento básico
  const R = Math.max(0.1, Math.min(Number(radius_km) || 3, 50));
  const LIMIT = Math.max(1, Math.min(Number(limit) || 20, 100));
  const OFFSET = Math.max(0, Number(offset) || 0);

  const params = [lng, lat, R * 1000];
  let i = params.length;

  const where = [
    "o.ocorrencia_excluida = false",
    "ST_DWithin(l.location, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)",
  ];

  if (status_id != null) {
    params.push(Number(status_id));
    i++;
    where.push(`o.ocorrencia_status = $${i}`);
  }

  if (prioridade_id != null) {
    params.push(Number(prioridade_id));
    i++;
    where.push(`o.ocorrencia_prioridade = $${i}`);
  }

  const imgsCTE = `
    with imgs as (
      select
        i.ocorrencia_id,
        count(*) as imagens_count,
        min(i.ocorrencia_imagem_id) as first_img_id
      from t_ocorrencia_imagem i
      group by i.ocorrencia_id
    ),
    capa as (
      select i.ocorrencia_id, i.ocorrencia_imagem_url as thumbnail_url
      from t_ocorrencia_imagem i
      join imgs x on x.first_img_id = i.ocorrencia_imagem_id
    )
  `;

  const sql = `
    ${imgsCTE}
    select
      o.ocorrencia_id,
      o.ocorrencia_titulo,
      o.ocorrencia_descricao,
      o.ocorrencia_data,
      o.ocorrencia_protocolo,
      o.ocorrencia_anonima,
      s.ocorrencia_status_nome,
      p.ocorrencia_prioridade_nome,
      m.municipio_nome,
      l.local_estado, l.local_bairro, l.local_rua, l.local_complemento,
      round(ST_Y(l.location::geometry)::numeric, 6) as local_latitude,
      round(ST_X(l.location::geometry)::numeric, 6) as local_longitude,
      coalesce(x.imagens_count, 0) as imagens_count,
      c.thumbnail_url,
      round( (ST_DistanceSphere( ST_SetSRID(ST_MakePoint($1,$2),4326), l.location::geometry ) / 1000.0)::numeric, 3 ) as distance_km
    from t_ocorrencia o
    join t_local l on o.ocorrencia_local_id = l.local_id
    join t_municipio m on l.local_municipio_id = m.municipio_id
    left join t_ocorrencia_status s on o.ocorrencia_status = s.ocorrencia_status_id
    left join t_ocorrencia_prioridade p on o.ocorrencia_prioridade = p.ocorrencia_prioridade_id
    left join imgs x on x.ocorrencia_id = o.ocorrencia_id
    left join capa c on c.ocorrencia_id = o.ocorrencia_id
    where ${where.join(" and ")}
    ${com_imagens ? "and coalesce(x.imagens_count,0) > 0" : ""}
    order by distance_km asc, o.ocorrencia_data desc
    limit ${LIMIT} offset ${OFFSET}
  `;

  const { rows } = await db.query(sql, params);
  return rows;
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
};
