<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <div class="header-content">
          <img
            v-if="cityStore.currentCityLogo"
            :src="cityStore.currentCityLogo"
            :alt="`${cityStore.currentCity?.name} Logo`"
            class="header-logo"
            @error="handleLogoError"
          />
          <ion-title>{{ cityStore.currentCityDisplayName }}</ion-title>
        </div>
        <ion-buttons slot="end">
          <ion-button
            fill="clear"
            color="primary"
            @click="router.push('/')"
            title="Switch City"
          >
            <ion-icon :icon="swapHorizontalOutline"></ion-icon>
          </ion-button>
          <ion-button
            fill="clear"
            color="primary"
            v-if="authStore.isAuthenticated"
            @click="router.push(`/${cityId}/profile`)"
            title="Profile"
          >
            <ion-icon :icon="personCircleOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Pull to Refresh -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-text="Pull to refresh"
          refreshing-spinner="circles"
          refreshing-text="Refreshing..."
        ></ion-refresher-content>
      </ion-refresher>

      <div class="content-container">
        <!-- Stale Data Warning -->
        <div
          v-if="gameStore.isDataStale && gameStore.currentGame"
          class="stale-warning"
          @click="manualRefresh"
        >
          <ion-icon :icon="alertCircleOutline"></ion-icon>
          <span>Data may be out of date. Pull down to refresh.</span>
          <span class="last-updated"
            >Updated {{ gameStore.timeSinceRefresh }}</span
          >
        </div>

        <div class="cards-layout">
          <!-- Welcome Card / Schedule Section -->
          <div class="schedule-section">
            <div class="welcome-card">
              <div class="welcome-header">
                <h1>Welcome to {{ cityStore.currentCityDisplayName }}</h1>
                <p class="welcome-subtitle">
                  <strong>New to us?</strong> Email
                  <a :href="`mailto:${cityStore.currentCityEmail}`">{{
                    cityStore.currentCityEmail
                  }}</a>
                  for more info!
                </p>
                <div class="info-badge">
                  <ion-icon :icon="informationCircleOutline"></ion-icon>
                  <span>Check-in: 8:00 AM - 6:00 PM</span>
                </div>
              </div>

              <div class="section-divider"></div>

              <h2 class="section-title">Weekly Schedule</h2>
              <ion-list class="schedule-list">
                <ion-item
                  v-for="schedule in sortedSchedules"
                  :key="schedule.key"
                  class="schedule-item"
                  lines="none"
                >
                  <ion-label>
                    <p>
                      <span class="day-name">{{ schedule.dayName }}</span> -
                      {{ formatTime(schedule.time) }} - {{ schedule.venue }}
                    </p>
                  </ion-label>
                </ion-item>
                <div v-if="sortedSchedules.length === 0" class="schedule-empty">
                  No schedules available
                </div>
              </ion-list>
            </div>
          </div>

          <!-- Game Section -->
          <div class="game-section">
            <div v-if="gameStore.currentGame" class="game-card">
              <div class="game-card-header">
                <h2 class="game-title">{{ getTodayGameTitle() }}</h2>
                <span
                  v-if="gameStore.lastRefreshed && !gameStore.isDataStale"
                  class="game-meta"
                >
                  Updated {{ gameStore.timeSinceRefresh }}
                </span>
              </div>

              <div class="game-card-body">
                <div class="game-details">
                  <div class="game-detail-item">
                    <ion-icon :icon="locationOutline"></ion-icon>
                    <span>{{ gameStore.currentGame.venue }}</span>
                  </div>
                  <div class="game-detail-item">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    <span>{{ formatTime(gameStore.currentGame.time) }}</span>
                  </div>
                </div>

                <!-- Check-in/Check-out buttons (only during check-in window) -->
                <div
                  v-if="gameStore.isCheckInAllowed()"
                  class="check-in-section"
                >
                  <div v-if="!authStore.isAuthenticated" class="auth-notice">
                    <ion-icon :icon="informationCircleOutline"></ion-icon>
                    <p>
                      Please <a @click="router.push('/login')">login</a> to
                      check in for tonight's game
                    </p>
                  </div>

                  <div v-else class="check-in-buttons">
                    <ion-button
                      v-if="!gameStore.userCheckedIn"
                      @click="handleCheckIn"
                      expand="block"
                      :disabled="loading"
                    >
                      <ion-spinner v-if="loading" />
                      <span v-else>Check In</span>
                    </ion-button>

                    <ion-button
                      v-else
                      @click="handleCheckOut"
                      expand="block"
                      color="danger"
                      :disabled="loading"
                    >
                      <ion-spinner v-if="loading" />
                      <span v-else>Check Out</span>
                    </ion-button>
                  </div>
                </div>

                <!-- Check-in closed notice -->
                <div v-else class="check-in-closed-notice">
                  <ion-icon :icon="lockClosedOutline"></ion-icon>
                  <span
                    >Check-in is closed. The check-in window is 8:00 AM to 6:00
                    PM.</span
                  >
                </div>

                <!-- Team Roster (always visible when there's a game) -->
                <TeamRoster
                  v-if="balancedTeams"
                  :darkTeam="balancedTeams.darkTeam"
                  :lightTeam="balancedTeams.lightTeam"
                  :isAdmin="isCurrentCityAdmin"
                />

                <!-- Waitlist Section -->
                <div class="waitlist-section">
                  <div class="waitlist-header">
                    <h3>Waitlist</h3>
                    <span class="waitlist-count">{{
                      gameStore.currentGame.waitlist?.length || 0
                    }}</span>
                  </div>
                  <ion-list class="waitlist-list">
                    <ion-item
                      v-for="(player, index) in gameStore.currentGame.waitlist"
                      :key="player.uid"
                      class="waitlist-item"
                      lines="none"
                    >
                      <div slot="start" class="waitlist-number">
                        {{ index + 1 }}
                      </div>
                      <ion-label>
                        <p>
                          <span class="player-name">{{ player.name }}</span> -
                          {{ player.position
                          }}<span v-if="isCurrentCityAdmin">
                            - Skill {{ player.skillLevel || 2 }}</span
                          >
                        </p>
                      </ion-label>
                      <div slot="end" class="waitlist-time">
                        {{ formatCheckInTime(player.checkedInAt) }}
                      </div>
                    </ion-item>
                    <div
                      v-if="!gameStore.currentGame.waitlist?.length"
                      class="waitlist-empty"
                    >
                      No players on waitlist
                    </div>
                  </ion-list>
                </div>
              </div>
            </div>

            <!-- No Game State -->
            <div v-else class="no-game-card">
              <ion-icon :icon="calendarOutline" class="no-game-icon"></ion-icon>
              <h3>No Game Today</h3>
              <p>There's no game scheduled for today.</p>
              <div v-if="nextGameDate" class="next-game-info">
                <div class="next-game-label">Next Game</div>
                <div class="next-game-date">{{ nextGameDate }}</div>
              </div>
            </div>
          </div>
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
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonMenuButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  toastController,
} from "@ionic/vue";
import {
  swapHorizontalOutline,
  personCircleOutline,
  alertCircleOutline,
  lockClosedOutline,
  timeOutline,
  locationOutline,
  calendarOutline,
  informationCircleOutline,
} from "ionicons/icons";
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useGameStore } from "@/stores/game";
import { useCityStore } from "@/stores/city";
import TeamRoster from "@/components/TeamRoster.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const gameStore = useGameStore();
const cityStore = useCityStore();
const loading = ref(false);

