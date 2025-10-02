<template>
  <q-page class="flex flex-center page-white">
    <div class="frame">
      <div class="flex flex-center q-mb-md">
        <q-avatar size="80px">
          <img src="~assets/muller-cj.png">
        </q-avatar>
      </div>

      <q-card class="q-pa-lg card" flat bordered>
        <div class="text-h6 q-mb-md text-center text-positive">Criar conta</div>
        <q-form @submit="onSubmit" greedy>
          <q-input v-model="form.user_username" label="Usuário" :rules="[req]" class="q-mb-sm" outlined>
            <template #prepend><q-icon name="account_circle" /></template>
          </q-input>
          <q-input v-model="form.user_email" type="email" label="E-mail" :rules="[req, emailRule]" class="q-mb-sm"
            outlined>
            <template #prepend><q-icon name="mail" /></template>
          </q-input>
          <q-input v-model="form.user_documento" label="Documento" mask="###########" :rules="[req]" class="q-mb-sm"
            outlined>
            <template #prepend><q-icon name="badge" /></template>
          </q-input>
          <q-input v-model="form.user_password" :type="show ? 'text' : 'password'" label="Senha" :rules="passwordRules"
            outlined>
            <template #prepend><q-icon name="vpn_key" /></template>
            <template #append>
              <q-icon :name="show ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="show = !show" />
            </template>
          </q-input>
          <q-linear-progress :value="strength.value" class="q-mt-xs" :color="strength.color" rounded size="6px" />
          <q-btn type="submit" label="Criar conta" color="positive" class="full-width q-mt-md" :loading="loading"
            :disable="loading" unelevated text-color="white" />
        </q-form>
        <div class="row items-center q-mt-md">
          <q-btn flat no-caps size="sm" class="text-amber-8" @click="router.push('/login')">Já tenho conta</q-btn>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const auth = useAuthStore()
const router = useRouter()
const show = ref(false)
const loading = ref(false)
const form = reactive({
  user_username: '',
  user_email: '',
  user_documento: '',
  user_password: ''
})

const req = v => !!v || 'Obrigatório'
const emailRule = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido'
const passLen = v => (v && v.length >= 8) || 'Mínimo de 8 caracteres'
const passUpper = v => /[A-Z]/.test(v) || 'Inclua letra maiúscula'
const passLower = v => /[a-z]/.test(v) || 'Inclua letra minúscula'
const passNum = v => /\d/.test(v) || 'Inclua número'
const passSpec = v => /[^A-Za-z0-9]/.test(v) || 'Inclua caractere especial'
const passwordRules = [req, passLen, passUpper, passLower, passNum, passSpec]

const calcStrength = v => {
  let s = 0
  if (v && v.length >= 8) s++
  if (/[A-Z]/.test(v)) s++
  if (/[a-z]/.test(v)) s++
  if (/\d/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s / 5
}
const strengthValue = ref(0)
watch(() => form.user_password, v => { strengthValue.value = calcStrength(v || '') })
const strength = computed(() => {
  const v = strengthValue.value
  if (v < 0.4) return { value: v, color: 'negative' }
  if (v < 0.8) return { value: v, color: 'warning' }
  return { value: v, color: 'positive' }
})

const onSubmit = async () => {
  loading.value = true
  try {
    await auth.createUser(form)
    $q.notify({ type: 'positive', message: 'Conta criada com sucesso' })
    router.push('/login')
  } catch (e) {
    const msg = e?.response?.data?.error || e?.message || 'Erro ao criar conta'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    loading.value = false
  }
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
}
</style>
