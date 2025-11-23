<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue'
</script>

<style>
/* Dark mode background */
body {
  --ion-background-color: #1a1a1a;
  --ion-text-color: #ffffff;
}

/* Global header/toolbar styling */
ion-header ion-toolbar {
  --background: #4f001e;
  --color: white;
}

ion-header ion-title {
  color: white;
}

ion-header ion-button {
  --color: white;
}

ion-header ion-back-button {
  --color: white;
}

/* Fix label spacing - add space between floating labels and inputs */
ion-item ion-textarea {
  padding-top: 20px !important;
}

/* Special handling for ion-input */
ion-item ion-input {
  --padding-top: 20px;
  margin-top: 20px !important;
}

/* Fix ion-select to work properly with floating labels */
ion-item ion-select {
  margin-top: 8px !important;
}

ion-item {
  --padding-top: 8px;
  --padding-bottom: 8px;
  --inner-padding-top: 8px;
  --inner-padding-bottom: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
  min-height: 56px;
}

/* Dark mode card styling */
ion-card {
  --background: #2d2d2d;
  --color: #ffffff;
}

/* Improve contrast for links in dark mode */
a {
  color: #66b3ff;
}

/* Better toast contrast in dark mode */
.toast-success {
  --background: #2dd36f;
}

.toast-danger {
  --background: #eb445a;
}

.toast-warning {
  --background: #ffc409;
}
</style>
