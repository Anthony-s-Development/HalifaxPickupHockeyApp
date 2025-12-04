<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="register-container">
        <h1>Create Account</h1>

        <form @submit.prevent="handleRegister">
          <ion-input
            v-model="name"
            type="text"
            label="Full Name"
            label-placement="stacked"
            placeholder="Enter your first and last name"
            required
            autocomplete="name"
            fill="outline"
            class="form-input"
          ></ion-input>

          <ion-input
            v-model="email"
            type="email"
            label="Email Address"
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
            placeholder="Create a password (min 6 characters)"
            required
            autocomplete="new-password"
            fill="outline"
            class="form-input"
          ></ion-input>

          <ion-select
            v-model="selectedCityId"
            label="Home City"
            label-placement="stacked"
            placeholder="Select your home city"
            interface="action-sheet"
            fill="outline"
            class="form-input"
          >
            <ion-select-option
              v-for="city in cityStore.activeCities"
              :key="city.id"
              :value="city.id"
            >
              {{ city.displayName }}
            </ion-select-option>
          </ion-select>

          <ion-select
            v-model="position"
            label="Position"
            label-placement="stacked"
            placeholder="Select your position"
            interface="action-sheet"
            fill="outline"
            class="form-input"
          >
            <ion-select-option value="Forward">Forward</ion-select-option>
            <ion-select-option value="Defense">Defense</ion-select-option>
            <ion-select-option value="Goalie">Goalie</ion-select-option>
          </ion-select>

          <div class="skill-level-section">
            <h3>Skill Level</h3>
            <p class="section-description">Select your skill level</p>

            <ion-radio-group v-model="skillLevel">
              <div class="skill-option" :class="{ selected: skillLevel === 1 }" @click="skillLevel = 1">
                <ion-radio :value="1" label-placement="end"></ion-radio>
                <div class="skill-content">
                  <span class="skill-title">Level 1</span>
                  <span class="skill-desc">Basic skating ability but struggles with backward skating and crossovers</span>
                </div>
              </div>

              <div class="skill-option" :class="{ selected: skillLevel === 2 }" @click="skillLevel = 2">
                <ion-radio :value="2" label-placement="end"></ion-radio>
                <div class="skill-content">
                  <span class="skill-title">Level 2</span>
                  <span class="skill-desc">A good mix of basic skills, decent knowledge of the game, and athletic ability</span>
                </div>
              </div>

              <div class="skill-option" :class="{ selected: skillLevel === 3 }" @click="skillLevel = 3">
                <ion-radio :value="3" label-placement="end"></ion-radio>
                <div class="skill-content">
                  <span class="skill-title">Level 3</span>
                  <span class="skill-desc">Advanced skills, strong physical shape, and a high understanding of the game</span>
                </div>
              </div>
            </ion-radio-group>
          </div>

          <ion-button
            type="submit"
            expand="block"
            class="submit-button"
            :disabled="loading || !selectedCityId"
          >
            <ion-spinner v-if="loading" />
            <span v-else>Create Account</span>
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
  IonInput,
  IonSelect,
  IonSelectOption,
  IonRadio,
  IonRadioGroup,
  IonText,
  IonSpinner,
  toastController,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCityStore } from "@/stores/city";

const router = useRouter();
const authStore = useAuthStore();
const cityStore = useCityStore();

const name = ref("");
const email = ref("");
const password = ref("");
const selectedCityId = ref("");
const position = ref("Forward");
const skillLevel = ref(2);
const loading = ref(false);

onMounted(async () => {
  // Load cities if not already loaded
  if (!cityStore.citiesLoaded) {
    await cityStore.loadCities();
  }

  // Default to first active city or last visited city
  const lastCityId = cityStore.getLastCityId();
  if (lastCityId && cityStore.getCityById(lastCityId)) {
    selectedCityId.value = lastCityId;
  } else if (cityStore.activeCities.length > 0) {
    selectedCityId.value = cityStore.activeCities[0].id;
  }
});

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

  if (!selectedCityId.value) {
    const toast = await toastController.create({
      message: "Please select a home city",
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
    cityId: selectedCityId.value,
  });
  loading.value = false;

  if (result.success) {
    const toast = await toastController.create({
      message: "Account created successfully!",
      duration: 2000,
      color: "success",
    });
    await toast.present();
    // Navigate to the selected city's home page
    router.push(`/${selectedCityId.value}`);
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
  padding-top: 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
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

.skill-level-section {
  margin-top: 8px;
}

.skill-level-section h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-medium);
}

.section-description {
  color: var(--ion-color-medium);
  font-size: 13px;
  margin: 0 0 12px 0;
}

ion-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--ion-color-light-shade);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skill-option:hover {
  border-color: var(--ion-color-primary);
  background: rgba(var(--ion-color-primary-rgb), 0.05);
}

.skill-option.selected {
  border-color: var(--ion-color-primary);
  background: rgba(var(--ion-color-primary-rgb), 0.1);
}

.skill-option ion-radio {
  margin-top: 2px;
}

.skill-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.skill-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.skill-desc {
  font-size: 13px;
  color: var(--ion-color-medium);
  line-height: 1.4;
}

.submit-button {
  margin-top: 8px;
  --border-radius: 8px;
  font-weight: 600;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
}

.login-link a {
  color: var(--ion-color-primary);
  cursor: pointer;
  text-decoration: underline;
}
</style>
