<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Check In</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="checkin-container">
        <h1>Game Check-In</h1>

        <ion-card v-if="gameStore.currentGame">
          <ion-card-header>
            <ion-card-title>{{ getTodayGameTitle() }}</ion-card-title>
            <ion-card-subtitle>{{ gameStore.currentGame.venue }} - {{ formatTime(gameStore.currentGame.time) }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div v-if="!gameStore.isCheckInAllowed()" class="time-restriction">
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
                <span v-else>Check In for Tonight's Game</span>
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

              <div v-if="gameStore.userCheckedIn" class="status-message">
                <ion-text color="success">
                  <p>You are checked in for tonight's game!</p>
                </ion-text>
              </div>
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
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const loading = ref(false)

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
.checkin-container {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.time-restriction {
  margin-bottom: 1rem;
}

.status-message {
  margin-top: 1rem;
  text-align: center;
}
</style>
