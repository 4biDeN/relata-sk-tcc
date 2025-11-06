<template>
    <q-page class="q-pa-md">
        <div class="row items-center q-col-gutter-sm q-mb-md">
            <div class="col">
                <div class="text-h6 text-green-9">Dashboard</div>
                <div class="text-caption text-grey-7">Visão geral das ocorrências</div>
            </div>
            <div class="col-auto">
                <q-btn :loading="loading" color="green-9" icon="refresh" label="Atualizar" unelevated
                    @click="refresh" />
            </div>
        </div>

        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6 col-md-3">
                <q-card flat bordered class="kpi-card">
                    <q-card-section class="row items-center">
                        <q-avatar color="orange-7" text-color="white" icon="assignment" />
                        <div class="q-ml-md">
                            <div class="kpi-label">Ocorrências Abertas</div>
                            <div class="kpi-value">{{ nf(totals.open) }}</div>
                        </div>
                    </q-card-section>
                    <q-linear-progress :value="kpiRate(totals.open, totals.total)" color="orange-7" rounded />
                </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
                <q-card flat bordered class="kpi-card">
                    <q-card-section class="row items-center">
                        <q-avatar color="teal-7" text-color="white" icon="task_alt" />
                        <div class="q-ml-md">
                            <div class="kpi-label">Ocorrências Resolvidas</div>
                            <div class="kpi-value">{{ nf(totals.resolved) }}</div>
                        </div>
                    </q-card-section>
                    <q-linear-progress :value="kpiRate(totals.resolved, totals.total)" color="teal-7" rounded />
                </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
                <q-card flat bordered class="kpi-card">
                    <q-card-section class="row items-center">
                        <q-avatar color="indigo-6" text-color="white" icon="summarize" />
                        <div class="q-ml-md">
                            <div class="kpi-label">Total de Ocorrências</div>
                            <div class="kpi-value">{{ nf(totals.total) }}</div>
                        </div>
                    </q-card-section>
                    <q-linear-progress :value="1" color="indigo-6" rounded />
                </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
                <q-card flat bordered class="kpi-card">
                    <q-card-section class="row items-center">
                        <q-avatar color="deep-purple-6" text-color="white" icon="speed" />
                        <div class="q-ml-md">
                            <div class="kpi-label">Tempo Médio em Aberto</div>
                            <div class="kpi-value">{{ avgOpenHoursFmt }}</div>
                        </div>
                    </q-card-section>
                    <q-linear-progress :value="avgGauge" color="deep-purple-6" rounded />
                </q-card>
            </div>
        </div>

        <div class="row q-col-gutter-md">
            <div class="col-12 col-lg-7">
                <q-card flat bordered class="panel">
                    <q-card-section class="row items-center justify-between q-pb-none">
                        <div class="panel-title">
                            <q-icon name="show_chart" class="q-mr-sm" />
                            Ocorrências — últimos 30 dias
                        </div>
                        <q-btn dense flat round icon="open_in_full" @click="toggleGrid = !toggleGrid"
                            :color="toggleGrid ? 'indigo-6' : 'grey-6'">
                            <q-tooltip>Alternar grade</q-tooltip>
                        </q-btn>
                    </q-card-section>
                    <q-card-section>
                        <div class="chart-wrap">
                            <svg viewBox="0 0 600 180" preserveAspectRatio="none" class="chart-svg">
                                <defs>
                                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" :stop-color="chartColor" stop-opacity="0.25" />
                                        <stop offset="100%" :stop-color="chartColor" stop-opacity="0.02" />
                                    </linearGradient>
                                </defs>

                                <g v-if="toggleGrid" stroke="rgba(0,0,0,0.06)" stroke-width="1">
                                    <line v-for="x in 6" :key="'vx' + x" :x1="x * 100" y1="10" :x2="x * 100" y2="170" />
                                    <line v-for="y in 4" :key="'hz' + y" x1="10" :y1="y * 32 + 42" x2="590" :y2="y * 32 + 42" />
                                </g>

                                <path v-if="areaPath" :d="areaPath" fill="url(#g1)" />
                                <path v-if="linePath" :d="linePath" fill="none" :stroke="chartColor" stroke-width="2.5"
                                    stroke-linejoin="round" stroke-linecap="round" />
                                <circle v-for="(p, i) in points" :key="i" :cx="p.x" :cy="p.y" r="3" :fill="chartColor" />
                            </svg>
                        </div>

                        <div class="row q-col-gutter-sm q-mt-sm">
                            <div v-for="(d, i) in lastDaysTail" :key="i" class="col-6 col-sm-3">
                                <div class="mini-card row items-center">
                                    <div class="mini-dot" :style="{ background: chartColor }" />
                                    <div class="q-ml-sm">
                                        <div class="text-caption text-grey-7">{{ d.date }}</div>
                                        <div class="text-weight-medium">{{ nf(d.count) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-lg-5">
                <q-card flat bordered class="panel q-mb-md">
                    <q-card-section class="panel-title">
                        <q-icon name="donut_small" class="q-mr-sm" />
                        Por Status
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pt-sm">
                        <div v-if="!statusBreakdown.length" class="text-grey-6">Sem dados.</div>
                        <div v-else class="col-stack">
                            <div v-for="s in statusBreakdown" :key="s.status_id" class="row items-center q-mb-sm">
                                <div class="col text-weight-medium">{{ s.status_name }}</div>
                                <div class="col-auto text-weight-medium q-mr-sm">{{ nf(s.count) }}</div>
                                <div class="col-12">
                                    <q-linear-progress :value="part(s.count)" :color="statusColor(s.status_name)"
                                        rounded />
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>

                <q-card flat bordered class="panel">
                    <q-card-section class="panel-title">
                        <q-icon name="bar_chart" class="q-mr-sm" />
                        Por Prioridade
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pt-sm">
                        <div v-if="!priorityBreakdown.length" class="text-grey-6">Sem dados.</div>
                        <div v-else class="col-stack">
                            <div v-for="p in priorityBreakdown" :key="p.priority_id" class="row items-center q-mb-sm">
                                <div class="col text-weight-medium">{{ p.priority_name }}</div>
                                <div class="col-auto text-weight-medium q-mr-sm">{{ nf(p.count) }}</div>
                                <div class="col-12">
                                    <q-linear-progress :value="part(p.count)" :color="priorityColor(p.priority_name)"
                                        rounded />
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <q-inner-loading :showing="loading">
            <q-spinner color="green-9" size="42px" />
        </q-inner-loading>
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDashboardStore } from 'src/stores/dashboard'

const store = useDashboardStore()
const loading = computed(() => store.loading)
const totals = computed(() => store.totals)
const statusBreakdown = computed(() => store.statusBreakdown)
const priorityBreakdown = computed(() => store.priorityBreakdown)

const last30 = computed(() => (store.dailyCounts || []).slice().sort((a, b) => a.date.localeCompare(b.date)))
const lastDaysTail = computed(() => last30.value.slice(-4))

const nf = (n) => new Intl.NumberFormat('pt-BR').format(Number(n || 0))
const kpiRate = (v, total) => {
    const t = Number(total || 0)
    const x = Number(v || 0)
    return t > 0 ? Math.max(0, Math.min(1, x / t)) : 0
}
const part = (c) => kpiRate(c, totals.value.total)

const avgOpenHoursFmt = computed(() => {
    const h = Number(store.avgOpenHours || 0)
    if (h < 1) return `${Math.round(h * 60)} min`
    if (h < 24) return `${h.toFixed(1)} h`
    const d = Math.floor(h / 24)
    const r = Math.round(h % 24)
    return r ? `${d}d ${r}h` : `${d}d`
})
const avgGauge = computed(() => {
    const h = Number(store.avgOpenHours || 0)
    const cap = 72
    return Math.max(0, Math.min(1, h / cap))
})

const toggleGrid = ref(true)

const width = 600
const height = 180
const padX = 20
const padTop = 20
const padBottom = 20

const values = computed(() => last30.value.map(d => Number(d.count || 0)))
const maxY = computed(() => Math.max(1, Math.max(0, ...values.value)))
const points = computed(() => {
    const n = values.value.length
    if (!n) return []
    const w = width - padX * 2
    const h = height - padTop - padBottom
    return values.value.map((v, i) => {
        const x = padX + (n === 1 ? w / 2 : (w * i) / (n - 1))
        const y = padTop + (h * (1 - v / maxY.value))
        return { x, y }
    })
})
const linePath = computed(() => points.value.length
    ? points.value.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '')
    : ''
)
const areaPath = computed(() => {
    if (!points.value.length) return ''
    const first = points.value[0]
    const last = points.value[points.value.length - 1]
    return `${linePath.value} L ${last.x} ${height - padBottom} L ${first.x} ${height - padBottom} Z`
})

