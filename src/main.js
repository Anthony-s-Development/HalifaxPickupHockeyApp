import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Dark Mode */
import '@ionic/vue/css/palettes/dark.always.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(IonicVue)
app.use(router)

// Initialize auth before mounting
const authStore = useAuthStore()
authStore.initAuth().then(() => {
  router.isReady().then(() => {
    app.mount('#app')
  })
})
