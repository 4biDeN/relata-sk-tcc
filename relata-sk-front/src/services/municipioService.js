// service
import { api } from 'boot/axios'

export async function getMunicipioIdPorNome(nome) {
  const { data } = await api.get('/municipios/id-por-nome', { params: { nome } })
  return data.id
}

export async function sugerirMunicipios(nome) {
  const { data } = await api.get('/municipios/sugestoes', { params: { nome, limit: 15 } })
  return data?.itens || []
}
