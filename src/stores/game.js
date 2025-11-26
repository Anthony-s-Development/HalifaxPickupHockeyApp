import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from './auth'

export const useGameStore = defineStore('game', () => {
  const games = ref([])
  const currentGame = ref(null)
  const loading = ref(false)
  const schedulesLoaded = ref(false)
  let unsubscribeGame = null
  let unsubscribeSchedules = null

  // Default schedules (fallback if Firestore hasn't loaded)
  const DEFAULT_SCHEDULES = {
    monday_11pm_forum: { day: 1, time: '23:00', venue: 'Forum' },
    tuesday_1030pm_forum: { day: 2, time: '22:30', venue: 'Forum' },
    thursday_1030pm_civic: { day: 4, time: '22:30', venue: 'Civic' },
    friday_1030pm_forum: { day: 5, time: '22:30', venue: 'Forum' },
    saturday_1030pm_forum: { day: 6, time: '22:30', venue: 'Forum' }
  }

  // Dynamic schedules loaded from Firestore
  const gameSchedules = ref({ ...DEFAULT_SCHEDULES })

  // Legacy export for backward compatibility
  const GAME_SCHEDULES = gameSchedules

  const subscribeToSchedules = () => {
    // Unsubscribe from existing listener if any
    if (unsubscribeSchedules) {
      unsubscribeSchedules()
    }

    return new Promise((resolve) => {
      try {
        const schedulesRef = collection(db, 'gameSchedules')
        const q = query(schedulesRef, orderBy('order', 'asc'))
        let isFirstSnapshot = true

        unsubscribeSchedules = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const schedules = {}
            querySnapshot.docs.forEach(doc => {
              const data = doc.data()
              if (data.isActive) {
                schedules[doc.id] = {
                  day: data.dayOfWeek,
                  time: data.time,
                  venue: data.venue
                }
              }
            })
            gameSchedules.value = schedules
          }
          schedulesLoaded.value = true

          // Resolve the promise after first snapshot
          if (isFirstSnapshot) {
            isFirstSnapshot = false
            resolve({ success: true })
          }
        }, (error) => {
          // Fall back to defaults if Firestore fails
          console.error('Error subscribing to schedules:', error)
          schedulesLoaded.value = true
          if (isFirstSnapshot) {
            isFirstSnapshot = false
            resolve({ success: false, error: error.message })
          }
        })
      } catch (error) {
        // Fall back to defaults if Firestore fails
        schedulesLoaded.value = true
        resolve({ success: false, error: error.message })
      }
    })
  }

  const stopSchedulesListener = () => {
    if (unsubscribeSchedules) {
      unsubscribeSchedules()
      unsubscribeSchedules = null
    }
  }

  const getTodayGameId = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const dateString = now.toISOString().split('T')[0]

    const schedules = gameSchedules.value
    const gameKey = Object.keys(schedules).find(key => {
      return schedules[key].day === dayOfWeek
    })

    return gameKey ? `${dateString}_${gameKey}` : null
  }

  const getTodayGameScheduleKey = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()

    const schedules = gameSchedules.value
    return Object.keys(schedules).find(key => {
      return schedules[key].day === dayOfWeek
    })
  }

  const isCheckInAllowed = () => {
    const now = new Date()
    const hours = now.getHours()
    return hours >= 8 && hours < 18
  }

  const loadTodayGame = async () => {
    const gameId = getTodayGameId()
    if (!gameId) return null

    if (unsubscribeGame) {
      unsubscribeGame()
    }

    loading.value = true
    try {
      const docRef = doc(db, 'games', gameId)

      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        const scheduleKey = getTodayGameScheduleKey()
        const schedule = gameSchedules.value[scheduleKey]

        const newGame = {
          date: new Date().toISOString().split('T')[0],
          scheduleKey: scheduleKey,
          venue: schedule.venue,
          time: schedule.time,
          players: [],
          waitlist: [],
          createdAt: new Date().toISOString()
        }

        await setDoc(docRef, newGame)
      }

      unsubscribeGame = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          currentGame.value = { id: doc.id, ...doc.data() }
        }
        loading.value = false
      }, (error) => {
        loading.value = false
      })

      return currentGame.value
    } catch (error) {
      loading.value = false
      return null
    }
  }

  const stopGameListener = () => {
    if (unsubscribeGame) {
      unsubscribeGame()
      unsubscribeGame = null
    }
  }

  const checkIn = async () => {
    const authStore = useAuthStore()
    if (!authStore.user || !authStore.userProfile) {
      return { success: false, error: 'Must be logged in' }
    }

    if (!isCheckInAllowed()) {
      return { success: false, error: 'Check-in only allowed between 8 AM and 6 PM' }
    }

    const gameId = getTodayGameId()
    if (!gameId) {
      return { success: false, error: 'No game scheduled for today' }
    }

    const scheduleKey = getTodayGameScheduleKey()
    const isRegular = authStore.userProfile.regulars?.[scheduleKey] || false

    try {
      const docRef = doc(db, 'games', gameId)

      const playerData = {
        uid: authStore.user.uid,
        name: authStore.userProfile.name,
        position: authStore.userProfile.position,
        skillLevel: authStore.userProfile.skillLevel || 2,
        checkedInAt: new Date().toISOString()
      }

      if (isRegular) {
        await updateDoc(docRef, {
          players: arrayUnion(playerData)
        })
      } else {
        await updateDoc(docRef, {
          waitlist: arrayUnion(playerData)
        })
      }

      return { success: true, isRegular }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const checkOut = async () => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      return { success: false, error: 'Must be logged in' }
    }

    const gameId = getTodayGameId()
    if (!gameId) {
      return { success: false, error: 'No game scheduled for today' }
    }

    try {
      const docRef = doc(db, 'games', gameId)
      const game = currentGame.value

      const playerInGame = game.players?.find(p => p.uid === authStore.user.uid)
      const playerInWaitlist = game.waitlist?.find(p => p.uid === authStore.user.uid)

      if (playerInGame) {
        await updateDoc(docRef, {
          players: arrayRemove(playerInGame)
        })
      } else if (playerInWaitlist) {
        await updateDoc(docRef, {
          waitlist: arrayRemove(playerInWaitlist)
        })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const moveFromWaitlist = async (playerUid) => {
    const gameId = getTodayGameId()
    if (!gameId) return { success: false, error: 'No game scheduled' }

    try {
      const docRef = doc(db, 'games', gameId)
      const game = currentGame.value

      const player = game.waitlist?.find(p => p.uid === playerUid)
      if (!player) {
        return { success: false, error: 'Player not found in waitlist' }
      }

      await updateDoc(docRef, {
        waitlist: arrayRemove(player),
        players: arrayUnion(player)
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const userCheckedIn = computed(() => {
    const authStore = useAuthStore()
    if (!authStore.user || !currentGame.value) return false

    const inPlayers = currentGame.value.players?.some(p => p.uid === authStore.user.uid)
    const inWaitlist = currentGame.value.waitlist?.some(p => p.uid === authStore.user.uid)

    return inPlayers || inWaitlist
  })

  const balanceTeams = (players) => {
    if (!players || players.length === 0) {
      return {
        darkTeam: { goalie: null, forwards: [], defense: [] },
        lightTeam: { goalie: null, forwards: [], defense: [] }
      }
    }

    let goalies = players.filter(p => p.position === 'Goalie')
    let forwards = players.filter(p => p.position === 'Forward')
    let defense = players.filter(p => p.position === 'Defense')

    const sortBySkill = (a, b) => (b.skillLevel || 2) - (a.skillLevel || 2)

    goalies.sort(sortBySkill)
    forwards.sort(sortBySkill)
    defense.sort(sortBySkill)

    const idealForwards = 6
    const idealDefense = 4

    if (forwards.length > idealForwards && defense.length < idealDefense) {
      const excessForwards = forwards.length - idealForwards
      const defenseNeeded = idealDefense - defense.length
      const toConvert = Math.min(excessForwards, defenseNeeded)

      const convertedPlayers = forwards.splice(idealForwards, toConvert)
      defense.push(...convertedPlayers)
      defense.sort(sortBySkill)
    }
    else if (defense.length > idealDefense && forwards.length < idealForwards) {
      const excessDefense = defense.length - idealDefense
      const forwardsNeeded = idealForwards - forwards.length
      const toConvert = Math.min(excessDefense, forwardsNeeded)

      const convertedPlayers = defense.splice(idealDefense, toConvert)
      forwards.push(...convertedPlayers)
      forwards.sort(sortBySkill)
    }

    const darkTeam = { goalie: null, forwards: [], defense: [] }
    const lightTeam = { goalie: null, forwards: [], defense: [] }

    if (goalies.length > 0) darkTeam.goalie = goalies[0]
    if (goalies.length > 1) lightTeam.goalie = goalies[1]

    let darkSkill = darkTeam.goalie?.skillLevel || 0
    let lightSkill = lightTeam.goalie?.skillLevel || 0

    forwards.forEach((player) => {
      if (darkSkill <= lightSkill) {
        darkTeam.forwards.push(player)
        darkSkill += player.skillLevel || 2
      } else {
        lightTeam.forwards.push(player)
        lightSkill += player.skillLevel || 2
      }
    })

    defense.forEach((player) => {
      if (darkSkill <= lightSkill) {
        darkTeam.defense.push(player)
        darkSkill += player.skillLevel || 2
      } else {
        lightTeam.defense.push(player)
        lightSkill += player.skillLevel || 2
      }
    })

    return { darkTeam, lightTeam }
  }

  return {
    games,
    currentGame,
    loading,
    schedulesLoaded,
    gameSchedules,
    GAME_SCHEDULES,
    subscribeToSchedules,
    stopSchedulesListener,
    getTodayGameId,
    isCheckInAllowed,
    loadTodayGame,
    stopGameListener,
    checkIn,
    checkOut,
    moveFromWaitlist,
    userCheckedIn,
    balanceTeams
  }
})
