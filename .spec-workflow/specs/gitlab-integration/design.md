# Design: GitLab Integration

## Architecture Overview

### 系统架构图
```
┌─────────────────────────────────────────────────────┐
│                   MoonLens Client                    │
├─────────────────────────────────────────────────────┤
│  Project Import │  MR Monitor  │  Review Manager    │
│                 │              │                     │
│  ┌────────────────────────────────────────────┐    │
│  │           GitLab Service Layer              │    │
│  │  - Token Management                         │    │
│  │  - API Client Wrapper                       │    │
│  │  - Webhook Handler                          │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────┐
│                  MoonLens Server                     │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐    │
│  │         GitLab Controller                   │    │
│  │  - /gitlab/projects                         │    │
│  │  - /gitlab/webhooks                         │    │
│  │  - /gitlab/merge-requests                   │    │
│  │  - /gitlab/sync                             │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │          GitLab Service                     │    │
│  │  - GitBeaker Client                         │    │
│  │  - Token Encryption                         │    │
│  │  - Event Processing                         │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │          Event Queue (Bull)                 │    │
│  │  - MR Event Jobs                            │    │
│  │  - Sync Jobs                                │    │
│  │  - Review Trigger Jobs                      │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓ API v4
┌─────────────────────────────────────────────────────┐
│                    GitLab Instance                   │
├─────────────────────────────────────────────────────┤
│  Projects │ MRs │ Webhooks │ Comments │ Users       │
└─────────────────────────────────────────────────────┘
```

## Component Design

### 前端组件设计

#### 1. GitLab配置组件
```vue
<!-- src/views/gitlab/GitLabConfig.vue -->
<template>
  <div class="gitlab-config">
    <el-form :model="gitlabConfig">
      <el-form-item label="GitLab实例URL">
        <el-input v-model="gitlabConfig.instanceUrl" />
      </el-form-item>
      <el-form-item label="Access Token">
        <el-input v-model="gitlabConfig.token" type="password" />
      </el-form-item>
      <el-form-item>
        <el-button @click="testConnection">测试连接</el-button>
        <el-button @click="saveConfig" type="primary">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

#### 2. 项目导入组件
```vue
<!-- src/views/gitlab/ProjectImport.vue -->
<template>
  <div class="project-import">
    <!-- 项目列表 -->
    <el-table :data="gitlabProjects" @selection-change="handleSelectionChange">
      <el-table-column type="selection" />
      <el-table-column prop="name" label="项目名称" />
      <el-table-column prop="path_with_namespace" label="路径" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="importProject(scope.row)">导入</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 批量操作 -->
    <div class="batch-actions">
      <el-button @click="batchImport" :disabled="!selectedProjects.length">
        批量导入 ({{ selectedProjects.length }})
      </el-button>
    </div>
  </div>
</template>
```

#### 3. Webhook管理组件
```vue
<!-- src/views/gitlab/WebhookManager.vue -->
<template>
  <div class="webhook-manager">
    <el-card v-for="project in projects" :key="project.id">
      <h3>{{ project.name }}</h3>
      <div class="webhook-status">
        <el-tag :type="project.webhookStatus">
          {{ project.webhookStatus === 'active' ? '已配置' : '未配置' }}
        </el-tag>
      </div>
      <el-button @click="configureWebhook(project)">
        {{ project.webhookStatus === 'active' ? '更新' : '配置' }} Webhook
      </el-button>
      <el-button @click="testWebhook(project)">测试</el-button>
    </el-card>
  </div>
</template>
```

### 后端模块设计

#### 1. GitLab模块结构
```
src/gitlab/
├── gitlab.module.ts
├── gitlab.controller.ts
├── gitlab.service.ts
├── dto/
│   ├── gitlab-config.dto.ts
│   ├── import-project.dto.ts
│   ├── webhook-config.dto.ts
│   └── mr-comment.dto.ts
├── entities/
│   ├── gitlab-instance.entity.ts
│   ├── gitlab-project.entity.ts
│   └── webhook.entity.ts
├── interceptors/
│   └── gitlab-auth.interceptor.ts
├── processors/
│   ├── mr-event.processor.ts
│   ├── push-event.processor.ts
│   └── comment-event.processor.ts
└── utils/
    ├── gitlab-client.ts
    └── webhook-validator.ts
