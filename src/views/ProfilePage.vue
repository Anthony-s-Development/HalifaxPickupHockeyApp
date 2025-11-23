<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="profile-container" v-if="authStore.userProfile">
        <h1>My Profile</h1>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Player Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <h2>Name</h2>
                  <p>{{ authStore.userProfile.name }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h2>Email</h2>
                  <p>{{ authStore.userProfile.email }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h2>Position</h2>
                  <p>{{ authStore.userProfile.position }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h2>Skill Level</h2>
                  <p>{{ getSkillLevelDescription(authStore.userProfile.skillLevel) }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h2>Games Played</h2>
                  <p>{{ authStore.userProfile.gamesPlayed || 0 }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Edit Skill Level</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-radio-group :value="authStore.userProfile.skillLevel" @ionChange="updateSkillLevel">
                <ion-item>
                  <ion-label class="skill-label">
                    <h2>Level 1</h2>
                    <p>Basic skating ability but struggles with backward skating and crossovers</p>
                  </ion-label>
                  <ion-radio slot="start" :value="1"></ion-radio>
                </ion-item>

                <ion-item>
                  <ion-label class="skill-label">
                    <h2>Level 3</h2>
                    <p>A good mix of basic skills, decent knowledge of the game, and athletic ability</p>
                  </ion-label>
                  <ion-radio slot="start" :value="3"></ion-radio>
                </ion-item>

                <ion-item>
                  <ion-label class="skill-label">
                    <h2>Level 5</h2>
                    <p>Advanced skills, strong physical shape, and a high understanding of the game</p>
                  </ion-label>
                  <ion-radio slot="start" :value="5"></ion-radio>
                </ion-item>
              </ion-radio-group>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Skate Pass</ion-card-title>
            <ion-card-subtitle v-if="!authStore.userProfile.passType">
              Contact an admin to purchase a skate pass
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="authStore.userProfile.passType">
              <ion-item>
                <ion-label>
                  <h2>Pass Type</h2>
                  <p v-if="authStore.userProfile.passType === '5-game'">5 Game Pass</p>
                  <p v-else-if="authStore.userProfile.passType === '10-game'">10 Game Pass</p>
                  <p v-else-if="authStore.userProfile.passType === 'full-season'">Full Season Pass</p>
                </ion-label>
              </ion-item>
              <ion-item v-if="authStore.userProfile.passType !== 'full-season'">
                <ion-label>
                  <h2>Games Remaining</h2>
                  <p :style="{ color: authStore.userProfile.passGamesRemaining === 0 ? 'var(--ion-color-danger)' : '' }">
                    {{ authStore.userProfile.passGamesRemaining }} games
                  </p>
                </ion-label>
              </ion-item>
              <ion-item v-else>
                <ion-label>
                  <h2>Status</h2>
                  <p style="color: var(--ion-color-success)">Unlimited Games</p>
                </ion-label>
              </ion-item>
              <ion-item v-if="authStore.userProfile.passStartDate">
                <ion-label>
                  <h2>Pass Start Date</h2>
                  <p>{{ formatPassDate(authStore.userProfile.passStartDate) }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-list v-else>
              <ion-item lines="none">
                <ion-label class="ion-text-wrap">
                  <p style="color: var(--ion-color-medium)">
                    You don't have a skate pass yet. Skate passes are available in 5-game, 10-game, or full-season options. Contact an administrator to purchase a pass.
                  </p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Regular Nights</ion-card-title>
            <ion-card-subtitle>Contact an admin to modify your regular status</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>Sunday 10:30 PM - Civic</ion-label>
                <ion-badge :color="authStore.userProfile.regulars?.sunday_1030pm_civic ? 'success' : 'medium'">
                  {{ authStore.userProfile.regulars?.sunday_1030pm_civic ? 'Regular' : 'Not Regular' }}
                </ion-badge>
              </ion-item>

              <ion-item>
                <ion-label>Monday 11:00 PM - Forum</ion-label>
                <ion-badge :color="authStore.userProfile.regulars?.monday_11pm_forum ? 'success' : 'medium'">
                  {{ authStore.userProfile.regulars?.monday_11pm_forum ? 'Regular' : 'Not Regular' }}
                </ion-badge>
              </ion-item>

              <ion-item>
                <ion-label>Tuesday 10:30 PM - Forum</ion-label>
                <ion-badge :color="authStore.userProfile.regulars?.tuesday_1030pm_forum ? 'success' : 'medium'">
                  {{ authStore.userProfile.regulars?.tuesday_1030pm_forum ? 'Regular' : 'Not Regular' }}
                </ion-badge>
              </ion-item>

              <ion-item>
                <ion-label>Thursday 10:30 PM - Civic</ion-label>
                <ion-badge :color="authStore.userProfile.regulars?.thursday_1030pm_civic ? 'success' : 'medium'">
                  {{ authStore.userProfile.regulars?.thursday_1030pm_civic ? 'Regular' : 'Not Regular' }}
                </ion-badge>
              </ion-item>

              <ion-item>
                <ion-label>Friday 10:30 PM - Forum</ion-label>
                <ion-badge :color="authStore.userProfile.regulars?.friday_1030pm_forum ? 'success' : 'medium'">
                  {{ authStore.userProfile.regulars?.friday_1030pm_forum ? 'Regular' : 'Not Regular' }}
                </ion-badge>
              </ion-item>

              <ion-item>
                <ion-label>Saturday 10:30 PM - Forum</ion-label>
                <ion-badge :color="authStore.userProfile.regulars?.saturday_1030pm_forum ? 'success' : 'medium'">
                  {{ authStore.userProfile.regulars?.saturday_1030pm_forum ? 'Regular' : 'Not Regular' }}
                </ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <GameHistory :gameHistory="authStore.userProfile.gameHistory || []" />

        <ion-button
          expand="block"
          color="primary"
          @click="router.push('/home')"
        >
          Back to Home
        </ion-button>
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonRadio,
  IonRadioGroup,
  toastController
} from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GameHistory from '@/components/GameHistory.vue'

const router = useRouter()
const authStore = useAuthStore()

const getSkillLevelDescription = (level) => {
  const descriptions = {
    1: 'Level 1 - Basic skating ability but struggles with backward skating and crossovers',
    3: 'Level 3 - A good mix of basic skills, decent knowledge of the game, and athletic ability',
    5: 'Level 5 - Advanced skills, strong physical shape, and a high understanding of the game'
  }
  return descriptions[level] || 'Not set'
}

const updateSkillLevel = async (event) => {
  const newLevel = event.detail.value
  const result = await authStore.updateUserProfile({ skillLevel: newLevel })

  const toast = await toastController.create({
    message: result.success ? 'Skill level updated!' : 'Failed to update',
    duration: 2000,
    color: result.success ? 'success' : 'danger'
  })
  await toast.present()
}

const handleLogout = async () => {
  const result = await authStore.logout()

  if (result.success) {
    const toast = await toastController.create({
      message: 'Logged out successfully!',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
    router.push('/home')
  }
}

const formatPassDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.skill-label p {
  white-space: normal;
  font-size: 0.85rem;
}

/* Desktop screens - show cards in grid */
@media (min-width: 768px) {
  .profile-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  /* Title - full width */
  .profile-container > h1 {
    grid-column: 1 / -1;
  }

  /* Player Info and Edit Skill Level - side by side (cards 2 & 3) */

  /* Skate Pass - full width (card 4) */
  .profile-container > :nth-child(4) {
    grid-column: 1 / -1;
  }

  /* Regular Nights - full width (card 5) */
  .profile-container > :nth-child(5) {
    grid-column: 1 / -1;
  }

  /* Game History - full width (card 6) */
  .profile-container > :nth-child(6) {
    grid-column: 1 / -1;
  }

  /* Back button - full width */
  .profile-container > ion-button {
    grid-column: 1 / -1;
  }
}
</style>
