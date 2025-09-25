<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="min-h-screen flex">
      <!-- 左侧品牌区域 - 桌面端显示 -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div class="flex flex-col justify-center items-center w-full px-12">
          <div class="max-w-md">
            <!-- Logo -->
            <div class="flex items-center justify-center mb-8">
              <div class="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span class="text-6xl">🌙</span>
              </div>
            </div>
            
            <!-- 品牌名称 -->
            <h1 class="text-5xl font-bold mb-4 text-center">MoonLens</h1>
            <p class="text-xl text-indigo-100 text-center mb-8">开启智能代码审查之旅</p>
            
            <!-- 特性列表 -->
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-indigo-200 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-lg">快速注册</h3>
                  <p class="text-indigo-100">简单几步，立即开始</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-indigo-200 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-lg">安全可靠</h3>
                  <p class="text-indigo-100">企业级安全保护</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-indigo-200 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-lg">团队协作</h3>
                  <p class="text-indigo-100">邀请团队成员共同使用</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧注册表单区域 -->
      <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full">
          <!-- 移动端显示的 Logo -->
          <div class="lg:hidden text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
              <span class="text-3xl">🌙</span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900">MoonLens</h1>
            <p class="text-gray-600 mt-2">创建您的账户</p>
          </div>

          <!-- 注册表单卡片 -->
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div class="p-6 sm:p-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-6">注册新账户</h2>
              
              <form @submit.prevent="handleRegister" class="space-y-5">
                <!-- 用户名输入 -->
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                    用户名
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <input
                      id="username"
                      v-model="registerForm.username"
                      type="text"
                      required
                      class="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      placeholder="请输入用户名"
                      @blur="validateUsername"
                    />
                  </div>
                  <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
                </div>

                <!-- 邮箱输入 -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      id="email"
                      v-model="registerForm.email"
                      type="email"
                      required
                      class="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      placeholder="请输入邮箱地址"
                      @blur="validateEmail"
                    />
                  </div>
                  <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                </div>

                <!-- 密码输入 -->
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                    密码
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <input
                      id="password"
                      v-model="registerForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      class="pl-10 pr-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      placeholder="请输入密码（至少6位）"
                      @input="checkPasswordStrength"
                      @blur="validatePassword"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    </button>
                  </div>
                  <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
                  
                  <!-- 密码强度指示器 -->
                  <div v-if="registerForm.password" class="mt-2">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="text-gray-600">密码强度</span>
                      <span :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        :class="passwordStrengthBarClass"
                        :style="{ width: passwordStrengthPercent + '%' }"
                        class="h-2 rounded-full transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- 确认密码输入 -->
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                    确认密码
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      v-model="registerForm.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      required
                      class="pl-10 pr-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      placeholder="请再次输入密码"
                      @blur="validateConfirmPassword"
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    </button>
                  </div>
                  <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
                </div>

                <!-- 服务条款 -->
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="terms"
                      v-model="registerForm.agreeTerms"
                      type="checkbox"
                      required
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div class="ml-2 text-sm">
                    <label for="terms" class="text-gray-700">
                      我同意 
                      <a href="#" class="text-indigo-600 hover:text-indigo-500">服务条款</a>
                      和 
                      <a href="#" class="text-indigo-600 hover:text-indigo-500">隐私政策</a>
                    </label>
                  </div>
                </div>
                <p v-if="errors.terms" class="text-sm text-red-600">{{ errors.terms }}</p>

                <!-- 注册按钮 -->
                <button
                  type="submit"
                  :disabled="loading || !isFormValid"
                  class="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="!loading">创建账户</span>
                  <span v-else class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    注册中...
                  </span>
                </button>
              </form>

              <!-- 分割线 -->
              <div class="relative my-5">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">或者</span>
                </div>
              </div>

              <!-- GitLab 注册 -->
              <button
                type="button"
                @click="handleGitLabRegister"
                class="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
                </svg>
                使用 GitLab 账号注册
              </button>
            </div>

            <!-- 底部提示 -->
            <div class="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200">
              <p class="text-sm text-center text-gray-600">
                已有账号？
                <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                  立即登录
                </router-link>
              </p>
            </div>
          </div>

          <!-- 版权信息 -->
          <p class="mt-6 text-center text-sm text-gray-600">
            © 2024 MoonLens. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordStrength = ref(0)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: ''
})

// 密码强度计算
const checkPasswordStrength = () => {
  let strength = 0
  const password = registerForm.password
  
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  
  passwordStrength.value = strength
}

const passwordStrengthPercent = computed(() => {
  return (passwordStrength.value / 5) * 100
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return '弱'
  if (strength <= 2) return '一般'
  if (strength <= 3) return '中等'
  if (strength <= 4) return '强'
  return '非常强'
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'text-red-600'
  if (strength <= 2) return 'text-orange-600'
  if (strength <= 3) return 'text-yellow-600'
  if (strength <= 4) return 'text-green-600'
  return 'text-green-700'
})

const passwordStrengthBarClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'bg-red-600'
  if (strength <= 2) return 'bg-orange-600'
  if (strength <= 3) return 'bg-yellow-600'
  if (strength <= 4) return 'bg-green-600'
  return 'bg-green-700'
})

// 表单验证
const validateUsername = () => {
  if (!registerForm.username) {
    errors.username = '请输入用户名'
    return false
  }
  if (registerForm.username.length < 3) {
    errors.username = '用户名至少3个字符'
    return false
  }
  errors.username = ''
  return true
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!registerForm.email) {
    errors.email = '请输入邮箱地址'
    return false
  }
  if (!emailRegex.test(registerForm.email)) {
    errors.email = '请输入有效的邮箱地址'
    return false
  }
  errors.email = ''
  return true
}

const validatePassword = () => {
  if (!registerForm.password) {
    errors.password = '请输入密码'
    return false
  }
  if (registerForm.password.length < 6) {
    errors.password = '密码至少6个字符'
    return false
  }
  errors.password = ''
  return true
}

const validateConfirmPassword = () => {
  if (!registerForm.confirmPassword) {
    errors.confirmPassword = '请再次输入密码'
    return false
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    return false
  }
  errors.confirmPassword = ''
  return true
}

const validateTerms = () => {
  if (!registerForm.agreeTerms) {
    errors.terms = '请同意服务条款和隐私政策'
    return false
  }
  errors.terms = ''
  return true
}

const isFormValid = computed(() => {
  return registerForm.username &&
         registerForm.email &&
         registerForm.password &&
         registerForm.confirmPassword &&
         registerForm.agreeTerms &&
         !errors.username &&
         !errors.email &&
         !errors.password &&
         !errors.confirmPassword
})

const handleRegister = async () => {
  // 验证所有字段
  const isUsernameValid = validateUsername()
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()
  const isTermsValid = validateTerms()
  
  if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsValid) {
    return
  }
  
  loading.value = true
  
  try {
    // TODO: 调用注册 API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('注册成功！即将跳转到登录页面')
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleGitLabRegister = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/gitlab`
}
</script>