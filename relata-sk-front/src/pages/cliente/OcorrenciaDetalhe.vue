<template>
    <q-page padding>
        <q-card flat bordered>
            <q-inner-loading :showing="loading"><q-spinner size="32px" /></q-inner-loading>

            <template v-if="error">
                <q-card-section class="text-negative">Falha ao carregar a ocorrência.</q-card-section>
            </template>

            <template v-else-if="!item">
                <q-card-section class="text-grey-7">Ocorrência não encontrada.</q-card-section>
            </template>

            <template v-else>
                <q-tabs v-model="tab" dense active-color="green-9" indicator-color="green-9" class="text-grey-7">
                    <q-tab name="detalhe" label="Detalhe" />
                    <q-tab name="historico" label="Histórico" />
                    <q-tab name="comentarios" :label="`Comentários (${comentTotal})`" />
                </q-tabs>
                <q-separator />

                <div v-show="tab === 'detalhe'">
                    <q-card-section class="q-col-gutter-sm">
                        <div class="row items-start q-gutter-sm detail-header">
                            <div class="col-12 col-sm">
                                <div class="text-h6 q-mb-xs detail-title">
                                    {{ item.ocorrencia_titulo }}
                                </div>

                                <div class="row items-center q-gutter-xs wrap">
                                    <q-chip dense square :color="statusChipColor(item.ocorrencia_status)"
                                        text-color="white" class="pill">
                                        {{ labelStatus(item.ocorrencia_status) }}
                                    </q-chip>
                                    <q-chip size="sm" :color="item.ocorrencia_anonima ? 'grey-7' : 'positive'"
                                        text-color="white" outline>
                                        {{ item.ocorrencia_anonima ? 'Anônima' : 'Identificada' }}
                                    </q-chip>
                                </div>

                                <div class="row items-center q-gutter-xs q-mt-xs protocol-line">
                                    <q-icon name="fingerprint" size="16px" class="text-grey-7" />
                                    <div class="text-caption text-grey-7">
                                        PROTOCOLO: {{ item.ocorrencia_protocolo }}
                                    </div>
                                    <q-btn dense round flat icon="content_copy" @click="copiarProtocolo" size="sm"
                                        class="q-ml-xs" />
                                </div>
                            </div>

                            <div class="col-12 col-sm-auto right-actions" v-show="!$q.screen.lt.sm">
                                <q-btn flat icon="arrow_back" label="Voltar" @click="$router.back()" />
                            </div>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section>
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <div class="field">
                                    <div class="field__label">Data</div>
                                    <div class="field__static">{{ dataFmt }}</div>
                                </div>
                                <div class="field" v-if="podeVerAutor">
                                    <div class="field__label">Autor</div>
                                    <div class="field__static">{{ item.user_username }}</div>
                                </div>
                                <div class="field">
                                    <div class="field__label">Local</div>
                                    <div class="field__static">
                                        {{ item.local_rua }}, {{ item.local_bairro }} – {{ item.municipio_nome }}/{{
                                            item.local_estado }}
                                        <span v-if="item.local_complemento"> ({{ item.local_complemento }})</span>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12 col-md-6">
                                <div class="text-bold text-grey-7 q-mb-xs">Descrição</div>
                                <div class="field">
                                    <div class="field__static pre-wrap">{{ item.ocorrencia_descricao }}</div>
                                </div>
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
                            <q-resize-observer @resize="onMapResize" />
                        </div>
                        <div v-else class="text-grey-6">Nenhuma coordenada informada.</div>
                    </q-card-section>

                    <q-card-section>
                        <div class="row items-center q-col-gutter-sm q-mb-sm">
                            <div class="col">
                                <div class="text-bold text-grey-7">Imagens</div>
                                <div class="text-caption text-grey-7">{{ (item.imagens?.length || 0) }} anexo(s)</div>
                            </div>
                        </div>

                        <div v-if="item.imagens && item.imagens.length" class="row q-col-gutter-sm">
                            <div v-for="(img, i) in item.imagens" :key="img.ocorrencia_imagem_id || i"
                                class="col-6 col-sm-4 col-md-3 col-lg-2">
                                <q-card flat bordered class="thumb cursor-pointer" @click="abrirLightbox(i)">
                                    <q-img :src="img.ocorrencia_imagem_url" ratio="1" />
                                    <div class="thumb-overlay"><q-btn dense flat round icon="zoom_in" color="white" />
                                    </div>
                                </q-card>
                            </div>
                        </div>
                        <div v-else class="text-grey-6">Nenhuma imagem anexada.</div>
                    </q-card-section>

                    <q-dialog v-model="lightbox.open" maximized transition-show="fade" transition-hide="fade">
                        <q-card class="bg-black">
                            <q-bar class="bg-black text-white">
                                <div class="text-subtitle2">Imagens da ocorrência</div>
                                <q-space />
                                <q-btn flat dense round icon="close" v-close-popup />
                            </q-bar>
                            <q-card-section class="q-pa-none">
                                <q-carousel v-model="lightbox.index" swipeable animated control-color="white" arrows
                                    infinite class="bg-black" :height="carouselHeight">
                                    <q-carousel-slide v-for="(img, i) in item.imagens" :key="i" :name="i"
                                        class="lightbox-slide">
                                        <div class="lightbox-img-wrap"><img :src="img.ocorrencia_imagem_url"
                                                class="lightbox-img" alt="" /></div>
                                    </q-carousel-slide>
                                </q-carousel>
                            </q-card-section>
                        </q-card>
                    </q-dialog>
                </div>

                <div v-show="tab === 'historico'">
                    <q-card-section>
                        <div class="row items-center q-col-gutter-sm q-mb-sm">
                            <div class="col">
                                <div class="text-bold text-grey-8">Histórico</div>
                                <div class="text-caption text-grey-6">{{ storeHistTotal }} registro(s)</div>
                            </div>
                            <div class="col-auto">
                                <q-btn-dropdown dense flat icon="filter_list" label="Filtros">
                                    <q-list style="min-width:220px">
                                        <q-item clickable v-ripple @click="filtro.entidade = null">
                                            <q-item-section><q-item-label>Todas as
                                                    entidades</q-item-label></q-item-section>
                                            <q-item-section side v-if="!filtro.entidade"><q-icon
                                                    name="check" /></q-item-section>
                                        </q-item>
                                        <q-separator />
                                        <q-item v-for="e in entidadeOptions" :key="e.value" clickable v-ripple
                                            @click="filtro.entidade = e.value">
                                            <q-item-section>
                                                <q-item-label class="row items-center no-wrap">
                                                    <q-icon :name="entidadeIcon(e.value)" class="q-mr-sm" />
                                                    <span>{{ e.label }}</span>
                                                </q-item-label>
                                            </q-item-section>
                                            <q-item-section side v-if="filtro.entidade === e.value"><q-icon
                                                    name="check" /></q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-btn-dropdown>
                            </div>
                        </div>

                        <q-inner-loading :showing="histLoading"><q-spinner size="32px" /></q-inner-loading>
                        <q-timeline color="green-9" :layout="$q.screen.lt.sm ? 'dense' : 'loose'" side="right"
                            class="hist-timeline" v-if="historicoFiltrado.length">
                            <q-timeline-entry v-for="h in historicoFiltrado" :key="h.historico_id"
                                :subtitle="formatHistDate(h.changed_at)" :icon="acaoIcon(h)"
                                :color="entidadeColor(h.entidade)" class="hist-entry">
                                <template #title>
                                    <div class="hist-title">
                                        <q-chip dense square :color="entidadeColor(h.entidade)" text-color="white"
                                            class="pill">
                                            {{ labelEntidade(h.entidade) }}
                                        </q-chip>
                                        <span class="hist-action text-weight-bold">{{ labelAcao(h.acao) }}</span>
                                    </div>
                                </template>

                                <div class="hist-body text-body2">
                                    <template v-if="h.entidade === 'status'">
                                        <q-chip dense square :color="statusChipColor(h.valor_novo)" text-color="white"
                                            class="pill">
                                            {{ labelStatus(h.valor_novo) }}
                                        </q-chip>
                                        <span class="text-grey-7 q-ml-sm">({{ h.campo || 'status' }})</span>
                                    </template>

                                    <template v-else-if="h.entidade === 'prioridade'">
                                        <q-chip dense square :color="prioridadeChipColor(h.valor_novo)"
                                            text-color="white" class="pill">
                                            {{ labelPrioridade(h.valor_novo) }}
                                        </q-chip>
                                        <span class="text-grey-7 q-ml-sm">({{ h.campo || 'prioridade' }})</span>
                                    </template>

                                    <template v-else-if="h.entidade === 'atribuicao'">
                                        <q-chip dense square :color="atribuidaChipColor(h.valor_novo)"
                                            text-color="white" class="pill">
                                            {{ labelAtribuida(h.valor_novo) }}
                                        </q-chip>
                                        <span class="text-grey-7 q-ml-sm">({{ h.campo || 'atribuição' }})</span>
                                    </template>

                                    <template v-else>
                                        <div class="q-mt-xs">
                                            <span class="text-grey-7">{{ h.campo || '—' }}:</span>
                                            <span class="q-ml-xs">
                                                <template v-if="h.acao === 'update'">
                                                    <span class="text-negative">{{ fmtVal(h.valor_anterior) }}</span>
                                                    <q-icon name="arrow_forward" class="q-mx-xs" />
                                                    <span class="text-positive">{{ fmtVal(h.valor_novo) }}</span>
                                                </template>
                                                <template v-else>
                                                    {{ fmtVal(h.valor_novo) }}
                                                </template>
                                            </span>
                                        </div>
                                    </template>

                                    <div class="hist-meta text-caption text-grey-6 q-mt-xs">
                                        {{ usuarioFmt(h) }}
                                        <template v-if="h.entidade_id"> • ID: {{ h.entidade_id }}</template>
                                    </div>
                                </div>
                            </q-timeline-entry>
                        </q-timeline>

                        <div v-else class="text-grey-6">Sem histórico disponível.</div>

                        <div class="row justify-center q-mt-md" v-if="storeHistList.length < storeHistTotal">
                            <q-btn flat :loading="histLoading" label="Carregar mais" @click="carregarMaisHistorico" />
                        </div>
                    </q-card-section>
                </div>

                <div v-show="tab === 'comentarios'">
                    <q-card-section>
                        <div class="row items-center q-col-gutter-sm q-mb-sm">
                            <div class="col">
                                <div class="text-bold text-grey-8">Comentários</div>
                                <div class="text-caption text-grey-6">{{ comentTotal }} comentário(s)</div>
                            </div>
                            <div class="col-auto">
                                <q-btn dense flat icon="refresh" :loading="comentLoading" @click="reloadComentarios" />
                            </div>
                        </div>

                        <q-card flat bordered class="q-mb-md">
                            <q-card-section class="q-gutter-sm">
                                <q-input v-model="novoComentarioTexto" type="textarea" autogrow outlined
                                    :disable="comentSaving"
                                    placeholder="Escreva seu comentário... (Ctrl+Enter para enviar)"
                                    @keyup.ctrl.enter="enviarComentario" />
                                <div class="row items-center q-gutter-sm">
                                    <q-btn label="Enviar" color="green-9" :loading="comentSaving"
                                        :disable="!novoComentarioTexto || !novoComentarioTexto.trim()"
                                        @click="enviarComentario" />
                                    <q-btn flat label="Limpar" :disable="comentSaving || !novoComentarioTexto"
                                        @click="novoComentarioTexto = ''" />
                                </div>
                            </q-card-section>
                        </q-card>

                        <q-inner-loading :showing="comentLoading"><q-spinner size="32px" /></q-inner-loading>

                        <q-list separator v-if="comentarios.length">
                            <q-item v-for="c in comentarios" :key="c.comentario_id">
                                <q-item-section avatar>
                                    <q-avatar color="primary" text-color="white" size="32px">
                                        {{ (c.comentario_user_username || c.comentario_user_nome ||
                                            '?').slice(0, 1).toUpperCase() }}
                                    </q-avatar>
                                </q-item-section>

                                <q-item-section>
                                    <q-item-label class="row items-center q-gutter-sm">
                                        <span class="text-weight-medium">{{ c.comentario_user_nome ||
                                            c.comentario_user_username
                                            }}</span>
                                    </q-item-label>
                                    <q-item-label caption>
                                        {{ formatComentDate(c.comentario_data) }}
                                    </q-item-label>
                                    <q-item-label class="q-mt-sm">
                                        <div style="white-space: pre-wrap">{{ c.comentario_texto }}</div>
                                    </q-item-label>
                                </q-item-section>

                                <q-item-section side top v-if="Number(c.comentario_user_id) === Number(currentUserId)">
                                    <q-btn size="sm" flat icon="delete" color="negative"
                                        @click="softExcluirComentario(c.comentario_id)" />
                                </q-item-section>
                            </q-item>
                        </q-list>

                        <div v-else class="text-grey-6">Nenhum comentário por aqui…</div>

                        <div class="row justify-center q-mt-md" v-if="comentarios.length < comentTotal">
                            <q-btn flat :loading="comentLoading" label="Carregar mais"
                                @click="carregarMaisComentarios" />
                            <div class="text-caption q-ml-sm">
                                {{ Math.min(comentarios.length, comentTotal) }} / {{ comentTotal }}
                            </div>
                        </div>
                    </q-card-section>
                </div>
            </template>
        </q-card>
    </q-page>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, watch, reactive, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { copyToClipboard, Notify, useQuasar, date } from 'quasar'
