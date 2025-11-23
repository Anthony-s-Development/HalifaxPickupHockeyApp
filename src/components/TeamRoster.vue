<template>
  <div class="team-roster">
    <ion-card>
      <ion-card-header>
        <ion-card-title>Dark Team</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          <ion-item>
            <ion-label>
              <h2>Goalie</h2>
              <p v-if="darkTeam.goalie">
                {{ darkTeam.goalie.name }} (Skill: {{ darkTeam.goalie.skillLevel || 3 }})
              </p>
              <p v-else class="empty-slot">-</p>
            </ion-label>
          </ion-item>

          <ion-item v-for="(forward, index) in 3" :key="'dark-f-' + index">
            <ion-label>
              <h2>F</h2>
              <p v-if="darkTeam.forwards[index]">
                {{ darkTeam.forwards[index].name }} (Skill: {{ darkTeam.forwards[index].skillLevel || 3 }})
              </p>
              <p v-else class="empty-slot">-</p>
            </ion-label>
          </ion-item>

          <ion-item v-for="(defense, index) in 2" :key="'dark-d-' + index">
            <ion-label>
              <h2>D</h2>
              <p v-if="darkTeam.defense[index]">
                {{ darkTeam.defense[index].name }} (Skill: {{ darkTeam.defense[index].skillLevel || 3 }})
              </p>
              <p v-else class="empty-slot">-</p>
            </ion-label>
          </ion-item>
        </ion-list>
        <div class="team-stats">
          <ion-badge color="dark">
            Avg Skill: {{ calculateAvgSkill(darkTeam).toFixed(1) }}
          </ion-badge>
        </div>
      </ion-card-content>
    </ion-card>

    <ion-card>
      <ion-card-header>
        <ion-card-title>Light Team</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          <ion-item>
            <ion-label>
              <h2>Goalie</h2>
              <p v-if="lightTeam.goalie">
                {{ lightTeam.goalie.name }} (Skill: {{ lightTeam.goalie.skillLevel || 3 }})
              </p>
              <p v-else class="empty-slot">-</p>
            </ion-label>
          </ion-item>

          <ion-item v-for="(forward, index) in 3" :key="'light-f-' + index">
            <ion-label>
              <h2>F</h2>
              <p v-if="lightTeam.forwards[index]">
                {{ lightTeam.forwards[index].name }} (Skill: {{ lightTeam.forwards[index].skillLevel || 3 }})
              </p>
              <p v-else class="empty-slot">-</p>
            </ion-label>
          </ion-item>

          <ion-item v-for="(defense, index) in 2" :key="'light-d-' + index">
            <ion-label>
              <h2>D</h2>
              <p v-if="lightTeam.defense[index]">
                {{ lightTeam.defense[index].name }} (Skill: {{ lightTeam.defense[index].skillLevel || 3 }})
              </p>
              <p v-else class="empty-slot">-</p>
            </ion-label>
          </ion-item>
        </ion-list>
        <div class="team-stats">
          <ion-badge color="light">
            Avg Skill: {{ calculateAvgSkill(lightTeam).toFixed(1) }}
          </ion-badge>
        </div>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup>
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/vue'

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
  }
})

const calculateAvgSkill = (team) => {
  const players = [
    team.goalie,
    ...team.forwards,
    ...team.defense
  ].filter(p => p !== null && p !== undefined)

  if (players.length === 0) return 0

  const totalSkill = players.reduce((sum, player) => sum + (player.skillLevel || 3), 0)
  return totalSkill / players.length
}
</script>

<style scoped>
.team-roster {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-slot {
  color: var(--ion-color-medium);
  font-style: italic;
}

.team-stats {
  margin-top: 1rem;
  text-align: center;
}

ion-item h2 {
  font-weight: 600;
  color: var(--ion-color-primary);
}

/* Tablet and larger screens - display teams side by side */
@media (min-width: 768px) {
  .team-roster {
    flex-direction: row;
    gap: 1rem;
  }

  .team-roster > ion-card {
    flex: 1;
    margin: 0;
  }
}
</style>
