import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

function persistToken(token) {
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('token')
    delete api.defaults.headers.common.Authorization
  }
}

function persistUser(user) {
  if (user?.id) {
    localStorage.setItem('user_id', String(user.id))
  } else {
    localStorage.removeItem('user_id')
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const savedToken = localStorage.getItem('token')
    const token = savedToken && savedToken !== 'undefined' ? savedToken : null
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    }

    return {
      user: null,
      token
    }
  },
  getters: {
    isAuth: state => !!state.token
  },
  actions: {
    async login({ documento, password }) {
      const { data } = await api.post('/login', {
        user_documento: documento,
        user_password: password
      })

      this.user = data?.user || null
      persistUser(this.user)

      const tokenFromApi = data?.token
      this.token = tokenFromApi ?? this.token ?? null

      if (this.token) {
        persistToken(this.token)
      } else {
        persistToken(null)
      }
    },
    async createUser(payload) {
      const { data } = await api.post('/user', payload)
      return data
    },
    async forgot(identifier) {
      await api.post('/auth/forgot-password', identifier)
    },
    logout() {
      this.user = null
      this.token = null
      persistToken(null)
      persistUser(null)
    }
  }
})
