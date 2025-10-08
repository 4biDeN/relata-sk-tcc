import { api } from 'src/boot/axios'

export function listOcorrencias(params = {}) {
  const userId = Number(localStorage.getItem('user_id'))
  if (!userId) throw new Error('Usuário não autenticado')
  return api.get(`/ocorrencias/user/${userId}`, { params }).then((r) => r.data || [])
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
