import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import {
  setupRequestInterceptor,
  setupResponseInterceptor,
  createAuthenticatedClient
} from '@/api/interceptors/auth.interceptor'

// Mock dependencies
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn()
}))

vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

describe('Auth Interceptor', () => {
  let mockStore: any
  let axiosInstance: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Setup mock store
    mockStore = {
      token: 'test-token',
      refreshToken: 'refresh-token',
      logout: vi.fn(),
      refreshAccessToken: vi.fn()
    }
    vi.mocked(useUserStore).mockReturnValue(mockStore)

    // Create a new axios instance for testing
    axiosInstance = axios.create()
  })

  afterEach(() => {
    // Clear interceptors
    axiosInstance.interceptors.request.clear()
    axiosInstance.interceptors.response.clear()
  })

  describe('Request Interceptor', () => {
    beforeEach(() => {
      setupRequestInterceptor(axiosInstance)
    })

    it('应该在请求头中添加token', async () => {
      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
        url: '/test',
        method: 'get'
      } as InternalAxiosRequestConfig

      // Get the request interceptor
      const interceptor = axiosInstance.interceptors.request.handlers[0]
      const result = await interceptor.fulfilled(config)

      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('应该在没有token时不添加Authorization header', async () => {
      mockStore.token = null

      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
        url: '/test',
        method: 'get'
      } as InternalAxiosRequestConfig

      const interceptor = axiosInstance.interceptors.request.handlers[0]
      const result = await interceptor.fulfilled(config)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('应该正确处理请求错误', async () => {
      const error = new Error('Request error')
      const interceptor = axiosInstance.interceptors.request.handlers[0]

      await expect(interceptor.rejected(error)).rejects.toEqual(error)
    })
  })

  describe('Response Interceptor', () => {
    beforeEach(() => {
      setupResponseInterceptor(axiosInstance)
    })

    it('应该正常返回成功的响应', async () => {
      const response = { data: 'test', status: 200 }
      const interceptor = axiosInstance.interceptors.response.handlers[0]
      
      const result = await interceptor.fulfilled(response)
      expect(result).toEqual(response)
    })

    describe('401错误处理', () => {
      it('应该在token过期时尝试刷新', async () => {
        mockStore.refreshAccessToken.mockResolvedValue('new-token')

        const error = {
          response: { status: 401 },
          config: {
            url: '/api/data',
            headers: {} as any,
            _retry: undefined
          }
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        // Mock axios instance call
        const mockAxiosCall = vi.fn().mockResolvedValue({ data: 'retry-success' })
        axiosInstance.request = mockAxiosCall

        await interceptor.rejected(error)

        // 验证刷新token被调用
        expect(mockStore.refreshAccessToken).toHaveBeenCalled()
        
        // 验证原始请求被重试
        expect(mockAxiosCall).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/api/data',
            headers: expect.objectContaining({
              Authorization: 'Bearer new-token'
            })
          })
        )
      })

      it('应该在刷新token失败时退出登录', async () => {
        mockStore.refreshAccessToken.mockRejectedValue(new Error('Refresh failed'))

        const error = {
          response: { status: 401 },
          config: {
            url: '/api/data',
            headers: {} as any
          }
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()

        // 验证退出登录被调用
        expect(mockStore.logout).toHaveBeenCalled()
        expect(router.push).toHaveBeenCalledWith('/login')
        expect(ElMessage.error).toHaveBeenCalledWith('登录已过期，请重新登录')
      })

      it('应该在刷新token请求返回401时直接退出', async () => {
        const error = {
          response: { status: 401 },
          config: {
            url: '/auth/refresh',
            headers: {} as any
          }
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()

        // 不应该尝试刷新
        expect(mockStore.refreshAccessToken).not.toHaveBeenCalled()
        
        // 应该直接退出
        expect(mockStore.logout).toHaveBeenCalled()
        expect(router.push).toHaveBeenCalledWith('/login')
      })

      it('应该避免重复刷新token', async () => {
        // 设置延迟的刷新操作
        let resolveRefresh: any
        const refreshPromise = new Promise((resolve) => {
          resolveRefresh = resolve
        })
        mockStore.refreshAccessToken.mockReturnValue(refreshPromise)

        const error1 = {
          response: { status: 401 },
          config: {
            url: '/api/data1',
            headers: {} as any
          }
        } as AxiosError

        const error2 = {
          response: { status: 401 },
          config: {
            url: '/api/data2',
            headers: {} as any
          }
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        // Mock axios instance call
        const mockAxiosCall = vi.fn().mockResolvedValue({ data: 'retry-success' })
        axiosInstance.request = mockAxiosCall

        // 同时发起两个401请求
        const promise1 = interceptor.rejected(error1)
        const promise2 = interceptor.rejected(error2)

        // refreshAccessToken 应该只被调用一次
        expect(mockStore.refreshAccessToken).toHaveBeenCalledTimes(1)

        // 完成刷新
        resolveRefresh('new-token')
        await Promise.all([promise1, promise2])

        // 两个请求都应该被重试
        expect(mockAxiosCall).toHaveBeenCalledTimes(2)
      })

      it('应该不重试已经重试过的请求', async () => {
        const error = {
          response: { status: 401 },
          config: {
            url: '/api/data',
            headers: {} as any,
            _retry: true
          }
        } as AxiosError & { config: { _retry: boolean } }

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()

        // 不应该尝试刷新
        expect(mockStore.refreshAccessToken).not.toHaveBeenCalled()
      })
    })

    describe('其他HTTP错误处理', () => {
      it('应该处理400错误', async () => {
        const error = {
          response: {
            status: 400,
            data: { message: '参数错误' }
          },
          config: {} as any
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()
        expect(ElMessage.error).toHaveBeenCalledWith('参数错误')
      })

      it('应该处理403错误', async () => {
        const error = {
          response: { status: 403 },
          config: {} as any
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()
        expect(ElMessage.error).toHaveBeenCalledWith('您没有权限执行此操作')
        expect(router.push).toHaveBeenCalledWith('/403')
      })

      it('应该处理404错误', async () => {
        const error = {
          response: { status: 404 },
          config: {} as any
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()
        expect(ElMessage.error).toHaveBeenCalledWith('请求的资源不存在')
      })

      it('应该处理429错误', async () => {
        const error = {
          response: { status: 429 },
          config: {} as any
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()
        expect(ElMessage.error).toHaveBeenCalledWith('请求过于频繁，请稍后再试')
      })

      it('应该处理500错误', async () => {
        const error = {
          response: { status: 500 },
          config: {} as any
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()
        expect(ElMessage.error).toHaveBeenCalledWith('服务器内部错误')
      })

      it('应该处理未知状态码', async () => {
        const error = {
          response: {
            status: 999,
            data: {}
          },
          config: {} as any
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败(999)')
      })

      it('应该处理网络错误', async () => {
        const error = {
          request: {},
          config: {} as any
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()
        expect(ElMessage.error).toHaveBeenCalledWith('网络连接失败，请检查网络设置')
      })

      it('应该处理请求配置错误', async () => {
        const error = {
          message: 'Config error',
          config: {} as any
        } as AxiosError

        const interceptor = axiosInstance.interceptors.response.handlers[0]

        await expect(interceptor.rejected(error)).rejects.toBeTruthy()
        expect(ElMessage.error).toHaveBeenCalledWith('请求配置错误')
      })
    })
  })

  describe('createAuthenticatedClient', () => {
    it('应该创建带有拦截器的axios实例', () => {
      const client = createAuthenticatedClient('http://test.com')

      expect(client).toBeDefined()
      expect(client.defaults.baseURL).toBe('http://test.com')
      expect(client.defaults.timeout).toBe(15000)
      expect(client.defaults.headers['Content-Type']).toBe('application/json')
      
      // 检查拦截器是否被添加
      expect(client.interceptors.request.handlers.length).toBeGreaterThan(0)
      expect(client.interceptors.response.handlers.length).toBeGreaterThan(0)
    })

    it('应该使用默认baseURL', () => {
      const originalEnv = import.meta.env.VITE_API_BASE_URL
      import.meta.env.VITE_API_BASE_URL = 'http://env-url.com'

      const client = createAuthenticatedClient()
      expect(client.defaults.baseURL).toBe('http://env-url.com')

      // 恢复原始值
      import.meta.env.VITE_API_BASE_URL = originalEnv
    })

    it('应该在没有环境变量时使用localhost', () => {
      const originalEnv = import.meta.env.VITE_API_BASE_URL
      delete import.meta.env.VITE_API_BASE_URL

      const client = createAuthenticatedClient()
      expect(client.defaults.baseURL).toBe('http://localhost:3000')

      // 恢复原始值
      if (originalEnv !== undefined) {
        import.meta.env.VITE_API_BASE_URL = originalEnv
      }
    })
  })
})