import request from './request'

// GitLab 项目相关 API
export const gitlabApi = {
  // 获取项目列表
  getProjects: (params?: {
    search?: string
    per_page?: number
    page?: number
  }) => {
    return request({
      url: '/gitlab/projects',
      method: 'get',
      params
    })
  },

  // 获取项目详情
  getProject: (projectId: number) => {
    return request({
      url: `/gitlab/projects/${projectId}`,
      method: 'get'
    })
  },

  // 获取项目分支
  getBranches: (projectId: number) => {
    return request({
      url: `/gitlab/projects/${projectId}/branches`,
      method: 'get'
    })
  },

  // 获取合并请求列表
  getMergeRequests: (projectId: number, params?: {
    state?: 'opened' | 'closed' | 'merged'
    per_page?: number
    page?: number
  }) => {
    return request({
      url: `/gitlab/projects/${projectId}/merge_requests`,
      method: 'get',
      params
    })
  },

  // 获取合并请求详情
  getMergeRequest: (projectId: number, mergeRequestId: number) => {
    return request({
      url: `/gitlab/projects/${projectId}/merge_requests/${mergeRequestId}`,
      method: 'get'
    })
  },

  // 获取合并请求的差异
  getMergeRequestDiff: (projectId: number, mergeRequestId: number) => {
    return request({
      url: `/gitlab/projects/${projectId}/merge_requests/${mergeRequestId}/diffs`,
      method: 'get'
    })
  },

  // 获取项目文件树
  getRepositoryTree: (projectId: number, params?: {
    path?: string
    ref?: string
    recursive?: boolean
  }) => {
    return request({
      url: `/gitlab/projects/${projectId}/repository/tree`,
      method: 'get',
      params
    })
  },

  // 获取文件内容
  getFileContent: (projectId: number, filePath: string, ref: string = 'main') => {
    return request({
      url: `/gitlab/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}`,
      method: 'get',
      params: { ref }
    })
  }
}

// 代码审查相关 API
export const reviewApi = {
  // 创建审查任务
  createReviewTask: (data: {
    projectId: number
    type: 'branch' | 'merge_request' | 'full'
    branch?: string
    mergeRequestId?: number
    rules?: string[]
  }) => {
    return request({
      url: '/reviews',
      method: 'post',
      data
    })
  },

  // 获取审查任务列表
  getReviewTasks: (params?: {
    projectId?: number
    status?: string
    page?: number
    per_page?: number
  }) => {
    return request({
      url: '/reviews',
      method: 'get',
      params
    })
  },

  // 获取审查任务详情
  getReviewTask: (taskId: string) => {
    return request({
      url: `/reviews/${taskId}`,
      method: 'get'
    })
  },

  // 获取审查报告
  getReviewReport: (taskId: string) => {
    return request({
      url: `/reviews/${taskId}/report`,
      method: 'get'
    })
  },

  // 导出审查报告
  exportReviewReport: (reportId: string, format: 'html' | 'pdf' | 'json') => {
    return request({
      url: `/reviews/reports/${reportId}/export`,
      method: 'get',
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob'
    })
  },

  // 获取 AI 分析结果
  getAIAnalysis: (taskId: string) => {
    return request({
      url: `/reviews/${taskId}/ai-analysis`,
      method: 'get'
    })
  },

  // 重新执行审查
  rerunReview: (taskId: string) => {
    return request({
      url: `/reviews/${taskId}/rerun`,
      method: 'post'
    })
  }
}

// 用户相关 API
export const userApi = {
  // 登录
  login: (data: {
    username: string
    password: string
  }) => {
    return request({
      url: '/auth/login',
      method: 'post',
      data
    })
  },

  // 登出
  logout: () => {
    return request({
      url: '/auth/logout',
      method: 'post'
    })
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return request({
      url: '/auth/me',
      method: 'get'
    })
  },

  // 更新用户信息
  updateProfile: (data: {
    email?: string
    avatar?: string
  }) => {
    return request({
      url: '/auth/profile',
      method: 'put',
      data
    })
  }
}

// 系统设置相关 API
export const settingsApi = {
  // 获取系统设置
  getSettings: () => {
    return request({
      url: '/settings',
      method: 'get'
    })
  },

  // 更新 GitLab 配置
  updateGitLabConfig: (data: {
    url: string
    token: string
    apiVersion: string
  }) => {
    return request({
      url: '/settings/gitlab',
      method: 'put',
      data
    })
  },

  // 测试 GitLab 连接
  testGitLabConnection: () => {
    return request({
      url: '/settings/gitlab/test',
      method: 'post'
    })
  },

  // 更新 AI 配置
  updateAIConfig: (data: {
    provider: string
    apiKey: string
    model: string
    temperature: number
  }) => {
    return request({
      url: '/settings/ai',
      method: 'put',
      data
    })
  },

  // 更新审查规则
  updateRulesConfig: (data: {
    enabled: string[]
    severityThreshold: string
    ignorePatterns: string
  }) => {
    return request({
      url: '/settings/rules',
      method: 'put',
      data
    })
  },

  // 更新通知设置
  updateNotificationConfig: (data: {
    enabled: boolean
    methods: string[]
    email?: string
    webhookUrl?: string
  }) => {
    return request({
      url: '/settings/notifications',
      method: 'put',
      data
    })
  }
}