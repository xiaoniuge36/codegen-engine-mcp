# 🛠️ AI CodeGen Engine - MCP 工具文档

## 📋 概述

AI 代码生成引擎提供 **10 个** MCP 工具，支持智能模板匹配、组件库知识注入、示例代码自动附加，以及**模板和知识图谱的同步更新**，将代码可用度从 70% 提升至 **80%**。

---

## 🔧 可用工具列表

| 工具名称 | 功能描述 | 核心参数 |
|---------|---------|---------|
| `list_templates` | 列出所有可用模板 | 无 |
| `get_template` | 获取指定模板详情 | `id` |
| `match_template` | 智能匹配最合适的模板 | `text`, `topK` |
| `build_prompt` | 构建增强版提示词 | `text`, `templateId` |
| `get_component_knowledge` | 获取组件库知识图谱 | `scope`, `projectId` |
| `get_code_examples` | 获取模板示例代码 | `templateId` |
| `search_spec` | 搜索规范文档 | `query`, `maxResults` |
| `sync_template` | 同步模板到注册表 🆕 | `id`, `name`, `keywords`... |
| `sync_knowledge` | 同步知识图谱 🆕 | `scope`, `fileName`, `content` |
| `batch_sync` | 批量同步模板和知识 🆕 | `template`, `knowledgeUpdates` |

---

## 📖 工具详细说明

### 1. `list_templates`

列出模板注册表中的所有模板。

**参数**：无

**返回示例**：
```json
[
  {
    "id": "react-standard-list-crud",
    "name": "React 标准列表页",
    "scenes": ["list", "crud"],
    "keywords": ["列表", "表格", "搜索", "CRUD"]
  }
]
```

---

### 2. `get_template`

根据模板 ID 获取模板元数据。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `id` | string | ✅ | 模板 ID |

**调用示例**：
```json
{ "id": "react-standard-list-crud" }
```

---

### 3. `match_template`

根据一句话需求智能匹配最合适的模板。支持明确的模板ID与自然语言混合输入。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `text` | string | ✅ | 需求描述或模板ID |
| `topK` | number | ❌ | 返回前K个匹配结果（默认3） |

**匹配算法**：
- 正向关键词：每匹配一个 **+2 分**
- 反向关键词：每匹配一个 **-3 分**
- 场景加权：特定场景额外 **+3 分**

**调用示例**：
```json
{ "text": "做一个员工列表页，支持搜索、新增、编辑、删除", "topK": 3 }
```

**返回示例**：
```json
{
  "explicitTemplateId": null,
  "requirementText": "做一个员工列表页，支持搜索、新增、编辑、删除",
  "top": [
    { "id": "react-standard-list-crud", "name": "React 标准列表页", "score": 8 },
    { "id": "vue3-standard-list-crud", "name": "Vue 3 标准列表页", "score": 4 }
  ],
  "chosen": { "id": "react-standard-list-crud", "name": "React 标准列表页", "score": 8 }
}
```

---

### 4. `build_prompt` 🆕 增强版

构建增强版提示词，自动附加组件库知识和示例代码。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `text` | string | ✅ | 用户输入（可包含模板ID和需求描述） |
| `templateId` | string | ❌ | 可选的明确模板ID |

**核心能力**：
1. 自动识别用户输入中的模板ID
2. 如无明确ID，通过关键词智能匹配
3. 自动注入组件库知识图谱
4. 自动附加模板示例代码
5. 返回规范文档路径

**调用示例**：
```json
{ "text": "react-nonstandard-detail 做一个出差申请单详情页" }
```

**返回示例**：
```json
{
  "templateId": "react-nonstandard-detail",
  "templateName": "React 非标独立详情页",
  "templatePaths": ["templates/examples/react-nonstandard-detail/"],
  "prompt": "任务标准：ai-fe-code-std.md 为标准执行任务\n\n一句话需求：做一个出差申请单详情页...",
  "enhancedContext": {
    "componentKnowledge": {
      "ant-design-pro": "# Ant Design Pro Components 知识图谱\n..."
    },
    "codeExamples": {
      "sample.md": "...",
      "hooks/useDetailData.example.ts": "...",
      "index.example.tsx": "...",
      "index.example.less": "..."
    },
    "specPath": "d:/a-project/a-hzproject/AI-VIBE-CODING/ai-fe-code-std.md"
  }
}
```

