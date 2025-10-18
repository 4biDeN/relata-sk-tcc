import { api } from 'src/boot/axios'

export async function listOcorrenciaComentarios(
    ocorrenciaId,
    { includeExcluidos = false, limit = 20, offset = 0, before = null } = {}
) {
    const params = { includeExcluidos, limit, offset }
    if (before) params.before = before instanceof Date ? before.toISOString() : before

    const { data } = await api.get(`/ocorrencias/${ocorrenciaId}/comentarios`, { params })

    const isArray = Array.isArray(data)
    const rows = isArray ? data : (Array.isArray(data?.rows) ? data.rows : [])
    const total = isArray ? rows.length : Number(data?.total ?? rows.length ?? 0)

    const normRows = rows.map((r) => {
        const comentario_id = Number(r.comentario_id ?? r.id ?? 0)
        const comentario_ocorrencia_id = Number(r.comentario_ocorrencia_id ?? r.ocorrencia_id ?? ocorrenciaId)
        const comentario_user_id = r.comentario_user_id != null ? Number(r.comentario_user_id) : null
        const comentario_data = r.comentario_data
            ? (r.comentario_data instanceof Date ? r.comentario_data : new Date(r.comentario_data))
            : null
        const comentario_excluido = !!(r.comentario_excluido ?? false)
        const comentario_user_username = r.comentario_user_username ?? r.user_username ?? null
        const comentario_user_nome = r.comentario_user_nome ?? r.user_nome ?? null

        return {
            ...r,
            comentario_id,
            comentario_ocorrencia_id,
            comentario_user_id,
            comentario_data,
            comentario_excluido,
            comentario_user_username,
            comentario_user_nome,
            comentario_texto: r.comentario_texto ?? '',
        }
    })

    return { rows: normRows, total }
}

export async function getComentario(id) {
    const { data } = await api.get(`/ocorrencias/comentarios/${id}`)
    return {
        ...data,
        comentario_id: Number(data.comentario_id ?? data.id ?? 0),
        comentario_ocorrencia_id: Number(data.comentario_ocorrencia_id ?? data.ocorrencia_id ?? 0),
        comentario_user_id: data.comentario_user_id != null ? Number(data.comentario_user_id) : null,
        comentario_data: data.comentario_data
            ? (data.comentario_data instanceof Date ? data.comentario_data : new Date(data.comentario_data))
            : null,
        comentario_excluido: !!(data.comentario_excluido ?? false),
        comentario_user_username: data.comentario_user_username ?? data.user_username ?? null,
        comentario_user_nome: data.comentario_user_nome ?? data.user_nome ?? null,
        comentario_texto: data.comentario_texto ?? '',
    }
}

export async function createOcorrenciaComentario(ocorrenciaId, payload) {
    const { data } = await api.post(`/ocorrencias/${ocorrenciaId}/comentarios`, payload)
    return data
}

export async function updateOcorrenciaComentario(id, payload) {
    const { data } = await api.put(`/ocorrencias/comentarios/${id}`, payload)
    return data
}

export async function softDeleteOcorrenciaComentario(id) {
    const { data } = await api.patch(`/ocorrencias/comentarios/${id}/excluir`)
    return data
}

export async function deleteOcorrenciaComentario(id) {
    await api.delete(`/ocorrencias/comentarios/${id}`)
    return true
}

export const ocorrenciaComentarioService = {
    list: listOcorrenciaComentarios,
    get: getComentario,
    create: createOcorrenciaComentario,
    update: updateOcorrenciaComentario,
    softDelete: softDeleteOcorrenciaComentario,
    remove: deleteOcorrenciaComentario,
}
