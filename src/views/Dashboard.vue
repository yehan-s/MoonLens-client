<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <el-statistic title="项目总数" :value="projectStats.totalProjects">
            <template #prefix>
              <el-icon><Folder /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <el-statistic title="待审查" :value="projectStats.pendingReviews">
            <template #prefix>
              <el-icon><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <el-statistic title="审查中" :value="projectStats.reviewingTasks">
            <template #prefix>
              <el-icon><Loading /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <el-statistic title="已完成" :value="projectStats.completedReviews">
            <template #prefix>
              <el-icon><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近的审查任务 -->
    <el-card class="recent-tasks" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>最近的审查任务</span>
          <el-button type="primary" size="small" @click="goToProjects">
            查看全部
          </el-button>
        </div>
      </template>
      
      <el-table :data="recentTasks" style="width: 100%">
        <el-table-column prop="projectName" label="项目名称" />
        <el-table-column prop="branch" label="分支" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="viewTask(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 快速操作 -->
    <el-card class="quick-actions" style="margin-top: 20px">
      <template #header>
        <span>快速操作</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button class="action-btn" @click="startNewReview">
            <el-icon><Plus /></el-icon>
            <span>新建审查</span>
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button class="action-btn" @click="goToReports">
            <el-icon><Document /></el-icon>
            <span>查看报告</span>
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button class="action-btn" @click="goToSettings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button class="action-btn" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            <span>刷新数据</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/project'
import { ElMessage } from 'element-plus'
import { 
  Folder, 
  Clock, 
  Loading, 
  CircleCheck, 
  Plus, 
  Document, 
  Setting, 
  Refresh 
} from '@element-plus/icons-vue'

const router = useRouter()
const projectStore = useProjectStore()

const projectStats = computed(() => projectStore.projectStats)
const recentTasks = computed(() => 
  projectStore.reviewTasks.slice(0, 5)
)

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    reviewing: 'primary',
    completed: 'success',
    failed: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审查',
    reviewing: '审查中',
    completed: '已完成',
    failed: '失败'
  }
  return texts[status] || status
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const goToProjects = () => router.push('/projects')
const goToReports = () => router.push('/reports')
const goToSettings = () => router.push('/settings')

const startNewReview = () => {
  router.push('/projects')
  ElMessage.info('请选择要审查的项目')
}

const viewTask = (task: any) => {
  router.push(`/review/${task.projectId}`)
}

const refreshData = async () => {
  await projectStore.loadProjects()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  projectStore.loadProjects()
})
</script>

<style scoped>
.dashboard-container {
  @apply p-6;
}

.stat-card {
  @apply text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg;
}

.card-header {
  @apply flex justify-between items-center;
}

.recent-tasks {
  @apply mt-6;
}

.quick-actions {
  @apply mt-6;
}

.action-btn {
  @apply w-full h-20 flex flex-col items-center justify-center gap-2;
}

.action-btn .el-icon {
  @apply text-2xl;
}
</style>