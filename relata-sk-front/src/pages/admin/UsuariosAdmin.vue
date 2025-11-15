<template>
    <q-page class="q-pa-md users-page">
        <q-card flat class="surface">
            <q-card-section class="q-pt-md q-pb-sm">
                <div class="row items-center justify-between">
                    <div class="row items-center q-gutter-sm">
                        <q-avatar size="32px" class="bg-green-9 text-white">
                            <q-icon name="group" size="18px" />
                        </q-avatar>
                        <div class="text-h6 text-green-10">Usuários</div>
                        <q-badge outline color="green-9" class="q-ml-sm">{{ rows.length }}</q-badge>
                    </div>

                    <div class="row items-center q-gutter-sm">
                        <q-btn color="green-9" icon="add" label="Novo usuário" unelevated @click="abrirNovo" />
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pt-sm q-pb-sm">
                <div class="row items-center q-col-gutter-sm">
                    <div class="col-12 col-md-2">
                        <q-select dense outlined v-model="filtroCampo" :options="filtros" emit-value map-options
                            label="Filtrar por" :options-dense="true" />
                    </div>

                    <div class="col-12 col-md-4" v-if="filtroCampo !== 'user_tipo'">
                        <q-input dense outlined v-model="filtroValor" label="Digite para buscar" clearable
                            @keyup.enter="buscar">
                            <template #prepend><q-icon name="search" class="text-green-9" /></template>
                        </q-input>
                    </div>

                    <div class="col-12 col-md-4" v-else>
                        <q-select dense outlined v-model="filtroValorTipo" :options="tiposOptions" emit-value
                            map-options label="Tipo" clearable>
                            <template #prepend><q-icon name="badge" class="text-green-9" /></template>
                        </q-select>
                    </div>

                    <div class="col-6 col-md-2">
                        <q-toggle v-model="incluirInativos" label="Incluir inativos" @update:model-value="buscar"
                            color="green-9" />
                    </div>

                    <div class="col-6 col-md-4 col-lg-3 text-right">
                        <q-btn flat class="btn-flat-green" icon="search" label="Buscar" @click="buscar" />
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-none">
                <q-table :rows="rowsFiltradas" :columns="columns" row-key="user_id" :loading="loading"
                    :pagination="pagination" @update:pagination="val => pagination = val" flat class="users-table"
                    hide-bottom :rows-per-page-options="[10, 20, 50]">
                    <template #no-data>
                        <div class="column items-center q-pa-xl text-grey-7">
                            <q-icon name="person_search" size="48px" class="q-mb-sm" />
                            <div>Nenhum usuário encontrado.</div>
                        </div>
                    </template>

                    <template #body-cell-user_username="props">
                        <q-td :props="props">
                            <div class="row items-center q-gutter-sm nowrap">
                                <q-avatar size="28px" class="bg-green-2 text-green-9">{{
                                    initials(props.row.user_username) }}</q-avatar>
                                <div class="col ellipsis">{{ props.row.user_username }}</div>
                            </div>
                        </q-td>
                    </template>

                    <template #body-cell-user_email="props">
                        <q-td :props="props">
                            <div class="ellipsis">{{ props.row.user_email }}</div>
                        </q-td>
                    </template>

                    <template #body-cell-user_tipo="props">
                        <q-td :props="props">
                            <q-chip square dense outline :color="tipoColor(props.row.user_tipo)">
                                {{ tipoNome(props.row.user_tipo) }}
                            </q-chip>
                        </q-td>
                    </template>

                    <template #body-cell-user_is_active="props">
                        <q-td :props="props" class="text-center">
                            <q-chip square dense :color="props.row.user_is_active ? 'positive' : 'grey-6'"
                                text-color="white" class="text-bold">
                                {{ props.row.user_is_active ? 'Ativo' : 'Inativo' }}
                            </q-chip>
                        </q-td>
                    </template>

                    <template #body-cell-acoes="props">
                        <q-td :props="props" class="text-right">
                            <q-btn dense round flat icon="edit" @click="abrirEditar(props.row)" />
                        </q-td>
                    </template>

                    <template #bottom>
                        <div class="row items-center justify-between full-width q-pa-sm">
                            <div class="text-caption text-grey-7">
                                {{ rowsFiltradas.length }} registro(s)
                            </div>
                            <q-pagination v-model="pagination.page"
                                :max="Math.max(1, Math.ceil(rowsFiltradas.length / pagination.rowsPerPage))"
                                max-pages="6" direction-links boundary-links color="green-9" size="sm" />
                        </div>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>

        <q-dialog v-model="dlg.open" no-backdrop-dismiss>
            <q-card class="dlg-card saq-elev">
                <q-bar class="bg-green-9 text-white rounded-t-xl">
                    <div class="text-subtitle1">
                        {{ dlg.mode === 'create' ? 'Novo usuário' : 'Editar usuário' }}
                    </div>
                    <q-space />
                    <q-btn flat round dense icon="close" v-close-popup class="text-white" />
                </q-bar>

                <q-card-section class="q-pt-md q-pb-sm">
                    <div class="text-caption text-green-8">Dados do usuário</div>
                    <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-12">
                            <q-input v-model="form.user_username" label="Nome" filled clearable>
                                <template #prepend><q-icon name="person" class="text-green-9" /></template>
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-input v-model="form.user_email" type="email" label="E-mail" filled clearable>
                                <template #prepend><q-icon name="mail" class="text-green-9" /></template>
                            </q-input>
                        </div>
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pt-sm q-pb-sm">
                    <div class="text-caption text-green-8">Atribuições</div>
                    <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-12 col-sm-6">
                            <q-select v-model="form.user_tipo" :options="tiposOptions" emit-value map-options
                                label="Tipo" filled>
                                <template #prepend><q-icon name="badge" class="text-green-9" /></template>
                            </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                            <q-select v-model="form.user_is_active" :options="statusOptions" emit-value map-options
                                label="Status" filled>
                                <template #prepend><q-icon name="toggle_on" class="text-green-9" /></template>
                                <template #selected>
                                    <q-chip square dense :color="form.user_is_active ? 'positive' : 'grey-6'"
                                        text-color="white">
                                        {{ form.user_is_active ? 'Ativo' : 'Inativo' }}
                                    </q-chip>
                                </template>
                            </q-select>
                        </div>
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pt-sm q-pb-sm">
                    <div class="text-caption text-green-8">Segurança</div>
                    <q-input v-model="form.user_documento" label="Documento" filled mask="###.###.###-##" fill-mask
                        :unmasked-value="true" :disable="dlg.mode === 'edit'">
                        <template #prepend><q-icon name="badge" class="text-green-9" /></template>
                    </q-input>
                    <q-input v-model="form.user_password" :type="showPassword ? 'text' : 'password'" label="Senha"
                        filled class="q-mt-sm" :rules="passwordRules">
                        <template #prepend>
                            <q-icon name="lock" class="text-green-9" />
                        </template>

                        <template #append>
                            <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                @click="showPassword = !showPassword" />
                        </template>
                    </q-input>
                    <q-linear-progress :value="passwordStrength.value" class="q-mt-xs" :color="passwordStrength.color"
                        rounded size="6px" />
                    <div class="text-caption text-grey-6 q-mt-xs" v-if="dlg.mode === 'edit'">
                        Deixe a senha em branco para não alterar.
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="between" class="q-pa-md">
                    <q-btn flat label="Cancelar" v-close-popup />
                    <q-btn class="bg-green-9 text-white" :loading="saving"
                        :label="dlg.mode === 'create' ? 'Criar' : 'Salvar'" @click="salvar" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useUsuariosStore } from 'src/stores/usuarios'

