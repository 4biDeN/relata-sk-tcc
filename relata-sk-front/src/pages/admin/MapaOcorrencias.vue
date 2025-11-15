<template>
    <q-page class="q-pa-md">
        <q-card flat class="surface-card">
            <q-card-section class="q-pb-sm">
                <div class="row items-end q-col-gutter-md">
                    <div class="col-6 col-md-3">
                        <q-select v-model="statusSel" :options="statusOptions" label="Status" dense clearable emit-value
                            map-options outlined color="green-9" />
                    </div>

                    <div class="col-6 col-md-3">
                        <q-select v-model="prioridadeSel" :options="prioridadeOptions" label="Prioridade" dense
                            clearable emit-value map-options outlined color="green-9" />
                    </div>

                    <div class="col-12 col-md-6">
                        <div class="cta-row">
                            <q-btn class="btn-compact" flat icon="refresh" label="Atualizar" no-caps dense size="sm"
                                :loading="loading" @click="carregar" />
                            <q-badge color="green-9" text-color="white" class="q-py-xs q-px-sm">
                                {{ rows.length }} resultado(s)
                            </q-badge>
                        </div>
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
                <div class="row q-col-gutter-lg">
                    <div class="col-12 col-lg-7">
                        <div class="section-title">
                            <q-icon name="map" size="20px" class="q-mr-xs" /> Mapa
                        </div>
                        <div class="leaflet-wrap card-outline">
                            <div ref="mapEl" class="leaflet-map"></div>
                            <q-inner-loading :showing="loading"><q-spinner size="32px" /></q-inner-loading>
                        </div>
                    </div>

                    <div class="col-12 col-lg-5">
                        <div class="section-title">
                            <q-icon name="list_alt" size="20px" class="q-mr-xs" /> Resultados
                        </div>

                        <q-list bordered class="rounded-borders card-outline">
                            <template v-if="loading">
                                <q-item v-for="i in 3" :key="i">
                                    <q-item-section><q-skeleton type="rect" height="60px" /></q-item-section>
                                </q-item>
                            </template>

                            <template v-else-if="!rows.length">
                                <div class="q-pa-lg text-center text-grey-6">
                                    Nenhuma ocorrência encontrada.
                                </div>
                            </template>

                            <template v-else>
                                <q-item v-for="r in rows" :key="r.ocorrencia_id" clickable v-ripple
                                    @click="irDetalhe(r.ocorrencia_id)" class="result-item">
                                    <q-item-section avatar top>
                                        <q-avatar square size="56px" class="thumb">
                                            <q-img v-if="r.thumbnail_url" :src="r.thumbnail_url" ratio="1" />
                                            <q-icon v-else name="image_not_supported" size="28px" class="text-grey-5" />
                                        </q-avatar>
                                    </q-item-section>

                                    <q-item-section>
                                        <q-item-label class="text-weight-medium ellipsis">
                                            {{ r.ocorrencia_titulo }}
                                        </q-item-label>
                                        <q-item-label caption class="ellipsis text-grey-7">
                                            {{ r.local_rua }}, {{ r.local_bairro }} — {{ r.municipio_nome }}/{{
                                                r.local_estado }}
                                        </q-item-label>
                                        <div class="row items-center q-gutter-xs q-mt-xs">
                                            <q-badge outline :color="statusStyle(r.ocorrencia_status_nome).color">
                                                {{ r.ocorrencia_status_nome }}
                                            </q-badge>
                                            <q-badge v-if="r.imagens_count" class="soft-badge">
                                                {{ r.imagens_count }} img
                                            </q-badge>
                                        </div>
                                    </q-item-section>

                                    <q-item-section side top class="text-right">
                                        <q-item-label caption>{{ formatDateISOToBR(r.ocorrencia_data) }}</q-item-label>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useOcorrenciasPertoStore } from 'src/stores/ocorrenciasPerto'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const pertoStore = useOcorrenciasPertoStore()

const CENTER = { lat: -26.9261, lng: -53.0045 }
const RADIUS_KM = 20

