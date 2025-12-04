import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const THEME_KEY = 'nova-hockey-theme'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or system preference
  const getInitialTheme = () => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const theme = ref(getInitialTheme())

  const isDark = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      theme.value = newTheme
    }
  }

  // Apply theme to document and persist
  const applyTheme = () => {
    document.documentElement.classList.remove('light-theme', 'dark-theme')
    document.documentElement.classList.add(`${theme.value}-theme`)
    document.body.classList.remove('light-theme', 'dark-theme')
    document.body.classList.add(`${theme.value}-theme`)
    localStorage.setItem(THEME_KEY, theme.value)
  }

  // Watch for theme changes and apply
  watch(theme, applyTheme, { immediate: true })

  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem(THEME_KEY)
      if (!stored) {
        theme.value = e.matches ? 'dark' : 'light'
      }
    })
  }

  return {
    theme,
    isDark,
    isLight,
    toggleTheme,
    setTheme,
    applyTheme
  }
})
