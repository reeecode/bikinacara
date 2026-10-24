import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import UserDashboard from '../components/UserDashboard.vue'
import BuilderPage from '../views/BuilderPage.vue'
import PublicEventPage from '../views/PublicEventPage.vue'
import { AUTH_SERVICE } from '../services/turso.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: UserDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/builder',
    name: 'Builder',
    component: BuilderPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/:slug',
    name: 'PublicEvent',
    component: PublicEventPage
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation Guard untuk proteksi route auth
router.beforeEach((to, from, next) => {
  const user = AUTH_SERVICE.getCurrentUser()
  if (to.meta.requiresAuth && !user) {
    next({ path: '/', query: { auth: 'login', redirect: to.fullPath } })
  } else {
    next()
  }
})
