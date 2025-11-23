<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Game History</ion-card-title>
      <ion-card-subtitle v-if="gameHistory.length > 0">
        {{ gameHistory.length }} game{{ gameHistory.length !== 1 ? 's' : '' }} played
      </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ion-list v-if="gameHistory.length > 0">
        <ion-item v-for="(game, index) in sortedGameHistory" :key="index">
          <ion-label>
            <h2>{{ formatDate(game.date) }} - {{ game.venue }}</h2>
            <p>{{ formatGameTime(game.time) }} - {{ game.scheduleKey?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }}</p>
            <p>
              <ion-badge :color="game.status === 'confirmed' ? 'success' : 'warning'">
                {{ game.status === 'confirmed' ? 'Played' : 'Waitlist' }}
              </ion-badge>
            </p>
          </ion-label>
        </ion-item>
      </ion-list>
      <div v-else class="no-history">
        <ion-text color="medium">
          <p>No game history yet. Check in for your first game!</p>
        </ion-text>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup>
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonText
} from '@ionic/vue'
import { computed } from 'vue'

const props = defineProps({
  gameHistory: {
    type: Array,
    default: () => []
  }
})

const sortedGameHistory = computed(() => {
  return [...props.gameHistory].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatGameTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}
</script>

<style scoped>
.no-history {
  text-align: center;
  padding: 2rem 0;
}
</style>