const statusSel = ref(null)
const prioridadeSel = ref(null)

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

const mapEl = ref(null)
let map = null
let markersLayer = null

function initMap() {
    if (map || !mapEl.value) return
    map = L.map(mapEl.value, { zoomControl: true }).setView([CENTER.lat, CENTER.lng], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map)
    markersLayer = L.layerGroup().addTo(map)
    setTimeout(() => map?.invalidateSize(), 150)
}

function redrawMarkers() {
    if (!map || !markersLayer) return
    markersLayer.clearLayers()
    const bounds = []
    rows.value.forEach(r => {
        const lat = Number(r.local_latitude)
        const lng = Number(r.local_longitude)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
        const m = L.marker([lat, lng])
        m.bindPopup(`
      <div style="min-width:210px">
        <div style="font-weight:600;margin-bottom:4px">${escapeHtml(r.ocorrencia_titulo)}</div>
        <div style="color:#546e7a">${escapeHtml(r.local_rua || '')}, ${escapeHtml(r.local_bairro || '')}</div>
        <a href="/#/admin/ocorrencias/${r.ocorrencia_id}" style="display:inline-block;margin-top:8px;background:#1b5e20;color:#fff;padding:6px 10px;border-radius:8px;text-decoration:none">Ver detalhes</a>
      </div>
    `)
        m.addTo(markersLayer)
        bounds.push([lat, lng])
    })
    if (bounds.length) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [24, 24] })
    } else {
        map.setView([CENTER.lat, CENTER.lng], 12)
    }
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
}

async function carregar() {
    try {
        const params = {
            lat: CENTER.lat,
            lng: CENTER.lng,
            radius_km: RADIUS_KM,
            limit: 100
        }
        if (statusSel.value != null) params.status = statusSel.value
        if (prioridadeSel.value != null) params.prioridade = prioridadeSel.value

        await pertoStore.fetchNearby(params)
        await nextTick()
        redrawMarkers()
    } catch {
        Notify.create({ type: 'negative', message: 'Falha ao carregar ocorrências.' })
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

function norm(s) { return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim() }
const STATUS_STYLES = {
    'aberto': { color: 'orange-7' },
    'em analise': { color: 'indigo-7' },
    'em andamento': { color: 'info' },
    'resolvido': { color: 'positive' },
    'fechado': { color: 'green-8' }
}
function statusStyle(name) { return STATUS_STYLES[norm(name)] || { color: 'grey-6' } }

function irDetalhe(id) { router.push(`/admin/ocorrencias/${id}`) }


onMounted(async () => {
    initMap()
    await carregar()
})

onBeforeUnmount(() => {
    if (map) { map.off(); map.remove(); map = null }
    markersLayer = null
})

watch([statusSel, prioridadeSel], () => { carregar() })
</script>

<style scoped>
.surface-card {
    border-radius: 14px;
    border: 1px solid #e0f2f1;
    overflow: hidden;
}

.section-title {
    font-weight: 700;
    color: #1b5e20;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
}

.card-outline {
    border: 1px solid #e0f2f1;
    border-radius: 12px;
}

.leaflet-wrap {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    min-height: 300px;
}

.leaflet-map {
    width: 100%;
    height: 420px;
}

.result-item:hover {
    background: #f1f8e9;
}

.thumb :deep(img) {
    object-fit: cover;
}

.soft-badge {
    background: #e8f5e9;
    color: #1b5e20;
}

.cta-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-compact {
    height: 36px;
    padding: 0 10px;
    border-radius: 8px;
}

.btn-compact :deep(.q-btn__content) {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    letter-spacing: .2px;
}

.grow {
    flex: 1 1 auto;
    min-width: 0;
}

@media (max-width: 1023px) {
    .leaflet-map {
        height: 360px;
    }
}

@media (max-width: 599px) {
    .leaflet-map {
        height: 280px;
    }

    .surface-card :deep(.q-card__section) {
        padding: 12px;
    }
}
</style>
