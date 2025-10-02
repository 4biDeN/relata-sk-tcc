<template>
  <q-page class="q-pa-md">
    <q-stepper v-model="step" flat animated header-nav>
      <q-step :name="1" title="Detalhes" caption="Finalize os dados" :done="step > 1">
        <q-card flat bordered class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input v-model="form.ocorrencia_titulo" label="Título" dense :rules="[v => !!v || 'Informe o título']"
                @update:model-value="marcarEdit" />
            </div>
            <div class="col-12">
              <q-input v-model="form.ocorrencia_descricao" type="textarea" label="Descrição" autogrow
                :rules="[v => !!v || 'Informe a descrição']" @update:model-value="marcarEdit" />
            </div>
            <div class="col-12 col-sm-6">
              <q-select v-model="form.ocorrencia_prioridade" :options="optsPrioridade" label="Prioridade" dense
                emit-value map-options @update:model-value="marcarEdit" />
            </div>
            <div class="col-12 col-sm-6 flex items-center">
              <q-toggle v-model="form.ocorrencia_anonima" label="Registrar como anônima"
                @update:model-value="marcarEdit" />
            </div>
          </div>
        </q-card>
        <div class="row q-mt-md">
          <q-space />
          <q-btn color="primary" label="Próximo" :disable="!detalhesOk" @click="step = 2" />
        </div>
      </q-step>

      <q-step :name="2" title="Localização" caption="Selecione no mapa" :done="step > 2">
        <q-card flat bordered class="q-pa-md">
          <div class="map-section">
            <div ref="mapEl" :class="['leaflet-map', isMobile ? 'h-280' : 'h-420']"></div>
            <div class="row items-center q-gutter-sm q-mt-sm">
              <q-btn outline dense icon="my_location" label="Usar minha localização" @click="usarGeolocalizacao"
                :loading="gettingLocation" />
              <q-btn flat dense icon="refresh" label="Limpar seleção" @click="resetarLocal"
                :disable="estado === 'idle'" />
              <q-space />
              <q-badge v-if="estado === 'idle'">Selecione um ponto no mapa</q-badge>
              <q-badge v-else-if="estado === 'picked'" color="secondary">Endereço sugerido</q-badge>
              <q-badge v-else-if="estado === 'edited'" color="orange">Endereço ajustado</q-badge>
              <q-spinner-dots v-if="loadingGeocode" size="18px" color="primary" />
            </div>
          </div>
        </q-card>
        <div class="row q-mt-md">
          <q-btn flat label="Voltar" @click="step = 1" />
          <q-space />
          <q-btn color="primary" label="Próximo" :disable="!coordsOk" @click="step = 3" />
        </div>
      </q-step>

      <q-step :name="3" title="Endereço" caption="Confirme ou edite">
        <q-card flat bordered class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-3">
              <q-input v-model="form.local.local_estado" label="UF" dense maxlength="2"
                @update:model-value="marcarEdit" />
            </div>
            <div class="col-12 col-sm-9">
              <q-select v-model="form.local.local_municipio_id" v-model:input-value="municipioInput" label="Município"
                dense use-input clearable emit-value map-options input-debounce="300" :options="municipioOptions"
                :loading="municipioLoading" option-label="label" option-value="value"
                :rules="[v => v !== null || 'Selecione um município']" @filter="filtrarMunicipios"
                @update:model-value="onMunicipioSelecionado" @clear="() => onMunicipioSelecionado(null)" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.local.local_bairro" label="Bairro" dense
                :rules="[v => !!String(v || '').trim() || 'Informe o bairro']" @update:model-value="marcarEdit" />
            </div>

            <div class="col-12 col-sm-6">
              <q-input v-model="form.local.local_rua" label="Logradouro" dense
                :rules="[v => !!String(v || '').trim() || 'Informe o logradouro']" @update:model-value="marcarEdit" />
            </div>

            <div class="col-12">
              <q-input v-model="form.local.local_complemento" label="Complemento" dense
                @update:model-value="marcarEdit" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.local.local_latitude" label="Latitude" type="number" dense
                :rules="[v => v !== null || 'Informe a latitude']" @update:model-value="marcarEdit" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.local.local_longitude" label="Longitude" type="number" dense
                :rules="[v => v !== null || 'Informe a longitude']" @update:model-value="marcarEdit" />
            </div>
          </div>
        </q-card>
        <div class="row q-mt-md">
          <q-btn flat label="Voltar" @click="step = 2" />
          <q-space />
          <q-btn color="primary" :loading="creating" :disable="!podeSalvar" label="Enviar" @click="salvar" />
        </div>
      </q-step>
    </q-stepper>

    <q-page-sticky v-if="isMobile" position="bottom" expand class="bg-white q-px-md q-py-sm shadow-2">
      <div class="row items-center">
        <q-btn flat label="Voltar" :disable="step === 1" @click="step--" />
        <q-space />
        <q-btn v-if="step < 3" color="primary" label="Próximo"
          :disable="(step === 1 && !detalhesOk) || (step === 2 && !coordsOk)" @click="step++" />
        <q-btn v-else color="primary" :loading="creating" :disable="!podeSalvar" label="Enviar" @click="salvar" />
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { useOcorrenciaStore } from 'src/stores/ocorrencia'
import { useMunicipioStore } from 'src/stores/municipio'
import { resolverUF } from 'src/utils/geo/uf'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.sm)
const mapEl = ref(null)
const step = ref(1)
const coordsOk = computed(() => form.local.local_latitude !== null && form.local.local_longitude !== null)
const detalhesOk = computed(() =>
  !!String(form.ocorrencia_titulo || '').trim() &&
  !!String(form.ocorrencia_descricao || '').trim()
)

