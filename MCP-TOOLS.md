# 🛠️ AI CodeGen Engine - MCP 工具文档

> **v2.1.0** - 优化版本（新增一键生成、统计功能、无脑调用）

---

## ⭐ 无脑调用指南（AI 必读）

**用户不需要了解具体工具，AI 自动选择正确的工具。**

### 触发关键词

当用户输入包含以下关键词时，**直接调用 `quick_generate`**：

| 类型 | 关键词示例 |
|------|-----------|
| 代码生成 | "生成代码"、"写代码"、"帮我写" |
| 页面创建 | "做一个页面"、"创建页面"、"列表页"、"详情页" |
| 组件开发 | "创建组件"、"做个组件"、"弹窗"、"表单" |

### 标准调用流程

```
用户需求 → quick_generate → 生成代码 → check_code_compliance
```

### 调用示例

```json
// Step 1: 调用 quick_generate
{ "text": "做一个员工列表页，支持搜索和分页", "projectPath": "D:/project/src/App.tsx" }

// Step 2: 根据返回的模板和示例生成代码（hooks 优先）

// Step 3: 调用 check_code_compliance
{ "generatedFiles": ["src/pages/Employee/hooks.ts", "src/pages/Employee/index.tsx"], "projectPath": "D:/project" }
```

---

## 📋 概述

AI 代码生成引擎提供 **19 个** MCP 工具，支持智能模板匹配、组件库知识注入、示例代码自动附加。

> 💡 **规则文件已内置**：`rules/ai-fe-code-std.md` 已集成，无需手动添加。

## 🚀 快速启动

```bash
# HTTP 模式（推荐）
npm run start

# STDIO 模式（MCP 协议）
npm run start:stdio

# 开发模式（热重载）
npm run dev
```

**启动后输出**：
```
🚀 AI 代码生成引擎 v2.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 MCP 端点:   http://127.0.0.1:7331/mcp
💚 健康检查:   http://127.0.0.1:7331/health
📖 服务信息:   http://127.0.0.1:7331/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ 可用工具: 19 个

⭐ 核心工具（必须了解）:
  - quick_generate          【默认入口】一键快速生成
  - generate_code_context   一键生成完整代码上下文
  - check_code_compliance   【生成后调用】检查代码规范

📦 模板工具:
  - smart_match_template    智能匹配模板
  - list_templates          列出所有模板
  - get_template            获取模板详情
  - get_code_examples       获取示例代码

🔍 项目分析工具:
  - detect_tech_stack       检测项目技术栈
  - analyze_project         分析项目结构和代码风格
  - check_global_types      检查全局类型声明
  - find_similar_components 查找相似组件

📚 知识库工具:
  - get_spec_content        获取规范文档内容
  - get_component_knowledge 获取组件库知识
  - parse_api_types         解析接口类型文件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 可用工具列表

### ⭐ 推荐调用顺序

```bash
1. quick_generate 或 generate_code_context（获取所有上下文）
   ↓
2. 根据返回的模板和示例代码生成业务代码
   ↓
