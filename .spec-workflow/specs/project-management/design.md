# Design: Project Management

## Architecture Overview

### 系统架构图
```
┌─────────────────────────────────────────────────────┐
│                   前端 (Vue 3)                       │
├─────────────────────────────────────────────────────┤
│  Project List  │  Project Detail  │  Settings       │
│                │                  │                  │
│  ┌────────────────────────────────────────────┐    │
│  │           Pinia Store (Project)             │    │
│  │  - projects list                            │    │
│  │  - current project                          │    │
│  │  - project settings                         │    │
│  │  - team members                             │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────┐
│                  后端 (NestJS)                       │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐    │
│  │           Project Controller                │    │
│  │  - /projects (CRUD)                         │    │
│  │  - /projects/:id/members                    │    │
│  │  - /projects/:id/settings                   │    │
│  │  - /projects/:id/stats                      │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │            Project Service                  │    │
│  │  - Project management                       │    │
│  │  - Member management                        │    │
│  │  - Configuration management                 │    │
│  │  - Statistics calculation                   │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │      Database (Prisma + MySQL)              │    │
│  │  - Project table                            │    │
│  │  - ProjectMember table                      │    │
│  │  - ProjectConfig table                      │    │
│  │  - ReviewStats table                        │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │         Cache Layer (Redis)                 │    │
│  │  - Project cache                            │    │
│  │  - Member permissions                       │    │
│  │  - Statistics cache                         │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Component Design

### 前端组件设计

#### 1. 项目列表组件
```vue
<!-- src/views/project/ProjectList.vue -->
<template>
  <div class="project-list">
    <!-- 搜索和筛选 -->
    <div class="project-filters">
      <el-input 
        v-model="searchQuery"
        placeholder="搜索项目"
        prefix-icon="Search"
      />
      <el-select v-model="filterStatus">
        <el-option label="全部" value="all" />
        <el-option label="活跃" value="active" />
        <el-option label="归档" value="archived" />
      </el-select>
      <el-button type="primary" @click="createProject">
        <el-icon><Plus /></el-icon>
        创建项目
      </el-button>
    </div>

    <!-- 项目卡片网格 -->
    <div class="project-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @click="navigateToProject"
        @edit="editProject"
        @archive="archiveProject"
      />
    </div>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="totalProjects"
      @current-change="loadProjects"
    />
  </div>
</template>
```

#### 2. 项目详情组件
```vue
<!-- src/views/project/ProjectDetail.vue -->
<template>
  <div class="project-detail">
    <!-- 项目头部 -->
    <div class="project-header">
      <h1>{{ project.name }}</h1>
      <el-tag :type="project.status">{{ project.status }}</el-tag>
      <div class="project-actions">
        <el-button @click="openSettings">设置</el-button>
        <el-button @click="syncWithGitLab">同步</el-button>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="概览" name="overview">
        <ProjectOverview :project="project" />
      </el-tab-pane>
      <el-tab-pane label="成员" name="members">
        <ProjectMembers :project-id="project.id" />
      </el-tab-pane>
      <el-tab-pane label="配置" name="config">
        <ProjectConfig :project-id="project.id" />
      </el-tab-pane>
      <el-tab-pane label="统计" name="stats">
        <ProjectStats :project-id="project.id" />
      </el-tab-pane>
      <el-tab-pane label="审查历史" name="reviews">
        <ReviewHistory :project-id="project.id" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
