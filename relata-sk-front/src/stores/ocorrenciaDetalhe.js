import { defineStore } from 'pinia'
import { ocorrenciaService, updateOcorrenciaService } from 'src/services/ocorrenciaService'

export const useOcorrenciaDetalheStore = defineStore('ocorrenciaDetalhe', {
  state: () => ({
    byId: {},
    loading: false,
    saving: false,
    error: null
  }),
  getters: {
    get: (s) => (id) => s.byId[id] || null
  },
  actions: {
    async carregar(id, { force = false } = {}) {
      if (!force && this.byId[id]) return this.byId[id]
      this.loading = true
      this.error = null
      try {
        const data = await ocorrenciaService.getById(id)
        this.byId[id] = data
        return data
      } catch (e) {
        this.error = e
        throw e
      } finally {
        this.loading = false
      }
    },
    mergeLocal(id, partial) {
      const curr = this.byId[id] || {}
      this.byId[id] = { ...curr, ...partial }
      return this.byId[id]
    },
    async atualizar(id, payload) {
      this.saving = true
      this.error = null
      try {
        const data = await updateOcorrenciaService(id, payload)
        this.byId[id] = data
        return data
      } catch (e) {
        this.error = e
        throw e
      } finally {
        this.saving = false
      }
    },
    limpar(id) {
      if (id) delete this.byId[id]
      else this.byId = {}
    }
  }
})
