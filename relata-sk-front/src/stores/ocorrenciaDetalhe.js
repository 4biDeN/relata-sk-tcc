import { defineStore } from 'pinia'
import { ocorrenciaService } from 'src/services/ocorrenciaService'

export const useOcorrenciaDetalheStore = defineStore('ocorrenciaDetalhe', {
  state: () => ({
    byId: {},
    loading: false,
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
    limpar(id) {
      if (id) delete this.byId[id]
      else this.byId = {}
    }
  }
})
