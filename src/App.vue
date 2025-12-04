<template>
  <ion-app>
    <ion-menu content-id="main-content" type="overlay">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ cityStore.currentCity ? cityStore.currentCityDisplayName : 'Nova Adult Hockey' }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="menu-content">
        <div class="menu-top">
          <ion-list>
            <ion-item button @click="navigateTo(cityHomePath)" lines="none">
              <ion-icon slot="start" :icon="homeOutline"></ion-icon>
              <ion-label>Home</ion-label>
            </ion-item>

            <ion-item button @click="navigateTo(aboutPath)" lines="none">
              <ion-icon slot="start" :icon="informationCircleOutline"></ion-icon>
              <ion-label>About</ion-label>
            </ion-item>

            <ion-item v-if="isCurrentCityAdmin" button @click="navigateTo(adminPath)" lines="none">
              <ion-icon slot="start" :icon="settings"></ion-icon>
              <ion-label>Admin</ion-label>
            </ion-item>

            <ion-item v-if="!authStore.isAuthenticated" button @click="navigateTo('/login')" lines="none">
              <ion-icon slot="start" :icon="logInOutline"></ion-icon>
              <ion-label>Login</ion-label>
            </ion-item>
          </ion-list>

          <!-- City Switcher Section -->
          <div v-if="cityStore.activeCities.length > 1" class="city-switcher">
            <ion-list-header>
              <ion-label>Switch City</ion-label>
            </ion-list-header>
            <ion-list>
              <ion-item
                v-for="city in cityStore.activeCities"
                :key="city.id"
                button
                @click="switchCity(city.id)"
                lines="none"
                :class="{ 'selected-city': city.id === cityStore.currentCityId }"
              >
                <ion-icon slot="start" :icon="locationOutline"></ion-icon>
                <ion-label>{{ city.name }}</ion-label>
                <ion-icon v-if="city.id === cityStore.currentCityId" slot="end" :icon="checkmarkOutline" color="success"></ion-icon>
              </ion-item>
            </ion-list>
          </div>
        </div>

      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content" />
  </ion-app>
</template>

<script setup>
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  menuController
} from '@ionic/vue'
import {
  homeOutline,
  informationCircleOutline,
  settings,
  logInOutline,
  locationOutline,
  checkmarkOutline
} from 'ionicons/icons'
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCityStore } from '@/stores/city'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cityStore = useCityStore()

// Load cities on app mount (uses localStorage cache)
onMounted(() => {
  cityStore.loadCities()
})

// Get current city from route or store
const currentCityId = computed(() => {
  return route.params.cityId || cityStore.currentCityId
})

// Compute city-scoped paths
const cityHomePath = computed(() => {
  return currentCityId.value ? `/${currentCityId.value}` : '/'
})

const aboutPath = computed(() => {
  return currentCityId.value ? `/${currentCityId.value}/about` : '/'
})

const adminPath = computed(() => {
  return currentCityId.value ? `/${currentCityId.value}/admin` : '/'
})

// Check if current user is admin for current city
const isCurrentCityAdmin = computed(() => {
  return authStore.isCityAdmin(currentCityId.value)
})

const navigateTo = async (path) => {
  await menuController.close()
  router.push(path)
}

const switchCity = async (cityId) => {
  await menuController.close()
  await cityStore.setCurrentCity(cityId)
  router.push(`/${cityId}`)
}
</script>

<style>
body {
  --ion-background-color: #1a1a1a;
  --ion-text-color: #ffffff;
}

/* Global header/toolbar styling */
ion-header ion-toolbar {
  --background: #4f001e;
  --color: white;
}

ion-header ion-title {
  color: white;
}

ion-header ion-button {
  --color: white;
}

ion-header ion-back-button {
  --color: white;
}

ion-item ion-textarea {
  padding-top: 20px !important;
}

ion-item ion-input {
  --padding-top: 20px;
  margin-top: 20px !important;
}

ion-item ion-select {
  margin-top: 8px !important;
}

ion-item {
  --padding-top: 8px;
  --padding-bottom: 8px;
  --inner-padding-top: 8px;
  --inner-padding-bottom: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
  min-height: 56px;
}

ion-card {
  --background: #2d2d2d;
  --color: #ffffff;
}

a {
  color: #66b3ff;
}

.toast-success {
  --background: #2dd36f;
}

.toast-danger {
  --background: #eb445a;
}

.toast-warning {
  --background: #ffc409;
}

ion-menu .menu-content {
  --padding-top: 0;
  --padding-bottom: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

ion-menu .menu-top {
  flex: 1;
  overflow-y: auto;
}

ion-menu ion-list {
  padding: 1rem 0;
}

ion-menu ion-item {
  --padding-start: 1rem;
  --inner-padding-end: 1rem;
  margin: 0.25rem 0;
  font-size: 1.1rem;
}

ion-menu ion-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

ion-menu-button {
  color: white !important;
  --color: white !important;
}

/* City switcher styles */
ion-menu .city-switcher {
  border-top: 1px solid var(--ion-color-light);
  margin-top: 1rem;
  padding-top: 0.5rem;
}

ion-menu .city-switcher ion-list-header {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  padding-left: 1rem;
  margin-bottom: 0;
}

ion-menu .city-switcher ion-item {
  font-size: 1rem;
}

ion-menu .city-switcher .selected-city {
  --background: var(--ion-color-primary-shade);
}
</style>
