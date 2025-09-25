import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'developer' | 'reviewer'
  avatar?: string
  createdAt?: string
  lastLogin?: string
  preferences?: {
    theme?: 'light' | 'dark'
    language?: string
    notifications?: boolean
  }
}

export interface LoginCredentials {
  username?: string
  email?: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const userRole = computed(() => currentUser.value?.role || null)
  const userName = computed(() => currentUser.value?.username || '')
  const userEmail = computed(() => currentUser.value?.email || '')
  const userAvatar = computed(() => currentUser.value?.avatar || '')

  // 设置认证头
  const setAuthHeader = (accessToken: string) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  // 清除认证头
  const clearAuthHeader = () => {
    delete axios.defaults.headers.common['Authorization']
  }

  // 登录
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: 调用真实登录 API
      // const response = await axios.post('/api/auth/login', credentials)
      // const { user, accessToken, refreshToken: refresh } = response.data
      
      // 模拟登录响应
      const mockUser: User = {
        id: '1',
        username: credentials.username || credentials.email?.split('@')[0] || 'user',
        email: credentials.email || `${credentials.username}@moonlens.com`,
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
      
      const mockToken = 'mock-access-token-' + Date.now()
      const mockRefreshToken = 'mock-refresh-token-' + Date.now()
      
      currentUser.value = mockUser
      isAuthenticated.value = true
      token.value = mockToken
      refreshToken.value = mockRefreshToken
      
      // 设置认证头
      setAuthHeader(mockToken)
      
      // 保存到 localStorage
      if (credentials.rememberMe) {
        localStorage.setItem('token', mockToken)
        localStorage.setItem('refreshToken', mockRefreshToken)
        localStorage.setItem('user', JSON.stringify(mockUser))
      } else {
        sessionStorage.setItem('token', mockToken)
        sessionStorage.setItem('refreshToken', mockRefreshToken)
        sessionStorage.setItem('user', JSON.stringify(mockUser))
      }
      
      loading.value = false
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || '登录失败，请检查用户名和密码'
      loading.value = false
      console.error('登录失败:', err)
      return false
    }
  }

  // 注册
  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: 调用真实注册 API
      // const response = await axios.post('/api/auth/register', data)
      
      // 模拟注册成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      loading.value = false
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || '注册失败，请重试'
      loading.value = false
      console.error('注册失败:', err)
      return false
    }
  }

  // 登出
  const logout = async () => {
    try {
      // TODO: 调用登出 API 使服务器端 token 失效
      // await axios.post('/api/auth/logout')
      
      currentUser.value = null
      isAuthenticated.value = false
      token.value = ''
      refreshToken.value = ''
      error.value = null
      
      clearAuthHeader()
      
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('refreshToken')
      sessionStorage.removeItem('user')
    } catch (err) {
      console.error('登出失败:', err)
    }
  }

  // 刷新 Token
  const refreshAccessToken = async () => {
    try {
      const currentRefreshToken = refreshToken.value || 
                                 localStorage.getItem('refreshToken') || 
                                 sessionStorage.getItem('refreshToken')
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }
      
      // TODO: 调用真实刷新 Token API
      // const response = await axios.post('/api/auth/refresh', {
      //   refreshToken: currentRefreshToken
      // })
      // const { accessToken, refreshToken: newRefreshToken } = response.data
      
      // 模拟刷新 Token
      const newAccessToken = 'mock-access-token-' + Date.now()
      const newRefreshToken = 'mock-refresh-token-' + Date.now()
      
      token.value = newAccessToken
      refreshToken.value = newRefreshToken
      
      setAuthHeader(newAccessToken)
      
      // 更新存储
      if (localStorage.getItem('token')) {
        localStorage.setItem('token', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
      } else {
        sessionStorage.setItem('token', newAccessToken)
        sessionStorage.setItem('refreshToken', newRefreshToken)
      }
      
      return newAccessToken
    } catch (err) {
      console.error('刷新 Token 失败:', err)
      await logout()
      throw err
    }
  }

  // 获取当前用户信息
  const fetchUserProfile = async () => {
    try {
      // TODO: 调用真实获取用户信息 API
      // const response = await axios.get('/api/auth/me')
      // currentUser.value = response.data
      
      return currentUser.value
    } catch (err) {
      console.error('获取用户信息失败:', err)
      return null
    }
  }

  // 更新用户信息
  const updateProfile = async (data: Partial<User>) => {
    try {
      // TODO: 调用真实更新用户信息 API
      // const response = await axios.put('/api/auth/profile', data)
      // currentUser.value = response.data
      
      // 模拟更新
      if (currentUser.value) {
        currentUser.value = { ...currentUser.value, ...data }
        
        // 更新存储
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(currentUser.value))
        } else {
          sessionStorage.setItem('user', JSON.stringify(currentUser.value))
        }
      }
      
      return true
    } catch (err) {
      console.error('更新用户信息失败:', err)
      return false
    }
  }

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      // TODO: 调用真实修改密码 API
      // await axios.post('/api/auth/change-password', {
      //   oldPassword,
      //   newPassword
      // })
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || '修改密码失败'
      console.error('修改密码失败:', err)
      return false
    }
  }

  // 从存储恢复用户状态
  const restoreAuth = async () => {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    const savedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser)
        token.value = savedToken
        refreshToken.value = savedRefreshToken || ''
        isAuthenticated.value = true
        
        setAuthHeader(savedToken)
        
        // 验证 token 是否仍然有效
        await fetchUserProfile()
      } catch (err) {
        console.error('恢复用户状态失败:', err)
        await logout()
      }
    }
  }

  // 检查认证状态
  const checkAuth = () => {
    return isAuthenticated.value && !!token.value
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    currentUser,
    isAuthenticated,
    token,
    refreshToken,
    loading,
    error,
    // 计算属性
    userRole,
    userName,
    userEmail,
    userAvatar,
    // 方法
    login,
    register,
    logout,
    refreshAccessToken,
    fetchUserProfile,
    updateProfile,
    changePassword,
    restoreAuth,
    checkAuth,
    clearError
  }
})