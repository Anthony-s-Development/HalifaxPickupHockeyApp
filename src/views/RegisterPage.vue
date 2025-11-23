<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="register-container">
        <h1>Create Account</h1>

        <form @submit.prevent="handleRegister">
          <ion-item>
            <ion-label position="floating">Name</ion-label>
            <ion-input
              v-model="name"
              type="text"
              required
              autocomplete="name"
            ></ion-input>
          </ion-item>

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
              autocomplete="new-password"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Position</ion-label>
            <ion-select v-model="position" interface="popover">
              <ion-select-option value="Forward">Forward</ion-select-option>
              <ion-select-option value="Defense">Defense</ion-select-option>
              <ion-select-option value="Goalie">Goalie</ion-select-option>
            </ion-select>
          </ion-item>

          <div class="skill-level-section">
            <h3>Skill Level</h3>
            <p class="section-description">Select your skill level</p>

            <ion-radio-group v-model="skillLevel">
              <ion-item>
                <ion-label class="skill-label">
                  <h2>Level 1</h2>
                  <p>
                    Basic skating ability but struggles with backward skating
                    and crossovers
                  </p>
                </ion-label>
                <ion-radio slot="start" :value="1"></ion-radio>
              </ion-item>

              <ion-item>
                <ion-label class="skill-label">
                  <h2>Level 3</h2>
                  <p>
                    A good mix of basic skills, decent knowledge of the game,
                    and athletic ability
                  </p>
                </ion-label>
                <ion-radio slot="start" :value="3"></ion-radio>
              </ion-item>

              <ion-item>
                <ion-label class="skill-label">
                  <h2>Level 5</h2>
                  <p>
                    Advanced skills, strong physical shape, and a high
                    understanding of the game
                  </p>
                </ion-label>
                <ion-radio slot="start" :value="5"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>

          <ion-button
            type="submit"
            expand="block"
            class="ion-margin-top"
            :disabled="loading"
          >
            <ion-spinner v-if="loading" />
            <span v-else>Register</span>
          </ion-button>
        </form>

        <div class="login-link">
          <ion-text color="medium">
            <p>
              Already have an account?
              <a @click="router.push('/login')">Login here</a>
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
  IonSelect,
  IonSelectOption,
  IonRadio,
  IonRadioGroup,
  IonText,
  IonNote,
  IonSpinner,
  toastController,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const position = ref("Forward");
const skillLevel = ref(3);
const loading = ref(false);

const handleRegister = async () => {
  if (password.value.length < 6) {
    const toast = await toastController.create({
      message: "Password must be at least 6 characters",
      duration: 3000,
      color: "danger",
    });
    await toast.present();
    return;
  }

  loading.value = true;
  const result = await authStore.register(email.value, password.value, {
    name: name.value,
    position: position.value,
    skillLevel: skillLevel.value,
  });
  loading.value = false;

  if (result.success) {
    const toast = await toastController.create({
      message: "Account created successfully!",
      duration: 2000,
      color: "success",
    });
    await toast.present();
    router.push("/home");
  } else {
    const toast = await toastController.create({
      message: result.error || "Registration failed",
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
};
</script>

<style scoped>
.register-container {
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

.skill-level-section {
  margin-top: 2rem;
}

.skill-level-section h3 {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
}

.skill-label p {
  white-space: normal;
  font-size: 0.85rem;
}

.section-description {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  padding-left: 1rem;
  margin-bottom: 1rem;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: var(--ion-color-primary);
  cursor: pointer;
  text-decoration: underline;
}
</style>
