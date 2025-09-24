# Design: AI Code Review

## Architecture Overview

### 系统架构图
```
┌─────────────────────────────────────────────────────┐
│                  GitLab Instance                     │
│  MR Events → Webhook → MoonLens                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                 MoonLens Server                      │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐    │
│  │          Review Controller                  │    │
│  │  - /reviews/trigger                         │    │
│  │  - /reviews/:id                             │    │
│  │  - /reviews/:id/feedback                    │    │
│  │  - /reviews/history                         │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │           Review Service                    │    │
│  │  - Code Analysis                            │    │
│  │  - Context Building                         │    │
│  │  - AI Model Selection                       │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │        Review Queue (Bull)                  │    │
│  │  - Review Jobs                              │    │
│  │  - Retry Logic                              │    │
│  │  - Priority Queue                           │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │          AI Service Layer                   │    │
│  ├─────────────────┬──────────────────────────┤    │
│  │   OpenAI        │     Anthropic            │    │
│  │   Provider      │     Provider             │    │
│  │   - GPT-4       │     - Claude 3           │    │
│  │   - GPT-4-32k   │     - Claude 3 Opus      │    │
│  └─────────────────┴──────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │         Result Processor                    │    │
│  │  - Issue Classification                     │    │
│  │  - Suggestion Generation                    │    │
│  │  - Score Calculation                        │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              Data Storage Layer                      │
├─────────────────────────────────────────────────────┤
│  MySQL: Reviews, Issues, Suggestions                 │
│  Redis: Cache, Queue, Rate Limiting                  │
│  S3/MinIO: Large Diffs, Reports                     │
└─────────────────────────────────────────────────────┘
```

## Component Design

### 前端组件设计

#### 1. 审查触发组件
```vue
<!-- src/views/review/ReviewTrigger.vue -->
<template>
  <div class="review-trigger">
    <!-- MR选择 -->
    <el-select 
      v-model="selectedMR"
      placeholder="选择要审查的MR"
      filterable
    >
      <el-option
        v-for="mr in mergeRequests"
        :key="mr.iid"
        :label="`!${mr.iid} ${mr.title}`"
        :value="mr.iid"
      >
        <div class="mr-option">
          <span class="mr-number">!{{ mr.iid }}</span>
          <span class="mr-title">{{ mr.title }}</span>
          <el-tag size="small">{{ mr.state }}</el-tag>
        </div>
      </el-option>
    </el-select>

    <!-- 审查配置 -->
    <el-form :model="reviewConfig" class="review-config">
      <el-form-item label="AI模型">
        <el-radio-group v-model="reviewConfig.model">
          <el-radio-button label="gpt-4">GPT-4</el-radio-button>
          <el-radio-button label="gpt-4-32k">GPT-4-32K</el-radio-button>
          <el-radio-button label="claude-3">Claude 3</el-radio-button>
          <el-radio-button label="auto">智能选择</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="审查深度">
        <el-slider 
          v-model="reviewConfig.depth"
          :min="1"
          :max="5"
          :marks="depthMarks"
        />
      </el-form-item>

      <el-form-item label="关注重点">
        <el-checkbox-group v-model="reviewConfig.focus">
          <el-checkbox label="bug">Bug检测</el-checkbox>
          <el-checkbox label="security">安全漏洞</el-checkbox>
          <el-checkbox label="performance">性能问题</el-checkbox>
          <el-checkbox label="style">代码风格</el-checkbox>
          <el-checkbox label="test">测试覆盖</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <!-- 触发按钮 -->
    <el-button 
      type="primary"
      :loading="isReviewing"
      @click="triggerReview"
    >
      开始AI审查
    </el-button>
  </div>
</template>
```

