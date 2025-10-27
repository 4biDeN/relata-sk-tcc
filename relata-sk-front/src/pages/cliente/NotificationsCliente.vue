<template>
    <q-page class="q-pa-md column">
        <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-green-9">Notificações</div>
            <div class="row items-center q-gutter-sm">
                <q-btn flat icon="refresh" color="green-8" round @click="carregar(true)" :loading="loading" />
                <q-btn flat icon="done_all" label="Marcar todas como lidas" color="green-8" :disable="!hasUnread"
                    @click="marcarTodas" :loading="saving" />
            </div>
        </div>

        <q-scroll-area class="q-px-sm" style="height: calc(100vh - 140px)"> <q-list bordered separator>
                <template v-if="rows.length">
                    <q-item v-for="r in rows" :key="String(r.id)" clickable @click="abrirNotificacao(r)"
                        :class="['q-py-sm cursor-pointer', r.status !== 'read' ? 'bg-green-1' : '']">
                        <q-item-section avatar>
                            <q-avatar color="green-2" text-color="green-8" size="42px">
                                <q-icon :name="iconeTipo(r.tipo)" />
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <div class="row items-center no-wrap q-gutter-xs">
                                <div class="text-body1 text-weight-medium">{{ r.title || '(sem título)' }}</div>
                                <q-badge outline :color="badgeColor(r.status)" :label="r.status" class="q-ml-xs" />
                            </div>
                            <div class="text-grey-8 ellipsis-2-lines">
                                {{ r.body }}
                            </div>
                        </q-item-section>

                        <q-item-section side top>
                            <div class="text-caption text-grey-7">
                                {{ formatarData(r.created_at) }}
                            </div>
                        </q-item-section>
                    </q-item>
                </template>

                <template v-else>
                    <div class="column items-center q-pa-xl text-grey-7">
                        <q-icon name="notifications_none" size="48px" />
                        <div class="q-mt-sm">Nenhuma notificação.</div>
                    </div>
                </template>
            </q-list>

            <div v-if="hasMore" class="row justify-center q-my-md">
                <q-btn outline color="green-8" icon="expand_more" label="Carregar mais" :loading="loadingMore"
                    @click="carregarMais" />
            </div>
        </q-scroll-area>
    </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { date, Notify } from 'quasar'
import { useNotificationsStore } from 'src/stores/notifications'

const router = useRouter()
const store = useNotificationsStore()

function parseOcorrenciaId(n) {
  const direto = n.ocorrencia_id ?? n.notificacao_ocorrencia_id;
  if (Number.isFinite(Number(direto))) return Number(direto);

  const url = n.actionUrl ?? n.action_url ?? '';
  const m = String(url).match(/\/(?:home\/)?ocorrencias\/(\d+)/i);
  if (m && Number.isFinite(Number(m[1]))) return Number(m[1]);

  return null;
}

function goAdminOcorrencia(id) {
  if (!Number.isFinite(Number(id))) return;
  router.push(`/home/ocorrencias/${Number(id)}`);
}


const loading = ref(false)
const loadingMore = ref(false)
const saving = ref(false)

const rows = computed(() =>
  (store.items || []).map(n => {
    const id = n.id ?? n.notificacao_id ?? n.notificacaoId;
    const title = n.title ?? n.notificacao_titulo ?? '';
    const body = n.body ?? n.notificacao_mensagem ?? '';
    const ocorrencia_id = parseOcorrenciaId(n);

    const createdAt =
      n.created_at
        ? (n.created_at instanceof Date ? n.created_at : new Date(n.created_at))
        : (n.createdAt ? new Date(n.createdAt) : null);

    return {
      id,
      title,
      body,
      tipo: n.tipo ?? n.notificacao_tipo,
      canal: n.canal ?? n.notificacao_canal,
      status: n.status,
      prioridade: n.prioridade ?? null,
      ocorrencia_id,
      created_at: createdAt
    };
  })
);

const hasMore = computed(() => !!store.nextCursor)
const hasUnread = computed(() => (store.unread || 0) > 0)

function iconeTipo(tipo) {
    switch (tipo) {
        case 'status_change': return 'sync'
        case 'comment': return 'chat_bubble_outline'
        case 'image_added': return 'image'
        case 'assigned': return 'person_add'
        case 'updated': return 'update'
        case 'created': return 'add_circle_outline'
        case 'deleted': return 'delete_outline'
        default: return 'notifications'
    }
}

function badgeColor(status) {
    switch (status) {
        case 'queued': return 'orange-7'
        case 'sent': return 'blue-7'
        case 'read': return 'green-7'
        default: return 'grey-6'
    }
}

function formatarData(d) {
    if (!d) return ''
    const dateObj = d instanceof Date ? d : new Date(d)
    return date.formatDate(dateObj, 'DD/MM/YYYY HH:mm')
}

async function carregar(force = false) {
    try {
        loading.value = true
        if (force) {
            store.items = []
            store.nextCursor = null
        }
        await store.fetchInitial?.()
        if (!store.fetchInitial && store.fetchMore) {
            await store.fetchMore({})
        }
    } catch (e) {
        Notify.create({ type: 'negative', message: e?.message || 'Erro ao carregar notificações' })
    } finally {
        loading.value = false
    }
}

async function carregarMais() {
    if (!hasMore.value) return
    try {
        loadingMore.value = true
        await store.fetchMore?.({})
    } catch (e) {
        Notify.create({ type: 'negative', message: e?.message || 'Erro ao carregar mais notificações' })
    } finally {
        loadingMore.value = false
    }
}

async function marcarTodas() {
    try {
        saving.value = true
        await store.marcarTodasComoLidas?.()
        Notify.create({ type: 'positive', message: 'Notificações marcadas como lidas' })
        await carregar(true)
    } catch (e) {
        Notify.create({ type: 'negative', message: e?.message || 'Erro ao marcar como lidas' })
    } finally {
        saving.value = false
    }
}

async function abrirNotificacao(r) {
  try {
    if (r.status !== 'read' && store.marcarComoLida) {
      await store.marcarComoLida(r.id);
      r.status = 'read';
    }

    if (Number.isFinite(Number(r.ocorrencia_id))) {
      goAdminOcorrencia(r.ocorrencia_id);
      return;
    }

    Notify.create({ type: 'info', message: 'Notificação sem ocorrência vinculada.' });
  } catch (e) {
    console.error(e);
    Notify.create({ type: 'negative', message: e?.message || 'Falha ao abrir notificação' });
  }
}


onMounted(async () => {
    await carregar()
})

</script>

<style scoped>
.ellipsis-2-lines {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    box-orient: vertical;
}
</style>
