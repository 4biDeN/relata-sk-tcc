<template>
    <q-page class="flex flex-center page-white">
        <div class="frame">
            <div class="flex flex-center q-mb-md">
                <q-avatar size="80px">
                    <img src="~assets/muller-cj.png" alt="Logo">
                </q-avatar>
            </div>

            <q-card flat bordered class="q-pa-lg card">
                <div class="text-h6 q-mb-xs text-center text-green-9">Recuperar senha</div>
                <div class="text-caption text-center q-mb-md text-grey-7">
                    Informe seu <b>Documento</b> e <b>E-mail</b> cadastrados. Enviaremos as instruções para redefinição.
                </div>

                <q-form @submit="onSubmit" greedy>
                    <q-input v-model="documento" label="Documento" mask="###.###.###-##" fill-mask
                        :unmasked-value="true" class="q-mb-sm" :rules="[v => !!v || 'Obrigatório']" outlined
                        autocomplete="username">
                        <template #prepend><q-icon name="person" /></template>
                    </q-input>

                    <q-input v-model="user_email" type="email" label="E-mail" :rules="[req, emailRule]" outlined
                        color="green-9" clearable autocomplete="email">
                        <template #prepend><q-icon name="mail" /></template>
                    </q-input>

                    <q-btn type="submit" label="Enviar instruções" color="green-9" class="full-width q-mt-md"
                        :loading="loading" :disable="loading" unelevated text-color="white" />

                    <div class="row items-center justify-between q-mt-md">
                        <q-btn flat no-caps size="sm" class="btn-flat-green" @click="router.push('/login')"
                            icon="arrow_back" label="Voltar ao login" />
                        <q-btn flat no-caps size="sm" class="btn-flat-green" icon="help_outline"
                            label="Precisa de ajuda?" @click="abrirAjuda" />
                    </div>
                </q-form>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()

const user_documento = ref('')
const user_email = ref('')
const loading = ref(false)

const req = v => !!String(v || '').trim() || 'Obrigatório'
const emailRule = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')) || 'E-mail inválido'

async function onSubmit() {
    if (loading.value) return
    loading.value = true
    try {
        await auth.forgot({ user_documento: user_documento.value, user_email: user_email.value })
        $q.notify({ type: 'positive', message: 'Se os dados conferirem, enviaremos as instruções ao seu e-mail.' })
        router.push('/login')
    } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Não foi possível enviar as instruções'
        $q.notify({ type: 'negative', message: msg })
    } finally {
        loading.value = false
    }
}

function abrirAjuda() {
    $q.dialog({
        title: 'Ajuda',
        message: 'Use o documento e e-mail do seu cadastro. Se não lembrar, contate o suporte do sistema.'
    })
}
</script>

<style scoped>
.page-white {
    background: #ffffff;
}

.frame {
    padding: 12px;
    border-radius: 16px;
}

.card {
    width: 420px;
    max-width: 92vw;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(0, 0, 0, .06);
}

.btn-flat-green {
    color: #1b5e20 !important;
}
</style>
