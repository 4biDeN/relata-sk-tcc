import { api } from 'src/boot/axios'

export function listOcorrencias(params = {}) {
  const userId = Number(localStorage.getItem('user_id'))
  if (!userId) throw new Error('Usuário não autenticado')
  return api.get(`/ocorrencias/user/${userId}`, { params }).then((r) => r.data || [])
}

export function createOcorrenciaService(payload) {
  return api.post('/ocorrencias', payload).then((r) => r.data)
}

export const ocorrenciaService = {
  async getById(id) {
    const { data } = await api.get(`/ocorrencias/${id}`)
    return data
  }
}