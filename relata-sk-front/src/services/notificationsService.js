import { api } from 'src/boot/axios'

function buildParams(obj) {
    const out = {}
    Object.entries(obj).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        out[k] = v
    })
    return out
}

export async function listNotificacoes({
    canal = 'in_app',
    status = ['queued', 'sent', 'read'],
    tipo = [],
    cursor = null,
    limit = 50
} = {}) {
    const params = buildParams({
        canal,
        ...(Array.isArray(status) && status.length
            ? { 'includeStatus[]': status.map(String) }
            : { 'includeStatus[]': ['queued', 'sent', 'read'] }),
        ...(Array.isArray(tipo) && tipo.length ? { 'tipo[]': tipo.map(String) } : {}),
        cursor: cursor instanceof Date ? cursor.toISOString() : cursor,
        limit: Math.min(Number(limit) || 50, 100)
    })

    const { data } = await api.get('/notificacoes', { params })

    const rows = Array.isArray(data?.rows) ? data.rows : (Array.isArray(data) ? data : [])
    const nextCursor = data?.nextCursor ?? null

    const normRows = rows.map((r) => {
        const notificacao_id = Number(r.notificacao_id ?? r.id ?? 0)
        const ocorrencia_id = r.notificacao_ocorrencia_id != null ? Number(r.notificacao_ocorrencia_id) : null
        const meta = typeof r.meta === 'string' ? JSON.parse(r.meta) : (r.meta ?? {})
        const toDate = (v) => (v ? new Date(v) : null)

        return {
            id: notificacao_id,
            title: r.notificacao_titulo ?? '',
            body: r.notificacao_mensagem ?? '',
            actionUrl: r.action_url ?? (ocorrencia_id ? `/ocorrencias/${ocorrencia_id}` : null),
            tipo: r.notificacao_tipo ?? '',
            canal: r.notificacao_canal ?? 'in_app',
            status: r.status ?? 'queued',
            prioridade: Number(r.prioridade ?? 3),
            ocorrencia_id,
            meta,
            created_at: toDate(r.created_at),
            updated_at: toDate(r.updated_at),
            lida_em: toDate(r.lida_em),
            enviada_em: toDate(r.enviada_em),
            cancelada_em: toDate(r.cancelada_em),
            agendar_em: toDate(r.agendar_em),

            _raw: r
        }
    })

    return { rows: normRows, nextCursor }
}

export async function getNotificacao(id) {
    const { data } = await api.get(`/notificacoes/${id}`)
    const notificacao_id = Number(data.notificacao_id ?? data.id ?? 0)
    const notificacao_user_id = data.notificacao_user_id != null ? Number(data.notificacao_user_id) : null
    const notificacao_user_type = data.notificacao_user_type != null ? Number(data.notificacao_user_type) : null
    const notificacao_ocorrencia_id = data.notificacao_ocorrencia_id != null ? Number(data.notificacao_ocorrencia_id) : null
    const prioridade = Number(data.prioridade ?? 3)
    const meta = typeof data.meta === 'string' ? JSON.parse(data.meta) : (data.meta ?? {})
    const created_at = data.created_at ? new Date(data.created_at) : null
    const updated_at = data.updated_at ? new Date(data.updated_at) : null
    const lida_em = data.lida_em ? new Date(data.lida_em) : null
    const enviada_em = data.enviada_em ? new Date(data.enviada_em) : null
    const cancelada_em = data.cancelada_em ? new Date(data.cancelada_em) : null
    const agendar_em = data.agendar_em ? new Date(data.agendar_em) : null

    return {
        ...data,
        notificacao_id,
        notificacao_user_id,
        notificacao_user_type,
        notificacao_ocorrencia_id,
        prioridade,
        meta,
        created_at,
        updated_at,
        lida_em,
        enviada_em,
        cancelada_em,
        agendar_em,
        notificacao_titulo: data.notificacao_titulo ?? '',
        notificacao_mensagem: data.notificacao_mensagem ?? '',
        notificacao_tipo: data.notificacao_tipo ?? '',
        notificacao_canal: data.notificacao_canal ?? 'in_app',
        status: data.status ?? 'queued'
    }
}

export async function createNotificacao(payload) {
    const { data } = await api.post('/notificacoes', payload)
    return data
}

export async function markNotificacaoRead(id) {
    const { data } = await api.post(`/notificacoes/${id}/read`)
    return data
}

export async function markAllNotificacoesRead(canal = 'in_app') {
    await api.post('/notificacoes/read_all', { canal })
    return true
}

export async function getUnreadCount(canal = 'in_app') {
    const { data } = await api.get('/notificacoes/unread/count', { params: { canal } })
    return Number(data?.unread ?? 0)
}

export async function subscribePush(subscription) {
    await api.post('/notificacoes/subscribe', subscription)
    return true
}

export const notificacaoService = {
    list: listNotificacoes,
    get: getNotificacao,
    create: createNotificacao,
    markRead: markNotificacaoRead,
    markAllRead: markAllNotificacoesRead,
    unreadCount: getUnreadCount,
    subscribePush
}

// Aliases esperados pela store:
export const apiListNotifs = listNotificacoes;
export const apiUnreadCount = getUnreadCount;
export const apiMarkRead = markNotificacaoRead;
export const apiMarkAllRead = markAllNotificacoesRead;
