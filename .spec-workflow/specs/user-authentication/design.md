# Design: User Authentication System

## Architecture Overview

### 系统架构图
```
┌─────────────────────────────────────────────────────┐
│                   前端 (Vue 3)                       │
├─────────────────────────────────────────────────────┤
│  Login View  │  Register View  │  Profile View      │
│              │                 │                     │
│  ┌────────────────────────────────────────────┐    │
│  │           Pinia Store (Auth)                │    │
│  │  - user state                               │    │
│  │  - login/logout actions                    │    │
│  │  - token management                        │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │           API Service Layer                 │    │
│  │  - axios interceptors                       │    │
│  │  - token refresh                           │    │
│  │  - error handling                          │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────┐
│                  后端 (NestJS)                       │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐    │
│  │            Auth Controller                   │    │
│  │  - /auth/register                           │    │
│  │  - /auth/login                              │    │
│  │  - /auth/refresh                            │    │
│  │  - /auth/logout                             │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │             Auth Service                     │    │
│  │  - user validation                          │    │
│  │  - password hashing                         │    │
│  │  - JWT generation                           │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │           Prisma ORM + MySQL                │    │
│  │  - User table                               │    │
│  │  - Session table                            │    │
│  │  - Role table                               │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Component Design

### 前端组件

#### 1. 认证相关视图组件
```typescript
// src/views/auth/LoginView.vue
interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

// src/views/auth/RegisterView.vue
interface RegisterForm {
  email: string
  username: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

// src/views/auth/ResetPasswordView.vue
interface ResetPasswordForm {
  email?: string
  code?: string
  newPassword?: string
  confirmPassword?: string
}
```

#### 2. Pinia Store设计
```typescript
// src/stores/auth.ts
interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface AuthActions {
  login(credentials: LoginCredentials): Promise<void>
  register(data: RegisterData): Promise<void>
  logout(): Promise<void>
  refreshToken(): Promise<void>
  loadUser(): Promise<void>
  updateProfile(data: UpdateProfileData): Promise<void>
}
```

#### 3. 路由守卫
```typescript
// src/router/guards.ts
export const authGuard: NavigationGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
}
```

### 后端模块设计

#### 1. Auth模块结构
```
src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── local-auth.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── update-profile.dto.ts
└── entities/
    └── user.entity.ts
```

#### 2. 数据库Schema
```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  password      String
  fullName      String?
  avatar        String?
  role          Role      @default(USER)
  isActive      Boolean   @default(true)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  sessions      Session[]
  projects      Project[]
  
  @@map("users")
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  refreshToken String   @unique
  userAgent    String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id])
  
  @@map("sessions")
}

enum Role {
  ADMIN
  USER
  VIEWER
}
```

## API Design

### 认证相关API

#### 1. 用户注册
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### 2. 用户登录
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "user": { ... },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### 3. Token刷新
```
POST /api/auth/refresh
Authorization: Bearer {refresh_token}

Response: 200 OK
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

#### 4. GitLab OAuth回调
```
GET /api/auth/gitlab/callback?code={code}&state={state}

Response: 302 Redirect
Location: /dashboard?token={jwt_token}
```

## Security Design

### 1. 密码安全
- **加密算法**: bcrypt with salt rounds = 10
- **密码策略**: 
  - 最小长度: 8字符
  - 必须包含: 大写字母、小写字母、数字
  - 可选包含: 特殊字符
  - 密码历史: 不允许使用最近3次密码

### 2. JWT Token设计
```typescript
// Access Token Payload
{
  "sub": "user_id",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "USER",
  "iat": 1634567890,
  "exp": 1634571490  // 1 hour
}

// Refresh Token Payload
{
  "sub": "user_id",
  "tokenFamily": "family_id",
  "iat": 1634567890,
  "exp": 1635172690  // 7 days
}
```

### 3. 安全措施
- **HTTPS Only**: 所有认证请求必须通过HTTPS
- **CSRF Protection**: 使用CSRF Token
- **Rate Limiting**: 
  - 登录: 5次/分钟
  - 注册: 3次/小时
  - 密码重置: 3次/小时
- **Session Management**:
  - 单设备登录选项
  - 异常登录检测
  - 会话超时: 30分钟无活动

