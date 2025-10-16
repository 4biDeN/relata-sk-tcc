<template>
  <q-page padding>
    <q-table :rows="filteredRows" :columns="columns" row-key="ocorrencia_id" :loading="loading"
      :pagination="{ rowsPerPage: 10 }" :rows-per-page-options="[10, 20, 50, 100]" :row-class="rowClass"
      @row-click="irDetalhe" class="cursor-pointer">
      <template #top>
        <div class="filters-wrap">
          <div class="filters">
            <q-input v-model="busca" dense placeholder="Buscar por título ou protocolo" @keyup.enter="carregar" />
            <q-select v-model="statusSel" :options="statusOptions" label="Status" dense emit-value map-options
              clearable />
            <q-input v-model="fromDisplay" label="De" dense class="col-6 col-sm-2" clearable readonly>
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="fromProxy" transition-show="scale" transition-hide="scale" anchor="bottom right"
                    self="top right">
                    <q-date v-model="from" mask="YYYY-MM-DD" minimal :locale="ptBR" @update:model-value="onPickFrom" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input v-model="toDisplay" label="Até" dense class="col-6 col-sm-2" clearable readonly>
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="toProxy" transition-show="scale" transition-hide="scale" anchor="bottom right"
                    self="top right">
                    <q-date v-model="to" mask="YYYY-MM-DD" minimal :locale="ptBR" @update:model-value="onPickTo" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-select v-model="anonSel" :options="anonOptions" label="Anonímia" dense emit-value map-options
              clearable />
            <q-toggle v-model="onlyWithImages" label="Somente com imagens" />
            <div class="filters__action">
              <div class="filters__action">
                <q-btn label="Buscar" color="green-9" @click="carregar" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #body-cell-thumb="props">
        <q-td :props="props" style="width: 72px">
          <q-avatar square size="56px">
            <q-img :src="props.row.thumbnail_url" v-if="props.row.thumbnail_url" ratio="1" />
            <q-icon v-else name="image_not_supported" size="32px" class="text-grey-5" />
          </q-avatar>
        </q-td>
      </template>

      <template #body-cell-ocorrencia_titulo="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <div class="text-weight-medium ellipsis">{{ props.row.ocorrencia_titulo }}</div>
            <q-badge v-if="props.row.imagens_count" class="q-ml-sm" color="grey-7" text-color="white">
              {{ props.row.imagens_count }}
            </q-badge>
          </div>
          <div class="text-caption text-grey-7 ellipsis">
            Protocolo: {{ props.row.ocorrencia_protocolo }}
          </div>
        </q-td>
      </template>

      <template #body-cell-ocorrencia_data="props">
        <q-td :props="props">{{ props.row.ocorrencia_data_fmt }}</q-td>
      </template>

      <template #body-cell-ocorrencia_status_nome="props">
        <q-td :props="props">
          <q-badge :color="props.row.status_color" text-color="white" class="q-px-sm q-py-xs">
            {{ props.row.status_label }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-ocorrencia_atribuida="props">
        <q-td :props="props">
          <q-chip dense square :color="props.row.atrib_color" text-color="white" class="q-px-sm q-py-xs">
            {{ props.row.atrib_label }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-ocorrencia_anonima="props">
        <q-td :props="props">
          <q-chip size="sm" :color="props.row.anon_bool ? 'grey-7' : 'positive'" text-color="white" outline>
            {{ props.row.anon_bool ? 'Sim' : 'Não' }}
          </q-chip>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width q-pa-lg text-center text-grey-6">Nenhuma ocorrência encontrada</div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOcorrenciaStore } from 'src/stores/ocorrencia'

const router = useRouter()
function irDetalhe(evt, row) {
  router.push(`/home/ocorrencias/${row.ocorrencia_id}`)
}

const store = useOcorrenciaStore()
const busca = ref('')
const statusSel = ref(null)
const from = ref('')
const to = ref('')
const onlyWithImages = ref(false)
const anonSel = ref(null)
const anonOptions = [
  { label: 'Todas', value: null },
  { label: 'Somente anônimas', value: true },
  { label: 'Somente não anônimas', value: false },
]
const fromProxy = ref(null)
const toProxy = ref(null)

const ptBR = {
  days: 'domingo_segunda-feira_terca-feira_quarta-feira_quinta-feira_sexta-feira_sabado'.split('_'),
  daysShort: 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
  months:
    'janeiro_fevereiro_marco_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split(
      '_',
    ),
  monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
  firstDayOfWeek: 1,
}

function onPickFrom() {
  fromProxy.value?.hide()
}
function onPickTo() {
  toProxy.value?.hide()
}

function toBR(ymd) {
  if (!ymd) return ''
  const [Y, M, D] = ymd.split('-')
  if (!Y || !M || !D) return ''
  return `${D.padStart(2, '0')}/${M.padStart(2, '0')}/${Y}`
}
function toYMD(br) {
  if (!br) return ''
  const m = br.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return ''
  const D = m[1].padStart(2, '0')
  const M = m[2].padStart(2, '0')
  const Y = m[3]
  return `${Y}-${M}-${D}`
}

const fromDisplay = computed({
  get: () => toBR(from.value),
  set: (v) => {
    from.value = toYMD(v)
  },
})
const toDisplay = computed({
  get: () => toBR(to.value),
  set: (v) => {
    to.value = toYMD(v)
  },
})

watch([from, to], ([f, t]) => {
  if (f && t && new Date(f) > new Date(t)) {
    const tmp = from.value
    from.value = to.value
    to.value = tmp
  }
})

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

const STATUS_META = {
  1: { label: 'Aberto', color: 'orange-7', row: 'row-aberto' },
  2: { label: 'Em análise', color: 'indigo-7', row: 'row-analise' },
  3: { label: 'Em andamento', color: 'info', row: 'row-andamento' },
  4: { label: 'Resolvido', color: 'positive', row: 'row-resolvido' },
  5: { label: 'Fechado', color: 'green-8', row: 'row-fechado' },
}

const ATRIB_META = {
  1: { label: 'Cidadão', color: 'grey-7' },
  2: { label: 'Administrador', color: 'primary' },
  3: { label: 'DMER', color: 'deep-purple-6' },
  4: { label: 'DOSU', color: 'teal-6' },
}

const statusOptions = Object.entries(STATUS_META).map(([id, m]) => ({
  label: m.label,
  value: Number(id),
}))

function rowClass(row) {
  return row.status_row || 'row-default'
}

const columns = [
  { name: 'thumb', label: '', field: 'thumbnail_url', align: 'left' },
  {
    name: 'ocorrencia_titulo',
    label: 'Título / Protocolo',
    field: 'ocorrencia_titulo',
    align: 'left',
    classes: 'max-w-300',
  },
  { name: 'ocorrencia_data', label: 'Data', field: 'ocorrencia_data', align: 'left' },
  {
    name: 'ocorrencia_status_nome',
    label: 'Status',
    field: 'ocorrencia_status_nome',
    align: 'left',
  },
  {
    name: 'ocorrencia_atribuida',
    label: 'Atribuída',
    field: 'ocorrencia_atribuida',
    align: 'left',
  },
  { name: 'ocorrencia_anonima', label: 'Anônima', field: 'ocorrencia_anonima', align: 'center' },
]

const rawRows = computed(() => store.itens)

const rows = computed(() =>
  rawRows.value.map((r) => {
    const status_id = Number(r.ocorrencia_status_id ?? r.ocorrencia_status ?? 0)
    const meta = STATUS_META[status_id] || { label: '—', color: 'grey-6', row: 'row-default' }
    const atrib_id = Number(r.ocorrencia_atribuida ?? 0)
    const atrib = ATRIB_META[atrib_id] || { label: '—', color: 'grey-6' }
    const anon_bool =
      r.ocorrencia_anonima === true ||
      r.ocorrencia_anonima === 1 ||
      r.ocorrencia_anonima === '1' ||
      String(r.ocorrencia_anonima).toLowerCase() === 'true'

    return {
      ...r,
      imagens_count: Number(r.imagens_count ?? 0),
      ocorrencia_data_fmt: formatDateISOToBR(r.ocorrencia_data),
      status_id,
      status_label: meta.label,
      status_color: meta.color,
      status_row: meta.row,
      atrib_id,
      atrib_label: atrib.label,
      atrib_color: atrib.color,
      anon_bool,
    }
  }),
)

const filteredRows = computed(() => {
  const q = norm(busca.value)
  const s = statusSel.value != null ? Number(statusSel.value) : null
  const dFrom = from.value ? new Date(from.value + 'T00:00:00') : null
  const dTo = to.value ? new Date(to.value + 'T23:59:59') : null
  const withImgs = !!onlyWithImages.value
  const anon = anonSel.value

  return rows.value.filter((r) => {
    if (q) {
      const inTitle = norm(r.ocorrencia_titulo).includes(q)
      const inProto = norm(r.ocorrencia_protocolo).includes(q)
      if (!inTitle && !inProto) return false
    }
    if (s != null && r.status_id !== s) return false
    if (dFrom || dTo) {
      const d = new Date(r.ocorrencia_data)
      if (dFrom && d < dFrom) return false
      if (dTo && d > dTo) return false
    }
    if (withImgs && (!r.imagens_count || r.imagens_count < 1)) return false
    if (anon !== null && r.anon_bool !== anon) return false
    return true
  })
})

const loading = computed(() => store.loading)

async function carregar() {
  await store.fetchLista({})
}

onMounted(carregar)
</script>

<style scoped>
.max-w-300 {
  max-width: 300px;
}

.filters-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 12px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
  max-width: 1100px;
}

.filters>*:not(.filters__action) {
  flex: 1 1 220px;
  min-width: 180px;
}

.filters__action {
  order: 99;
  margin-left: auto;
  flex: 0 0 200px;
  display: flex;
  justify-content: flex-end;
}

.filters__action .q-btn {
  height: 40px;
  padding: 0 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 900px) {
  .filters>*:not(.filters__action) {
    flex: 1 1 48%;
  }

  .filters__action {
    flex: 1 0 100%;
    margin-left: 0;
    justify-content: stretch;
  }

  .filters__action .q-btn {
    width: 100%;
  }
}

.filter-date {
  cursor: pointer;
}

.filter-date :deep(.q-field__inner) {
  cursor: pointer;
}

.filter-date :deep(.q-field__control) {
  border-radius: 10px;
}

.filters__action .q-btn {
  height: 40px;
  padding: 0 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: white;
}
</style>
