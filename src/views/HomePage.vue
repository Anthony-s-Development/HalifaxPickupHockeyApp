<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <div slot="start" class="logo-container">
          <img src="/Halifax-Pickup-Hockey.png" alt="Halifax Pickup Hockey Logo" class="header-logo" />
        </div>
        <ion-title>Halifax Pickup Hockey</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="router.push('/about')">
            About
          </ion-button>
          <ion-button v-if="authStore.isAdmin" @click="router.push('/admin')">
            Admin
          </ion-button>
          <ion-button v-if="!authStore.isAuthenticated" @click="router.push('/login')">
            Login
          </ion-button>
          <ion-button v-else @click="router.push('/profile')">
            Profile
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="content-container">
        <h1>Welcome to Halifax Pickup Hockey</h1>

        <div class="info-section">
          <ion-text color="medium">
            <p>
              Here is where players check in or out, for either paid subscription spots, or for the wait list. <br></br><br></br>
              <strong>NEW TO US?</strong> Email: <a href="mailto:halifaxpickuphockey@gmail.com">halifaxpickuphockey@gmail.com</a> for more info!
              <br></br><br></br>
              Check in begins at 8:00am for each skate, and is closed at 6:00pm, at which time we attempt to confirm spares.
            </p>
          </ion-text>
        </div>

        <div class="cards-layout">
          <ion-card class="schedule-card">
            <ion-card-header>
              <ion-card-title>Weekly Schedule</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-label>
                    <h2>Sunday</h2>
                    <p>10:30 PM - Civic</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h2>Monday</h2>
                    <p>11:00 PM - Forum</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h2>Tuesday</h2>
                    <p>10:30 PM - Forum</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h2>Thursday</h2>
                    <p>10:30 PM - Civic</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h2>Friday</h2>
                    <p>10:30 PM - Forum</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h2>Saturday</h2>
                    <p>10:30 PM - Forum</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <div class="game-section">
            <ion-card v-if="gameStore.currentGame">
              <ion-card-header>
                <ion-card-title>{{ getTodayGameTitle() }}</ion-card-title>
                <ion-card-subtitle>{{ gameStore.currentGame.venue }} - {{ formatTime(gameStore.currentGame.time) }}</ion-card-subtitle>
              </ion-card-header>

              <ion-card-content>
                <div v-if="!authStore.isAuthenticated" class="auth-notice">
                  <ion-text color="warning">
                    <p>Please <a @click="router.push('/login')">login</a> to check in for tonight's game</p>
                  </ion-text>
                </div>

                <div v-else-if="!gameStore.isCheckInAllowed()" class="time-restriction">
                  <ion-text color="danger">
                    <p>Check-in is only available between 8:00 AM and 6:00 PM</p>
                  </ion-text>
                </div>

                <div v-else>
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

                <TeamRoster v-if="balancedTeams" :darkTeam="balancedTeams.darkTeam" :lightTeam="balancedTeams.lightTeam" />

                <div class="waitlist-section">
                  <h3>Waitlist ({{ gameStore.currentGame.waitlist?.length || 0 }})</h3>
                  <ion-list>
                    <ion-item v-for="player in gameStore.currentGame.waitlist" :key="player.uid">
                      <ion-label>
                        <h2>{{ player.name }}</h2>
                        <p>{{ player.position }} - Skill Level {{ player.skillLevel || 3 }}</p>
                      </ion-label>
                    </ion-item>
                    <ion-item v-if="!gameStore.currentGame.waitlist?.length">
                      <ion-label color="medium">No players on waitlist</ion-label>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-card-content>
            </ion-card>

            <ion-card v-else>
              <ion-card-content>
                <ion-text color="medium">
                  <p>No game scheduled for today</p>
                </ion-text>
              </ion-card-content>
            </ion-card>
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { onMounted, ref, computed } from 'vue'
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

onMounted(async () => {
  await gameStore.loadTodayGame()
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
.logo-container {
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
}

.header-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}

.info-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem auto;
  padding: 1rem;
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
  gap: 1rem;
  width: 100%;
}

.schedule-card {
  width: 100%;
}

.game-section {
  width: 100%;
  flex: 1;
}

.auth-notice,
.time-restriction {
  margin-bottom: 1rem;
}

.auth-notice a {
  color: var(--ion-color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.waitlist-section {
  margin-top: 2rem;
}

.waitlist-section h3 {
  margin-bottom: 0.5rem;
}

/* Tablet and larger screens */
@media (min-width: 768px) {
  .cards-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .schedule-card {
    flex: 0 0 320px;
    position: sticky;
    top: 1rem;
  }

  .game-section {
    flex: 1;
    min-width: 0;
  }
}

/* Desktop screens */
@media (min-width: 1200px) {
  .schedule-card {
    flex: 0 0 380px;
  }
}
</style>