```

#### 2. GitBeaker客户端封装
```typescript
// src/gitlab/utils/gitlab-client.ts
import { Gitlab } from '@gitbeaker/node';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class GitLabClient {
  private clients: Map<string, any> = new Map();

  constructor(
    private configService: ConfigService,
    private encryptionService: EncryptionService,
  ) {}

  getClient(token: string, instanceUrl?: string): any {
    const url = instanceUrl || this.configService.get('GITLAB_DEFAULT_URL');
    const decryptedToken = this.encryptionService.decrypt(token);
    
    const key = `${url}:${token}`;
    if (!this.clients.has(key)) {
      this.clients.set(key, new Gitlab({
        host: url,
        token: decryptedToken,
      }));
    }
    
    return this.clients.get(key);
  }

  async testConnection(token: string, instanceUrl?: string): Promise<boolean> {
    try {
      const client = this.getClient(token, instanceUrl);
      await client.Users.current();
      return true;
    } catch {
      return false;
    }
  }
}
```

#### 3. Webhook处理器
```typescript
// src/gitlab/processors/mr-event.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';

@Processor('gitlab-events')
export class MrEventProcessor {
  constructor(
    private gitlabService: GitLabService,
    private reviewService: ReviewService,
  ) {}

  @Process('merge_request')
  async handleMergeRequest(job: Job) {
    const { event, projectId } = job.data;
    
    // 验证事件签名
    if (!this.validateEventSignature(event)) {
      throw new Error('Invalid webhook signature');
    }

    // 解析MR信息
    const mr = this.parseMergeRequest(event);
    
    // 获取MR差异
    const diff = await this.gitlabService.getMRDiff(
      projectId,
      mr.iid,
    );
    
    // 触发AI审查
    await this.reviewService.triggerReview({
      projectId,
      mrId: mr.iid,
      diff,
      metadata: {
        author: mr.author,
        title: mr.title,
        description: mr.description,
      },
    });
    
    return { success: true, mrId: mr.iid };
  }

  private validateEventSignature(event: any): boolean {
    const token = event.headers['x-gitlab-token'];
    const expectedToken = this.configService.get('GITLAB_WEBHOOK_TOKEN');
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken),
    );
  }
}
```

## API Design

### GitLab集成API

#### 1. 项目导入API
```
GET /api/gitlab/projects
Authorization: Bearer {jwt_token}
Query: page=1&perPage=20&search=keyword