const $q = useQuasar()
const store = useUsuariosStore()

const loading = computed(() => store.loading)
const saving = computed(() => store.saving)

const TIPO_LABEL = { 1: 'Cidadão', 2: 'Administrador', 3: 'DMER', 4: 'DOSU' }
const tiposOptions = Object.entries(TIPO_LABEL).map(([id, label]) => ({ label, value: Number(id) }))
function tipoNome(v) { return TIPO_LABEL[Number(v)] ?? String(v ?? '') }
function tipoColor(v) {
    const t = Number(v)
    if (t === 2) return 'green-9'
    if (t === 3) return 'indigo-7'
    if (t === 4) return 'teal-7'
    return 'grey-7'
}
function initials(name) {
    const s = String(name || '').trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
    return s || '?'
}

const statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false }
]

const filtros = [
    { label: 'Nome', value: 'user_username' },
    { label: 'Documento', value: 'user_documento' },
    { label: 'E-mail', value: 'user_email' },
    { label: 'Tipo', value: 'user_tipo' }
]
const filtroCampo = ref(filtros[0].value)
const filtroValor = ref('')
const filtroValorTipo = ref(null)
const incluirInativos = ref(false)

async function buscar() {
    pagination.value.page = 1
    const params = { field: filtroCampo.value, includeInactive: incluirInativos.value }
    params.q = filtroCampo.value === 'user_tipo' ? (filtroValorTipo.value ?? '') : filtroValor.value
    await store.listar(params)
}
async function reload() {
    const params = { field: filtroCampo.value, includeInactive: incluirInativos.value }
    params.q = filtroCampo.value === 'user_tipo' ? (filtroValorTipo.value ?? '') : filtroValor.value
    await store.listar(params)
}

