# Structure & Conventions Document

## Directory Structure

### 项目根目录结构
```
moonlens-client/
├── src/                    # 源代码目录
├── public/                 # 静态资源
├── tests/                  # 测试文件
├── docs/                   # 项目文档
├── scripts/                # 构建和部署脚本
├── .vscode/                # VSCode配置
├── .github/                # GitHub配置
├── .spec-workflow/         # 规范工作流
│   ├── steering/           # 项目指导文档
│   ├── specs/              # 功能规范
│   └── templates/          # 文档模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── uno.config.ts           # UnoCSS配置
├── .env.example            # 环境变量示例
├── .eslintrc.js            # ESLint配置
├── .prettierrc             # Prettier配置
└── README.md               # 项目说明
```

### 源代码目录结构
```
src/
├── assets/                 # 静态资源
│   ├── images/            # 图片资源
│   ├── icons/             # 图标资源
│   └── styles/            # 全局样式
│       ├── variables.css  # CSS变量
│       ├── reset.css      # 样式重置
│       └── utilities.css  # 工具类
│
├── components/             # 组件库
│   ├── common/            # 通用组件
│   │   ├── AppButton/     # 按钮组件
│   │   ├── AppInput/      # 输入框组件
│   │   ├── AppModal/      # 弹窗组件
│   │   └── AppTable/      # 表格组件
│   ├── layout/            # 布局组件
│   │   ├── AppHeader/     # 顶部导航
│   │   ├── AppSidebar/    # 侧边栏
│   │   └── AppFooter/     # 页脚
│   └── business/          # 业务组件
│       ├── ProjectCard/   # 项目卡片
│       ├── ReviewPanel/   # 审查面板
│       └── CodeDiff/      # 代码对比
│
├── composables/            # 组合式函数
│   ├── useAuth.ts         # 认证逻辑
│   ├── useApi.ts          # API调用
│   ├── useWebSocket.ts    # WebSocket连接
│   ├── useNotification.ts # 通知管理
│   └── useTheme.ts        # 主题切换
│
├── views/                  # 页面视图
│   ├── auth/              # 认证相关页面
│   │   ├── LoginView.vue  # 登录页
│   │   └── RegisterView.vue # 注册页
│   ├── dashboard/         # 仪表板
│   │   ├── DashboardView.vue # 概览页
│   │   └── components/    # 页面组件
│   ├── projects/          # 项目管理
│   │   ├── ProjectList.vue # 项目列表
│   │   ├── ProjectDetail.vue # 项目详情
│   │   └── ProjectSettings.vue # 项目设置
│   ├── reviews/           # 代码审查
│   │   ├── ReviewList.vue # 审查列表
│   │   └── ReviewDetail.vue # 审查详情
│   └── settings/          # 系统设置
│       ├── ProfileSettings.vue # 个人设置
│       └── TeamSettings.vue # 团队设置
│
├── stores/                 # Pinia状态管理
│   ├── modules/           # 状态模块
│   │   ├── user.ts        # 用户状态
│   │   ├── project.ts     # 项目状态
│   │   ├── review.ts      # 审查状态
│   │   └── notification.ts # 通知状态
│   └── index.ts           # Store入口
│
├── services/               # 服务层
│   ├── api/               # API服务
│   │   ├── auth.ts        # 认证API
│   │   ├── project.ts     # 项目API
│   │   ├── review.ts      # 审查API
│   │   └── webhook.ts     # Webhook API
│   ├── gitlab/            # GitLab集成
│   │   ├── client.ts      # GitLab客户端
│   │   └── types.ts       # GitLab类型
│   └── websocket/         # WebSocket服务
│       ├── client.ts      # WS客户端
│       └── events.ts      # 事件定义
│
├── router/                 # 路由配置
│   ├── routes/            # 路由模块
│   │   ├── auth.ts        # 认证路由
│   │   ├── dashboard.ts   # 仪表板路由
│   │   └── projects.ts    # 项目路由
│   ├── guards.ts          # 路由守卫
│   └── index.ts           # 路由入口
│
├── utils/                  # 工具函数
│   ├── constants.ts       # 常量定义
│   ├── helpers.ts         # 辅助函数
│   ├── validators.ts      # 验证函数
│   ├── formatters.ts      # 格式化函数
│   └── storage.ts         # 存储封装
│
├── types/                  # TypeScript类型
│   ├── api.d.ts           # API类型
│   ├── models.d.ts        # 数据模型
│   ├── components.d.ts    # 组件类型
│   └── global.d.ts        # 全局类型
│
├── locales/                # 国际化
│   ├── zh-CN/             # 中文
│   │   ├── common.json    # 通用文本
│   │   ├── pages.json     # 页面文本
│   │   └── messages.json  # 提示信息
│   └── en-US/             # 英文
│
├── App.vue                 # 根组件
├── main.ts                 # 应用入口
└── env.d.ts               # 环境变量类型
```

