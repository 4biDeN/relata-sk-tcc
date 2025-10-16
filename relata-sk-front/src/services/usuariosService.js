import { api } from 'src/boot/axios'

export async function listUsersService(params = {}) {
  const { data } = await api.get('/users', { params })
  return data
}

export async function getUserService(id) {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export async function createUserService(payload) {
  const { data } = await api.post('/user', payload)
  return data
}

export async function updateUserService(id, payload) {
  const body = { ...payload }
  delete body.user_documento
  const { data } = await api.put(`/user/${id}`, body)
  return data
}

export async function deleteUserService(id) {
  const { data } = await api.delete(`/user/${id}`)
  return data
}
