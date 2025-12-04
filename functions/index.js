const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Define secrets (set via: firebase functions:secrets:set STRIPE_SECRET_KEY)
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

// Pass pricing configuration (in cents)
const PASS_PRICES = {
  "1-game": {
    amount: 1800, // $18.00
    name: "1 Game Pass",
    gamesTotal: 1
  },
  "5-game": {
    amount: 8500, // $85.00
    name: "5 Game Pass",
    gamesTotal: 5
  },
  "10-game": {
    amount: 16000, // $160.00
    name: "10 Game Pass",
    gamesTotal: 10
  },
  "full-season": {
    amount: 60000, // $600.00
    name: "Full Season Pass",
    gamesTotal: 999
  }
};

/**
 * Create a Stripe Checkout Session
 * Called from the frontend when user wants to purchase a pass
 */
exports.createCheckoutSession = onCall(
  {
    secrets: [stripeSecretKey],
    cors: true
  },
  async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in to purchase a pass");
    }

    const { passType, successUrl, cancelUrl } = request.data;

    // Validate pass type
    if (!passType || !PASS_PRICES[passType]) {
      throw new HttpsError("invalid-argument", "Invalid pass type");
    }

    const passConfig = PASS_PRICES[passType];
    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;

    try {
      const stripe = new Stripe(stripeSecretKey.value());

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: passConfig.name,
                description: `Nova Adult Hockey - ${passConfig.name}`,
                metadata: {
                  passType: passType,
                  gamesTotal: passConfig.gamesTotal.toString()
                }
              },
              unit_amount: passConfig.amount
            },
            quantity: 1
          }
        ],
        metadata: {
          userId: userId,
          passType: passType,
          gamesTotal: passConfig.gamesTotal.toString()
        },
        success_url: successUrl,
        cancel_url: cancelUrl
      });

      return {
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw new HttpsError("internal", "Failed to create checkout session");
    }
  }
);

/**
 * Stripe Webhook Handler
 * Processes successful payments and adds passes to user accounts
 */
exports.stripeWebhook = onRequest(
  {
    secrets: [stripeSecretKey, stripeWebhookSecret],
    cors: false
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Only process if payment was successful
        if (session.payment_status === "paid") {
          await handleSuccessfulPayment(session);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        // Handle async payment methods (like bank transfers)
        const session = event.data.object;
        await handleSuccessfulPayment(session);
        break;
      }

      case "checkout.session.async_payment_failed": {
        // Log failed payment for monitoring
        const session = event.data.object;
        console.error("Payment failed for session:", session.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  }
);

/**
 * Handle successful payment - add pass to user's account
 */
async function handleSuccessfulPayment(session) {
  const { userId, passType, gamesTotal } = session.metadata;

  if (!userId || !passType) {
    console.error("Missing metadata in session:", session.id);
    return;
  }

  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error("User not found:", userId);
    return;
  }

  const userData = userDoc.data();
  const existingPasses = userData.passes || [];

  // Generate unique pass ID
  const passId = `pass_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create new pass
  const newPass = {
    id: passId,
    type: passType,
    gamesTotal: parseInt(gamesTotal) || (passType === "full-season" ? 999 : 0),
    gamesRemaining: parseInt(gamesTotal) || (passType === "full-season" ? 999 : 0),
    purchaseDate: new Date().toISOString(),
    status: "active",
    usageHistory: [],
    // Payment tracking
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,
    amountPaid: session.amount_total,
    currency: session.currency
  };

  // Add pass to user's passes array
  await userRef.update({
    passes: [...existingPasses, newPass]
  });

  // Also record the transaction
  await db.collection("transactions").add({
    userId: userId,
    passId: passId,
    passType: passType,
    amount: session.amount_total,
    currency: session.currency,
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,
    status: "completed",
    createdAt: new Date().toISOString()
  });

  console.log(`Successfully added ${passType} pass to user ${userId}`);
}