3. check_code_compliance（检查生成的代码）
```

### 工具列表

| 工具名称 | 功能描述 | 核心参数 |
|---------|---------|----------|
| `quick_generate` | ⭐⭐⭐【最推荐】一键快速生成，自动执行所有准备步骤 🆕 | `text`, `projectPath` |
| `list_templates` | 列出所有可用模板 | 无 |
| `get_template` | 获取指定模板详情 | `id` |
| `match_template` | 智能匹配最合适的模板 | `text`, `topK` |
| `smart_match_template` | 智能匹配（含技术栈+兜底） | `text`, `projectPath`, `topK` |
| `build_prompt` | 构建增强版提示词 | `text`, `templateId` |
| `get_component_knowledge` | 获取组件库知识图谱 | `scope`, `projectId` |
| `get_code_examples` | 获取模板示例代码 | `templateId` |
| `search_spec` | 搜索规范文档 | `query`, `maxResults`, `specPath`, `projectPath` |
| `get_spec_content` | 获取规范文档内容 | `specPath`, `projectPath`, `section` |
| `detect_tech_stack` | 检测项目技术栈 | `projectPath` |
| `find_similar_components` | 查找项目中相似组件 | `searchText`, `projectPath` |
| `check_global_types` | 检查项目全局类型声明 | `projectPath` |
| `parse_api_types` | 解析接口类型文件 | `filePath` |
| `generate_code_context` | ⭐⭐⭐一键生成完整代码上下文 | `text`, `projectPath`, `apiTypesPath` |
| `check_code_compliance` | ⭐【生成后必须调用】检查代码规范符合性 | `generatedFiles`, `projectPath` |
| `get_stats` | 获取工具使用统计 | 无 |
| `analyze_project` | ⭐ 分析项目结构和代码风格配置 🆕 | `projectPath`, `moduleName` |
| `validate_code` | ⭐⭐【代码验证】整合 TSC + ESLint 一键检查 🆕 | `projectPath`, `files` |

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
| `specPath` | string | ❌ | 规范文件完整路径（直接指定） |
| `projectPath` | string | ❌ | ⭐用户项目路径（优先在此路径下查找规则文件） |

**调用示例**：
```json
{ "query": "hooks", "maxResults": 5, "projectPath": "o:/hzproject/cost-control" }
```

**返回示例**：
```json
{
  "specPath": "o:/hzproject/cost-control/.lingma/rules/ai-fe-code-std.md",
  "projectPath": "o:/hzproject/cost-control",
  "query": "hooks",
  "results": [
    { "line": 45, "text": "- 必须先生成 hooks 文件（数据获取 + 数据组装）" },
    { "line": 123, "text": "### hooks 优先原则" }
  ],
  "resultCount": 2
}
```

---

### 8. `get_spec_content` 🆕

获取规范文档内容，支持章节筛选。

> 💡 **规则文件已内置在 MCP 中**，用户无需手动添加规则文件，直接调用即可获取规则内容。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `section` | string | ❌ | 获取指定章节（如"核心规则"、"目录创建规则"） |
| `projectPath` | string | ❌ | 用户项目路径（如有自定义规则文件） |
| `specPath` | string | ❌ | 规范文件完整路径（直接指定） |

**查找优先级**：
1. 用户项目 `{projectPath}/.lingma/rules/ai-fe-code-std.md`（如果传入 projectPath）
2. **MCP 内置 `rules/ai-fe-code-std.md`** ✅ 默认使用
3. MCP 仓库根目录 `ai-fe-code-std.md`

**调用示例**：
```json
// 直接获取规则（使用 MCP 内置规则文件）
{ "section": "核心规则" }