import { useOcorrenciaDetalheStore } from 'src/stores/ocorrenciaDetalhe'
import { useOcorrenciaHistoricoStore } from 'src/stores/ocorrenciaHistorico'
import { useOcorrenciaComentarioStore } from 'src/stores/ocorrenciaComentario'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const $q = useQuasar()
const route = useRoute()
const store = useOcorrenciaDetalheStore()

const item = computed(() => store.get(route.params.id))
const loading = computed(() => store.loading)
const error = computed(() => store.error)

onMounted(() => store.carregar(route.params.id))
watch(() => route.params.id, (id) => { if (id) store.carregar(id, { force: true }) })

const tab = ref('detalhe')

const histStore = useOcorrenciaHistoricoStore()
const storeHistList = computed(() => histStore.list(route.params.id))
const storeHistTotal = computed(() => histStore.total(route.params.id))
const histLoading = computed(() => histStore.loading)
const historico = computed(() => (storeHistList.value || []).filter(h => h.entidade === 'status'))

function formatHistDate(v) { return v ? date.formatDate(v, 'DD/MM/YYYY HH:mm') : '-' }
async function carregarHistorico(force = false) {
    await histStore.carregar(route.params.id, { limit: 20, offset: 0, force })
}
async function carregarMaisHistorico() {
    const st = histStore.pageState(route.params.id)
    await histStore.paginar(route.params.id, { limit: st.limit, offset: st.offset + st.limit })
}

