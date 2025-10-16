<template>
    <q-page padding>
        <div class="row items-center q-col-gutter-sm q-mb-md">
            <div class="col">
                <div class="text-h6">Usuários</div>
            </div>
            <div class="col-auto row items-center q-gutter-sm">
                <q-select dense outlined v-model="filtroCampo" :options="filtros" emit-value map-options
                    style="width: 180px" />
                <q-input v-if="filtroCampo !== 'user_tipo'" dense outlined v-model="filtroValor"
                    placeholder="Digite para buscar" @keyup.enter="buscar" />
                <q-select v-else dense outlined v-model="filtroValorTipo" :options="tiposOptions" emit-value map-options
                    placeholder="Selecione o tipo" />
                <q-toggle v-model="incluirInativos" label="Incluir inativos" @update:model-value="buscar" /> <q-btn
                    color="primary" icon="search" label="Buscar" @click="buscar" />
                <q-btn flat icon="clear" label="Limpar" @click="limparBusca" />
                <q-btn flat icon="refresh" :loading="loading" @click="reload" />
                <q-btn color="primary" icon="add" label="Novo usuário" @click="abrirNovo" />
            </div>
        </div>

        <q-table :rows="rowsFiltradas" :columns="columns" row-key="user_id" :loading="loading" :pagination="pagination"
            @update:pagination="val => pagination = val" flat bordered>
            <template #body-cell-user_tipo="props">
                <q-td :props="props">{{ tipoNome(props.row.user_tipo) }}</q-td>
            </template>

            <template #body-cell-user_is_active="props">
                <q-td :props="props" class="text-center">
                    <q-chip square dense :color="props.row.user_is_active ? 'positive' : 'grey-6'" text-color="white"
                        class="text-bold">
                        {{ props.row.user_is_active ? 'Ativo' : 'Inativo' }}
                    </q-chip>
                </q-td>
            </template>

            <template #body-cell-acoes="props">
                <q-td :props="props">
                    <q-btn dense round flat icon="edit" @click="abrirEditar(props.row)" />
                </q-td>
            </template>
        </q-table>

        <q-dialog v-model="dlg.open" persistent>
            <q-card class="dlg-card saq-elev" @keyup.esc="dlg.open = false">
                <q-bar class="bg-saudades text-white rounded-t-xl">
                    <div class="text-subtitle1">
                        {{ dlg.mode === 'create' ? 'Novo usuário' : 'Editar usuário' }}
                    </div>
                    <q-space />
                    <q-btn flat round dense icon="close" v-close-popup class="text-white" />
                </q-bar>

                <q-card-section class="q-pt-md q-pb-sm">
                    <div class="text-caption text-saudades-weak">Dados do usuário</div>
                    <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-12">
                            <q-input v-model="form.user_username" label="Nome" filled>
                                <template #prepend><q-icon name="person" class="text-saudades" /></template>
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-input v-model="form.user_email" type="email" label="E-mail" filled>
                                <template #prepend><q-icon name="mail" class="text-saudades" /></template>
                            </q-input>
                        </div>
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pt-sm q-pb-sm">
                    <div class="text-caption text-saudades-weak">Atribuições</div>
                    <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-12 col-sm-6">
                            <q-select v-model="form.user_tipo" :options="tiposOptions" emit-value map-options
                                label="Tipo" filled>
                                <template #prepend><q-icon name="badge" class="text-saudades" /></template>
                            </q-select>
                        </div>
                        <div class="col-12 col-sm-6">
                            <q-select v-model="form.user_is_active" :options="statusOptions" emit-value map-options
                                label="Status" filled>
                                <template #prepend><q-icon name="toggle_on" class="text-saudades" /></template>
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
                    <div class="text-caption text-saudades-weak">Segurança</div>
                    <q-input v-model="form.user_documento" label="Documento" filled :disable="dlg.mode === 'edit'">
                        <template #prepend><q-icon name="badge" class="text-saudades" /></template>
                    </q-input>
                    <q-input v-model="form.user_password" type="password" label="Senha" filled class="q-mt-sm">
                        <template #prepend><q-icon name="lock" class="text-saudades" /></template>
                    </q-input>
                    <div class="text-caption text-grey-6 q-mt-xs" v-if="dlg.mode === 'edit'">
                        Deixe a senha em branco para não alterar.
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="between" class="q-pa-md">
                    <q-btn flat label="Cancelar" v-close-popup />
                    <q-btn class="bg-saudades text-white" :loading="saving"
                        :label="dlg.mode === 'create' ? 'Criar' : 'Salvar'" @click="salvar" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useUsuariosStore } from 'src/stores/usuarios'

const $q = useQuasar()
const store = useUsuariosStore()

const loading = computed(() => store.loading)
const saving = computed(() => store.saving)

const TIPO_LABEL = { 1: 'Cidadão', 2: 'Administrador', 3: 'DMER', 4: 'DOSU' }
const tiposOptions = Object.entries(TIPO_LABEL).map(([id, label]) => ({
    label, value: Number(id)
}))
function tipoNome(v) {
    return TIPO_LABEL[Number(v)] ?? String(v ?? '')
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
    params.q = filtroCampo.value === 'user_tipo'
        ? (filtroValorTipo.value ?? '')
        : filtroValor.value
    await store.listar(params)
}
async function reload() {
    const params = { field: filtroCampo.value, includeInactive: incluirInativos.value }
    params.q = filtroCampo.value === 'user_tipo'
        ? (filtroValorTipo.value ?? '')
        : filtroValor.value
    await store.listar(params)
}

function limparBusca() {
    filtroValor.value = ''
    filtroValorTipo.value = null
    pagination.value.page = 1
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
    params.q = filtroCampo.value === 'user_tipo'
        ? (filtroValorTipo.value ?? '')
        : filtroValor.value
    return params
}

async function refreshList() {
    await store.listar(buildListParams())
}
const recarregarAoFechar = ref(false)
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
        recarregarAoFechar.value = true
        dlg.open = false
        await refreshList()
        recarregarAoFechar.value = false
    } catch {
        $q.notify({ type: 'negative', message: 'Falha ao salvar' })
    }
}

onMounted(reload)
</script>

<style scoped>
.q-page {
    max-width: 1200px;
    margin: 0 auto;
}

.dlg-card {
    width: 640px;
    max-width: 95vw;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 28px rgba(0, 0, 0, .12);
}

.bg-saudades {
    background: #1B5E20;
}

/* verde escuro agradável */
.text-saudades {
    color: #1B5E20;
}

.text-saudades-weak {
    color: #2e7d32;
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

/* realce leve em inputs filled */
:deep(.q-field--filled .q-field__control) {
    border-radius: 12px;
}


/* amarelo */
:deep(.q-field--filled .q-field__control:before) {
    border-bottom-color: rgba(27, 94, 32, .24);
}
</style>