// src/stores/ocorrenciaImagemStore.js
import { defineStore } from 'pinia'
import { ocorrenciaImagemService } from 'src/services/ocorrenciaImagemService'

export const useOcorrenciaImagemStore = defineStore('ocorrenciaImagem', {
  state: () => ({
    byOcorrencia: {}, // { [ocorrenciaId]: Array<{ ocorrencia_imagem_id, ocorrencia_imagem_url }> }
    loading: false,
    uploading: false,
    removing: false,
    error: null,
  }),

  getters: {
    list: (s) => (id) => s.byOcorrencia[id] || [],
  },

  actions: {
    async carregar(ocorrenciaId, { force = false } = {}) {
      if (!force && this.byOcorrencia[ocorrenciaId]) return this.byOcorrencia[ocorrenciaId]
      this.loading = true
      this.error = null
      try {
        const imagens = await ocorrenciaImagemService.list(ocorrenciaId)
        this.byOcorrencia[ocorrenciaId] = imagens
        return imagens
      } catch (e) {
        this.error = e
        throw e
      } finally {
        this.loading = false
      }
    },

    mergeLocal(ocorrenciaId, partialArray = []) {
      const curr = this.byOcorrencia[ocorrenciaId] || []
      this.byOcorrencia[ocorrenciaId] = Array.isArray(partialArray)
        ? [...curr, ...partialArray]
        : curr
      return this.byOcorrencia[ocorrenciaId]
    },

    async adicionar(ocorrenciaId, files = []) {
      this.uploading = true
      this.error = null
      try {
        const novas = await ocorrenciaImagemService.add(ocorrenciaId, files)
        const curr = this.byOcorrencia[ocorrenciaId] || []
        this.byOcorrencia[ocorrenciaId] = [...curr, ...novas]
        return novas
      } catch (e) {
        this.error = e
        throw e
      } finally {
        this.uploading = false
      }
    },

    async remover(ocorrenciaId, imagemId) {
      this.removing = true
      this.error = null
      try {
        await ocorrenciaImagemService.remove(ocorrenciaId, imagemId)
        const curr = this.byOcorrencia[ocorrenciaId] || []
        this.byOcorrencia[ocorrenciaId] = curr.filter(
          (i) => i.ocorrencia_imagem_id !== Number(imagemId),
        )
        return true
      } catch (e) {
        this.error = e
        throw e
      } finally {
        this.removing = false
      }
    },

    limpar(ocorrenciaId) {
      if (ocorrenciaId != null) delete this.byOcorrencia[ocorrenciaId]
      else this.byOcorrencia = {}
    },
  },
})
