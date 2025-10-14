<template>
    <q-page padding>
        <q-card flat bordered>
            <q-card-section>
                <div class="row items-center q-col-gutter-sm">
                    <q-input v-model="busca" dense placeholder="Buscar por título ou protocolo" class="col-12 col-sm-4"
                        @keyup.enter="carregar" clearable />
                    <q-select v-model="statusSel" :options="statusOptions" label="Status" dense class="col-6 col-sm-2"
                        clearable emit-value map-options />
                    <q-select v-model="prioridadeSel" :options="prioridadeOptions" label="Prioridade" dense
                        class="col-6 col-sm-2" clearable emit-value map-options />
                    <q-toggle v-model="onlyWithImages" label="Somente com imagens" />
                    <q-space />
                    <q-btn color="primary" label="Buscar" @click="carregar" />
                    <q-btn flat label="Limpar" @click="limpar" />
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
                        <q-td :props="props">
                            <q-select dense borderless options-dense emit-value map-options :options="statusOptions"
                                v-model="props.row.status_id"
                                @update:model-value="v => salvarCampo(props.row, 'ocorrencia_status', Number(v))"
                                @click.stop @mousedown.stop @keydown.stop class="pill-select"
                                popup-content-class="pill-menu">
                                <template #selected>
                                    <q-chip clickable size="sm" :color="statusChipColor(props.row.status_id)"
                                        text-color="white" class="q-ma-none rounded-pill">
                                        {{ labelStatus(props.row.status_id) }}
                                    </q-chip>
                                </template>

                                <template #option="scope">
                                    <q-item v-bind="scope.itemProps" clickable>
                                        <q-item-section>
                                            <q-chip size="sm" :color="statusChipColor(scope.opt.value)"
                                                text-color="white" class="q-ma-none rounded-pill">
                                                {{ scope.opt.label }}
                                            </q-chip>
                                        </q-item-section>
                                    </q-item>
                                </template>
                            </q-select>
                        </q-td>
                    </template>

                    <template #body-cell-prioridade_nome="props">
                        <q-td :props="props">
                            <q-select dense borderless options-dense emit-value map-options :options="prioridadeOptions"
                                v-model="props.row.prioridade_id"
                                @update:model-value="v => salvarCampo(props.row, 'ocorrencia_prioridade', v)"
                                @click.stop @mousedown.stop @keydown.stop class="pill-select"
                                popup-content-class="pill-menu">
                                <template #selected>
                                    <q-chip clickable size="sm" :color="prioridadeChipColor(props.row.prioridade_id)"
                                        text-color="white" class="q-ma-none rounded-pill">
                                        {{ labelPrioridade(props.row.prioridade_id) }}
                                    </q-chip>
                                </template>

                                <template #option="scope">
                                    <q-item v-bind="scope.itemProps" clickable>
                                        <q-item-section>
                                            <q-chip size="sm" :color="prioridadeChipColor(scope.opt.value)"
                                                text-color="white" class="q-ma-none rounded-pill">
                                                {{ scope.opt.label }}
                                            </q-chip>
                                        </q-item-section>
                                    </q-item>
                                </template>
                            </q-select>
                        </q-td>
                    </template>

                    <template #body-cell-atribuida_setor="props">
                        <q-td :props="props">
                            <q-select dense borderless options-dense emit-value map-options :options="atribuidaOptions"
                                v-model="props.row.atribuida_id"
                                @update:model-value="v => salvarCampo(props.row, 'ocorrencia_atribuida', v)" @click.stop
                                @mousedown.stop @keydown.stop class="pill-select" popup-content-class="pill-menu">
                                <template #selected>
                                    <q-chip clickable size="sm" :color="atribuidaChipColor(props.row.atribuida_id)"
                                        text-color="white" class="q-ma-none rounded-pill">
                                        {{ labelAtribuida(props.row.atribuida_id) }}
                                    </q-chip>
                                </template>

                                <template #option="scope">
                                    <q-item v-bind="scope.itemProps" clickable>
                                        <q-item-section>
                                            <q-chip size="sm" :color="atribuidaChipColor(scope.opt.value)"
                                                text-color="white" class="q-ma-none rounded-pill">
                                                {{ scope.opt.label }}
                                            </q-chip>
                                        </q-item-section>
                                        <q-item-section side v-if="props.row.atribuida_id === scope.opt.value">
                                        </q-item-section>
                                    </q-item>
                                </template>
                            </q-select>
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
import { ref, onMounted } from 'vue'
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

function limpar() {
    busca.value = ''
    statusSel.value = null
    prioridadeSel.value = null
    onlyWithImages.value = false
    pagination.value.page = 1
    carregar()
}

function irDetalhe(evt, row) {
    // reaproveita a mesma página de detalhe do cidadão por enquanto
    // depois criaremos um detalhe admin com ações (editar/atribuir)
    // e navegaremos para /admin/ocorrencias/:id
    if (!row?.ocorrencia_id) return
    // cliente:
    // router.push(`/home/ocorrencias/${row.ocorrencia_id}`)
    // admin (quando fizermos a rota):
    // router.push(`/admin/ocorrencias/${row.ocorrencia_id}`)
    router.push(`/home/ocorrencias/${row.ocorrencia_id}`)
}

onMounted(carregar)
</script>

<style scoped>
.max-w-320 {
    max-width: 320px;
}

.pill-select .q-field__control {
    padding: 0;
    min-height: auto;
}

.pill-select .q-field__marginal {
    display: none;
}

.rounded-pill {
    border-radius: 9999px;
}

.pill-menu .q-item {
    padding: 4px 8px;
}
</style>