const store = useOcorrenciaStore()
const municipioStore = useMunicipioStore()
const router = useRouter()

const form = reactive({
  ocorrencia_user_id: null,
  ocorrencia_anonima: false,
  ocorrencia_titulo: '',
  ocorrencia_descricao: '',
  ocorrencia_prioridade: 2,
  local: {
    local_municipio_id: null,
    local_municipio_nome: '',
    local_estado: '',
    local_bairro: '',
    local_rua: '',
    local_complemento: '',
    local_latitude: null,
    local_longitude: null
  }
})

const optsPrioridade = [
  { label: 'Urgente', value: 4 },
  { label: 'Baixa', value: 3 },
  { label: 'Normal', value: 2 },
  { label: 'Alta', value: 1 }
]

const creating = computed(() => store.creating)
const podeSalvar = computed(() =>
  !!form.ocorrencia_titulo?.trim() &&
  !!form.ocorrencia_descricao?.trim() &&
  form.local.local_municipio_id !== null &&
  form.local.local_latitude !== null &&
  form.local.local_longitude !== null &&
  !!String(form.local.local_bairro || '').trim() &&
  !!String(form.local.local_rua || '').trim()
)


const formRef = ref(null)
const estado = ref('idle')
const loadingGeocode = ref(false)
const gettingLocation = ref(false)
const municipioInput = ref('')
const municipioOptions = ref([])
const municipioLoading = computed(() => municipioStore.loading)

let map = null
let marker = null
let updatingFromMap = false
let suppressEdit = false
let lastView = { lat: -26.9261, lng: -53.0045, zoom: 15 }

function initMap() {
  if (map || !mapEl.value) return

  const { local_latitude: lat, local_longitude: lng } = form.local
  const hasCoords = typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)
  const center = hasCoords ? [lat, lng] : [lastView.lat, lastView.lng]
  const zoom = hasCoords ? Math.max(lastView.zoom || 15, 14) : (lastView.zoom || 15)

  map = L.map(mapEl.value, { zoomControl: true }).setView(center, zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map)
  map.on('click', e => handleMapSelection(e.latlng.lat, e.latlng.lng))
  restoreMarkerFromForm()
  setTimeout(() => map?.invalidateSize(), 200)
}

