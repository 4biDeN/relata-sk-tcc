<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated class="bg-green-9 text-white">
            <q-toolbar>
                <q-btn flat dense round icon="menu" @click="toggleDrawer" class="text-white" />
                <q-toolbar-title class="row items-center no-wrap">
                    <q-icon name="admin_panel_settings" size="22px" class="q-mr-sm" />
                    <span class="app-title">Admin • Saudades/SC</span>
                    <span class="title-sep"> - </span>
                    <span class="page-title">{{ activeLabel }}</span>
                </q-toolbar-title>
                <q-btn flat dense round icon="notifications" class="text-white q-mr-xs"
                    @click="router.push('/admin/notificacoes')">
                    <q-badge v-if="unread > 0" floating color="red" rounded>{{ unread }}</q-badge>
                </q-btn>
                <q-btn flat dense icon="logout" label="Sair" class="q-ml-md text-white" @click="logout" />
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" :mini="miniState" :breakpoint="$q.screen.sizes.md" :width="260"
            :mini-width="64" bordered class="bg-grey-1" show-if-above>
            <q-list padding>
                <q-item to="/admin/dashboard" clickable v-ripple exact :active="$route.path === '/admin'"
                    active-class="item-active">
                    <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
                    <q-item-section>Dashboard</q-item-section>
                </q-item>

                <q-item to="/admin/ocorrencias" clickable v-ripple
                    :active="$route.path.startsWith('/admin/ocorrencias')" active-class="item-active">
                    <q-item-section avatar><q-icon name="assignment" /></q-item-section>
                    <q-item-section>Ocorrências</q-item-section>
                </q-item>

                <q-item to="/admin/mapaocorrencias" clickable v-ripple
                    :active="$route.path.startsWith('/admin/mapaocorrencias')" active-class="item-active">
                    <q-item-section avatar><q-icon name="location_on" /></q-item-section>
                    <q-item-section>Mapa de Ocorrências</q-item-section>
                </q-item>

                <q-item v-if="isAdmin" to="/admin/usuarios" clickable v-ripple
                    :active="$route.path.startsWith('/admin/usuarios')" active-class="item-active">
                    <q-item-section avatar><q-icon name="group" /></q-item-section>
                    <q-item-section>Usuários</q-item-section>
                </q-item> 

                <q-separator spaced />

                <q-item to="/admin/notificacoes" clickable v-ripple
                    :active="$route.path.startsWith('/admin/notificacoes')" active-class="item-active">
                    <q-item-section avatar class="relative-position">
                        <q-icon name="notifications" />
                        <q-badge v-if="unread > 0" color="red" floating rounded class="q-mt-xs">{{ unread }}</q-badge>
                    </q-item-section>
                    <q-item-section>Notificações</q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view :key="$route.fullPath" />
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, Notify } from 'quasar'
import { useNotificacaoStore } from 'src/stores/notifications'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const leftDrawerOpen = ref($q.screen.gt.sm)
const miniState = ref($q.screen.gt.md)

const store = useNotificacaoStore()
const unread = computed(() => store.unreadCount)

const auth = useAuthStore()
const userRole = computed(() =>
    Number(auth.user?.tipo) ||
    Number(localStorage.getItem('user_tipo'))
)
const isAdmin = computed(() => userRole.value === 2)

const activeLabel = computed(() => {
    const p = route.path || ''
    if (p.startsWith('/admin/dashboard')) return 'Dashboard'
    if (p.startsWith('/admin/notificacoes')) return 'Notificações'
    if (p.startsWith('/admin/ocorrencias')) return 'Ocorrências'
    if (p.startsWith('/admin/usuarios')) return 'Usuários'
    if (p === '/admin') return 'Dashboard'
    return ''
})

function toggleDrawer() {
    if ($q.screen.lt.md) leftDrawerOpen.value = !leftDrawerOpen.value
    else miniState.value = !miniState.value
}

function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_tipo')
    Notify.create({ type: 'positive', message: 'Sessão encerrada.' })
    router.push('/login')
}

let intervalId = null
onMounted(async () => {
    try { await store.carregar({ force: true }) } catch (err) { console.warn('load notif fail:', err) }
    try { await store.atualizarUnread({ canal: 'in_app' }) } catch (err) { console.warn('unread fail:', err) }
    intervalId = setInterval(() => {
        store.atualizarUnread({ canal: 'in_app' }).catch((err) => console.warn('unread fail:', err))
    }, 30000)
})
onBeforeUnmount(() => { if (intervalId) clearInterval(intervalId) })
</script>

<style scoped>
.app-title,
.page-title {
    font-weight: 600;
    font-size: 18px;
    line-height: 1;
}

.title-sep {
    margin: 0 6px;
    opacity: .9;
}

.item-active {
    background: #1b5e20 !important;
    color: #fff !important;
}

.item-active .q-icon {
    color: #fff !important;
}
</style>