Response: 200 OK
{
  "projects": [
    {
      "id": 123,
      "name": "project-name",
      "path_with_namespace": "group/project-name",
      "description": "Project description",
      "web_url": "https://gitlab.com/group/project-name",
      "default_branch": "main",
      "visibility": "private",
      "last_activity_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100
  }
}
```

#### 2. Webhook配置API
```
POST /api/gitlab/webhooks
Authorization: Bearer {jwt_token}

Request:
{
  "projectId": "123",
  "events": ["merge_request_events", "push_events"],
  "url": "https://api.moonlens.com/webhooks/gitlab",
  "token": "auto-generated-secure-token"
}

Response: 201 Created
{
  "id": "webhook-id",
  "url": "https://api.moonlens.com/webhooks/gitlab/project-123",
  "token": "webhook-secret-token",
  "events": ["merge_request_events", "push_events"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### 3. MR同步API
```
POST /api/gitlab/merge-requests/sync
Authorization: Bearer {jwt_token}

Request:
{
  "projectId": "123",
  "mrIid": "45",
  "reviewResults": {
    "summary": "整体代码质量良好，发现3个潜在问题",
    "issues": [
      {
        "severity": "warning",
        "file": "src/service.ts",
        "line": 42,
        "message": "可能的空指针引用",
        "suggestion": "添加空值检查"
      }
    ],
    "score": 85
  }
}

Response: 200 OK
{
  "commentId": "comment-123",
  "discussionIds": ["disc-1", "disc-2", "disc-3"],
  "status": "synced"
}
```

#### 4. 批量导入API
```
POST /api/gitlab/projects/import
Authorization: Bearer {jwt_token}

Request:
{
  "projectIds": [123, 456, 789],
  "config": {
    "enableWebhook": true,
    "syncMembers": true,
    "reviewTrigger": "merge_request"
  }
}

Response: 202 Accepted
{
  "jobId": "import-job-uuid",
  "projectCount": 3,
  "estimatedTime": 30,
  "status": "processing"
}
```

## Security Design

### 1. Token安全管理
```typescript
// Token加密存储
interface TokenStorage {
  userId: string;
  encryptedToken: string;  // AES-256-GCM加密
  iv: string;              // 初始化向量
  tag: string;             // 认证标签
  instanceUrl: string;
  createdAt: Date;
  expiresAt?: Date;
}

// 加密服务
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(configService: ConfigService) {
    this.key = Buffer.from(
      configService.get('ENCRYPTION_KEY'),
      'hex'
    );
  }

  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(data: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 2. Webhook安全验证
```typescript
// Webhook签名验证
export class WebhookValidator {
  validateGitLabWebhook(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature),
    );
  }

  // IP白名单验证
  validateSourceIP(ip: string): boolean {
    const gitlabIPs = [
      '35.231.145.151',  // GitLab.com
      '34.74.90.64',
      // 添加更多GitLab IP
    ];
    
    return gitlabIPs.includes(ip) || this.isPrivateIP(ip);
  }
}
```

### 3. 权限验证
```typescript
// GitLab权限映射
export enum GitLabAccessLevel {
  NoAccess = 0,
  Guest = 10,
  Reporter = 20,
  Developer = 30,
  Maintainer = 40,
  Owner = 50,
}

export class PermissionService {
  mapGitLabToSystemRole(accessLevel: number): SystemRole {
    if (accessLevel >= GitLabAccessLevel.Owner) {
      return SystemRole.ADMIN;
    }
    if (accessLevel >= GitLabAccessLevel.Maintainer) {
      return SystemRole.MANAGER;
    }
    if (accessLevel >= GitLabAccessLevel.Developer) {
      return SystemRole.DEVELOPER;
    }
    return SystemRole.VIEWER;
  }

  async validateProjectAccess(
    userId: string,
    projectId: string,
    requiredLevel: GitLabAccessLevel,
  ): Promise<boolean> {
    const member = await this.getMemberAccess(userId, projectId);
    return member.accessLevel >= requiredLevel;
  }
}
```

## State Management

### Pinia Store设计
```typescript
// src/stores/gitlab.ts
import { defineStore } from 'pinia';

interface GitLabState {
  config: {
    instanceUrl: string;
    isConfigured: boolean;
  };
  projects: GitLabProject[];
  webhooks: WebhookConfig[];
  syncStatus: Map<string, SyncStatus>;
  loading: boolean;
  error: string | null;
}

export const useGitLabStore = defineStore('gitlab', () => {
  // State
  const state = reactive<GitLabState>({
    config: {
      instanceUrl: '',
      isConfigured: false,
    },
    projects: [],
    webhooks: [],
    syncStatus: new Map(),
    loading: false,
    error: null,
  });

  // Actions
  async function fetchProjects(page = 1, search = '') {
    state.loading = true;
    try {
      const response = await gitlabAPI.getProjects({ page, search });
      state.projects = response.projects;
      return response;
    } catch (error) {
      state.error = error.message;
      throw error;
    } finally {
      state.loading = false;
    }
  }

  async function importProject(projectId: number, config?: ImportConfig) {
    const response = await gitlabAPI.importProject(projectId, config);
    
    // 更新本地状态
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      project.imported = true;
      project.importedAt = new Date();
    }
    
    return response;
  }

  async function configureWebhook(projectId: string, events: string[]) {
    const response = await gitlabAPI.configureWebhook(projectId, events);
    
    // 更新webhook状态
    state.webhooks.push(response);
    
    return response;
  }

  // 实时同步状态
  function updateSyncStatus(projectId: string, status: SyncStatus) {
    state.syncStatus.set(projectId, status);
  }

  return {
    ...toRefs(state),
    fetchProjects,
    importProject,
    configureWebhook,
    updateSyncStatus,
  };
});
```

## Error Handling

### 错误码定义
```typescript
export enum GitLabErrorCode {
  TOKEN_INVALID = 'GL001',
  TOKEN_EXPIRED = 'GL002',
  PROJECT_NOT_FOUND = 'GL003',
  ACCESS_DENIED = 'GL004',
  WEBHOOK_FAILED = 'GL005',
  RATE_LIMIT = 'GL006',
  NETWORK_ERROR = 'GL007',
  SYNC_FAILED = 'GL008',
  API_ERROR = 'GL009',
  INSTANCE_UNREACHABLE = 'GL010',
}