function destroyMap() {
  if (!map) return
  saveMapState()
  map.off()
  map.remove()
  map = null
  marker = null
}

onMounted(async () => {
  if (step.value === 2) {
    await nextTick()
    initMap()
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.off()
    map.remove()
    map.null
  }
})

watch(step, async (val, oldVal) => {
  if (oldVal === 2 && val !== 2) {
    destroyMap()
  }
  if (val === 2) {
    await nextTick()
    initMap()
  }
})


function saveMapState() {
  if (!map) return
  const c = map.getCenter()
  lastView = { lat: c.lat, lng: c.lng, zoom: map.getZoom() }
}

function restoreMarkerFromForm() {
  const { local_latitude: lat, local_longitude: lng } = form.local
  const ok = typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)
  if (map && ok) {
    setMarker(lat, lng, true)
    map.setView([lat, lng], Math.max(lastView.zoom || 15, 14))
  } else if (map) {
    map.setView([lastView.lat, lastView.lng], lastView.zoom || 15)
  }
}


function setMarker(lat, lng, center = true) {
  if (!map) {
    return
  }

  if (!marker) {
    marker = L.marker([lat, lng]).addTo(map)
  } else {
    marker.setLatLng([lat, lng])
  }

  if (center) {
    const zoom = map.getZoom()
    map.setView([lat, lng], zoom < 14 ? 14 : zoom)
  }
}

async function handleMapSelection(lat, lng, center = true) {
  const normalizedLat = Number(lat.toFixed(6))
  const normalizedLng = Number(lng.toFixed(6))

  updatingFromMap = true
  suppressEdit = true

  form.local.local_latitude = normalizedLat
  form.local.local_longitude = normalizedLng
  setMarker(normalizedLat, normalizedLng, center)

  try {
    await reverseGeocode(normalizedLat, normalizedLng)
    estado.value = 'picked'
  } finally {
    await nextTick()
    updatingFromMap = false
    suppressEdit = false
  }
}

