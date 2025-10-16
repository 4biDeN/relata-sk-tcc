import { defineStore } from 'pinia'
import {
  listUsersService,
  getUserService,
  createUserService,
  updateUserService,
  deleteUserService,
} from 'src/services/usuariosService'

export const useUsuariosStore = defineStore('usuarios', {
  state: () => ({
    items: [],
    byId: {},
    loading: false,
    saving: false,
    error: null,
  }),
  getters: {
    list: (s) => s.items,
    get: (s) => (id) => s.byId[id] || null,
  },
  actions: {
    async listar(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await listUsersService(params)
        this.items = data || []
        this.byId = Object.fromEntries(this.items.map((u) => [u.user_id, u]))
        return this.items
      } finally {
        this.loading = false
      }
    },
    async carregar(id, { force = false } = {}) {
      if (!force && this.byId[id]) return this.byId[id]
      this.loading = true
      this.error = null
      try {
        const data = await getUserService(id)
        if (data) {
          this.byId[id] = data
          const i = this.items.findIndex((u) => u.user_id === data.user_id)
          if (i >= 0) this.items[i] = data
          else this.items.push(data)
        }
        return data
      } finally {
        this.loading = false
      }
    },
    async criar(payload) {
      this.saving = true
      this.error = null
      try {
        const data = await createUserService(payload)
        if (data) {
          this.byId[data.user_id] = data
          this.items.unshift(data)
        }
        return data
      } finally {
        this.saving = false
      }
    },
    async atualizar(id, payload) {
      this.saving = true
      this.error = null
      try {
        const body = { ...payload }
        delete body.user_documento
        await updateUserService(id, body)
        const data = await getUserService(id)
        if (data) {
          this.byId[id] = data
          const i = this.items.findIndex((u) => u.user_id === id)
          if (i >= 0) this.items[i] = data
        }
        return data
      } finally {
        this.saving = false
      }
    },
    async desativar(id) {
      this.saving = true
      this.error = null
      try {
        await deleteUserService(id)
        const i = this.items.findIndex((u) => u.user_id === id)
        if (i >= 0) this.items.splice(i, 1)
        delete this.byId[id]
      } finally {
        this.saving = false
      }
    },
  },
})
