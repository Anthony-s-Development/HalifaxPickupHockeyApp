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
  getDocs
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from './auth'

export const useGameStore = defineStore('game', () => {
  const games = ref([])
  const currentGame = ref(null)
  const loading = ref(false)
  let unsubscribeGame = null

  const GAME_SCHEDULES = {
    sunday_1030pm_civic: { day: 0, time: '22:30', venue: 'Civic' },
    monday_11pm_forum: { day: 1, time: '23:00', venue: 'Forum' },
    tuesday_1030pm_forum: { day: 2, time: '22:30', venue: 'Forum' },
    thursday_1030pm_civic: { day: 4, time: '22:30', venue: 'Civic' },
    friday_1030pm_forum: { day: 5, time: '22:30', venue: 'Forum' },
    saturday_1030pm_forum: { day: 6, time: '22:30', venue: 'Forum' }
  }

  const getTodayGameId = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const dateString = now.toISOString().split('T')[0]

    const gameKey = Object.keys(GAME_SCHEDULES).find(key => {
      return GAME_SCHEDULES[key].day === dayOfWeek
    })

    return gameKey ? `${dateString}_${gameKey}` : null
  }

  const getTodayGameScheduleKey = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()

    return Object.keys(GAME_SCHEDULES).find(key => {
      return GAME_SCHEDULES[key].day === dayOfWeek
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

    // Unsubscribe from previous listener if it exists
    if (unsubscribeGame) {
      unsubscribeGame()
    }

    loading.value = true
    try {
      const docRef = doc(db, 'games', gameId)

      // First check if game exists
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        // Create new game if it doesn't exist
        const scheduleKey = getTodayGameScheduleKey()
        const schedule = GAME_SCHEDULES[scheduleKey]

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

      // Set up real-time listener
      unsubscribeGame = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          currentGame.value = { id: doc.id, ...doc.data() }
        }
        loading.value = false
      }, (error) => {
        console.error('Error in game snapshot:', error)
        loading.value = false
      })

      return currentGame.value
    } catch (error) {
      console.error('Error loading game:', error)
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
        skillLevel: authStore.userProfile.skillLevel || 3,
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

      // No need to reload - real-time listener will update
      return { success: true, isRegular }
    } catch (error) {
      console.error('Error checking in:', error)
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

      // No need to reload - real-time listener will update
      return { success: true }
    } catch (error) {
      console.error('Error checking out:', error)
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

      // No need to reload - real-time listener will update
      return { success: true }
    } catch (error) {
      console.error('Error moving from waitlist:', error)
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

    const sortBySkill = (a, b) => (b.skillLevel || 3) - (a.skillLevel || 3)

    goalies.sort(sortBySkill)
    forwards.sort(sortBySkill)
    defense.sort(sortBySkill)

    // Ideal roster: 3 forwards and 2 defense per team (6 forwards, 4 defense total)
    // If we have too many of one position, convert extras to the other position
    const idealForwards = 6
    const idealDefense = 4

    // If we have excess forwards, convert some to defense
    if (forwards.length > idealForwards && defense.length < idealDefense) {
      const excessForwards = forwards.length - idealForwards
      const defenseNeeded = idealDefense - defense.length
      const toConvert = Math.min(excessForwards, defenseNeeded)

      // Take the lowest skilled excess forwards and convert them to defense
      const convertedPlayers = forwards.splice(idealForwards, toConvert)
      defense.push(...convertedPlayers)
      defense.sort(sortBySkill)
    }
    // If we have excess defense, convert some to forwards
    else if (defense.length > idealDefense && forwards.length < idealForwards) {
      const excessDefense = defense.length - idealDefense
      const forwardsNeeded = idealForwards - forwards.length
      const toConvert = Math.min(excessDefense, forwardsNeeded)

      // Take the lowest skilled excess defense and convert them to forwards
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

    // Distribute forwards - allow more than 3 per team if we have extras
    forwards.forEach((player) => {
      if (darkSkill <= lightSkill) {
        darkTeam.forwards.push(player)
        darkSkill += player.skillLevel || 3
      } else {
        lightTeam.forwards.push(player)
        lightSkill += player.skillLevel || 3
      }
    })

    // Distribute defense - allow more than 2 per team if we have extras
    defense.forEach((player) => {
      if (darkSkill <= lightSkill) {
        darkTeam.defense.push(player)
        darkSkill += player.skillLevel || 3
      } else {
        lightTeam.defense.push(player)
        lightSkill += player.skillLevel || 3
      }
    })

    return { darkTeam, lightTeam }
  }

  return {
    games,
    currentGame,
    loading,
    GAME_SCHEDULES,
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