```

#### 3. 项目配置组件
```vue
<!-- src/components/project/ProjectConfig.vue -->
<template>
  <div class="project-config">
    <el-form :model="config" label-width="120px">
      <!-- 审查配置 -->
      <el-divider content-position="left">审查配置</el-divider>
      
      <el-form-item label="AI模型">
        <el-select v-model="config.aiModel">
          <el-option label="GPT-4" value="gpt-4" />
          <el-option label="Claude 3" value="claude-3" />
          <el-option label="自动选择" value="auto" />
        </el-select>
      </el-form-item>

      <el-form-item label="触发条件">
        <el-checkbox-group v-model="config.triggers">
          <el-checkbox label="mr_created">MR创建</el-checkbox>
          <el-checkbox label="mr_updated">MR更新</el-checkbox>
          <el-checkbox label="push">推送</el-checkbox>
          <el-checkbox label="manual">手动触发</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="审查范围">
        <el-radio-group v-model="config.reviewScope">
          <el-radio label="full">全量审查</el-radio>
          <el-radio label="incremental">增量审查</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="文件过滤">
        <el-input
          v-model="config.filePatterns"
          type="textarea"
          placeholder="例如: *.js, *.ts, !*.test.js"
        />
      </el-form-item>

      <!-- 通知配置 -->
      <el-divider content-position="left">通知配置</el-divider>
      
      <el-form-item label="通知方式">
        <el-checkbox-group v-model="config.notifications">
          <el-checkbox label="email">邮件</el-checkbox>
          <el-checkbox label="webhook">Webhook</el-checkbox>
          <el-checkbox label="slack">Slack</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveConfig">保存配置</el-button>
        <el-button @click="resetConfig">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

#### 4. 成员管理组件
```vue
<!-- src/components/project/ProjectMembers.vue -->
<template>
  <div class="project-members">
    <!-- 添加成员 -->
    <div class="member-actions">
      <el-button type="primary" @click="showAddMemberDialog">
        添加成员
      </el-button>
      <el-button @click="importFromGitLab">
        从GitLab导入
      </el-button>
    </div>

    <!-- 成员列表 -->
    <el-table :data="members">
      <el-table-column prop="user.name" label="成员" />
      <el-table-column prop="user.email" label="邮箱" />
      <el-table-column prop="role" label="角色">
        <template #default="scope">
          <el-select
            v-model="scope.row.role"
            @change="updateMemberRole(scope.row)"
          >
            <el-option label="Owner" value="owner" />
            <el-option label="Maintainer" value="maintainer" />
            <el-option label="Developer" value="developer" />
            <el-option label="Viewer" value="viewer" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="加入时间">
        <template #default="scope">
          {{ formatDate(scope.row.joinedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
            type="danger"
            size="small"
            @click="removeMember(scope.row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```

### 后端模块设计

#### 1. 项目模块结构
```
src/project/
├── project.module.ts
├── project.controller.ts
├── project.service.ts
├── dto/
│   ├── create-project.dto.ts
│   ├── update-project.dto.ts
│   ├── project-config.dto.ts
│   └── add-member.dto.ts
├── entities/
│   ├── project.entity.ts
│   ├── project-member.entity.ts
│   └── project-config.entity.ts
├── guards/
│   └── project-access.guard.ts
├── decorators/
│   └── project-role.decorator.ts
├── services/
│   ├── member.service.ts
│   ├── config.service.ts
│   └── stats.service.ts
└── utils/
    └── project-validator.ts
```

#### 2. 数据库Schema设计
```prisma
// prisma/schema.prisma

model Project {
  id              String    @id @default(uuid())
  name            String
  description     String?
  gitlabProjectId String?   @unique
  status          ProjectStatus @default(ACTIVE)
  visibility      Visibility    @default(PRIVATE)
  createdBy       String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  archivedAt      DateTime?
  
  // Relations
  creator         User      @relation("ProjectCreator", fields: [createdBy], references: [id])
  members         ProjectMember[]
  configs         ProjectConfig[]
  reviews         Review[]
  webhooks        Webhook[]
  stats           ProjectStats[]
  
  @@index([status])
  @@index([gitlabProjectId])
  @@map("projects")
}

model ProjectMember {
  id         String   @id @default(uuid())
  projectId  String
  userId     String
  role       ProjectRole @default(DEVELOPER)
  joinedAt   DateTime @default(now())
  invitedBy  String?
  
  // Relations
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id])
  inviter    User?    @relation("MemberInviter", fields: [invitedBy], references: [id])
  
  @@unique([projectId, userId])
  @@index([userId])
  @@map("project_members")
}

model ProjectConfig {
  id          String   @id @default(uuid())
  projectId   String
  key         String
  value       Json
  category    ConfigCategory
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, key])
  @@index([category])
  @@map("project_configs")
}

model ProjectStats {
  id             String   @id @default(uuid())
  projectId      String
  date           DateTime
  reviewCount    Int      @default(0)
  issueCount     Int      @default(0)
  resolvedCount  Int      @default(0)
  avgScore       Float?
  activeMembers  Int      @default(0)
  
  // Relations
  project        Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, date])
  @@index([date])
  @@map("project_stats")
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  SUSPENDED
}

enum Visibility {
  PUBLIC
  PRIVATE
  INTERNAL
}

enum ProjectRole {
  OWNER
  MAINTAINER
  DEVELOPER
  VIEWER
}

enum ConfigCategory {
  REVIEW
  NOTIFICATION
  INTEGRATION
  SECURITY
}
```

