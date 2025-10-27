import { boot } from 'quasar/wrappers'
import { io } from 'socket.io-client'
import { jwtDecode } from 'jwt-decode'
import { useNotificationsStore } from 'src/stores/notifications'
import { Notify } from 'quasar'

function safeUserId() {
    const token = localStorage.getItem('token')
    if (token && token !== 'undefined') {
        const parts = token.split('.')
        if (parts.length === 3) {
            try {
                const p = jwtDecode(token)
                const v = p?.user_id ?? p?.id ?? p?.sub
                if (v != null) return Number.isFinite(Number(v)) ? Number(v) : String(v)
            } catch {
                return null
            }
        }
    }
    const uid = localStorage.getItem('user_id')
    if (uid != null && uid !== '' && uid !== 'undefined') {
        return Number.isFinite(Number(uid)) ? Number(uid) : String(uid)
    }
    return null
}

export default boot(({ app, router }) => {
    const store = useNotificationsStore()

    const uid = safeUserId()
    if (uid != null && store?.setAuthUserId) store.setAuthUserId(uid)

    const baseUrl = import.meta.env.VITE_WS_URL || window.location.origin
    const socket = io(baseUrl, {
        path: '/socket.io',
        auth: uid != null ? { userId: uid } : undefined,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000
    })

    socket.on('notification:new', (n) => {
        store.prepend({
            id: n.id || n.notificacao_id,
            title: n.title,
            body: n.body,
            actionUrl: n.actionUrl,
            created_at: n.created_at
        })
        Notify.create({
            message: n.title,
            caption: n.body,
            color: 'green-7',
            position: 'top-right',
            actions: n.actionUrl ? [{ label: 'Abrir', color: 'white', handler: () => router.push(n.actionUrl) }] : []
        })
    })

    app.provide('socket', socket)
})
