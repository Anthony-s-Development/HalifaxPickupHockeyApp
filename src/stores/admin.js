import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export const useAdminStore = defineStore('admin', () => {
  const allGames = ref([])
  const allUsers = ref([])
  const selectedGame = ref(null)
  const loading = ref(false)
  let unsubscribeGame = null

  const loadAllGames = async () => {
    loading.value = true
    try {
      const gamesRef = collection(db, 'games')
      const q = query(gamesRef, orderBy('date', 'desc'))
      const querySnapshot = await getDocs(q)

      allGames.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true }
    } catch (error) {
      console.error('Error loading games:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const loadAllUsers = async () => {
    loading.value = true
    try {
      const usersRef = collection(db, 'users')
      const querySnapshot = await getDocs(usersRef)

      allUsers.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true }
    } catch (error) {
      console.error('Error loading users:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const loadGameById = async (gameId) => {
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
        loading.value = false
        return { success: false, error: 'Game not found' }
      }

      // Set up real-time listener
      unsubscribeGame = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          selectedGame.value = { id: doc.id, ...doc.data() }
        }
        loading.value = false
      }, (error) => {
        console.error('Error in game snapshot:', error)
        loading.value = false
      })

      return { success: true }
    } catch (error) {
      console.error('Error loading game:', error)
      loading.value = false
      return { success: false, error: error.message }
    }
  }

  const stopGameListener = () => {
    if (unsubscribeGame) {
      unsubscribeGame()
      unsubscribeGame = null
    }
  }

  const movePlayerFromWaitlist = async (gameId, playerUid) => {
    try {
      const docRef = doc(db, 'games', gameId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return { success: false, error: 'Game not found' }
      }

      const game = docSnap.data()
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
      console.error('Error moving player from waitlist:', error)
      return { success: false, error: error.message }
    }
  }

  const removePlayerFromGame = async (gameId, playerUid, fromWaitlist = false) => {
    try {
      const docRef = doc(db, 'games', gameId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return { success: false, error: 'Game not found' }
      }

      const game = docSnap.data()
      const playerList = fromWaitlist ? game.waitlist : game.players
      const player = playerList?.find(p => p.uid === playerUid)

      if (!player) {
        return { success: false, error: 'Player not found' }
      }

      const updateField = fromWaitlist ? 'waitlist' : 'players'
      await updateDoc(docRef, {
        [updateField]: arrayRemove(player)
      })

      // No need to reload - real-time listener will update
      return { success: true }
    } catch (error) {
      console.error('Error removing player:', error)
      return { success: false, error: error.message }
    }
  }

  const toggleUserAdmin = async (userId, isAdmin) => {
    try {
      const userDocRef = doc(db, 'users', userId)
      await updateDoc(userDocRef, {
        isAdmin: !isAdmin
      })

      await loadAllUsers()
      return { success: true }
    } catch (error) {
      console.error('Error toggling admin status:', error)
      return { success: false, error: error.message }
    }
  }

  const markGameAsPlayed = async (gameId) => {
    try {
      const docRef = doc(db, 'games', gameId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return { success: false, error: 'Game not found' }
      }

      const game = docSnap.data()
      const players = game.players || []

      for (const player of players) {
        const userDocRef = doc(db, 'users', player.uid)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          const updates = {
            gamesPlayed: increment(1)
          }

          // Decrement pass games if user has a non-full-season pass
          if (userData.passType && userData.passType !== 'full-season') {
            if (userData.passGamesRemaining > 0) {
              updates.passGamesRemaining = increment(-1)
            }
          }

          // Add game to player's game history
          const gameHistoryEntry = {
            gameId: gameId,
            date: game.date,
            scheduleKey: game.scheduleKey,
            venue: game.venue,
            time: game.time,
            status: 'played'
          }
          updates.gameHistory = arrayUnion(gameHistoryEntry)

          await updateDoc(userDocRef, updates)
        }
      }

      await updateDoc(docRef, {
        status: 'completed',
        completedAt: new Date().toISOString()
      })

      // No need to reload - real-time listener will update
      return { success: true }
    } catch (error) {
      console.error('Error marking game as played:', error)
      return { success: false, error: error.message }
    }
  }

  const updateUserRegulars = async (userId, regulars) => {
    try {
      const userDocRef = doc(db, 'users', userId)
      await updateDoc(userDocRef, {
        regulars: regulars
      })

      await loadAllUsers()
      return { success: true }
    } catch (error) {
      console.error('Error updating user regulars:', error)
      return { success: false, error: error.message }
    }
  }

  const updateUser = async (userId, userData) => {
    try {
      const userDocRef = doc(db, 'users', userId)
      await updateDoc(userDocRef, userData)

      await loadAllUsers()
      return { success: true }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message }
    }
  }

  const updateTeamAssignments = async (gameId, teamAssignments) => {
    try {
      const docRef = doc(db, 'games', gameId)
      await updateDoc(docRef, {
        teamAssignments: teamAssignments
      })

      // No need to reload - real-time listener will update
      return { success: true }
    } catch (error) {
      console.error('Error updating team assignments:', error)
      return { success: false, error: error.message }
    }
  }

  const movePlayerToTeam = async (gameId, player, fromList, toList) => {
    try {
      const docRef = doc(db, 'games', gameId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return { success: false, error: 'Game not found' }
      }

      const game = docSnap.data()

      // Remove from source list
      let updates = {}
      if (fromList === 'players') {
        const playerData = game.players?.find(p => p.uid === player.uid)
        if (playerData) {
          updates.players = arrayRemove(playerData)
        }
      } else if (fromList === 'waitlist') {
        const playerData = game.waitlist?.find(p => p.uid === player.uid)
        if (playerData) {
          updates.waitlist = arrayRemove(playerData)
        }
      }

      await updateDoc(docRef, updates)

      // Add to destination list
      updates = {}
      if (toList === 'players') {
        updates.players = arrayUnion(player)
      } else if (toList === 'waitlist') {
        updates.waitlist = arrayUnion(player)
      }

      await updateDoc(docRef, updates)
      // No need to reload - real-time listener will update
      return { success: true }
    } catch (error) {
      console.error('Error moving player to team:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    allGames,
    allUsers,
    selectedGame,
    loading,
    loadAllGames,
    loadAllUsers,
    loadGameById,
    stopGameListener,
    movePlayerFromWaitlist,
    removePlayerFromGame,
    toggleUserAdmin,
    markGameAsPlayed,
    updateUserRegulars,
    updateUser,
    updateTeamAssignments,
    movePlayerToTeam
  }
})
