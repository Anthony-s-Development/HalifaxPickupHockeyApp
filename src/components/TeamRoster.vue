<template>
  <div class="team-roster">
    <!-- Dark Team -->
    <div class="team-card dark-team">
      <div class="team-header">
        <div class="team-indicator dark"></div>
        <h3 class="team-name">Dark Team</h3>
        <span class="player-count">{{ getTeamPlayerCount(darkTeam) }}/6</span>
      </div>

      <div class="team-body">
        <!-- Goalie -->
        <div class="position-group">
          <div class="position-header">
            <span class="position-badge goalie">G</span>
            <span class="position-title">Goalie</span>
          </div>
          <div class="player-slot" :class="{ empty: !darkTeam.goalie }">
            <template v-if="darkTeam.goalie">
              <span class="player-name">{{ darkTeam.goalie.name }}</span>
              <span v-if="isAdmin" class="skill-badge">{{ darkTeam.goalie.skillLevel || 2 }}</span>
            </template>
            <span v-else class="empty-text">-</span>
          </div>
        </div>

        <!-- Forwards -->
        <div class="position-group">
          <div class="position-header">
            <span class="position-badge forward">F</span>
            <span class="position-title">Forwards</span>
          </div>
          <div v-for="(_, index) in 3" :key="'dark-f-' + index" class="player-slot" :class="{ empty: !darkTeam.forwards[index] }">
            <template v-if="darkTeam.forwards[index]">
              <span class="player-name">{{ darkTeam.forwards[index].name }}</span>
              <span v-if="isAdmin" class="skill-badge">{{ darkTeam.forwards[index].skillLevel || 2 }}</span>
            </template>
            <span v-else class="empty-text">-</span>
          </div>
        </div>

        <!-- Defense -->
        <div class="position-group">
          <div class="position-header">
            <span class="position-badge defense">D</span>
            <span class="position-title">Defense</span>
          </div>
          <div v-for="(_, index) in 2" :key="'dark-d-' + index" class="player-slot" :class="{ empty: !darkTeam.defense[index] }">
            <template v-if="darkTeam.defense[index]">
              <span class="player-name">{{ darkTeam.defense[index].name }}</span>
              <span v-if="isAdmin" class="skill-badge">{{ darkTeam.defense[index].skillLevel || 2 }}</span>
            </template>
            <span v-else class="empty-text">-</span>
          </div>
        </div>
      </div>

      <div v-if="isAdmin" class="team-footer">
        <span class="avg-skill">Avg Skill: {{ calculateAvgSkill(darkTeam).toFixed(1) }}</span>
      </div>
    </div>

    <!-- Light Team -->
    <div class="team-card light-team">
      <div class="team-header">
        <div class="team-indicator light"></div>
        <h3 class="team-name">Light Team</h3>
        <span class="player-count">{{ getTeamPlayerCount(lightTeam) }}/6</span>
      </div>

      <div class="team-body">
        <!-- Goalie -->
        <div class="position-group">
          <div class="position-header">
            <span class="position-badge goalie">G</span>
            <span class="position-title">Goalie</span>
          </div>
          <div class="player-slot" :class="{ empty: !lightTeam.goalie }">
            <template v-if="lightTeam.goalie">
              <span class="player-name">{{ lightTeam.goalie.name }}</span>
              <span v-if="isAdmin" class="skill-badge">{{ lightTeam.goalie.skillLevel || 2 }}</span>
            </template>
            <span v-else class="empty-text">-</span>
          </div>
        </div>

        <!-- Forwards -->
        <div class="position-group">
          <div class="position-header">
            <span class="position-badge forward">F</span>
            <span class="position-title">Forwards</span>
          </div>
          <div v-for="(_, index) in 3" :key="'light-f-' + index" class="player-slot" :class="{ empty: !lightTeam.forwards[index] }">
            <template v-if="lightTeam.forwards[index]">
              <span class="player-name">{{ lightTeam.forwards[index].name }}</span>
              <span v-if="isAdmin" class="skill-badge">{{ lightTeam.forwards[index].skillLevel || 2 }}</span>
            </template>
            <span v-else class="empty-text">-</span>
          </div>
        </div>

        <!-- Defense -->
        <div class="position-group">
          <div class="position-header">
            <span class="position-badge defense">D</span>
            <span class="position-title">Defense</span>
          </div>
          <div v-for="(_, index) in 2" :key="'light-d-' + index" class="player-slot" :class="{ empty: !lightTeam.defense[index] }">
            <template v-if="lightTeam.defense[index]">
              <span class="player-name">{{ lightTeam.defense[index].name }}</span>
              <span v-if="isAdmin" class="skill-badge">{{ lightTeam.defense[index].skillLevel || 2 }}</span>
            </template>
            <span v-else class="empty-text">-</span>
          </div>
        </div>
      </div>

      <div v-if="isAdmin" class="team-footer">
        <span class="avg-skill">Avg Skill: {{ calculateAvgSkill(lightTeam).toFixed(1) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  darkTeam: {
    type: Object,
    required: true,
    default: () => ({ goalie: null, forwards: [], defense: [] })
  },
  lightTeam: {
    type: Object,
    required: true,
    default: () => ({ goalie: null, forwards: [], defense: [] })
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const getTeamPlayerCount = (team) => {
  let count = 0
  if (team.goalie) count++
  count += team.forwards.filter(p => p !== null && p !== undefined).length
  count += team.defense.filter(p => p !== null && p !== undefined).length
  return count
}

const calculateAvgSkill = (team) => {
  const players = [
    team.goalie,
    ...team.forwards,
    ...team.defense
  ].filter(p => p !== null && p !== undefined)

  if (players.length === 0) return 0

  const totalSkill = players.reduce((sum, player) => sum + (player.skillLevel || 2), 0)
  return totalSkill / players.length
}
</script>

<style scoped>
/* ========================================
   Team Roster Container (Apple-style)
   ======================================== */

.team-roster {
  margin-top: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* ========================================
   Team Card
   ======================================== */

.team-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

.team-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 12px var(--space-md);
  border-bottom: 1px solid var(--separator-color);
}

.team-indicator {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.team-indicator.dark {
  background: linear-gradient(180deg, #3a3a3c 0%, #1c1c1e 100%);
}

.team-indicator.light {
  background: linear-gradient(180deg, #ffffff 0%, #e5e5ea 100%);
  border: 1px solid var(--separator-color-opaque);
}

.team-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.player-count {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
}

/* ========================================
   Team Body
   ======================================== */

.team-body {
  padding: var(--space-sm) var(--space-md);
}

.position-group {
  margin-bottom: var(--space-sm);
}

.position-group:last-child {
  margin-bottom: 0;
}

.position-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.position-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  color: white;
}

.position-badge.goalie {
  background: linear-gradient(180deg, #af52de 0%, #9a40c9 100%);
}

.position-badge.forward {
  background: linear-gradient(180deg, #34c759 0%, #28a745 100%);
}

.position-badge.defense {
  background: linear-gradient(180deg, #007aff 0%, #0056b3 100%);
}

.position-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0;
  color: var(--text-tertiary);
}

/* ========================================
   Player Slots
   ======================================== */

.player-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  margin-left: 26px;
  background: var(--fill-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: 4px;
  min-height: 36px;
}

.player-slot:last-child {
  margin-bottom: 0;
}

.player-slot.empty {
  background: transparent;
  border: 1px dashed var(--separator-color-opaque);
}

.player-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.empty-text {
  font-size: 15px;
  color: var(--text-quaternary);
}

.skill-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 600;
  background: var(--accent-color);
  color: white;
  border-radius: var(--radius-full);
}

/* ========================================
   Team Footer (Admin Only)
   ======================================== */

.team-footer {
  display: flex;
  justify-content: center;
  padding: 8px var(--space-md);
  border-top: 1px solid var(--separator-color);
}

.avg-skill {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
}

/* ========================================
   Responsive Layout
   ======================================== */

@media (min-width: 768px) {
  .team-roster {
    flex-direction: row;
    gap: var(--space-md);
  }

  .team-card {
    flex: 1;
  }
}
</style>