---

### 5. `get_component_knowledge` 🆕

获取组件库知识图谱（通用组件库或业务组件库）。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `scope` | string | ✅ | `common`（通用）或 `business`（业务） |
| `projectId` | string | ❌ | 业务组件库的项目ID（scope=business时必填） |

**调用示例**：
```json
{ "scope": "common" }
```

**返回示例**：
```json
{
  "scope": "common",
  "knowledge": {
    "ant-design-pro": "# Ant Design Pro Components 知识图谱\n\n## ProTable - 高级表格\n...",
    "element-plus": "# Element Plus 组件使用指南\n..."
  },
  "fileCount": 2
}
```

---

### 6. `get_code_examples` 🆕

获取指定模板的示例代码。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `templateId` | string | ✅ | 模板ID |

**调用示例**：
```json
{ "templateId": "react-standard-list-crud" }
```

**返回示例**：
```json
{
  "templateId": "react-standard-list-crud",
  "examples": {
    "sample.md": "# React 标准列表页示例\n...",
    "hooks.example.ts": "export const useTableData = () => {...}",
    "index.example.tsx": "const EmployeeList: React.FC = () => {...}",
    "components/EditModal.example.tsx": "const EditModal: React.FC = () => {...}"
  },
  "fileCount": 4
}
```

---

### 7. `search_spec`

在规范文档中搜索关键字，快速定位规则。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `query` | string | ✅ | 搜索关键字 |
| `maxResults` | number | ❌ | 最多返回结果数（默认10） |

**调用示例**：
```json
{ "query": "hooks", "maxResults": 5 }
```

**返回示例**：
```json
{
  "specPath": "d:/a-project/a-hzproject/AI-VIBE-CODING/ai-fe-code-std.md",
  "query": "hooks",
  "results": [
    { "line": 45, "text": "- 必须先生成 hooks 文件（数据获取 + 数据组装）" },
    { "line": 123, "text": "### hooks 优先原则" }
  ],
  "resultCount": 2
}
```

---

### 8. `sync_template` 🆕

同步模板到注册表（新增或更新模板配置），自动写入 `template-registry.json`。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `id` | string | ✅ | 模板ID（kebab-case） |
| `name` | string | ✅ | 模板名称 |
| `paths` | string[] | ❌ | 模板示例路径 |
| `scenes` | string[] | ❌ | 适用场景标签 |
| `keywords` | string[] | ❌ | 匹配关键词 |
| `antiKeywords` | string[] | ❌ | 排除关键词 |
| `promptTemplateKey` | string | ❌ | 提示词模板 key |
| `componentScope` | string | ❌ | `common` 或 `business`（默认 common） |

**调用示例**：
```json
{
  "id": "react-batch-schema-form",
  "name": "React 批量 Schema 表单",
  "scenes": ["batch", "schema", "form"],
  "keywords": ["批量", "批量编辑", "schema", "动态表单"],
  "promptTemplateKey": "reactBatchSchemaForm"
}
```

**返回示例**：
```json
{
  "success": true,
  "action": "created",
  "templateId": "react-batch-schema-form",
  "templateName": "React 批量 Schema 表单"
}
```

---

### 9. `sync_knowledge` 🆕

同步知识图谱（新增或更新组件库知识文档）。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `scope` | string | ❌ | `common`（通用）或 `business`（业务），默认 common |
| `fileName` | string | ✅ | 文件名（不含 .md 后缀也可） |
| `content` | string | ✅ | 知识文档内容（Markdown 格式） |

**调用示例**：
```json
{
  "scope": "common",
  "fileName": "batch-form-patterns",
  "content": "# 批量表单设计模式\n\n## Schema 驱动\n..."
}
```

**返回示例**：
```json
{
  "success": true,
  "action": "created",
  "path": "d:/a-project/.../knowledge/common/batch-form-patterns.md"
}
```