#### 2. 审查结果展示组件
```vue
<!-- src/views/review/ReviewResult.vue -->
<template>
  <div class="review-result">
    <!-- 总体评分 -->
    <div class="review-summary">
      <div class="score-display">
        <el-progress 
          type="dashboard"
          :percentage="review.score"
          :color="scoreColor"
        >
          <template #default="{ percentage }">
            <span class="score-text">{{ percentage }}</span>
            <span class="score-label">代码质量评分</span>
          </template>
        </el-progress>
      </div>
      
      <div class="summary-stats">
        <el-statistic title="发现问题" :value="review.issueCount" />
        <el-statistic title="改进建议" :value="review.suggestionCount" />
        <el-statistic title="审查耗时" :value="review.duration" suffix="秒" />
      </div>
    </div>

    <!-- 问题列表 -->
    <div class="issues-section">
      <h3>发现的问题</h3>
      <el-collapse v-model="activeIssues">
        <el-collapse-item
          v-for="issue in groupedIssues"
          :key="issue.category"
          :name="issue.category"
        >
          <template #title>
            <span>{{ issue.label }}</span>
            <el-badge :value="issue.items.length" />
          </template>
          
          <IssueCard
            v-for="item in issue.items"
            :key="item.id"
            :issue="item"
            @view-code="viewCode"
            @apply-fix="applyFix"
          />
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 代码建议 -->
    <div class="suggestions-section">
      <h3>改进建议</h3>
      <el-tabs v-model="activeSuggestionTab">
        <el-tab-pane 
          v-for="file in filesWithSuggestions"
          :key="file.path"
          :label="file.name"
          :name="file.path"
        >
          <CodeDiff
            :original="file.original"
            :suggested="file.suggested"
            :annotations="file.annotations"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 对话交互 -->
    <div class="chat-section">
      <h3>AI对话</h3>
      <ChatInterface
        :review-id="review.id"
        :context="review.context"
        @send-message="sendMessage"
      />
    </div>
  </div>
</template>
```

#### 3. 审查历史组件
```vue
<!-- src/views/review/ReviewHistory.vue -->
<template>
  <div class="review-history">
    <!-- 筛选器 -->
    <div class="history-filters">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
      <el-select v-model="filterModel" placeholder="AI模型">
        <el-option label="全部" value="" />
        <el-option label="GPT-4" value="gpt-4" />
        <el-option label="Claude 3" value="claude-3" />
      </el-select>
    </div>

    <!-- 历史记录表格 -->
    <el-table :data="reviewHistory" @row-click="viewReview">
      <el-table-column prop="mrTitle" label="MR标题" />
      <el-table-column prop="score" label="评分">
        <template #default="scope">
          <el-tag :type="getScoreType(scope.row.score)">
            {{ scope.row.score }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="issueCount" label="问题数" />
      <el-table-column prop="model" label="AI模型" />
      <el-table-column prop="createdAt" label="审查时间">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click.stop="exportReport(scope.row)">
            导出报告
          </el-button>
          <el-button size="small" @click.stop="reReview(scope.row)">
            重新审查
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```

### 后端模块设计

#### 1. AI审查模块结构
```
src/review/
├── review.module.ts
├── review.controller.ts
├── review.service.ts
├── dto/
│   ├── trigger-review.dto.ts
│   ├── review-config.dto.ts
│   ├── review-result.dto.ts
│   └── chat-message.dto.ts
├── entities/
│   ├── review.entity.ts
│   ├── review-issue.entity.ts
│   └── review-suggestion.entity.ts
├── services/
│   ├── code-analyzer.service.ts
│   ├── context-builder.service.ts
│   ├── ai-provider.service.ts
│   └── result-processor.service.ts
├── providers/
│   ├── openai.provider.ts
│   ├── anthropic.provider.ts
│   └── provider.interface.ts
├── processors/
│   └── review.processor.ts
└── prompts/
    ├── system-prompt.ts
    ├── review-prompt.ts
    └── chat-prompt.ts
```