watch(tab, async (t) => {
    if (t === 'historico' && historico.value.length === 0) {
        await carregarHistorico(true)
    }
})

const filtro = reactive({ entidade: null })

const entidadeOptions = [
    { label: 'Status', value: 'status' },
    { label: 'Prioridade', value: 'prioridade' },
    { label: 'Atribuição', value: 'atribuicao' },
    { label: 'Título', value: 'titulo' },
    { label: 'Descrição', value: 'descricao' },
    { label: 'Imagem', value: 'imagem' },
    { label: 'Comentário', value: 'comentario' },
    { label: 'Local', value: 'local' },
    { label: 'Anônima', value: 'anonima' },
    { label: 'Excluída', value: 'excluida' },
]

const historicoFiltrado = computed(() =>
    filtro.entidade ? (storeHistList.value || []).filter(h => h.entidade === filtro.entidade) : (storeHistList.value || [])
)

function entidadeColor(ent) {
    const map = {
        status: 'green-7', prioridade: 'orange-7', atribuicao: 'indigo-6',
        titulo: 'blue-6', descricao: 'cyan-7', imagem: 'purple-6',
        comentario: 'teal-6', local: 'brown-6', anonima: 'deep-purple-5',
        excluida: 'grey-7', ocorrencia: 'primary',
    }
    return map[ent] || 'grey-6'
}
function entidadeIcon(ent) {
    const map = {
        status: 'flag', prioridade: 'priority_high', atribuicao: 'group',
        titulo: 'title', descricao: 'notes', imagem: 'photo',
        comentario: 'chat', local: 'place', anonima: 'visibility_off',
        excluida: 'delete_outline', ocorrencia: 'info',
    }
    return map[ent] || 'history'
}
function labelEntidade(ent) {
    const map = Object.fromEntries(entidadeOptions.map(e => [e.value, e.label]))
    return map[ent] || ent
}
function labelAcao(acao) {
    const map = { create: 'Criado', update: 'Atualizado', delete: 'Excluído', attach: 'Anexado', detach: 'Desanexado' }
    return map[acao] || acao
}
function acaoIcon(h) {
    const map = { create: 'add', update: 'edit', delete: 'delete', attach: 'link', detach: 'link_off' }
    return map[h.acao] || entidadeIcon(h.entidade)
}
function fmtVal(v) {
    if (v == null || v === '') return '—'
    const num = Number(v)
    return Number.isFinite(num) ? num : String(v)
}
function usuarioFmt(h) {
    const idPart = h?.changed_by != null ? `#${h.changed_by}` : '—'
    const namePart = h?.changed_by_username ? ` — ${h.changed_by_username}` : ''
    return `Usuário: ${idPart}${namePart}`
}

