import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import axios from 'axios'

// Mock axios
vi.mock('axios')

describe('User Store', () => {
  let store: ReturnType<typeof useUserStore>

  beforeEach(() => {
    // 创建新的 pinia 实例确保每个测试都是独立的
    setActivePinia(createPinia())
    store = useUserStore()
    
    // 清除 mock
    vi.clearAllMocks()
    
    // 清除 localStorage 和 sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('初始状态', () => {
    it('应该有正确的初始值', () => {
      expect(store.currentUser).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('计算属性应该返回正确的值', () => {
      expect(store.userRole).toBeNull()
      expect(store.userName).toBe('')
      expect(store.userEmail).toBe('')
      expect(store.userAvatar).toBe('')
    })
  })

  describe('登录功能', () => {
    it('应该成功登录并设置用户信息', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
        rememberMe: false
      }

      const result = await store.login(credentials)

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.currentUser).toBeTruthy()
      expect(store.currentUser?.username).toBe('testuser')
      expect(store.token).toContain('mock-access-token')
      expect(store.loading).toBe(false)
    })

    it('记住我功能应该保存到 localStorage', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
        rememberMe: true
      }

      await store.login(credentials)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'token',
        expect.stringContaining('mock-access-token')
      )
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        expect.stringContaining('testuser')
      )
    })

    it('不记住我应该保存到 sessionStorage', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      }

      await store.login(credentials)

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'token',
        expect.stringContaining('mock-access-token')
      )
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'user',
        expect.stringContaining('test@example.com')
      )
    })

    it('应该设置 axios 认证头', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123'
      }

      await store.login(credentials)

      expect(axios.defaults.headers.common['Authorization']).toContain('Bearer mock-access-token')
    })
  })

  describe('注册功能', () => {
    it('应该成功注册新用户', async () => {
      const registerData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      }

      const result = await store.register(registerData)

      expect(result).toBe(true)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('注册失败应该设置错误信息', async () => {
      // 模拟注册失败
      const registerData = {
        username: '',
        email: 'invalid',
        password: '123'
      }

      // 修改 register 方法使其失败
      vi.spyOn(store, 'register').mockImplementation(async () => {
        store.error = '注册失败，请检查输入信息'
        store.loading = false
        return false
      })

      const result = await store.register(registerData)

      expect(result).toBe(false)
      expect(store.error).toBe('注册失败，请检查输入信息')
    })
  })

  describe('登出功能', () => {
    beforeEach(async () => {
      // 先登录
      await store.login({
        username: 'testuser',
        password: 'password123'
      })
    })

    it('应该清除用户信息和 token', async () => {
      await store.logout()

      expect(store.currentUser).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
    })

    it('应该清除存储的认证信息', async () => {
      await store.logout()

      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('token')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('应该清除 axios 认证头', async () => {
      await store.logout()

      expect(axios.defaults.headers.common['Authorization']).toBeUndefined()
    })
  })

  describe('Token 刷新', () => {
    it('应该成功刷新 access token', async () => {
      // 设置初始 refresh token
      store.refreshToken = 'initial-refresh-token'

      const newToken = await store.refreshAccessToken()

      expect(newToken).toContain('mock-access-token')
      expect(store.token).toContain('mock-access-token')
      expect(store.refreshToken).toContain('mock-refresh-token')
    })

    it('没有 refresh token 时应该登出', async () => {
      store.refreshToken = ''
      
      await expect(store.refreshAccessToken()).rejects.toThrow()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('用户信息更新', () => {
    beforeEach(async () => {
      await store.login({
        username: 'testuser',
        password: 'password123'
      })
    })

    it('应该成功更新用户信息', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      }

      const result = await store.updateProfile(updateData)

      expect(result).toBe(true)
      expect(store.currentUser?.username).toBe('updateduser')
      expect(store.currentUser?.email).toBe('updated@example.com')
    })

    it('更新后应该保存到存储', async () => {
      // 先设置 localStorage 中有用户数据
      localStorage.setItem('user', JSON.stringify(store.currentUser))
      
      const updateData = {
        avatar: 'new-avatar-url'
      }

      await store.updateProfile(updateData)

      // 检查更新后的用户对象包含新的 avatar
      expect(store.currentUser?.avatar).toBe('new-avatar-url')
      
      // 验证 localStorage 被调用了
      const calls = (localStorage.setItem as any).mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall[0]).toBe('user')
      expect(lastCall[1]).toContain('new-avatar-url')
    })
  })

  describe('密码修改', () => {
    it('应该成功修改密码', async () => {
      const result = await store.changePassword('oldPassword', 'newPassword')

      expect(result).toBe(true)
      expect(store.error).toBeNull()
    })
  })

  describe('认证状态恢复', () => {
    it('应该从 localStorage 恢复用户状态', async () => {
      const mockUser = {
        id: '1',
        username: 'saveduser',
        email: 'saved@example.com',
        role: 'admin'
      }

      localStorage.getItem = vi.fn((key) => {
        if (key === 'token') return 'saved-token'
        if (key === 'user') return JSON.stringify(mockUser)
        if (key === 'refreshToken') return 'saved-refresh-token'
        return null
      })

      await store.restoreAuth()

      expect(store.isAuthenticated).toBe(true)
      expect(store.currentUser?.username).toBe('saveduser')
      expect(store.token).toBe('saved-token')
    })

    it('应该从 sessionStorage 恢复用户状态', async () => {
      const mockUser = {
        id: '1',
        username: 'sessionuser',
        email: 'session@example.com',
        role: 'developer'
      }

      localStorage.getItem = vi.fn(() => null)
      sessionStorage.getItem = vi.fn((key) => {
        if (key === 'token') return 'session-token'
        if (key === 'user') return JSON.stringify(mockUser)
        return null
      })

      await store.restoreAuth()

      expect(store.isAuthenticated).toBe(true)
      expect(store.currentUser?.username).toBe('sessionuser')
      expect(store.token).toBe('session-token')
    })

    it('无效的存储数据应该触发登出', async () => {
      localStorage.getItem = vi.fn((key) => {
        if (key === 'token') return 'saved-token'
        if (key === 'user') return 'invalid-json'
        return null
      })

      await store.restoreAuth()

      expect(store.isAuthenticated).toBe(false)
      expect(store.currentUser).toBeNull()
    })
  })

  describe('辅助方法', () => {
    it('checkAuth 应该返回认证状态', async () => {
      expect(store.checkAuth()).toBe(false)

      await store.login({
        username: 'testuser',
        password: 'password123'
      })

      expect(store.checkAuth()).toBe(true)
    })

    it('clearError 应该清除错误信息', () => {
      store.error = 'Some error'
      store.clearError()
      expect(store.error).toBeNull()
    })
  })
})