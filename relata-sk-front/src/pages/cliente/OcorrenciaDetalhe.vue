<template>
    <q-page padding>
        <q-card flat bordered>
            <q-inner-loading :showing="loading">
                <q-spinner size="32px" />
            </q-inner-loading>

            <template v-if="error">
                <q-card-section class="text-negative">
                    Falha ao carregar a ocorrência.
                </q-card-section>
            </template>

            <template v-else-if="!item">
                <q-card-section class="text-grey-7">
                    Ocorrência não encontrada.
                </q-card-section>
            </template>

            <template v-else>
                <q-card-section class="row items-center q-col-gutter-sm">
                    <div class="col">
                        <div class="text-h6 q-mb-xs">{{ item.ocorrencia_titulo }}</div>
                        <div class="row items-center q-gutter-sm">
                            <q-chip size="sm" :color="statusStyle(item.ocorrencia_status_nome).color"
                                text-color="white">
                                {{ item.ocorrencia_status_nome }}
                            </q-chip>
                            <q-chip size="sm" :color="item.ocorrencia_anonima ? 'grey-7' : 'positive'"
                                text-color="white" outline>
                                {{ item.ocorrencia_anonima ? 'Anônima' : 'Identificada' }}
                            </q-chip>
                        </div>
                    </div>

                    <div class="col-auto row items-center q-gutter-sm">
                        <q-btn dense flat icon="content_copy" :label="`Protocolo: ${item.ocorrencia_protocolo}`"
                            @click="copiarProtocolo" />
                        <q-btn flat icon="arrow_back" label="Voltar" @click="$router.back()" />
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                            <div class="text-bold text-grey-7 q-mb-xs">Resumo</div>
                            <div class="q-mb-xs"><span class="text-grey-7">Data:</span> {{ dataFmt }}</div>
                            <div class="q-mb-xs"><span class="text-grey-7">Autor:</span> {{ item.user_username }}</div>
                            <div class="q-mb-xs">
                                <span class="text-grey-7">Local:</span>
                                {{ item.local_rua }}, {{ item.local_bairro }} – {{ item.municipio_nome }}/{{
                                item.local_estado }}
                                <span v-if="item.local_complemento"> ({{ item.local_complemento }})</span>
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <div class="text-bold text-grey-7 q-mb-xs">Descrição</div>
                            <div class="pre-wrap">{{ item.ocorrencia_descricao }}</div>
                        </div>
                    </div>
                </q-card-section>

                <q-separator />
                <q-card-section>
                    <div class="row items-center q-col-gutter-sm q-mb-sm">
                        <div class="col">
                            <div class="text-bold text-grey-7">Localização</div>
                            <div class="text-caption text-grey-7">
                                {{ hasCoords ? 'Coordenadas disponíveis' : 'Sem coordenadas para exibir no mapa' }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <q-btn v-if="hasCoords" flat icon="map" label="Abrir no Google Maps"
                                @click="abrirNoGoogleMaps" />
                        </div>
                    </div>

                    <div v-if="hasCoords" class="leaflet-wrap">
                        <div ref="mapEl" class="leaflet-map"></div>
                    </div>
                    <div v-else class="text-grey-6">Nenhuma coordenada informada.</div>
                </q-card-section>

                <q-separator />
                <q-card-section>
                    <div class="row items-center q-col-gutter-sm q-mb-sm">
                        <div class="col">
                            <div class="text-bold text-grey-7">Imagens</div>
                            <div class="text-caption text-grey-7">
                                {{ (item.imagens?.length || 0) }} anexo(s)
                            </div>
                        </div>
                    </div>

                    <div v-if="item.imagens && item.imagens.length" class="row q-col-gutter-sm">
                        <div v-for="(img, i) in item.imagens" :key="img.ocorrencia_imagem_id || i"
                            class="col-6 col-sm-4 col-md-3">
                            <q-card flat bordered class="cursor-pointer" @click="abrirLightbox(i)">
                                <q-img :src="img.ocorrencia_imagem_url" ratio="1" />
                            </q-card>
                        </div>
                    </div>
                    <div v-else class="text-grey-6">Nenhuma imagem anexada.</div>
                </q-card-section>

                <q-dialog v-model="lightbox.open" persistent maximized transition-show="fade" transition-hide="fade">
                    <q-card class="bg-black">
                        <q-bar class="bg-black text-white">
                            <div class="text-subtitle2">Imagens da ocorrência</div>
                            <q-space />
                            <q-btn flat dense round icon="close" v-close-popup />
                        </q-bar>
                        <q-card-section class="q-pa-none">
                            <q-carousel v-model="lightbox.index" swipeable animated control-color="white" arrows
                                infinite class="bg-black">
                                <q-carousel-slide v-for="(img, i) in item.imagens" :key="i" :name="i">
                                    <div class="flex flex-center" style="height: calc(100vh - 64px);">
                                        <q-img :src="img.ocorrencia_imagem_url"
                                            style="max-width: 95vw; max-height: 85vh;" fit="contain" />
                                    </div>
                                </q-carousel-slide>
                            </q-carousel>
                        </q-card-section>
                    </q-card>
                </q-dialog>
            </template>
        </q-card>
    </q-page>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, watch, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { copyToClipboard, Notify } from 'quasar'
import { useOcorrenciaDetalheStore } from 'src/stores/ocorrenciaDetalhe'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()
const store = useOcorrenciaDetalheStore()

const item = computed(() => store.get(route.params.id))
const loading = computed(() => store.loading)
const error = computed(() => store.error)

onMounted(() => store.carregar(route.params.id))
watch(() => route.params.id, (id) => { if (id) store.carregar(id, { force: true }) })

function fmtBR(v) {
    if (!v) return ''
    const d = new Date(v)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}
const dataFmt = computed(() => fmtBR(item.value?.ocorrencia_data))

function norm(s) {
    return String(s || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim()
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

const mapEl = ref(null)
let map = null
let marker = null

const hasCoords = computed(() => {
    const lat = Number(item.value?.local_latitude)
    const lng = Number(item.value?.local_longitude)
    return Number.isFinite(lat) && Number.isFinite(lng)
})

function initMap() {
    if (!mapEl.value || !hasCoords.value) return
    const lat = Number(item.value.local_latitude)
    const lng = Number(item.value.local_longitude)

    map = L.map(mapEl.value, { zoomControl: true })
    map.setView([lat, lng], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map)

    marker = L.marker([lat, lng]).addTo(map)

    setTimeout(() => map?.invalidateSize(), 150)
}

function destroyMap() {
    if (marker) {
        marker.remove()
        marker = null
    }
    if (map) {
        map.off()
        map.remove()
        map = null
    }
}

watch(hasCoords, (ok) => {
    destroyMap()
    if (ok) initMap()
})

onMounted(() => { if (hasCoords.value) initMap() })
onBeforeUnmount(() => destroyMap())

function abrirNoGoogleMaps() {
    if (!hasCoords.value) return
    const lat = Number(item.value.local_latitude).toFixed(6)
    const lng = Number(item.value.local_longitude).toFixed(6)
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(url, '_blank', 'noopener')
}

const lightbox = reactive({ open: false, index: 0 })
function abrirLightbox(i) {
    lightbox.index = i
    lightbox.open = true
}

async function copiarProtocolo() {
    try {
        await copyToClipboard(item.value?.ocorrencia_protocolo || '')
        Notify.create({ type: 'positive', message: 'Protocolo copiado' })
    } catch {
        Notify.create({ type: 'warning', message: 'Não foi possível copiar' })
    }
}
</script>

<style scoped>
.pre-wrap {
    white-space: pre-wrap;
}

.leaflet-wrap {
    border-radius: 12px;
    overflow: hidden;
}

.leaflet-map {
    width: 100%;
    height: 320px;
}
</style>
