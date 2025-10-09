<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-3">
            <div class="text-caption text-grey-7 q-mb-xs">Raio (km)</div>
            <q-slider v-model="radiusKm" :min="0.5" :max="20" :step="0.5" label switch-label-side
              :label-value="`${radiusKm} km`" />
          </div>

          <div class="col-6 col-md-3">
            <q-select v-model="statusSel" :options="statusOptions" label="Status" dense clearable emit-value
              map-options />
          </div>

          <div class="col-6 col-md-3">
            <q-select v-model="prioridadeSel" :options="prioridadeOptions" label="Prioridade" dense clearable emit-value
              map-options />
          </div>

          <div class="col-12 col-md-3">
            <q-toggle v-model="onlyWithImages" label="Somente com imagens" />
          </div>

          <div class="col-12 col-md-6">
            <q-btn color="primary" icon="my_location"
              :label="hasUserPos ? 'Atualizar posição' : 'Usar minha localização'" :loading="gettingLocation"
              @click="usarMinhaLocalizacao" />
            <q-btn flat icon="refresh" label="Atualizar resultados" class="q-ml-sm" @click="carregar" />
          </div>

          <div class="col-12 col-md-6 text-right">
            <q-badge color="grey-8" text-color="white">
              {{ rows.length }} resultado(s)
            </q-badge>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-lg-7">
            <div class="text-bold text-grey-7 q-mb-xs">Mapa</div>
            <div class="leaflet-wrap">
              <div ref="mapEl" class="leaflet-map"></div>
              <div v-if="!hasUserPos" class="empty-overlay column items-center justify-center">
                <q-icon name="my_location" size="36px" class="text-grey-6 q-mb-sm" />
                <div class="text-grey-7 q-mb-sm">Ative sua localização para ver ocorrências próximas</div>
                <q-btn color="primary" label="Ativar localização" @click="usarMinhaLocalizacao"
                  :loading="gettingLocation" />
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-5">
            <div class="text-bold text-grey-7 q-mb-xs">Resultados</div>
            <q-list bordered class="rounded-borders">
              <template v-if="loading">
                <q-item>
                  <q-item-section>
                    <q-skeleton type="rect" height="60px" />
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-skeleton type="rect" height="60px" />
                  </q-item-section>
                </q-item>
              </template>

              <template v-else-if="!rows.length">
                <div class="q-pa-lg text-center text-grey-6">
                  Nenhuma ocorrência encontrada nesse raio.
                </div>
              </template>

              <template v-else>
                <q-item v-for="r in rows" :key="r.ocorrencia_id" clickable v-ripple @click="irDetalhe(r.ocorrencia_id)">
                  <q-item-section avatar top>
                    <q-avatar square size="56px">
                      <q-img v-if="r.thumbnail_url" :src="r.thumbnail_url" ratio="1" />
                      <q-icon v-else name="image_not_supported" size="28px" class="text-grey-5" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium ellipsis">{{ r.ocorrencia_titulo }}</q-item-label>
                    <q-item-label caption class="ellipsis">
                      {{ r.local_rua }}, {{ r.local_bairro }} — {{ r.municipio_nome }}/{{ r.local_estado }}
                    </q-item-label>
                    <div class="row items-center q-gutter-xs">
                      <q-badge outline :color="statusStyle(r.ocorrencia_status_nome).color" class="q-mt-xs">
                        {{ r.ocorrencia_status_nome }}
                      </q-badge>
                      <q-badge v-if="r.imagens_count" class="q-mt-xs"> {{ r.imagens_count }} img </q-badge>
                    </div>
                  </q-item-section>

                  <q-item-section side top class="text-right">
                    <div class="text-weight-medium">{{ fmtKm(r.distance_km) }}</div> <q-item-label caption>{{
                      formatDateISOToBR(r.ocorrencia_data) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useOcorrenciasPertoStore } from 'src/stores/ocorrenciasPerto'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()

const pertoStore = useOcorrenciasPertoStore()

const radiusKm = ref(3)
const statusSel = ref(null)       // 1..5
const prioridadeSel = ref(null)   // 1..4
const onlyWithImages = ref(false)

const statusOptions = [
  { label: 'Aberto', value: 1 },
  { label: 'Em análise', value: 2 },
  { label: 'Em andamento', value: 3 },
  { label: 'Resolvido', value: 4 },
  { label: 'Fechado', value: 5 }
]
const prioridadeOptions = [
  { label: 'Alta', value: 1 },
  { label: 'Normal', value: 2 },
  { label: 'Baixa', value: 3 },
  { label: 'Urgente', value: 4 }
]

const rows = computed(() => pertoStore.rows)
const loading = computed(() => pertoStore.loading)

const gettingLocation = ref(false)

const userPos = ref({ lat: null, lng: null })
const hasUserPos = computed(() => Number.isFinite(userPos.value.lat) && Number.isFinite(userPos.value.lng))

async function usarMinhaLocalizacao() {
  if (!('geolocation' in navigator)) {
    Notify.create({ type: 'warning', message: 'Seu dispositivo não suporta geolocalização.' })
    return
  }
  gettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      userPos.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      gettingLocation.value = false
      await nextTickMapInit()
      carregar()
    },
    () => {
      gettingLocation.value = false
      Notify.create({ type: 'warning', message: 'Não foi possível obter sua localização.' })
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

async function carregar() {
  if (!hasUserPos.value) return
  try {
    const { lat, lng } = userPos.value
    const params = {
      lat, lng,
      radius_km: radiusKm.value,
      limit: 50,
      com_imagens: onlyWithImages.value ? 1 : 0
    }
    if (statusSel.value != null) params.status = statusSel.value
    if (prioridadeSel.value != null) params.prioridade = prioridadeSel.value

    await pertoStore.fetchNearby(params)
    redrawMarkers()
  } catch {
    Notify.create({ type: 'negative', message: 'Falha ao carregar ocorrências próximas.' })
  }
}

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
  return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}
const STATUS_STYLES = {
  'aberto': { color: 'orange-7' },
  'em analise': { color: 'indigo-7' },
  'em andamento': { color: 'info' },
  'resolvido': { color: 'positive' },
  'fechado': { color: 'green-8' }
}
function statusStyle(name) {
  return STATUS_STYLES[norm(name)] || { color: 'grey-6' }
}

import { nextTick } from 'vue'
const mapEl = ref(null)
let map = null
let markersLayer = null
let userLayer = null

function initMap() {
  if (map || !mapEl.value) return
  const center = hasUserPos.value ? [userPos.value.lat, userPos.value.lng] : [-26.9261, -53.0045]
  map = L.map(mapEl.value, { zoomControl: true }).setView(center, hasUserPos.value ? 14 : 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
  userLayer = L.layerGroup().addTo(map)

  drawUser()
  setTimeout(() => map?.invalidateSize(), 150)
}

function drawUser() {
  if (!map || !userLayer) return
  userLayer.clearLayers()
  if (!hasUserPos.value) return
  const { lat, lng } = userPos.value
  L.marker([lat, lng], { title: 'Você está aqui' }).addTo(userLayer)
  L.circle([lat, lng], { radius: radiusKm.value * 1000, color: '#1976d2', fillOpacity: 0.07 }).addTo(userLayer)
}

function redrawMarkers() {
  if (!map || !markersLayer) return
  markersLayer.clearLayers()
  rows.value.forEach(r => {
    if (!Number.isFinite(r.local_latitude) || !Number.isFinite(r.local_longitude)) return
    const m = L.marker([r.local_latitude, r.local_longitude])
    m.bindPopup(`
      <div style="min-width:200px">
        <div style="font-weight:600;margin-bottom:4px">${escapeHtml(r.ocorrencia_titulo)}</div>
        <div style="color:#666">${escapeHtml(r.local_rua || '')}, ${escapeHtml(r.local_bairro || '')}</div>
        <div style="margin-top:6px;color:#666">Distância: ${fmtKm(r.distance_km)}</div>
        <a href="/#/home/ocorrencias/${r.ocorrencia_id}" style="display:inline-block;margin-top:6px;color:#1976d2">Ver detalhes</a>
      </div>
    `)
    m.addTo(markersLayer)
  })
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
}

async function nextTickMapInit() {
  await nextTick()
  if (!map) initMap()
  else {
    map.setView([userPos.value.lat, userPos.value.lng], Math.max(map.getZoom(), 14))
  }
  drawUser()
}

onMounted(() => {
  initMap()
  usarMinhaLocalizacao()
})
onBeforeUnmount(() => {
  if (map) { map.off(); map.remove(); map = null }
  markersLayer = null
  userLayer = null
})

let debounceTimer = null
watch([radiusKm, statusSel, prioridadeSel, onlyWithImages], () => {
  drawUser()
  if (!hasUserPos.value) return
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => carregar(), 300)
})

function irDetalhe(id) {
  router.push(`/home/ocorrencias/${id}`)
}

function fmtKm(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return `${n.toFixed(2)} km`
}

</script>

<style scoped>
.leaflet-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 320px;
}

.leaflet-map {
  width: 100%;
  height: 420px;
}

.empty-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
}
</style>
