<template>
    <q-page padding>
        <q-card flat bordered>
            <q-card-section>
                <div class="filters-wrap">
                    <div class="row items-center q-col-gutter-sm">
                        <q-input v-model="busca" dense placeholder="Buscar por título ou protocolo"
                            class="col-12 col-sm-4" @keyup.enter="carregar" clearable />

                        <q-input v-model="fromDisplay" label="De" dense class="col-6 col-sm-2" clearable readonly>
                            <template #append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy ref="fromProxy" transition-show="scale" transition-hide="scale"
                                        anchor="bottom right" self="top right">
                                        <q-date v-model="from" mask="YYYY-MM-DD" minimal :locale="ptBR"
                                            @update:model-value="onPickFrom" />
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>

                        <q-input v-model="toDisplay" label="Até" dense class="col-6 col-sm-2" clearable readonly>
                            <template #append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy ref="toProxy" transition-show="scale" transition-hide="scale"
                                        anchor="bottom right" self="top right">
                                        <q-date v-model="to" mask="YYYY-MM-DD" minimal :locale="ptBR"
                                            @update:model-value="onPickTo" />
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>

                        <q-select v-model="statusSel" :options="statusOptions" label="Status" dense
                            class="col-6 col-sm-2" clearable emit-value map-options />
                        <q-select v-model="prioridadeSel" :options="prioridadeOptions" label="Prioridade" dense
                            class="col-6 col-sm-2" clearable emit-value map-options />

                        <q-toggle v-model="onlyWithImages" label="Somente com imagens" />

                        <q-space />

                        <q-btn color="green-9" label="Buscar" @click="carregar" />
                    </div>
                </div>

            </q-card-section>
            <q-separator />

            <q-card-section>
                <q-table :rows="rows" :columns="columns" row-key="ocorrencia_id" :loading="loading"
                    :rows-per-page-options="[10, 20, 50, 100]" rows-per-page-label="Registros por página"
                    loading-label="Carregando..." no-data-label="Nenhuma ocorrência encontrada"
                    :pagination-label="pagiLabel" :pagination="pagination" @row-click="irDetalhe"
                    class="cursor-pointer">
                    <template #body-cell-thumb="props">
                        <q-td :props="props" style="width:72px">
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
                                <q-badge v-if="props.row.imagens_count" class="q-ml-sm" color="grey-7"
                                    text-color="white">
                                    {{ props.row.imagens_count }}
                                </q-badge>
                            </div>
                            <div class="text-caption text-grey-7 ellipsis">Protocolo: {{ props.row.ocorrencia_protocolo
                                }}</div>
                        </q-td>
                    </template>

                    <template #body-cell-ocorrencia_status_nome="props">
                        <q-td :props="props" class="pill-td" @click.stop>
                            <div class="pill-wrap">
                                <q-select class="pill-select" dense borderless options-dense emit-value map-options
                                    :options="statusOptions" v-model="props.row.status_id"
                                    dropdown-icon="keyboard_arrow_down"
                                    @update:model-value="v => salvarCampo(props.row, 'ocorrencia_status', Number(v))"
                                    @click.stop @mousedown.stop @keydown.stop popup-content-class="pill-menu">
                                    <template #selected>
                                        <q-chip dense square :color="statusChipColor(props.row.status_id)"
                                            text-color="white" class="rounded-pill pill-chip" @click.stop>
                                            {{ labelStatus(props.row.status_id) }}
                                        </q-chip>
                                    </template>
                                    <template #option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section>
                                                <q-chip dense square :color="statusChipColor(scope.opt.value)"
                                                    text-color="white" class="rounded-pill">
                                                    {{ scope.opt.label }}
                                                </q-chip>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </div>
                        </q-td>
                    </template>

                    <template #body-cell-prioridade_nome="props">
                        <q-td :props="props" class="pill-td" @click.stop>
                            <div class="pill-wrap">
                                <q-select class="pill-select" dense borderless options-dense emit-value map-options
                                    :options="prioridadeOptions" v-model="props.row.prioridade_id"
                                    dropdown-icon="keyboard_arrow_down"
                                    @update:model-value="v => salvarCampo(props.row, 'ocorrencia_prioridade', v)"
                                    @click.stop @mousedown.stop @keydown.stop popup-content-class="pill-menu">
                                    <template #selected>
                                        <q-chip dense square :color="prioridadeChipColor(props.row.prioridade_id)"
                                            text-color="white" class="rounded-pill pill-chip" @click.stop>
                                            {{ labelPrioridade(props.row.prioridade_id) }}
                                        </q-chip>
                                    </template>
                                    <template #option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section>
                                                <q-chip dense square :color="prioridadeChipColor(scope.opt.value)"
                                                    text-color="white" class="rounded-pill">
                                                    {{ scope.opt.label }}
                                                </q-chip>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </div>
                        </q-td>
                    </template>

                    <template #body-cell-atribuida_setor="props">
                        <q-td :props="props" class="pill-td" @click.stop>
                            <div class="pill-wrap">
                                <q-select class="pill-select" dense borderless options-dense emit-value map-options
                                    :options="atribuidaOptions" v-model="props.row.atribuida_id"
                                    dropdown-icon="keyboard_arrow_down"
                                    @update:model-value="v => salvarCampo(props.row, 'ocorrencia_atribuida', v)"
                                    @click.stop @mousedown.stop @keydown.stop popup-content-class="pill-menu">
                                    <template #selected>
                                        <q-chip dense square :color="atribuidaChipColor(props.row.atribuida_id)"
                                            text-color="white" class="rounded-pill pill-chip" @click.stop>
                                            {{ labelAtribuida(props.row.atribuida_id) }}
                                        </q-chip>
                                    </template>
                                    <template #option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section>
                                                <q-chip dense square :color="atribuidaChipColor(scope.opt.value)"
                                                    text-color="white" class="rounded-pill">
                                                    {{ scope.opt.label }}
                                                </q-chip>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </div>
                        </q-td>
                    </template>

                    <template #body-cell-ocorrencia_data="props">
                        <q-td :props="props">{{ formatDateISOToBR(props.row.ocorrencia_data) }}</q-td>
                    </template>

                    <template #no-data>
                        <div class="full-width q-pa-lg text-center text-grey-6">
                            Nenhuma ocorrência encontrada.
                        </div>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { listOcorrencias, updateOcorrenciaService } from 'src/services/ocorrenciaService'