## State Management

### 前端状态管理流程
```typescript
// src/stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  
  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || 'VIEWER')
  
  // Actions
  async function login(credentials: LoginCredentials) {
    try {
      const response = await authAPI.login(credentials)
      user.value = response.user
      token.value = response.tokens.accessToken
      refreshToken.value = response.tokens.refreshToken
      
      // 保存到localStorage
      localStorage.setItem('access_token', token.value)
      localStorage.setItem('refresh_token', refreshToken.value)
      
      // 设置axios默认header
      setAuthHeader(token.value)
      
      // 跳转到dashboard
      router.push('/dashboard')
    } catch (error) {
      handleAuthError(error)
    }
  }
  
  // Token自动刷新
  const refreshTokenInterval = setInterval(async () => {
    if (refreshToken.value) {
      await refreshAccessToken()
    }
  }, 45 * 60 * 1000) // 45分钟
  
  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout,
    register,
    refreshAccessToken
  }
})
```

## Error Handling

### 错误码定义
```typescript
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH001',
  EMAIL_EXISTS = 'AUTH002',
  USERNAME_EXISTS = 'AUTH003',
  INVALID_TOKEN = 'AUTH004',
  TOKEN_EXPIRED = 'AUTH005',
  ACCOUNT_LOCKED = 'AUTH006',
  EMAIL_NOT_VERIFIED = 'AUTH007',
  INVALID_PASSWORD = 'AUTH008',
  USER_NOT_FOUND = 'AUTH009',
  SESSION_EXPIRED = 'AUTH010'
}
```

### 错误处理策略
```typescript
// src/utils/errorHandler.ts
export function handleAuthError(error: AxiosError) {
  const code = error.response?.data?.code
  
  switch (code) {
    case AuthErrorCode.TOKEN_EXPIRED:
      // 尝试刷新token
      return refreshTokenAndRetry(error.config)
    
    case AuthErrorCode.INVALID_TOKEN:
      // 清除认证状态，跳转登录
      authStore.logout()
      router.push('/login')
      break
      
    case AuthErrorCode.ACCOUNT_LOCKED:
      // 显示账户锁定提示
      ElMessage.error('账户已被锁定，请15分钟后重试')
      break
      
    default:
      // 显示通用错误
      ElMessage.error(error.response?.data?.message || '操作失败')
  }
}
```

## Testing Strategy

### 单元测试
```typescript
// tests/auth.service.spec.ts
describe('AuthService', () => {
  it('should hash password on registration', async () => {
    const password = 'TestPass123!'
    const hashedPassword = await authService.hashPassword(password)
    expect(hashedPassword).not.toBe(password)
    expect(await bcrypt.compare(password, hashedPassword)).toBe(true)
  })
  
  it('should generate valid JWT token', () => {
    const token = authService.generateToken(mockUser)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    expect(decoded.sub).toBe(mockUser.id)
  })
})
```

### 集成测试
```typescript
// tests/auth.e2e.spec.ts
describe('Auth E2E', () => {
  it('should complete registration flow', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(registerData)
      
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('tokens')
    expect(response.body.user.email).toBe(registerData.email)
  })
})
```

## Migration Plan

### Phase 1: 基础认证 (Week 1)
- [ ] 实现注册/登录API
- [ ] 创建认证UI组件
- [ ] 设置JWT认证
- [ ] 实现基础权限控制

### Phase 2: 高级功能 (Week 2)
- [ ] GitLab OAuth集成
- [ ] 密码重置功能
- [ ] 会话管理
- [ ] 多设备登录

### Phase 3: 优化和测试 (Week 3)
- [ ] 性能优化
- [ ] 安全审计
- [ ] 完整测试覆盖
- [ ] 文档完善

## Dependencies

### NPM包依赖
```json
{
  "dependencies": {
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "bcrypt": "^6.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0"
  }
}
```

### 环境变量
```env
# JWT配置
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# GitLab OAuth
GITLAB_CLIENT_ID=your-client-id
GITLAB_CLIENT_SECRET=your-client-secret
GITLAB_CALLBACK_URL=http://localhost:3000/api/auth/gitlab/callback

# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```