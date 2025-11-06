import { api } from 'src/boot/axios'

function normalize(data = {}) {
    const totals = data.totals || {}
    const by_status = Array.isArray(data.by_status) ? data.by_status : []
    const by_priority = Array.isArray(data.by_priority) ? data.by_priority : []
    const last_30_days = Array.isArray(data.last_30_days) ? data.last_30_days : []

    return {
        totals: {
            total: Number(totals.total ?? 0),
            open: Number(totals.open ?? 0),
            resolved: Number(totals.resolved ?? 0)
        },
        by_status: by_status.map(it => ({
            status_id: Number(it.status_id),
            status_name: String(it.status_name || ''),
            count: Number(it.count || 0)
        })),
        by_priority: by_priority.map(it => ({
            priority_id: Number(it.priority_id),
            priority_name: String(it.priority_name || ''),
            count: Number(it.count || 0)
        })),
        last_30_days: last_30_days.map(it => ({
            date: it.date,
            count: Number(it.count || 0)
        })),
        avg_open_hours: Number(data.avg_open_hours ?? 0)
    }
}

export async function fetchDashboardMetrics() {
    const { data } = await api.get('/dashboard/metrics')
    return normalize(data)
}
