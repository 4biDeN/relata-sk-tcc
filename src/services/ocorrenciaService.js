const db = require('../configs/pg');
const locaisService = require('./localServices');

const createOcorrencia = async (data) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        let local = await locaisService.getLocal(data.local, { client });
        if (!local) {
            local = await locaisService.createLocal(data.local, { client });
        }

        const sql = `
            insert into t_ocorrencia (
            ocorrencia_user_id,
            ocorrencia_anonima,
            ocorrencia_titulo,
            ocorrencia_descricao,
            ocorrencia_status,
            ocorrencia_prioridade,
            ocorrencia_local_id
        )
        values ($1, $2, $3, $4, 1, $5, $6)
        returning ocorrencia_id, ocorrencia_protocolo, ocorrencia_titulo, ocorrencia_descricao
        `;
    
        const params = [
            data.ocorrencia_user_id,
            data.ocorrencia_anonima,
            data.ocorrencia_titulo,
            data.ocorrencia_descricao,
            data.ocorrencia_prioridade,
            local.local_id
        ];

        const result = await client.query(sql, params);
        
        const ocorrencia = result.rows[0];

        await client.query('COMMIT');
        return ocorrencia;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getOcorrenciaById = async (ocorrencia_id) => {
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
        where o.ocorrencia_id = $1
    `;

    const result = await db.query(sql, [ocorrencia_id]);
    return result.rows.length ? result.rows[0] : null;
};

const getOcorrenciaByUser = async (userd_id) => {
    const sql = `
        select
            o.ocorrencia_id,
            o.ocorrencia_titulo,
            o.ocorrencia_data,
            o.ocorrencia_protocolo,
            o.ocorrencia_anonima,
            os.ocorrencia_status_nome
        from t_ocorrencia o
        join t_ocorrencia_status os on o.ocorrencia_status = os.ocorrencia_status_id
        where o.ocorrencia_user_id = $1 and o.ocorrencia_excluida != true
    `;
    const result = await db.query(sql, [userd_id]);
    return result.rows.length ? result.rows : null;
}


const deleteOcorrencia = async (ocorrencia_id) => {
    const sql = `
    update t_ocorrencia
        set ocorrencia_excluida = true
    where ocorrencia_id = $1
    `
    await db.query(sql, [ocorrencia_id]);
}

// TODO: Criar função para atualizar a ocorrência
const updateOcorrencia = async (ocorrencia_id, data) => {
    const allowedFields = [
        'ocorrencia_titulo',
        'ocorrencia_descricao',
        'ocorrencia_status',
        'ocorrencia_prioridade',
        'ocorrencia_anonima'
    ]

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

    if (setClause.length === 0) return false;

    values.push(ocorrencia_id);
    const sql = `
        update t_ocorrencia
        set ${setClause.join(', ')}
        where ocorrencia_id = $${index}
        returning ocorrencia_id
    `;
    const result = await db.query(sql, values);
    return result.rows.length ? result.rows[0] : false;
};

// TODO: Criar função para listar as ocorrencias por prioridade
// TODO: Criar função para listar as ocorrencias por status
const searchOcorrenciaByFieldValue = async ( field, value, orderField, orderDir, limit = 10, offset = 0) => {
    const allowedFilterFields = [ 'status', 'prioridade', 'titulo', 'descricao' ];
    const allowedOrderFilterFields = [ 'data', 'status', 'prioridade', 'titulo' ];
    const allowedOrderDir = [ 'asc', 'desc' ];

    if (!allowedFilterFields.includes(field)) field = 'titulo';
    if (!allowedOrderFilterFields.includes(orderField)) orderField = 'data';
    if (!allowedOrderDir.includes(orderDir.toLowerCase())) orderDir = 'desc';

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
        from
            t_ocorrencia o
        left join
            t_ocorrencia_status s on o.ocorrencia_status = s.ocorrencia_status_id
        left join
            t_ocorrencia_prioridade p on o.ocorrencia_prioridade = p.ocorrencia_prioridade_id
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
            case when $4 = 'asc' and $3 in ('status', 'prioridade', 'titulo') then case $3 when 'status' then s.ocorrencia_status_nome when 'prioridade' then p.ocorrencia_prioridade_nome when 'titulo' then o.ocorrencia_titulo end end asc,
            case when $4 = 'desc' and $3 in ('status', 'prioridade', 'titulo') then case $3 when 'status' then s.ocorrencia_status_nome when 'prioridade' then p.ocorrencia_prioridade_nome when 'titulo' then o.ocorrencia_titulo end end desc,
            case when $4 = 'asc' and $3 = 'data' then o.ocorrencia_data end asc,
            case when $4 = 'desc' and $3 = 'data' then o.ocorrencia_data end desc,
            o.ocorrencia_id desc
        limit $5 
        offset $6;
    `;

    const params = [
        field,
        value || '',
        orderField,
        orderDir.toLowerCase(),
        limit,
        offset
    ];

    console.log(params)
    const result = await db.query(sql, params);
    return result.rows.length ? result.rows : false;
};

// TODO: Criar função para pesquisar as ocorrencias por título ou descrição (tsvector)
// TODO: Criar função para listar as ocorrencias por data (ordenar)
// TODO: Criar função para listar as ocorrencias por local (cidade, bairro, rua)
//     Com isso será uma função, ocorrencias proximas do usuário;

module.exports = {
    createOcorrencia,
    getOcorrenciaById,
    getOcorrenciaByUser,
    deleteOcorrencia,
    updateOcorrencia,
    searchOcorrenciaByFieldValue
};