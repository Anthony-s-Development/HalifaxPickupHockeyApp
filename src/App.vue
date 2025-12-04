<template>
  <ion-app>
    <ion-menu content-id="main-content" type="overlay">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{
            cityStore.currentCity
              ? cityStore.currentCityDisplayName
              : "Nova Adult Hockey"
          }}</ion-title>
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
              <ion-icon
                slot="start"
                :icon="informationCircleOutline"
              ></ion-icon>
              <ion-label>About</ion-label>
            </ion-item>

            <ion-item
              v-if="isCurrentCityAdmin"
              button
              @click="navigateTo(adminPath)"
              lines="none"
            >
              <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
              <ion-label>Admin</ion-label>
            </ion-item>

            <ion-item
              v-if="!authStore.isAuthenticated"
              button
              @click="navigateTo('/login')"
              lines="none"
            >
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
                :class="{
                  'selected-city': city.id === cityStore.currentCityId,
                }"
              >
                <ion-icon slot="start" :icon="locationOutline"></ion-icon>
                <ion-label>{{ city.name }}</ion-label>
                <ion-icon
                  v-if="city.id === cityStore.currentCityId"
                  slot="end"
                  :icon="checkmarkOutline"
                  color="success"
                ></ion-icon>
              </ion-item>
            </ion-list>
          </div>

          <!-- Appearance Section -->
          <div class="appearance-switcher">
            <ion-list-header>
              <ion-label>Appearance</ion-label>
            </ion-list-header>
            <ion-list>
              <ion-item lines="none">
                <ion-icon
                  slot="start"
                  :icon="themeStore.isDark ? moonOutline : sunnyOutline"
                ></ion-icon>
                <ion-label>Dark Mode</ion-label>
                <ion-toggle
                  slot="end"
                  :checked="themeStore.isDark"
                  @ionChange="themeStore.toggleTheme()"
                ></ion-toggle>
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
  IonToggle,
  menuController,
} from "@ionic/vue";
import {
  homeOutline,
  informationCircleOutline,
  settingsOutline,
  logInOutline,
  locationOutline,
  checkmarkOutline,
  moonOutline,
  sunnyOutline,
} from "ionicons/icons";
import { computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCityStore } from "@/stores/city";
import { useThemeStore } from "@/stores/theme";
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cityStore = useCityStore();
const themeStore = useThemeStore();

// Load cities on app mount (uses localStorage cache)
onMounted(() => {
  cityStore.loadCities();
});

// Get current city from route or store
const currentCityId = computed(() => {
  return route.params.cityId || cityStore.currentCityId;
});

// Compute city-scoped paths
const cityHomePath = computed(() => {
  return currentCityId.value ? `/${currentCityId.value}` : "/";
});

const aboutPath = computed(() => {
  return currentCityId.value ? `/${currentCityId.value}/about` : "/";
});

const adminPath = computed(() => {
  return currentCityId.value ? `/${currentCityId.value}/admin` : "/";
});

// Check if current user is admin for current city
const isCurrentCityAdmin = computed(() => {
  return authStore.isCityAdmin(currentCityId.value);
});

const navigateTo = async (path) => {
  await menuController.close();
  router.push(path);
};

const switchCity = async (cityId) => {
  await menuController.close();
  await cityStore.setCurrentCity(cityId);
  router.push(`/${cityId}`);
};
</script>

<style>
/* ========================================
   CSS Custom Properties - Apple-Inspired Theme
   ======================================== */

:root {
  /* Primary Action Color (Apple Blue) */
  --accent-color: #007aff;
  --accent-color-hover: #0056b3;
  --accent-color-light: rgba(0, 122, 255, 0.1);

  /* Semantic Colors */
  --color-success: #34c759;
  --color-warning: #ff9500;
  --color-danger: #ff3b30;
  --color-info: #007aff;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Border Radius (Apple-style) */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Shadows (Subtle Apple-style depth) */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 250ms ease-out;
}

