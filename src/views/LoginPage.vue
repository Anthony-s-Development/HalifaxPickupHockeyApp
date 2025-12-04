<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <h1>Welcome Back</h1>

        <form @submit.prevent="handleLogin">
          <ion-input
            v-model="email"
            type="email"
            label="Email"
            label-placement="stacked"
            placeholder="Enter your email"
            required
            autocomplete="email"
            fill="outline"
            class="form-input"
          ></ion-input>

          <ion-input
            v-model="password"
            type="password"
            label="Password"
            label-placement="stacked"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
            fill="outline"
            class="form-input"
          ></ion-input>

          <ion-button
            type="submit"
            expand="block"
            class="submit-button"
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
  IonInput,
  IonText,
  IonSpinner,
  toastController,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  const result = await authStore.login(email.value, password.value);
  loading.value = false;

  if (result.success) {
    const toast = await toastController.create({
      message: "Logged in successfully!",
      duration: 2000,
      color: "success",
    });
    await toast.present();

    // Redirect to specified path, user's default city, or city selection
    const defaultCity = authStore.userProfile?.defaultCityId;
    const redirectPath =
      route.query.redirect || (defaultCity ? `/${defaultCity}` : "/");
    router.push(redirectPath);
  } else {
    const toast = await toastController.create({
      message: result.error || "Login failed",
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
};
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 24px;
  font-weight: 600;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input {
  --border-radius: 8px;
  --highlight-color-focused: var(--ion-color-primary);
}

.submit-button {
  margin-top: 8px;
  --border-radius: 8px;
  font-weight: 600;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
}

.register-link a {
  color: var(--ion-color-primary);
  cursor: pointer;
  text-decoration: underline;
}
</style>