const rows = computed(() => store.list)
const rowsFiltradas = computed(() => {
    if (filtroCampo.value === 'user_tipo') {
        if (filtroValorTipo.value == null) return rows.value
        return rows.value.filter(r => Number(r.user_tipo) === Number(filtroValorTipo.value))
    }
    const val = String(filtroValor.value || '').toLowerCase().trim()
    if (!val) return rows.value
    const campo = filtroCampo.value
    return rows.value.filter(r => String(r[campo] || '').toLowerCase().includes(val))
})

const pagination = ref({ page: 1, rowsPerPage: 10, sortBy: 'user_username', descending: false })

const columns = [
    { name: 'user_username', field: 'user_username', label: 'Nome', align: 'left', sortable: true },
    { name: 'user_email', field: 'user_email', label: 'E-mail', align: 'left', sortable: true },
    { name: 'user_documento', field: 'user_documento', label: 'Documento', align: 'left', sortable: true },
    { name: 'user_tipo', field: 'user_tipo', label: 'Tipo', align: 'left', sortable: true },
    { name: 'user_is_active', field: 'user_is_active', label: 'Status', align: 'center', sortable: true },
    { name: 'acoes', field: 'acoes', label: '', align: 'right' }
]

const dlg = reactive({ open: false, mode: 'create' })
const form = reactive({
    user_username: '',
    user_email: '',
    user_tipo: null,
    user_is_active: true,
    user_documento: '',
    user_password: ''
})

const showPassword = ref(false)

const passRequired = v => {
    if (dlg.mode === 'edit' && !v) return true
    return !!v || 'Senha obrigatória'
}
const passLen = v => {
    if (!v && dlg.mode === 'edit') return true
    return (v && v.length >= 8) || 'Mínimo de 8 caracteres'
}
const passUpper = v => {
    if (!v && dlg.mode === 'edit') return true
    return /[A-Z]/.test(v || '') || 'Inclua letra maiúscula'
}
const passLower = v => {
    if (!v && dlg.mode === 'edit') return true
    return /[a-z]/.test(v || '') || 'Inclua letra minúscula'
}
const passNum = v => {
    if (!v && dlg.mode === 'edit') return true
    return /\d/.test(v || '') || 'Inclua número'
}
const passSpec = v => {
    if (!v && dlg.mode === 'edit') return true
    return /[^A-Za-z0-9]/.test(v || '') || 'Inclua caractere especial'
}

