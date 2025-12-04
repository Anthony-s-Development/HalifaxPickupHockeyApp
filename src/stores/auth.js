import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'

const isNative = Capacitor.isNativePlatform()

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(true)
  let unsubscribeProfile = null

  const isAuthenticated = computed(() => !!user.value)

  // Legacy isAdmin - checks if user is admin in any city or super-admin
  const isAdmin = computed(() => {
    if (!userProfile.value) return false
    // Check for super admin
    if (userProfile.value.isSuperAdmin) return true
    // Check for legacy isAdmin field
    if (userProfile.value.isAdmin) return true
    // Check for city admin in any city
    if (userProfile.value.cityData) {
      return Object.values(userProfile.value.cityData).some(cd => cd.isAdmin)
    }
    return false
  })

  // Super admin can manage all cities
  const isSuperAdmin = computed(() => {
    return userProfile.value?.isSuperAdmin || false
  })

  // Check if user is admin for a specific city
  const isCityAdmin = (cityId) => {
    if (!userProfile.value) return false
    if (userProfile.value.isSuperAdmin) return true
    if (!cityId) return false
    return userProfile.value.cityData?.[cityId]?.isAdmin || false
  }

  // Get user's data for a specific city
  const getCityData = (cityId) => {
    if (!userProfile.value || !cityId) return null

    // First try new cityData structure
    if (userProfile.value.cityData?.[cityId]) {
      return userProfile.value.cityData[cityId]
    }

    // Fall back to legacy structure (for backward compatibility during migration)
    if (cityId === 'halifax' && userProfile.value.regulars) {
      return {
        isAdmin: userProfile.value.isAdmin || false,
        regulars: userProfile.value.regulars,
        gamesPlayed: userProfile.value.gamesPlayed || 0,
        passType: userProfile.value.passType,
        passGamesRemaining: userProfile.value.passGamesRemaining || 0,
        passStartDate: userProfile.value.passStartDate
      }
    }

    return null
  }

  // Check if user is a regular for a specific schedule
  const isRegularForSchedule = (scheduleKey, cityId) => {
    if (!userProfile.value || !scheduleKey) return false

    // Try new cityData structure first
    if (userProfile.value.cityData?.[cityId]?.regulars) {
      return userProfile.value.cityData[cityId].regulars[scheduleKey] || false
    }

    // Fall back to legacy regulars field
    if (userProfile.value.regulars) {
      return userProfile.value.regulars[scheduleKey] || false
    }

    return false
  }

  // Get user's regulars for a specific city
  const getCityRegulars = (cityId) => {
    if (!userProfile.value || !cityId) return {}

    if (userProfile.value.cityData?.[cityId]?.regulars) {
      return userProfile.value.cityData[cityId].regulars
    }

    // Fall back for legacy data
    if (cityId === 'halifax' && userProfile.value.regulars) {
      return userProfile.value.regulars
    }

    return {}
  }

  // Get games played for a specific city
  const getCityGamesPlayed = (cityId) => {
    if (!userProfile.value || !cityId) return 0

    if (userProfile.value.cityData?.[cityId]) {
      return userProfile.value.cityData[cityId].gamesPlayed || 0
    }

    // Fall back for legacy data
    if (cityId === 'halifax') {
      return userProfile.value.gamesPlayed || 0
    }

    return 0
  }

  // Get all passes (active and exhausted)
  const getAllPasses = () => {
    if (!userProfile.value) return []

    // Check for new passes array
    if (userProfile.value.passes && Array.isArray(userProfile.value.passes)) {
      return [...userProfile.value.passes].sort((a, b) =>
        new Date(a.purchaseDate) - new Date(b.purchaseDate)
      )
    }

    // Migrate legacy single pass to array format (read-only)
    if (userProfile.value.passType) {
      const gamesTotal = userProfile.value.passType === '1-game' ? 1 :
                         userProfile.value.passType === '5-game' ? 5 :
                         userProfile.value.passType === '10-game' ? 10 : 999
      return [{
        id: 'legacy_pass',
        type: userProfile.value.passType,
        gamesTotal: gamesTotal,
        gamesRemaining: userProfile.value.passGamesRemaining || 0,
        purchaseDate: userProfile.value.passStartDate || new Date().toISOString(),
        status: userProfile.value.passGamesRemaining > 0 || userProfile.value.passType === 'full-season'
          ? 'active' : 'exhausted',
        usageHistory: []
      }]
    }

    return []
  }

  // Get only active passes (sorted by purchase date - oldest first)
  const getActivePasses = () => {
    return getAllPasses().filter(pass =>
      pass.status === 'active' &&
      (pass.type === 'full-season' || pass.gamesRemaining > 0)
    )
  }

  // Get the current pass to use (oldest active pass - FIFO)
  const getCurrentPass = () => {
    const activePasses = getActivePasses()
    return activePasses.length > 0 ? activePasses[0] : null
  }

  // Get total games remaining across all active passes
  const getTotalGamesRemaining = () => {
    const activePasses = getActivePasses()

    // If any pass is full-season, return Infinity
    if (activePasses.some(p => p.type === 'full-season')) {
      return Infinity
    }

    return activePasses.reduce((sum, pass) => sum + (pass.gamesRemaining || 0), 0)
  }

  // Get pass info (global - usable across all cities) - backward compatible
  const getPassInfo = () => {
    if (!userProfile.value) {
      return { passType: null, passGamesRemaining: 0, passStartDate: null }
    }

    // Use the current (oldest active) pass for backward compatibility
    const currentPass = getCurrentPass()
    if (currentPass) {
      return {
        passType: currentPass.type,
        passGamesRemaining: currentPass.type === 'full-season' ? 999 : currentPass.gamesRemaining,
        passStartDate: currentPass.purchaseDate
      }
    }

    // Fall back to legacy fields if no passes array
    return {
      passType: userProfile.value.passType || null,
      passGamesRemaining: userProfile.value.passGamesRemaining || 0,
      passStartDate: userProfile.value.passStartDate || null
    }
  }

  // Alias for backward compatibility
  const getCityPassInfo = () => getPassInfo()

  // Get ID token for Cloud Function calls (native only)
  const getIdToken = async () => {
    if (!isNative) return null
    try {
      const result = await FirebaseAuthentication.getIdToken()
      return result.token
    } catch (error) {
      console.error('Error getting ID token:', error)
      return null
    }
  }

  const initAuth = async () => {
    if (isNative) {
      try {
        const result = await FirebaseAuthentication.getCurrentUser()
        if (result.user) {
          user.value = result.user
          await loadUserProfile(result.user.uid)
        }

        FirebaseAuthentication.addListener('authStateChange', async (change) => {
          if (change.user) {
            user.value = change.user
            await loadUserProfile(change.user.uid)
          } else {
            user.value = null
            userProfile.value = null
          }
        })
      } catch (error) {
      }
      loading.value = false
    } else {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            user.value = firebaseUser
            await loadUserProfile(firebaseUser.uid)
          } else {
            user.value = null
            userProfile.value = null
          }
          loading.value = false
          resolve(firebaseUser)
        })
      })
    }
  }

  const loadUserProfile = async (uid) => {
    if (unsubscribeProfile) {
      unsubscribeProfile()
    }

    try {
      const docRef = doc(db, 'users', uid)

      unsubscribeProfile = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          userProfile.value = { id: doc.id, ...doc.data() }
        }
      }, (error) => {
      })
    } catch (error) {
    }
  }

  const stopProfileListener = () => {
    if (unsubscribeProfile) {
      unsubscribeProfile()
      unsubscribeProfile = null
    }
  }

  const login = async (email, password) => {
    try {
      if (isNative) {
        const result = await FirebaseAuthentication.signInWithEmailAndPassword({
          email,
          password
        })
        user.value = result.user
        await loadUserProfile(result.user.uid)
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password)
        user.value = result.user
        await loadUserProfile(result.user.uid)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || error.code }
    }
  }

  const register = async (email, password, userData) => {
    try {
      let result
      if (isNative) {
        result = await FirebaseAuthentication.createUserWithEmailAndPassword({
          email,
          password
        })
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password)
      }

      user.value = result.user

      // Get the city from userData or default to halifax
      const cityId = userData.cityId || 'halifax'

      // Create profile data with city-scoped fields and multi-pass support
      const profileData = {
        email: email,
        name: userData.name,
        position: userData.position || 'Forward',
        skillLevel: userData.skillLevel || 2,
        defaultCityId: cityId,
        isSuperAdmin: false,
        // Multi-pass system (global - usable across all cities)
        passes: [],
        // Legacy pass fields for backward compatibility
        passType: null,
        passGamesRemaining: 0,
        passStartDate: null,
        // City-specific data (regulars, gamesPlayed, admin status)
        cityData: {
          [cityId]: {
            isAdmin: false,
            regulars: {},
            gamesPlayed: 0
          }
        },
        gameHistory: [],
        createdAt: new Date().toISOString()
      }

      // Legacy fields for backward compatibility
      profileData.isAdmin = false
      profileData.regulars = {}
      profileData.gamesPlayed = 0

      await setDoc(doc(db, 'users', result.user.uid), profileData)
      userProfile.value = { id: result.user.uid, ...profileData }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || error.code }
    }
  }

  const logout = async () => {
    try {
      stopProfileListener()
      if (isNative) {
        await FirebaseAuthentication.signOut()
      } else {
        await signOut(auth)
      }
      user.value = null
      userProfile.value = null
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || error.code }
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      const docRef = doc(db, 'users', user.value.uid)
      await setDoc(docRef, updates, { merge: true })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update city-specific data for user
  const updateCityData = async (cityId, cityUpdates) => {
    if (!user.value || !cityId) {
      return { success: false, error: 'Invalid user or city' }
    }

    try {
      const docRef = doc(db, 'users', user.value.uid)
      await setDoc(docRef, {
        cityData: {
          [cityId]: cityUpdates
        }
      }, { merge: true })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isCityAdmin,
    getCityData,
    isRegularForSchedule,
    getCityRegulars,
    getCityGamesPlayed,
    // Multi-pass functions
    getAllPasses,
    getActivePasses,
    getCurrentPass,
    getTotalGamesRemaining,
    getPassInfo,
    getCityPassInfo, // Alias for backward compatibility
    initAuth,
    login,
    register,
    logout,
    updateUserProfile,
    updateCityData,
    loadUserProfile,
    stopProfileListener,
    getIdToken
  }
})
