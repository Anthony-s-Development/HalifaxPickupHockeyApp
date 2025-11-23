<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <h1>Welcome Back</h1>

        <form @submit.prevent="handleLogin">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input
              v-model="email"
              type="email"
              required
              autocomplete="email"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
            ></ion-input>
          </ion-item>

          <ion-button
            type="submit"
            expand="block"
            class="ion-margin-top"
            :disabled="loading"
          >
            <ion-spinner v-if="loading" />
            <span v-else>Login</span>
          </ion-button>
        </form>

        <div class="register-link">
          <ion-text color="medium">
            <p>
              Don't have an account?
              <a @click="router.push('/register')">Register here</a>
            </p>
          </ion-text>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const result = await authStore.login(email.value, password.value)
  loading.value = false

  if (result.success) {
    const toast = await toastController.create({
      message: 'Logged in successfully!',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    const redirectPath = route.query.redirect || '/home'
    router.push(redirectPath)
  } else {
    const toast = await toastController.create({
      message: result.error || 'Login failed',
      duration: 3000,
      color: 'danger'
    })
    await toast.present()
  }
}
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

form {
  margin-bottom: 1rem;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.register-link a {
  color: var(--ion-color-primary);
  cursor: pointer;
  text-decoration: underline;
}
</style>
