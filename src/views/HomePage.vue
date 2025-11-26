<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <div class="header-content">
          <img src="/Halifax-Pickup-Hockey.png" alt="Halifax Pickup Hockey Logo" class="header-logo" />
          <ion-title>Halifax Pickup Hockey</ion-title>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="content-container">
        <div class="cards-layout">
          <!-- Weekly Schedule -->
          <div class="schedule-section">
            <h1>Welcome to Halifax Pickup Hockey</h1>

            <div class="info-section">
              <ion-text color="medium">
                <p>
                  <strong>NEW TO US?</strong> Email: <a href="mailto:halifaxpickuphockey@gmail.com">halifaxpickuphockey@gmail.com</a> for more info!
                  <br></br><br></br>
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
            </ion-list>
          </div>

          <!-- Game Section -->
          <div class="game-section">
            <div v-if="gameStore.currentGame">
              <h2 class="section-title">{{ getTodayGameTitle() }}</h2>
              <p class="game-info">{{ gameStore.currentGame.venue }} - {{ formatTime(gameStore.currentGame.time) }}</p>

              <div v-if="!authStore.isAuthenticated" class="auth-notice">
                <ion-text color="warning">
                  <p>Please <a @click="router.push('/login')">login</a> to check in for tonight's game</p>
                </ion-text>
              </div>

              <div v-else-if="!gameStore.isCheckInAllowed()" class="time-restriction">
                <ion-text color="danger">
                  <p> Check-in is only available between 8:00 AM and 6:00 PM. <br></br><br></br> The
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
                <TeamRoster v-if="balancedTeams" :darkTeam="balancedTeams.darkTeam" :lightTeam="balancedTeams.lightTeam" :isAdmin="authStore.isAdmin" />

                <div class="waitlist-section">
                  <h3>Waitlist ({{ gameStore.currentGame.waitlist?.length || 0 }})</h3>
                  <ion-list>
                    <ion-item v-for="(player, index) in gameStore.currentGame.waitlist" :key="player.uid">
                      <div slot="start" class="waitlist-number">{{ index + 1 }}</div>
                      <ion-label>
                        <p><span class="player-name">{{ player.name }}</span> - {{ player.position }}<span v-if="authStore.isAdmin"> - Skill Level {{ player.skillLevel || 2 }}</span></p>
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
  toastController
} from '@ionic/vue'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import TeamRoster from '@/components/TeamRoster.vue'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()
const loading = ref(false)

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

onMounted(async () => {
  await gameStore.subscribeToSchedules()
  await gameStore.loadTodayGame()
})

onUnmounted(() => {
  gameStore.stopSchedulesListener()
  gameStore.stopGameListener()
})

const getTodayGameTitle = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = new Date().getDay()
  return `${days[today]}'s Game`
}

const formatTime = (time) => {
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
  const result = await gameStore.checkIn()
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
  const result = await gameStore.checkOut()
  loading.value = false

  const toast = await toastController.create({
    message: result.success ? 'Checked out successfully!' : result.error || 'Failed to check out',
    duration: 2000,
    color: result.success ? 'success' : 'danger'
  })
  await toast.present()
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
