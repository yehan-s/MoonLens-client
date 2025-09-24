<template>
  <el-config-provider :locale="zhCn">
    <!-- 登录页面不显示布局 -->
    <router-view v-if="isLoginPage" />
    
    <!-- 其他页面显示完整布局 -->
    <el-container v-else class="app-container">
      <!-- 侧边栏 -->
      <el-aside width="200px" class="app-aside">
        <div class="logo">
          <h2>🌙 MoonLens</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="app-menu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/projects">
            <el-icon><Folder /></el-icon>
            <span>项目管理</span>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><Document /></el-icon>
            <span>审查报告</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主体区域 -->
      <el-container>
        <!-- 顶部栏 -->
        <el-header class="app-header">
          <div class="header-content">
            <h3>GitLab 原生 AI 代码审查工具</h3>
            <div class="user-info">
              <el-dropdown>
                <span class="user-dropdown">
                  <el-avatar size="small" :src="userAvatar" />
                  <span>{{ username }}</span>
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleProfile">个人资料</el-dropdown-item>
                    <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 内容区域 -->
        <el-main class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { 
  DataAnalysis, 
  Folder, 
  Document, 
  Setting, 
  ArrowDown 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isLoginPage = computed(() => route.path === '/login')
const activeMenu = computed(() => route.path)
const username = computed(() => userStore.currentUser?.username || '用户')
const userAvatar = computed(() => userStore.currentUser?.avatar || '')

const handleProfile = () => {
  router.push('/profile')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
@reference "./style.css";
/* 使用 Tailwind 的 @apply 指令 */
.app-container {
  @apply h-screen flex;
}

.app-aside {
  @apply bg-moonlens-light w-52;
}

.logo {
  @apply h-16 flex items-center justify-center text-white bg-moonlens-dark;
}

.logo h2 {
  @apply m-0 text-xl font-semibold;
}

.app-menu {
  @apply border-r-0;
  height: calc(100vh - 64px);
}

.app-header {
  @apply bg-white border-b border-gray-200 flex items-center px-6 h-16;
}

.header-content {
  @apply w-full flex justify-between items-center;
}

.header-content h3 {
  @apply m-0 text-gray-800 text-lg font-medium;
}

.user-dropdown {
  @apply flex items-center gap-2 cursor-pointer text-gray-600 transition-colors;
}

.user-dropdown:hover {
  color: #409EFF;
}

.app-main {
  @apply bg-moonlens-bg overflow-auto p-6;
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  @apply transition-all duration-300;
}

.fade-transform-enter-from {
  @apply opacity-0 -translate-x-8;
}

.fade-transform-leave-to {
  @apply opacity-0 translate-x-8;
}
</style>