## API Design

### 项目管理API

#### 1. 创建项目
```
POST /api/projects
Authorization: Bearer {jwt_token}

Request:
{
  "name": "My Project",
  "description": "Project description",
  "gitlabProjectId": "123",
  "visibility": "private",
  "initialConfig": {
    "aiModel": "gpt-4",
    "triggers": ["mr_created", "mr_updated"],
    "reviewScope": "incremental"
  }
}

Response: 201 Created
{
  "id": "project-uuid",
  "name": "My Project",
  "description": "Project description",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "creator": {
    "id": "user-uuid",
    "name": "John Doe"
  }
}
```

#### 2. 获取项目列表
```
GET /api/projects?page=1&limit=20&status=active&search=keyword
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "projects": [
    {
      "id": "project-uuid",
      "name": "Project Name",
      "description": "Description",
      "status": "active",
      "memberCount": 5,
      "lastActivity": "2024-01-01T00:00:00Z",
      "stats": {
        "totalReviews": 150,
        "avgScore": 85
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### 3. 更新项目配置
```
PUT /api/projects/{projectId}/config
Authorization: Bearer {jwt_token}

Request:
{
  "configs": [
    {
      "key": "ai_model",
      "value": "gpt-4",
      "category": "REVIEW"
    },
    {
      "key": "auto_review",
      "value": true,
      "category": "REVIEW"
    }
  ]
}

Response: 200 OK
{
  "updated": 2,
  "configs": { ... }
}
```

#### 4. 管理项目成员
```
POST /api/projects/{projectId}/members
Authorization: Bearer {jwt_token}

Request:
{
  "userId": "user-uuid",
  "role": "developer"
}

Response: 201 Created
{
  "id": "member-uuid",
  "user": {
    "id": "user-uuid",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "role": "developer",
  "joinedAt": "2024-01-01T00:00:00Z"
}
```

#### 5. 获取项目统计
```
GET /api/projects/{projectId}/stats?period=month&from=2024-01-01&to=2024-01-31
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "summary": {
    "totalReviews": 45,
    "totalIssues": 120,
    "resolvedIssues": 98,
    "avgScore": 82.5,
    "activeMembers": 8
  },
  "timeline": [
    {
      "date": "2024-01-01",
      "reviews": 2,
      "issues": 5,
      "resolved": 3
    }
  ],
  "topIssues": [
    {
      "type": "performance",
      "count": 25
    }
  ]
}
```

## Security Design

### 1. 基于角色的访问控制 (RBAC)
```typescript
// 权限矩阵
const PERMISSION_MATRIX = {
  OWNER: [
    'project:read',
    'project:write',
    'project:delete',
    'config:read',
    'config:write',
    'member:read',
    'member:write',
    'member:delete',
    'stats:read',
  ],
  MAINTAINER: [
    'project:read',
    'project:write',
    'config:read',
    'config:write',
    'member:read',
    'member:write',
    'stats:read',
  ],
  DEVELOPER: [
    'project:read',
    'config:read',
    'member:read',
    'stats:read',
  ],
  VIEWER: [
    'project:read',
    'stats:read',
  ],
};

