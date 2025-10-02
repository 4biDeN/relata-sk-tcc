<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Área do Cliente</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item to="/home/ocorrencias" clickable v-ripple exact :active="$route.path === '/home/ocorrencias'">
          <q-item-section avatar><q-icon name="assignment" /></q-item-section>
          <q-item-section>Ocorrências</q-item-section>
        </q-item>

        <q-item to="/home/ocorrencias/nova" clickable v-ripple :active="$route.path.startsWith('/home/ocorrencias/nova')">
          <q-item-section avatar><q-icon name="add_circle" /></q-item-section>
          <q-item-section>Registrar Ocorrência</q-item-section>
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
const leftDrawerOpen = ref(true)
</script>
