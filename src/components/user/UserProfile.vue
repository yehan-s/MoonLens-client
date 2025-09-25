<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h3>个人资料</h3>
          <el-button
            v-if="!isEditing"
            type="primary"
            size="small"
            @click="startEdit"
          >
            编辑资料
          </el-button>
        </div>
      </template>

      <div class="profile-content">
        <!-- 头像部分 -->
        <div class="avatar-section">
          <div class="avatar-container">
            <el-avatar
              :size="120"
              :src="currentAvatar"
              @error="handleAvatarError"
            >
              <span class="avatar-text">{{ avatarText }}</span>
            </el-avatar>
            
            <el-upload
              v-if="isEditing"
              class="avatar-upload"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :on-success="handleAvatarSuccess"
              action="#"
              accept="image/*"
            >
              <el-button size="small" type="primary" icon="Upload">
                更换头像
              </el-button>
            </el-upload>
          </div>
          
          <div class="user-basic">
            <h2>{{ userInfo.username }}</h2>
            <p class="user-role">
              <el-tag :type="roleTagType">{{ roleText }}</el-tag>
            </p>
            <p class="user-joined">
              <el-icon><Calendar /></el-icon>
              加入于 {{ formatDate(userInfo.createdAt) }}
            </p>
          </div>
        </div>

        <!-- 表单部分 -->
        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          :disabled="!isEditing"
          label-width="100px"
          class="profile-form"
        >
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="profileForm.username"
                  placeholder="请输入用户名"
                  :disabled="true"
                />
                <div class="form-tip">用户名创建后不可修改</div>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="profileForm.email"
                  placeholder="请输入邮箱"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="姓名" prop="fullName">
                <el-input
                  v-model="profileForm.fullName"
                  placeholder="请输入真实姓名"
                />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="profileForm.phone"
                  placeholder="请输入手机号"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="部门" prop="department">
                <el-input
                  v-model="profileForm.department"
                  placeholder="请输入所在部门"
                />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="职位" prop="position">
                <el-input
                  v-model="profileForm.position"
                  placeholder="请输入职位"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="个人简介" prop="bio">
            <el-input
              v-model="profileForm.bio"
              type="textarea"
              :rows="4"
              placeholder="介绍一下自己..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <!-- 偏好设置 -->
          <el-divider content-position="left">偏好设置</el-divider>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="主题" prop="theme">
                <el-select
                  v-model="profileForm.preferences.theme"
                  placeholder="选择主题"
                  style="width: 100%"
                >
                  <el-option label="浅色" value="light" />
                  <el-option label="深色" value="dark" />
                  <el-option label="跟随系统" value="auto" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="语言" prop="language">
                <el-select
                  v-model="profileForm.preferences.language"
                  placeholder="选择语言"
                  style="width: 100%"
                >
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="通知设置">
            <el-checkbox-group v-model="profileForm.preferences.notifications">
              <el-checkbox label="email">邮件通知</el-checkbox>
              <el-checkbox label="browser">浏览器通知</el-checkbox>
              <el-checkbox label="mobile">手机推送</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item v-if="isEditing">
            <el-button type="primary" @click="saveProfile" :loading="loading">
              保存修改
            </el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </el-form-item>
        </el-form>

        <!-- 安全设置 -->
        <el-divider content-position="left">安全设置</el-divider>
        
        <div class="security-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <div class="security-item">
                <div class="security-info">
                  <h4>登录密码</h4>
                  <p class="text-muted">定期修改密码有助于保护账户安全</p>
                </div>
                <el-button @click="showPasswordDialog = true">修改密码</el-button>
              </div>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <div class="security-item">
                <div class="security-info">
                  <h4>两步验证</h4>
                  <p class="text-muted">
                    <el-tag v-if="userInfo.twoFactorEnabled" type="success">已启用</el-tag>
                    <el-tag v-else type="info">未启用</el-tag>
                  </p>
                </div>
                <el-button @click="toggle2FA">
                  {{ userInfo.twoFactorEnabled ? '关闭' : '启用' }}
                </el-button>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="mt-4">
            <el-col :xs="24" :sm="12">
              <div class="security-item">
                <div class="security-info">
                  <h4>登录历史</h4>
                  <p class="text-muted">查看账户的登录记录</p>
                </div>
                <el-button @click="viewLoginHistory">查看</el-button>
              </div>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <div class="security-item">
                <div class="security-info">
                  <h4>活动会话</h4>
                  <p class="text-muted">管理当前活动的登录会话</p>
                </div>
                <el-button @click="viewActiveSessions">管理</el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword" :loading="passwordLoading">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 响应式数据
