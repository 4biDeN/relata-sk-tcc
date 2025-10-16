import { api } from 'src/boot/axios'

export async function listOcorrencias(params = {}) {
  const { data, headers } = await api.get('/ocorrencias', { params })
  const total = Number(headers['x-total-count'] || 0)
  return { data: Array.isArray(data) ? data : [], total }
}

export function createOcorrenciaService(payload, isMultipart = false) {
  const config = {}
  if (isMultipart) {
    config.headers = { 'Content-Type': 'multipart/form-data' }
  }
  return api.post('/ocorrencias', payload, config).then((r) => r.data)
}

export const ocorrenciaService = {
  async getById(id) {
    const { data } = await api.get(`/ocorrencias/${id}`)
    return data
  },
}

export async function getOcorrenciasProximas(params) {
  const { data } = await api.get('/ocorrencias/nearby', { params })
  return Array.isArray(data) ? data : []
}

export async function updateOcorrenciaService(id, payload) {
  const { data } = await api.put(`/ocorrencias/${id}`, payload)
  return data
}

export async function uploadOcorrenciaImagem(id, file) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post(`/api/ocorrencias/${id}/imagens`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data
}

export async function deleteOcorrenciaImagem(id, imagemId) {
  const { data } = await api.delete(`/api/ocorrencias/${id}/imagens/${imagemId}`)
  return data
}