const router = useRouter()
const busca = ref('')
const statusSel = ref(null)
const prioridadeSel = ref(null)
const onlyWithImages = ref(false)
const loading = ref(false)
const rows = ref([])
const pagination = ref({ page: 1, rowsPerPage: 20 })

const from = ref('')
const to = ref('')
const fromProxy = ref(null)
const toProxy = ref(null)

const ptBR = {
    days: 'domingo_segunda-feira_terca-feira_quarta-feira_quinta-feira_sexta-feira_sabado'.split('_'),
    daysShort: 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
    months: 'janeiro_fevereiro_marco_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
    monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
    firstDayOfWeek: 1
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
    set: (v) => { from.value = toYMD(v) }
})
const toDisplay = computed({
    get: () => toBR(to.value),
    set: (v) => { to.value = toYMD(v) }
})

function onPickFrom() { fromProxy.value?.hide() }
function onPickTo() { toProxy.value?.hide() }

watch([from, to], ([f, t]) => {
    if (f && t && new Date(f) > new Date(t)) {
        const tmp = from.value
        from.value = to.value
        to.value = tmp
    }
})

const columns = [
    { name: 'thumb', label: '', field: 'thumbnail_url', align: 'left' },
    { name: 'ocorrencia_titulo', label: 'Título / Protocolo', field: 'ocorrencia_titulo', align: 'left', classes: 'max-w-320' },
    { name: 'ocorrencia_data', label: 'Data', field: 'ocorrencia_data', align: 'left' },
    { name: 'ocorrencia_status_nome', label: 'Status', field: 'ocorrencia_status_nome', align: 'left' },
    { name: 'prioridade_nome', label: 'Prioridade', field: 'prioridade_nome', align: 'left' },
    { name: 'atribuida_setor', label: 'Atribuída a', field: 'atribuida_setor', align: 'left' },
]

const statusOptions = [
    { label: 'Aberto', value: 1 },
    { label: 'Em análise', value: 2 },
    { label: 'Em andamento', value: 3 },
    { label: 'Resolvido', value: 4 },
    { label: 'Fechado', value: 5 }
]
const prioridadeOptions = [
    { label: 'Urgente', value: 4 },
    { label: 'Alta', value: 1 },
    { label: 'Normal', value: 2 },
    { label: 'Baixa', value: 3 }
]
const atribuidaOptions = [
    { label: 'Cidadão', value: 1 },
    { label: 'Administrador', value: 2 },
    { label: 'DMER', value: 3 },
    { label: 'DOSU', value: 4 }
]

function labelStatus(id) {
    return statusOptions.find(o => o.value === Number(id))?.label || '—'
}
const labelPrioridade = (id) =>
    prioridadeOptions.find(o => o.value === Number(id))?.label || '—'
const labelAtribuida = (id) =>
    atribuidaOptions.find(o => o.value === Number(id))?.label || '—'

