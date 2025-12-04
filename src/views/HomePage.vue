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
          <ion-button @click="router.push('/')" title="Switch City">
            <ion-icon :icon="swapHorizontalOutline"></ion-icon>
          </ion-button>
          <ion-button v-if="authStore.isAuthenticated" @click="router.push(`/${cityId}/profile`)" title="Profile">
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
        <div v-if="gameStore.isDataStale && gameStore.currentGame" class="stale-warning" @click="manualRefresh">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
          <span>Data may be out of date. Pull down to refresh.</span>
          <span class="last-updated">Updated {{ gameStore.timeSinceRefresh }}</span>
        </div>

        <div class="cards-layout">
          <!-- Weekly Schedule -->
          <div class="schedule-section">
            <h1>Welcome to {{ cityStore.currentCityDisplayName }}</h1>

            <div class="info-section">
              <ion-text color="medium">
                <p>
                  <strong>NEW TO US?</strong> Email: <a :href="`mailto:${cityStore.currentCityEmail}`">{{ cityStore.currentCityEmail }}</a> for more info!
                  <br><br>
                  Check in begins at 8:00am for each skate, and is closed at 6:00pm, at which time we attempt to confirm spares.
                </p>
              </ion-text>
            </div>
            <h2 class="section-title">Weekly Schedule</h2>
            <ion-list class="schedule-list">
              <ion-item v-for="schedule in sortedSchedules" :key="schedule.key">
                <ion-label>
                  <p><span class="day-name">{{ schedule.dayName }}</span> - {{ formatTime(schedule.time) }} - {{ schedule.venue }}</p>
                </ion-label>
              </ion-item>
              <ion-item v-if="sortedSchedules.length === 0">
                <ion-label color="medium">
                  <p>No schedules available</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>

          <!-- Game Section -->
          <div class="game-section">
            <div v-if="gameStore.currentGame">
              <div class="game-header">
                <h2 class="section-title">{{ getTodayGameTitle() }}</h2>
                <span v-if="gameStore.lastRefreshed && !gameStore.isDataStale" class="last-refreshed">
                  Updated {{ gameStore.timeSinceRefresh }}
                </span>
              </div>
              <p class="game-info">{{ gameStore.currentGame.venue }} - {{ formatTime(gameStore.currentGame.time) }}</p>

              <div v-if="!authStore.isAuthenticated" class="auth-notice">
                <ion-text color="warning">
                  <p>Please <a @click="router.push('/login')">login</a> to check in for tonight's game</p>
                </ion-text>
              </div>

              <div v-else-if="!gameStore.isCheckInAllowed()" class="time-restriction">
                <ion-text color="danger">
                  <p> Check-in is only available between 8:00 AM and 6:00 PM. <br><br> The
                  check-in system will appear between that timeframe.</p>
                </ion-text>
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

              <div v-if="gameStore.isCheckInAllowed()">
                <TeamRoster v-if="balancedTeams" :darkTeam="balancedTeams.darkTeam" :lightTeam="balancedTeams.lightTeam" :isAdmin="isCurrentCityAdmin" />

                <div class="waitlist-section">
                  <h3>Waitlist ({{ gameStore.currentGame.waitlist?.length || 0 }})</h3>
                  <ion-list>
                    <ion-item v-for="(player, index) in gameStore.currentGame.waitlist" :key="player.uid">
                      <div slot="start" class="waitlist-number">{{ index + 1 }}</div>
                      <ion-label>
                        <p><span class="player-name">{{ player.name }}</span> - {{ player.position }}<span v-if="isCurrentCityAdmin"> - Skill Level {{ player.skillLevel || 2 }}</span></p>
                      </ion-label>
                      <div slot="end" class="waitlist-time">{{ formatCheckInTime(player.checkedInAt) }}</div>
                    </ion-item>
                    <ion-item v-if="!gameStore.currentGame.waitlist?.length">
                      <ion-label color="medium">No players on waitlist</ion-label>
                    </ion-item>
                  </ion-list>
                </div>
              </div>
            </div>

            <div v-else class="no-game">
              <ion-text color="medium">
                <p>No game scheduled for today</p>
                <p v-if="nextGameDate" class="next-game">Next game: {{ nextGameDate }}</p>
              </ion-text>
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
  IonText,
  IonSpinner,
  IonMenuButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  toastController
} from '@ionic/vue'
import { swapHorizontalOutline, personCircleOutline, alertCircleOutline } from 'ionicons/icons'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import { useCityStore } from '@/stores/city'
import TeamRoster from '@/components/TeamRoster.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const gameStore = useGameStore()
const cityStore = useCityStore()
const loading = ref(false)

// Get city ID from route params
const cityId = computed(() => route.params.cityId)

// Check if current user is admin for this city
const isCurrentCityAdmin = computed(() => {
  return authStore.isCityAdmin(cityId.value)
})

const balancedTeams = computed(() => {
  if (!gameStore.currentGame || !gameStore.currentGame.players) {
    return null
  }
  return gameStore.balanceTeams(gameStore.currentGame.players)
})

const sortedSchedules = computed(() => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const schedules = gameStore.gameSchedules

  return Object.entries(schedules)
    .map(([key, schedule]) => ({
      key,
      dayName: dayNames[schedule.day],
      day: schedule.day,
      time: schedule.time,
      venue: schedule.venue
    }))
    .sort((a, b) => a.day - b.day)
})

