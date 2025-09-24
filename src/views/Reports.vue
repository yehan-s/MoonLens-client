<template>
  <div class="reports-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>审查报告</h2>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 350px"
          />
        </div>
      </template>

      <el-table :data="reports" style="width: 100%">
        <el-table-column prop="id" label="报告 ID" width="150" />
        <el-table-column prop="projectName" label="项目名称" />
        <el-table-column prop="createdAt" label="生成时间">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="summary.totalIssues" label="问题总数" width="100" />
        <el-table-column label="严重程度分布" width="300">
          <template #default="{ row }">
            <div class="severity-distribution">
              <el-tag type="danger" size="small">
                严重: {{ row.summary.criticalIssues }}
              </el-tag>
              <el-tag type="warning" size="small">
                主要: {{ row.summary.majorIssues }}
              </el-tag>
              <el-tag type="info" size="small">
                次要: {{ row.summary.minorIssues }}
              </el-tag>
              <el-tag type="success" size="small">
                提示: {{ row.summary.infoIssues }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewReport(row)">查看</el-button>
            <el-dropdown style="margin-left: 10px">
              <el-button size="small">
                导出<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="exportReport(row, 'html')">HTML</el-dropdown-item>
                  <el-dropdown-item @click="exportReport(row, 'pdf')">PDF</el-dropdown-item>
                  <el-dropdown-item @click="exportReport(row, 'json')">JSON</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const dateRange = ref<[Date, Date] | null>(null)

const reports = ref([
  {
    id: 'RPT-001',
    projectName: 'Frontend App',
    createdAt: new Date().toISOString(),
    summary: {
      totalIssues: 23,
      criticalIssues: 2,
      majorIssues: 5,
      minorIssues: 10,
      infoIssues: 6,
      filesAnalyzed: 45,
      linesOfCode: 5230
    }
  }
])

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewReport = (report: any) => {
  console.log('查看报告:', report)
}

const exportReport = (report: any, format: string) => {
  console.log('导出报告:', report, format)
}
</script>

<style scoped>
.reports-container {
  @apply p-6;
}

.card-header {
  @apply flex justify-between items-center;
}

.card-header h2 {
  @apply m-0 text-xl font-semibold text-gray-800;
}

.severity-distribution {
  @apply flex gap-1;
}
</style>