function statusChipColor(id) {
    const map = { 1: 'primary', 2: 'indigo-6', 3: 'info', 4: 'positive', 5: 'green-8' }
    return map[Number(id)] || 'grey-6'
}
function prioridadeChipColor(id) {
    const map = { 4: 'red-7', 1: 'deep-orange-7', 2: 'primary', 3: 'grey-7' }
    return map[Number(id)] || 'grey-6'
}
function atribuidaChipColor(id) {
    const map = { 1: 'grey-7', 2: 'primary', 3: 'deep-orange-6', 4: 'indigo-6' }
    return map[Number(id)] || 'grey-6'
}

async function salvarCampo(row, campo, valor) {
    const id = row.ocorrencia_id
    const snap = {
        status_id: row.status_id,
        prioridade_id: row.prioridade_id,
        atribuida_id: row.atribuida_id
    }
    try {
        if (campo === 'ocorrencia_status') row.status_id = Number(valor)
        if (campo === 'ocorrencia_prioridade') row.prioridade_id = Number(valor)
        if (campo === 'ocorrencia_atribuida') row.atribuida_id = Number(valor)

        await updateOcorrenciaService(id, { [campo]: Number(valor) })
        Notify.create({ type: 'positive', message: 'Alteração salva' })
    } catch {
        Object.assign(row, snap)
        Notify.create({ type: 'negative', message: 'Falha ao salvar alteração' })
    }
}

function normalizeRows(list) {
    return list.map(r => ({
        ...r,
        status_id: Number(r.ocorrencia_status_id ?? r.ocorrencia_status ?? 0),
        prioridade_id: Number(r.ocorrencia_prioridade_id ?? r.ocorrencia_prioridade ?? 0),
        atribuida_id: Number(r.ocorrencia_atribuida_id ?? r.ocorrencia_atribuida ?? 0),
        prioridade_nome: r.ocorrencia_prioridade_nome || null,
        imagens_count: Number(r.imagens_count ?? 0),
        thumbnail_url: r.thumbnail_url ?? null
    }))
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
function pagiLabel(firstRow, endRow, totalRows) {
    return `${firstRow}-${endRow} de ${totalRows}`
}

async function carregar() {
    loading.value = true
    try {
        const params = {
            q: busca.value?.trim() || '',
            status: statusSel.value ?? undefined,
            prioridade: prioridadeSel.value ?? undefined,
            withImages: onlyWithImages.value ? 1 : 0,
            from: from.value || undefined,
            to: to.value || undefined,
            orderDir: 'desc',
            limit: pagination.value.rowsPerPage,
            offset: (pagination.value.page - 1) * pagination.value.rowsPerPage
        }
        const { data, total } = await listOcorrencias(params)
        rows.value = normalizeRows(data)
        pagination.value.rowsNumber = total
    } catch {
        Notify.create({ type: 'negative', message: 'Falha ao carregar ocorrências.' })
        rows.value = []
        pagination.value.rowsNumber = 0
    } finally {
        loading.value = false
    }
}


function isEditorEvent(evt) {
    const path = typeof evt.composedPath === 'function' ? evt.composedPath() : []
    const testEl = (el) => {
        if (!el || !el.classList) return false
        return el.classList.contains('pill-select')
            || el.classList.contains('pill-menu')
            || el.classList.contains('q-field')
            || el.classList.contains('q-menu')
            || el.classList.contains('q-chip')
    }
    if (path.length) return path.some(testEl)
    const t = evt.target
    return !!(t?.closest && t.closest('.pill-select, .pill-menu, .q-field, .q-menu, .q-chip'))
}

function irDetalhe(evt, row) {
    if (isEditorEvent(evt)) return
    if (!row?.ocorrencia_id) return
    router.push({ name: 'admin.ocorrencia.detalhe', params: { id: String(row.ocorrencia_id) } })
}

onMounted(carregar)
</script>

<style scoped>
.max-w-320 {
    max-width: 320px;
}

.pill-td {
    padding: 6px 8px !important;
}

.pill-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-width: 0;
}

.pill-select {
    min-width: 120px;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 2px;
}

:deep(.pill-select .q-field__control) {
    padding: 0;
    min-height: 0;
}

:deep(.pill-select .q-field__marginal) {
    margin-left: 4px;
}

:deep(.pill-menu .q-item) {
    padding: 4px 8px;
}

.rounded-pill {
    border-radius: 9999px;
    padding: 4px 12px;
    font-weight: 600;
    font-size: 12px;
}

.pill-chip {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.no-pointer-events {
    pointer-events: none;
}

@media (max-width: 1024px) {
    .pill-select {
        min-width: 96px;
    }
}

@media (max-width: 768px) {
    .pill-select {
        min-width: 84px;
    }
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
    padding: 0 24px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: white;
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
</style>