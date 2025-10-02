<template>
  <q-page padding>
    <q-table :rows="rows" :columns="columns" row-key="ocorrencia_id" :loading="loading"
      :pagination="{ rowsPerPage: 10 }" :row-class="rowClass" @row-click="irDetalhe" class="cursor-pointer">
    <template #top>
      <div class="row items-center q-gutter-sm full-width">
        <q-input v-model="busca" dense placeholder="Buscar por título ou protocolo" @keyup.enter="carregar"
          class="col-12 col-sm-4" />
        <q-btn label="Buscar" @click="carregar" />
        <q-space />
        <q-btn to="/home/ocorrencias/nova" color="primary" label="Nova" />
      </div>
    </template>

    <template #body-cell-ocorrencia_data="props">
      <q-td :props="props">{{ props.row.ocorrencia_data_fmt }}</q-td>
    </template>
    <template #body-cell-ocorrencia_status_nome="props">
      <q-td :props="props">
        <q-badge :color="statusStyle(props.row.ocorrencia_status_nome).color"
          :text-color="statusStyle(props.row.ocorrencia_status_nome).text" class="q-px-sm q-py-xs">
          {{ props.row.ocorrencia_status_nome }}
        </q-badge>
      </q-td>
    </template>
    <template #body-cell-ocorrencia_anonima="props">
      <q-td :props="props">
        <q-chip size="sm" :color="props.row.ocorrencia_anonima ? 'grey-7' : 'positive'" text-color="white" outline>
          {{ props.row.ocorrencia_anonima ? 'Sim' : 'Não' }}
        </q-chip>
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width q-pa-lg text-center text-grey-6">
        Nenhuma ocorrência encontrada
      </div>
    </template>
    </q-table>
  </q-page>

</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOcorrenciaStore } from 'src/stores/ocorrencia'

const router = useRouter()
function irDetalhe(evt, row) {
  router.push(`/home/ocorrencias/${row.ocorrencia_id}`)
}

const store = useOcorrenciaStore()
const busca = ref('')

function formatDateISOToBR(v) {
  if (!v) return ''
  const d = new Date(v)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}

function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

const STATUS_STYLES = {
  'aberto': { color: 'orange-7', text: 'white', row: 'row-aberto' },
  'em analise': { color: 'indigo-7', text: 'white', row: 'row-analise' },
  'em andamento': { color: 'info', text: 'white', row: 'row-andamento' },
  'resolvido': { color: 'positive', text: 'white', row: 'row-resolvido' },
  'fechado': { color: 'green-8', text: 'white', row: 'row-fechado' }
}

function statusStyle(name) {
  const key = norm(name)
  return STATUS_STYLES[key] || { color: 'grey-6', text: 'white', row: 'row-default' }
}

function rowClass(row) {
  return statusStyle(row.ocorrencia_status_nome).row
}

const columns = [
  { name: 'ocorrencia_protocolo', label: 'Protocolo', field: 'ocorrencia_protocolo', align: 'left' },
  { name: 'ocorrencia_titulo', label: 'Título', field: 'ocorrencia_titulo', align: 'left' },
  { name: 'ocorrencia_data', label: 'Data', field: 'ocorrencia_data', align: 'left' },
  { name: 'ocorrencia_status_nome', label: 'Status', field: 'ocorrencia_status_nome', align: 'left' },
  { name: 'ocorrencia_anonima', label: 'Anônima', field: 'ocorrencia_anonima', align: 'center' }
]

const rawRows = computed(() => store.itens)
const rows = computed(() => rawRows.value.map(r => ({
  ...r,
  ocorrencia_data_fmt: formatDateISOToBR(r.ocorrencia_data)
})))

const loading = computed(() => store.loading)

async function carregar() {
  await store.fetchLista({ q: busca.value })
}

onMounted(carregar)

</script>
