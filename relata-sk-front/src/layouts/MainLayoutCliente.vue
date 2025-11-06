<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated class="bg-green-9 text-white">
            <q-toolbar>
                <q-btn flat dense round icon="menu" @click="toggleDrawer" class="text-white" />
                <q-toolbar-title class="row items-center no-wrap">
                    <q-icon name="place" size="22px" class="q-mr-sm" />
                    <span class="page-title">{{ activeLabel }}</span>
                </q-toolbar-title>

                <q-btn flat dense round icon="notifications" class="text-white q-mr-xs"
                    @click="router.push('/home/notificacoes')">
                    <q-badge v-if="unread > 0" floating color="red" rounded>{{ unread }}</q-badge>
                </q-btn>

                <q-btn flat dense icon="logout" label="Sair" class="q-ml-md text-white" @click="logout" />
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" :mini="miniState" :breakpoint="$q.screen.sizes.md" :width="260"
            :mini-width="64" bordered class="bg-grey-1" show-if-above>
            <q-list padding>
                <q-item to="/home/ocorrencias" clickable v-ripple exact :active="$route.path === '/home/ocorrencias'"
                    active-class="item-active">
                    <q-item-section avatar><q-icon name="assignment" /></q-item-section>
                    <q-item-section>Ocorrências</q-item-section>
                </q-item>

                <q-item to="/home/ocorrencias/nova" clickable v-ripple
                    :active="$route.path.startsWith('/home/ocorrencias/nova')" active-class="item-active">
                    <q-item-section avatar><q-icon name="add_circle" /></q-item-section>
                    <q-item-section>Registrar Ocorrência</q-item-section>
                </q-item>

                <q-separator spaced />

                <q-item to="/home/ocorrencias/perto" clickable v-ripple
                    :active="$route.path.startsWith('/home/ocorrencias/perto')" active-class="item-active">
                    <q-item-section avatar><q-icon name="my_location" /></q-item-section>
                    <q-item-section>Ocorrências Próximas</q-item-section>
                </q-item>

                <q-item to="/home/notificacoes" clickable v-ripple
                    :active="$route.path.startsWith('/home/notificacoes')" active-class="item-active">
                    <q-item-section avatar class="relative-position">
                        <q-icon name="notifications" />
                        <q-badge v-if="unread > 0" color="red" floating rounded class="q-mt-xs">{{ unread }}</q-badge>
                    </q-item-section>
                    <q-item-section>Notificações</q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, Notify } from 'quasar'
import { useNotificacaoStore } from 'src/stores/notifications'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const leftDrawerOpen = ref($q.screen.gt.sm)
const miniState = ref($q.screen.gt.md)

const store = useNotificacaoStore()
const unread = computed(() => store.unreadCount)

const activeLabel = computed(() => {
    const p = route.path || ''
    if (p.startsWith('/home/notificacoes')) return 'Notificações'
    if (p.startsWith('/home/ocorrencias/nova')) return 'Registrar Ocorrência'
    if (p.startsWith('/home/ocorrencias/perto')) return 'Ocorrências próximas'
    if (p.startsWith('/home/ocorrencias')) return 'Ocorrências'
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
    Notify.create({ type: 'positive', message: 'Sessão encerrada com sucesso.' })
    router.push('/login')
}

let intervalId = null
onMounted(async () => {
    try {
        await store.atualizarUnread({ canal: 'in_app' })
    } catch (err) {
        console.warn('Falha ao atualizar notificações:', err)
    }

    intervalId = setInterval(() => {
        store.atualizarUnread({ canal: 'in_app' }).catch((err) => {
            console.warn('Falha ao atualizar notificações:', err)
        })
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
