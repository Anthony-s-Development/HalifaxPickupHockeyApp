<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/${cityId}/admin`"></ion-back-button>
        </ion-buttons>
        <ion-title>Manage Teams</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="adminStore.selectedGame" class="teams-page">
        <!-- Hero Header -->
        <div class="teams-hero">
          <div class="hero-content">
            <div class="game-badge">
              <span class="badge-day">{{ formatDateDay(adminStore.selectedGame.date) }}</span>
              <span class="badge-month">{{ formatDateMonth(adminStore.selectedGame.date) }}</span>
            </div>
            <h1 class="game-title">{{ adminStore.selectedGame.venue }}</h1>
            <p class="game-subtitle">{{ formatTime(adminStore.selectedGame.time) }}</p>
          </div>

          <!-- Team Stats -->
          <div class="team-stats">
            <div class="stat-column dark">
              <span class="stat-label">Dark Team</span>
              <span class="stat-value">{{ darkTeamPlayers.length }}</span>
              <span class="stat-avg">Avg {{ getAverageSkill(darkTeamPlayers).toFixed(1) }}</span>
            </div>
            <div class="stat-divider">VS</div>
            <div class="stat-column light">
              <span class="stat-label">Light Team</span>
              <span class="stat-value">{{ lightTeamPlayers.length }}</span>
              <span class="stat-avg">Avg {{ getAverageSkill(lightTeamPlayers).toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <!-- Auto Balance Button -->
        <div class="action-bar">
          <button class="balance-btn" @click="autoBalanceTeams">
            <ion-icon :icon="shuffleOutline"></ion-icon>
            Auto-Balance Teams
          </button>
        </div>

        <!-- Teams Layout -->
        <div class="teams-layout">
          <!-- Waitlist Section -->
          <div class="team-section waitlist-section">
            <div class="section-header">
              <div class="section-title">
                <ion-icon :icon="timeOutline"></ion-icon>
                <h2>Waitlist</h2>
              </div>
              <ion-badge color="warning">{{ sortedWaitlist.length }}</ion-badge>
            </div>

            <div
              class="drop-zone"
              :class="{ 'drag-over': dragTarget === 'waitlist' }"
              @drop="handleDrop($event, 'waitlist')"
              @dragover.prevent="dragTarget = 'waitlist'"
              @dragleave="dragTarget = null"
              @dragenter.prevent
            >
              <div v-if="sortedWaitlist.length > 0" class="players-list">
                <div
                  v-for="(player, index) in sortedWaitlist"
                  :key="player.uid"
                  class="player-card"
                  :draggable="!isMobile"
                  @dragstart="!isMobile && handleDragStart($event, player, 'waitlist')"
                  @click="handlePlayerClick(player, 'waitlist')"
                >
                  <span class="player-rank">#{{ index + 1 }}</span>
                  <div class="player-avatar">
                    <span>{{ getInitials(player.name) }}</span>
                  </div>
                  <div class="player-info">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-meta">{{ player.position }} • Lvl {{ player.skillLevel || 2 }}</span>
                  </div>
                  <span class="check-in-time">{{ formatCheckInTime(player.checkedInAt) }}</span>
                </div>
              </div>

              <div v-else class="empty-zone">
                <ion-icon :icon="peopleOutline"></ion-icon>
                <p>No players waiting</p>
                <span class="hint">{{ isMobile ? 'Tap players to move here' : 'Drag players here' }}</span>
              </div>
            </div>
          </div>

          <!-- Dark Team Section -->
          <div class="team-section dark-section">
            <div class="section-header">
              <div class="section-title">
                <div class="team-indicator dark"></div>
                <h2>Dark Team</h2>
              </div>
              <ion-badge color="dark">{{ darkTeamPlayers.length }}</ion-badge>
            </div>

            <div
              class="drop-zone"
              :class="{ 'drag-over': dragTarget === 'dark' }"
              @drop="handleDrop($event, 'dark')"
              @dragover.prevent="dragTarget = 'dark'"
              @dragleave="dragTarget = null"
              @dragenter.prevent
            >
              <div v-if="darkTeamPlayers.length > 0" class="players-list">
                <div
                  v-for="player in darkTeamPlayers"
                  :key="player.uid"
                  class="player-card"
                  :draggable="!isMobile"
                  @dragstart="!isMobile && handleDragStart($event, player, 'dark')"
                  @click="handlePlayerClick(player, 'dark')"
                >
                  <div class="player-avatar dark">
                    <span>{{ getInitials(player.name) }}</span>
                  </div>
                  <div class="player-info">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-meta">{{ player.position }} • Lvl {{ player.skillLevel || 2 }}</span>
                  </div>
                  <div class="position-badge" :class="getPositionClass(player.position)">
                    <ion-icon :icon="getPositionIcon(player.position)"></ion-icon>
                  </div>
                </div>
              </div>

              <div v-else class="empty-zone">
                <ion-icon :icon="shirtOutline"></ion-icon>
                <p>No players assigned</p>
                <span class="hint">{{ isMobile ? 'Tap players to assign' : 'Drag players here' }}</span>
              </div>
            </div>
          </div>

          <!-- Light Team Section -->
          <div class="team-section light-section">
            <div class="section-header">
              <div class="section-title">
                <div class="team-indicator light"></div>
                <h2>Light Team</h2>
              </div>
              <ion-badge color="light">{{ lightTeamPlayers.length }}</ion-badge>
            </div>

            <div
              class="drop-zone"
              :class="{ 'drag-over': dragTarget === 'light' }"
              @drop="handleDrop($event, 'light')"
              @dragover.prevent="dragTarget = 'light'"
              @dragleave="dragTarget = null"
              @dragenter.prevent
            >
              <div v-if="lightTeamPlayers.length > 0" class="players-list">
                <div
                  v-for="player in lightTeamPlayers"
                  :key="player.uid"
                  class="player-card"
                  :draggable="!isMobile"
                  @dragstart="!isMobile && handleDragStart($event, player, 'light')"
                  @click="handlePlayerClick(player, 'light')"
                >
                  <div class="player-avatar light">
                    <span>{{ getInitials(player.name) }}</span>
                  </div>
                  <div class="player-info">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-meta">{{ player.position }} • Lvl {{ player.skillLevel || 2 }}</span>
                  </div>
                  <div class="position-badge" :class="getPositionClass(player.position)">
                    <ion-icon :icon="getPositionIcon(player.position)"></ion-icon>
                  </div>
                </div>
              </div>

              <div v-else class="empty-zone">
                <ion-icon :icon="shirtOutline"></ion-icon>
                <p>No players assigned</p>
                <span class="hint">{{ isMobile ? 'Tap players to assign' : 'Drag players here' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Tip -->
        <div v-if="isMobile" class="mobile-tip">
          <ion-icon :icon="informationCircleOutline"></ion-icon>
          <span>Tap any player to move them between teams</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <ion-spinner></ion-spinner>
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
  IonBadge,
  IonIcon,
  IonSpinner,
  toastController,
  actionSheetController
} from '@ionic/vue'
import {
  shuffleOutline,
  timeOutline,
  peopleOutline,
  shirtOutline,
  informationCircleOutline,
  fitnessOutline,
  shieldOutline,
  handLeftOutline
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useGameStore } from '@/stores/game'
import { Capacitor } from '@capacitor/core'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const gameStore = useGameStore()

const cityId = computed(() => route.params.cityId)
const draggedPlayer = ref(null)
const dragSource = ref(null)
const dragTarget = ref(null)
const isMobile = Capacitor.isNativePlatform()

onMounted(async () => {
  const gameId = route.params.gameId
  const result = await adminStore.loadGameById(gameId)

  if (!result.success) {
    const toast = await toastController.create({
      message: 'Game not found',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
    router.push(`/${cityId.value}/admin`)
    return
  }

  const game = adminStore.selectedGame
  const hasTeamAssignments = game.teamAssignments && (game.teamAssignments.dark || game.teamAssignments.light)

  if (game.players && game.players.length > 0) {
    if (!hasTeamAssignments) {
      await autoBalanceTeams()
    } else {
      const assignedUids = new Set([
        ...(game.teamAssignments.dark || []).map(p => p.uid),
        ...(game.teamAssignments.light || []).map(p => p.uid)
      ])
      const hasUnassignedPlayers = game.players.some(p => !assignedUids.has(p.uid))
      if (hasUnassignedPlayers) {
        await autoBalanceTeams()
      }
    }
  }
})

const sortedWaitlist = computed(() => {
  if (!adminStore.selectedGame?.waitlist) return []
  return [...adminStore.selectedGame.waitlist].sort((a, b) => {
    return new Date(a.checkedInAt) - new Date(b.checkedInAt)
  })
})

const teamAssignments = computed(() => {
  return adminStore.selectedGame?.teamAssignments || { dark: [], light: [] }
})

const darkTeamPlayers = computed(() => teamAssignments.value.dark || [])
const lightTeamPlayers = computed(() => teamAssignments.value.light || [])

const getAverageSkill = (players) => {
  if (!players || players.length === 0) return 0
  const total = players.reduce((sum, player) => sum + (player.skillLevel || 2), 0)
  return total / players.length
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getPositionClass = (position) => {
  const pos = position?.toLowerCase()
  if (pos === 'goalie') return 'goalie'
  if (pos === 'defense') return 'defense'
  return 'forward'
}

const getPositionIcon = (position) => {
  const pos = position?.toLowerCase()
  if (pos === 'goalie') return handLeftOutline
  if (pos === 'defense') return shieldOutline
  return fitnessOutline
}

const handleDragStart = (event, player, source) => {
  draggedPlayer.value = player
  dragSource.value = source
  event.dataTransfer.effectAllowed = 'move'
}

const handlePlayerClick = async (player, source) => {
  if (!isMobile) return

  const buttons = []

  if (source !== 'waitlist') {
    buttons.push({
      text: 'Move to Waitlist',
      role: 'destructive',
      handler: () => movePlayer(player, source, 'waitlist')
    })
  }

  if (source !== 'dark') {
    buttons.push({
      text: 'Move to Dark Team',
      handler: () => movePlayer(player, source, 'dark')
    })
  }

  if (source !== 'light') {
    buttons.push({
      text: 'Move to Light Team',
      handler: () => movePlayer(player, source, 'light')
    })
  }

  buttons.push({ text: 'Cancel', role: 'cancel' })

  const actionSheet = await actionSheetController.create({
    header: `Move ${player.name}`,
    subHeader: `${player.position} • Level ${player.skillLevel || 2}`,
    buttons
  })

  await actionSheet.present()
}

const movePlayer = async (player, source, target) => {
  const currentAssignments = { ...teamAssignments.value }
  if (!currentAssignments.dark) currentAssignments.dark = []
  if (!currentAssignments.light) currentAssignments.light = []

  if (source === 'waitlist' && (target === 'dark' || target === 'light')) {
    await adminStore.movePlayerToTeam(adminStore.selectedGame.id, player, 'waitlist', 'players')
    currentAssignments[target].push(player)
    await adminStore.updateTeamAssignments(adminStore.selectedGame.id, currentAssignments)
  }
  else if ((source === 'dark' || source === 'light') && target === 'waitlist') {
    currentAssignments[source] = currentAssignments[source].filter(p => p.uid !== player.uid)
    await adminStore.updateTeamAssignments(adminStore.selectedGame.id, currentAssignments)
    await adminStore.movePlayerToTeam(adminStore.selectedGame.id, player, 'players', 'waitlist')
  }
  else if ((source === 'dark' || source === 'light') && (target === 'dark' || target === 'light')) {
    currentAssignments[source] = currentAssignments[source].filter(p => p.uid !== player.uid)
    currentAssignments[target].push(player)
    await adminStore.updateTeamAssignments(adminStore.selectedGame.id, currentAssignments)
  }

  const toast = await toastController.create({
    message: 'Player moved!',
    duration: 1000,
    color: 'success'
  })
  await toast.present()
}

const handleDrop = async (event, target) => {
  event.preventDefault()
  dragTarget.value = null

  if (!draggedPlayer.value || dragSource.value === target) {
    return
  }

  await movePlayer(draggedPlayer.value, dragSource.value, target)

  draggedPlayer.value = null
  dragSource.value = null
}

const autoBalanceTeams = async () => {
  const allPlayers = adminStore.selectedGame.players || []
  const balanced = gameStore.balanceTeams(allPlayers)

  const newTeamAssignments = { dark: [], light: [] }

  if (balanced.darkTeam.goalie) newTeamAssignments.dark.push(balanced.darkTeam.goalie)
  newTeamAssignments.dark.push(...balanced.darkTeam.forwards)
  newTeamAssignments.dark.push(...balanced.darkTeam.defense)

  if (balanced.lightTeam.goalie) newTeamAssignments.light.push(balanced.lightTeam.goalie)
  newTeamAssignments.light.push(...balanced.lightTeam.forwards)
  newTeamAssignments.light.push(...balanced.lightTeam.defense)

  await adminStore.updateTeamAssignments(adminStore.selectedGame.id, newTeamAssignments)

  const toast = await toastController.create({
    message: 'Teams balanced!',
    duration: 2000,
    color: 'success'
  })
  await toast.present()
}

const formatDateDay = (dateString) => {
  if (!dateString) return ''
  const parts = dateString.split('T')[0].split('-')
  return parseInt(parts[2])
}

const formatDateMonth = (dateString) => {
  if (!dateString) return ''
  const parts = dateString.split('T')[0].split('-')
  const date = new Date(parts[0], parts[1] - 1, parts[2])
  return date.toLocaleDateString('en-US', { month: 'short' })
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
</script>

<style scoped>
.teams-page {
  min-height: 100%;
  background: var(--ion-background-color);
}

/* Hero Section */
.teams-hero {
  background: linear-gradient(135deg, #1a5c3e 0%, #0d3321 100%);
  padding: 2rem 1rem 1.5rem;
  text-align: center;
}

.hero-content {
  margin-bottom: 1.5rem;
}

.game-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.badge-day {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.badge-month {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
}

.game-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem;
}

.game-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Team Stats */
.team-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin: 0 0.5rem;
}

.stat-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-avg {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
}

.stat-column.dark .stat-value {
  color: #c4c4c4;
}

.stat-column.light .stat-value {
  color: #fafafa;
}

.stat-divider {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

/* Action Bar */
.action-bar {
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.balance-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3880ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.balance-btn:hover {
  background: #3171e0;
}

.balance-btn ion-icon {
  font-size: 1.25rem;
}

/* Teams Layout */
.teams-layout {
  display: grid;
  gap: 1rem;
  padding: 0 1rem;
}

/* Team Section */
.team-section {
  background: #2d2d2d;
  border-radius: 12px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title ion-icon {
  font-size: 1.25rem;
  color: #ffc409;
}

.section-title h2 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.team-indicator {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.team-indicator.dark {
  background: #333;
  border: 2px solid #666;
}

.team-indicator.light {
  background: #e0e0e0;
  border: 2px solid #fff;
}

/* Drop Zone */
.drop-zone {
  min-height: 150px;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.drop-zone.drag-over {
  background: rgba(56, 128, 255, 0.1);
}

/* Players List */
.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #3d3d3d;
  border-radius: 10px;
  cursor: grab;
  transition: all 0.2s;
}

.player-card:hover {
  background: #4d4d4d;
}

.player-card:active {
  cursor: grabbing;
}

.player-rank {
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffc409;
  min-width: 24px;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1a5c3e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.player-avatar.dark {
  background: #333;
  border: 2px solid #666;
}

.player-avatar.light {
  background: #e0e0e0;
  border: 2px solid #fff;
  color: #333;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-meta {
  display: block;
  font-size: 0.8rem;
  color: #92949c;
}

.check-in-time {
  font-size: 0.75rem;
  color: #666;
}

.position-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.position-badge ion-icon {
  font-size: 14px;
  color: white;
}

.position-badge.forward {
  background: #3880ff;
}

.position-badge.defense {
  background: #2dd36f;
}

.position-badge.goalie {
  background: #ffc409;
}

.position-badge.goalie ion-icon {
  color: #1a1a1a;
}

/* Empty Zone */
.empty-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #666;
  text-align: center;
}

.empty-zone ion-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-zone p {
  font-size: 0.95rem;
  color: #92949c;
  margin: 0 0 0.25rem;
}

.empty-zone .hint {
  font-size: 0.8rem;
  color: #666;
}

/* Mobile Tip */
.mobile-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.85rem;
  color: #92949c;
}

.mobile-tip ion-icon {
  font-size: 1rem;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

/* Responsive */
@media (min-width: 768px) {
  .teams-hero {
    padding: 2.5rem 2rem 2rem;
  }

  .game-title {
    font-size: 1.75rem;
  }

  .team-stats {
    max-width: 400px;
    margin: 0 auto;
  }

  .teams-layout {
    grid-template-columns: repeat(2, 1fr);
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .waitlist-section {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .teams-layout {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
  }

  .waitlist-section {
    grid-column: auto;
  }

  .drop-zone {
    min-height: 300px;
  }
}
</style>
