import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import router from './router'
import App from './App.vue'

import 'quasar/dist/quasar.css'

const app = createApp(App)
app.use(Quasar)
app.use(createPinia())
app.use(router)
app.mount('#app')