// 错误处理中间件
export class GitLabErrorHandler {
  handle(error: any): never {
    if (error.response?.status === 401) {
      throw new UnauthorizedException({
        code: GitLabErrorCode.TOKEN_INVALID,
        message: 'GitLab token无效或已过期',
      });
    }

    if (error.response?.status === 403) {
      throw new ForbiddenException({
        code: GitLabErrorCode.ACCESS_DENIED,
        message: '没有访问该GitLab资源的权限',
      });
    }

    if (error.response?.status === 404) {
      throw new NotFoundException({
        code: GitLabErrorCode.PROJECT_NOT_FOUND,
        message: 'GitLab项目不存在',
      });
    }

    if (error.response?.status === 429) {
      throw new TooManyRequestsException({
        code: GitLabErrorCode.RATE_LIMIT,
        message: 'GitLab API请求频率超限',
        retryAfter: error.response.headers['retry-after'],
      });
    }

    throw new InternalServerErrorException({
      code: GitLabErrorCode.API_ERROR,
      message: 'GitLab API调用失败',
      details: error.message,
    });
  }
}
```

## Performance Optimization

### 1. 缓存策略
```typescript
// Redis缓存配置
export class GitLabCacheService {
  constructor(
    @InjectRedis() private redis: Redis,
  ) {}

  // 项目信息缓存
  async cacheProject(project: GitLabProject): Promise<void> {
    const key = `gitlab:project:${project.id}`;
    await this.redis.setex(
      key,
      3600, // 1小时过期
      JSON.stringify(project),
    );
  }

  // 用户权限缓存
  async cacheUserPermissions(
    userId: string,
    projectId: string,
    permissions: any,
  ): Promise<void> {
    const key = `gitlab:perms:${userId}:${projectId}`;
    await this.redis.setex(
      key,
      1800, // 30分钟过期
      JSON.stringify(permissions),
    );
  }

  // 批量获取缓存
  async batchGetProjects(projectIds: string[]): Promise<Map<string, any>> {
    const pipeline = this.redis.pipeline();
    projectIds.forEach(id => {
      pipeline.get(`gitlab:project:${id}`);
    });
    
    const results = await pipeline.exec();
    const projectMap = new Map();
    
    results.forEach(([err, data], index) => {
      if (!err && data) {
        projectMap.set(projectIds[index], JSON.parse(data));
      }
    });
    
    return projectMap;
  }
}
```

### 2. 批量处理优化
```typescript
// 批量导入队列处理
@Processor('gitlab-import')
export class ImportProcessor {
  @Process({ name: 'batch-import', concurrency: 3 })
  async handleBatchImport(job: Job) {
    const { projectIds, config } = job.data;
    const results = [];

    // 分批处理，每批10个
    const batchSize = 10;
    for (let i = 0; i < projectIds.length; i += batchSize) {
      const batch = projectIds.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(id => this.importSingleProject(id, config))
      );
      
      results.push(...batchResults);
      
      // 更新进度
      await job.progress(
        Math.round((i + batch.length) / projectIds.length * 100)
      );
    }

