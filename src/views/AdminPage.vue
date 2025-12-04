<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/${cityId}`"></ion-back-button>
        </ion-buttons>
        <ion-title>Admin</ion-title>
        <ion-buttons slot="end">
          <ion-button
            fill="clear"
            color="primary"
            @click="router.push('/')"
            title="Switch City"
          >
            <ion-icon :icon="swapHorizontalOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="admin-page">
        <!-- Hero Header -->
        <div class="admin-hero">
          <div class="hero-content">
            <div class="admin-avatar">
              <ion-icon :icon="settingsOutline"></ion-icon>
              <div
                class="admin-type-badge"
                :class="authStore.isSuperAdmin ? 'super' : 'city'"
              >
                <ion-icon
                  :icon="
                    authStore.isSuperAdmin
                      ? starOutline
                      : shieldCheckmarkOutline
                  "
                ></ion-icon>
              </div>
            </div>
            <h1 class="admin-title">
              {{ cityStore.currentCity?.displayName || "Admin" }}
            </h1>
            <p class="admin-subtitle">Dashboard</p>
            <div
              class="admin-role-badge"
              :class="authStore.isSuperAdmin ? 'super' : 'city'"
            >
              {{
                authStore.isSuperAdmin
                  ? "Super Admin"
                  : `${cityStore.currentCity?.name} Admin`
              }}
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-item" @click="selectedTab = 'games'">
              <ion-icon :icon="gameControllerOutline"></ion-icon>
              <span class="stat-value">{{ activeGames.length }}</span>
              <span class="stat-label">Active</span>
            </div>
            <div class="stat-item" @click="selectedTab = 'users'">
              <ion-icon :icon="peopleOutline"></ion-icon>
              <span class="stat-value">{{ adminStore.allUsers.length }}</span>
              <span class="stat-label">Users</span>
            </div>
            <div class="stat-item" @click="selectedTab = 'schedules'">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <span class="stat-value">{{
                adminStore.gameSchedules.length
              }}</span>
              <span class="stat-label">Schedules</span>
            </div>
            <div class="stat-item" @click="selectedTab = 'history'">
              <ion-icon :icon="timeOutline"></ion-icon>
              <span class="stat-value">{{ completedGames.length }}</span>
              <span class="stat-label">History</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <ion-segment v-model="selectedTab" mode="ios">
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
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Games Tab -->
          <div v-show="selectedTab === 'games'" class="tab-panel">
            <div class="section-header">
              <h2>Active Games</h2>
              <button
                class="refresh-btn"
                @click="loadGames"
                :disabled="adminStore.loading"
              >
                <ion-icon
                  :icon="refreshOutline"
                  :class="{ spinning: adminStore.loading }"
                ></ion-icon>
                Refresh
              </button>
            </div>

            <div v-if="activeGames.length > 0" class="games-grid">
              <div v-for="game in activeGames" :key="game.id" class="game-card">
                <div class="game-header">
                  <div class="game-date">
                    <span class="date-day">{{ formatDateDay(game.date) }}</span>
                    <span class="date-month">{{
                      formatDateMonth(game.date)
                    }}</span>
                  </div>
                  <div class="game-info">
                    <h3>{{ game.venue }}</h3>
                    <p>{{ formatTime(game.time) }}</p>
                  </div>
                  <div class="game-badges">
                    <ion-badge color="primary"
                      >{{ game.players?.length || 0 }} Playing</ion-badge
                    >
                    <ion-badge v-if="game.waitlist?.length > 0" color="warning"
                      >{{ game.waitlist.length }} Waiting</ion-badge
                    >
                  </div>
                </div>

                <div v-if="game.players?.length > 0" class="player-section">
                  <div class="section-title">
                    <ion-icon :icon="peopleOutline"></ion-icon>
                    <span>Players</span>
                  </div>
                  <div class="player-list">
                    <div
                      v-for="player in game.players"
                      :key="player.uid"
                      class="player-chip"
                    >
                      <span class="player-initials">{{
                        getInitials(player.name)
                      }}</span>
                      <span class="player-name">{{ player.name }}</span>
                      <span class="player-position">{{ player.position }}</span>
                      <button
                        class="remove-btn"
                        @click="removePlayer(game.id, player.uid, false)"
                      >
                        <ion-icon :icon="closeOutline"></ion-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  v-if="game.waitlist?.length > 0"
                  class="player-section waitlist"
                >
                  <div class="section-title">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    <span>Waitlist</span>
                  </div>
                  <div class="player-list">
                    <div
                      v-for="player in game.waitlist"
                      :key="player.uid"
                      class="player-chip waitlist"
                    >
                      <span class="player-initials">{{
                        getInitials(player.name)
                      }}</span>
                      <span class="player-name">{{ player.name }}</span>
                      <span class="player-position">{{ player.position }}</span>
                      <button
                        class="promote-btn"
                        @click="moveToPlayers(game.id, player.uid)"
                      >
                        <ion-icon :icon="arrowUpOutline"></ion-icon>
                      </button>
                      <button
                        class="remove-btn"
                        @click="removePlayer(game.id, player.uid, true)"
                      >
                        <ion-icon :icon="closeOutline"></ion-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="game-actions">
                  <button
                    class="action-btn primary"
                    @click="
                      router.push(`/${cityId}/admin/manage-teams/${game.id}`)
                    "
                  >
                    <ion-icon :icon="peopleOutline"></ion-icon>
                    Manage Teams
                  </button>
                  <button
                    class="action-btn success"
                    @click="markAsPlayed(game.id)"
                  >
                    <ion-icon :icon="checkmarkOutline"></ion-icon>
                    Mark Played
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <ion-icon :icon="gameControllerOutline"></ion-icon>
              <h3>No Active Games</h3>
              <p>There are no upcoming games scheduled.</p>
            </div>
          </div>

          <!-- Users Tab -->
          <div v-show="selectedTab === 'users'" class="tab-panel">
            <div class="section-header">
              <h2>User Management</h2>
              <span class="user-count">{{ filteredUsers.length }} users</span>
            </div>

            <div class="search-box">
              <ion-icon :icon="searchOutline"></ion-icon>
              <input
                type="text"
                v-model="userSearchQuery"
                placeholder="Search by name, email, or position..."
              />
              <button
                v-if="userSearchQuery"
                class="clear-btn"
                @click="userSearchQuery = ''"
              >
                <ion-icon :icon="closeOutline"></ion-icon>
              </button>
            </div>

            <div v-if="filteredUsers.length > 0" class="users-list">
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="user-card"
                @click="router.push(`/${cityId}/admin/edit-user/${user.id}`)"
              >
                <div class="user-avatar">
                  <span>{{ getInitials(user.name) }}</span>
                  <div
                    v-if="user.isSuperAdmin || user.cityData?.[cityId]?.isAdmin"
                    class="admin-indicator"
                  >
                    <ion-icon :icon="starOutline"></ion-icon>
                  </div>
                </div>
                <div class="user-info">
                  <h3>{{ user.name }}</h3>
                  <p>{{ user.email }}</p>
                  <div class="user-meta">
                    <span class="position-tag">{{ user.position }}</span>
                    <span class="level-tag"
                      >Level {{ user.skillLevel || 2 }}</span
                    >
                  </div>
                </div>
                <div class="user-badge">
                  <ion-badge :color="getUserAdminBadgeColor(user)">
                    {{ getUserAdminLabel(user) }}
                  </ion-badge>
                </div>
                <ion-icon
                  :icon="chevronForwardOutline"
                  class="chevron"
                ></ion-icon>
              </div>
            </div>

            <div v-else class="empty-state">
              <ion-icon :icon="peopleOutline"></ion-icon>
              <h3>No Users Found</h3>
              <p v-if="userSearchQuery">
                No users match "{{ userSearchQuery }}"
              </p>
              <p v-else>No registered users yet.</p>
            </div>
          </div>

          <!-- Schedules Tab -->
          <div v-show="selectedTab === 'schedules'" class="tab-panel">
            <div class="section-header">
              <h2>Game Schedules</h2>
              <button class="refresh-btn" @click="loadSchedules">
                <ion-icon :icon="refreshOutline"></ion-icon>
                Refresh
              </button>
            </div>

            <div
              v-if="adminStore.gameSchedules.length > 0"
              class="schedules-grid"
            >
              <div
                v-for="schedule in adminStore.gameSchedules"
                :key="schedule.id"
                class="schedule-card"
                :class="{ inactive: !schedule.isActive }"
              >
                <div class="schedule-header">
                  <div class="schedule-day">
                    <span class="day-name">{{ schedule.dayName }}</span>
                    <span class="day-time">{{ schedule.displayTime }}</span>
                  </div>
                  <ion-badge :color="schedule.isActive ? 'success' : 'medium'">
                    {{ schedule.isActive ? "Active" : "Inactive" }}
                  </ion-badge>
                </div>
                <div class="schedule-venue">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  {{ schedule.venue }}
                </div>
                <div class="schedule-actions">
                  <button
                    class="action-btn small"
                    :class="schedule.isActive ? 'warning' : 'success'"
                    @click="toggleScheduleStatus(schedule)"
                  >
                    {{ schedule.isActive ? "Deactivate" : "Activate" }}
                  </button>
                  <button
                    class="action-btn small"
                    @click="editSchedule(schedule)"
                  >
                    <ion-icon :icon="createOutline"></ion-icon>
                  </button>
                  <button
                    class="action-btn small danger"
                    @click="deleteSchedule(schedule)"
                  >
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state small">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <p>No schedules for this city</p>
            </div>

            <!-- Add Schedule Form -->
            <div class="add-schedule-section">
              <div class="section-title-bar">
                <ion-icon :icon="addCircleOutline"></ion-icon>
                <h3>Add New Schedule</h3>
              </div>
              <div class="add-schedule-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Day</label>
                    <select v-model="newSchedule.dayOfWeek">
                      <option :value="0">Sunday</option>
                      <option :value="1">Monday</option>
                      <option :value="2">Tuesday</option>
                      <option :value="3">Wednesday</option>
                      <option :value="4">Thursday</option>
                      <option :value="5">Friday</option>
                      <option :value="6">Saturday</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Time (24h)</label>
                    <input
                      type="text"
                      v-model="newSchedule.time"
                      placeholder="22:30"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    v-model="newSchedule.venue"
                    placeholder="Forum"
                  />
                </div>
                <button
                  class="action-btn primary full-width"
                  @click="addNewSchedule"
                  :disabled="!newSchedule.time || !newSchedule.venue"
                >
                  <ion-icon :icon="addOutline"></ion-icon>
                  Add Schedule
                </button>
              </div>
            </div>
          </div>

          <!-- History Tab -->
          <div v-show="selectedTab === 'history'" class="tab-panel">
            <div class="section-header">
              <h2>Game History</h2>
              <span class="user-count">{{ completedGames.length }} games</span>
            </div>

            <div v-if="completedGames.length > 0" class="history-list">
              <div
                v-for="game in completedGames"
                :key="game.id"
                class="history-card"
              >
                <div class="history-date">
                  <span class="date-day">{{ formatDateDay(game.date) }}</span>
                  <span class="date-month">{{
                    formatDateMonth(game.date)
                  }}</span>
                </div>
                <div class="history-info">
                  <h3>{{ game.venue }}</h3>
                  <p>{{ formatTime(game.time) }}</p>
                  <div class="history-stats">
                    <ion-badge color="success"
                      >{{ game.players?.length || 0 }} played</ion-badge
                    >
                    <span class="completed-date"
                      >Completed
                      {{ formatCompletedDate(game.completedAt) }}</span
                    >
                  </div>
                </div>
                <button
                  class="expand-btn"
                  @click="toggleHistoryExpand(game.id)"
                >
                  <ion-icon
                    :icon="
                      expandedHistory.includes(game.id)
                        ? chevronUpOutline
                        : chevronDownOutline
                    "
                  ></ion-icon>
                </button>

                <div
                  v-if="expandedHistory.includes(game.id)"
                  class="history-players"
                >
                  <div class="players-grid">
                    <div
                      v-for="player in game.players"
                      :key="player.uid"
                      class="history-player"
                    >
                      <span class="player-initials small">{{
                        getInitials(player.name)
                      }}</span>
                      <span>{{ player.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <ion-icon :icon="timeOutline"></ion-icon>
              <h3>No History</h3>
              <p>No completed games yet.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="adminStore.loading" class="loading-overlay">
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
  IonButton,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonSpinner,
  toastController,
  alertController,
} from "@ionic/vue";
import {
  refreshOutline,
  closeOutline,
  checkmarkOutline,
  createOutline,
  peopleOutline,
  trashOutline,
  swapHorizontalOutline,
  settingsOutline,
  starOutline,
  shieldCheckmarkOutline,
  gameControllerOutline,
  calendarOutline,
  timeOutline,
  searchOutline,
  chevronForwardOutline,
  locationOutline,
  addCircleOutline,
  addOutline,
  arrowUpOutline,
  chevronDownOutline,
  chevronUpOutline,
} from "ionicons/icons";
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";
import { useCityStore } from "@/stores/city";

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();
const authStore = useAuthStore();
const cityStore = useCityStore();

const selectedTab = ref("games");
const userSearchQuery = ref("");
const expandedHistory = ref([]);
const newSchedule = ref({
  dayOfWeek: 0,
  time: "",
  venue: "",
});

const cityId = computed(() => route.params.cityId);

onMounted(async () => {
  if (cityId.value) {
    await cityStore.setCurrentCity(cityId.value);
    adminStore.setCurrentCity(cityId.value);
  }
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

const getUserAdminLabel = (user) => {
  if (user.isSuperAdmin) return "Super Admin";
  if (user.cityData?.[cityId.value]?.isAdmin) return "City Admin";
  if (user.isAdmin) return "Admin";
  return "User";
};

const getUserAdminBadgeColor = (user) => {
  if (user.isSuperAdmin) return "primary";
  if (user.cityData?.[cityId.value]?.isAdmin) return "secondary";
  if (user.isAdmin) return "tertiary";
  return "medium";
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const toggleHistoryExpand = (gameId) => {
  const index = expandedHistory.value.indexOf(gameId);
  if (index > -1) {
    expandedHistory.value.splice(index, 1);
  } else {
    expandedHistory.value.push(gameId);
  }
};

watch(selectedTab, (newTab) => {
  if (newTab === "users" && adminStore.allUsers.length === 0) {
    loadUsers();
  }
  if (newTab === "schedules" && adminStore.gameSchedules.length === 0) {
    loadSchedules();
  }
});

const loadGames = async () => {
  const result = await adminStore.loadAllGames(cityId.value);
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
  const result = await adminStore.loadGameSchedules(cityId.value);
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
      { text: "Cancel", role: "cancel" },
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
            message: result.success ? "Schedule updated!" : "Failed to update",
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
    message: `Delete ${schedule.dayName} ${schedule.displayTime} at ${schedule.venue}?`,
    buttons: [
      { text: "Cancel", role: "cancel" },
      {
        text: "Delete",
        role: "destructive",
        handler: async () => {
          const result = await adminStore.deleteGameSchedule(schedule.id);
          const toast = await toastController.create({
            message: result.success ? "Schedule deleted!" : "Failed to delete",
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

  const result = await adminStore.addGameSchedule(scheduleData, cityId.value);

  const toast = await toastController.create({
    message: result.success ? "Schedule added!" : "Failed to add schedule",
    duration: 2000,
    color: result.success ? "success" : "danger",
  });
  await toast.present();

  if (result.success) {
    newSchedule.value = { dayOfWeek: 0, time: "", venue: "" };
  }
};

const moveToPlayers = async (gameId, playerUid) => {
  const game = adminStore.allGames.find((g) => g.id === gameId);
  const player = game?.waitlist?.find((p) => p.uid === playerUid);

  if (!player) return;

  const alert = await alertController.create({
    header: "Move to Active",
    message: `Move ${player.name} to the active roster?`,
    buttons: [
      { text: "Cancel", role: "cancel" },
      {
        text: "Move",
        handler: async () => {
          const result = await adminStore.movePlayerFromWaitlist(
            gameId,
            playerUid
          );
          const toast = await toastController.create({
            message: result.success ? "Player moved!" : result.error,
            duration: 2000,
            color: result.success ? "success" : "danger",
          });
          await toast.present();
          if (result.success) await loadGames();
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

  const alert = await alertController.create({
    header: "Remove Player",
    message: `Remove ${player.name} from the ${
      fromWaitlist ? "waitlist" : "roster"
    }?`,
    buttons: [
      { text: "Cancel", role: "cancel" },
      {
        text: "Remove",
        role: "destructive",
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
          if (result.success) await loadGames();
        },
      },
    ],
  });

  await alert.present();
};

const markAsPlayed = async (gameId) => {
  const alert = await alertController.create({
    header: "Mark Game Played",
    message: "This will update all player stats. Continue?",
    buttons: [
      { text: "Cancel", role: "cancel" },
      {
        text: "Confirm",
        handler: async () => {
          const result = await adminStore.markGameAsPlayed(gameId);
          const toast = await toastController.create({
            message: result.success ? "Game marked as played!" : result.error,
            duration: 2000,
            color: result.success ? "success" : "danger",
          });
          await toast.present();
          if (result.success) await loadGames();
        },
      },
    ],
  });

  await alert.present();
};

const formatDateDay = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("T")[0].split("-");
  return parseInt(parts[2]);
};

const formatDateMonth = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("T")[0].split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "short" });
};

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatCompletedDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
/* ========================================
   Admin Page - Apple-Inspired Light Theme
   ======================================== */

.admin-page {
  min-height: 100%;
  background: var(--bg-secondary);
}

/* ========================================
   Hero Section - Clean Light Design
   ======================================== */

.admin-hero {
  background: var(--bg-primary);
  padding: var(--space-xl) var(--space-md) var(--space-lg);
  text-align: center;
  border-bottom: 1px solid var(--separator-color);
}

.hero-content {
  margin-bottom: var(--space-lg);
}

.admin-avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: var(--accent-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  position: relative;
  box-shadow: var(--shadow-sm);
}

.admin-avatar > ion-icon {
  font-size: 28px;
  color: var(--accent-color);
}

.admin-type-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-primary);
  box-shadow: var(--shadow-xs);
}

.admin-type-badge ion-icon {
  font-size: 12px;
  color: white;
}

.admin-type-badge.super {
  background: linear-gradient(180deg, #ff9500 0%, #ff7b00 100%);
}

.admin-type-badge.city {
  background: linear-gradient(180deg, #007aff 0%, #0056b3 100%);
}

.admin-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
  letter-spacing: -0.02em;
}

.admin-subtitle {
  font-size: 15px;
  color: var(--text-tertiary);
  margin: 0 0 var(--space-sm);
}

.admin-role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
}

.admin-role-badge.super {
  background: rgba(255, 149, 0, 0.12);
  color: #cc7700;
}

.admin-role-badge.city {
  background: var(--accent-color-light);
  color: var(--accent-color);
}

/* ========================================
   Quick Stats - Apple Widget Style
   ======================================== */

.quick-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  padding: 0 var(--space-sm);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  min-width: 70px;
  transition: all var(--transition-fast);
}

.stat-item:hover {
  background: var(--bg-tertiary);
}

.stat-item:active {
  transform: scale(0.97);
}

.stat-item ion-icon {
  font-size: 20px;
  color: var(--accent-color);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0;
  font-weight: 500;
}

/* ========================================
   Tabs - Apple Segment Style
   ======================================== */

.tabs-container {
  padding: var(--space-md);
  background: var(--bg-secondary);
  position: sticky;
  top: 0;
  z-index: 10;
}

ion-segment {
  --background: var(--fill-tertiary);
  border-radius: var(--radius-sm);
  padding: 2px;
}

ion-segment-button {
  --color: var(--text-secondary);
  --color-checked: var(--text-primary);
  --indicator-color: transparent;
  --border-radius: 6px;
  min-height: 32px;
  font-size: 13px;
  font-weight: 500;
  text-transform: none;
}

ion-segment-button::part(indicator-background) {
  background: var(--card-bg);
  box-shadow: var(--shadow-xs);
}

/* ========================================
   Tab Content
   ======================================== */

.tab-content {
  padding: 0 var(--space-md) var(--space-xl);
}

.tab-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   Section Header
   ======================================== */

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.user-count {
  font-size: 15px;
  color: var(--text-tertiary);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--card-bg);
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 14px;
  color: var(--accent-color);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-xs);
}

.refresh-btn:hover {
  background: var(--bg-tertiary);
}

.refresh-btn:active {
  transform: scale(0.97);
}

.refresh-btn ion-icon {
  font-size: 18px;
}

.refresh-btn ion-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ========================================
   Games Grid
   ======================================== */

.games-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.game-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.game-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: 1px solid var(--separator-color);
}

.game-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
  padding: var(--space-sm);
  background: var(--accent-color);
  border-radius: var(--radius-sm);
}

.game-date .date-day {
  font-size: 22px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.game-date .date-month {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  font-weight: 500;
}

.game-info {
  flex: 1;
}

.game-info h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.game-info p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

.game-badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.game-badges ion-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
}

/* ========================================
   Player Section
   ======================================== */

.player-section {
  padding: var(--space-md);
  border-bottom: 1px solid var(--separator-color);
}

.player-section.waitlist {
  background: rgba(255, 149, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--space-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0;
}

.section-title ion-icon {
  font-size: 16px;
}

.player-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.player-chip {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--fill-tertiary);
  border-radius: var(--radius-full);
  padding: 4px 10px 4px 4px;
}

.player-chip.waitlist {
  background: rgba(255, 149, 0, 0.1);
}

.player-initials {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #007aff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.player-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.player-position {
  font-size: 13px;
  color: var(--text-tertiary);
}

.promote-btn,
.remove-btn {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.promote-btn {
  background: var(--color-success);
  color: white;
}

.promote-btn:hover {
  opacity: 0.85;
}

.promote-btn:active {
  transform: scale(0.92);
}

.remove-btn {
  background: transparent;
  color: var(--color-danger);
}

.remove-btn:hover {
  background: rgba(255, 59, 48, 0.1);
}

.promote-btn ion-icon,
.remove-btn ion-icon {
  font-size: 14px;
}

/* ========================================
   Game Actions
   ======================================== */

.game-actions {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 12px var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn ion-icon {
  font-size: 18px;
}

.action-btn.primary {
  background: var(--accent-color);
  color: white;
}

.action-btn.primary:hover {
  background: var(--accent-color-hover);
}

.action-btn.success {
  background: var(--color-success);
  color: white;
}

.action-btn.success:hover {
  opacity: 0.9;
}

.action-btn.warning {
  background: var(--color-warning);
  color: white;
}

.action-btn.danger {
  background: var(--color-danger);
  color: white;
}

.action-btn.danger:hover {
  opacity: 0.9;
}

.action-btn.small {
  flex: 0;
  padding: 8px 12px;
  font-size: 14px;
}

.action-btn.full-width {
  width: 100%;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ========================================
   Search Box - Apple Style
   ======================================== */

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 10px var(--space-md);
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-xs);
}

.search-box ion-icon {
  font-size: 20px;
  color: var(--text-tertiary);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 17px;
}

.search-box input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  background: var(--fill-tertiary);
  border: none;
  padding: 4px;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn ion-icon {
  font-size: 16px;
}

/* ========================================
   Users List
   ======================================== */

.users-list {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: background var(--transition-fast);
  border-bottom: 1px solid var(--separator-color);
}

.user-card:last-child {
  border-bottom: none;
}

.user-card:hover {
  background: var(--fill-tertiary);
}

.user-card:active {
  background: var(--bg-tertiary);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #007aff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: white;
  position: relative;
  flex-shrink: 0;
}

.admin-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #ff9500 0%, #ff7b00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--card-bg);
}

.admin-indicator ion-icon {
  font-size: 8px;
  color: white;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  display: flex;
  gap: var(--space-xs);
}

.position-tag,
.level-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--fill-tertiary);
  color: var(--text-secondary);
  font-weight: 500;
}

.user-badge {
  flex-shrink: 0;
}

.user-badge ion-badge {
  font-size: 12px;
}

.chevron {
  font-size: 20px;
  color: var(--text-quaternary);
  flex-shrink: 0;
}

/* ========================================
   Schedules Grid
   ======================================== */

.schedules-grid {
  display: grid;
  gap: var(--space-sm);
}

.schedule-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--color-success);
}

.schedule-card.inactive {
  border-left-color: var(--text-quaternary);
  opacity: 0.6;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-sm);
}

.schedule-day .day-name {
  display: block;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.schedule-day .day-time {
  display: block;
  font-size: 15px;
  color: var(--text-secondary);
}

.schedule-venue {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.schedule-venue ion-icon {
  font-size: 18px;
  color: var(--text-tertiary);
}

.schedule-actions {
  display: flex;
  gap: var(--space-sm);
}

/* ========================================
   Add Schedule Section
   ======================================== */

.add-schedule-section {
  margin-top: var(--space-lg);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.section-title-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--separator-color);
}

.section-title-bar ion-icon {
  font-size: 22px;
  color: var(--accent-color);
}

.section-title-bar h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.add-schedule-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input,
.form-group select {
  background: var(--bg-secondary);
  border: 1px solid var(--separator-color);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 17px;
  transition: border-color var(--transition-fast);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-color);
}

.form-group input::placeholder {
  color: var(--text-tertiary);
}

.form-group select {
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238e8e93' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

/* ========================================
   History List
   ======================================== */

.history-list {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.history-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-md);
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--separator-color);
}

.history-card:last-child {
  border-bottom: none;
}

.history-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
  padding: var(--space-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.history-date .date-day {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.history-date .date-month {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  font-weight: 500;
}

.history-info h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.history-info p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-xs);
}

.history-stats {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.history-stats ion-badge {
  font-size: 12px;
}

.completed-date {
  font-size: 13px;
  color: var(--text-tertiary);
}

.expand-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--fill-tertiary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.expand-btn:hover {
  background: var(--bg-tertiary);
}

.expand-btn:active {
  transform: scale(0.92);
}

.history-players {
  grid-column: 1 / -1;
  padding-top: var(--space-md);
  margin-top: var(--space-xs);
  border-top: 1px solid var(--separator-color);
}

.players-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.history-player {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--fill-tertiary);
  border-radius: var(--radius-full);
  padding: 4px 12px 4px 4px;
  font-size: 14px;
  color: var(--text-primary);
}

.player-initials.small {
  width: 24px;
  height: 24px;
  font-size: 10px;
}

/* ========================================
   Empty State
   ======================================== */

.empty-state {
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  color: var(--text-tertiary);
}

.empty-state.small {
  padding: var(--space-lg) var(--space-md);
}

.empty-state ion-icon {
  font-size: 48px;
  margin-bottom: var(--space-md);
  color: var(--text-quaternary);
}

.empty-state h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-xs);
}

.empty-state p {
  font-size: 15px;
  margin: 0;
  color: var(--text-secondary);
}

/* ========================================
   Loading Overlay
   ======================================== */

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

/* ========================================
   Responsive
   ======================================== */

@media (min-width: 768px) {
  .admin-hero {
    padding: var(--space-xl) var(--space-lg);
  }

  .admin-avatar {
    width: 88px;
    height: 88px;
  }

  .admin-avatar > ion-icon {
    font-size: 36px;
  }

  .admin-title {
    font-size: 28px;
  }

  .quick-stats {
    max-width: 500px;
    margin: 0 auto;
  }

  .tabs-container {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-lg) var(--space-md);
  }

  .tab-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 var(--space-lg) var(--space-xl);
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }

  .schedules-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (min-width: 1024px) {
  .tab-content {
    max-width: 1100px;
  }
}
</style>
