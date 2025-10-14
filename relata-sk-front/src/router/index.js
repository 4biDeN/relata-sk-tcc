import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // ===== Guard robusto contra loops =====
  const VALID_ROLES = [1, 2, 3, 4]
  const ADMIN_ROLES = [2, 3, 4]

  const toNumber = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : NaN
  }
  const isValidRole = (r) => VALID_ROLES.includes(r)

  const defaultPathForRole = (role) => {
    if (!isValidRole(role)) return '/login'         // <- Fallback seguro
    return ADMIN_ROLES.includes(role)
      ? '/admin/ocorrencias'
      : '/home/ocorrencias'
  }

  const clearSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_tipo')
  }

  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const role = toNumber(localStorage.getItem('user_tipo'))
    const hasValidRole = isValidRole(role)

    // 1) Rotas públicas (login/register/forgot)
    if (to.meta?.public) {
      if (token && hasValidRole) {
        const target = defaultPathForRole(role)
        if (to.path !== target) return next(target)
      }
      return next()
    }

    // 2) Demais rotas exigem autenticação
    if (!token) {
      return next({ name: 'login' })
    }

    // 3) Se o role é inválido (token sem papel válido), limpa sessão e volta pro login
    if (!hasValidRole) {
      clearSession()
      return next({ name: 'login' })
    }

    // 4) Se a rota exigir roles, validar permissão
    const required = to.meta?.roles
    if (Array.isArray(required) && required.length > 0 && !required.includes(role)) {
      const target = defaultPathForRole(role)
      if (to.path !== target) return next(target)
      // se já estamos na rota "alvo", segue para evitar loop
      return next()
    }

    return next()
  })
  // ===== Fim guard =====

  return Router
})
