<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Payment Complete</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="success-page">
        <div class="success-container">
          <div class="success-icon">
            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
          </div>

          <h1>Payment Successful!</h1>
          <p class="success-message">
            Thank you for your purchase! Your pass will be added to your account
            momentarily.
          </p>

          <div v-if="loading" class="loading-state">
            <ion-spinner></ion-spinner>
            <p>Processing...</p>
          </div>

          <p v-else class="processing-note">
            Your pass should appear in your profile within a few seconds.
          </p>

          <p class="mobile-note">
            Using the mobile app? Close this window using the
            <strong>X</strong> in the top left corner to return to the app.
          </p>

          <div class="action-buttons">
            <ion-button expand="block" @click="goToProfile">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              View My Pass
            </ion-button>
            <ion-button
              expand="block"
              color="primary"
              fill="outline"
              @click="goToSchedule"
            >
              <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
              View Schedule
            </ion-button>
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
  IonButton,
  IonIcon,
  IonSpinner,
  IonButtons,
} from "@ionic/vue";
import {
  checkmarkCircleOutline,
  personOutline,
  calendarOutline,
} from "ionicons/icons";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(true);
const cityId = ref("halifax");

onMounted(async () => {
  // Get cityId from route or default
  cityId.value = route.params.cityId || "halifax";

  // Refresh user profile to get updated pass info
  if (authStore.user) {
    try {
      await authStore.loadUserProfile(authStore.user.uid);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  // Always stop loading after a short delay - the pass will appear when the webhook processes
  loading.value = false;
});

const goToProfile = () => {
  router.replace(`/${cityId.value}/profile`);
};

const goToSchedule = () => {
  router.replace(`/${cityId.value}`);
};
</script>

<style scoped>
.success-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: var(--bg-secondary);
}

.success-container {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.success-icon {
  margin-bottom: var(--space-lg);
}

.success-icon ion-icon {
  font-size: 80px;
  color: var(--color-success);
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-sm);
  letter-spacing: -0.02em;
}

.success-message {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-xl);
  line-height: 1.5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  color: var(--text-tertiary);
}

.loading-state p {
  font-size: 14px;
  margin: 0;
}

.processing-note {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0 0 var(--space-lg);
  font-style: italic;
}

.mobile-note {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0 0 var(--space-lg);
  line-height: 1.5;
  font-weight: 800;
}

.mobile-note strong {
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

ion-button {
  --border-radius: var(--radius-md);
  font-weight: 600;
}

ion-button[fill="outline"] {
  --border-color: var(--accent-color);
  --color: var(--accent-color);
}
</style>
