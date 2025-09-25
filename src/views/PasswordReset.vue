<template>
  <div class="password-reset-container">
    <div class="reset-card">
      <!-- Logo和标题 -->
      <div class="header">
        <img src="@/assets/logo.svg" alt="MoonLens" class="logo" />
        <h1 class="title">重置密码</h1>
        <p class="subtitle">{{ step === 'request' ? '输入您的邮箱地址，我们将发送重置链接' : '设置新密码' }}</p>
      </div>

      <!-- 请求重置表单 -->
      <el-form 
        v-if="step === 'request'"
        ref="requestFormRef"
        :model="requestForm"
        :rules="requestRules"
        @submit.prevent="handleRequestReset"
      >
        <el-form-item prop="email">
          <el-input
            v-model="requestForm.email"
            placeholder="请输入邮箱地址"
            size="large"
            :prefix-icon="Message"
            @keyup.enter="handleRequestReset"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleRequestReset"
          class="submit-btn"
        >
          发送重置链接
        </el-button>
      </el-form>

      <!-- 重置密码表单 -->
      <el-form
        v-else-if="step === 'reset'"
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        @submit.prevent="handleResetPassword"
      >
        <el-form-item prop="code">
          <el-input
            v-model="resetForm.code"
            placeholder="请输入验证码"
            size="large"
            :prefix-icon="Key"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="resetForm.password"
            type="password"
            placeholder="请输入新密码"
            size="large"
            show-password
            :prefix-icon="Lock"
            @input="checkPasswordStrength"
          />
        </el-form-item>

        <!-- 密码强度指示器 -->
        <div v-if="resetForm.password" class="password-strength">
          <div class="strength-bar">
            <div 
              class="strength-level"
              :class="passwordStrength.level"
              :style="{ width: passwordStrength.percentage + '%' }"
            ></div>
          </div>
          <span class="strength-text">{{ passwordStrength.text }}</span>
        </div>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            size="large"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleResetPassword"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleResetPassword"
          class="submit-btn"
        >
          重置密码
        </el-button>
      </el-form>

      <!-- 成功提示 -->
      <div v-else-if="step === 'success'" class="success-container">
        <el-icon :size="60" color="#67C23A">
          <CircleCheckFilled />
        </el-icon>
        <h2>密码重置成功！</h2>
        <p>您的密码已成功重置，请使用新密码登录</p>
        <el-button type="primary" size="large" @click="goToLogin" class="submit-btn">
          前往登录
        </el-button>
      </div>

      <!-- 底部链接 -->
      <div class="footer-links">
        <router-link to="/login" class="link">
          <el-icon><ArrowLeft /></el-icon>
          返回登录
        </router-link>
        <router-link to="/register" class="link">
          创建新账户
        </router-link>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  Message, 
  Lock, 
  Key, 
  ArrowLeft,
  CircleCheckFilled 
} from '@element-plus/icons-vue'
import { authAPI } from '@/api/auth'

const router = useRouter()
const route = useRoute()

// 表单引用
const requestFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()

// 状态
const loading = ref(false)
const step = ref<'request' | 'reset' | 'success'>('request')

// 请求重置表单
const requestForm = reactive({
  email: ''
})

// 重置密码表单
const resetForm = reactive({
  code: '',
  password: '',
  confirmPassword: ''
})

// 密码强度
const passwordStrength = ref({
  level: '',
  percentage: 0,
  text: ''
})

