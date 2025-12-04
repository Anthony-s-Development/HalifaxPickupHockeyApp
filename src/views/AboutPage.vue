<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <div slot="start" class="header-start">
          <img
            src="/logos/halifax.png"
            alt="Halifax Pickup Hockey Logo"
            class="header-logo"
          />
          <ion-back-button default-href="/"></ion-back-button>
        </div>
        <ion-title>About Us</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="about-container">
        <h1>About Nova Pickup Hockey</h1>

        <ion-card>
          <ion-card-content>
            <div class="about-content">
              <h2>Our Story</h2>
              <p>
                We started in 2018, when one of our beloved pickup skates was at
                risk. An organizer was ready to pass on the torch after renting
                ice at the Halifax Forum for several years. After asking a few
                questions, and being assured "the crew" wanted to keep coming
                out, we took the plunge.
              </p>

              <p>
                Now in 2025, we have five nights a week, year round. The
                approach we've taken and built upon, is to make adult hockey
                accessible to all. We will do what it takes to help a person get
                onto the ice.
              </p>

              <h2>Who We Welcome</h2>
              <p>
                <strong>Beginner</strong> that found your way to a set of hockey
                gear, maybe still needing a couple pieces, and ready to try it
                out? We got you.
              </p>

              <p>
                <strong>Skilled player</strong> from out of town looking for
                crisp, friendly skates with regular faces and a consistent pace?
                We've got that too.
              </p>

              <p>
                We try to cover all bases in between, and to have a
                community-oriented, determined fundraising component baked in as
                well. We like to think we're just getting started.
              </p>

              <h2>Get In Touch</h2>
              <p>
                Questions? Want to learn more? Contact us at
                <a href="mailto:halifaxpickuphockey@gmail.com"
                  >halifaxpickuphockey@gmail.com</a
                >
              </p>
            </div>
          </ion-card-content>
        </ion-card>
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
  IonCardContent,
} from "@ionic/vue";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style scoped>
.header-start {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  margin-left: 0.5rem;
}

.about-container {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.about-content h2 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: var(--ion-color-primary);
}

.about-content h2:first-child {
  margin-top: 0;
}

.about-content p {
  line-height: 1.8;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.about-content p:last-child {
  margin-bottom: 0;
}

.about-content a {
  color: var(--ion-color-primary);
  text-decoration: none;
}

.about-content a:hover {
  text-decoration: underline;
}

ion-button {
  margin-top: 2rem;
}
</style>