// 获取全部规则内容
{}
```

**返回示例**：
```json
{
  "success": true,
  "specPath": "codegen-engine/rules/ai-fe-code-std.md",
  "section": "核心规则",
  "contentLength": 2345,
  "content": "## 核心规则\n\n### 1. hooks 优先原则\n..."
}
```

---

### 9. `detect_tech_stack` 🆕

检测项目技术栈，自动识别框架、UI 库、构建工具等信息。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `projectPath` | string | ❌ | 项目路径（默认自动检测） |

**调用示例**：
```json
{ "projectPath": "/path/to/your/project" }
```

**返回示例**：
```json
{
  "detected": true,
  "techStack": "react",
  "framework": "umi",
  "uiLibrary": "antd",
  "buildTool": "webpack",
  "isTypeScript": true,
  "packagePath": "/path/to/project/package.json",
  "projectName": "my-app"
}
```

**检测能力**：
- **框架**：React、Vue2、Vue3、Next、Nuxt、Umi
- **UI 库**：Ant Design、Element Plus、Element UI、Vant、Arco Design
- **构建工具**：Vite、Webpack
- **TypeScript**：是否使用 TypeScript

---

### 10. `smart_match_template` 🆕

智能匹配模板，结合技术栈信息提高匹配准确度，支持兜底机制。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `text` | string | ✅ | 需求描述 |
| `techStack` | string | ❌ | 技术栈（react/vue2/vue3），不传则自动检测 |
| `projectPath` | string | ❌ | 项目路径（用于兜底查找相似组件） |
| `topK` | number | ❌ | 返回前K个匹配结果（默认5） |

**调用示例**：
```json
{
  "text": "做一个文件上传组件，支持图片预览",
  "techStack": "react"
}
```

**返回示例**：
```json
{
  "techStackInfo": {
    "detected": true,
    "techStack": "react",
    "uiLibrary": "antd"
  },
  "top": [
    { "id": "react-pc-file-upload", "name": "React PC 文件上传组件", "score": 18, "boosts": ["技术栈完全匹配: react"] }
  ],
  "chosen": { "id": "react-pc-file-upload", "score": 18 },
  "fallbackUsed": false,
  "recommendation": "推荐使用模板: React PC 文件上传组件"
}
```

**智能特性**：
- 技术栈完全匹配：**+10 分**
- 技术栈部分匹配：**+5 分**
- 技术栈不匹配：**-15 分**
- UI 库匹配：**+3 分**
- 当匹配分数过低时，自动触发兜底机制

---

### 11. `find_similar_components` 🆕

从项目中查找相似组件（兜底规则），当模板匹配分数过低时自动调用。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `projectPath` | string | ❌ | 项目路径 |
| `keywords` | string | ✅ | 搜索关键词 |
| `techStack` | string | ❌ | 技术栈（用于过滤文件类型） |

**调用示例**：
```json
{
  "keywords": "上传 文件 图片",
  "techStack": "react"
}
```

**返回示例**：
```json
{
  "results": [
    {
      "path": "src/components/FileUpload/index.tsx",
      "score": 18,
      "matchedLabels": ["上传", "文件"],
      "fileName": "index.tsx"
    }
  ],
  "count": 1
}
```

**搜索范围**：
- `src/components`
- `src/pages`
- `src/views`
- `components`
- `pages`
- `views`

**匹配关键词权重**：
| 关键词 | 权重 |
|-------|-----|
| upload/uploader | 10 |
| file/attachment | 8 |
| image/img/photo | 6 |
| import/export | 6 |
| list/table | 5 |
| form/edit/add | 5 |
| modal/dialog/drawer | 4 |
| detail/view | 4 |

---

### 12. `check_global_types` 🆕

检查项目全局类型声明，避免生成代码时重复引入全局类型。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `projectPath` | string | ❌ | 项目路径（默认自动检测） |

**调用示例**：
```json
{ "projectPath": "/path/to/your/project" }
```

**返回示例**：
```json
{
  "found": true,
  "globalTypesPath": "/path/to/project/types/global.d.ts",
  "globalInterfaces": ["UserInfo", "ProjectItem", "TableItem"],
  "globalTypes": ["StatusType", "RoleType"],
  "globalEnums": ["OrderStatus"],
  "recommendation": "⚠️ 以下类型是全局声明的，生成代码时【绝对不要 import】：..."
}
```

**检查位置**：
- `types/global.d.ts`
- `typings/index.d.ts`
- `src/types/index.d.ts`
- `src/typings/global.d.ts`

**使用场景**：
- 生成 hooks 文件前检查
- 生成组件文件前检查
- 避免 TypeScript 类型重复引入错误

---

### 13. `parse_api_types` 🆕

解析接口类型文件，提取 interface、type 和 API 方法定义。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `filePath` | string | ✅ | 接口类型文件路径 |

**调用示例**：
```json
{ "filePath": "src/services/user/types.ts" }
```

**返回示例**：
```json
{
  "success": true,
  "filePath": "src/services/user/types.ts",
  "interfaces": [
    {
      "name": "UserInfo",
      "fields": [
        { "name": "id", "optional": false, "type": "string" },
        { "name": "name", "optional": false, "type": "string" },
        { "name": "email", "optional": true, "type": "string" }
      ]
    }
  ],
  "types": [
    { "name": "UserStatus", "definition": "'active' | 'inactive'" }
  ],
  "apiMethods": ["getUserList", "createUser", "updateUser"],
  "requestTypes": ["GetUserListParams", "CreateUserRequest"],
  "responseTypes": ["UserListResponse", "UserDetailData"]
}
```

**使用场景**：
- 规范要求"接口数据结构以文件为主"
- 自动提取字段信息用于生成表单/表格
- 识别请求/响应类型

---

### 14. `generate_code_context` 🆕⭐⭐⭐

**【必须优先调用】** 一键生成完整代码上下文，整合所有必要步骤。返回结果包含**规则执行提醒**，生成代码时必须严格遵循。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `text` | string | ✅ | 需求描述（可包含模板ID） |
| `projectPath` | string | ❌ | 项目路径（用于技术栈检测和全局类型检查） |
| `apiTypesPath` | string | ❌ | 接口类型文件路径（用于解析接口定义） |

**调用示例**：
```json
{
  "text": "做一个员工列表页，支持姓名搜索、新增编辑弹窗",
  "projectPath": "/path/to/project",
  "apiTypesPath": "src/services/employee/types.ts"
}
```

**返回内容**：
```json
{
  "techStack": {
    "detected": true,
    "techStack": "react",
    "uiLibrary": "antd",
    "isTypeScript": true
  },
  "globalTypes": {
    "found": true,
    "globalInterfaces": ["UserInfo", "TableItem"],
    "recommendation": "⚠️ 这些类型【绝对不要 import】"
  },
  "templateMatch": {
    "chosen": { "id": "react-standard-list-crud", "name": "React 标准列表页", "score": 18 },
    "recommendation": "推荐使用模板: React 标准列表页"
  },
  "codeExamples": { "index.example.tsx": "...", "hooks/useTableData.ts": "..." },
  "componentKnowledge": ["ant-design-pro", "element-plus"],
  "apiTypes": { "interfaces": [...], "apiMethods": [...] },
  "enhancedPrompt": "任务标准：ai-fe-code-std.md 为标准执行任务...",
  "checklist": [
    "✅ 技术栈: react",
    "✅ UI 库: antd",
    "✅ 匹配模板: React 标准列表页",
    "⚠️ 全局类型: 发现 2 个全局 interface，生成代码时不要 import",
    "✅ 示例代码: 已获取 4 个文件"
  ],
  "criticalReminders": [
    "🚨 全局类型警告: UserInfo, TableItem 这些类型【绝对不要 import】",
    "📋 必须先生成 hooks/composables 文件，再生成组件文件",
    "📋 生成后必须进行 TypeScript/ESLint 自检并修复"
  ],
  "ruleEnforcement": {
    "specPath": "codegen-engine/rules/ai-fe-code-std.md",
    "mandatory": true,
    "coreRules": [
      "⭐ 【必须】先生成 hooks/composables 文件，再生成组件文件",
      "⭐ 【必须】接口数据结构以文件为主，不要推测字段",
      "⭐ 【必须】检查全局类型，避免重复 import",
      "⭐ 【禁止】生成任何 mock 数据或假数据"
    ],
    "message": "⚠️ 生成代码时必须严格遵循以上规则"
  }
}
```

**整合的步骤**：
1. `detect_tech_stack` - 检测技术栈
2. `check_global_types` - 检查全局类型
3. `smart_match_template` - 智能匹配模板
4. `get_code_examples` - 获取示例代码
5. `get_component_knowledge` - 获取组件库知识
6. `parse_api_types` - 解析接口类型（如提供）
7. `build_prompt` - 构建增强提示词

**优势**：
- ⭐ **一次调用，获取所有上下文**
- ⭐ **自动检查全局类型，避免重复引入**
- ⭐ **自动匹配技术栈，提高模板准确度**
- ⭐ **生成检查清单和关键提醒**
- ⭐ **返回完整规则执行流程和自检报告模板**

---

### 15. `check_code_compliance` 🆕⭐

**【生成代码后必须调用】** 检查生成的代码是否符合规范，输出自检报告。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `generatedFiles` | array | ✅ | 已生成的文件路径列表 |
| `projectPath` | string | ❌ | 项目路径（可选） |

**调用示例**：
```json
{
  "generatedFiles": [
    "src/pages/employee/hooks/useTableData.ts",
    "src/pages/employee/index.tsx",
    "src/pages/employee/types.ts"
  ]
}
```

**返回示例**：
```json
{
  "summary": "✅ 所有检查通过",
  "passed": [
    { "rule": "hooks/composables 文件检查", "pass": true, "message": "✅ hooks/composables 文件已生成" },
    { "rule": "hooks 文件生成顺序检查", "pass": true, "message": "✅ 文件生成顺序正确" },
    { "rule": "类型文件检查", "pass": true, "message": "✅ 类型定义文件已生成" },
    { "rule": "文件数量检查", "pass": true, "message": "✅ 已生成 3 个文件" }
  ],
  "issues": [],
  "generatedFiles": [...],
  "recommendation": "代码已准备就绪，可直接使用"
}
```

**检查项**：
- ✅ hooks/composables 文件是否存在
- ✅ hooks 文件是否在组件之前生成
- ✅ 类型定义文件是否存在
- ✅ 文件数量是否合理

---

### 16. `get_stats`

获取工具使用统计信息。

**参数**：无

**返回示例**：
```json
{
  "created": "2025-12-29 11:05:29",
  "lastUpdated": "2025-12-29 14:30:00",
  "totalToolCalls": 35,
  "toolRanking": [["detect_tech_stack", 7], ["smart_match_template", 7]],
  "templateRanking": [],
  "techStackDistribution": []
}
```

---

### 17. `analyze_project` 🆕⭐

分析项目结构和代码风格配置，提供智能目录推荐。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `projectPath` | string | ✅ | 项目中任意文件的路径 |
| `moduleName` | string | ❌ | 要创建的模块名称（用于生成推荐路径） |

**调用示例**：
```json
{ "projectPath": "D:/project/src/App.tsx", "moduleName": "employee-whitelist" }
```

**返回内容**：
```json
{
  "projectContext": {
    "rootDir": "D:/project",
    "directories": ["pages", "components", "hooks"],
    "routerType": "umi",
    "stateManagement": "redux"
  },
  "codeStyle": {
    "prettier": { "found": true },
    "eslint": { "found": true },
    "typescript": { "found": true, "strict": true }
  },
  "fileSuggestions": {
    "pageDir": "src/pages/employee-whitelist",
    "hooksFile": "src/pages/employee-whitelist/hooks/useTableData.ts",
    "indexFile": "src/pages/employee-whitelist/index.tsx"
  }
}
```

**功能**：
- ✅ 分析项目目录结构（pages/views/components/hooks等）
- ✅ 检测路由类型（umi/vue-router/react-router）
- ✅ 检测状态管理（redux/mobx/pinia/vuex）
- ✅ 检测代码风格配置（Prettier/ESLint/TypeScript）
- ✅ 智能推荐文件路径（符合规则兜底逻辑）

---

### 18. `validate_code` 🆕⭐⭐

**【代码验证工具】** 整合 TypeScript + ESLint 一键检查，实现规则中定义的"代码自检"流程自动化。

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `projectPath` | string | ✅ | 项目路径（文件或目录均可） |
| `files` | array | ❌ | 要检查的文件列表（不传则检查整个项目） |

**调用示例**：
```json
{ "projectPath": "D:/project/src/pages/employee/index.tsx" }
```

**返回内容**：
```json
{
  "success": false,
  "projectRoot": "D:/project",
  "summary": {
    "totalErrors": 3,
    "totalWarnings": 5,
    "fixableCount": 4,
    "tsSkipped": false,
    "eslintSkipped": false
  },
  "typescript": {
    "success": false,
    "errorCount": 2,
    "errors": [
      { "file": "src/pages/employee/index.tsx", "line": 15, "code": "TS2304", "message": "找不到名称 'UserInfo'" }
    ]
  },
  "eslint": {
    "success": false,
    "errorCount": 1,
    "warningCount": 5,
    "fixableCount": 4,
    "errors": [
      { "file": "src/pages/employee/hooks.ts", "line": 8, "ruleId": "no-unused-vars", "message": "'data' is defined but never used" }
    ]
  },
  "suggestions": [
    { "type": "typescript", "code": "TS2304", "count": 1, "suggestion": "找不到名称：检查类型是否需要导入或是否为全局类型" },
    { "type": "eslint", "rule": "no-unused-vars", "count": 2, "suggestion": "删除未使用的变量或导入" }
  ],
  "commands": {
    "tsFix": "npx tsc --noEmit",
    "eslintFix": "npx eslint src --fix"
  },
  "report": "❌ 发现 3 个错误，5 个警告\n\n📋 修复建议：\n- 找不到名称：检查类型是否需要导入或是否为全局类型 (1处)\n- 删除未使用的变量或导入 (2处)"
}
```

**功能**：
- ✅ 执行 `tsc --noEmit` TypeScript 类型检查
- ✅ 执行 ESLint 规则检查
- ✅ 返回错误列表（按文件、行号定位）
- ✅ 自动生成修复建议
- ✅ 提供修复命令

**使用场景**：
- 生成代码后验证质量
- 规则第5步"代码自检"自动化
- 快速定位类型错误和 ESLint 问题

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

效果：代码可用度显著提升 ✨
```

