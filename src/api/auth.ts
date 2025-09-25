import axios, { AxiosInstance, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// API 响应接口
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
}

// 认证相关接口
export interface LoginRequest {
  email?: string
  username?: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: {
    id: string
    username: string
    email: string
    role: string
    avatar?: string
  }
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  user: {
    id: string
    username: string
    email: string
  }
  message: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface ResetPasswordConfirmRequest {
  token: string
  newPassword: string
}

export interface UpdateProfileRequest {
  email?: string
  fullName?: string
  phone?: string
  department?: string
  position?: string
  bio?: string
  avatar?: string
  preferences?: {
    theme?: string
    language?: string
    notifications?: string[]
  }
}

export interface UserProfile {
  id: string
  username: string
  email: string
  role: string
  avatar?: string
  fullName?: string
  phone?: string
  department?: string
  position?: string
  bio?: string
  createdAt: string
  lastLogin?: string
  twoFactorEnabled: boolean
  preferences: {
    theme: string
    language: string
    notifications: string[]
  }
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求时间戳（防止缓存）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    // 处理成功响应
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config
    const userStore = useUserStore()
    
    // 处理 401 错误（未授权）
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新 token，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch((err) => {
          return Promise.reject(err)
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        // 尝试刷新 token
        const newToken = await userStore.refreshAccessToken()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // 刷新失败，跳转到登录页
        await userStore.logout()
        router.push('/login')
        ElMessage.error('登录已过期，请重新登录')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // 处理其他错误
    if (error.response) {
      const { status, data } = error.response as any
      
      switch (status) {
        case 400:
          ElMessage.error(data?.message || '请求参数错误')
          break
        case 403:
          ElMessage.error('没有权限访问此资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 409:
          ElMessage.error(data?.message || '数据冲突')
          break
        case 422:
          ElMessage.error(data?.message || '数据验证失败')
          break
        case 429:
          ElMessage.error('请求过于频繁，请稍后重试')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(data?.message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// Auth API 类
class AuthAPI {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return response.data!
  }
  
  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data)
    return response.data!
  }
  
  /**
   * 用户登出
   */
  async logout(refreshToken?: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken })
  }
  
  /**
   * 刷新 Token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data)
    return response.data!
  }
  
  /**
   * 获取当前用户信息
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/profile')
    return response.data!
  }
  
  /**
   * 更新用户资料
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put<ApiResponse<UserProfile>>('/auth/profile', data)
    return response.data!
  }
  
  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', data)
  }
  
  /**
   * 请求重置密码
   */
  async requestPasswordReset(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/password-reset', data)
  }
  
  /**
   * 确认重置密码
   */
  async confirmPasswordReset(data: ResetPasswordConfirmRequest): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', data)
  }
  
  /**
   * 获取登录历史
   */
  async getLoginHistory(params?: { page?: number; limit?: number }): Promise<any> {
    const response = await apiClient.get<ApiResponse>('/auth/login-history', { params })
    return response.data
  }
  
  /**
   * 获取活动会话
   */
  async getActiveSessions(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/auth/sessions')
    return response.data!
  }
  
  /**
   * 终止会话
   */
  async terminateSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${sessionId}`)
  }
  
  /**
   * 从所有设备登出
   */
  async logoutAllDevices(): Promise<void> {
    await apiClient.post('/auth/logout-all')
  }
  
  /**
   * 启用两步验证
   */
  async enable2FA(): Promise<{ secret: string; qrCode: string }> {
    const response = await apiClient.post<ApiResponse<{ secret: string; qrCode: string }>>('/auth/2fa/enable')
    return response.data!
  }
  
  /**
   * 确认启用两步验证
   */
  async confirm2FA(code: string): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.post<ApiResponse<{ backupCodes: string[] }>>('/auth/2fa/confirm', { code })
    return response.data!
  }
  
  /**
   * 禁用两步验证
   */
  async disable2FA(code: string): Promise<void> {
    await apiClient.post('/auth/2fa/disable', { code })
  }
  
  /**
   * 验证两步验证码
   */
  async verify2FA(code: string): Promise<void> {
    await apiClient.post('/auth/2fa/verify', { code })
  }
}

// 导出 API 实例
export const authAPI = new AuthAPI()

// 导出 axios 实例供其他模块使用
export default apiClient