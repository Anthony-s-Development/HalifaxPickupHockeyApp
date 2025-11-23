<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Admin Panel</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="admin-container">
        <h1>Admin Dashboard</h1>

        <ion-segment v-model="selectedTab">
          <ion-segment-button value="games">
            <ion-label>Games</ion-label>
          </ion-segment-button>
          <ion-segment-button value="users">
            <ion-label>Users</ion-label>
          </ion-segment-button>
          <ion-segment-button value="history">
            <ion-label>History</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div v-if="selectedTab === 'games'" class="tab-content">
          <h2>Game Management</h2>

          <ion-button @click="loadGames" expand="block" class="ion-margin-bottom">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Refresh Games
          </ion-button>

          <ion-card v-for="game in adminStore.allGames" :key="game.id">
            <ion-card-header>
              <ion-card-title>{{ formatDate(game.date) }}</ion-card-title>
              <ion-card-subtitle>{{ game.venue }} - {{ formatTime(game.time) }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <div class="game-stats">
                <ion-badge color="primary">{{ game.players?.length || 0 }} Players</ion-badge>
                <ion-badge color="warning">{{ game.waitlist?.length || 0 }} Waitlist</ion-badge>
                <ion-badge v-if="game.status === 'completed'" color="success">Completed</ion-badge>
              </div>

              <div class="player-section" v-if="game.players?.length > 0">
                <h3>Players</h3>
                <ion-list>
                  <ion-item v-for="player in game.players" :key="player.uid">
                    <ion-label>
                      <h2>{{ player.name }}</h2>
                      <p>{{ player.position }}</p>
                    </ion-label>
                    <ion-button
                      slot="end"
                      fill="clear"
                      color="danger"
                      @click="removePlayer(game.id, player.uid, false)"
                    >
                      <ion-icon :icon="closeCircleOutline"></ion-icon>
                    </ion-button>
                  </ion-item>
                </ion-list>
              </div>

              <div class="player-section" v-if="game.waitlist?.length > 0">
                <h3>Waitlist</h3>
                <ion-list>
                  <ion-item v-for="player in game.waitlist" :key="player.uid">
                    <ion-label>
                      <h2>{{ player.name }}</h2>
                      <p>{{ player.position }}</p>
                    </ion-label>
                    <ion-button
                      slot="end"
                      fill="clear"
                      color="success"
                      @click="moveToPlayers(game.id, player.uid)"
                    >
                      <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                    </ion-button>
                    <ion-button
                      slot="end"
                      fill="clear"
                      color="danger"
                      @click="removePlayer(game.id, player.uid, true)"
                    >
                      <ion-icon :icon="closeCircleOutline"></ion-icon>
                    </ion-button>
                  </ion-item>
                </ion-list>
              </div>

              <ion-button
                v-if="game.status !== 'completed'"
                expand="block"
                color="primary"
                class="ion-margin-top"
                @click="router.push(`/admin/manage-teams/${game.id}`)"
              >
                <ion-icon :icon="peopleOutline" slot="start"></ion-icon>
                Manage Teams
              </ion-button>

              <ion-button
                v-if="game.status !== 'completed'"
                expand="block"
                color="success"
                class="ion-margin-top"
                @click="markAsPlayed(game.id)"
              >
                Mark Game as Played
              </ion-button>
            </ion-card-content>
          </ion-card>

          <div v-if="adminStore.allGames.length === 0 && !adminStore.loading" class="empty-state">
            <ion-text color="medium">
              <p>No games found. Click "Refresh Games" to load.</p>
            </ion-text>
          </div>
        </div>

        <div v-if="selectedTab === 'users'" class="tab-content users-tab">
          <h2>User Management</h2>

          <div class="search-section">
            <ion-searchbar
              v-model="userSearchQuery"
              placeholder="Search by name, email, or position"
              :debounce="300"
              animated
            ></ion-searchbar>
          </div>

          <ion-button @click="loadUsers" expand="block" class="ion-margin-bottom">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Refresh Users
          </ion-button>

          <ion-card>
            <ion-card-content>
              <ion-list>
                <ion-item v-for="user in filteredUsers" :key="user.id">
                  <ion-label>
                    <h2>{{ user.name }}</h2>
                    <p>{{ user.email }} - {{ user.position }} - Level {{ user.skillLevel || 3 }}</p>
                  </ion-label>
                  <ion-badge slot="end" :color="user.isAdmin ? 'primary' : 'medium'">
                    {{ user.isAdmin ? 'Admin' : 'User' }}
                  </ion-badge>
                  <ion-button slot="end" fill="clear" @click="router.push(`/admin/edit-user/${user.id}`)">
                    <ion-icon :icon="createOutline"></ion-icon>
                  </ion-button>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <div v-if="filteredUsers.length === 0 && !adminStore.loading" class="empty-state">
            <ion-text color="medium">
              <p v-if="userSearchQuery">No users found matching "{{ userSearchQuery }}"</p>
              <p v-else>No users found. Click "Refresh Users" to load.</p>
            </ion-text>
          </div>
        </div>

        <div v-if="selectedTab === 'history'" class="tab-content">
          <h2>Game History</h2>

          <ion-button @click="loadGames" expand="block" class="ion-margin-bottom">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Refresh History
          </ion-button>

          <ion-card v-for="game in completedGames" :key="game.id">
            <ion-card-header>
              <ion-card-title>{{ formatDate(game.date) }}</ion-card-title>
              <ion-card-subtitle>{{ game.venue }} - {{ formatTime(game.time) }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <div class="game-stats">
                <ion-badge color="success">{{ game.players?.length || 0 }} Players Attended</ion-badge>
                <ion-badge color="medium">Completed {{ formatDate(game.completedAt || game.date) }}</ion-badge>
              </div>

              <div class="player-section" v-if="game.players?.length > 0">
                <h3>Players</h3>
                <ion-list>
                  <ion-item v-for="player in game.players" :key="player.uid">
                    <ion-label>
                      <h2>{{ player.name }}</h2>
                      <p>{{ player.position }}</p>
                    </ion-label>
                  </ion-item>
                </ion-list>
              </div>
            </ion-card-content>
          </ion-card>

          <div v-if="completedGames.length === 0 && !adminStore.loading" class="empty-state">
            <ion-text color="medium">
              <p>No completed games yet.</p>
            </ion-text>
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
  IonButtons,
  IonBackButton,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonSearchbar,
  toastController
} from '@ionic/vue'
import {
  refreshOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  createOutline,
  peopleOutline
} from 'ionicons/icons'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()
const selectedTab = ref('games')
const userSearchQuery = ref('')

onMounted(() => {
  loadGames()
})

const completedGames = computed(() => {
  return adminStore.allGames.filter(game => game.status === 'completed')
})

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) {
    return adminStore.allUsers
  }

  const query = userSearchQuery.value.toLowerCase()
  return adminStore.allUsers.filter(user =>
    user.name?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query) ||
    user.position?.toLowerCase().includes(query)
  )
})

