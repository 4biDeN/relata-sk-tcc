import { defineStore } from 'pinia'
import { ocorrenciaHistoricoService as svc } from 'src/services/ocorrenciaHistoricoService'

export const useOcorrenciaHistoricoStore = defineStore('ocorrenciaHistorico', {
    state: () => ({
        byOcorrencia: {},
        loading: false,
        saving: false,
        error: null,
    }),

    getters: {
        list: (s) => (id) => s.byOcorrencia[id]?.rows || [],
        total: (s) => (id) => s.byOcorrencia[id]?.total || 0,
        pageState: (s) => (id) => {
            const it = s.byOcorrencia[id]
            return it ? { limit: it.limit, offset: it.offset, total: it.total } : { limit: 20, offset: 0, total: 0 }
        },
    },

    actions: {
        async carregar(ocorrenciaId, { limit = 20, offset = 0, force = false } = {}) {
            if (!force && this.byOcorrencia[ocorrenciaId] && this.byOcorrencia[ocorrenciaId].rows?.length) {
                return this.byOcorrencia[ocorrenciaId]
            }
            this.loading = true
            this.error = null
            try {
                const { rows, total } = await svc.list(ocorrenciaId, { limit, offset })
                this.byOcorrencia[ocorrenciaId] = { rows, total, limit, offset }
                return this.byOcorrencia[ocorrenciaId]
            } catch (e) {
                this.error = e
                throw e
            } finally {
                this.loading = false
            }
        },

        async paginar(ocorrenciaId, { limit = 20, offset = 0 }) {
            this.loading = true
            this.error = null
            try {
                const { rows, total } = await svc.list(ocorrenciaId, { limit, offset })
                this.byOcorrencia[ocorrenciaId] = { rows, total, limit, offset }
                return this.byOcorrencia[ocorrenciaId]
            } catch (e) {
                this.error = e
                throw e
            } finally {
                this.loading = false
            }
        },

        async adicionar(
            ocorrenciaId,
            { acao, entidade, campo = null, valor_anterior = null, valor_novo = null, entidade_id = null, changed_by = null, changed_at = null, meta = {} }
        ) {
            this.saving = true
            this.error = null
            try {
                const created = await svc.create(ocorrenciaId, {
                    acao,
                    entidade,
                    campo,
                    valor_anterior,
                    valor_novo,
                    entidade_id,
                    changed_by,
                    changed_at,
                    meta,
                })
                if (created?.skipped) return { skipped: true }
                const curr = this.byOcorrencia[ocorrenciaId] || { rows: [], total: 0, limit: 20, offset: 0 }
                this.byOcorrencia[ocorrenciaId] = {
                    ...curr,
                    rows: [created, ...(curr.rows || [])],
                    total: Number(curr.total || 0) + 1,
                }
                return created
            } catch (e) {
                this.error = e
                throw e
            } finally {
                this.saving = false
            }
        },

        async atualizar(ocorrenciaId, id, payload) {
            this.saving = true
            this.error = null
            try {
                const updated = await svc.update(id, payload)
                const curr = this.byOcorrencia[ocorrenciaId]
                if (curr?.rows) {
                    const idx = curr.rows.findIndex((r) => Number(r.historico_id ?? r.id) === Number(id))
                    if (idx !== -1) curr.rows.splice(idx, 1, updated)
                }
                return updated
            } catch (e) {
                this.error = e
                throw e
            } finally {
                this.saving = false
            }
        },

        async remover(ocorrenciaId, id) {
            this.saving = true
            this.error = null
            try {
                await svc.remove(id)
                const curr = this.byOcorrencia[ocorrenciaId]
                if (curr?.rows) {
                    curr.rows = curr.rows.filter((r) => Number(r.historico_id ?? r.id) !== Number(id))
                    curr.total = Math.max(0, Number(curr.total || 0) - 1)
                    this.byOcorrencia[ocorrenciaId] = { ...curr }
                }
                return true
            } catch (e) {
                this.error = e
                throw e
            } finally {
                this.saving = false
            }
        },

        limpar(ocorrenciaId) {
            if (ocorrenciaId != null) delete this.byOcorrencia[ocorrenciaId]
            else this.byOcorrencia = {}
        },
    },
})
