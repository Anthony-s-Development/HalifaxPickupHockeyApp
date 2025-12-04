<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Payment Cancelled</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="cancel-page">
        <div class="cancel-container">
          <div class="cancel-icon">
            <ion-icon :icon="closeCircleOutline"></ion-icon>
          </div>

          <h1>Payment Cancelled</h1>
          <p class="cancel-message">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <p class="mobile-note">
            Using the mobile app? Close this window using the <strong>X</strong> in the top left corner to return to the app.
          </p>

          <div class="action-buttons">
            <ion-button expand="block" @click="goToProfile">
              <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
              Try Again
            </ion-button>
            <ion-button expand="block" fill="outline" @click="goToSchedule">
              <ion-icon :icon="homeOutline" slot="start"></ion-icon>
              Back to Home
            </ion-button>
          </div>

          <p class="help-text">
            Having trouble? Contact us for assistance.
          </p>
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
} from '@ionic/vue';
import {
  closeCircleOutline,
  refreshOutline,
  homeOutline,
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const cityId = ref('halifax');

onMounted(() => {
  // Get cityId from route or default
  cityId.value = route.params.cityId || 'halifax';
});

const goToProfile = () => {
  router.push(`/${cityId.value}/profile`);
};

const goToSchedule = () => {
  router.push(`/${cityId.value}`);
};
</script>

<style scoped>
.cancel-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: var(--bg-secondary);
}

.cancel-container {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.cancel-icon {
  margin-bottom: var(--space-lg);
}

.cancel-icon ion-icon {
  font-size: 80px;
  color: var(--color-warning);
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-sm);
  letter-spacing: -0.02em;
}

.cancel-message {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 var(--space-xl);
  line-height: 1.5;
}

.mobile-note {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0 0 var(--space-lg);
  line-height: 1.5;
}

.mobile-note strong {
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

ion-button {
  --border-radius: var(--radius-md);
  font-weight: 600;
}

ion-button[fill="outline"] {
  --border-color: var(--text-tertiary);
  --color: var(--text-secondary);
}

.help-text {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}
</style>
