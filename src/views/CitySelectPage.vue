<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nova Adult Hockey</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="city-select-container">
        <div class="header-section">
          <h1>Welcome to Nova Adult Hockey</h1>
          <p class="subtitle">Select your city to get started</p>
        </div>

        <div v-if="cityStore.loading" class="loading-container">
          <ion-spinner></ion-spinner>
          <p>Loading cities...</p>
        </div>

        <div v-else class="cities-grid">
          <ion-card
            v-for="city in cityStore.activeCities"
            :key="city.id"
            class="city-card"
            button
            @click="selectCity(city)"
          >
            <div
              class="city-card-content"
              :style="{ '--city-color': city.primaryColor }"
            >
              <div class="city-logo">
                <img
                  v-if="city.logo"
                  :src="city.logo"
                  :alt="`${city.name} logo`"
                  @error="handleImageError"
                />
                <ion-icon
                  v-else
                  :icon="locationOutline"
                  class="default-icon"
                ></ion-icon>
              </div>
              <h2>{{ city.displayName }}</h2>
              <p class="city-name">{{ city.name }}, Nova Scotia</p>
            </div>
          </ion-card>
        </div>

        <div
          v-if="!cityStore.loading && cityStore.activeCities.length === 0"
          class="empty-state"
        >
          <ion-text color="medium">
            <p>No cities available at this time.</p>
            <p>Please check back later.</p>
          </ion-text>
        </div>

        <div class="footer-section">
          <ion-text color="medium">
            <p v-if="authStore.isAuthenticated">
              Logged in as {{ authStore.userProfile?.name }}
              <ion-button
                fill="clear"
                color="danger"
                size="small"
                @click="handleLogout"
                >Logout</ion-button
              >
            </p>
            <p v-else>
              <ion-button
                fill="clear"
                color="primary"
                size="small"
                @click="router.push('/login')"
                >Login</ion-button
              >
              or
              <ion-button
                fill="clear"
                color="primary"
                size="small"
                @click="router.push('/register')"
                >Register</ion-button
              >
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
  IonCard,
  IonText,
  IonButton,
  IonSpinner,
  IonIcon,
  toastController,
} from "@ionic/vue";
import { locationOutline } from "ionicons/icons";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCityStore } from "@/stores/city";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const cityStore = useCityStore();
const authStore = useAuthStore();

onMounted(async () => {
  // Load cities (uses localStorage cache, refreshes if stale)
  await cityStore.loadCities();

  // If user is logged in and has a default city, redirect there
  if (authStore.isAuthenticated && authStore.userProfile?.defaultCityId) {
    const defaultCity = cityStore.getCityById(
      authStore.userProfile.defaultCityId
    );
    if (defaultCity) {
      router.push(`/${defaultCity.id}`);
      return;
    }
  }

  // Check for last visited city
  const lastCityId = cityStore.getLastCityId();
  if (lastCityId) {
    const lastCity = cityStore.getCityById(lastCityId);
    if (lastCity) {
      // Show toast suggesting to return to last city
      const toast = await toastController.create({
        message: `Welcome back! Tap to return to ${lastCity.displayName}`,
        duration: 4000,
        position: "bottom",
        buttons: [
          {
            text: "Go",
            handler: () => {
              router.push(`/${lastCity.id}`);
            },
          },
        ],
      });
      await toast.present();
    }
  }
});

const selectCity = async (city) => {
  await cityStore.setCurrentCity(city.id);
  router.push(`/${city.id}`);
};

const handleImageError = (event) => {
  event.target.style.display = "none";
};

const handleLogout = async () => {
  await authStore.logout();
  const toast = await toastController.create({
    message: "Logged out successfully",
    duration: 2000,
    color: "success",
  });
  await toast.present();
};
</script>

<style scoped>
.city-select-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.header-section h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--ion-text-color);
}

.header-section .subtitle {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.city-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin: 0;
}

.city-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.city-card-content {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(
    135deg,
    var(--city-color, #4f001e) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.city-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.city-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.city-logo .default-icon {
  font-size: 4rem;
  color: white;
  opacity: 0.8;
}

.city-card-content h2 {
  color: white;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.city-card-content .city-name {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.footer-section {
  margin-top: auto;
  padding-top: 2rem;
  text-align: center;
  border-top: 1px solid var(--ion-color-light);
}

.footer-section p {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

@media (min-width: 768px) {
  .header-section h1 {
    font-size: 2.5rem;
  }

  .city-card-content {
    min-height: 250px;
    padding: 2.5rem;
  }

  .city-logo {
    width: 100px;
    height: 100px;
  }

  .city-card-content h2 {
    font-size: 1.75rem;
  }
}
</style>