## Component Organization

### 组件文件结构
```
components/common/AppButton/
├── AppButton.vue          # 组件实现
├── AppButton.test.ts      # 单元测试
├── AppButton.stories.ts   # Storybook故事
├── types.ts              # 组件类型定义
├── style.module.css      # 组件样式
└── index.ts              # 导出入口
```

### 组件命名规范
1. **文件命名**
   - 组件文件: PascalCase (AppButton.vue)
   - 样式文件: kebab-case (app-button.css)
   - 测试文件: 同组件名.test.ts

2. **组件命名**
   ```vue
   <!-- 单文件组件 -->
   <script setup lang="ts" name="AppButton">
   // 组件逻辑
   </script>
   ```

3. **Props命名**
   ```typescript
   interface ButtonProps {
     type?: 'primary' | 'secondary'  // 小驼峰
     isDisabled?: boolean            // 布尔值加is前缀
     onClick?: () => void            // 事件加on前缀
   }
   ```

## Code Patterns

### Vue 3 Composition API模式
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useApi } from '@/composables/useApi'
import type { Project } from '@/types/models'

// Props定义
interface Props {
  projectId: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false
})

// Emits定义
const emit = defineEmits<{
  update: [project: Project]
  delete: [id: string]
}>()

// 响应式状态
const loading = ref(false)
const project = ref<Project | null>(null)

// 组合式函数
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { fetchProject } = useApi()

// 计算属性
const isOwner = computed(() => {
  return project.value?.ownerId === userStore.userId
})