const isEditing = ref(false)
const loading = ref(false)
const passwordLoading = ref(false)
const showPasswordDialog = ref(false)
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 用户信息
const userInfo = computed(() => userStore.currentUser || {
  id: '',
  username: '',
  email: '',
  role: 'developer',
  avatar: '',
  fullName: '',
  phone: '',
  department: '',
  position: '',
  bio: '',
  createdAt: new Date().toISOString(),
  twoFactorEnabled: false,
  preferences: {
    theme: 'light',
    language: 'zh-CN',
    notifications: ['email']
  }
})

// 表单数据
const profileForm = reactive({
  username: '',
  email: '',
  fullName: '',
  phone: '',
  department: '',
  position: '',
  bio: '',
  preferences: {
    theme: 'light',
    language: 'zh-CN',
    notifications: [] as string[]
  }
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ]
})

const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 计算属性
const currentAvatar = computed(() => {
  return userInfo.value.avatar || ''
})

const avatarText = computed(() => {
  return userInfo.value.username?.charAt(0).toUpperCase() || 'U'
})

const roleText = computed(() => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    developer: '开发者',
    reviewer: '审查员'
  }
  return roleMap[userInfo.value.role] || userInfo.value.role
})

const roleTagType = computed(() => {
  const typeMap: Record<string, string> = {
    admin: 'danger',
    developer: 'primary',
    reviewer: 'warning'
  }
  return typeMap[userInfo.value.role] || 'info'
})

// 方法
const startEdit = () => {
  isEditing.value = true
  // 复制当前用户信息到表单
  Object.assign(profileForm, {
    ...userInfo.value,
    preferences: { ...userInfo.value.preferences }
  })
}

const cancelEdit = () => {
  isEditing.value = false
  profileFormRef.value?.resetFields()
}

const saveProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 调用 store 更新用户信息
        await userStore.updateProfile(profileForm)
        ElMessage.success('资料更新成功')
        isEditing.value = false
      } catch (error) {
        ElMessage.error('更新失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleAvatarError = () => {
  return true
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  
  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar = e.target?.result as string
  }
  reader.readAsDataURL(rawFile)
  
  return false // 阻止自动上传
}

const handleAvatarSuccess = (response: any, uploadFile: any) => {
  profileForm.avatar = URL.createObjectURL(uploadFile.raw)
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await userStore.changePassword(
          passwordForm.oldPassword,
          passwordForm.newPassword
        )
        ElMessage.success('密码修改成功')
        showPasswordDialog.value = false
        resetPasswordForm()
      } catch (error) {
        ElMessage.error('密码修改失败，请检查当前密码是否正确')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
}

const toggle2FA = () => {
  if (userInfo.value.twoFactorEnabled) {
    ElMessageBox.confirm(
      '关闭两步验证会降低账户安全性，确定要关闭吗？',
      '安全提醒',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // TODO: 调用关闭2FA的API
      ElMessage.success('两步验证已关闭')
    })
  } else {
    // TODO: 显示启用2FA的对话框
    ElMessage.info('两步验证功能开发中')
  }
}

const viewLoginHistory = () => {
  // TODO: 跳转到登录历史页面
  ElMessage.info('登录历史功能开发中')
}

const viewActiveSessions = () => {
  // TODO: 跳转到活动会话管理页面
  ElMessage.info('会话管理功能开发中')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 生命周期
onMounted(() => {
  // 初始化表单数据
  Object.assign(profileForm, {
    ...userInfo.value,
    preferences: { ...userInfo.value.preferences }
  })
})
</script>

<style scoped lang="scss">
.user-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 20px;
    }
  }
}

.profile-content {
  .avatar-section {
    display: flex;
    align-items: flex-start;
    gap: 30px;
    padding-bottom: 30px;
    margin-bottom: 30px;
    border-bottom: 1px solid #e4e7ed;
    
    .avatar-container {
      text-align: center;
      
      .avatar-text {
        font-size: 48px;
        font-weight: bold;
      }
      
      .avatar-upload {
        margin-top: 15px;
      }
    }
    
    .user-basic {
      flex: 1;
      
      h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
      }
      
      .user-role {
        margin: 10px 0;
      }
      
      .user-joined {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #909399;
        font-size: 14px;
        margin-top: 10px;
      }
    }
  }
  
  .profile-form {
    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;
    }
  }
  
  .security-section {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 15px;
      
      .security-info {
        h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }
        
        .text-muted {
          color: #909399;
          font-size: 14px;
          margin: 0;
        }
      }
    }
  }
}

.mt-4 {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
    align-items: center !important;
    text-align: center;
    
    .user-basic {
      width: 100%;
    }
  }
  
  .security-item {
    flex-direction: column;
    gap: 10px;
    
    .security-info {
      width: 100%;
    }
  }
}
</style>