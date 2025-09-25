import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard, guestGuard, titleGuard, roleGuard } from './guards/auth.guard'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
    beforeEnter: guestGuard
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册', requiresAuth: false },
    beforeEnter: guestGuard
  },
  {
    path: '/password-reset',
    name: 'PasswordReset',
    component: () => import('../views/PasswordReset.vue'),
    meta: { title: '重置密码', requiresAuth: false },
    beforeEnter: guestGuard
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '仪表盘', requiresAuth: true },
    beforeEnter: authGuard
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Projects.vue'),
    meta: { title: '项目管理', requiresAuth: true },
    beforeEnter: authGuard
  },
  {
    path: '/review/:projectId',
    name: 'CodeReview',
    component: () => import('../views/CodeReview.vue'),
    meta: { title: '代码审查', requiresAuth: true },
    beforeEnter: authGuard
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: { title: '审查报告', requiresAuth: true },
    beforeEnter: authGuard
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '系统设置', requiresAuth: true, requiredRoles: ['admin'] },
    beforeEnter: [authGuard, roleGuard(['admin'])]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人资料', requiresAuth: true },
    beforeEnter: authGuard
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/errors/403.vue'),
    meta: { title: '无权访问' }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/errors/404.vue'),
    meta: { title: '页面未找到' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  titleGuard(to, from, next)
})

// 全局后置钩子
router.afterEach(() => {
  // 可以在这里添加进度条完成等逻辑
  window.scrollTo(0, 0)
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router