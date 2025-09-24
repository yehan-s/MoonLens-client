<template>
  <div class="projects-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>项目管理</h2>
          <div class="header-actions">
            <el-input
              v-model="searchText"
              placeholder="搜索项目..."
              style="width: 300px; margin-right: 10px"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="syncProjects">
              <el-icon><Refresh /></el-icon>
              同步项目
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="filteredProjects" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="name" label="项目名称" width="200">
          <template #default="{ row }">
            <div class="project-name">
              <el-icon><Folder /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="描述" />
        
        <el-table-column prop="namespace.name" label="命名空间" width="150" />
        
        <el-table-column prop="defaultBranch" label="默认分支" width="120" />
        
        <el-table-column prop="lastActivityAt" label="最后活动" width="180">
          <template #default="{ row }">
            {{ formatDate(row.lastActivityAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="startReview(row)">
                <el-icon><View /></el-icon>
                审查
              </el-button>
              <el-button size="small" @click="viewProject(row)">
                <el-icon><Link /></el-icon>
                详情
              </el-button>
              <el-button size="small" @click="viewHistory(row)">
                <el-icon><Clock /></el-icon>
                历史
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 开始审查对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="开始代码审查" width="500px">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="项目">
          <el-input :value="selectedProject?.name" disabled />
        </el-form-item>
        
        <el-form-item label="审查类型">
          <el-radio-group v-model="reviewForm.type">
            <el-radio label="branch">分支审查</el-radio>
            <el-radio label="merge">合并请求</el-radio>
            <el-radio label="full">全量审查</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="目标分支" v-if="reviewForm.type === 'branch'">
          <el-input v-model="reviewForm.branch" placeholder="输入分支名称" />
        </el-form-item>
        
        <el-form-item label="MR ID" v-if="reviewForm.type === 'merge'">
          <el-input-number v-model="reviewForm.mergeRequestId" :min="1" />
        </el-form-item>
        
        <el-form-item label="审查规则">
          <el-checkbox-group v-model="reviewForm.rules">
            <el-checkbox label="security">安全性</el-checkbox>
            <el-checkbox label="performance">性能</el-checkbox>
            <el-checkbox label="maintainability">可维护性</el-checkbox>
            <el-checkbox label="style">代码风格</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReview">开始审查</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore, type GitLabProject } from '../stores/project'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Folder, 
  View, 
  Link, 
  Clock 
} from '@element-plus/icons-vue'

const router = useRouter()
const projectStore = useProjectStore()

const searchText = ref('')
const reviewDialogVisible = ref(false)
const selectedProject = ref<GitLabProject | null>(null)
const reviewForm = ref({
  type: 'branch',
  branch: '',
  mergeRequestId: 1,
  rules: ['security', 'performance', 'maintainability']
})

const loading = computed(() => projectStore.loading)
const projects = computed(() => projectStore.projects)

const filteredProjects = computed(() => {
  if (!searchText.value) return projects.value
  
  const search = searchText.value.toLowerCase()
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(search) ||
    project.description?.toLowerCase().includes(search) ||
    project.namespace.name.toLowerCase().includes(search)
  )
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  if (days < 365) return `${Math.floor(days / 30)} 月前`
  return `${Math.floor(days / 365)} 年前`
}

const handleSearch = () => {
  // 搜索逻辑已通过 computed 属性实现
}

const syncProjects = async () => {
  await projectStore.loadProjects()
  ElMessage.success('项目同步完成')
}

const startReview = (project: GitLabProject) => {
  selectedProject.value = project
  reviewForm.value.branch = project.defaultBranch
  reviewDialogVisible.value = true
}

const confirmReview = async () => {
  if (!selectedProject.value) return
  
  const task = await projectStore.createReviewTask(
    selectedProject.value.id,
    {
      branch: reviewForm.value.type === 'branch' ? reviewForm.value.branch : undefined,
      mergeRequestId: reviewForm.value.type === 'merge' ? reviewForm.value.mergeRequestId : undefined
    }
  )
  
  reviewDialogVisible.value = false
  ElMessage.success('审查任务已创建')
  
  // 跳转到审查页面
  router.push(`/review/${selectedProject.value.id}`)
}

const viewProject = (project: GitLabProject) => {
  window.open(project.webUrl, '_blank')
}

const viewHistory = (project: GitLabProject) => {
  router.push(`/reports?projectId=${project.id}`)
}

onMounted(() => {
  if (projects.value.length === 0) {
    projectStore.loadProjects()
  }
})
</script>

<style scoped>
.projects-container {
  @apply p-6;
}

.card-header {
  @apply flex justify-between items-center;
}

.card-header h2 {
  @apply m-0 text-xl font-semibold text-gray-800;
}

.header-actions {
  @apply flex items-center gap-3;
}

.project-name {
  @apply flex items-center gap-2;
}
</style>