### 场景2：明确指定模板

```
用户输入：react-nonstandard-detail 做一个出差申请单详情页

AI 处理流程：
1. build_prompt 识别明确模板ID
2. 跳过匹配，直接使用指定模板
3. 自动附加详情页示例代码

效果：代码可用度显著提升 ✨
```

---

## 🔮 未来扩展功能

### 🎯 计划中的新工具

| 工具名称 | 功能描述 | 优先级 | 状态 |
|---------|---------|-------|------|
| `validate_code` | 代码质量验证（TypeScript/ESLint 检查） | P1 | ✅ 已实现 |
| `suggest_refactor` | 代码重构建议 | P1 | ⏳ 待开发 |
| `generate_test` | 自动生成单元测试 | P2 | ⏳ 待开发 |
| `convert_template` | 跨框架模板转换（React ↔ Vue） | P3 | ⏳ 待开发 |

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
              │  - 19 个 MCP 工具                            │
              │  - 模板匹配 / 知识图谱 / 示例代码              │
              │  - 技术栈检测 / 全局类型检查                  │
              │  - 导出 handleCallTool / TOOLS_DEFINITION   │
              └─────────────────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────────────────────┐
              │                  数据层                      │
              │  templates/  │  knowledge/  │  规范文档      │
              └─────────────────────────────────────────────┘
