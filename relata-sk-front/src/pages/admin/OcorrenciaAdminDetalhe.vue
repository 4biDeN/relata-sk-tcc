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
                <q-card-section class="row items-center q-col-gutter-sm">
                    <div class="col">
                        <div class="text-h6">{{ item.ocorrencia_titulo }}</div>
                        <div class="text-caption">Protocolo: {{ item.ocorrencia_protocolo }}</div>
                    </div>
                    <div class="col-auto row items-center q-gutter-sm">
                        <q-btn :loading="saving" color="green-9" label="Salvar" @click="onSalvar" />
                        <q-btn flat icon="arrow_back" label="Voltar" @click="$router.back()" />
                    </div>
                </q-card-section>

                <q-tabs v-model="tab" dense active-color="green-9" indicator-color="green-9" class="text-grey-7">
                    <q-tab name="detalhe" label="Detalhe" />
                    <q-tab name="historico" label="Histórico" />
                </q-tabs>
                <q-separator />

                <!-- DETALHE -->
                <div v-show="tab === 'detalhe'">
                    <q-card-section>
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <div class="text-bold text-grey-7 q-mb-xs">Resumo</div>
                                <div class="q-mb-xs"><span class="text-grey-7">Data:</span> {{ dataFmt }}</div>
                                <div class="q-mb-xs"><span class="text-grey-7">Local:</span> {{ enderecoFmt }}</div>
                            </div>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section class="adm-panel">
                        <div class="adm-panel__head">
                            <div class="adm-panel__title">Edição de Status</div>
                            <div class="adm-panel__hint">Ajuste status, prioridade e atribuição</div>
                        </div>

                        <div class="panel-grid">
                            <div class="field">
                                <div class="field__label"><q-icon name="flag" size="16px" class="q-mr-xs" /> Status
                                </div>
                                <q-select v-model="form.ocorrencia_status" :options="statusOptions" emit-value
                                    map-options dense filled class="field__control" popup-content-class="adm-menu"
                                    dropdown-icon="keyboard_arrow_down">
                                    <template #selected>
                                        <q-chip dense square :color="statusChipColor(form.ocorrencia_status)"
                                            text-color="white" class="pill">
                                            {{ labelStatus(form.ocorrencia_status) }}
                                        </q-chip>
                                    </template>
                                    <template #option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section>
                                                <q-chip dense square :color="statusChipColor(scope.opt.value)"
                                                    text-color="white" class="pill">
                                                    {{ scope.opt.label }}
                                                </q-chip>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </div>

                            <div class="field">
                                <div class="field__label"><q-icon name="priority_high" size="16px" class="q-mr-xs" />
                                    Prioridade</div>
                                <q-select v-model="form.ocorrencia_prioridade" :options="prioridadeOptions" emit-value
                                    map-options dense filled class="field__control" popup-content-class="adm-menu"
                                    dropdown-icon="keyboard_arrow_down">
                                    <template #selected>
                                        <q-chip dense square :color="prioridadeChipColor(form.ocorrencia_prioridade)"
                                            text-color="white" class="pill">
                                            {{ labelPrioridade(form.ocorrencia_prioridade) }}
                                        </q-chip>
                                    </template>
                                    <template #option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section>
                                                <q-chip dense square :color="prioridadeChipColor(scope.opt.value)"
                                                    text-color="white" class="pill">
                                                    {{ scope.opt.label }}
                                                </q-chip>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </div>

                            <div class="field">
                                <div class="field__label"><q-icon name="group" size="16px" class="q-mr-xs" /> Atribuída
                                </div>
                                <q-select v-model="form.ocorrencia_atribuida" :options="atribuidaOptions" emit-value
                                    map-options dense filled class="field__control" popup-content-class="adm-menu"
                                    dropdown-icon="keyboard_arrow_down">
                                    <template #selected>
                                        <q-chip dense square :color="atribuidaChipColor(form.ocorrencia_atribuida)"
                                            text-color="white" class="pill">
                                            {{ labelAtribuida(form.ocorrencia_atribuida) }}
                                        </q-chip>
                                    </template>
                                    <template #option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section>
                                                <q-chip dense square :color="atribuidaChipColor(scope.opt.value)"
                                                    text-color="white" class="pill">
                                                    {{ scope.opt.label }}
                                                </q-chip>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
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

                    <q-separator />

                    <q-card-section>
                        <div class="row items-center q-mb-sm">
                            <div class="col">
                                <div class="text-bold text-grey-8">Imagens</div>
                                <div class="text-caption text-grey-6">{{ imagens.length }} anexo(s)</div>
                            </div>
                            <div class="col-auto row items-center q-gutter-sm">
                                <q-btn v-if="queue.length" color="green-9" icon="cloud_upload"
                                    :label="`Enviar (${queue.length})`" :loading="uploading" @click="uploadQueue" />
                                <q-btn v-if="queue.length" flat label="Limpar" @click="limparFila" />
                            </div>
                        </div>

                        <q-dialog v-model="lightbox.open" maximized transition-show="fade" transition-hide="fade">
                            <q-card class="bg-black">
                                <q-bar class="bg-black text-white">
                                    <div class="text-subtitle2">Imagens</div>
                                    <q-space />
                                    <q-btn flat dense round icon="close" v-close-popup />
                                </q-bar>
                                <q-card-section class="q-pa-none">
                                    <q-carousel v-model="lightbox.index" swipeable animated arrows infinite
                                        control-color="white" class="bg-black" :height="carouselHeight">
                                        <q-carousel-slide v-for="(img, i) in imagens" :key="i" :name="i">
                                            <div class="lightbox-img-wrap">
                                                <img :src="img.ocorrencia_imagem_url" class="lightbox-img" />
                                            </div>
                                        </q-carousel-slide>
                                    </q-carousel>
                                </q-card-section>
                            </q-card>
                        </q-dialog>

                        <q-file v-model="queue" multiple accept="image/*" use-chips counter dense outlined
                            :max-files="12" label="Adicionar imagens">
                            <template #append><q-icon name="photo_camera" /></template>
                        </q-file>

                        <div class="row q-col-gutter-sm q-mt-sm" v-if="imagens.length">
                            <div v-for="(img, i) in imagens" :key="img.ocorrencia_imagem_id || i"
                                class="col-6 col-sm-4 col-md-3 col-lg-2">
                                <q-card flat bordered class="thumb">
                                    <q-img :src="img.ocorrencia_imagem_url" ratio="1" class="cursor-pointer"
                                        @click="abrirLightbox(i)" />
                                    <div class="thumb-action">
                                        <q-btn dense round size="sm" color="negative" icon="delete"
                                            @click.stop="confirmRemover(img.ocorrencia_imagem_id)" />
                                    </div>
                                </q-card>
                            </div>
                        </div>
                        <div v-else class="text-grey-6 q-mt-sm">Nenhuma imagem anexada.</div>

                        <div v-if="previews.length" class="q-mt-md">
                            <div class="text-caption text-grey-7 q-mb-xs">Novas imagens (ainda não enviadas)</div>
                            <div class="row q-col-gutter-sm">
                                <div v-for="(img, i) in previews" :key="i" class="col-6 col-sm-4 col-md-3 col-lg-2">
                                    <q-card flat bordered>
                                        <q-img :src="img" ratio="1" />
                                        <q-card-actions align="right">
                                            <q-btn dense flat icon="delete" color="negative"
                                                @click="removerNovaImagem(i)" />
                                        </q-card-actions>
                                    </q-card>
                                </div>
                            </div>
                        </div>
                    </q-card-section>

                    <q-dialog v-model="dlgRemover.open" persistent>
                        <q-card>
                            <q-card-section class="text-h6">Remover imagem</q-card-section>
                            <q-card-section>Deseja realmente remover esta imagem?</q-card-section>
                            <q-card-actions align="right">
                                <q-btn flat label="Cancelar" color="grey" v-close-popup />
                                <q-btn flat label="Remover" color="negative" @click="removerImagem(dlgRemover.id)" />
                            </q-card-actions>
                        </q-card>
                    </q-dialog>
                </div>

                <div v-show="tab === 'historico'">
                    <q-card-section>
                        <div class="row items-center q-col-gutter-sm q-mb-sm">
                            <div class="col">
                                <div class="text-bold text-grey-8">Histórico</div>
                                <div class="text-caption text-grey-6">{{ histTotal }} registro(s)</div>
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

                        <q-timeline color="green-9" layout="loose" side="right" v-if="historicoFiltrado.length">
                            <q-timeline-entry v-for="h in historicoFiltrado" :key="h.historico_id"
                                :subtitle="formatHistDate(h.changed_at)" :icon="acaoIcon(h)"
                                :color="entidadeColor(h.entidade)">
                                <template #title>
                                    <div class="row items-center no-wrap">
                                        <q-chip dense square :color="entidadeColor(h.entidade)" text-color="white"
                                            class="pill q-mr-sm">
                                            {{ labelEntidade(h.entidade) }}
                                        </q-chip>
                                        <span class="text-weight-bold">{{ labelAcao(h.acao) }}</span>
                                    </div>
                                </template>

                                <div class="text-body2">
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

                                    <div class="text-caption text-grey-6 q-mt-xs">
                                        {{ usuarioFmt(h) }}
                                        <template v-if="h.entidade_id"> • ID: {{ h.entidade_id }}</template>
                                    </div>
                                </div>
                            </q-timeline-entry>
                        </q-timeline>

                        <div v-else class="text-grey-6">Sem histórico disponível.</div>

                        <div class="row justify-center q-mt-md" v-if="historico.length < histTotal">
                            <q-btn flat :loading="histLoading" label="Carregar mais" @click="carregarMaisHistorico" />
                        </div>
                    </q-card-section>
                </div>
            </template>
        </q-card>
    </q-page>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, watch, reactive, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { date, useQuasar } from 'quasar'