/* Light Theme - Apple-inspired (applied globally) */
:root,
body {
  --bg-primary: #ffffff;
  --bg-secondary: #f2f2f7;
  --bg-tertiary: #e5e5ea;
  --bg-elevated: #ffffff;
  --bg-grouped: #f2f2f7;

  --text-primary: #000000;
  --text-secondary: #3c3c43;
  --text-tertiary: #8e8e93;
  --text-quaternary: #c7c7cc;
  --text-inverse: #ffffff;

  --separator-color: rgba(60, 60, 67, 0.12);
  --separator-color-opaque: #c6c6c8;

  --card-bg: #ffffff;
  --card-shadow: var(--shadow-sm);

  --fill-primary: rgba(120, 120, 128, 0.2);
  --fill-secondary: rgba(120, 120, 128, 0.16);
  --fill-tertiary: rgba(118, 118, 128, 0.12);

  /* For backwards compatibility */
  --border-color: var(--separator-color);
  --brand-primary: var(--accent-color);

  /* Ionic overrides */
  --ion-background-color: var(--bg-secondary);
  --ion-text-color: var(--text-primary);
  --ion-card-background: var(--card-bg);
  --ion-item-background: var(--bg-primary);
  --ion-toolbar-background: var(--bg-elevated);
  --ion-toolbar-color: var(--text-primary);
}

/* Dark Theme - Apple-inspired */
.dark-theme,
.dark-theme body {
  --bg-primary: #1c1c1e;
  --bg-secondary: #000000;
  --bg-tertiary: #2c2c2e;
  --bg-elevated: #1c1c1e;
  --bg-grouped: #000000;

  --text-primary: #ffffff;
  --text-secondary: rgba(235, 235, 245, 0.6);
  --text-tertiary: rgba(235, 235, 245, 0.3);
  --text-quaternary: rgba(235, 235, 245, 0.18);
  --text-inverse: #000000;

  --separator-color: rgba(84, 84, 88, 0.65);
  --separator-color-opaque: #38383a;

  --card-bg: #1c1c1e;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  --fill-primary: rgba(120, 120, 128, 0.36);
  --fill-secondary: rgba(120, 120, 128, 0.32);
  --fill-tertiary: rgba(118, 118, 128, 0.24);

  /* Shadows need adjustment for dark mode */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);

  /* Ionic overrides for dark mode */
  --ion-background-color: var(--bg-secondary);
  --ion-text-color: var(--text-primary);
  --ion-card-background: var(--card-bg);
  --ion-item-background: var(--bg-primary);
  --ion-toolbar-background: var(--bg-elevated);
  --ion-toolbar-color: var(--text-primary);
}

/* ========================================
   Global Styles - Apple-Inspired
   ======================================== */

* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
    "SF Pro Text", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.01em;
}

/* ========================================
   Header / Navigation Bar (Apple-style)
   ======================================== */

ion-header ion-toolbar {
  --background: var(--bg-elevated);
  --color: var(--text-primary);
  --border-width: 0;
  --min-height: 44px;
}

/* Add subtle bottom border/shadow to header */
ion-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--separator-color);
}

ion-header ion-title {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.02em;
}

ion-header ion-button {
  --color: var(--accent-color);
}

ion-header ion-back-button {
  --color: var(--accent-color);
}

ion-menu-button {
  color: var(--accent-color) !important;
  --color: var(--accent-color) !important;
}

/* ========================================
   Cards (Apple-style elevated surfaces)
   ======================================== */

ion-card {
  --background: var(--card-bg);
  --color: var(--text-primary);
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  margin: var(--space-md);
}

/* ========================================
   Lists and Items (Apple Settings-style)
   ======================================== */

ion-list {
  background: transparent;
  border-radius: var(--radius-md);
  overflow: hidden;
}

ion-list.list-inset {
  margin: 0 var(--space-md);
  background: var(--card-bg);
  border-radius: var(--radius-md);
}

ion-item {
  --background: var(--card-bg);
  --color: var(--text-primary);
  --padding-start: var(--space-md);
  --padding-end: var(--space-md);
  --inner-padding-end: var(--space-md);
  --border-color: var(--separator-color);
  --min-height: 44px;
  font-size: 17px;
}

ion-item ion-label {
  color: var(--text-primary) !important;
}

ion-item ion-label p {
  color: var(--text-secondary) !important;
  font-size: 15px;
}