// Get city ID from route params
const cityId = computed(() => route.params.cityId);

// Check if current user is admin for this city
const isCurrentCityAdmin = computed(() => {
  return authStore.isCityAdmin(cityId.value);
});

const balancedTeams = computed(() => {
  if (!gameStore.currentGame || !gameStore.currentGame.players) {
    return null;
  }
  return gameStore.balanceTeams(gameStore.currentGame.players);
});

const sortedSchedules = computed(() => {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const schedules = gameStore.gameSchedules;

  return Object.entries(schedules)
    .map(([key, schedule]) => ({
      key,
      dayName: dayNames[schedule.day],
      day: schedule.day,
      time: schedule.time,
      venue: schedule.venue,
    }))
    .sort((a, b) => a.day - b.day);
});

const nextGameDate = computed(() => {
  // Get active game days from the dynamic schedules
  const schedules = gameStore.gameSchedules;
  const gameDays = Object.values(schedules).map((s) => s.day);

  if (gameDays.length === 0) return null;

  const today = new Date();
  const currentDay = today.getDay();

  let nextDay = null;
  let daysUntilNext = 0;

  for (let i = 1; i <= 7; i++) {
    const checkDay = (currentDay + i) % 7;
    if (gameDays.includes(checkDay)) {
      nextDay = checkDay;
      daysUntilNext = i;
      break;
    }
  }

  if (nextDay === null) return null;

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntilNext);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayName = dayNames[nextDate.getDay()];
  const monthName = monthNames[nextDate.getMonth()];
  const date = nextDate.getDate();
  const year = nextDate.getFullYear();

  const getOrdinalSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${dayName}, ${monthName} ${date}${getOrdinalSuffix(date)}, ${year}`;
});

// Initialize when city changes
const initializeForCity = async (newCityId) => {
  if (!newCityId) return;

  // Clean up previous state
  gameStore.stopSchedulesListener();
  gameStore.stopGameListener();

  // Set city context
  await cityStore.setCurrentCity(newCityId);
  gameStore.setCurrentCity(newCityId);

  // Load schedules for this city (uses cache)
  await gameStore.loadSchedules(newCityId);

  // Load today's game for this city
  await gameStore.loadTodayGame(newCityId);
};

onMounted(async () => {
  await initializeForCity(cityId.value);
});

// Watch for city changes in route
watch(cityId, async (newCityId, oldCityId) => {
  if (newCityId && newCityId !== oldCityId) {
    await initializeForCity(newCityId);
  }
});

onUnmounted(() => {
  gameStore.stopSchedulesListener();
  gameStore.stopGameListener();
});

// Handle pull-to-refresh
const handleRefresh = async (event) => {
  await gameStore.refreshGame(cityId.value);
  event.target.complete();

  const toast = await toastController.create({
    message: "Game data refreshed",
    duration: 1500,
    color: "success",
  });
  await toast.present();
};

// Manual refresh (clicking on stale warning)
const manualRefresh = async () => {
  loading.value = true;
  await gameStore.refreshGame(cityId.value);
  loading.value = false;

  const toast = await toastController.create({
    message: "Game data refreshed",
    duration: 1500,
    color: "success",
  });
  await toast.present();
};

const getTodayGameTitle = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date().getDay();
  return `${days[today]}'s Game`;
};

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatCheckInTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const handleCheckIn = async () => {
  loading.value = true;
  const result = await gameStore.checkIn(cityId.value);
  loading.value = false;

  const toast = await toastController.create({
    message: result.success
      ? result.isRegular
        ? "Checked in successfully!"
        : "Added to waitlist successfully!"
      : result.error || "Failed to check in",
    duration: 2000,
    color: result.success ? "success" : "danger",
  });
  await toast.present();
};