#### 2. 数据库Schema设计
```prisma
// prisma/schema.prisma

model Review {
  id              String    @id @default(uuid())
  projectId       String
  mrIid           String
  mrTitle         String
  triggeredBy     String
  model           String
  config          Json
  status          ReviewStatus @default(PENDING)
  score           Int?
  summary         String?   @db.Text
  startedAt       DateTime?
  completedAt     DateTime?
  duration        Int?      // 秒
  tokenUsage      Json?
  error           String?
  
  // Relations
  project         Project   @relation(fields: [projectId], references: [id])
  user            User      @relation(fields: [triggeredBy], references: [id])
  issues          ReviewIssue[]
  suggestions     ReviewSuggestion[]
  chats           ReviewChat[]
  
  @@index([projectId, mrIid])
  @@index([status])
  @@index([createdAt])
  @@map("reviews")
}

model ReviewIssue {
  id              String    @id @default(uuid())
  reviewId        String
  severity        IssueSeverity
  category        IssueCategory
  file            String
  line            Int?
  endLine         Int?
  message         String    @db.Text
  suggestion      String?   @db.Text
  codeSnippet     String?   @db.Text
  
  // Relations
  review          Review    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  @@index([severity])
  @@index([category])
  @@map("review_issues")
}

model ReviewSuggestion {
  id              String    @id @default(uuid())
  reviewId        String
  type            SuggestionType
  file            String
  originalCode    String    @db.Text
  suggestedCode   String    @db.Text
  explanation     String    @db.Text
  impact          String?
  
  // Relations
  review          Review    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  @@index([type])
  @@map("review_suggestions")
}

model ReviewChat {
  id              String    @id @default(uuid())
  reviewId        String
  userId          String
  role            ChatRole  // USER or ASSISTANT
  message         String    @db.Text
  context         Json?
  createdAt       DateTime  @default(now())
  
  // Relations
  review          Review    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id])
  
  @@map("review_chats")
}

enum ReviewStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

enum IssueSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
  INFO
}

enum IssueCategory {
  BUG
  SECURITY
  PERFORMANCE
  STYLE
  MAINTAINABILITY
  DOCUMENTATION
}

enum SuggestionType {
  REFACTOR
  OPTIMIZATION
  BEST_PRACTICE
  PATTERN
  TEST
}

enum ChatRole {
  USER
  ASSISTANT
}
```

## AI Integration Design

### 1. AI Provider接口
```typescript
// src/review/providers/provider.interface.ts
export interface AIProvider {
  name: string;
  models: string[];
  
  review(params: ReviewParams): Promise<ReviewResult>;
  chat(params: ChatParams): Promise<ChatResponse>;
  estimateTokens(text: string): number;
  isAvailable(): Promise<boolean>;
}

export interface ReviewParams {
  diff: string;
  context: CodeContext;
  config: ReviewConfig;
  prompt?: string;
}

export interface CodeContext {
  projectInfo: ProjectInfo;
  fileTree: string[];
  dependencies: string[];
  recentCommits: CommitInfo[];
  relatedFiles: FileContent[];
}

export interface ReviewResult {
  score: number;
  summary: string;
  issues: Issue[];
  suggestions: Suggestion[];
  tokenUsage: TokenUsage;
}
```

### 2. OpenAI Provider实现
```typescript
// src/review/providers/openai.provider.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  name = 'OpenAI';
  models = ['gpt-4', 'gpt-4-32k', 'gpt-4-turbo'];

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: configService.get('OPENAI_API_KEY'),
    });
  }

  async review(params: ReviewParams): Promise<ReviewResult> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildReviewPrompt(params);

    const response = await this.client.chat.completions.create({
      model: params.config.model || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: params.config.maxTokens || 4000,
      response_format: { type: 'json_object' },
    });

    return this.parseReviewResponse(response);
  }

  private buildSystemPrompt(): string {
    return `你是一位资深的代码审查专家，精通多种编程语言和最佳实践。
    你的任务是审查代码变更，识别潜在问题，并提供改进建议。
    
    审查标准：
    1. 代码正确性：查找bug、逻辑错误、边界条件
    2. 安全性：识别安全漏洞、敏感信息泄露、注入风险
    3. 性能：找出性能瓶颈、不必要的计算、内存泄漏
    4. 可维护性：代码清晰度、命名规范、注释完整性
    5. 最佳实践：设计模式、SOLID原则、DRY原则
    
    输出格式为JSON，包含：
    - score: 0-100的质量评分
    - summary: 总体评价摘要
    - issues: 问题数组，每个包含severity、category、file、line、message、suggestion
    - suggestions: 改进建议数组`;
  }

  private buildReviewPrompt(params: ReviewParams): string {
    return `请审查以下代码变更：

    项目信息：
    ${JSON.stringify(params.context.projectInfo, null, 2)}

    文件变更：
    ${params.diff}

    相关文件上下文：
    ${params.context.relatedFiles.map(f => 
      `--- ${f.path} ---\n${f.content}`
    ).join('\n\n')}

    请提供详细的代码审查结果。`;
  }

  private parseReviewResponse(response: any): ReviewResult {
    const content = JSON.parse(response.choices[0].message.content);
    
    return {
      score: content.score,
      summary: content.summary,
      issues: content.issues.map(this.mapIssue),
      suggestions: content.suggestions.map(this.mapSuggestion),
      tokenUsage: {
        prompt: response.usage.prompt_tokens,
        completion: response.usage.completion_tokens,
        total: response.usage.total_tokens,
      },
    };
  }
}
```