---

### 10. `batch_sync` 🆕

批量同步：同时更新模板注册表和知识图谱，确保数据一致性。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `template` | object | ❌ | 模板配置（同 sync_template 参数） |
| `knowledgeUpdates` | array | ❌ | 知识图谱更新列表 |

**调用示例**：
```json
{
  "template": {
    "id": "react-batch-schema-form",
    "name": "React 批量 Schema 表单",
    "keywords": ["批量", "schema"]
  },
  "knowledgeUpdates": [
    {
      "scope": "common",
      "fileName": "batch-form-guide",
      "content": "# 批量表单使用指南\n..."
    }
  ]
}
```

**返回示例**：
```json
{
  "success": true,
  "template": { "success": true, "action": "updated" },
  "knowledge": [
    { "fileName": "batch-form-guide", "success": true, "action": "created" }
  ]
}
```

---

## 🚀 典型使用流程

### 场景1：标准列表页开发

```
用户输入：做一个员工列表页，支持姓名搜索、新增、编辑、删除

AI 自动调用流程：
1. match_template → 匹配到 "react-standard-list-crud"
2. build_prompt → 生成增强版提示词
   - 自动附加 Ant Design Pro 知识图谱
   - 自动附加列表页示例代码（hooks + 组件）
3. AI 根据增强上下文生成代码

代码可用度：80% ✨
```

### 场景2：明确指定模板

```
用户输入：react-nonstandard-detail 做一个出差申请单详情页

AI 处理流程：
1. build_prompt 识别明确模板ID
2. 跳过匹配，直接使用指定模板
3. 自动附加详情页示例代码

代码可用度：80% ✨
```

---

## 🔮 未来扩展功能

### 🎯 计划中的新工具

| 工具名称 | 功能描述 | 优先级 |
|---------|---------|-------|
| `validate_code` | 代码质量验证（TypeScript/ESLint 检查） | P1 |
| `suggest_refactor` | 代码重构建议 | P1 |
| `generate_test` | 自动生成单元测试 | P2 |
| `analyze_dependencies` | 依赖分析和优化建议 | P2 |
| `convert_template` | 跨框架模板转换（React ↔ Vue） | P3 |

### 🎯 功能增强计划

#### 1. 智能上下文感知
- **项目结构分析**：自动识别项目技术栈和目录结构
- **代码风格学习**：从现有代码中学习团队编码风格
- **依赖版本检测**：自动适配项目依赖版本

#### 2. 多模态输入支持
- **设计稿解析**：支持 Figma/Sketch 设计稿输入
- **截图识别**：从 UI 截图生成代码
- **原型图转换**：将原型图转换为页面结构

#### 3. 增强的知识图谱
- **API 文档集成**：自动读取 Swagger/OpenAPI 文档
- **业务领域知识**：支持业务术语和规则注入
- **最佳实践库**：持续积累团队最佳实践

#### 4. 协作与版本管理
- **模板版本控制**：支持模板版本管理和回滚
- **团队模板共享**：跨项目模板同步
- **使用统计分析**：模板使用频率和效果分析

#### 5. 代码质量保障
- **实时类型检查**：生成代码时实时 TypeScript 检查
- **自动修复建议**：ESLint 问题自动修复
- **代码覆盖率分析**：生成代码的测试覆盖率

---

## 🏗️ 核心架构

### 简化双层架构（v1.1.0）

```
┌─────────────────────────────────────────────────────────────┐
│                      AI 工具 / 客户端                        │
│              (通义灵码 / Cursor / 其他 MCP 客户端)            │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      STDIO 模式          │     │      HTTP 模式          │
│   npm run start:stdio   │     │    npm run start       │
│                         │     │                         │
│  server.js 直接运行      │     │  server-http.js        │
│                         │     │       ↓                 │
│                         │     │  import from server.js │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
              ┌─────────────────────────────────────────────┐
              │              server.js (核心)                │
              │  - 10 个 MCP 工具                            │
              │  - 模板匹配 / 知识图谱 / 示例代码              │
              │  - 同步工具 (sync_template/knowledge)        │
              │  - 导出 handleCallTool / TOOLS_DEFINITION   │
              └─────────────────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────────────────────┐
              │                  数据层                      │
              │  templates/  │  knowledge/  │  规范文档      │
              └─────────────────────────────────────────────┘
```

