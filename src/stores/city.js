import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '@/config/firebase'

// Cache configuration
const CACHE_KEY = 'cities_cache'
const CACHE_TIMESTAMP_KEY = 'cities_cache_timestamp'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export const useCityStore = defineStore('city', () => {
  const cities = ref([])
  const currentCity = ref(null)
  const loading = ref(false)
  const citiesLoaded = ref(false)

  // Computed properties
  const activeCities = computed(() => {
    return cities.value.filter(city => city.isActive)
  })

  const currentCityId = computed(() => {
    return currentCity.value?.id || null
  })

  const currentCityDisplayName = computed(() => {
    return currentCity.value?.displayName || 'Nova Adult Hockey'
  })

  const currentCityLogo = computed(() => {
    return currentCity.value?.logo || '/logos/default.png'
  })

  const currentCityEmail = computed(() => {
    return currentCity.value?.contactEmail || ''
  })

  const currentCityColor = computed(() => {
    return currentCity.value?.primaryColor || '#4f001e'
  })

  // Check if cache is valid (exists and not expired)
  const isCacheValid = () => {
    try {
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      if (!timestamp) return false

      const cacheAge = Date.now() - parseInt(timestamp, 10)
      return cacheAge < CACHE_DURATION_MS
    } catch {
      return false
    }
  }

  // Load cities from localStorage cache
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (error) {
      console.warn('Error reading cities cache:', error)
    }
    return null
  }

  // Save cities to localStorage cache
  const saveToCache = (citiesData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(citiesData))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      console.warn('Error saving cities cache:', error)
    }
  }

  // Clear the cities cache
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    } catch (error) {
      console.warn('Error clearing cities cache:', error)
    }
  }

  // Load cities - tries cache first, then Firestore
  const loadCities = async (forceRefresh = false) => {
    // If already loaded and not forcing refresh, return cached data
    if (citiesLoaded.value && !forceRefresh) {
      return { success: true, fromCache: true }
    }

    // Try loading from cache first (unless force refresh)
    if (!forceRefresh && isCacheValid()) {
      const cachedCities = loadFromCache()
      if (cachedCities && cachedCities.length > 0) {
        cities.value = cachedCities
        citiesLoaded.value = true
        return { success: true, fromCache: true }
      }
    }

    // Load from Firestore
    loading.value = true
    try {
      const citiesRef = collection(db, 'cities')
      const q = query(citiesRef, orderBy('name', 'asc'))
      const querySnapshot = await getDocs(q)

      const citiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      cities.value = citiesData
      citiesLoaded.value = true

      // Save to cache
      saveToCache(citiesData)

      return { success: true, fromCache: false }
    } catch (error) {
      console.error('Error loading cities:', error)

      // If Firestore fails, try to use stale cache as fallback
      const staleCities = loadFromCache()
      if (staleCities && staleCities.length > 0) {
        cities.value = staleCities
        citiesLoaded.value = true
        return { success: true, fromCache: true, stale: true }
      }

      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Refresh cities from Firestore (bypasses cache)
  const refreshCities = async () => {
    return loadCities(true)
  }

  // Set the current city by ID
  const setCurrentCity = async (cityId) => {
    if (!cityId) {
      currentCity.value = null
      return { success: true }
    }

    // Ensure cities are loaded
    if (!citiesLoaded.value) {
      await loadCities()
    }

    // Try to find in already loaded cities
    let city = cities.value.find(c => c.id === cityId || c.slug === cityId)

    if (!city) {
      // Load single city from Firestore if not found in cache
      try {
        const docRef = doc(db, 'cities', cityId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          city = { id: docSnap.id, ...docSnap.data() }
          // Add to cities array and update cache
          cities.value = [...cities.value, city]
          saveToCache(cities.value)
        }
      } catch (error) {
        console.error('Error loading city:', error)
        return { success: false, error: error.message }
      }
    }

    if (city) {
      currentCity.value = city
      // Store last city ID for persistence
      localStorage.setItem('lastCityId', cityId)
      return { success: true, city }
    }

    return { success: false, error: 'City not found' }
  }

  // Get city by ID (synchronous, from cache only)
  const getCityById = (cityId) => {
    return cities.value.find(c => c.id === cityId || c.slug === cityId)
  }

  // Get the last used city from localStorage
  const getLastCityId = () => {
    return localStorage.getItem('lastCityId')
  }

  // Clear current city
  const clearCurrentCity = () => {
    currentCity.value = null
  }

  // Admin: Create a new city
  const createCity = async (cityData) => {
    try {
      const cityId = cityData.slug || cityData.name.toLowerCase().replace(/\s+/g, '-')
      const docRef = doc(db, 'cities', cityId)

      await setDoc(docRef, {
        ...cityData,
        id: cityId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Clear cache and reload
      clearCache()
      await loadCities(true)
      return { success: true, cityId }
    } catch (error) {
      console.error('Error creating city:', error)
      return { success: false, error: error.message }
    }
  }

  // Admin: Update a city
  const updateCity = async (cityId, cityData) => {
    try {
      const docRef = doc(db, 'cities', cityId)
      await updateDoc(docRef, {
        ...cityData,
        updatedAt: new Date().toISOString()
      })

      // Clear cache and reload
      clearCache()
      await loadCities(true)

      // Update current city if it was the one modified
      if (currentCity.value?.id === cityId) {
        currentCity.value = cities.value.find(c => c.id === cityId)
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating city:', error)
      return { success: false, error: error.message }
    }
  }

  // Initialize cities for first-time setup (creates Halifax and Bridgewater)
  const initializeDefaultCities = async () => {
    const defaultCities = [
      {
        id: 'halifax',
        name: 'Halifax',
        displayName: 'Halifax Pickup Hockey',
        slug: 'halifax',
        logo: '/logos/halifax.png',
        contactEmail: 'halifaxpickuphockey@gmail.com',
        primaryColor: '#4f001e',
        isActive: true
      },
      {
        id: 'bridgewater',
        name: 'Bridgewater',
        displayName: 'Bridgewater Adult Hockey',
        slug: 'bridgewater',
        logo: '/logos/bridgewater.png',
        contactEmail: 'southshorepickuphockey@gmail.com',
        primaryColor: '#1a4d1a',
        isActive: true
      }
    ]

    for (const city of defaultCities) {
      const docRef = doc(db, 'cities', city.id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          ...city,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    }

    // Clear cache and reload
    clearCache()
    await loadCities(true)
    return { success: true }
  }

  return {
    // State
    cities,
    currentCity,
    loading,
    citiesLoaded,

    // Computed
    activeCities,
    currentCityId,
    currentCityDisplayName,
    currentCityLogo,
    currentCityEmail,
    currentCityColor,

    // Actions
    loadCities,
    refreshCities,
    clearCache,
    setCurrentCity,
    getCityById,
    getLastCityId,
    clearCurrentCity,
    createCity,
    updateCity,
    initializeDefaultCities
  }
})
