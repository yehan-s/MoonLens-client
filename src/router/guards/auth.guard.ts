import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'

/**
 * 认证守卫
 * 检查用户是否已登录，未登录则重定向到登录页
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  
  // 首次加载时尝试恢复认证状态
  if (!userStore.currentUser && !userStore.isAuthenticated) {
    await userStore.restoreAuth()
  }
  
  // 检查认证状态
  if (userStore.checkAuth()) {
    // 已认证，允许访问
    next()
  } else {
    // 未认证，重定向到登录页
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}

/**
 * 游客守卫
 * 用于登录、注册等页面，已登录用户会被重定向到首页
 */
export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  
  if (userStore.checkAuth()) {
    // 已登录，重定向到首页或指定页面
    const redirect = to.query.redirect as string
    next(redirect || '/dashboard')
  } else {
    // 未登录，允许访问
    next()
  }
}

/**
 * 角色守卫
 * 检查用户是否有权限访问特定角色的页面
 */
export const roleGuard = (allowedRoles: string[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const userStore = useUserStore()
    
    if (!userStore.checkAuth()) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    const userRole = userStore.userRole
    
    if (userRole && allowedRoles.includes(userRole)) {
      // 有权限，允许访问
      next()
    } else {
      // 无权限，显示错误并重定向
      ElMessage.error('您没有权限访问此页面')
      next('/dashboard')
    }
  }
}

/**
 * 设置页面标题守卫
 */
export const titleGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // 设置页面标题
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - MoonLens`
  } else {
    document.title = 'MoonLens'
  }
  next()
}

/**
 * 进度条守卫（可选）
 * 在路由切换时显示进度条
 */
export const progressGuard = {
  before: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    // 开始进度条（如果使用了 NProgress 或类似库）
    // NProgress.start()
    next()
  },
  after: () => {
    // 结束进度条
    // NProgress.done()
  }
}