function prioridadeChipColor(id) { const m = { 4: 'red-7', 1: 'deep-orange-7', 2: 'primary', 3: 'grey-7' }; return m[Number(id)] || 'grey-6' }
function atribuidaChipColor(id) { const m = { 1: 'grey-7', 2: 'primary', 3: 'deep-orange-6', 4: 'indigo-6' }; return m[Number(id)] || 'grey-6' }
function labelPrioridade(id) { const map = { 1: 'Alta', 2: 'Normal', 3: 'Baixa', 4: 'Urgente' }; return map[Number(id)] || '—' }
function labelAtribuida(id) { const map = { 1: 'Cidadão', 2: 'Administrador', 3: 'DMER', 4: 'DOSU' }; return map[Number(id)] || '—' }

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

const STATUS_OPTIONS = [
    { label: 'Aberto', value: 1 },
    { label: 'Em análise', value: 2 },
    { label: 'Em andamento', value: 3 },
    { label: 'Resolvido', value: 4 },
    { label: 'Fechado', value: 5 }
]
const STATUS_BY_ID = Object.fromEntries(STATUS_OPTIONS.map(o => [o.value, o.label]))
function labelStatus(id) { return STATUS_BY_ID[Number(id)] || '—' }
function statusChipColor(id) { const m = { 1: 'primary', 2: 'indigo-6', 3: 'info', 4: 'positive', 5: 'green-8' }; return m[Number(id)] || 'grey-6' }

