import { api } from 'src/boot/axios'

export async function listOcorrenciaImagens(ocorrenciaId) {
  const { data } = await api.get(`/ocorrencias/${ocorrenciaId}/imagens`)
  return Array.isArray(data?.imagens) ? data.imagens : []
}

export async function addOcorrenciaImagens(ocorrenciaId, files = []) {
  const fd = new FormData()
  for (const f of files) {
    fd.append('files', f)
  }
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  }
  const { data } = await api.post(`/ocorrencias/${ocorrenciaId}/imagens`, fd, config)
  return Array.isArray(data?.imagens) ? data.imagens : []
}

export async function deleteOcorrenciaImagem(ocorrenciaId, imagemId) {
  await api.delete(`/ocorrencias/${ocorrenciaId}/imagens/${imagemId}`)
  return true
}

export const ocorrenciaImagemService = {
  list: listOcorrenciaImagens,
  add: addOcorrenciaImagens,
  remove: deleteOcorrenciaImagem,
}
