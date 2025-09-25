<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- 桌面端：左右布局 -->
    <div class="min-h-screen flex">
      <!-- 左侧品牌区域 - 桌面端显示 -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
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
            <p class="text-xl text-blue-100 text-center mb-8">GitLab AI 代码审查工具</p>
            
            <!-- 特性列表 -->
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-blue-200 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-lg">智能代码审查</h3>
                  <p class="text-blue-100">基于 AI 的深度代码分析与建议</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-blue-200 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-lg">GitLab 原生集成</h3>
                  <p class="text-blue-100">无缝对接 GitLab 工作流程</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-blue-200 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-lg">团队协作</h3>
                  <p class="text-blue-100">提升团队代码质量与效率</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full">
          <!-- 移动端显示的 Logo -->
          <div class="lg:hidden text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
              <span class="text-3xl">🌙</span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900">MoonLens</h1>
            <p class="text-gray-600 mt-2">GitLab AI 代码审查工具</p>
          </div>

          <!-- 登录表单卡片 -->
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div class="p-6 sm:p-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-6">欢迎回来</h2>
              
              <form @submit.prevent="handleLogin" class="space-y-5">
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
                      v-model="loginForm.username"
                      type="text"
                      required
                      class="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="请输入用户名"
                    />
                  </div>
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
                      v-model="loginForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      class="pl-10 pr-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="请输入密码"
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
                </div>

                <!-- 记住我和忘记密码 -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <input
                      id="remember"
                      v-model="loginForm.remember"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="remember" class="ml-2 block text-sm text-gray-700">
                      记住我
                    </label>
                  </div>
                  <router-link to="/password-reset" class="text-sm text-blue-600 hover:text-blue-500 transition duration-200">
                    忘记密码？
                  </router-link>
                </div>

                <!-- 登录按钮 -->
                <button
                  type="submit"
                  :disabled="loading"
                  class="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="!loading">登录</span>
                  <span v-else class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    登录中...
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

              <!-- GitLab 登录 -->
              <button
                type="button"
                @click="handleGitLabLogin"
                class="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
                </svg>
                使用 GitLab 账号登录
              </button>
            </div>

            <!-- 底部提示 -->
            <div class="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200">
              <p class="text-sm text-center text-gray-600">
                还没有账号？
                <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
                  立即注册
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const validateForm = () => {
  if (!loginForm.username) {
    ElMessage.warning('请输入用户名')
    return false
  }
  if (!loginForm.password) {
    ElMessage.warning('请输入密码')
    return false
  }
  if (loginForm.password.length < 6) {
    ElMessage.warning('密码长度不能少于6位')
    return false
  }
  return true
}

// 页面加载时检查记住的用户名
onMounted(() => {
  const savedUsername = localStorage.getItem('rememberedUsername')
  if (savedUsername) {
    loginForm.username = savedUsername
    loginForm.remember = true
  }
})

const handleLogin = async () => {
  // 表单验证
  if (!validateForm()) {
    return
  }

  loading.value = true
  
  try {
    // 调用用户 store 的登录方法（使用新的接口格式）
    const success = await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
      rememberMe: loginForm.remember
    })
    
    if (success) {
      // 处理记住我功能
      if (loginForm.remember) {
        localStorage.setItem('rememberedUsername', loginForm.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }
      
      ElMessage.success('登录成功！')
      
      // 获取重定向地址或跳转到首页
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/dashboard')
    } else {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleGitLabLogin = () => {
  // GitLab OAuth 登录
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/gitlab`
}
</script>