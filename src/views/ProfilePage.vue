<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/${cityId}`"></ion-back-button>
        </ion-buttons>
        <ion-title>Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="confirmLogout" color="medium">
            <ion-icon
              color="danger"
              :icon="logOutOutline"
              slot="icon-only"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="authStore.userProfile" class="profile-page">
        <!-- Hero Header -->
        <div class="profile-hero">
          <div class="hero-content">
            <div class="avatar">
              <span class="avatar-initials">{{ userInitials }}</span>
              <div class="position-badge" :class="positionClass">
                <ion-icon :icon="positionIcon"></ion-icon>
              </div>
            </div>
            <h1 class="user-name">{{ authStore.userProfile.name }}</h1>
            <p class="user-email">{{ authStore.userProfile.email }}</p>
            <div
              class="skill-badge"
              :class="`skill-${authStore.userProfile.skillLevel}`"
            >
              Skill Level {{ authStore.userProfile.skillLevel }}
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-item">
              <ion-icon :icon="diceOutline"></ion-icon>
              <span class="stat-value">{{ cityGamesPlayed }}</span>
              <span class="stat-label">Games Played</span>
            </div>
            <div class="stat-item" :class="passStatusClass">
              <ion-icon :icon="ticketOutline"></ion-icon>
              <span class="stat-value">{{ passStatusValue }}</span>
              <span class="stat-label">Skate Passes</span>
            </div>
            <!-- <div class="stat-item">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <span class="stat-value">{{ regularNightsCount }}</span>
              <span class="stat-label">Regular</span>
            </div> -->
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <ion-segment v-model="activeTab" mode="ios">
            <ion-segment-button value="overview">
              <ion-label>Overview</ion-label>
            </ion-segment-button>
            <ion-segment-button value="pass">
              <ion-label>My Passes</ion-label>
            </ion-segment-button>
            <ion-segment-button value="purchase">
              <ion-label>Purchase</ion-label>
            </ion-segment-button>
            <ion-segment-button value="schedule">
              <ion-label>Schedule</ion-label>
            </ion-segment-button>
            <ion-segment-button value="history">
              <ion-label>History</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Overview Tab -->
          <div v-show="activeTab === 'overview'" class="tab-panel">
            <div class="section-grid">
              <!-- Player Info Card -->
              <div class="info-card">
                <div class="card-header">
                  <ion-icon :icon="personOutline"></ion-icon>
                  <h3>Player Info</h3>
                </div>
                <div class="info-row">
                  <span class="info-label">Position</span>
                  <span class="info-value">
                    {{ authStore.userProfile.position }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">City</span>
                  <span class="info-value">{{
                    cityStore.currentCity?.name || "Not Set"
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Member Since</span>
                  <span class="info-value">{{ memberSince }}</span>
                </div>
              </div>

              <!-- Skill Level Card -->
              <div class="info-card skill-card">
                <div class="card-header">
                  <ion-icon :icon="trophyOutline"></ion-icon>
                  <h3>Skill Level</h3>
                </div>
                <div class="skill-selector">
                  <button
                    v-for="level in skillLevels"
                    :key="level.value"
                    class="skill-option"
                    :class="{
                      active: authStore.userProfile.skillLevel === level.value,
                    }"
                    @click="updateSkillLevel(level.value)"
                  >
                    <span class="level-number">{{ level.value }}</span>
                    <span class="level-name">{{ level.name }}</span>
                  </button>
                </div>
                <p class="skill-description">
                  {{ currentSkillDescription }}
                </p>
              </div>
            </div>
          </div>

          <!-- Pass Tab -->
          <div v-show="activeTab === 'pass'" class="tab-panel">
            <!-- Active Passes -->
            <div v-if="activePasses.length > 0" class="passes-section">
              <h3 class="section-title">Active Passes</h3>
              <div class="passes-list">
                <div
                  v-for="pass in activePasses"
                  :key="pass.id"
                  class="pass-card"
                >
                  <div class="pass-content">
                    <div class="pass-header">
                      <ion-icon
                        :icon="ticketOutline"
                        class="pass-icon"
                      ></ion-icon>
                      <div class="pass-title">
                        <h3>{{ getPassTypeName(pass.type) }}</h3>
                        <span class="pass-valid">Valid for all cities</span>
                      </div>
                    </div>

                    <div class="pass-details">
                      <div
                        v-if="pass.type !== 'full-season'"
                        class="pass-meter"
                      >
                        <div class="meter-label">
                          <span>Games Remaining</span>
                          <span
                            class="meter-value"
                            :class="{ danger: pass.gamesRemaining === 0 }"
                          >
                            {{ pass.gamesRemaining }} / {{ pass.gamesTotal }}
                          </span>
                        </div>
                        <div class="meter-bar">
                          <div
                            class="meter-fill"
                            :style="{
                              width:
                                (pass.gamesRemaining / pass.gamesTotal) * 100 +
                                '%',
                            }"
                          ></div>
                        </div>
                      </div>
                      <div v-else class="unlimited-badge">
                        <ion-icon :icon="infiniteOutline"></ion-icon>
                        <span>Unlimited Games</span>
                      </div>

                      <div class="pass-date">
                        <ion-icon :icon="calendarOutline"></ion-icon>
                        <span
                          >Purchased
                          {{ formatPassDate(pass.purchaseDate) }}</span
                        >
                      </div>

                      <button
                        v-if="pass.usageHistory && pass.usageHistory.length > 0"
                        class="usage-button"
                        @click="toggleUsageHistory(pass.id)"
                      >
                        <ion-icon
                          :icon="
                            expandedPass === pass.id
                              ? chevronUpOutline
                              : chevronDownOutline
                          "
                        ></ion-icon>
                        View Usage History ({{ pass.usageHistory.length }})
                      </button>

                      <div
                        v-if="expandedPass === pass.id && pass.usageHistory"
                        class="usage-history"
                      >
                        <div
                          v-for="(usage, idx) in pass.usageHistory"
                          :key="idx"
                          class="usage-item"
                        >
                          <div class="usage-number">{{ idx + 1 }}</div>
                          <div class="usage-details">
                            <span class="usage-venue">{{ usage.venue }}</span>
                            <span class="usage-date">{{
                              formatPassDate(usage.date)
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pass History (Exhausted) -->
            <div
              v-if="exhaustedPasses.length > 0"
              class="passes-section history-section"
            >
              <button
                class="section-toggle"
                @click="showPassHistory = !showPassHistory"
              >
                <h3 class="section-title">
                  Pass History ({{ exhaustedPasses.length }})
                </h3>
                <ion-icon
                  :icon="
                    showPassHistory ? chevronUpOutline : chevronDownOutline
                  "
                ></ion-icon>
              </button>

              <div v-if="showPassHistory" class="passes-list exhausted">
                <div
                  v-for="pass in exhaustedPasses"
                  :key="pass.id"
                  class="pass-card exhausted"
                >
                  <div class="pass-content">
                    <div class="pass-header">
                      <ion-icon
                        :icon="ticketOutline"
                        class="pass-icon exhausted"
                      ></ion-icon>
                      <div class="pass-title">
                        <h3>{{ getPassTypeName(pass.type) }}</h3>
                        <span class="pass-exhausted-badge">Exhausted</span>
                      </div>
                    </div>

                    <div class="pass-date">
                      <ion-icon :icon="calendarOutline"></ion-icon>
                      <span>{{ formatPassDate(pass.purchaseDate) }}</span>
                    </div>

                    <button
                      v-if="pass.usageHistory && pass.usageHistory.length > 0"
                      class="usage-button"
                      @click="toggleUsageHistory(pass.id)"
                    >
                      <ion-icon
                        :icon="
                          expandedPass === pass.id
                            ? chevronUpOutline
                            : chevronDownOutline
                        "
                      ></ion-icon>
                      View Usage History ({{ pass.usageHistory.length }})
                    </button>

                    <div
                      v-if="expandedPass === pass.id && pass.usageHistory"
                      class="usage-history"
                    >
                      <div
                        v-for="(usage, idx) in pass.usageHistory"
                        :key="idx"
                        class="usage-item"
                      >
                        <div class="usage-number">{{ idx + 1 }}</div>
                        <div class="usage-details">
                          <span class="usage-venue">{{ usage.venue }}</span>
                          <span class="usage-date">{{
                            formatPassDate(usage.date)
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Passes Message -->
            <div v-if="allPasses.length === 0" class="no-passes-message">
              <ion-icon :icon="ticketOutline" class="no-pass-icon"></ion-icon>
              <h3>No Active Pass</h3>
              <p>Go to the Purchase tab to buy a pass!</p>
            </div>
          </div>

          <!-- Purchase Tab -->
          <div v-show="activeTab === 'purchase'" class="tab-panel">
            <div class="purchase-section">
              <h3 class="purchase-header">
                <ion-icon :icon="cardOutline"></ion-icon>
                Purchase Skate Passes
              </h3>
              <p class="purchase-subtitle">
                Choose a pass that works for you. All passes are valid at any
                location.
              </p>
              <div class="pass-purchase-grid">
                <div
                  v-for="pass in availablePasses"
                  :key="pass.type"
                  class="purchase-card"
                  :class="{ featured: pass.type === '10-game' }"
                >
                  <div v-if="pass.type === '10-game'" class="featured-badge">
                    Best Value
                  </div>
                  <div class="purchase-card-header">
                    <ion-icon :icon="ticketOutline"></ion-icon>
                    <h4>{{ pass.name }}</h4>
                  </div>
                  <div class="purchase-card-price">
                    <span class="price-amount">${{ pass.price }}</span>
                  </div>
                  <p class="purchase-card-games">
                    {{ pass.games === "Unlimited" ? "Unlimited" : pass.games }}
                    game{{
                      pass.games !== 1 && pass.games !== "Unlimited" ? "s" : ""
                    }}
                  </p>
                  <p class="purchase-card-desc">{{ pass.description }}</p>
                  <ion-button
                    expand="block"
                    :disabled="
                      paymentStore.loading && purchasingPassType === pass.type
                    "
                    @click="buyPass(pass.type)"
                    class="purchase-button"
                  >
                    <ion-spinner
                      v-if="
                        paymentStore.loading && purchasingPassType === pass.type
                      "
                      name="crescent"
                      slot="start"
                    ></ion-spinner>
                    <span v-else>Buy Now</span>
                  </ion-button>
                </div>
              </div>
              <p class="payment-note">
                <ion-icon :icon="cardOutline"></ion-icon>
                Secure payment via Stripe. Supports credit cards and Apple Pay.
              </p>
            </div>
          </div>

          <!-- Schedule Tab -->
          <div v-show="activeTab === 'schedule'" class="tab-panel">
            <div class="schedule-header">
              <h3>Regular Nights</h3>
              <p class="schedule-city">
                {{ cityStore.currentCity?.name || "Current City" }}
              </p>
            </div>

            <div v-if="citySchedules.length > 0" class="schedule-list">
              <div
                v-for="schedule in citySchedules"
                :key="schedule.id"
                class="schedule-item"
                :class="{ regular: isRegularForSchedule(schedule.id) }"
              >
                <div class="schedule-day">
                  <span class="day-name">{{ schedule.dayName }}</span>
                  <span class="day-time">{{ formatTime(schedule.time) }}</span>
                </div>
                <div class="schedule-venue">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  {{ schedule.venue }}
                </div>
                <div class="schedule-status">
                  <ion-badge
                    :color="
                      isRegularForSchedule(schedule.id) ? 'success' : 'medium'
                    "
                  >
                    {{
                      isRegularForSchedule(schedule.id)
                        ? "Regular"
                        : "Not Regular"
                    }}
                  </ion-badge>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <p>No schedules available for this city</p>
            </div>

            <p class="schedule-note">
              <ion-icon :icon="informationCircleOutline"></ion-icon>
              Contact an admin to modify your regular status
            </p>
          </div>

          <!-- History Tab -->
          <div v-show="activeTab === 'history'" class="tab-panel">
            <div v-if="filteredGameHistory.length > 0" class="history-list">
              <div
                v-for="(game, index) in sortedGameHistory"
                :key="index"
                class="history-item"
              >
                <div class="history-date">
                  <span class="date-day">{{
                    formatHistoryDay(game.date)
                  }}</span>
                  <span class="date-month">{{
                    formatHistoryMonth(game.date)
                  }}</span>
                </div>
                <div class="history-details">
                  <span class="history-venue">{{ game.venue }}</span>
                  <span class="history-time">{{ formatTime(game.time) }}</span>
                </div>
                <ion-badge
                  :color="game.status === 'played' ? 'success' : 'warning'"
                >
                  {{ game.status === "played" ? "Played" : "Confirmed" }}
                </ion-badge>
              </div>
            </div>

            <div v-else class="empty-state">
              <ion-icon :icon="gameControllerOutline"></ion-icon>
              <h3>No Games Yet</h3>
              <p>Check in for your first game!</p>
            </div>
          </div>
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
  IonButton,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonIcon,
  IonSpinner,
  toastController,
  alertController,
} from "@ionic/vue";
import {
  logOutOutline,
  personOutline,
  trophyOutline,
  ticketOutline,
  calendarOutline,
  gameControllerOutline,
  locationOutline,
  informationCircleOutline,
  infiniteOutline,
  shieldOutline,
  fitnessOutline,
  handLeftOutline,
  chevronUpOutline,
  chevronDownOutline,
  cardOutline,
  diceOutline,
} from "ionicons/icons";
import { computed, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCityStore } from "@/stores/city";
import { useGameStore } from "@/stores/game";
import { usePaymentStore, PASS_PRICES } from "@/stores/payment";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cityStore = useCityStore();
const gameStore = useGameStore();
const paymentStore = usePaymentStore();

const activeTab = ref("overview");
const purchasingPassType = ref(null);
const expandedPass = ref(null);
const showPassHistory = ref(false);

// Skill levels configuration
const skillLevels = [
  {
    value: 1,
    name: "Beginner",
    description:
      "Basic skating ability but struggles with backward skating and crossovers",
  },
  {
    value: 2,
    name: "Intermediate",
    description:
      "A good mix of basic skills, decent knowledge of the game, and athletic ability",
  },
  {
    value: 3,
    name: "Advanced",
    description:
      "Advanced skills, strong physical shape, and a high understanding of the game",
  },
];

// Computed properties
const cityId = computed(() => route.params.cityId);

const userInitials = computed(() => {
  const name = authStore.userProfile?.name || "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const positionClass = computed(() => {
  const pos = authStore.userProfile?.position?.toLowerCase();
  return pos === "goalie"
    ? "goalie"
    : pos === "defense"
    ? "defense"
    : "forward";
});

const positionIcon = computed(() => {
  const pos = authStore.userProfile?.position?.toLowerCase();
  if (pos === "goalie") return handLeftOutline;
  if (pos === "defense") return shieldOutline;
  return fitnessOutline;
});

const cityGamesPlayed = computed(() =>
  authStore.getCityGamesPlayed(cityId.value)
);

const passInfo = computed(() => authStore.getPassInfo());

// Multi-pass computed properties
const allPasses = computed(() => authStore.getAllPasses());
const activePasses = computed(() => authStore.getActivePasses());
const exhaustedPasses = computed(() =>
  allPasses.value.filter((p) => p.status === "exhausted")
);

const passStatusClass = computed(() => {
  const active = activePasses.value;
  if (active.length === 0) return "no-pass";
  if (active.some((p) => p.type === "full-season")) return "unlimited";
  const totalRemaining = authStore.getTotalGamesRemaining();
  if (totalRemaining === 0) return "expired";
  return "active";
});

const passStatusValue = computed(() => {
  const active = activePasses.value;
  if (active.length === 0) return "None";
  if (active.some((p) => p.type === "full-season")) return "∞";
  return authStore.getTotalGamesRemaining();
});

const passTypeName = computed(() => {
  const types = {
    "5-game": "5 Game Pass",
    "10-game": "10 Game Pass",
    "full-season": "Full Season Pass",
  };
  return types[passInfo.value.passType] || "Unknown";
});

const passPercentage = computed(() => {
  if (!passInfo.value.passType || passInfo.value.passType === "full-season")
    return 100;
  const total = passInfo.value.passType === "5-game" ? 5 : 10;
  return (passInfo.value.passGamesRemaining / total) * 100;
});

const regularNightsCount = computed(() => {
  return citySchedules.value.filter((s) => isRegularForSchedule(s.id)).length;
});

const citySchedules = computed(() => {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const schedules = gameStore.gameSchedules;

  return Object.entries(schedules)
    .map(([id, schedule]) => ({
      id,
      dayName: dayNames[schedule.day],
      day: schedule.day,
      time: schedule.time,
      venue: schedule.venue,
    }))
    .sort((a, b) => a.day - b.day);
});

const currentSkillDescription = computed(() => {
  const level = skillLevels.find(
    (l) => l.value === authStore.userProfile?.skillLevel
  );
  return level?.description || "Not set";
});

const memberSince = computed(() => {
  const date = authStore.userProfile?.createdAt;
  if (!date) return "Unknown";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
});

const filteredGameHistory = computed(() => {
  const history = authStore.userProfile?.gameHistory || [];
  return history.filter((game) => !game.cityId || game.cityId === cityId.value);
});

const sortedGameHistory = computed(() => {
  return [...filteredGameHistory.value].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
});

const availablePasses = computed(() => paymentStore.getAvailablePasses());

// Methods
const isRegularForSchedule = (scheduleId) => {
  return authStore.isRegularForSchedule(scheduleId, cityId.value);
};

// Multi-pass methods
const getPassTypeName = (passType) => {
  const types = {
    "1-game": "1 Game Pass",
    "5-game": "5 Game Pass",
    "10-game": "10 Game Pass",
    "full-season": "Full Season Pass",
  };
  return types[passType] || "Unknown";
};

const toggleUsageHistory = (passId) => {
  expandedPass.value = expandedPass.value === passId ? null : passId;
};

const updateSkillLevel = async (newLevel) => {
  if (authStore.userProfile?.skillLevel === newLevel) return;

  const result = await authStore.updateUserProfile({ skillLevel: newLevel });
  const toast = await toastController.create({
    message: result.success ? "Skill level updated!" : "Failed to update",
    duration: 2000,
    color: result.success ? "success" : "danger",
  });
  await toast.present();
};

const confirmLogout = async () => {
  const alert = await alertController.create({
    header: "Logout",
    message: "Are you sure you want to logout?",
    buttons: [
      { text: "Cancel", role: "cancel" },
      {
        text: "Logout",
        role: "destructive",
        handler: handleLogout,
      },
    ],
  });
  await alert.present();
};

const handleLogout = async () => {
  const result = await authStore.logout();
  if (result.success) {
    const toast = await toastController.create({
      message: "Logged out successfully!",
      duration: 2000,
      color: "success",
    });
    await toast.present();
    router.push("/");
  }
};

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatPassDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatHistoryDay = (dateString) => {
  return new Date(dateString).getDate();
};

const formatHistoryMonth = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short" });
};

const buyPass = async (passType) => {
  purchasingPassType.value = passType;
  const result = await paymentStore.initiateCheckout(passType, cityId.value);
  if (!result.success) {
    const toast = await toastController.create({
      message: result.error || "Failed to initiate checkout",
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
  purchasingPassType.value = null;
};

// Lifecycle
onMounted(async () => {
  if (cityId.value) {
    await cityStore.setCurrentCity(cityId.value);
    gameStore.setCurrentCity(cityId.value);
    await gameStore.subscribeToSchedules(cityId.value);
  }
});
</script>

<style scoped>
/* ========================================
   Profile Page - Apple-Inspired Light Theme
   ======================================== */

.profile-page {
  min-height: 100%;
  background: var(--bg-secondary);
}

/* ========================================
   Hero Section
   ======================================== */

.profile-hero {
  background: var(--bg-primary);
  padding: var(--space-xl) var(--space-md) var(--space-lg);
  text-align: center;
  border-bottom: 1px solid var(--separator-color);
}

.hero-content {
  margin-bottom: var(--space-lg);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #007aff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  position: relative;
  box-shadow: var(--shadow-sm);
}

.avatar-initials {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.position-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-primary);
  box-shadow: var(--shadow-xs);
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

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
  letter-spacing: -0.02em;
}

.user-email {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-sm);
}

.skill-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.skill-badge.skill-1 {
  background: linear-gradient(180deg, #8e8e93 0%, #636366 100%);
}

.skill-badge.skill-2 {
  background: linear-gradient(180deg, #007aff 0%, #0056b3 100%);
}

.skill-badge.skill-3 {
  background: linear-gradient(180deg, #34c759 0%, #28a745 100%);
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
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  min-width: 80px;
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

.stat-item.no-pass .stat-value {
  color: var(--text-tertiary);
}
.stat-item.expired .stat-value {
  color: var(--color-danger);
}
.stat-item.unlimited .stat-value {
  color: var(--color-success);
}
.stat-item.active .stat-value {
  color: var(--accent-color);
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
   Section Grid
   ======================================== */

.section-grid {
  display: grid;
  gap: var(--space-md);
}

/* ========================================
   Info Card
   ======================================== */

.info-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--separator-color);
}

.card-header ion-icon {
  font-size: 20px;
  color: var(--accent-color);
}

.card-header h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--separator-color);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 15px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.position-icon {
  font-size: 18px;
  color: var(--accent-color);
}

/* ========================================
   Skill Card
   ======================================== */

.skill-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.skill-option {
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.skill-option:hover {
  background: var(--bg-tertiary);
}

.skill-option:active {
  transform: scale(0.97);
}

.skill-option.active {
  border-color: var(--accent-color);
  background: var(--accent-color-light);
}

.level-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.level-name {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  font-weight: 500;
}

.skill-option.active .level-number {
  color: var(--accent-color);
}
.skill-option.active .level-name {
  color: var(--accent-color);
}

.skill-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* ========================================
   Pass Card
   ======================================== */

.pass-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.pass-content {
  padding: var(--space-lg);
}

.pass-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.pass-icon {
  font-size: 40px;
  color: var(--accent-color);
}

.pass-title h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 2px;
  color: var(--text-primary);
}

.pass-valid {
  font-size: 14px;
  color: var(--color-success);
  font-weight: 500;
}

.pass-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.pass-meter {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.meter-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  font-size: 15px;
  color: var(--text-secondary);
}

.meter-value {
  font-weight: 600;
  color: var(--accent-color);
}

.meter-value.danger {
  color: var(--color-danger);
}

.meter-bar {
  height: 8px;
  background: var(--fill-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), #5aa5ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.unlimited-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: rgba(52, 199, 89, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-success);
  font-weight: 600;
  font-size: 15px;
}

.unlimited-badge ion-icon {
  font-size: 22px;
}

.pass-date {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 14px;
  color: var(--text-tertiary);
}

.pass-date ion-icon {
  font-size: 16px;
}

/* ========================================
   No Pass State
   ======================================== */

.no-pass-content {
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
}

.no-pass-icon {
  font-size: 48px;
  color: var(--text-quaternary);
  margin-bottom: var(--space-md);
}

.no-pass-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-xs);
}

.no-pass-content p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-lg);
}

.pass-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.pass-option {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 12px var(--space-sm);
  text-align: center;
  transition: all var(--transition-fast);
}

.pass-option:hover {
  background: var(--bg-tertiary);
}

.pass-option.featured {
  background: var(--accent-color-light);
  border: 1px solid var(--accent-color);
}

.option-name {
  display: block;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.option-badge {
  display: block;
  font-size: 11px;
  color: var(--accent-color);
  margin-top: 4px;
  font-weight: 500;
}

/* ========================================
   Multi-Pass Styles
   ======================================== */

.passes-section {
  margin-bottom: var(--space-lg);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 var(--space-sm) var(--space-xs);
}

.passes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.passes-list.exhausted {
  margin-top: var(--space-md);
}

.pass-card.exhausted {
  opacity: 0.7;
}

.pass-card.exhausted .pass-icon {
  color: var(--text-tertiary);
}

.pass-exhausted-badge {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: none;
  padding: var(--space-sm) var(--space-xs);
  cursor: pointer;
  color: var(--text-secondary);
}

.section-toggle ion-icon {
  font-size: 18px;
  color: var(--text-tertiary);
}

.section-toggle .section-title {
  margin: 0;
}

.history-section {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--separator-color);
}

.usage-button {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  margin-top: var(--space-md);
  cursor: pointer;
  font-size: 14px;
  color: var(--accent-color);
  font-weight: 500;
  transition: background var(--transition-fast);
}

.usage-button:hover {
  background: var(--bg-tertiary);
}

.usage-button ion-icon {
  font-size: 16px;
}

.usage-history {
  margin-top: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.usage-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--separator-color);
}

.usage-item:last-child {
  border-bottom: none;
}

.usage-number {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--accent-color-light);
  color: var(--accent-color);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.usage-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.usage-venue {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.usage-date {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* ========================================
   Schedule Section
   ======================================== */

.schedule-header {
  margin-bottom: var(--space-md);
}

.schedule-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
  letter-spacing: -0.02em;
}

.schedule-city {
  font-size: 15px;
  color: var(--text-tertiary);
  margin: 0;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.schedule-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-md);
  align-items: center;
  padding: var(--space-md);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--text-quaternary);
  box-shadow: var(--shadow-xs);
}

.schedule-item.regular {
  border-left-color: var(--color-success);
}

.schedule-day {
  text-align: center;
  min-width: 70px;
}

.day-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.day-time {
  display: block;
  font-size: 13px;
  color: var(--text-tertiary);
}

.schedule-venue {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 15px;
  color: var(--text-secondary);
}

.schedule-venue ion-icon {
  font-size: 18px;
  color: var(--text-tertiary);
}

.schedule-note {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--fill-tertiary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-tertiary);
}

.schedule-note ion-icon {
  font-size: 16px;
}

/* ========================================
   History Section
   ======================================== */

.history-list {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.history-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-md);
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--separator-color);
}

.history-item:last-child {
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

.date-day {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.date-month {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  font-weight: 500;
}

.history-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-venue {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
}

.history-time {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* ========================================
   Empty State
   ======================================== */

.empty-state {
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  color: var(--text-tertiary);
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
  .profile-hero {
    padding: var(--space-xl) var(--space-lg);
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-initials {
    font-size: 32px;
  }

  .user-name {
    font-size: 28px;
  }

  .quick-stats {
    max-width: 400px;
    margin: 0 auto;
  }

  .tabs-container {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-lg) var(--space-md);
  }

  .tab-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 var(--space-lg) var(--space-xl);
  }

  .section-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .schedule-item {
    padding: var(--space-md) var(--space-lg);
  }
}

@media (min-width: 1024px) {
  .tab-content {
    max-width: 1000px;
  }

  .section-grid {
    gap: var(--space-lg);
  }

  .pass-options {
    max-width: 400px;
    margin: 0 auto;
  }
}

/* ========================================
   No Passes Message
   ======================================== */

.no-passes-message {
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.no-passes-message .no-pass-icon {
  font-size: 48px;
  color: var(--text-quaternary);
  margin-bottom: var(--space-md);
}

.no-passes-message h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-xs);
}

.no-passes-message p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

/* ========================================
   Purchase Section
   ======================================== */

.purchase-section {
  padding-bottom: var(--space-lg);
}

.purchase-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-xs);
  letter-spacing: -0.02em;
}

.purchase-header ion-icon {
  font-size: 24px;
  color: var(--accent-color);
}

.purchase-subtitle {
  text-align: center;
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-lg);
}

.pass-purchase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .pass-purchase-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.purchase-card {
  position: relative;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.purchase-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.purchase-card.featured {
  border: 2px solid var(--accent-color);
  background: var(--accent-color-light);
}

.featured-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-color);
  color: white;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.purchase-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.purchase-card-header ion-icon {
  font-size: 28px;
  color: var(--accent-color);
}

.purchase-card-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.purchase-card-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: var(--space-xs);
}

.price-amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.price-label {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.purchase-card-games {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-xs);
  font-weight: 500;
}

.purchase-card-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 0 0 var(--space-md);
  line-height: 1.3;
  flex-grow: 1;
}

.purchase-button {
  --background: var(--accent-color);
  --background-hover: var(--accent-color-hover);
  --border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  height: 36px;
}

.purchase-card.featured .purchase-button {
  --background: var(--accent-color);
}

.payment-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  background: var(--fill-tertiary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
}

.payment-note ion-icon {
  font-size: 14px;
  flex-shrink: 0;
}
</style>