// 方法
const loadProject = async () => {
  loading.value = true
  try {
    project.value = await fetchProject(props.projectId)
  } catch (error) {
    console.error('Failed to load project:', error)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadProject()
})
</script>
```

### Store模式 (Pinia)
```typescript
// stores/modules/project.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '@/types/models'
import { projectApi } from '@/services/api/project'

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const projectCount = computed(() => projects.value.length)
  const activeProjects = computed(() => 
    projects.value.filter(p => p.status === 'active')
  )

  // Actions
  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      projects.value = await projectApi.getList()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function selectProject(id: string) {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      currentProject.value = project
    } else {
      currentProject.value = await projectApi.getById(id)
    }
  }

  function $reset() {
    projects.value = []
    currentProject.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    projects,
    currentProject,
    loading,
    error,
    // Getters
    projectCount,
    activeProjects,
    // Actions
    fetchProjects,
    selectProject,
    $reset
  }
})
```

### API服务模式
```typescript
// services/api/base.ts
import axios, { AxiosInstance } from 'axios'
import { useUserStore } from '@/stores/user'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const userStore = useUserStore()
        if (userStore.token) {
          config.headers.Authorization = `Bearer ${userStore.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          const userStore = useUserStore()
          userStore.logout()
        }
        return Promise.reject(error)
      }
    )
  }

  get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params })
  }

  post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data)
  }

  put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data)
  }

  delete<T>(url: string): Promise<T> {
    return this.client.delete(url)
  }
}

export const apiClient = new ApiClient()
```

### Composable模式
```typescript
// composables/useWebSocket.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

export function useWebSocket(url: string) {
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const messages = ref<any[]>([])

  const connect = () => {
    socket.value = io(url, {
      transports: ['websocket'],
      autoConnect: true
    })

    socket.value.on('connect', () => {
      connected.value = true
    })

    socket.value.on('disconnect', () => {
      connected.value = false
    })

    socket.value.on('message', (data) => {
      messages.value.push(data)
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  const emit = (event: string, data: any) => {
    if (socket.value && connected.value) {
      socket.value.emit(event, data)
    }
  }

  const on = (event: string, handler: Function) => {
    if (socket.value) {
      socket.value.on(event, handler)
    }
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return {
    socket: socket.value,
    connected,
    messages,
    emit,
    on,
    connect,
    disconnect
  }
}
```

## Testing Strategy

### 单元测试结构
```typescript
// components/common/AppButton/AppButton.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from './AppButton.vue'

describe('AppButton', () => {
  describe('Props', () => {
    it('renders with default props', () => {
      const wrapper = mount(AppButton)
      expect(wrapper.classes()).toContain('btn-primary')
    })

    it('applies type prop correctly', () => {
      const wrapper = mount(AppButton, {
        props: { type: 'secondary' }
      })
      expect(wrapper.classes()).toContain('btn-secondary')
    })
  })

  describe('Events', () => {
    it('emits click event', async () => {
      const wrapper = mount(AppButton)
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
    })
  })

  describe('Slots', () => {
    it('renders slot content', () => {
      const wrapper = mount(AppButton, {
        slots: {
          default: 'Click me'
        }
      })
      expect(wrapper.text()).toBe('Click me')
    })
  })
})
```

### E2E测试结构
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email-input"]', 'user@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email-input"]', 'invalid@example.com')
    await page.fill('[data-testid="password-input"]', 'wrong')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('.error-message')).toContainText('Invalid credentials')
  })
})
```

## Build & Bundle

### Vite配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['element-plus'],
          'utils': ['axios', 'dayjs', 'lodash-es']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  }
})
```

### 环境配置
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
VITE_GITLAB_URL=https://gitlab.com
VITE_ENABLE_MOCK=true
VITE_LOG_LEVEL=debug

# .env.production
VITE_API_BASE_URL=https://api.moonlens.io/api
VITE_WS_URL=wss://api.moonlens.io
VITE_GITLAB_URL=https://gitlab.com
VITE_ENABLE_MOCK=false
VITE_LOG_LEVEL=error
```

## Development Workflow

### Git工作流
```bash
# 分支命名
main                 # 生产分支
develop              # 开发分支
feature/MOON-123     # 功能分支
bugfix/MOON-456      # 修复分支
release/v1.2.0       # 发布分支
hotfix/critical-bug  # 紧急修复

# Commit规范
feat: 添加项目列表筛选功能
fix: 修复登录页面样式问题
docs: 更新README文档
style: 格式化代码
refactor: 重构API服务层
test: 添加用户认证测试
chore: 更新依赖版本
```

### 开发流程
```bash
# 1. 创建功能分支
git checkout -b feature/MOON-123-project-filter

# 2. 开发和测试
pnpm dev           # 启动开发服务器
pnpm test:unit     # 运行单元测试
pnpm test:e2e      # 运行E2E测试

# 3. 代码检查
pnpm lint          # ESLint检查
pnpm format        # Prettier格式化
pnpm type-check    # TypeScript检查

# 4. 提交代码
git add .
git commit -m "feat: 添加项目列表筛选功能"

# 5. 推送和PR
git push origin feature/MOON-123-project-filter
# 创建Pull Request
```

### 代码审查清单
- [ ] 代码符合项目规范
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 没有console.log
- [ ] 没有注释掉的代码
- [ ] 性能影响评估
- [ ] 安全性考虑
- [ ] 浏览器兼容性

## Style Guide

### CSS/样式规范
```scss
// 使用BEM命名
.project-card {
  &__header {
    // 元素
  }
  &__title {
    // 元素
  }
  &--active {
    // 修饰符
  }
}

