import { defineStore } from 'pinia'
import { ocorrenciaComentarioService as svc } from 'src/services/ocorrenciaComentarioService'

export const useOcorrenciaComentarioStore = defineStore('ocorrenciaComentario', {
    state: () => ({
        byOcorrencia: {}, 
        loading: false,
        saving: false,
        error: null,
    }),

    getters: {
        list: (s) => (id) => s.byOcorrencia[id]?.rows || [],
        total: (s) => (id) => s.byOcorrencia[id]?.total || 0,
        pageState:
            (s) =>
                (id) => {
                    const it = s.byOcorrencia[id]
                    return it
                        ? {
                            limit: it.limit,
                            offset: it.offset,
                            total: it.total,
                            includeExcluidos: !!it.includeExcluidos,
                            before: it.before ?? null,
                        }
                        : { limit: 20, offset: 0, total: 0, includeExcluidos: false, before: null }
                },
    },

    actions: {
        async carregar(
            ocorrenciaId,
            { includeExcluidos = false, limit = 20, offset = 0, before = null, force = false } = {}
        ) {
            if (!force && this.byOcorrencia[ocorrenciaId]?.rows?.length) {
                return this.byOcorrencia[ocorrenciaId]
            }
            this.loading = true
            this.error = null
            try {
                const { rows, total } = await svc.list(ocorrenciaId, { includeExcluidos, limit, offset, before })
                this.byOcorrencia[ocorrenciaId] = { rows, total, limit, offset, includeExcluidos, before }
                return this.byOcorrencia[ocorrenciaId]
            } catch (e) {
                this.error = e
                throw e
            } finally {
                this.loading = false
            }
        },

        async paginar(ocorrenciaId, { includeExcluidos = false, limit = 20, offset = 0, before = null } = {}) {
            this.loading = true
            this.error = null
            try {
                const { rows, total } = await svc.list(ocorrenciaId, { includeExcluidos, limit, offset, before })
                this.byOcorrencia[ocorrenciaId] = { rows, total, limit, offset, includeExcluidos, before }
                return this.byOcorrencia[ocorrenciaId]
            } catch (e) {
                this.error = e
                throw e
            } finally {
                this.loading = false
            }
        },

        async adicionar(ocorrenciaId, { comentario_user_id, comentario_texto, comentario_data = null } = {}) {
            this.saving = true
            this.error = null
            try {
                const created = await svc.create(ocorrenciaId, {
                    comentario_user_id,
                    comentario_texto,
                    ...(comentario_data ? { comentario_data } : {}),
                })
                const curr = this.byOcorrencia[ocorrenciaId] || {
                    rows: [],
                    total: 0,
                    limit: 20,
                    offset: 0,
                    includeExcluidos: false,
                    before: null,
                }
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
                    const idx = curr.rows.findIndex((r) => Number(r.comentario_id ?? r.id) === Number(id))
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

        async softRemover(ocorrenciaId, id) {
            this.saving = true
            this.error = null
            try {
                const updated = await svc.softDelete(id)
                const curr = this.byOcorrencia[ocorrenciaId]
                if (curr?.rows) {
                    const idx = curr.rows.findIndex((r) => Number(r.comentario_id ?? r.id) === Number(id))
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
                    curr.rows = curr.rows.filter((r) => Number(r.comentario_id ?? r.id) !== Number(id))
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
