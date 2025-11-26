<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
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
          <ion-segment-button value="schedules">
            <ion-label>Schedules</ion-label>
          </ion-segment-button>
          <ion-segment-button value="history">
            <ion-label>History</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div v-if="selectedTab === 'games'" class="tab-content">
          <h2>Game Management</h2>

          <ion-button
            @click="loadGames"
            expand="block"
            class="ion-margin-bottom"
          >
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Refresh Games
          </ion-button>

          <ion-card v-for="game in activeGames" :key="game.id">
            <ion-card-header>
              <ion-card-title>{{ formatDate(game.date) }}</ion-card-title>
              <ion-card-subtitle
                >{{ game.venue }} -
                {{ formatTime(game.time) }}</ion-card-subtitle
              >
            </ion-card-header>
            <ion-card-content>
              <div class="game-stats">
                <ion-badge color="primary"
                  >{{ game.players?.length || 0 }} Players</ion-badge
                >
                <ion-badge color="warning"
                  >{{ game.waitlist?.length || 0 }} Waitlist</ion-badge
                >
                <ion-badge v-if="game.status === 'completed'" color="success"
                  >Completed</ion-badge
                >
              </div>

              <div class="player-section" v-if="game.players?.length > 0">
                <h3>Players</h3>
                <div class="player-list">
                  <div
                    class="player-item"
                    v-for="player in game.players"
                    :key="player.uid"
                  >
                    <div class="player-info">
                      <strong>{{ player.name }}</strong>
                      <span class="player-details">{{ player.position }}</span>
                    </div>
                    <ion-button
                      fill="clear"
                      color="danger"
                      size="small"
                      @click="removePlayer(game.id, player.uid, false)"
                    >
                      <ion-icon :icon="closeCircleOutline"></ion-icon>
                    </ion-button>
                  </div>
                </div>
              </div>

              <div class="player-section" v-if="game.waitlist?.length > 0">
                <h3>Waitlist</h3>
                <div class="player-list">
                  <div
                    class="player-item"
                    v-for="player in game.waitlist"
                    :key="player.uid"
                  >
                    <div class="player-info">
                      <strong>{{ player.name }}</strong>
                      <span class="player-details">{{ player.position }}</span>
                    </div>
                    <div class="player-actions">
                      <ion-button
                        fill="clear"
                        color="success"
                        size="small"
                        @click="moveToPlayers(game.id, player.uid)"
                      >
                        <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                      </ion-button>
                      <ion-button
                        fill="clear"
                        color="danger"
                        size="small"
                        @click="removePlayer(game.id, player.uid, true)"
                      >
                        <ion-icon :icon="closeCircleOutline"></ion-icon>
                      </ion-button>
                    </div>
                  </div>
                </div>
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

          <div
            v-if="activeGames.length === 0 && !adminStore.loading"
            class="empty-state"
          >
            <ion-text color="medium">
              <p>No active games found. Click "Refresh Games" to load.</p>
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

          <ion-button
            @click="loadUsers"
            expand="block"
            class="ion-margin-bottom"
          >
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Refresh Users
          </ion-button>

          <ion-list>
            <ion-item v-for="user in filteredUsers" :key="user.id">
              <ion-label>
                <h2>{{ user.name }}</h2>
                <p>
                  {{ user.email }} - {{ user.position }} - Level
                  {{ user.skillLevel || 2 }}
                </p>
              </ion-label>
              <ion-badge
                slot="end"
                :color="user.isAdmin ? 'primary' : 'medium'"
              >
                {{ user.isAdmin ? "Admin" : "User" }}
              </ion-badge>
              <ion-button
                slot="end"
                fill="clear"
                @click="router.push(`/admin/edit-user/${user.id}`)"
              >
                <ion-icon :icon="createOutline"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>

          <div
            v-if="filteredUsers.length === 0 && !adminStore.loading"
            class="empty-state"
          >
            <ion-text color="medium">
              <p v-if="userSearchQuery">
                No users found matching "{{ userSearchQuery }}"
              </p>
              <p v-else>No users found. Click "Refresh Users" to load.</p>
            </ion-text>
          </div>
        </div>

        <div v-if="selectedTab === 'schedules'" class="tab-content schedules-tab">
          <h2>Game Schedules</h2>

          <ion-button
            @click="loadSchedules"
            expand="block"
            class="ion-margin-bottom"
          >
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Refresh Schedules
          </ion-button>

          <ion-card v-for="schedule in adminStore.gameSchedules" :key="schedule.id">
            <ion-card-header>
              <ion-card-title>{{ schedule.dayName }} {{ schedule.displayTime }}</ion-card-title>
              <ion-card-subtitle>{{ schedule.venue }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <div class="schedule-details">
                <ion-badge :color="schedule.isActive ? 'success' : 'medium'">
                  {{ schedule.isActive ? 'Active' : 'Inactive' }}
                </ion-badge>
              </div>

              <div class="schedule-actions">
                <ion-button
                  fill="outline"
                  size="small"
                  @click="toggleScheduleStatus(schedule)"
                >
                  {{ schedule.isActive ? 'Deactivate' : 'Activate' }}
                </ion-button>
                <ion-button
                  fill="outline"
                  size="small"
                  @click="editSchedule(schedule)"
                >
                  <ion-icon :icon="createOutline" slot="start"></ion-icon>
                  Edit
                </ion-button>
                <ion-button
                  fill="outline"
                  size="small"
                  color="danger"
                  @click="deleteSchedule(schedule)"
                >
                  <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                  Delete
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>

          <div
            v-if="adminStore.gameSchedules.length === 0 && !adminStore.loading"
            class="empty-state"
          >
            <ion-text color="medium">
              <p>No schedules found. Click "Refresh Schedules" to load.</p>
            </ion-text>
          </div>

          <ion-card class="add-schedule-card">
            <ion-card-header>
              <ion-card-title>Add New Schedule</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item>
                <ion-label position="floating">Day of Week</ion-label>
                <ion-select v-model="newSchedule.dayOfWeek" interface="popover">
                  <ion-select-option :value="0">Sunday</ion-select-option>
                  <ion-select-option :value="1">Monday</ion-select-option>
                  <ion-select-option :value="2">Tuesday</ion-select-option>
                  <ion-select-option :value="3">Wednesday</ion-select-option>
                  <ion-select-option :value="4">Thursday</ion-select-option>
                  <ion-select-option :value="5">Friday</ion-select-option>
                  <ion-select-option :value="6">Saturday</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Time (24h format, e.g. 22:30)</ion-label>
                <ion-input v-model="newSchedule.time" placeholder="22:30"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Venue</ion-label>
                <ion-input v-model="newSchedule.venue" placeholder="Forum"></ion-input>
              </ion-item>

              <ion-button
                expand="block"
                class="ion-margin-top"
                @click="addNewSchedule"
                :disabled="!newSchedule.time || !newSchedule.venue"
              >
                Add Schedule
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>

        <div v-if="selectedTab === 'history'" class="tab-content">
          <h2>Game History</h2>

          <ion-button
            @click="loadGames"
            expand="block"
            class="ion-margin-bottom"
          >
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Refresh History
          </ion-button>

          <ion-card v-for="game in completedGames" :key="game.id">
            <ion-card-header>
              <ion-card-title>{{ formatDate(game.date) }}</ion-card-title>
              <ion-card-subtitle
                >{{ game.venue }} -
                {{ formatTime(game.time) }}</ion-card-subtitle
              >
            </ion-card-header>
            <ion-card-content>
              <div class="game-stats">
                <ion-badge color="success"
                  >{{ game.players?.length || 0 }} Players Attended</ion-badge
                >
                <ion-badge color="medium"
                  >Completed
                  {{ formatDate(game.completedAt || game.date) }}</ion-badge
                >
              </div>

              <div class="player-section" v-if="game.players?.length > 0">
                <h3>Players</h3>
                <div class="player-list">
                  <div
                    class="player-item"
                    v-for="player in game.players"
                    :key="player.uid"
                  >
                    <div class="player-info">
                      <strong>{{ player.name }}</strong>
                      <span class="player-details">{{ player.position }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <div
            v-if="completedGames.length === 0 && !adminStore.loading"
            class="empty-state"
          >
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
  IonSelect,
  IonSelectOption,
  IonInput,
  toastController,
  alertController,
} from "@ionic/vue";
import {
  refreshOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  createOutline,
  peopleOutline,
  trashOutline,
} from "ionicons/icons";
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAdminStore } from "@/stores/admin";