const mapEl = ref(null)
let map = null
let marker = null

const hasCoords = computed(() => {
    const lat = Number(item.value?.local_latitude)
    const lng = Number(item.value?.local_longitude)
    return Number.isFinite(lat) && Number.isFinite(lng)
})

function onMapResize() { if (map) map.invalidateSize() }

function initMap() {
    if (!mapEl.value || !hasCoords.value) return
    const lat = Number(item.value.local_latitude)
    const lng = Number(item.value.local_longitude)
    map = L.map(mapEl.value, { zoomControl: true })
    map.setView([lat, lng], 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map)
    marker = L.marker([lat, lng]).addTo(map)
    nextTick(() => map?.invalidateSize())
    setTimeout(() => map?.invalidateSize(), 150)
}
function destroyMap() {
    if (marker) { marker.remove(); marker = null }
    if (map) { map.off(); map.remove(); map = null }
}
watch(hasCoords, async (ok) => {
    if (!ok) { destroyMap(); return }
    await nextTick()
    if (!map) initMap()
    else {
        const lat = Number(item.value.local_latitude)
        const lng = Number(item.value.local_longitude)
        map.setView([lat, lng], Math.max(map.getZoom(), 16))
        nextTick(() => map?.invalidateSize())
    }
})
watch(loading, async (isLoading) => {
    if (isLoading || !hasCoords.value) return
    await nextTick()
    if (!map) initMap()
    else map.invalidateSize()
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
function abrirLightbox(i) { lightbox.index = i; lightbox.open = true }
async function copiarProtocolo() {
    try { await copyToClipboard(item.value?.ocorrencia_protocolo || ''); Notify.create({ type: 'positive', message: 'Protocolo copiado' }) }
    catch { Notify.create({ type: 'warning', message: 'Não foi possível copiar' }) }
}

const currentUserId = Number(localStorage.getItem('user_id')) || null
const podeVerAutor = computed(() => {
    const it = item.value
    if (!it) return false
    if (it.ocorrencia_anonima) return false
    if (!Number.isInteger(currentUserId)) return false
    return Number(it.autor_id) === currentUserId
})

const carouselHeight = computed(() => {
    const header = $q.screen.lt.sm ? 48 : 56
    return Math.max($q.screen.height - header, 300) + 'px'
})

onMounted(async () => {
    if (tab.value === 'historico') await carregarHistorico(true)
})

const comentStore = useOcorrenciaComentarioStore()
const comentarios = computed(() => comentStore.list(route.params.id))
const comentTotal = computed(() => comentStore.total(route.params.id))
const comentLoading = computed(() => comentStore.loading)
const comentSaving = computed(() => comentStore.saving)

onMounted(async () => {
    await comentStore.carregar(route.params.id, {
        includeExcluidos: false,
        limit: 1,
        offset: 0,
        force: true,
    })
})

watch(() => route.params.id, async (newId, oldId) => {
    if (newId && newId !== oldId) {
        await comentStore.carregar(newId, {
            includeExcluidos: false,
            limit: 1,
            offset: 0,
            force: true,
        })
    }
})

const novoComentarioTexto = ref('')

function formatComentDate(v) { return v ? date.formatDate(v, 'DD/MM/YYYY HH:mm') : '-' }

async function carregarComentarios(force = false) {
    await comentStore.carregar(route.params.id, {
        includeExcluidos: false,
        limit: 20,
        offset: 0,
        force,
    })
}
async function carregarMaisComentarios() {
    const st = comentStore.pageState(route.params.id)
    await comentStore.paginar(route.params.id, {
        includeExcluidos: false,
        limit: st.limit ?? 20,
        offset: (st.offset ?? 0) + (st.limit ?? 20),
    })
}
async function reloadComentarios() {
    await carregarComentarios(true)
}

async function enviarComentario() {
    const texto = (novoComentarioTexto.value || '').trim()
    if (!texto) return
    if (!Number.isInteger(currentUserId)) {
        Notify.create({ type: 'negative', message: 'Usuário não identificado.' })
        return
    }
    try {
        await comentStore.adicionar(route.params.id, {
            comentario_user_id: Number(currentUserId),
            comentario_texto: texto,
        })
        novoComentarioTexto.value = ''
        reloadComentarios()
    } catch (e) {
        Notify.create({ type: 'negative', message: e?.message || 'Erro ao enviar comentário' })
    }
}

async function softExcluirComentario(comentarioId) {
    try {
        await comentStore.softRemover(route.params.id, comentarioId)
        Notify.create({ type: 'warning', message: 'Comentário marcado como excluído' })
    } catch (e) {
        Notify.create({ type: 'negative', message: e?.message || 'Falha ao excluir' })
    }
}

watch(tab, async (t) => {
    if (t === 'comentarios') {
        const cur = comentStore.list(route.params.id)
        if (!cur.length || cur.length === 1) {
            await comentStore.carregar(route.params.id, {
                includeExcluidos: false,
                limit: 20,
                offset: 0,
                force: true,
            })
        }
    }
})

watch(() => route.params.id, async (newId, oldId) => {
    if (newId && newId !== oldId) {
        await carregarComentarios(true)
    }
})
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

.lightbox-slide {
    background: #000;
}

.lightbox-img-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.lightbox-img {
    max-width: 100vw;
    max-height: calc(100vh - 64px);
    object-fit: contain;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    margin-bottom: 8px;
}

.field__label {
    font-size: 12px;
    color: #607d8b;
}

.field__static {
    padding: 8px 12px;
    background: #f7f7f9;
    border: 1px solid rgba(0, 0, 0, .06);
    border-radius: 10px;
}

.thumb {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .06);
}

.thumb :deep(.q-img) {
    object-fit: cover;
}

.thumb-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 6px;
    padding: 6px;
    opacity: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, .25), rgba(0, 0, 0, 0) 50%);
    transition: opacity .18s ease;
}

.thumb:hover .thumb-overlay {
    opacity: 1;
}

.pill {
    border-radius: 9999px;
    padding: 4px 12px;
    font-weight: 700;
    font-size: 12px;
}

.comentarios-input {
    background: #fff;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px;
}

.comentarios-list :deep(.q-item) {
    border-radius: 10px;
    transition: background-color 0.15s;
}

.comentarios-list :deep(.q-item:hover) {
    background-color: #f9f9fa;
}

.comentarios-list :deep(.q-avatar) {
    font-weight: 700;
    font-size: 14px;
}

.detail-title {
    word-break: break-word;
    line-height: 1.15;
}

.protocol-line {
    align-items: center;
}

@media (max-width: 600px) {
    .detail-header {
        flex-direction: column;
    }

    .right-actions {
        display: none !important;
    }

    .leaflet-map {
        height: 240px;
    }
}
</style>