// Auto-load users when switching to users tab
watch(selectedTab, (newTab) => {
  if (newTab === 'users' && adminStore.allUsers.length === 0) {
    loadUsers()
  }
})

const loadGames = async () => {
  const result = await adminStore.loadAllGames()
  if (!result.success) {
    const toast = await toastController.create({
      message: 'Failed to load games',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  }
}

const loadUsers = async () => {
  const result = await adminStore.loadAllUsers()
  if (!result.success) {
    const toast = await toastController.create({
      message: 'Failed to load users',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  }
}

const moveToPlayers = async (gameId, playerUid) => {
  const result = await adminStore.movePlayerFromWaitlist(gameId, playerUid)

  const toast = await toastController.create({
    message: result.success ? 'Player moved to active roster!' : result.error,
    duration: 2000,
    color: result.success ? 'success' : 'danger'
  })
  await toast.present()

  if (result.success) {
    await loadGames()
  }
}

const removePlayer = async (gameId, playerUid, fromWaitlist) => {
  const result = await adminStore.removePlayerFromGame(gameId, playerUid, fromWaitlist)

  const toast = await toastController.create({
    message: result.success ? 'Player removed!' : result.error,
    duration: 2000,
    color: result.success ? 'success' : 'danger'
  })
  await toast.present()

  if (result.success) {
    await loadGames()
  }
}

const markAsPlayed = async (gameId) => {
  const result = await adminStore.markGameAsPlayed(gameId)

  const toast = await toastController.create({
    message: result.success ? 'Game marked as played and stats updated!' : result.error,
    duration: 2000,
    color: result.success ? 'success' : 'danger'
  })
  await toast.present()

  if (result.success) {
    await loadGames()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}
</script>

<style scoped>
.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}

h2 {
  margin: 1.5rem 0 1rem;
}

.tab-content {
  margin-top: 1rem;
}

.game-stats {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.player-section {
  margin-top: 1rem;
}

.player-section h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.regulars-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ion-color-light);
}

.regulars-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

/* Users tab - keep single column layout */
.users-tab {
  display: flex;
  flex-direction: column;
}

.users-tab > ion-card {
  width: 100%;
}

/* Search section styling */
.search-section {
  margin-bottom: 1rem;
}

.search-section ion-searchbar {
  --background: var(--ion-color-light);
  --border-radius: 8px;
  padding: 0;
}

/* Tablet and larger screens - show cards in grid (for games and history tabs) */
@media (min-width: 768px) {
  .tab-content:not(.users-tab) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    gap: 1rem;
  }

  .tab-content:not(.users-tab) > ion-button {
    grid-column: 1 / -1;
  }

  .tab-content:not(.users-tab) > .empty-state {
    grid-column: 1 / -1;
  }
}

/* Desktop screens - allow up to 2 columns (for games and history tabs) */
@media (min-width: 1200px) {
  .tab-content:not(.users-tab) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
