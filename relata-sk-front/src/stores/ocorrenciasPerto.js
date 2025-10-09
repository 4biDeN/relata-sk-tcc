import { defineStore } from 'pinia'
import { getOcorrenciasProximas } from 'src/services/ocorrenciaService'

export const useOcorrenciasPertoStore = defineStore('ocorrenciasPerto', {
  state: () => ({
    rows: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchNearby(params) {
      this.loading = true
      this.error = null
      try {
        const list = await getOcorrenciasProximas(params)
        this.rows = (Array.isArray(list) ? list : []).map((r) => ({
          ...r,
          local_latitude: Number(r.local_latitude),
          local_longitude: Number(r.local_longitude),
          distance_km: r.distance_km != null ? Number(r.distance_km) : NaN,
          imagens_count: r.imagens_count != null ? Number(r.imagens_count) : 0,
        }))
        return list
      } catch (e) {
        this.error = e
        this.rows = []
        throw e
      } finally {
        this.loading = false
      }
    },
    clear() {
      this.rows = []
      this.error = null
    },
  },
})