async function reverseGeocode(lat, lng) {
  loadingGeocode.value = true
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}&accept-language=pt-BR&email=relata@localhost`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Falha ao consultar servico de endereco')
    }

    const data = await response.json()
    const address = data.address || {}

    form.local.local_estado = resolverUF(address) || form.local.local_estado
    const cidade =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      ''
    if (cidade) {
      form.local.local_municipio_nome = cidade
      if (!form.local.local_municipio_id) {
        municipioInput.value = cidade
        await carregarMunicipios(cidade)
      }
    }
    form.local.local_bairro = address.neighbourhood || address.suburb || address.district || form.local.local_bairro
    form.local.local_rua =
      address.road ||
      address.residential ||
      address.pedestrian ||
      address.footway ||
      form.local.local_rua
    if (address.house_number) {
      form.local.local_complemento = address.house_number
    }
  } catch {
    Notify.create({
      type: 'warning',
      message: 'Nao foi possivel sugerir o endereco automaticamente. Ajuste manualmente.'
    })
  } finally {
    loadingGeocode.value = false
  }
}

function resetarLocal() {
  suppressEdit = true
  form.local.local_municipio_id = null
  form.local.local_municipio_nome = ''
  municipioInput.value = ''
  municipioStore.clearCache()
  form.local.local_estado = ''
  form.local.local_bairro = ''
  form.local.local_rua = ''
  form.local.local_complemento = ''
  form.local.local_latitude = null
  form.local.local_longitude = null
  if (marker && map) {
    map.removeLayer(marker)
    marker = null
  }
  estado.value = 'idle'
  nextTick(() => {
    suppressEdit = false
  })
}

function marcarEdit() {
  if (suppressEdit) {
    return
  }
  estado.value = 'edited'
}

async function carregarMunicipios(term = '') {
  try {
    const itens = await municipioStore.suggest(term)
    municipioOptions.value = itens.map(it => ({
      label: `${it.nome}${it.uf ? ' - ' + it.uf : ''}`,
      value: it.id,
      raw: it
    }))
  } catch {
    Notify.create({ type: 'warning', message: 'Falha ao buscar municipios.' })
  }
}

async function filtrarMunicipios(val, update, abort) {
  try {
    await carregarMunicipios(val)
    update(() => { })
  } catch {
    abort()
  }
}

function onMunicipioSelecionado(value) {
  if (!value) {
    form.local.local_municipio_id = null
    form.local.local_municipio_nome = ''
    municipioInput.value = ''
    marcarEdit()
    return
  }
  const opt = municipioOptions.value.find(o => o.value === value)
  if (opt) {
    municipioInput.value = opt.label
    form.local.local_municipio_nome = opt.raw.nome
    if (!form.local.local_estado && opt.raw.uf) {
      form.local.local_estado = opt.raw.uf
    }
  }
  marcarEdit()
}

watch(() => form.local.local_municipio_id, id => {
  if (!id) return
  const opt = municipioOptions.value.find(o => o.value === id)
  if (opt) {
    municipioInput.value = opt.label
    form.local.local_municipio_nome = opt.raw.nome
  }
})

function usarGeolocalizacao() {
  if (!navigator.geolocation) {
    Notify.create({ type: 'warning', message: 'Seu dispositivo nao suporta geolocalizacao.' })
    return
  }

  gettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords
      handleMapSelection(latitude, longitude)
      gettingLocation.value = false
    },
    () => {
      Notify.create({ type: 'warning', message: 'Nao foi possivel acessar a sua localizacao.' })
      gettingLocation.value = false
    },
    { enableHighAccuracy: true }
  )
}

watch(
  () => [form.local.local_latitude, form.local.local_longitude],
  ([lat, lng]) => {
    const latOk = typeof lat === 'number' && !Number.isNaN(lat)
    const lngOk = typeof lng === 'number' && !Number.isNaN(lng)

    if (!latOk || !lngOk) {
      if (marker && map) { map.removeLayer(marker); marker = null }
      return
    }

    if (map) {
      if (updatingFromMap) return
      setMarker(lat, lng, true)
      if (estado.value !== 'idle') estado.value = 'edited'
      return
    }
    lastView = { lat, lng, zoom: Math.max(lastView.zoom || 15, 14) }
  }
)


async function salvar() {
  const isValid = await formRef.value?.validate?.()
  if (isValid === false) {
    return
  }

  if (!podeSalvar.value) {
    Notify.create({ type: 'warning', message: 'Complete os dados obrigatorios antes de enviar.' })
    return
  }

  form.ocorrencia_user_id = Number(localStorage.getItem('user_id')) || null
  const payload = JSON.parse(JSON.stringify(form))
  if (payload.local) {
    delete payload.local.local_municipio_nome
    if (payload.local.local_municipio_id !== null) {
      payload.local.local_municipio_id = Number(payload.local.local_municipio_id)
    }
  }

  try {
    await store.criarOcorrencia(payload)
    Notify.create({ type: 'positive', message: 'Ocorrencia registrada com sucesso.' })
    router.push({ name: 'cliente.ocorrencias' })
  } catch {
    Notify.create({ type: 'negative', message: 'Nao foi possivel registrar a ocorrencia.' })
  }
}
</script>

<style scoped>
.map-section {
  display: flex;
  flex-direction: column;
}

.leaflet-map {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.h-420 {
  height: 420px;
}

.h-280 {
  height: 280px;
}

@media (max-width: 599px) {
  .q-stepper__header--standard {
    position: sticky;
    top: 0;
    z-index: 5;
    background: white;
  }
}
</style>