const handleCheckOut = async () => {
  loading.value = true;
  const result = await gameStore.checkOut(cityId.value);
  loading.value = false;

  const toast = await toastController.create({
    message: result.success
      ? "Checked out successfully!"
      : result.error || "Failed to check out",
    duration: 2000,
    color: result.success ? "success" : "danger",
  });
  await toast.present();
};

const handleLogoError = (event) => {
  event.target.style.display = "none";
};
</script>

<style scoped>
/* ========================================
   Header Styles
   ======================================== */

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.header-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

/* ========================================
   Content Container
   ======================================== */

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0;
}

/* ========================================
   Stale Data Warning Banner
   ======================================== */

.stale-warning {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 12px var(--space-md);
  margin-bottom: var(--space-md);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.stale-warning:active {
  transform: scale(0.98);
}

.stale-warning ion-icon {
  font-size: 20px;
  color: var(--color-warning);
  flex-shrink: 0;
}

.stale-warning span {
  font-size: 15px;
  color: var(--text-primary);
}

.stale-warning .last-updated {
  margin-left: auto;
  font-size: 13px;
  color: var(--text-tertiary);
}

/* ========================================
   Cards Layout
   ======================================== */

.cards-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  width: 100%;
}

/* ========================================
   Welcome Card / Schedule Section
   ======================================== */

.schedule-section {
  width: 100%;
}

.welcome-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.welcome-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.welcome-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-sm) 0;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.welcome-subtitle a {
  color: var(--accent-color);
  font-weight: 500;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-sm);
  padding: 6px 12px;
  background: var(--fill-tertiary);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--text-secondary);
}

