import { api } from './axios'
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token') || ''
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