// 权限守卫
@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(
    private projectService: ProjectService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.projectId;
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) return true;

    const member = await this.projectService.getMember(
      projectId,
      user.id,
    );

    if (!member) return false;

    const permissions = PERMISSION_MATRIX[member.role];
    return permissions.includes(requiredPermission);
  }
}
```

### 2. 数据隔离
```typescript
// 多租户数据隔离
export class ProjectService {
  async getProjects(userId: string, filters: ProjectFilters) {
    return this.prisma.project.findMany({
      where: {
        AND: [
          {
            OR: [
              { createdBy: userId },
              {
                members: {
                  some: { userId },
                },
              },
            ],
          },
          filters.status ? { status: filters.status } : {},
          filters.search
            ? {
                OR: [
                  { name: { contains: filters.search } },
                  { description: { contains: filters.search } },
                ],
              }
            : {},
        ],
      },
      include: {
        _count: {
          select: { members: true, reviews: true },
        },
      },
    });
  }
}
```

### 3. 审计日志
```typescript
// 操作审计
@Injectable()
export class AuditService {
  async logProjectAction(
    userId: string,
    projectId: string,
    action: string,
    details?: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        resourceType: 'PROJECT',
        resourceId: projectId,
        action,
        details: details ? JSON.stringify(details) : null,
        ip: this.getClientIp(),
        userAgent: this.getUserAgent(),
        timestamp: new Date(),
      },
    });
  }
}

