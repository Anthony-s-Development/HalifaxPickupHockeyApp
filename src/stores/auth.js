import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(true)
  let unsubscribeProfile = null

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => userProfile.value?.isAdmin || false)

  const initAuth = () => {
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

  const loadUserProfile = async (uid) => {
    // Unsubscribe from previous listener if it exists
    if (unsubscribeProfile) {
      unsubscribeProfile()
    }

    try {
      const docRef = doc(db, 'users', uid)

      // Set up real-time listener
      unsubscribeProfile = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          userProfile.value = { id: doc.id, ...doc.data() }
        }
      }, (error) => {
        console.error('Error in user profile snapshot:', error)
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
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
      const result = await signInWithEmailAndPassword(auth, email, password)
      user.value = result.user
      await loadUserProfile(result.user.uid)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, userData) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      user.value = result.user

      const profileData = {
        email: email,
        name: userData.name,
        position: userData.position || 'Forward',
        skillLevel: userData.skillLevel || 3,
        regulars: userData.regulars || {
          'sunday_1030pm_civic': false,
          'monday_11pm_forum': false,
          'tuesday_1030pm_forum': false,
          'thursday_1030pm_civic': false,
          'friday_1030pm_forum': false,
          'saturday_1030pm_forum': false
        },
        gamesPlayed: 0,
        isAdmin: false,
        gameHistory: [],
        passType: null,
        passGamesRemaining: 0,
        passStartDate: null,
        createdAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'users', result.user.uid), profileData)
      userProfile.value = { id: result.user.uid, ...profileData }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      stopProfileListener()
      await signOut(auth)
      user.value = null
      userProfile.value = null
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      const docRef = doc(db, 'users', user.value.uid)
      await setDoc(docRef, updates, { merge: true })
      // No need to update manually - real-time listener will handle it
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
    initAuth,
    login,
    register,
    logout,
    updateUserProfile,
    loadUserProfile,
    stopProfileListener
  }
})
