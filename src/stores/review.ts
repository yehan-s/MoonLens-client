import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CodeIssue {
  id: string
  file: string
  line: number
  column?: number
  severity: 'critical' | 'major' | 'minor' | 'info'
  category: 'security' | 'performance' | 'maintainability' | 'reliability' | 'style'
  message: string
  description?: string
  suggestion?: string
  codeSnippet?: string
  rule?: string
}

export interface ReviewReport {
  id: string
  projectId: number
  taskId: string
  createdAt: string
  summary: {
    totalIssues: number
    criticalIssues: number
    majorIssues: number
    minorIssues: number
    infoIssues: number
    filesAnalyzed: number
    linesOfCode: number
    duplicateRate?: number
    complexityScore?: number
  }
  issues: CodeIssue[]
  aiInsights?: {
    overallQuality: 'excellent' | 'good' | 'fair' | 'poor'
    mainConcerns: string[]
    improvements: string[]
    bestPractices: string[]
  }
}

export const useReviewStore = defineStore('review', () => {
  const currentReport = ref<ReviewReport | null>(null)
  const reports = ref<ReviewReport[]>([])
  const activeIssues = ref<CodeIssue[]>([])
  const filters = ref({
    severity: [] as string[],
    category: [] as string[],
    file: '' as string
  })

  // 添加审查报告
  const addReport = (report: ReviewReport) => {
    reports.value.unshift(report)
    currentReport.value = report
    activeIssues.value = report.issues
  }

  // 过滤问题
  const filterIssues = () => {
    if (!currentReport.value) return []
    
    let filtered = [...currentReport.value.issues]
    
    if (filters.value.severity.length > 0) {
      filtered = filtered.filter(issue => 
        filters.value.severity.includes(issue.severity)
      )
    }
    
    if (filters.value.category.length > 0) {
      filtered = filtered.filter(issue => 
        filters.value.category.includes(issue.category)
      )
    }
    
    if (filters.value.file) {
      filtered = filtered.filter(issue => 
        issue.file.toLowerCase().includes(filters.value.file.toLowerCase())
      )
    }
    
    activeIssues.value = filtered
    return filtered
  }

  // 更新过滤器
  const updateFilters = (newFilters: Partial<typeof filters.value>) => {
    Object.assign(filters.value, newFilters)
    filterIssues()
  }

  // 清除过滤器
  const clearFilters = () => {
    filters.value = {
      severity: [],
      category: [],
      file: ''
    }
    if (currentReport.value) {
      activeIssues.value = currentReport.value.issues
    }
  }

  // 获取问题统计
  const getIssueStats = (issues: CodeIssue[] = activeIssues.value) => {
    const stats = {
      bySeverity: {
        critical: 0,
        major: 0,
        minor: 0,
        info: 0
      },
      byCategory: {
        security: 0,
        performance: 0,
        maintainability: 0,
        reliability: 0,
        style: 0
      }
    }

    issues.forEach(issue => {
      stats.bySeverity[issue.severity]++
      stats.byCategory[issue.category]++
    })

    return stats
  }

  // 导出报告
  const exportReport = (reportId: string, format: 'json' | 'html' | 'pdf') => {
    const report = reports.value.find(r => r.id === reportId)
    if (!report) return null

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2)
      case 'html':
        // TODO: 生成 HTML 报告
        return '<html>...</html>'
      case 'pdf':
        // TODO: 生成 PDF 报告
        return 'PDF generation not implemented'
      default:
        return null
    }
  }

  return {
    currentReport,
    reports,
    activeIssues,
    filters,
    addReport,
    filterIssues,
    updateFilters,
    clearFilters,
    getIssueStats,
    exportReport
  }
})