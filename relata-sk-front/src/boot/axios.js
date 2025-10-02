import { boot } from 'quasar/wrappers'
import axios from 'axios'

axios.defaults.withCredentials = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token && token !== 'undefined') {
    cfg.headers.Authorization = `Bearer ${token}`
  } else if (cfg.headers?.Authorization) {
    delete cfg.headers.Authorization
  }
  return cfg
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { axios, api }
