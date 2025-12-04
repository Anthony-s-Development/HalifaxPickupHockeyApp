import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCityStore } from '@/stores/city'

const routes = [
  // City selection landing page
  {
    path: '/',
    name: 'CitySelect',
    component: () => import('@/views/CitySelectPage.vue')
  },

  // Auth routes (city-agnostic)
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue')
  },

  // City-scoped routes
  {
    path: '/:cityId',
    name: 'CityHome',
    component: () => import('@/views/HomePage.vue'),
    meta: { requiresCity: true }
  },
  {
    path: '/:cityId/about',
    name: 'About',
    component: () => import('@/views/AboutPage.vue'),
    meta: { requiresCity: true }
  },
  {
    path: '/:cityId/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true, requiresCity: true }
  },
  {
    path: '/:cityId/checkin/:gameId',
    name: 'CheckIn',
    component: () => import('@/views/CheckInPage.vue'),
    meta: { requiresAuth: true, requiresCity: true }
  },
  {
    path: '/:cityId/admin',
    name: 'Admin',
    component: () => import('@/views/AdminPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, requiresCity: true }
  },
  {
    path: '/:cityId/admin/edit-user/:userId',
    name: 'EditUser',
    component: () => import('@/views/EditUserPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, requiresCity: true }
  },
  {
    path: '/:cityId/admin/manage-teams/:gameId',
    name: 'ManageTeams',
    component: () => import('@/views/ManageTeamsPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, requiresCity: true }
  },

  // Payment routes
  {
    path: '/:cityId/payment-success',
    name: 'PaymentSuccess',
    component: () => import('@/views/PaymentSuccessPage.vue'),
    meta: { requiresCity: true }
  },
  {
    path: '/:cityId/payment-cancel',
    name: 'PaymentCancel',
    component: () => import('@/views/PaymentCancelPage.vue'),
    meta: { requiresCity: true }
  },

  // Catch-all redirect to city select
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const cityStore = useCityStore()

  // Initialize auth if needed
  if (authStore.loading) {
    await authStore.initAuth()
  }

  // Load cities if not loaded
  if (!cityStore.citiesLoaded) {
    await cityStore.loadCities()
  }

  // Handle city-scoped routes
  if (to.meta.requiresCity && to.params.cityId) {
    const cityId = to.params.cityId
    const city = cityStore.getCityById(cityId)

    if (!city) {
      // Invalid city, redirect to city select
      next({ name: 'CitySelect' })
      return
    }

    // Set current city
    await cityStore.setCurrentCity(cityId)
  }

  // Check authentication
  if (to.meta.requiresAuth && !authStore.user) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Check admin permissions (city-admin or super-admin)
  if (to.meta.requiresAdmin) {
    const cityId = to.params.cityId
    const isCityAdmin = authStore.isCityAdmin(cityId)
    const isSuperAdmin = authStore.isSuperAdmin

    if (!isCityAdmin && !isSuperAdmin) {
      // Redirect to city home if not admin
      if (cityId) {
        next({ name: 'CityHome', params: { cityId } })
      } else {
        next({ name: 'CitySelect' })
      }
      return
    }
  }

  next()
})

export default router