ion-item ion-label[slot="end"],
ion-item ion-note[slot="end"] {
  color: var(--text-tertiary);
}

/* ========================================
   Form Elements
   ======================================== */

ion-item ion-input,
ion-item ion-textarea,
ion-item ion-select {
  --color: var(--text-primary);
  --placeholder-color: var(--text-tertiary);
  font-size: 17px;
}

/* ========================================
   Links (Apple Blue)
   ======================================== */

a {
  color: var(--accent-color);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

a:hover {
  opacity: 0.7;
}

a:active {
  opacity: 0.5;
}

/* ========================================
   Buttons (Apple-style)
   ======================================== */

ion-button {
  --border-radius: var(--radius-md);
  --background: var(--accent-color);
  --background-hover: var(--accent-color-hover);
  --background-activated: var(--accent-color-hover);
  font-weight: 600;
  font-size: 17px;
  text-transform: none;
  letter-spacing: -0.01em;
  --padding-start: 20px;
  --padding-end: 20px;
}

ion-button[fill="clear"],
ion-button[fill="outline"] {
  --color: var(--accent-color);
}

/* ========================================
   Badges (Apple-style)
   ======================================== */

ion-badge {
  --border-radius: var(--radius-full);
  font-weight: 500;
  font-size: 13px;
  padding: 2px 8px;
}

/* ========================================
   Segments (Apple-style pill selector)
   ======================================== */

ion-segment {
  --background: var(--fill-tertiary);
  border-radius: var(--radius-sm);
  padding: 2px;
}

ion-segment-button {
  --background-checked: var(--card-bg);
  --color: var(--text-primary);
  --color-checked: var(--text-primary);
  --indicator-color: transparent;
  --border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  min-height: 28px;
  text-transform: none;
}

ion-segment-button::part(indicator-background) {
  background: var(--card-bg);
  box-shadow: var(--shadow-xs);
}

/* ========================================
   Toast Notifications
   ======================================== */

.toast-success {
  --background: var(--color-success);
  --color: white;
}

.toast-danger {
  --background: var(--color-danger);
  --color: white;
}

.toast-warning {
  --background: var(--color-warning);
  --color: white;
}

/* ========================================
   Menu Styles (Apple Settings-inspired)
   ======================================== */

ion-menu {
  --background: var(--bg-secondary);
}

ion-menu .menu-content {
  --background: var(--bg-secondary);
  --padding-top: 0;
  --padding-bottom: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

ion-menu .menu-top {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

ion-menu ion-list {
  padding: 0;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--space-lg);
}

ion-menu ion-item {
  --background: var(--card-bg);
  --padding-start: var(--space-md);
  --inner-padding-end: var(--space-md);
  --min-height: 44px;
  margin: 0;
  border-radius: 0;
  font-size: 17px;
  --border-color: var(--separator-color);
}

ion-menu ion-item:last-child {
  --border-width: 0;
}

ion-menu ion-item:active {
  --background: var(--fill-tertiary);
}

ion-menu ion-icon {
  font-size: 22px;
  margin-right: var(--space-sm);
  color: var(--accent-color);
}

/* City switcher styles */
ion-menu .city-switcher {
  margin-top: 0;
  padding-top: 0;
}

ion-menu .city-switcher ion-list-header {
  font-size: 13px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0;
  color: var(--text-tertiary);
  padding: 0 var(--space-md) var(--space-sm);
  margin-bottom: 0;
  background: transparent;
}

ion-menu .city-switcher ion-list {
  margin-bottom: var(--space-lg);
}

ion-menu .city-switcher ion-item {
  font-size: 17px;
}

ion-menu .city-switcher .selected-city {
  --background: var(--card-bg);
}

ion-menu .city-switcher .selected-city ion-icon:first-child {
  color: var(--accent-color);
}

/* Appearance switcher styles */
ion-menu .appearance-switcher {
  margin-top: 0;
  padding-top: 0;
}

ion-menu .appearance-switcher ion-list-header {
  font-size: 13px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0;
  color: var(--text-tertiary);
  padding: 0 var(--space-md) var(--space-sm);
  margin-bottom: 0;
  background: transparent;
}

ion-menu .appearance-switcher ion-list {
  margin-bottom: var(--space-lg);
}

ion-menu .appearance-switcher ion-item {
  font-size: 17px;
}

ion-menu .appearance-switcher ion-toggle {
  --background: var(--fill-secondary);
  --background-checked: var(--accent-color);
  --handle-background: var(--card-bg);
  --handle-background-checked: var(--text-inverse);
}

/* ========================================
   Utility Classes
   ======================================== */

.text-primary {
  color: var(--text-primary);
}
.text-secondary {
  color: var(--text-secondary);
}
.text-tertiary {
  color: var(--text-tertiary);
}

.bg-primary {
  background: var(--bg-primary);
}
.bg-secondary {
  background: var(--bg-secondary);
}
.bg-elevated {
  background: var(--bg-elevated);
}

/* ========================================
   Select Popovers, Alerts, Action Sheets
   ======================================== */

/* Ion Select Popover */
ion-select-popover {
  --background: var(--card-bg);
}

ion-select-popover ion-list {
  background: var(--card-bg) !important;
}

ion-select-popover ion-item {
  --background: var(--card-bg);
  --color: var(--text-primary);
}

ion-select-popover ion-label {
  color: var(--text-primary) !important;
}

ion-select-popover ion-radio {
  --color: var(--text-tertiary);
  --color-checked: var(--accent-color);
}

/* Ion Alert (used by some selects) */
ion-alert {
  --background: var(--card-bg);
}

ion-alert .alert-wrapper {
  background: var(--card-bg) !important;
  border-radius: var(--radius-lg) !important;
}

ion-alert .alert-head {
  background: var(--card-bg);
}

ion-alert .alert-title {
  color: var(--text-primary) !important;
  font-weight: 600;
}

ion-alert .alert-sub-title {
  color: var(--text-secondary) !important;
}

ion-alert .alert-message {
  color: var(--text-secondary) !important;
}

ion-alert .alert-radio-group,
ion-alert .alert-checkbox-group {
  background: var(--card-bg);
  border-top: 1px solid var(--separator-color);
  border-bottom: 1px solid var(--separator-color);
}

ion-alert .alert-radio-label,
ion-alert .alert-checkbox-label {
  color: var(--text-primary) !important;
}

ion-alert .alert-radio-inner {
  background-color: var(--accent-color) !important;
}

ion-alert [aria-checked="true"] .alert-radio-label {
  color: var(--accent-color) !important;
}

ion-alert .alert-button-group {
  background: var(--card-bg);
}

ion-alert .alert-button {
  color: var(--accent-color) !important;
}

ion-alert .alert-button.alert-button-role-cancel {
  color: var(--text-tertiary) !important;
}

/* Ion Action Sheet */
ion-action-sheet {
  --background: var(--card-bg);
  --button-background: var(--card-bg);
  --button-color: var(--accent-color);
}

ion-action-sheet .action-sheet-group {
  background: var(--card-bg) !important;
}

ion-action-sheet .action-sheet-title {
  color: var(--text-secondary) !important;
}

ion-action-sheet .action-sheet-button {
  color: var(--accent-color) !important;
}

ion-action-sheet .action-sheet-button.action-sheet-destructive {
  color: var(--color-danger) !important;
}

ion-action-sheet .action-sheet-button.action-sheet-cancel {
  background: var(--card-bg) !important;
  color: var(--accent-color) !important;
  font-weight: 600;
}

/* Ion Picker (date/time pickers) */
ion-picker {
  --background: var(--card-bg);
}

ion-picker .picker-wrapper {
  background: var(--card-bg) !important;
}

ion-picker .picker-toolbar {
  background: var(--card-bg);
  border-bottom: 1px solid var(--separator-color);
}

ion-picker .picker-button {
  color: var(--accent-color) !important;
}

ion-picker .picker-columns {
  background: var(--card-bg);
}

ion-picker .picker-opt {
  color: var(--text-primary) !important;
}

ion-picker .picker-opt.picker-opt-selected {
  color: var(--text-primary) !important;
}

/* ========================================
   Responsive Adjustments
   ======================================== */

@media (min-width: 768px) {
  ion-menu ion-item {
    margin: var(--space-xs) var(--space-md);
  }
}
</style>
