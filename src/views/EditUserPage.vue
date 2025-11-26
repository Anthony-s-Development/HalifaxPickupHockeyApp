<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit User Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="edit-user-container" v-if="user">
        <h1>{{ user.name }}</h1>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Basic Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none">
              <ion-label position="floating">Name</ion-label>
              <ion-input v-model="user.name"></ion-input>
            </ion-item>

            <ion-item lines="none">
              <ion-label position="floating">Email</ion-label>
              <ion-input v-model="user.email" type="email"></ion-input>
            </ion-item>

            <ion-item lines="none">
              <ion-label position="floating">Position</ion-label>
              <ion-select v-model="user.position" interface="popover">
                <ion-select-option value="Forward">Forward</ion-select-option>
                <ion-select-option value="Defense">Defense</ion-select-option>
                <ion-select-option value="Goalie">Goalie</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item lines="none">
              <ion-label position="floating">Games Played</ion-label>
              <ion-input
                v-model.number="user.gamesPlayed"
                type="number"
              ></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Skill Level</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-radio-group v-model="user.skillLevel">
              <ion-item lines="none">
                <ion-label class="skill-label">
                  <h2>Level 1</h2>
                  <p>
                    Basic skating ability but struggles with backward skating
                    and crossovers
                  </p>
                </ion-label>
                <ion-radio slot="end" :value="1"></ion-radio>
              </ion-item>

              <ion-item lines="none">
                <ion-label class="skill-label">
                  <h2>Level 2</h2>
                  <p>
                    A good mix of basic skills, decent knowledge of the game,
                    and athletic ability
                  </p>
                </ion-label>
                <ion-radio slot="end" :value="2"></ion-radio>
              </ion-item>

              <ion-item lines="none">
                <ion-label class="skill-label">
                  <h2>Level 3</h2>
                  <p>
                    Advanced skills, strong physical shape, and a high
                    understanding of the game
                  </p>
                </ion-label>
                <ion-radio slot="end" :value="3"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Regular Nights</ion-card-title>
            <ion-card-subtitle
              >Select which nights this player regularly
              attends</ion-card-subtitle
            >
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none">
              <ion-label>Sunday 10:30 PM - Forum</ion-label>
              <ion-checkbox
                slot="end"
                v-model="user.regulars.sunday_1030pm_forum"
              ></ion-checkbox>
            </ion-item>

            <ion-item lines="none">
              <ion-label>Monday 11:00 PM - Forum</ion-label>
              <ion-checkbox
                slot="end"
                v-model="user.regulars.monday_11pm_forum"
              ></ion-checkbox>
            </ion-item>

            <ion-item lines="none">
              <ion-label>Tuesday 10:30 PM - Forum</ion-label>
              <ion-checkbox
                slot="end"
                v-model="user.regulars.tuesday_1030pm_forum"
              ></ion-checkbox>
            </ion-item>

            <ion-item lines="none">
              <ion-label>Wednesday 10:30 PM - Forum</ion-label>
              <ion-checkbox
                slot="end"
                v-model="user.regulars.wednesday_1030pm_forum"
              ></ion-checkbox>
            </ion-item>

            <ion-item lines="none">
              <ion-label>Thursday 10:30 PM - Civic</ion-label>
              <ion-checkbox
                slot="end"
                v-model="user.regulars.thursday_1030pm_civic"
              ></ion-checkbox>
            </ion-item>

            <ion-item lines="none">
              <ion-label>Friday 10:30 PM - Forum</ion-label>
              <ion-checkbox
                slot="end"
                v-model="user.regulars.friday_1030pm_forum"
              ></ion-checkbox>
            </ion-item>

            <ion-item lines="none">
              <ion-label>Saturday 10:30 PM - Forum</ion-label>
              <ion-checkbox
                slot="end"
                v-model="user.regulars.saturday_1030pm_forum"
              ></ion-checkbox>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Permissions</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label>
                <h2>Admin Access</h2>
                <p>Grant administrative privileges to this user</p>
              </ion-label>
              <ion-toggle slot="end" v-model="user.isAdmin"></ion-toggle>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Skate Pass</ion-card-title>
            <ion-card-subtitle>Manage user's skate pass</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="floating">Pass Type</ion-label>
              <ion-select
                v-model="user.passType"
                interface="popover"
                @ionChange="handlePassTypeChange"
              >
                <ion-select-option :value="null">No Pass</ion-select-option>
                <ion-select-option value="5-game"
                  >5 Game Pass</ion-select-option
                >
                <ion-select-option value="10-game"
                  >10 Game Pass</ion-select-option
                >
                <ion-select-option value="full-season"
                  >Full Season Pass</ion-select-option
                >
              </ion-select>
            </ion-item>

            <ion-item v-if="user.passType && user.passType !== 'full-season'">
              <ion-label position="floating">Games Remaining</ion-label>
              <ion-input
                v-model.number="user.passGamesRemaining"
                type="number"
                min="0"
              ></ion-input>
            </ion-item>

            <ion-item v-if="user.passType">
              <ion-label>
                <h2>Pass Status</h2>
                <p v-if="user.passType === 'full-season'">
                  Full Season - Unlimited Games
                </p>
                <p v-else-if="user.passGamesRemaining > 0">
                  {{ user.passGamesRemaining }} games remaining
                </p>
                <p v-else style="color: var(--ion-color-danger)">
                  Pass expired - 0 games remaining
                </p>
              </ion-label>
            </ion-item>

            <ion-item v-if="user.passStartDate">
              <ion-label>
                <h2>Pass Start Date</h2>
                <p>{{ formatDate(user.passStartDate) }}</p>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <div class="button-group">
          <ion-button
            expand="block"
            @click="saveUserChanges"
            color="primary"
            size="large"
          >
            <ion-icon :icon="saveOutline" slot="start"></ion-icon>
            Save Changes
          </ion-button>
          <ion-button
            expand="block"
            @click="router.push('/admin')"
            fill="outline"
            size="large"
            color="medium"
          >
            Cancel
          </ion-button>
        </div>
      </div>

      <div v-else class="loading-container">
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonRadio,
  IonRadioGroup,
  IonCheckbox,
  IonToggle,
  IonIcon,
  IonSpinner,
  toastController,
} from "@ionic/vue";
import { saveOutline } from "ionicons/icons";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdminStore } from "@/stores/admin";

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const user = ref(null);