### 3. Anthropic Provider实现
```typescript
// src/review/providers/anthropic.provider.ts
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  name = 'Anthropic';
  models = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async review(params: ReviewParams): Promise<ReviewResult> {
    const prompt = this.buildClaudePrompt(params);

    const response = await this.client.messages.create({
      model: params.config.model || 'claude-3-sonnet',
      max_tokens: params.config.maxTokens || 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    return this.parseClaudeResponse(response);
  }

  private buildClaudePrompt(params: ReviewParams): string {
    return `Human: 作为代码审查专家，请审查以下代码变更并提供专业意见。

    <project_context>
    ${JSON.stringify(params.context.projectInfo, null, 2)}
    </project_context>

    <code_diff>
    ${params.diff}
    </code_diff>

    <related_files>
    ${params.context.relatedFiles.map(f => 
      `<file path="${f.path}">\n${f.content}\n</file>`
    ).join('\n')}
    </related_files>

    请按以下JSON格式输出审查结果：
    {
      "score": <0-100的评分>,
      "summary": "<总结>",
      "issues": [<问题列表>],
      "suggestions": [<建议列表>]
    }

    Assistant: `;
  }
}
```

## Processing Pipeline

### 1. 代码分析服务
```typescript
// src/review/services/code-analyzer.service.ts
@Injectable()
export class CodeAnalyzerService {
  async analyzeDiff(diff: string): Promise<DiffAnalysis> {
    const files = this.parseDiff(diff);
    const analysis: DiffAnalysis = {
      files: [],
      statistics: {
        filesChanged: files.length,
        additions: 0,
        deletions: 0,
        languages: new Set(),
      },
    };

    for (const file of files) {
      const fileAnalysis = await this.analyzeFile(file);
      analysis.files.push(fileAnalysis);
      analysis.statistics.additions += fileAnalysis.additions;
      analysis.statistics.deletions += fileAnalysis.deletions;
      analysis.statistics.languages.add(fileAnalysis.language);
    }

    return analysis;
  }

  private async analyzeFile(file: DiffFile): Promise<FileAnalysis> {
    const language = this.detectLanguage(file.path);
    const complexity = this.calculateComplexity(file.content);
    const patterns = this.detectPatterns(file.content, language);

    return {
      path: file.path,
      language,
      additions: file.additions,
      deletions: file.deletions,
      complexity,
      patterns,
      hasTests: this.hasTestChanges(file),
      hasDocumentation: this.hasDocChanges(file),
    };
  }

  private calculateComplexity(content: string): number {
    // 循环复杂度计算
    let complexity = 1;
    const patterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) complexity += matches.length;
    });

    return complexity;
  }
}
```

### 2. 上下文构建服务
```typescript
// src/review/services/context-builder.service.ts
@Injectable()
export class ContextBuilderService {
  constructor(
    private gitlabService: GitLabService,
    private projectService: ProjectService,
  ) {}

  async buildContext(
    projectId: string,
    mrIid: string,
  ): Promise<CodeContext> {
    const [project, mr, commits, fileTree] = await Promise.all([
      this.projectService.getById(projectId),
      this.gitlabService.getMR(projectId, mrIid),
      this.gitlabService.getMRCommits(projectId, mrIid),
      this.gitlabService.getFileTree(projectId),
    ]);

    const relatedFiles = await this.findRelatedFiles(
      projectId,
      mr.changes,
    );

    return {
      projectInfo: {
        name: project.name,
        description: project.description,
        language: project.primaryLanguage,
        framework: project.framework,
      },
      fileTree,
      dependencies: await this.extractDependencies(projectId),
      recentCommits: commits.slice(0, 10),
      relatedFiles,
    };
  }

  private async findRelatedFiles(
    projectId: string,
    changes: string[],
  ): Promise<FileContent[]> {
    const related: FileContent[] = [];
    
    for (const file of changes) {
      // 查找导入此文件的其他文件
      const importers = await this.findImporters(projectId, file);
      
      // 查找此文件导入的文件
      const imports = await this.findImports(projectId, file);
      
      related.push(...importers, ...imports);
    }

    // 去重并限制数量
    return this.deduplicateFiles(related).slice(0, 10);
  }
}
```

