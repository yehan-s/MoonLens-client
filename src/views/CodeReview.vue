<template>
  <div class="code-review-container">
    <el-row :gutter="20">
      <!-- 左侧：问题列表 -->
      <el-col :span="8">
        <el-card class="issues-panel">
          <template #header>
            <div class="panel-header">
              <h3>问题列表</h3>
              <el-badge :value="issues.length" class="issue-count" />
            </div>
          </template>

          <!-- 过滤器 -->
          <div class="filters">
            <el-select 
              v-model="severityFilter" 
              placeholder="严重程度"
              clearable
              style="width: 100%; margin-bottom: 10px"
            >
              <el-option label="严重" value="critical" />
              <el-option label="主要" value="major" />
              <el-option label="次要" value="minor" />
              <el-option label="提示" value="info" />
            </el-select>
            
            <el-select 
              v-model="categoryFilter" 
              placeholder="问题类型"
              clearable
              style="width: 100%"
            >
              <el-option label="安全性" value="security" />
              <el-option label="性能" value="performance" />
              <el-option label="可维护性" value="maintainability" />
              <el-option label="可靠性" value="reliability" />
              <el-option label="代码风格" value="style" />
            </el-select>
          </div>

          <!-- 问题列表 -->
          <el-scrollbar height="600px">
            <div class="issues-list">
              <div 
                v-for="issue in filteredIssues" 
                :key="issue.id"
                :class="['issue-item', { active: selectedIssue?.id === issue.id }]"
                @click="selectIssue(issue)"
              >
                <div class="issue-header">
                  <el-tag 
                    :type="getSeverityType(issue.severity)"
                    size="small"
                  >
                    {{ issue.severity }}
                  </el-tag>
                  <el-tag type="info" size="small">
                    {{ issue.category }}
                  </el-tag>
                </div>
                <div class="issue-file">{{ issue.file }}:{{ issue.line }}</div>
                <div class="issue-message">{{ issue.message }}</div>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 右侧：代码详情 -->
      <el-col :span="16">
        <el-card class="code-panel">
          <template #header>
            <div class="panel-header">
              <h3>代码详情</h3>
              <div class="actions">
                <el-button size="small" @click="exportReport">
                  <el-icon><Download /></el-icon>
                  导出报告
                </el-button>
                <el-button size="small" type="primary" @click="reRunAnalysis">
                  <el-icon><Refresh /></el-icon>
                  重新分析
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="selectedIssue" class="issue-detail">
            <!-- 问题详情 -->
            <div class="detail-section">
              <h4>问题详情</h4>
              <el-descriptions :column="2">
                <el-descriptions-item label="文件">
                  {{ selectedIssue.file }}
                </el-descriptions-item>
                <el-descriptions-item label="位置">
                  第 {{ selectedIssue.line }} 行，第 {{ selectedIssue.column || 0 }} 列
                </el-descriptions-item>
                <el-descriptions-item label="规则">
                  {{ selectedIssue.rule || 'N/A' }}
                </el-descriptions-item>
                <el-descriptions-item label="类型">
                  {{ selectedIssue.category }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 问题描述 -->
            <div class="detail-section">
              <h4>问题描述</h4>
              <p>{{ selectedIssue.description || selectedIssue.message }}</p>
            </div>

            <!-- 代码片段 -->
            <div class="detail-section" v-if="selectedIssue.codeSnippet">
              <h4>代码片段</h4>
              <pre class="code-snippet">{{ selectedIssue.codeSnippet }}</pre>
            </div>

            <!-- 修复建议 -->
            <div class="detail-section" v-if="selectedIssue.suggestion">
              <h4>修复建议</h4>
              <el-alert 
                :title="selectedIssue.suggestion" 
                type="success"
                :closable="false"
              />
            </div>
          </div>

          <el-empty v-else description="选择一个问题查看详情" />
        </el-card>

        <!-- AI 洞察 -->
        <el-card class="ai-insights" style="margin-top: 20px" v-if="aiInsights">
          <template #header>
            <h3>AI 洞察</h3>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="insight-item">
                <h4>整体质量</h4>
                <el-progress 
                  type="dashboard" 
                  :percentage="getQualityPercentage()"
                  :color="getQualityColor()"
                />
              </div>
            </el-col>
            <el-col :span="8">
              <div class="insight-item">
                <h4>主要关注点</h4>
                <ul>
                  <li v-for="(concern, index) in aiInsights.mainConcerns" :key="index">
                    {{ concern }}
                  </li>
                </ul>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="insight-item">
                <h4>改进建议</h4>
                <ul>
                  <li v-for="(improvement, index) in aiInsights.improvements" :key="index">
                    {{ improvement }}
                  </li>
                </ul>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReviewStore, type CodeIssue } from '../stores/review'
import { ElMessage } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'