// 表单验证规则
const requestRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const resetRules: FormRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码为6位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 30, message: '密码长度应为8-30个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        
        // 密码强度验证
        const hasUpper = /[A-Z]/.test(value)
        const hasLower = /[a-z]/.test(value)
        const hasNumber = /\d/.test(value)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
        
        const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
        
        if (strength < 2) {
          callback(new Error('密码必须包含大小写字母、数字和特殊字符中的至少两种'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        if (value !== resetForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 检查密码强度
const checkPasswordStrength = () => {
  const password = resetForm.password
  if (!password) {
    passwordStrength.value = { level: '', percentage: 0, text: '' }
    return
  }

  let strength = 0
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  ]

  strength = checks.filter(Boolean).length

  if (strength <= 2) {
    passwordStrength.value = {
      level: 'weak',
      percentage: 33,
      text: '弱'
    }
  } else if (strength <= 4) {
    passwordStrength.value = {
      level: 'medium',
      percentage: 66,
      text: '中'
    }
  } else {
    passwordStrength.value = {
      level: 'strong',
      percentage: 100,
      text: '强'
    }
  }
}

// 请求重置密码
const handleRequestReset = async () => {
  if (!requestFormRef.value) return
  
  await requestFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await authAPI.requestPasswordReset({ email: requestForm.email })
      
      ElMessage.success('重置链接已发送到您的邮箱')
      
      // 显示提示信息
      await ElMessageBox.alert(
        '我们已向您的邮箱发送了密码重置链接，请查收邮件并点击链接继续。',
        '邮件已发送',
        {
          confirmButtonText: '我知道了',
          type: 'success'
        }
      )
      
      // 切换到重置步骤
      step.value = 'reset'
    } catch (error: any) {
      console.error('请求重置失败:', error)
      ElMessage.error(error.response?.data?.message || '发送重置链接失败')
    } finally {
      loading.value = false
    }
  })
}

// 重置密码
const handleResetPassword = async () => {
  if (!resetFormRef.value) return
  
  await resetFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      // 从URL获取token或使用输入的验证码
      const token = route.query.token as string || resetForm.code
      
      await authAPI.confirmPasswordReset({
        token,
        newPassword: resetForm.password
      })
      
      ElMessage.success('密码重置成功')
      step.value = 'success'
    } catch (error: any) {
      console.error('重置密码失败:', error)
      ElMessage.error(error.response?.data?.message || '重置密码失败')
    } finally {
      loading.value = false
    }
  })
}

// 前往登录
const goToLogin = () => {
  router.push('/login')
}

// 初始化
onMounted(() => {
  // 如果URL中有token，直接进入重置步骤
  if (route.query.token) {
    step.value = 'reset'
    resetForm.code = route.query.token as string
  }
  
  // 如果URL中有email，预填充邮箱
  if (route.query.email) {
    requestForm.email = route.query.email as string
  }
})
</script>

<style lang="scss" scoped>
.password-reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.reset-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  position: relative;
  z-index: 1;
  animation: slideUp 0.5s ease;
}

.header {
  text-align: center;
  margin-bottom: 35px;

  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  .subtitle {
    color: #909399;
    font-size: 14px;
    margin: 0;
  }
}

.submit-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  margin-top: 10px;
}

.password-strength {
  margin: -10px 0 15px 0;

  .strength-bar {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 5px;

    .strength-level {
      height: 100%;
      transition: all 0.3s;
      
      &.weak {
        background: #f56c6c;
      }
      
      &.medium {
        background: #e6a23c;
      }
      
      &.strong {
        background: #67c23a;
      }
    }
  }

  .strength-text {
    font-size: 12px;
    color: #909399;
  }
}

.success-container {
  text-align: center;
  padding: 20px 0;

  h2 {
    margin: 20px 0 10px 0;
    color: #303133;
  }

  p {
    color: #909399;
    margin-bottom: 30px;
  }
}

.footer-links {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;

  .link {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.3s;

    &:hover {
      color: #764ba2;
    }
  }
}

// 背景装饰
.decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 20s infinite ease-in-out;

    &.circle-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      right: -100px;
    }

    &.circle-2 {
      width: 200px;
      height: 200px;
      bottom: -50px;
      left: -50px;
      animation-delay: -5s;
    }

    &.circle-3 {
      width: 400px;
      height: 400px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: -10s;
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(20px) rotate(240deg);
  }
}

// 响应式设计
@media (max-width: 480px) {
  .reset-card {
    margin: 20px;
    padding: 30px 25px;
  }

  .header {
    .title {
      font-size: 24px;
    }
  }
}
</style>