const passwordRules = [passRequired, passLen, passUpper, passLower, passNum, passSpec]

const calcStrength = v => {
    let s = 0
    if (v && v.length >= 8) s++
    if (/[A-Z]/.test(v)) s++
    if (/[a-z]/.test(v)) s++
    if (/\d/.test(v)) s++
    if (/[^A-Za-z0-9]/.test(v)) s++
    return s / 5
}

const passwordStrengthValue = ref(0)
watch(
    () => form.user_password,
    v => {
        passwordStrengthValue.value = calcStrength(v || '')
    }
)

const passwordStrength = computed(() => {
    const v = passwordStrengthValue.value
    if (!v) return { value: 0, color: 'grey-4' }
    if (v < 0.4) return { value: v, color: 'negative' }
    if (v < 0.8) return { value: v, color: 'warning' }
    return { value: v, color: 'positive' }
})


function abrirNovo() {
    dlg.mode = 'create'
    Object.assign(form, {
        user_username: '',
        user_email: '',
        user_tipo: null,
        user_is_active: true,
        user_documento: '',
        user_password: ''
    })
    dlg.open = true
}
function abrirEditar(row) {
    dlg.mode = 'edit'
    Object.assign(form, {
        user_username: row.user_username,
        user_email: row.user_email,
        user_tipo: Number(row.user_tipo),
        user_is_active: row.user_is_active ?? true,
        user_documento: row.user_documento,
        user_password: ''
    })
    dlg.open = true
}

function buildListParams() {
    const params = { field: filtroCampo.value, includeInactive: incluirInativos.value }
    params.q = filtroCampo.value === 'user_tipo' ? (filtroValorTipo.value ?? '') : filtroValor.value
    return params
}
async function refreshList() { await store.listar(buildListParams()) }

async function salvar() {
    try {
        const payload = {
            user_username: form.user_username,
            user_email: form.user_email,
            user_tipo: Number(form.user_tipo),
            user_is_active: !!form.user_is_active,
            user_password: form.user_password
        }
        if (dlg.mode === 'create') {
            if (!payload.user_password) { $q.notify({ type: 'warning', message: 'Senha obrigatória' }); return }
            await store.criar({ ...payload, user_documento: form.user_documento })
            $q.notify({ type: 'positive', message: 'Usuário criado' })
        } else {
            const id = store.items.find(u => u.user_documento === form.user_documento)?.user_id
            if (!payload.user_password) delete payload.user_password
            await store.atualizar(id, payload)
            $q.notify({ type: 'positive', message: 'Usuário atualizado' })
        }
        dlg.open = false
        await refreshList()
    } catch {
        $q.notify({ type: 'negative', message: 'Falha ao salvar' })
    }
}

onMounted(reload)
</script>

<style scoped>
.users-page {
    max-width: 1200px;
    margin: 0 auto;
}

.surface {
    border-radius: 14px;
    border: 1px solid #e0f2f1;
    overflow: hidden;
}

.btn-flat-green {
    color: #1b5e20 !important;
}

.users-table :deep(thead th) {
    background: #f1f8e9;
    color: #1b5e20;
    font-weight: 600;
}

.users-table :deep(.q-table__bottom) {
    border-top: 1px solid #e0f2f1;
}

.nowrap {
    white-space: nowrap;
}

.dlg-card {
    width: 640px;
    max-width: 95vw;
    border-radius: 16px;
    overflow: hidden;
}

.saq-elev {
    box-shadow: 0 10px 28px rgba(0, 0, 0, .12);
}

:deep(.q-field--filled .q-field__control) {
    border-radius: 12px;
}

:deep(.q-field--filled .q-field__control:before) {
    border-bottom-color: rgba(27, 94, 32, .24);
}
</style>