const nextGameDate = computed(() => {
  // Get active game days from the dynamic schedules
  const schedules = gameStore.gameSchedules
  const gameDays = Object.values(schedules).map(s => s.day)

  if (gameDays.length === 0) return null

  const today = new Date()
  const currentDay = today.getDay()

  let nextDay = null
  let daysUntilNext = 0

  for (let i = 1; i <= 7; i++) {
    const checkDay = (currentDay + i) % 7
    if (gameDays.includes(checkDay)) {
      nextDay = checkDay
      daysUntilNext = i
      break
    }
  }

  if (nextDay === null) return null

  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + daysUntilNext)

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayName = dayNames[nextDate.getDay()]
  const monthName = monthNames[nextDate.getMonth()]
  const date = nextDate.getDate()
  const year = nextDate.getFullYear()

  const getOrdinalSuffix = (n) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  return `${dayName}, ${monthName} ${date}${getOrdinalSuffix(date)}, ${year}`
})

// Initialize when city changes
const initializeForCity = async (newCityId) => {
  if (!newCityId) return

  // Clean up previous state
  gameStore.stopSchedulesListener()
  gameStore.stopGameListener()

  // Set city context
  await cityStore.setCurrentCity(newCityId)
  gameStore.setCurrentCity(newCityId)

  // Load schedules for this city (uses cache)
  await gameStore.loadSchedules(newCityId)

  // Load today's game for this city
  await gameStore.loadTodayGame(newCityId)
}

onMounted(async () => {
  await initializeForCity(cityId.value)
})

// Watch for city changes in route
watch(cityId, async (newCityId, oldCityId) => {
  if (newCityId && newCityId !== oldCityId) {
    await initializeForCity(newCityId)
  }
})

onUnmounted(() => {
  gameStore.stopSchedulesListener()
  gameStore.stopGameListener()
})

// Handle pull-to-refresh
const handleRefresh = async (event) => {
  await gameStore.refreshGame(cityId.value)
  event.target.complete()

  const toast = await toastController.create({
    message: 'Game data refreshed',
    duration: 1500,
    color: 'success'
  })
  await toast.present()
}

// Manual refresh (clicking on stale warning)
const manualRefresh = async () => {
  loading.value = true
  await gameStore.refreshGame(cityId.value)
  loading.value = false

  const toast = await toastController.create({
    message: 'Game data refreshed',
    duration: 1500,
    color: 'success'
  })
  await toast.present()
}

const getTodayGameTitle = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = new Date().getDay()
  return `${days[today]}'s Game`
}

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

const formatCheckInTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const handleCheckIn = async () => {
  loading.value = true
  const result = await gameStore.checkIn(cityId.value)
  loading.value = false

  const toast = await toastController.create({
    message: result.success
      ? result.isRegular
        ? 'Checked in successfully!'
        : 'Added to waitlist successfully!'
      : result.error || 'Failed to check in',
    duration: 2000,
    color: result.success ? 'success' : 'danger'
  })
  await toast.present()
}

const handleCheckOut = async () => {
  loading.value = true
  const result = await gameStore.checkOut(cityId.value)
  loading.value = false

  const toast = await toastController.create({
    message: result.success ? 'Checked out successfully!' : result.error || 'Failed to check out',
    duration: 2000,
    color: result.success ? 'success' : 'danger'
  })
  await toast.present()
}

const handleLogoError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style scoped>
.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.header-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0;
}

/* Stale Data Warning */
.stale-warning {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: rgba(255, 196, 9, 0.15);
  border: 1px solid rgba(255, 196, 9, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.stale-warning:hover {
  background: rgba(255, 196, 9, 0.25);
}

.stale-warning ion-icon {
  font-size: 1.25rem;
  color: #ffc409;
  flex-shrink: 0;
}

.stale-warning span {
  font-size: 0.9rem;
  color: #ffc409;
}

.stale-warning .last-updated {
  margin-left: auto;
  font-size: 0.8rem;
  color: rgba(255, 196, 9, 0.7);
}

/* Game Header */
.game-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.last-refreshed {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
  margin-top: 0;
}

.info-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .game-section h1 {
    text-align: left;
    margin-bottom: 0.5rem;
  }

  .game-section .info-section {
    text-align: left;
    margin: 0 0 2rem 0;
    padding: 0;
  }
}

.info-section p {
  line-height: 1.6;
  margin: 0;
}

.info-section a {
  color: var(--ion-color-primary);
  text-decoration: none;
}

.info-section a:hover {
  text-decoration: underline;
}

.cards-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--ion-color-primary);
}

.schedule-section,
.game-section {
  width: 100%;
}

.schedule-list {
  background: var(--ion-card-background, #fff);
  border-radius: 8px;
  padding: 0;
  margin: 0;
}

.schedule-list ion-label p {
  color: #ffffff;
}

.schedule-list .day-name {
  color: var(--ion-color-primary);
  font-weight: 600;
}

.game-info {
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.check-in-buttons {
  margin: 1rem 0;
}

.auth-notice,
.time-restriction {
  margin: 1rem 0;
  padding: 0.75rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.auth-notice a {
  color: var(--ion-color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.no-game {
  padding: 2rem;
  text-align: center;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.no-game .next-game {
  margin-top: 0.5rem;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.waitlist-section {
  margin-top: 2rem;
}

.waitlist-section h3 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.waitlist-section ion-list {
  background: var(--ion-card-background, #fff);
  border-radius: 8px;
}

.waitlist-section ion-label p {
  color: #ffffff;
}

.waitlist-section .player-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.waitlist-number {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}

.waitlist-time {
  color: var(--ion-color-medium);
  font-size: 0.85rem;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .cards-layout {
    flex-direction: row;
    align-items: flex-start;
    gap: 2rem;
  }

  .schedule-section {
    flex: 0 0 300px;
    position: sticky;
    top: 1rem;
  }

  .game-section {
    flex: 1;
    min-width: 0;
  }
}

@media (min-width: 1200px) {
  .schedule-section {
    flex: 0 0 350px;
  }
}
</style>