const chartColor = '#3949ab' // indigo-7

function norm(s) {
    return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}
function statusColor(name) {
    const n = norm(name)
    if (n === 'aberto') return 'orange-7'
    if (n === 'em analise') return 'indigo-7'
    if (n === 'em andamento') return 'info'
    if (n === 'resolvido') return 'positive'
    if (n === 'fechado') return 'grey-7'
    return 'grey-6'
}
function priorityColor(name) {
    const n = norm(name)
    if (n === 'urgente') return 'deep-orange-7'
    if (n === 'alta') return 'red-6'
    if (n === 'normal') return 'teal-6'
    if (n === 'baixa') return 'blue-grey-6'
    return 'grey-6'
}

function refresh() { store.refresh() }
onMounted(() => { store.fetch({ force: true }) })
</script>

<style scoped>
.kpi-card {
    border-radius: 14px;
    overflow: hidden;
}

.kpi-label {
    font-size: 12px;
    color: #546e7a;
}

.kpi-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.1;
}

.panel {
    border-radius: 14px;
}

.panel-title {
    font-weight: 700;
    color: #1b5e20;
    display: flex;
    align-items: center;
}

.chart-wrap {
    width: 100%;
    height: 220px;
}

.chart-svg {
    width: 100%;
    height: 100%;
    display: block;
}

.mini-card {
    border: 1px solid #e0f2f1;
    border-radius: 10px;
    padding: 8px 10px;
}

.mini-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.col-stack>.row:last-child {
    margin-bottom: 0;
}
</style>