.info-badge ion-icon {
  font-size: 16px;
  color: var(--accent-color);
}

.section-divider {
  height: 1px;
  background: var(--separator-color);
  margin: var(--space-md) 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0;
  color: var(--text-tertiary);
  margin: 0 0 var(--space-sm) 0;
}

.schedule-list {
  background: transparent !important;
  padding: 0;
  margin: 0;
}

.schedule-item {
  --background: transparent;
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  --min-height: 44px;
}

.schedule-item ion-label {
  margin: 0;
}

.schedule-item ion-label p {
  color: var(--text-primary) !important;
  font-size: 15px;
  margin: 0;
}

.day-name {
  color: var(--accent-color) !important;
  font-weight: 600;
}

.schedule-empty {
  color: var(--text-tertiary);
  text-align: center;
  padding: var(--space-md);
  font-size: 15px;
}

/* ========================================
   Game Section
   ======================================== */

.game-section {
  width: 100%;
}

.game-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.game-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background: var(--accent-color);
  color: white;
}

.game-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
}

.game-meta {
  font-size: 13px;
  opacity: 0.9;
}

.game-card-body {
  padding: var(--space-lg);
}

.game-details {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--separator-color);
}

.game-detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 15px;
}

.game-detail-item ion-icon {
  font-size: 20px;
  color: var(--accent-color);
}

/* ========================================
   Check-in Section
   ======================================== */

.check-in-section {
  margin-bottom: var(--space-lg);
}

.auth-notice {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--fill-tertiary);
  border-radius: var(--radius-md);
}

.auth-notice ion-icon {
  font-size: 22px;
  color: var(--color-warning);
  flex-shrink: 0;
}

.auth-notice p {
  margin: 0;
  font-size: 15px;
  color: var(--text-primary);
}

.auth-notice a {
  color: var(--accent-color);
  font-weight: 600;
  cursor: pointer;
}

.check-in-buttons ion-button {
  --border-radius: var(--radius-md);
  font-weight: 600;
  height: 50px;
  font-size: 17px;
  color: white;
}

.check-in-closed-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--fill-tertiary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 15px;
}

.check-in-closed-notice ion-icon {
  font-size: 20px;
  color: var(--text-tertiary);
}

/* ========================================
   Waitlist Section
   ======================================== */

.waitlist-section {
  margin-top: var(--space-xl);
}

.waitlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.waitlist-header h3 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin: 0;
}

.waitlist-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: var(--fill-tertiary);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.waitlist-list {
  background: var(--card-bg) !important;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

.waitlist-item {
  --background: var(--card-bg);
  --padding-start: var(--space-md);
  --padding-end: var(--space-md);
  --inner-padding-end: 0;
  --min-height: 48px;
  --border-color: var(--separator-color);
}

.waitlist-item:last-child {
  --border-width: 0;
}

.waitlist-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--accent-color);
  color: white;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
}

.waitlist-item ion-label p {
  color: var(--text-primary) !important;
  font-size: 15px;
  margin: 0;
}

.player-name {
  font-weight: 600;
}

.waitlist-time {
  font-size: 13px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.waitlist-empty {
  padding: var(--space-lg);
  text-align: center;
  color: var(--text-tertiary);
  font-size: 15px;
}

/* ========================================
   No Game State
   ======================================== */

.no-game-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.no-game-icon {
  font-size: 48px;
  color: var(--text-quaternary);
  margin-bottom: var(--space-md);
}

.no-game-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.no-game-card p {
  color: var(--text-secondary);
  font-size: 15px;
  margin: 0;
}

.next-game-info {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--separator-color);
}

.next-game-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.next-game-date {
  font-weight: 600;
  font-size: 17px;
  color: var(--accent-color);
}

/* ========================================
   Responsive Layout
   ======================================== */

@media (min-width: 768px) {
  .cards-layout {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--space-xl);
  }

  .schedule-section {
    flex: 0 0 320px;
    position: sticky;
    top: var(--space-md);
  }

  .game-section {
    flex: 1;
    min-width: 0;
  }

  .welcome-header {
    text-align: left;
  }
}

@media (min-width: 1200px) {
  .schedule-section {
    flex: 0 0 360px;
  }
}
</style>
