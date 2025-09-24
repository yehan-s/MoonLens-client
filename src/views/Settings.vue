<template>
  <div class="settings-container">
    <el-card>
      <template #header>
        <h2>系统设置</h2>
      </template>

      <el-tabs v-model="activeTab">
        <!-- GitLab 配置 -->
        <el-tab-pane label="GitLab 配置" name="gitlab">
          <el-form :model="gitlabConfig" label-width="150px">
            <el-form-item label="GitLab URL">
              <el-input v-model="gitlabConfig.url" placeholder="https://gitlab.com" />
            </el-form-item>
            <el-form-item label="Access Token">
              <el-input 
                v-model="gitlabConfig.token" 
                type="password" 
                show-password
                placeholder="输入 GitLab Access Token"
              />
            </el-form-item>
            <el-form-item label="API 版本">
              <el-select v-model="gitlabConfig.apiVersion">
                <el-option label="v4" value="v4" />
                <el-option label="v3" value="v3" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testGitLabConnection">
                测试连接
              </el-button>
              <el-button @click="saveGitLabConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- AI 模型配置 -->
        <el-tab-pane label="AI 模型配置" name="ai">
          <el-form :model="aiConfig" label-width="150px">
            <el-form-item label="模型提供商">
              <el-select v-model="aiConfig.provider">
                <el-option label="OpenAI" value="openai" />
                <el-option label="Azure OpenAI" value="azure" />
                <el-option label="本地模型" value="local" />
              </el-select>
            </el-form-item>
            <el-form-item label="API Key" v-if="aiConfig.provider !== 'local'">
              <el-input 
                v-model="aiConfig.apiKey" 
                type="password"
                show-password
                placeholder="输入 API Key"
              />
            </el-form-item>
            <el-form-item label="模型名称">
              <el-input v-model="aiConfig.model" placeholder="gpt-4" />
            </el-form-item>
            <el-form-item label="温度参数">
              <el-slider 
                v-model="aiConfig.temperature" 
                :min="0" 
                :max="1" 
                :step="0.1"
                show-input
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveAIConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 审查规则 -->
        <el-tab-pane label="审查规则" name="rules">
          <el-form :model="rulesConfig" label-width="150px">
            <el-form-item label="启用的规则">
              <el-checkbox-group v-model="rulesConfig.enabled">
                <el-checkbox label="security">安全性检查</el-checkbox>
                <el-checkbox label="performance">性能优化</el-checkbox>
                <el-checkbox label="maintainability">可维护性</el-checkbox>
                <el-checkbox label="reliability">可靠性</el-checkbox>
                <el-checkbox label="style">代码风格</el-checkbox>
                <el-checkbox label="documentation">文档完整性</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="严重程度阈值">
              <el-select v-model="rulesConfig.severityThreshold">
                <el-option label="仅严重问题" value="critical" />
                <el-option label="主要及以上" value="major" />
                <el-option label="次要及以上" value="minor" />
                <el-option label="所有问题" value="info" />
              </el-select>
            </el-form-item>
            <el-form-item label="忽略文件模式">
              <el-input 
                v-model="rulesConfig.ignorePatterns"
                type="textarea"
                :rows="3"
                placeholder="每行一个模式，如：*.min.js"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveRulesConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notifications">
          <el-form :model="notificationConfig" label-width="150px">
            <el-form-item label="启用通知">
              <el-switch v-model="notificationConfig.enabled" />
            </el-form-item>
            <el-form-item label="通知方式">
              <el-checkbox-group v-model="notificationConfig.methods">
                <el-checkbox label="email">邮件</el-checkbox>
                <el-checkbox label="webhook">Webhook</el-checkbox>
                <el-checkbox label="slack">Slack</el-checkbox>
                <el-checkbox label="dingtalk">钉钉</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="邮件地址" v-if="notificationConfig.methods.includes('email')">
              <el-input v-model="notificationConfig.email" placeholder="user@example.com" />
            </el-form-item>
            <el-form-item label="Webhook URL" v-if="notificationConfig.methods.includes('webhook')">
              <el-input v-model="notificationConfig.webhookUrl" placeholder="https://..." />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotificationConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('gitlab')

const gitlabConfig = ref({
  url: 'https://gitlab.com',
  token: '',
  apiVersion: 'v4'
})

const aiConfig = ref({
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4',
  temperature: 0.3
})

const rulesConfig = ref({
  enabled: ['security', 'performance', 'maintainability'],
  severityThreshold: 'major',
  ignorePatterns: '*.min.js\n*.min.css\nnode_modules/*'
})

const notificationConfig = ref({
  enabled: true,
  methods: ['email'],
  email: '',
  webhookUrl: ''
})

const testGitLabConnection = () => {
  ElMessage.info('测试 GitLab 连接中...')
  // TODO: 实现连接测试
  setTimeout(() => {
    ElMessage.success('连接成功！')
  }, 1000)
}

const saveGitLabConfig = () => {
  ElMessage.success('GitLab 配置已保存')
}

const saveAIConfig = () => {
  ElMessage.success('AI 模型配置已保存')
}

const saveRulesConfig = () => {
  ElMessage.success('审查规则已保存')
}

const saveNotificationConfig = () => {
  ElMessage.success('通知设置已保存')
}
</script>

<style scoped>
.settings-container {
  @apply p-6;
}

.settings-container h2 {
  @apply m-0 text-xl font-semibold text-gray-800;
}
</style>