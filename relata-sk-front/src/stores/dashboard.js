import { defineStore } from 'pinia'
import { fetchDashboardMetrics } from 'src/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        metrics: null,
        loading: false,
        error: null,
        lastLoaded: null
    }),

    getters: {
        totals: (s) => s.metrics?.totals ?? { total: 0, open: 0, resolved: 0 },
        openCount: (s) => s.metrics?.totals?.open ?? 0,
        resolvedCount: (s) => s.metrics?.totals?.resolved ?? 0,
        totalCount: (s) => s.metrics?.totals?.total ?? 0,
        statusBreakdown: (s) => s.metrics?.by_status ?? [],
        priorityBreakdown: (s) => s.metrics?.by_priority ?? [],
        dailyCounts: (s) => s.metrics?.last_30_days ?? [],
        avgOpenHours: (s) => s.metrics?.avg_open_hours ?? 0,

        statusSeries: (s) => (s.metrics?.by_status ?? []).map(i => i.count),
        statusLabels: (s) => (s.metrics?.by_status ?? []).map(i => i.status_name),
        prioritySeries: (s) => (s.metrics?.by_priority ?? []).map(i => i.count),
        priorityLabels: (s) => (s.metrics?.by_priority ?? []).map(i => i.priority_name),
        dailySeries: (s) => (s.metrics?.last_30_days ?? []).map(i => i.count),
        dailyLabels: (s) => (s.metrics?.last_30_days ?? []).map(i => i.date)
    },

    actions: {
        async fetch({ force = false } = {}) {
            if (this.loading) return
            if (!force && this.metrics && this.lastLoaded && (Date.now() - this.lastLoaded.getTime() < 60_000)) return
            this.loading = true
            this.error = null
            try {
                this.metrics = await fetchDashboardMetrics()
                this.lastLoaded = new Date()
            } catch (e) {
                this.error = e
                throw e
            } finally {
                this.loading = false
            }
        },

        async refresh() {
            return this.fetch({ force: true })
        }
    }
})
