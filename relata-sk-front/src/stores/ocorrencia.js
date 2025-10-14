import { defineStore } from 'pinia'
import { listOcorrencias, createOcorrenciaService } from 'src/services/ocorrenciaService'

export const useOcorrenciaStore = defineStore('ocorrencia', {
  state: () => ({
    itens: [],
    total: 0,
    loading: false,
    creating: false,
    error: null,
    ultimaCriada: null,
  }),
  actions: {
    async fetchLista(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data, total } = await listOcorrencias(params)
        this.itens = Array.isArray(data) ? data : []
        this.total = Number(total) || 0
      } catch (e) {
        this.error = e
        this.itens = []
        this.total = 0
        throw e
      } finally {
        this.loading = false
      }
    },
    async criarOcorrencia(data, isMultipart = false) {
      this.creating = true
      this.error = null
      try {
        const res = await createOcorrenciaService(data, isMultipart)
        this.ultimaCriada = res
        return res
      } catch (e) {
        this.error = e
        throw e
      } finally {
        this.creating = false
      }
    },
  },
})