import { useOcorrenciaDetalheStore } from 'src/stores/ocorrenciaDetalhe'
import { useOcorrenciaImagemStore } from 'src/stores/ocorrenciaImagem'
import { useOcorrenciaHistoricoStore } from 'src/stores/ocorrenciaHistorico'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const store = useOcorrenciaDetalheStore()
const imgStore = useOcorrenciaImagemStore()
const histStore = useOcorrenciaHistoricoStore()

const id = String(route.params.id)
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const item = ref(null)
const tab = ref('detalhe')

const historico = computed(() => histStore.list(id))
const histTotal = computed(() => histStore.total(id))
const histLoading = computed(() => histStore.loading)

const imagens = computed(() => imgStore.list(id))

const form = reactive({
    ocorrencia_status: null,
    ocorrencia_prioridade: null,
    ocorrencia_atribuida: null,
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
    filtro.entidade ? historico.value.filter(h => h.entidade === filtro.entidade) : historico.value
)

const carouselHeight = computed(() => Math.max(300, window.innerHeight - 80) + 'px')

const statusOptions = [
    { label: 'Aberto', value: 1 },
    { label: 'Em análise', value: 2 },
    { label: 'Em andamento', value: 3 },
    { label: 'Resolvido', value: 4 },
    { label: 'Fechado', value: 5 },
]
const prioridadeOptions = [
    { label: 'Urgente', value: 4 },
    { label: 'Alta', value: 1 },
    { label: 'Normal', value: 2 },
    { label: 'Baixa', value: 3 },
]
const atribuidaOptions = [
    { label: 'Cidadão', value: 1 },
    { label: 'Administrador', value: 2 },
    { label: 'DMER', value: 3 },
    { label: 'DOSU', value: 4 },
]

const byLabel = (opts) => Object.fromEntries(opts.map((o) => [o.label, o.value]))
const byId = (opts) => Object.fromEntries(opts.map((o) => [o.value, o.label]))

const STATUS_BY_LABEL = byLabel(statusOptions)
const STATUS_BY_ID = byId(statusOptions)
const PRIO_BY_LABEL = byLabel(prioridadeOptions)
const PRIO_BY_ID = byId(prioridadeOptions)
const ATRIB_BY_LABEL = byLabel(atribuidaOptions)
const ATRIB_BY_ID = byId(atribuidaOptions)

function labelStatus(id) { return STATUS_BY_ID[Number(id)] || '—' }
function labelPrioridade(id) { return PRIO_BY_ID[Number(id)] || '—' }
function labelAtribuida(id) { return ATRIB_BY_ID[Number(id)] || '—' }

function statusChipColor(id) { const m = { 1: 'primary', 2: 'indigo-6', 3: 'info', 4: 'positive', 5: 'green-8' }; return m[Number(id)] || 'grey-6' }
function prioridadeChipColor(id) { const m = { 4: 'red-7', 1: 'deep-orange-7', 2: 'primary', 3: 'grey-7' }; return m[Number(id)] || 'grey-6' }
function atribuidaChipColor(id) { const m = { 1: 'grey-7', 2: 'primary', 3: 'deep-orange-6', 4: 'indigo-6' }; return m[Number(id)] || 'grey-6' }

function entidadeColor(ent) {
    const map = {
        status: 'green-7',
        prioridade: 'orange-7',
        atribuicao: 'indigo-6',
        titulo: 'blue-6',
        descricao: 'cyan-7',
        imagem: 'purple-6',
        comentario: 'teal-6',
        local: 'brown-6',
        anonima: 'deep-purple-5',
        excluida: 'grey-7',
        ocorrencia: 'primary',
    }
    return map[ent] || 'grey-6'
}
function entidadeIcon(ent) {
    const map = {
        status: 'flag',
        prioridade: 'priority_high',
        atribuicao: 'group',
        titulo: 'title',
        descricao: 'notes',
        imagem: 'photo',
        comentario: 'chat',
        local: 'place',
        anonima: 'visibility_off',
        excluida: 'delete_outline',
        ocorrencia: 'info',
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

const dataFmt = computed(() => {
    const d = item.value?.ocorrencia_data
    return d ? date.formatDate(d, 'DD/MM/YYYY HH:mm') : '-'
})

const enderecoFmt = computed(() => {
    const i = item.value || {}
    const base = `${i.local_rua}, ${i.local_bairro} – ${i.municipio_nome}/${i.local_estado}`
    return i.local_complemento ? `${base} (${i.local_complemento})` : base
})

const queue = ref([])
const previews = ref([])
const uploading = ref(false)
const lightbox = reactive({ open: false, index: 0 })
const dlgRemover = reactive({ open: false, id: null })

function formatHistDate(v) { return v ? date.formatDate(v, 'DD/MM/YYYY HH:mm') : '-' }

async function carregarHistorico(force = false) {
    await histStore.carregar(id, { limit: 20, offset: 0, force })
}
async function carregarMaisHistorico() {
    const st = histStore.pageState(id)
    await histStore.paginar(id, { limit: st.limit, offset: st.offset + st.limit })
}

watch(tab, async (t) => {
    if (t === 'historico' && historico.value.length === 0) {
        await carregarHistorico(true)
    }
})

watch(queue, (val) => {
    previews.value.forEach((u) => URL.revokeObjectURL(u))
    previews.value = (val || []).map((f) => URL.createObjectURL(f))
})

function limparFila() {
    previews.value.forEach((u) => URL.revokeObjectURL(u))
    previews.value = []
    queue.value = []
}

function removerNovaImagem(i) {
    const url = previews.value[i]
    if (url) URL.revokeObjectURL(url)
    previews.value.splice(i, 1)
    queue.value.splice(i, 1)
}

async function uploadQueue() {
    if (!queue.value.length) return
    uploading.value = true
    try {
        await imgStore.adicionar(id, queue.value)
        limparFila()
        await carregar(true)
        await nextTick()
        onMapResize()
        $q.notify({ type: 'positive', message: 'Imagens enviadas com sucesso.' })
    } catch {
        $q.notify({ type: 'negative', message: 'Falha ao enviar as imagens.' })
    } finally {
        uploading.value = false
    }
}

async function removerImagem(imagemId) {
    try {
        await imgStore.remover(id, imagemId)
        dlgRemover.open = false
        await carregar(true)
        await nextTick()
        onMapResize()
        $q.notify({ type: 'positive', message: 'Imagem removida' })
    } catch {
        $q.notify({ type: 'negative', message: 'Falha ao remover' })
    }
}

function abrirLightbox(i) { lightbox.index = i; lightbox.open = true }
function confirmRemover(imagemId) { dlgRemover.id = imagemId; dlgRemover.open = true }

watch(() => hasCoords.value, (v) => { destroyMap(); if (v) initMap() })

async function carregar(force = false) {
    loading.value = true
    error.value = null
    try {
        const data = await store.carregar(id, { force })
        await imgStore.carregar(id, { force })
        item.value = data

        const st = data.ocorrencia_status_id ?? data.status_id ?? data.ocorrencia_status ?? data.ocorrencia_status_nome
        form.ocorrencia_status = Number.isFinite(Number(st)) ? Number(st) : (STATUS_BY_LABEL[String(st)] ?? 0)

        const pr = data.ocorrencia_prioridade_id ?? data.prioridade_id ?? data.ocorrencia_prioridade ?? data.ocorrencia_prioridade_nome
        form.ocorrencia_prioridade = Number.isFinite(Number(pr)) ? Number(pr) : (PRIO_BY_LABEL[String(pr)] ?? 0)

        const at = data.ocorrencia_atribuida_id ?? data.atribuida_id ?? data.ocorrencia_atribuida ?? data.atribuida_nome
        form.ocorrencia_atribuida = Number.isFinite(Number(at)) ? Number(at) : (ATRIB_BY_LABEL[String(at)] ?? 0)

        await nextTick()
        destroyMap()
        if (hasCoords.value) initMap()
    } catch (e) {
        error.value = e
    } finally {
        loading.value = false
    }
}

async function onSalvar() {
    saving.value = true
    try {
        const payload = {
            ocorrencia_status: Number(form.ocorrencia_status),
            ocorrencia_prioridade: Number(form.ocorrencia_prioridade),
            ocorrencia_atribuida: Number(form.ocorrencia_atribuida ?? 0),
        }
        await store.atualizar(id, payload)
        $q.notify({ type: 'positive', message: 'Ocorrência salva' })
        setTimeout(() => { router.push({ name: 'admin.ocorrencias' }) }, 100)
    } catch {
        $q.notify({ type: 'negative', message: 'Falha ao salvar' })
    } finally {
        saving.value = false
    }
}

onMounted(() => carregar(true))
onBeforeUnmount(() => destroyMap())

onMounted(async () => {
    if (tab.value === 'historico') await carregarHistorico(true)
})

function usuarioFmt(h) {
    const idPart = h?.changed_by != null ? `#${h.changed_by}` : '—'
    const namePart = h?.changed_by_username ? ` — ${h.changed_by_username}` : ''
    return `Usuário: ${idPart}${namePart}`
}
</script>

<style scoped>
.leaflet-wrap {
    border-radius: 12px;
    overflow: hidden;
}

.leaflet-map {
    width: 100%;
    height: 320px;
}

.thumb {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .06);
}

.thumb-action {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
}

.thumb :deep(img),
.thumb :deep(.q-img) {
    object-fit: cover;
}

.lightbox-img-wrap {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    background: #000;
}

.lightbox-img {
    max-width: 100%;
    max-height: calc(100vh - 120px);
    object-fit: contain;
}

.adm-panel {
    background: #f6f7f8;
    border-radius: 12px;
}

.adm-panel__head {
    margin-bottom: 8px;
}

.adm-panel__title {
    font-weight: 700;
    color: #455a64;
}

.adm-panel__hint {
    font-size: 12px;
    color: #90a4ae;
}

.panel-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

@media (max-width: 1024px) {
    .panel-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 680px) {
    .panel-grid {
        grid-template-columns: 1fr;
    }
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}

.field__label {
    font-size: 12px;
    color: #607d8b;
    display: flex;
    align-items: center;
}

.field__control :deep(.q-field__control) {
    min-height: 40px;
    border-radius: 10px;
    padding: 0 8px;
}

.field__control :deep(.q-field__marginal) {
    margin-left: 4px;
}

.adm-menu :deep(.q-item) {
    padding: 4px 8px;
}

.pill {
    border-radius: 9999px;
    padding: 4px 12px;
    font-weight: 700;
    font-size: 12px;
}
</style>