### 3. 结果处理服务
```typescript
// src/review/services/result-processor.service.ts
@Injectable()
export class ResultProcessorService {
  async processResult(
    rawResult: any,
    context: ProcessContext,
  ): Promise<ProcessedResult> {
    // 分类问题
    const categorizedIssues = this.categorizeIssues(rawResult.issues);
    
    // 去重
    const deduplicatedIssues = this.deduplicateIssues(categorizedIssues);
    
    // 优先级排序
    const prioritizedIssues = this.prioritizeIssues(deduplicatedIssues);
    
    // 生成可操作建议
    const actionableSuggestions = await this.generateActionableSuggestions(
      rawResult.suggestions,
      context,
    );
    
    // 计算综合评分
    const finalScore = this.calculateFinalScore(
      rawResult.score,
      prioritizedIssues,
      context,
    );

    return {
      score: finalScore,
      summary: this.enhanceSummary(rawResult.summary, finalScore),
      issues: prioritizedIssues,
      suggestions: actionableSuggestions,
      metrics: this.calculateMetrics(prioritizedIssues),
    };
  }

  private categorizeIssues(issues: any[]): CategorizedIssue[] {
    return issues.map(issue => ({
      ...issue,
      severity: this.determineSeverity(issue),
      category: this.determineCategory(issue),
      tags: this.extractTags(issue),
    }));
  }

  private determineSeverity(issue: any): IssueSeverity {
    const keywords = {
      CRITICAL: ['security', 'vulnerability', 'injection', 'leak'],
      HIGH: ['bug', 'error', 'crash', 'failure'],
      MEDIUM: ['performance', 'optimization', 'deprecated'],
      LOW: ['style', 'formatting', 'naming'],
      INFO: ['suggestion', 'consider', 'optional'],
    };

    for (const [severity, words] of Object.entries(keywords)) {
      if (words.some(word => 
        issue.message.toLowerCase().includes(word)
      )) {
        return severity as IssueSeverity;
      }
    }

    return 'MEDIUM';
  }
}
```

## Performance Optimization

### 1. Token优化策略
```typescript
// Token使用优化
export class TokenOptimizer {
  optimizeDiff(diff: string, maxTokens: number): string {
    const lines = diff.split('\n');
    const important = [];
    let currentTokens = 0;

    // 优先保留有实际变更的行
    for (const line of lines) {
      if (line.startsWith('+') || line.startsWith('-')) {
        const tokens = this.estimateTokens(line);
        if (currentTokens + tokens <= maxTokens) {
          important.push(line);
          currentTokens += tokens;
        }
      }
    }

    // 添加必要的上下文
    const contextLines = 3;
    return this.addContext(important, lines, contextLines);
  }

  chunking(content: string, chunkSize: number): string[] {
    const chunks = [];
    const lines = content.split('\n');
    let currentChunk = [];
    let currentSize = 0;

    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      
      if (currentSize + lineTokens > chunkSize) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [line];
        currentSize = lineTokens;
      } else {
        currentChunk.push(line);
        currentSize += lineTokens;
      }
    }

    if (currentChunk.length) {
      chunks.push(currentChunk.join('\n'));
    }

    return chunks;
  }

  private estimateTokens(text: string): number {
    // 简单估算：平均每4个字符1个token
    return Math.ceil(text.length / 4);
  }
}
```