// 使用审计装饰器
@UseGuards(ProjectAccessGuard)
@Audit('project:update')
async updateProject(
  @Param('id') id: string,
  @Body() updateDto: UpdateProjectDto,
) {
  return this.projectService.update(id, updateDto);
}
```

## State Management

### Pinia Store设计
```typescript
// src/stores/project.ts
export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const members = ref<ProjectMember[]>([]);
  const configs = ref<ProjectConfig>({});
  const stats = ref<ProjectStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeProjects = computed(() =>
    projects.value.filter(p => p.status === 'active')
  );

  const userRole = computed(() => {
    if (!currentProject.value) return null;
    const member = members.value.find(
      m => m.userId === useAuthStore().user?.id
    );
    return member?.role;
  });

  const canEdit = computed(() => {
    const role = userRole.value;
    return role === 'OWNER' || role === 'MAINTAINER';
  });

  // Actions
  async function fetchProjects(filters?: ProjectFilters) {
    loading.value = true;
    try {
      const response = await projectAPI.getProjects(filters);
      projects.value = response.projects;
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createProject(data: CreateProjectDto) {
    const project = await projectAPI.create(data);
    projects.value.unshift(project);
    return project;
  }

  async function loadProject(projectId: string) {
    loading.value = true;
    try {
      const [project, projectMembers, projectConfigs] = await Promise.all([
        projectAPI.getById(projectId),
        projectAPI.getMembers(projectId),
        projectAPI.getConfig(projectId),
      ]);

      currentProject.value = project;
      members.value = projectMembers;
      configs.value = projectConfigs;
      
      return project;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateConfig(updates: ConfigUpdate[]) {
    const response = await projectAPI.updateConfig(
      currentProject.value!.id,
      updates,
    );
    
    // 更新本地配置
    updates.forEach(update => {
      configs.value[update.key] = update.value;
    });
    
    return response;
  }

  async function addMember(userId: string, role: ProjectRole) {
    const member = await projectAPI.addMember(
      currentProject.value!.id,
      { userId, role },
    );
    
    members.value.push(member);
    return member;
  }

  // 实时更新
  function handleRealtimeUpdate(event: ProjectEvent) {
    switch (event.type) {
      case 'member_added':
        members.value.push(event.data);
        break;
      case 'member_removed':
        members.value = members.value.filter(
          m => m.id !== event.data.memberId
        );
        break;
      case 'config_updated':
        Object.assign(configs.value, event.data);
        break;
      case 'project_archived':
        if (currentProject.value?.id === event.data.projectId) {
          currentProject.value.status = 'archived';
        }
        break;
    }
  }

  return {
    projects,
    currentProject,
    members,
    configs,
    stats,
    loading,
    error,
    activeProjects,
    userRole,
    canEdit,
    fetchProjects,
    createProject,
    loadProject,
    updateConfig,
    addMember,
    handleRealtimeUpdate,
  };
});
```

## Performance Optimization

### 1. 缓存策略
```typescript
// Redis缓存服务
@Injectable()
export class ProjectCacheService {
  constructor(@InjectRedis() private redis: Redis) {}

  // 项目缓存
  async cacheProject(project: Project): Promise<void> {
    const key = `project:${project.id}`;
    await this.redis.setex(
      key,
      3600, // 1小时
      JSON.stringify(project),
    );
  }

  // 成员权限缓存
  async cacheMemberPermissions(
    projectId: string,
    userId: string,
    permissions: string[],
  ): Promise<void> {
    const key = `permissions:${projectId}:${userId}`;
    await this.redis.setex(
      key,
      1800, // 30分钟
      JSON.stringify(permissions),
    );
  }

  // 统计数据缓存
  async cacheStats(
    projectId: string,
    period: string,
    stats: any,
  ): Promise<void> {
    const key = `stats:${projectId}:${period}`;
    await this.redis.setex(
      key,
      300, // 5分钟
      JSON.stringify(stats),
    );
  }

  // 缓存失效
  async invalidateProjectCache(projectId: string): Promise<void> {
    const pattern = `*:${projectId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}
```

### 2. 查询优化
```typescript
// 优化的项目查询
export class ProjectRepository {
  async findProjectsWithStats(
    userId: string,
    filters: ProjectFilters,
  ) {
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT pm.user_id) as member_count,
        COUNT(DISTINCT r.id) as review_count,
        AVG(r.score) as avg_score,
        MAX(r.created_at) as last_activity
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN reviews r ON p.id = r.project_id
      WHERE (
        p.created_by = ? OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = p.id AND user_id = ?
        )
      )
      ${filters.status ? 'AND p.status = ?' : ''}
      ${filters.search ? 'AND (p.name LIKE ? OR p.description LIKE ?)' : ''}
      GROUP BY p.id
      ORDER BY last_activity DESC
      LIMIT ? OFFSET ?
    `;

    const params = [userId, userId];
    if (filters.status) params.push(filters.status);
    if (filters.search) {
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    params.push(filters.limit || 20, filters.offset || 0);

    return this.prisma.$queryRawUnsafe(query, ...params);
  }
}
```

## Testing Strategy

### 单元测试
```typescript
// project.service.spec.ts
describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: PrismaService,
          useValue: mockPrismaService(),
        },
      ],
    }).compile();

    service = module.get(ProjectService);
    prisma = module.get(PrismaService);
  });

  describe('createProject', () => {
    it('should create project with initial config', async () => {
      const createDto = {
        name: 'Test Project',
        description: 'Test description',
        initialConfig: {
          aiModel: 'gpt-4',
          triggers: ['mr_created'],
        },
      };

      const project = await service.create('user-id', createDto);

      expect(project).toHaveProperty('id');
      expect(project.name).toBe(createDto.name);
      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: createDto.name,
            createdBy: 'user-id',
          }),
        }),
      );
    });
  });

  describe('member management', () => {
    it('should enforce role hierarchy', async () => {
      const projectId = 'project-id';
      const currentUser = { id: 'user-1', role: 'DEVELOPER' };
      const targetUser = { id: 'user-2', role: 'MAINTAINER' };

      await expect(
        service.updateMemberRole(
          projectId,
          currentUser,
          targetUser.id,
          'OWNER',
        ),
      ).rejects.toThrow('Insufficient permissions');
    });
  });
});
```

## Migration Plan

### 实施阶段

#### Phase 1: 基础功能 (第1周)
- [ ] 项目CRUD操作
- [ ] 基础权限系统
- [ ] 项目列表界面
- [ ] 创建项目向导

#### Phase 2: 成员管理 (第2周)
- [ ] 成员CRUD操作
- [ ] 角色权限映射
- [ ] GitLab成员同步
- [ ] 成员管理界面

#### Phase 3: 配置管理 (第3周)
- [ ] 配置存储系统
- [ ] 配置模板
- [ ] 配置界面
- [ ] 配置验证

#### Phase 4: 统计与优化 (第4周)
- [ ] 统计数据收集
- [ ] 统计图表展示
- [ ] 缓存优化
- [ ] 性能测试

## Dependencies

### NPM包依赖
```json
{
  "dependencies": {
    "@nestjs/cache-manager": "^2.2.2",
    "cache-manager": "^5.7.6",
    "cache-manager-redis-store": "^3.0.1",
    "@nestjs/throttler": "^6.2.1",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1"
  }
}
```

### 环境变量
```env
# 项目配置
PROJECT_DEFAULT_LIMIT=20
PROJECT_MAX_MEMBERS=100
PROJECT_ARCHIVE_DAYS=90

# 缓存配置
CACHE_TTL=3600
STATS_CACHE_TTL=300
PERMISSION_CACHE_TTL=1800

# 限流配置
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```