const router = useRouter();
const adminStore = useAdminStore();
const selectedTab = ref("games");
const userSearchQuery = ref("");
const newSchedule = ref({
  dayOfWeek: 0,
  time: "",
  venue: "",
});

onMounted(() => {
  loadGames();
});

const activeGames = computed(() => {
  return adminStore.allGames.filter((game) => game.status !== "completed");
});

const completedGames = computed(() => {
  return adminStore.allGames.filter((game) => game.status === "completed");
});

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) {
    return adminStore.allUsers;
  }

  const query = userSearchQuery.value.toLowerCase();
  return adminStore.allUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.position?.toLowerCase().includes(query)
  );
});

watch(selectedTab, (newTab) => {
  if (newTab === "users" && adminStore.allUsers.length === 0) {
    loadUsers();
  }
  if (newTab === "schedules" && adminStore.gameSchedules.length === 0) {
    loadSchedules();
  }
});

const loadGames = async () => {
  const result = await adminStore.loadAllGames();
  if (!result.success) {
    const toast = await toastController.create({
      message: "Failed to load games",
      duration: 2000,
      color: "danger",
    });
    await toast.present();
  }
};

const loadUsers = async () => {
  const result = await adminStore.loadAllUsers();
  if (!result.success) {
    const toast = await toastController.create({
      message: "Failed to load users",
      duration: 2000,
      color: "danger",
    });
    await toast.present();
  }
};

