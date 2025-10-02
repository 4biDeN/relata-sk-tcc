<template>
  <q-page class="flex flex-center page-white">
    <div class="frame">
      <div class="flex flex-center q-mb-md">
        <q-avatar size="80px">
          <img src="~assets/muller-cj.png">
        </q-avatar>
      </div>

      <q-card flat bordered class="q-pa-lg card">
        <div class="text-center q-mb-md">
          <div class="text-h5 text-positive">Bem-vindo</div>
          <div class="text-subtitle2 text-grey-7">Acesse com seu Documento e Senha</div>
        </div>

        <q-form @submit="onSubmit" greedy>
          <q-input v-model="documento" label="Documento" mask="###########" class="q-mb-sm"
            :rules="[v => !!v || 'Obrigatório']" outlined>
            <template #prepend><q-icon name="person" /></template>
          </q-input>

          <q-input v-model="password" :type="show ? 'text' : 'password'" label="Senha" :rules="[v => !!v || 'Obrigatório']"
            outlined>
            <template #prepend><q-icon name="lock" /></template>
            <template #append>
              <q-icon :name="show ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="show = !show" />
            </template>
          </q-input>

          <q-btn type="submit" label="Entrar" class="full-width q-mt-md" :loading="loading" unelevated color="positive"
            text-color="white" />
        </q-form>

        <div class="row items-center q-mt-md q-gutter-sm">
          <q-btn flat no-caps size="sm" class="text-positive" @click="router.push('/forgot')">
            Esqueci minha senha
          </q-btn>
          <q-space />
          <q-btn no-caps size="sm" outline color="amber-8" class="q-px-md" @click="router.push('/register')"
            label="Criar conta" />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { Notify } from 'quasar'


const documento = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

const onSubmit = async () => {
  loading.value = true
  try {
    await auth.login({ documento: documento.value, password: password.value })
    router.push('/home')
  } catch (e) {
    const status = e?.response?.status
    if (status === 404) {
      Notify.create({ type: 'warning', message: 'Usuário não encontrado. Vamos criar sua conta.', position: 'top' })
      router.push('/register')
      return
    }
    if (status === 401) {
      Notify.create({ type: 'negative', message: 'Documento ou senha inválidos.', position: 'top' })
      password.value = ''
      return
    }
    Notify.create({ type: 'negative', message: 'Não foi possível entrar. Tente novamente.', position: 'top' })
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
