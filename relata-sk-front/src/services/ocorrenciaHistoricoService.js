import { api } from 'src/boot/axios'

export async function listOcorrenciaHistorico(ocorrenciaId, { limit = 20, offset = 0 } = {}) {
    const { data } = await api.get(`/ocorrencias/${ocorrenciaId}/historico`, { params: { limit, offset } })
    const isArray = Array.isArray(data)
    const rows = isArray ? data : (Array.isArray(data?.rows) ? data.rows : [])
    const total = isArray ? rows.length : Number(data?.total ?? rows.length ?? 0)

    const normRows = rows.map((r) => {
        const historico_id = Number(r.historico_id ?? r.id ?? 0)
        const ocorrencia_id = Number(r.ocorrencia_id)
        const entidade_id = r.entidade_id != null ? Number(r.entidade_id) : null
        const changed_by = r.changed_by != null ? Number(r.changed_by) : null
        const changed_at = r.changed_at ? (r.changed_at instanceof Date ? r.changed_at : new Date(r.changed_at)) : null
        const changed_by_username = r.changed_by_username ?? r.user_username ?? r.changed_by_name ?? null

        return {
            ...r,
            historico_id,
            ocorrencia_id,
            entidade_id,
            changed_by,
            changed_by_username,
            changed_at,
            acao: r.acao ?? null,
            entidade: r.entidade ?? null,
            campo: r.campo ?? null,
            valor_anterior: r.valor_anterior ?? null,
            valor_novo: r.valor_novo ?? null,
            meta: r.meta ?? {},
        }
    })

    return { rows: normRows, total }
}

export async function createOcorrenciaHistorico(ocorrenciaId, payload) {
    const { data } = await api.post(`/ocorrencias/${ocorrenciaId}/historico`, payload)
    return data
}

export async function updateOcorrenciaHistorico(id, payload) {
    const { data } = await api.put(`/ocorrencias/historico/${id}`, payload)
    return data
}

export async function deleteOcorrenciaHistorico(id) {
    await api.delete(`/ocorrencias/historico/${id}`)
    return true
}

export const ocorrenciaHistoricoService = {
    list: listOcorrenciaHistorico,
    create: createOcorrenciaHistorico,
    update: updateOcorrenciaHistorico,
    remove: deleteOcorrenciaHistorico,
}