    return {
      total: projectIds.length,
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    };
  }
}
```

## Testing Strategy

### 单元测试
```typescript
// gitlab.service.spec.ts
describe('GitLabService', () => {
  let service: GitLabService;
  let mockGitLabClient: jest.Mocked<GitLabClient>;

  beforeEach(() => {
    const module = Test.createTestingModule({
      providers: [
        GitLabService,
        {
          provide: GitLabClient,
          useValue: createMockGitLabClient(),
        },
      ],
    }).compile();

    service = module.get(GitLabService);
    mockGitLabClient = module.get(GitLabClient);
  });

  describe('importProject', () => {
    it('should import project successfully', async () => {
      const projectData = mockProjectData();
      mockGitLabClient.getProject.mockResolvedValue(projectData);

      const result = await service.importProject('123');

      expect(result).toMatchObject({
        id: '123',
        name: projectData.name,
        imported: true,
      });
    });

    it('should handle import failure gracefully', async () => {
      mockGitLabClient.getProject.mockRejectedValue(
        new Error('Network error')
      );

      await expect(service.importProject('123'))
        .rejects.toThrow('Failed to import project');
    });
  });
});
```

### 集成测试
```typescript
// gitlab.e2e.spec.ts
describe('GitLab Integration E2E', () => {
  it('should complete full import flow', async () => {
    // 1. 配置GitLab连接
    await request(app)
      .post('/api/gitlab/config')
      .send({
        instanceUrl: 'https://gitlab.example.com',
        token: 'test-token',
      })
      .expect(200);

    // 2. 获取项目列表
    const projectsResponse = await request(app)
      .get('/api/gitlab/projects')
      .expect(200);

    expect(projectsResponse.body.projects).toHaveLength(10);

    // 3. 导入项目
    const importResponse = await request(app)
      .post('/api/gitlab/projects/import')
      .send({
        projectId: projectsResponse.body.projects[0].id,
      })
      .expect(201);

    // 4. 配置Webhook
    const webhookResponse = await request(app)
      .post('/api/gitlab/webhooks')
      .send({
        projectId: importResponse.body.projectId,
        events: ['merge_request_events'],
      })
      .expect(201);

    expect(webhookResponse.body).toHaveProperty('url');
    expect(webhookResponse.body).toHaveProperty('token');
  });
});
```

## Migration Plan

### 实施阶段

#### Phase 1: 基础连接 (第1周)
- [ ] GitLab认证实现
- [ ] Token加密存储
- [ ] 基础API客户端
- [ ] 连接测试功能

#### Phase 2: 项目管理 (第2周)
- [ ] 项目列表获取
- [ ] 单个项目导入
- [ ] 批量导入功能
- [ ] 项目信息同步

#### Phase 3: Webhook集成 (第3周)
- [ ] Webhook创建/更新
- [ ] 事件接收处理
- [ ] 签名验证
- [ ] 事件队列处理

#### Phase 4: MR处理 (第4周)
- [ ] MR事件监听
- [ ] 差异获取
- [ ] 评论发布
- [ ] 状态同步

## Dependencies

### NPM包依赖
```json
{
  "dependencies": {
    "@gitbeaker/node": "^35.8.0",
    "@nestjs/bull": "^10.2.1",
    "bull": "^4.16.0",
    "crypto": "^1.0.1",
    "ioredis": "^5.4.1"
  }
}
```

### 环境变量
```env
# GitLab配置
GITLAB_DEFAULT_URL=https://gitlab.com
GITLAB_WEBHOOK_SECRET=your-webhook-secret
ENCRYPTION_KEY=your-32-byte-hex-key

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 队列配置
QUEUE_CONCURRENCY=3
QUEUE_RETRY_ATTEMPTS=3
QUEUE_RETRY_DELAY=5000
```

## Monitoring & Observability

### 监控指标
```typescript
// 关键指标收集
export class GitLabMetrics {
  private metrics = {
    apiCalls: new Counter('gitlab_api_calls_total'),
    apiErrors: new Counter('gitlab_api_errors_total'),
    webhookReceived: new Counter('gitlab_webhooks_received_total'),
    importDuration: new Histogram('gitlab_import_duration_seconds'),
    syncLatency: new Histogram('gitlab_sync_latency_seconds'),
  };

  recordAPICall(endpoint: string, status: number): void {
    this.metrics.apiCalls.inc({ endpoint, status });
    if (status >= 400) {
      this.metrics.apiErrors.inc({ endpoint, status });
    }
  }

  recordWebhook(event: string, projectId: string): void {
    this.metrics.webhookReceived.inc({ event, projectId });
  }
}
```

### 健康检查
```typescript
@Controller('health')
export class HealthController {
  @Get('gitlab')
  async checkGitLab(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkGitLabAPI(),
      this.checkWebhookEndpoint(),
      this.checkQueueHealth(),
    ]);

    return {
      status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
      checks: {
        api: checks[0],
        webhook: checks[1],
        queue: checks[2],
      },
    };
  }
}
```