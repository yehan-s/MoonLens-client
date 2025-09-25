import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 请求队列，用于处理token刷新时的并发请求
interface PendingRequest {
  resolve: (value?: any) => void
  reject: (error?: any) => void
  config: InternalAxiosRequestConfig
}

let isRefreshing = false
let pendingRequests: PendingRequest[] = []

// 处理待处理的请求队列
const processPendingRequests = (error?: any, token?: string) => {
  pendingRequests.forEach(request => {
    if (error) {
      request.reject(error)
    } else if (token) {
      request.config.headers.Authorization = `Bearer ${token}`
      request.resolve(request.config)
    }
  })
  pendingRequests = []
}

// 创建请求拦截器
export const setupRequestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const userStore = useUserStore()
      const token = userStore.token
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}

// 创建响应拦截器
export const setupResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const userStore = useUserStore()
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      
      // 处理401未授权错误
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        // 如果是刷新token的请求返回401，直接退出登录
        if (originalRequest.url?.includes('/auth/refresh')) {
          userStore.logout()
          router.push('/login')
          ElMessage.error('登录已过期，请重新登录')
          return Promise.reject(error)
        }
        
        originalRequest._retry = true
        
        // 如果正在刷新token，将请求加入队列
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject, config: originalRequest })
          }).then(config => {
            return instance(config)
          })
        }
        
        isRefreshing = true
        
        try {
          // 尝试刷新token
          const newToken = await userStore.refreshAccessToken()
          
          if (newToken) {
            // 更新原始请求的token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            
            // 处理队列中的请求
            processPendingRequests(null, newToken)
            
            // 重试原始请求
            return instance(originalRequest)
          } else {
            throw new Error('Token refresh failed')
          }
        } catch (refreshError) {
          // 刷新失败，处理队列并退出登录
          processPendingRequests(refreshError)
          userStore.logout()
          router.push('/login')
          ElMessage.error('登录已过期，请重新登录')
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
      
      // 处理其他HTTP错误
      if (error.response) {
        switch (error.response.status) {
          case 400:
            ElMessage.error((error.response.data as any)?.message || '请求参数错误')
            break
          case 403:
            ElMessage.error('您没有权限执行此操作')
            router.push('/403')
            break
          case 404:
            ElMessage.error('请求的资源不存在')
            break
          case 429:
            ElMessage.error('请求过于频繁，请稍后再试')
            break
          case 500:
            ElMessage.error('服务器内部错误')
            break
          default:
            ElMessage.error((error.response.data as any)?.message || `请求失败(${error.response.status})`)
        }
      } else if (error.request) {
        ElMessage.error('网络连接失败，请检查网络设置')
      } else {
        ElMessage.error('请求配置错误')
      }
      
      return Promise.reject(error)
    }
  )
}

// 创建带拦截器的axios实例
export const createAuthenticatedClient = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  setupRequestInterceptor(instance)
  setupResponseInterceptor(instance)
  
  return instance
}

// 默认导出
export default {
  setupRequestInterceptor,
  setupResponseInterceptor,
  createAuthenticatedClient
}