// UnoCSS原子类
<div class="flex items-center justify-between p-4 rounded-lg bg-gray-100">
  <span class="text-lg font-semibold text-gray-900">Title</span>
  <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>

// CSS变量
:root {
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### TypeScript规范
```typescript
// 类型优先于接口
type UserRole = 'admin' | 'developer' | 'viewer'

// 接口用于对象结构
interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// 避免any，使用unknown
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase()
  }
  return String(data)
}

// 使用可选链和空值合并
const userName = user?.profile?.name ?? 'Anonymous'

// 使用const断言
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

type Status = typeof STATUS[keyof typeof STATUS]
```

## Documentation Standards

### 组件文档
```vue
<!--
  AppButton.vue
  通用按钮组件
  
  Props:
  - type: 按钮类型 (primary | secondary | danger)
  - size: 按钮大小 (small | medium | large)
  - disabled: 是否禁用
  - loading: 是否加载中
  
  Events:
  - click: 点击事件
  
  Slots:
  - default: 按钮内容
  - icon: 图标插槽
  
  Example:
  <AppButton type="primary" @click="handleClick">
    提交
  </AppButton>
-->
```

### 函数文档
```typescript
/**
 * 格式化日期时间
 * @param date - 日期对象或字符串
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 * @example
 * formatDateTime(new Date()) // '2024-01-15 10:30:00'
 * formatDateTime('2024-01-15', 'MM/DD') // '01/15'
 */
export function formatDateTime(
  date: Date | string,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  // 实现...
}
```

### README模板
```markdown
# 组件/模块名称

## 简介
简短描述组件/模块的功能和用途

## 安装
\`\`\`bash
pnpm add package-name
\`\`\`

## 使用
\`\`\`typescript
import { Component } from 'package-name'
\`\`\`

## API
详细的API文档

## 示例
使用示例和代码片段

## 注意事项
使用时需要注意的问题
```

## Performance Guidelines

### 性能优化清单
1. **组件优化**
   - [ ] 使用v-memo优化大列表
   - [ ] 合理使用v-once
   - [ ] 避免不必要的响应式
   - [ ] 使用shallowRef/shallowReactive

2. **路由优化**
   - [ ] 路由懒加载
   - [ ] 预加载关键路由
   - [ ] 路由级别代码分割

3. **资源优化**
   - [ ] 图片懒加载
   - [ ] 使用WebP格式
   - [ ] 资源压缩
   - [ ] CDN加速

4. **代码优化**
   - [ ] Tree Shaking
   - [ ] 按需引入
   - [ ] 代码分割
   - [ ] 缓存优化

## Security Guidelines

### 安全检查清单
1. **输入验证**
   - [ ] 客户端验证
   - [ ] 服务端验证
   - [ ] XSS防护
   - [ ] SQL注入防护

2. **认证授权**
   - [ ] Token安全存储
   - [ ] 权限验证
   - [ ] 会话管理
   - [ ] 密码策略

3. **数据传输**
   - [ ] HTTPS强制
   - [ ] 敏感数据加密
   - [ ] CORS配置
   - [ ] CSP策略

4. **代码安全**
   - [ ] 依赖安全扫描
   - [ ] 代码安全审计
   - [ ] 敏感信息脱敏
   - [ ] 错误处理

## Maintenance

### 维护清单
1. **定期任务**
   - 每周：依赖更新检查
   - 每月：性能基准测试
   - 每季度：安全审计
   - 每年：架构评审

2. **监控指标**
   - 页面加载时间
   - API响应时间
   - 错误率
   - 用户会话时长

3. **技术债务**
   - TODO注释跟踪
   - 重构计划
   - 测试覆盖率
   - 文档完整性