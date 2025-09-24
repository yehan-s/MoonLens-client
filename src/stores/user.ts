import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'developer' | 'reviewer'
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const token = ref<string>('')

  // 登录
  const login = async (username: string, password: string) => {
    try {
      // TODO: 调用登录 API
      const mockUser: User = {
        id: '1',
        username,
        email: `${username}@moonlens.com`,
        role: 'admin'
      }
      
      currentUser.value = mockUser
      isAuthenticated.value = true
      token.value = 'mock-token-' + Date.now()
      
      // 保存到 localStorage
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 登出
  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 从 localStorage 恢复用户状态
  const restoreAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser)
        token.value = savedToken
        isAuthenticated.value = true
      } catch (error) {
        console.error('恢复用户状态失败:', error)
        logout()
      }
    }
  }

  return {
    currentUser,
    isAuthenticated,
    token,
    login,
    logout,
    restoreAuth
  }
})