<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="width: 420px; max-width: 92vw;">
      <div class="text-h6 q-mb-md">Recuperar senha</div>
      <q-form @submit="onSubmit" greedy>
        <q-input v-model="user_documento" label="Documento" mask="###########" :rules="[r]" class="q-mb-sm" />
        <q-input v-model="user_email" type="email" label="E-mail" :rules="[r]" />
        <q-btn type="submit" label="Enviar instruções" color="primary" class="full-width q-mt-md" :loading="loading" />
      </q-form>
      <div class="row items-center q-mt-md">
        <q-btn flat no-caps size="sm" @click="router.push('/login')">Voltar ao login</q-btn>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const user_documento = ref('')
const user_email = ref('')
const loading = ref(false)
const r = v => !!v || 'Obrigatório'

const onSubmit = async () => {
  loading.value = true
  try {
    await auth.forgot({ user_documento: user_documento.value, user_email: user_email.value })
  } finally {
    loading.value = false
  }
}
</script>
