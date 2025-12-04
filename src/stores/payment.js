import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { useAuthStore } from '@/stores/auth'

// Pass pricing configuration (for display purposes)
export const PASS_PRICES = {
  '1-game': {
    type: '1-game',
    name: '1 Game Pass',
    price: 18,
    games: 1,
    description: 'Single game entry'
  },
  '5-game': {
    type: '5-game',
    name: '5 Game Pass',
    price: 85,
    games: 5,
    description: 'Save $5 compared to single games'
  },
  '10-game': {
    type: '10-game',
    name: '10 Game Pass',
    price: 160,
    games: 10,
    description: 'Best value - Save $20'
  },
  'full-season': {
    type: 'full-season',
    name: 'Full Season',
    price: 600,
    games: 'Unlimited',
    description: 'Unlimited games all season'
  }
}

// Cloud Function URL for native direct calls
const FUNCTIONS_URL = 'https://us-central1-halifaxpickuphockey-50910.cloudfunctions.net'

export const usePaymentStore = defineStore('payment', () => {
  const loading = ref(false)
  const error = ref(null)
  const currentCheckoutSession = ref(null)

  /**
   * Initiate checkout for a pass type
   * @param {string} passType - One of: '1-game', '5-game', '10-game', 'full-season'
   * @param {string} cityId - Current city ID for return URL
   */
  const initiateCheckout = async (passType, cityId) => {
    if (!PASS_PRICES[passType]) {
      error.value = 'Invalid pass type'
      return { success: false, error: 'Invalid pass type' }
    }

    loading.value = true
    error.value = null

    try {
      const isNative = Capacitor.isNativePlatform()
      const baseUrl = isNative
        ? 'https://halifaxpickuphockey-50910.web.app'
        : window.location.origin

      // Build success and cancel URLs
      const successUrl = `${baseUrl}/${cityId}/payment-success?session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${baseUrl}/${cityId}/payment-cancel`

      let sessionId, url

      if (isNative) {
        // On native, use fetch with ID token since Firebase JS SDK auth isn't available
        const authStore = useAuthStore()
        const idToken = await authStore.getIdToken()

        if (!idToken) {
          throw new Error('Please log in to purchase a pass')
        }

        const response = await fetch(`${FUNCTIONS_URL}/createCheckoutSession`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            data: {
              passType,
              successUrl,
              cancelUrl
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error?.message || 'Failed to create checkout session')
        }

        const result = await response.json()
        sessionId = result.result.sessionId
        url = result.result.url
      } else {
        // On web, use httpsCallable as Firebase JS SDK auth is available
        const functions = getFunctions()
        const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession')

        const result = await createCheckoutSession({
          passType,
          successUrl,
          cancelUrl
        })

        sessionId = result.data.sessionId
        url = result.data.url
      }

      currentCheckoutSession.value = sessionId

      // Redirect to Stripe Checkout
      if (isNative) {
        // Use in-app browser for native platforms
        await Browser.open({ url, windowName: '_blank' })
      } else {
        // For web, use standard navigation
        window.location.href = url
      }

      loading.value = false
      return { success: true, sessionId, url }
    } catch (err) {
      console.error('Checkout error:', err)
      error.value = err.message || 'Failed to initiate checkout'
      loading.value = false
      return { success: false, error: error.value }
    }
  }

  /**
   * Get formatted price for display
   */
  const getFormattedPrice = (passType) => {
    const pass = PASS_PRICES[passType]
    if (!pass) return '$0'
    return `$${pass.price}`
  }

  /**
   * Get all available passes for purchase
   */
  const getAvailablePasses = () => {
    return Object.values(PASS_PRICES)
  }

  /**
   * Clear any error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    loading,
    error,
    currentCheckoutSession,
    initiateCheckout,
    getFormattedPrice,
    getAvailablePasses,
    clearError,
    PASS_PRICES
  }
})
