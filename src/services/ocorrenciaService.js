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
            ocorrencia_titulo,
            ocorrencia_descricao,
            ocorrencia_status,
            ocorrencia_prioridade,
            ocorrencia_local_id
        )
        values ($1, $2, $3, 1, $4, $5)
        returning ocorrencia_id, ocorrencia_protocolo, ocorrencia_titulo, ocorrencia_descricao
        `;
    
        const params = [
            data.ocorrencia_user_id,
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
            o.ocorrencia_status
        from t_ocorrencia o
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

/*
TODO: Criar função para atualizar a ocorrência
TODO: Criar função para listar as ocorrencias por prioridade
TODO: Criar função para listar as ocorrencias por status
TODO: Criar função para listar as ocorrencias por data (ordenar)
TODO: Criar função para listar as ocorrencias por local (cidade, bairro, rua)
    Com isso será uma função, ocorrencias proximas do usuário;
TODO: Criar função para pesquisar as ocorrencias por título ou descrição (tsvector)
*/

module.exports = {
    createOcorrencia,
    getOcorrenciaById,
    getOcorrenciaByUser,
    deleteOcorrencia
};