### 2. 缓存策略
```typescript
// 智能缓存服务
@Injectable()
export class ReviewCacheService {
  constructor(@InjectRedis() private redis: Redis) {}

  async cacheReview(
    projectId: string,
    mrIid: string,
    result: ReviewResult,
  ): Promise<void> {
    const key = `review:${projectId}:${mrIid}`;
    const ttl = this.calculateTTL(result);
    
    await this.redis.setex(
      key,
      ttl,
      JSON.stringify(result),
    );
  }

  async getCachedReview(
    projectId: string,
    mrIid: string,
    diff: string,
  ): Promise<ReviewResult | null> {
    const key = `review:${projectId}:${mrIid}`;
    const cached = await this.redis.get(key);
    
    if (!cached) return null;
    
    const result = JSON.parse(cached);
    
    // 验证diff是否有变化
    const diffHash = this.hashDiff(diff);
    if (result.diffHash !== diffHash) {
      await this.redis.del(key);
      return null;
    }
    
    return result;
  }

  private calculateTTL(result: ReviewResult): number {
    // 根据评分动态设置缓存时间
    if (result.score >= 90) return 86400; // 24小时
    if (result.score >= 70) return 43200; // 12小时
    if (result.score >= 50) return 21600; // 6小时
    return 10800; // 3小时
  }

  private hashDiff(diff: string): string {
    return crypto.createHash('sha256')
      .update(diff)
      .digest('hex');
  }
}
```

### 3. 队列优化
```typescript
// 优先级队列处理
@Processor('review-queue')
export class ReviewProcessor {
  @Process({ name: 'review', concurrency: 3 })
  async processReview(job: Job<ReviewJob>) {
    const { projectId, mrIid, config } = job.data;
    
    try {
      // 获取或等待锁
      const lock = await this.acquireLock(projectId, mrIid);
      
      // 检查缓存
      const cached = await this.cacheService.getCachedReview(
        projectId,
        mrIid,
        job.data.diff,
      );
      
      if (cached) {
        return cached;
      }
      
      // 执行审查
      const result = await this.reviewService.performReview(job.data);
      
      // 缓存结果
      await this.cacheService.cacheReview(projectId, mrIid, result);
      
      return result;
    } finally {
      await this.releaseLock(projectId, mrIid);
    }
  }

  private async acquireLock(
    projectId: string,
    mrIid: string,
  ): Promise<string> {
    const lockKey = `lock:review:${projectId}:${mrIid}`;
    const lockId = uuid();
    
    // 尝试获取锁，最多等待30秒
    for (let i = 0; i < 30; i++) {
      const acquired = await this.redis.set(
        lockKey,
        lockId,
        'NX',
        'EX',
        60, // 锁过期时间60秒
      );
      
      if (acquired) return lockId;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Failed to acquire review lock');
  }
}
```

## Testing Strategy

### 单元测试
```typescript
// review.service.spec.ts
describe('ReviewService', () => {
  let service: ReviewService;
  let mockAIProvider: jest.Mocked<AIProvider>;

  beforeEach(() => {
    mockAIProvider = createMockAIProvider();
    service = new ReviewService(mockAIProvider);
  });

  describe('performReview', () => {
    it('should handle large diffs by chunking', async () => {
      const largeDiff = generateLargeDiff(10000);
      
      await service.performReview({
        diff: largeDiff,
        config: { model: 'gpt-4', maxTokens: 4000 },
      });

      expect(mockAIProvider.review).toHaveBeenCalledTimes(3);
    });

    it('should fallback to alternative model on failure', async () => {
      mockAIProvider.review
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockResolvedValueOnce(mockReviewResult());

      const result = await service.performReview(mockReviewParams());

      expect(result).toBeDefined();
      expect(mockAIProvider.review).toHaveBeenCalledTimes(2);
    });
  });
});
```

## Migration Plan

### 实施阶段

#### Phase 1: 基础AI集成 (第1周)
- [ ] AI Provider接口实现
- [ ] OpenAI集成
- [ ] 基础审查功能
- [ ] 结果存储

#### Phase 2: 高级功能 (第2周)
- [ ] Anthropic集成
- [ ] 上下文构建
- [ ] 智能模型选择
- [ ] 对话功能

#### Phase 3: 优化 (第3周)
- [ ] Token优化
- [ ] 缓存系统
- [ ] 队列优化
- [ ] 性能调优

#### Phase 4: 界面和测试 (第4周)
- [ ] 前端界面实现
- [ ] 结果展示优化
- [ ] 完整测试覆盖
- [ ] 文档完善