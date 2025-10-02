import { defineStore } from 'pinia'
import { getMunicipioIdPorNome, sugerirMunicipios } from 'src/services/municipioService'

function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
}

export const useMunicipioStore = defineStore('municipios', {
  state: () => ({
    cache: {},
    loading: false,
    error: null
  }),
  actions: {
    async getIdByNome(nome = '') {
      const key = norm(nome)
      if (!key) return null
      if (this.cache[key] !== undefined) return this.cache[key]

      this.loading = true
      this.error = null
      try {
        const id = await getMunicipioIdPorNome(nome)
        this.cache[key] = id ?? null
        return this.cache[key]
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async suggest(nome = '') {
      const term = String(nome || '').trim()
      if (!term) return []
      this.loading = true; this.error = null
      try {
        const lista = await sugerirMunicipios(term)
        return Array.isArray(lista) ? lista : []
      } catch (e) {
        this.error = e; throw e
      } finally {
        this.loading = false
      }
    },
    clearCache() {
      this.cache = {}
    }
  }
})
