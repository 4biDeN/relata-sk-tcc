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
                <q-card-section class="text-h6">{{ item.ocorrencia_titulo }}</q-card-section>
                <q-separator />
                <q-card-section>
                    <div class="q-mb-sm"><b>Protocolo:</b> {{ item.ocorrencia_protocolo }}</div>
                    <div class="q-mb-sm"><b>Status:</b> {{ item.ocorrencia_status_nome }}</div>
                    <div class="q-mb-sm"><b>Data:</b> {{ dataFmt }}</div>
                    <div class="q-mb-sm"><b>Autor:</b> {{ item.user_username }}</div>
                    <div class="q-mb-sm">
                        <b>Local:</b> {{ item.local_rua }}, {{ item.local_bairro }} – {{ item.municipio_nome }}/{{
                        item.local_estado }}
                    </div>
                    <div class="q-mt-md">{{ item.ocorrencia_descricao }}</div>
                </q-card-section>
            </template>
        </q-card>
    </q-page>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOcorrenciaDetalheStore } from 'src/stores/ocorrenciaDetalhe'

const route = useRoute()
const store = useOcorrenciaDetalheStore()

const item = computed(() => store.get(route.params.id))
const loading = computed(() => store.loading)
const error = computed(() => store.error)

onMounted(() => store.carregar(route.params.id))

watch(() => route.params.id, (id) => {
    if (id) store.carregar(id, { force: true })
})

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
</script>