```

### 核心文件

| 文件 | 职责 | 启动命令 | 使用场景 |
|-----|------|---------|---------|
| `src/server.js` | **核心文件** - MCP 服务器（STDIO 模式） | `npm run start:stdio` | AI IDE 集成（STDIO） |
| `src/server-http.js` | **HTTP 适配器** - 轻量 Express 服务 | `npm run start` | 调试测试（HTTP） |
| `src/index.js` | **统一导出入口** - 模块化导出 | - | 内部引用 |

### 模块化架构

```javascript
// src/index.js - 统一导出入口
export { handleCallTool, TOOLS_DEFINITION } from './tools/index.js'
export { ... } from './matching/index.js'
export { ... } from './utils/index.js'

// src/server-http.js - HTTP 适配器
import { handleCallTool, TOOLS_DEFINITION } from './tools/index.js'
```

**优点**：
- ✅ **单一代码源**：所有业务逻辑集中在 `server.js`
- ✅ **无重复代码**：HTTP 模式直接复用核心逻辑
- ✅ **统一维护**：修改一处，两种模式同步生效

---

## 📁 目录结构

```
codegen-engine/
├── src/                          # v2.0 模块化源码
│   ├── index.js                  # 统一导出入口
│   ├── server.js                 # MCP 服务器（STDIO 模式）
│   ├── server-http.js            # HTTP 服务器
│   ├── utils/                    # 工具函数
│   │   ├── index.js              # 工具导出
│   │   ├── logger.js             # 日志工具
│   │   ├── file.js               # 文件操作
│   │   └── config.js             # 配置常量
│   ├── spec/                     # 规范文档相关
│   │   └── index.js              # 规范搜索与获取
│   ├── matching/                 # 模板匹配相关
│   │   ├── index.js              # 匹配模块导出
│   │   ├── tech-stack.js         # 技术栈检测
│   │   ├── matcher.js            # 模板匹配
│   │   └── knowledge.js          # 知识库/示例
│   ├── types/                    # 类型检查
│   │   └── index.js              # 全局类型检查/API类型解析
│   └── tools/                    # MCP 工具
│       ├── index.js              # 工具导出
│       ├── definitions.js        # 工具定义
│       ├── handlers.js           # 工具处理器
│       ├── prompts.js            # 提示词构建
│       └── context.js            # 上下文生成
├── rules/                        # 规则文件（内置）
│   └── ai-fe-code-std.md
├── knowledge/                    # 组件库知识图谱
│   ├── common/                   # 通用组件库
│   │   ├── ant-design-pro.md
│   │   ├── element-plus.md
│   │   ├── element-ui.md
│   │   ├── react-drawer-form.md
│   │   ├── template-usage-guide.md
│   │   └── vant-components.md
│   └── business/                 # 业务组件库
│       └── [project-id]/
├── templates/
│   ├── template-registry.json    # 模板注册表
│   └── examples/                 # 示例代码库（13个模板）
│       ├── react-standard-list-crud/
│       ├── react-standard-modal-form/
│       ├── react-standard-form-page/
│       ├── react-drawer-form/
│       ├── react-drawer-detail/
│       ├── react-nonstandard-detail/
│       ├── react-import-list-modal/
│       ├── react-pc-file-upload/
│       ├── react-batch-schema-form/
│       ├── vue2-standard-list-crud/
│       ├── vue2-h5-file-upload/
│       ├── vue2-pc-file-upload/
│       └── vue3-standard-list-crud/
├── package.json
├── MCP-TOOLS.md                  # 本文档
└── README.md                     # 项目说明
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
| 纯提示词 | 低 | 高 | 低 |
| 提示词 + Rule | 中 | 中 | 中 |
| **MCP + 示例代码** | **高** ✨ | **低** | **中** |

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