### 核心文件（仅 2 个）

| 文件 | 职责 | 启动命令 | 使用场景 |
|-----|------|---------|---------|
| `server.js` | **核心文件** - 包含所有业务逻辑和工具定义 | `npm run start:stdio` | AI IDE 集成（STDIO） |
| `server-http.js` | **HTTP 适配器** - 轻量 Express 服务 | `npm run start` | 调试测试（HTTP） |

### 文件关系

```javascript
// server.js - 核心文件，导出供 HTTP 模式使用
export { handleCallTool, TOOLS_DEFINITION }

// server-http.js - HTTP 适配器，导入核心逻辑
import { handleCallTool, TOOLS_DEFINITION } from './server.js'
```

**优点**：
- ✅ **单一代码源**：所有业务逻辑集中在 `server.js`
- ✅ **无重复代码**：HTTP 模式直接复用核心逻辑
- ✅ **统一维护**：修改一处，两种模式同步生效

---

## 📁 目录结构

```
codegen-engine/
├── server.js                 # 🎯 核心文件（STDIO + 业务逻辑 + 导出）
├── server-http.js            # HTTP 适配器（从 server.js 导入）
├── package.json              # 依赖配置
├── MCP-TOOLS.md              # 本文档
├── README.md                 # 项目说明
├── knowledge/                # 组件库知识图谱
│   ├── common/              # 通用组件库
│   │   ├── ant-design-pro.md
│   │   └── element-plus.md
│   └── business/            # 业务组件库
│       └── [project-id]/
└── templates/
    ├── template-registry.json  # 模板注册表
    └── examples/               # 示例代码库
        ├── react-standard-list-crud/
        ├── react-nonstandard-detail/
        ├── react-import-modal/
        ├── react-drawer-form/
        ├── react-drawer-detail/
        ├── react-standard-form-page/
        ├── react-standard-modal-form/
        ├── react-batch-schema-form/  # 🆕 批量 Schema 表单
        ├── vue2-standard-list-crud/
        └── vue3-standard-list-crud/
```

---

## 🔧 服务配置

### 启动方式

```bash
# HTTP 模式（默认，推荐用于调试和测试）
npm run start
# 服务地址: http://127.0.0.1:7331/mcp
# 健康检查: http://127.0.0.1:7331/health

# STDIO 模式（用于 AI 工具集成，如通义灵码）
npm run start:stdio

# 开发模式（热重载）
npm run dev
```

### AI 工具配置

在通义灵码或其他支持 MCP 的 AI 工具中：
- **类型**：Streamable HTTP
- **服务地址**：`http://127.0.0.1:7331/mcp`

---

## 📊 效果对比

| 方案 | 代码可用度 | 使用成本 | 维护成本 |
|------|-----------|---------|---------|
| 纯提示词 | 40% | 高 | 低 |
| 提示词 + Rule | 70% | 中 | 中 |
| **MCP + 示例代码** | **80%** ✨ | **低** | **中** |

---

## 📝 日志说明

所有工具调用都会记录详细日志（输出到 stderr）：

```
[2025-01-19T10:30:45.123Z] [INFO] [match_template] 开始匹配模板 {"text":"做一个员工列表页","topK":3}
[2025-01-19T10:30:45.234Z] [INFO] [match_template] 匹配完成，选中模板: React 标准列表页
[2025-01-19T10:30:45.345Z] [INFO] [build_prompt] 构建提示词 {"templateId":"react-standard-list-crud"}
[2025-01-19T10:30:45.456Z] [INFO] [getComponentKnowledge] 找到 2 个通用组件库文件
[2025-01-19T10:30:45.567Z] [INFO] [getCodeExamples] 成功读取 4 个示例文件
```

---

**🎉 享受智能代码生成的乐趣！**