const loadSchedules = async () => {
  const result = await adminStore.loadGameSchedules();
  if (!result.success) {
    const toast = await toastController.create({
      message: "Failed to load schedules",
      duration: 2000,
      color: "danger",
    });
    await toast.present();
  }
};

const toggleScheduleStatus = async (schedule) => {
  const result = await adminStore.updateGameSchedule(schedule.id, {
    isActive: !schedule.isActive,
  });

  const toast = await toastController.create({
    message: result.success
      ? `Schedule ${schedule.isActive ? "deactivated" : "activated"}!`
      : "Failed to update schedule",
    duration: 2000,
    color: result.success ? "success" : "danger",
  });
  await toast.present();
};

const editSchedule = async (schedule) => {
  const alert = await alertController.create({
    header: "Edit Schedule",
    inputs: [
      {
        name: "time",
        type: "text",
        placeholder: "Time (24h format, e.g. 22:30)",
        value: schedule.time,
      },
      {
        name: "venue",
        type: "text",
        placeholder: "Venue",
        value: schedule.venue,
      },
    ],
    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },
      {
        text: "Save",
        handler: async (data) => {
          const displayTime = formatDisplayTime(data.time);
          const result = await adminStore.updateGameSchedule(schedule.id, {
            time: data.time,
            venue: data.venue,
            displayTime: displayTime,
          });

          const toast = await toastController.create({
            message: result.success
              ? "Schedule updated!"
              : "Failed to update schedule",
            duration: 2000,
            color: result.success ? "success" : "danger",
          });
          await toast.present();
        },
      },
    ],
  });

  await alert.present();
};

const formatDisplayTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

const deleteSchedule = async (schedule) => {
  const alert = await alertController.create({
    header: "Delete Schedule",
    message: `Are you sure you want to delete the ${schedule.dayName} ${schedule.displayTime} schedule at ${schedule.venue}? This cannot be undone.`,
    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },
      {
        text: "Delete",
        role: "destructive",
        cssClass: "danger-button",
        handler: async () => {
          const result = await adminStore.deleteGameSchedule(schedule.id);

          const toast = await toastController.create({
            message: result.success
              ? "Schedule deleted!"
              : "Failed to delete schedule",
            duration: 2000,
            color: result.success ? "success" : "danger",
          });
          await toast.present();
        },
      },
    ],
  });

  await alert.present();
};

