import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'

// 配置全局插件
config.global.plugins = [ElementPlus, createPinia()]

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

const sessionStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

global.localStorage = localStorageMock
global.sessionStorage = sessionStorageMock

// Mock window.location
delete (window as any).location
window.location = { href: '', replace: vi.fn() } as any