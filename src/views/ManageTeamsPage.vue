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
/* ========================================
   Manage Teams Page - Apple-Inspired Light Theme
   ======================================== */

.teams-page {
  min-height: 100%;
  background: var(--bg-secondary);
}

/* ========================================
   Hero Section
   ======================================== */

.teams-hero {
  background: var(--bg-primary);
  padding: var(--space-xl) var(--space-md) var(--space-lg);
  text-align: center;
  border-bottom: 1px solid var(--separator-color);
}

.hero-content {
  margin-bottom: var(--space-lg);
}

.game-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--accent-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.badge-day {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.badge-month {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  font-weight: 500;
}

.game-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
  letter-spacing: -0.02em;
}

.game-subtitle {
  font-size: 17px;
  color: var(--text-secondary);
  margin: 0;
}

/* ========================================
   Team Stats
   ======================================== */

.team-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin: 0 var(--space-sm);
}

.stat-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-avg {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.stat-column.dark .stat-value {
  color: #3a3a3c;
}

.stat-column.light .stat-value {
  color: var(--text-secondary);
}

.stat-divider {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-quaternary);
}

/* ========================================
   Action Bar
   ======================================== */

.action-bar {
  padding: var(--space-md);
  display: flex;
  justify-content: center;
}

.balance-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 12px var(--space-lg);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.balance-btn:hover {
  background: var(--accent-color-hover);
}

.balance-btn:active {
  transform: scale(0.97);
}

.balance-btn ion-icon {
  font-size: 20px;
}

/* ========================================
   Teams Layout
   ======================================== */

.teams-layout {
  display: grid;
  gap: var(--space-md);
  padding: 0 var(--space-md);
}

/* ========================================
   Team Section
   ======================================== */

.team-section {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--separator-color);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.section-title ion-icon {
  font-size: 20px;
  color: var(--color-warning);
}

.section-title h2 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.team-indicator {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.team-indicator.dark {
  background: linear-gradient(180deg, #3a3a3c 0%, #1c1c1e 100%);
}

.team-indicator.light {
  background: linear-gradient(180deg, #ffffff 0%, #e5e5ea 100%);
  border: 1px solid var(--separator-color-opaque);
}

/* ========================================
   Drop Zone
   ======================================== */

.drop-zone {
  min-height: 150px;
  padding: var(--space-sm);
  transition: all var(--transition-fast);
}

.drop-zone.drag-over {
  background: var(--accent-color-light);
}

/* ========================================
   Players List
   ======================================== */

.players-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.player-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--fill-tertiary);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all var(--transition-fast);
}

.player-card:hover {
  background: var(--bg-tertiary);
}

.player-card:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.player-rank {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-warning);
  min-width: 24px;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #007aff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.player-avatar.dark {
  background: linear-gradient(180deg, #3a3a3c 0%, #1c1c1e 100%);
}

.player-avatar.light {
  background: linear-gradient(180deg, #ffffff 0%, #e5e5ea 100%);
  border: 1px solid var(--separator-color-opaque);
  color: var(--text-primary);
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-meta {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
}

.check-in-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.position-badge {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
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
  background: linear-gradient(180deg, #34c759 0%, #28a745 100%);
}

.position-badge.defense {
  background: linear-gradient(180deg, #007aff 0%, #0056b3 100%);
}

.position-badge.goalie {
  background: linear-gradient(180deg, #af52de 0%, #9a40c9 100%);
}

/* ========================================
   Empty Zone
   ======================================== */

.empty-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) var(--space-md);
  text-align: center;
}

.empty-zone ion-icon {
  font-size: 40px;
  margin-bottom: var(--space-sm);
  color: var(--text-quaternary);
}

.empty-zone p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 4px;
}

.empty-zone .hint {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* ========================================
   Mobile Tip
   ======================================== */

.mobile-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--fill-tertiary);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-secondary);
}

.mobile-tip ion-icon {
  font-size: 16px;
  color: var(--accent-color);
}

/* ========================================
   Loading State
   ======================================== */

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

/* ========================================
   Responsive
   ======================================== */

@media (min-width: 768px) {
  .teams-hero {
    padding: var(--space-xl) var(--space-lg);
  }

  .game-title {
    font-size: 28px;
  }

  .team-stats {
    max-width: 400px;
    margin: 0 auto;
  }

  .teams-layout {
    grid-template-columns: repeat(2, 1fr);
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
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
