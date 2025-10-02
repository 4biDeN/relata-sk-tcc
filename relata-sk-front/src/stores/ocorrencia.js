import { defineStore } from 'pinia'
import { listOcorrencias, createOcorrenciaService } from 'src/services/ocorrenciaService'

export const useOcorrenciaStore = defineStore('ocorrencia', {
  state: () => ({ itens: [], loading: false, error: null }),
  actions: {
    async fetchLista(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await listOcorrencias(params)
        this.itens = Array.isArray(data) ? data : []
      } catch (e) {
        this.error = e
        this.itens = []
        throw e
      } finally {
        this.loading = false
      }
    },
    async criarOcorrencia(data) {
      this.creating = true
      this.error = null
      try {
        const res = await createOcorrenciaService(data)
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