const route = useRoute()
const reviewStore = useReviewStore()

const selectedIssue = ref<CodeIssue | null>(null)
const severityFilter = ref('')
const categoryFilter = ref('')

// 模拟数据
const issues = ref<CodeIssue[]>([
  {
    id: '1',
    file: 'src/components/UserAuth.vue',
    line: 45,
    column: 12,
    severity: 'critical',
    category: 'security',
    message: 'SQL 注入风险',
    description: '检测到直接拼接 SQL 语句，可能存在 SQL 注入风险',
    suggestion: '使用参数化查询或 ORM 框架',
    codeSnippet: 'const query = `SELECT * FROM users WHERE id = ${userId}`',
    rule: 'security/sql-injection'
  },
  {
    id: '2',
    file: 'src/utils/crypto.js',
    line: 23,
    severity: 'major',
    category: 'security',
    message: '使用了弱加密算法',
    description: 'MD5 已被证明不安全，不应用于密码存储',
    suggestion: '使用 bcrypt 或 Argon2 等专门的密码哈希算法',
    codeSnippet: 'const hash = crypto.createHash("md5").update(password).digest("hex")'
  },
  {
    id: '3',
    file: 'src/api/index.ts',
    line: 67,
    severity: 'minor',
    category: 'performance',
    message: '未优化的循环',
    description: '在循环中进行了重复的 DOM 查询',
    suggestion: '将 DOM 查询移到循环外部',
    codeSnippet: 'for (let i = 0; i < items.length; i++) {\n  document.getElementById("list")...\n}'
  }
])

const aiInsights = ref({
  overallQuality: 'fair' as const,
  mainConcerns: [
    '发现多个安全漏洞需要立即修复',
    '代码中存在性能瓶颈',
    '缺少输入验证'
  ],
  improvements: [
    '添加输入验证和消毒',
    '使用更安全的加密方法',
    '优化数据库查询'
  ],
  bestPractices: []
})

const filteredIssues = computed(() => {
  let filtered = [...issues.value]
  
  if (severityFilter.value) {
    filtered = filtered.filter(i => i.severity === severityFilter.value)
  }
  
  if (categoryFilter.value) {
    filtered = filtered.filter(i => i.category === categoryFilter.value)
  }
  
  return filtered
})

const getSeverityType = (severity: string) => {
  const types: Record<string, string> = {
    critical: 'danger',
    major: 'warning',
    minor: 'info',
    info: 'success'
  }
  return types[severity] || 'info'
}

const getQualityPercentage = () => {
  const quality = aiInsights.value.overallQuality
  const percentages: Record<string, number> = {
    excellent: 90,
    good: 75,
    fair: 50,
    poor: 25
  }
  return percentages[quality] || 0
}

const getQualityColor = () => {
  const quality = aiInsights.value.overallQuality
  const colors: Record<string, string> = {
    excellent: '#67C23A',
    good: '#409EFF',
    fair: '#E6A23C',
    poor: '#F56C6C'
  }
  return colors[quality] || '#909399'
}

const selectIssue = (issue: CodeIssue) => {
  selectedIssue.value = issue
}

const exportReport = () => {
  ElMessage.success('报告导出中...')
  // TODO: 实现报告导出功能
}

const reRunAnalysis = () => {
  ElMessage.info('重新分析中...')
  // TODO: 实现重新分析功能
}

onMounted(() => {
  const projectId = route.params.projectId
  console.log('项目 ID:', projectId)
  // TODO: 加载项目的审查数据
})
</script>

<style scoped>
.code-review-container {
  @apply p-6;
  height: calc(100vh - 60px);
}

.panel-header {
  @apply flex justify-between items-center;
}

.panel-header h3 {
  @apply m-0 text-lg font-semibold;
}

.filters {
  @apply mb-4 space-y-2;
}

.issues-list {
  @apply p-2 space-y-2;
}

.issue-item {
  @apply p-3 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200
         hover:border-primary hover:bg-gray-50;
}

.issue-item.active {
  @apply border-primary bg-blue-50;
}

.issue-header {
  @apply flex gap-2 mb-2;
}

.issue-file {
  @apply text-xs text-gray-500 mb-1;
}

.issue-message {
  @apply text-sm text-gray-700;
}

.issue-detail {
  @apply p-6;
}

.detail-section {
  @apply mb-6;
}

.detail-section h4 {
  @apply mb-3 text-gray-800 font-medium;
}

.code-snippet {
  @apply bg-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm;
}

.insight-item {
  @apply text-center;
}

.insight-item h4 {
  @apply mb-4 font-medium;
}

.insight-item ul {
  @apply text-left pl-5 space-y-1;
}

.insight-item li {
  @apply text-gray-600 text-sm;
}

.actions {
  @apply flex gap-2;
}

.ai-insights {
  @apply mt-6;
}
</style>