import { defineStore } from 'pinia'
import {
    apiListNotifs,
    apiUnreadCount,
    apiMarkRead,
    apiMarkAllRead
} from 'src/services/notificationsService'

export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        items: [],
        nextCursor: null,
        unread: 0,
        authUserId: null
    }),

    getters: {
        unreadCount: (s) => s.unread,
        list: (s) => s.items,
        hasMore: (s) => !!s.nextCursor
    },

    actions: {
        setAuthUserId(id) { this.authUserId = id },

        prepend(n) {
            const created_at = n.created_at instanceof Date ? n.created_at : (n.created_at ? new Date(n.created_at) : new Date())
            const id = n.id ?? n.notificacao_id
            this.items.unshift({ ...n, id, created_at })
            this.unread = Math.max(0, this.unread + 1)
        },

        async fetchInitial(params = {}) {
            this.items = []
            this.nextCursor = null

            const { rows, nextCursor } = await apiListNotifs({ limit: 20, ...params })
            this.items = rows
            this.nextCursor = nextCursor

            this.unread = await apiUnreadCount(params?.canal || 'in_app')

            console.log('[store.fetchInitial] items=', this.items.length, 'nextCursor=', this.nextCursor)
        },

        async fetchMore(params = {}) {
            if (!this.nextCursor) return 0
            const { rows, nextCursor } = await apiListNotifs({
                cursor: this.nextCursor,
                limit: 20,
                ...params
            })
            this.items.push(...rows)
            this.nextCursor = nextCursor
            return rows.length
        },

        async markRead(id) {
            await apiMarkRead(id)
            const it = this.items.find(n => n.id === Number(id))
            if (it) it.status = 'read'
            this.unread = Math.max(0, this.unread - 1)
            return true
        },

        async markAllRead() {
            await apiMarkAllRead('in_app')
            this.items.forEach(n => { if (n.status !== 'read') n.status = 'read' })
            this.unread = 0
            return true
        },

        async atualizarUnread({ canal = 'in_app' } = {}) {
            this.unread = await apiUnreadCount(canal)
        },

        async carregar(params = {}) { return this.fetchInitial(params) },
        async carregarMais(params = {}) { return this.fetchMore(params) },
        async marcarTodasComoLidas() { return this.markAllRead() },
        async marcarComoLida(id) { return this.markRead(id) }
    }
})

export const useNotificacaoStore = useNotificationsStore
