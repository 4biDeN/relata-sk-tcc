<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated class="bg-green-9 text-white">
            <q-toolbar>
                <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" class="text-white" />
                <q-toolbar-title class="row items-center q-gutter-sm">
                    <q-icon name="admin_panel_settings" size="22px" class="q-mr-xs" />
                    <span>Admin • Saudades/SC</span>
                </q-toolbar-title>
                <q-btn flat dense icon="logout" label="Sair" class="q-ml-md text-white" @click="logout" />
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
            <q-list padding>
                <q-item to="/admin" clickable v-ripple exact :active="$route.path === '/admin'"
                    active-class="item-active">
                    <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
                    <q-item-section>Dashboard</q-item-section>
                </q-item>

                <q-item to="/admin/ocorrencias" clickable v-ripple
                    :active="$route.path.startsWith('/admin/ocorrencias')" active-class="item-active">
                    <q-item-section avatar><q-icon name="assignment" /></q-item-section>
                    <q-item-section>Ocorrências</q-item-section>
                </q-item>

                <q-item to="/admin/setores" clickable v-ripple :active="$route.path.startsWith('/admin/setores')"
                    active-class="item-active">
                    <q-item-section avatar><q-icon name="apartment" /></q-item-section>
                    <q-item-section>Setores</q-item-section>
                </q-item>

                <q-item to="/admin/usuarios" clickable v-ripple :active="$route.path.startsWith('/admin/usuarios')"
                    active-class="item-active">
                    <q-item-section avatar><q-icon name="group" /></q-item-section>
                    <q-item-section>Usuários</q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'

const leftDrawerOpen = ref(true)
const router = useRouter()

function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_tipo')
    Notify.create({ type: 'positive', message: 'Sessão encerrada.' })
    router.push('/login')
}
</script>

<style scoped>
.item-active {
    background: rgba(0, 121, 52, 0.08);
    border-left: 3px solid #1b5e20;
}
</style>