const addNewSchedule = async () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[newSchedule.value.dayOfWeek];
  const displayTime = formatDisplayTime(newSchedule.value.time);

  const scheduleData = {
    dayOfWeek: newSchedule.value.dayOfWeek,
    dayName: dayName,
    time: newSchedule.value.time,
    displayTime: displayTime,
    venue: newSchedule.value.venue,
    isActive: true,
    order: newSchedule.value.dayOfWeek,
  };

  const result = await adminStore.addGameSchedule(scheduleData);

  const toast = await toastController.create({
    message: result.success ? "Schedule added!" : "Failed to add schedule",
    duration: 2000,
    color: result.success ? "success" : "danger",
  });
  await toast.present();

  if (result.success) {
    newSchedule.value = {
      dayOfWeek: 0,
      time: "",
      venue: "",
    };
  }
};

const moveToPlayers = async (gameId, playerUid) => {
  const game = adminStore.allGames.find((g) => g.id === gameId);
  const player = game?.waitlist?.find((p) => p.uid === playerUid);

  if (!player) return;

  const alert = await alertController.create({
    header: "Move Player to Active Roster",
    message: `Are you sure you want to move ${player.name} from the waitlist to the active roster?`,
    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },
      {
        text: "Move Player",
        role: "confirm",
        handler: async () => {
          const result = await adminStore.movePlayerFromWaitlist(
            gameId,
            playerUid
          );

          const toast = await toastController.create({
            message: result.success
              ? "Player moved to active roster!"
              : result.error,
            duration: 2000,
            color: result.success ? "success" : "danger",
          });
          await toast.present();

          if (result.success) {
            await loadGames();
          }
        },
      },
    ],
  });

  await alert.present();
};

const removePlayer = async (gameId, playerUid, fromWaitlist) => {
  const game = adminStore.allGames.find((g) => g.id === gameId);
  const player = fromWaitlist
    ? game?.waitlist?.find((p) => p.uid === playerUid)
    : game?.players?.find((p) => p.uid === playerUid);

  if (!player) return;

  const location = fromWaitlist ? "waitlist" : "active roster";

  const alert = await alertController.create({
    header: "Remove Player",
    message: `Are you sure you want to remove ${player.name} from the ${location}?`,
    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },
      {
        text: "Remove",
        role: "confirm",
        cssClass: "danger-button",
        handler: async () => {
          const result = await adminStore.removePlayerFromGame(
            gameId,
            playerUid,
            fromWaitlist
          );

          const toast = await toastController.create({
            message: result.success ? "Player removed!" : result.error,
            duration: 2000,
            color: result.success ? "success" : "danger",
          });
          await toast.present();

          if (result.success) {
            await loadGames();
          }
        },
      },
    ],
  });

  await alert.present();
};

const markAsPlayed = async (gameId) => {
  const result = await adminStore.markGameAsPlayed(gameId);

  const toast = await toastController.create({
    message: result.success
      ? "Game marked as played and stats updated!"
      : result.error,
    duration: 2000,
    color: result.success ? "success" : "danger",
  });
  await toast.present();

  if (result.success) {
    await loadGames();
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("T")[0].split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};
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

.player-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--ion-color-light);
  border-radius: 6px;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #ffffff;
}

.player-info strong {
  font-size: 1rem;
  font-weight: 600;
}

.player-details {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

.player-actions {
  display: flex;
  gap: 0.25rem;
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

.users-tab > ion-list {
  background: var(--ion-card-background, #fff);
  border-radius: 8px;
  padding: 0;
  margin-bottom: 1rem;
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

/* Schedules tab styles */
.schedules-tab {
  display: flex;
  flex-direction: column;
}

.schedule-details {
  margin-bottom: 1rem;
}

.schedule-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.add-schedule-card {
  margin-top: 1rem;
  border: 2px dashed var(--ion-color-medium);
}

@media (min-width: 768px) {
  .tab-content:not(.users-tab):not(.schedules-tab) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    gap: 1rem;
  }

  .tab-content:not(.users-tab):not(.schedules-tab) > ion-button {
    grid-column: 1 / -1;
  }

  .tab-content:not(.users-tab):not(.schedules-tab) > .empty-state {
    grid-column: 1 / -1;
  }

  .schedules-tab {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1rem;
  }

  .schedules-tab > ion-button {
    grid-column: 1 / -1;
  }

  .schedules-tab > .empty-state {
    grid-column: 1 / -1;
  }

  .schedules-tab > .add-schedule-card {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1200px) {
  .tab-content:not(.users-tab):not(.schedules-tab) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
