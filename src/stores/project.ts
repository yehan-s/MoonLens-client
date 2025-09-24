import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface GitLabProject {
  id: number
  name: string
  path: string
  description?: string
  webUrl: string
  defaultBranch: string
  lastActivityAt: string
  namespace: {
    id: number
    name: string
    path: string
  }
  statistics?: {
    commitCount: number
    repositorySize: number
  }
}

export interface ReviewTask {
  id: string
  projectId: number
  projectName: string
  mergeRequestId?: number
  branch?: string
  status: 'pending' | 'reviewing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  issuesFound?: number
  severity?: {
    critical: number
    major: number
    minor: number
    info: number
  }
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<GitLabProject[]>([])
  const currentProject = ref<GitLabProject | null>(null)
  const reviewTasks = ref<ReviewTask[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取项目统计信息
  const projectStats = computed(() => {
    return {
      totalProjects: projects.value.length,
      totalReviews: reviewTasks.value.length,
      completedReviews: reviewTasks.value.filter(t => t.status === 'completed').length,
      pendingReviews: reviewTasks.value.filter(t => t.status === 'pending').length,
      reviewingTasks: reviewTasks.value.filter(t => t.status === 'reviewing').length
    }
  })

  // 加载项目列表
  const loadProjects = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO: 调用 API 获取项目列表
      // 模拟数据
      projects.value = [
        {
          id: 1,
          name: 'Frontend App',
          path: 'frontend-app',
          description: 'Vue.js 前端应用',
          webUrl: 'https://gitlab.com/group/frontend-app',
          defaultBranch: 'main',
          lastActivityAt: new Date().toISOString(),
          namespace: {
            id: 1,
            name: 'Group',
            path: 'group'
          }
        },
        {
          id: 2,
          name: 'Backend API',
          path: 'backend-api',
          description: 'Node.js 后端服务',
          webUrl: 'https://gitlab.com/group/backend-api',
          defaultBranch: 'master',
          lastActivityAt: new Date().toISOString(),
          namespace: {
            id: 1,
            name: 'Group',
            path: 'group'
          }
        }
      ]
    } catch (err) {
      error.value = '加载项目失败'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 选择项目
  const selectProject = (project: GitLabProject) => {
    currentProject.value = project
  }

  // 创建审查任务
  const createReviewTask = async (projectId: number, options?: {
    mergeRequestId?: number
    branch?: string
  }) => {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) {
      throw new Error('项目不存在')
    }

    const task: ReviewTask = {
      id: 'task-' + Date.now(),
      projectId,
      projectName: project.name,
      mergeRequestId: options?.mergeRequestId,
      branch: options?.branch || project.defaultBranch,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    reviewTasks.value.push(task)
    return task
  }

  // 更新审查任务状态
  const updateTaskStatus = (taskId: string, status: ReviewTask['status'], data?: Partial<ReviewTask>) => {
    const task = reviewTasks.value.find(t => t.id === taskId)
    if (task) {
      task.status = status
      if (data) {
        Object.assign(task, data)
      }
      if (status === 'completed') {
        task.completedAt = new Date().toISOString()
      }
    }
  }

  return {
    projects,
    currentProject,
    reviewTasks,
    loading,
    error,
    projectStats,
    loadProjects,
    selectProject,
    createReviewTask,
    updateTaskStatus
  }
})