onMounted(async () => {
  const userId = route.params.userId;

  let foundUser = adminStore.allUsers.find((u) => u.id === userId);

  if (!foundUser) {
    await adminStore.loadAllUsers();
    foundUser = adminStore.allUsers.find((u) => u.id === userId);
  }

  if (foundUser) {
    user.value = {
      ...foundUser,
      regulars: { ...foundUser.regulars },
      passType: foundUser.passType || null,
      passGamesRemaining: foundUser.passGamesRemaining || 0,
      passStartDate: foundUser.passStartDate || null,
    };
  } else {
    const toast = await toastController.create({
      message: "User not found",
      duration: 2000,
      color: "danger",
    });
    await toast.present();
    router.push("/admin");
  }
});

const handlePassTypeChange = (event) => {
  const newPassType = event.detail.value;

  if (newPassType === "5-game") {
    user.value.passGamesRemaining = 5;
    user.value.passStartDate = new Date().toISOString();
  } else if (newPassType === "10-game") {
    user.value.passGamesRemaining = 10;
    user.value.passStartDate = new Date().toISOString();
  } else if (newPassType === "full-season") {
    user.value.passGamesRemaining = 0;
    user.value.passStartDate = new Date().toISOString();
  } else {
    user.value.passGamesRemaining = 0;
    user.value.passStartDate = null;
  }
};

const saveUserChanges = async () => {
  if (!user.value) return;

  const result = await adminStore.updateUser(user.value.id, {
    name: user.value.name,
    email: user.value.email,
    position: user.value.position,
    skillLevel: user.value.skillLevel,
    gamesPlayed: user.value.gamesPlayed,
    regulars: user.value.regulars,
    isAdmin: user.value.isAdmin,
    passType: user.value.passType,
    passGamesRemaining: user.value.passGamesRemaining,
    passStartDate: user.value.passStartDate,
  });

  const toast = await toastController.create({
    message: result.success ? "User updated successfully!" : result.error,
    duration: 2000,
    color: result.success ? "success" : "danger",
  });
  await toast.present();

  if (result.success) {
    router.push("/admin");
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<style scoped>
.edit-user-container {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

ion-card {
  margin-bottom: 1rem;
}

ion-card-title {
  font-size: 1.2rem;
  font-weight: 600;
}

ion-card-subtitle {
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.skill-label h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.skill-label p {
  white-space: normal;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin-top: 0.25rem;
}

.button-group {
  margin-top: 2rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.button-group ion-button {
  font-weight: 600;
}

@media (min-width: 768px) {
  .edit-user-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .edit-user-container > h1 {
    grid-column: 1 / -1;
  }

  .button-group {
    grid-column: 1 / -1;
    max-width: 600px;
    margin: 2rem auto;
  }
}
</style>
