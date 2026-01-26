---
name: codegen-engine
description: 使用AI代码生成引擎MCP工具进行智能前端代码生成。当用户需要生成页面代码、创建组件、做列表页/表单页/详情页、或询问如何使用代码生成MCP工具时使用此skill。
---

# AI CodeGen Engine MCP Skill

使用 `codegen-engine` MCP服务器进行智能前端代码生成，支持React/Vue2/Vue3技术栈。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🎯 智能模板匹配 | 17个内置模板，自动识别需求匹配最佳模板 |
| 📚 组件库知识 | Ant Design Pro、Element Plus、Element UI、Vant等 |
| 📝 示例代码 | 每个模板都有完整示例（hooks + 组件 + 样式） |
| ✅ 规范内置 | ai-fe-code-std.md 已集成，无需手动添加 |
| 🔍 项目分析 | 自动检测技术栈、全局类型、代码风格 |

---

## Skill 与 MCP 的关系

### 什么是 Skill？

Skill 是一个**指导文档**，用于告诉 AI 如何完成特定类型的任务。Skill 本身不直接调用 MCP，而是**指导 AI 如何调用 MCP 工具**。

### 工作流程

```
用户输入 → AI 匹配 Skill description → 自动读取 SKILL.md → 按照指导调用 MCP 工具
```

### 触发机制

Skill 的 `description` 字段定义了何时被触发：

```yaml
---
name: codegen-engine
description: 使用AI代码生成引擎MCP工具进行智能前端代码生成。当用户需要生成页面代码、创建组件、做列表页/表单页/详情页时使用此skill。
---
```

当用户说 "做一个列表页" 或 "生成代码" 时，AI 会：
1. 识别关键词匹配 skill description
2. 自动读取此 SKILL.md 文件
3. 按照文档中的指导使用 `CallMcpTool` 调用 MCP 工具

### MCP 调用方式

AI 读取 Skill 后，会使用以下方式调用 MCP：

```javascript
CallMcpTool({
  server: "codegen-engine",    // MCP 服务器名称（需在 Cursor 中配置）
  toolName: "quick_generate",   // 工具名称
  arguments: {                  // 参数
    text: "做一个员工列表页",
    projectPath: "D:/project/src/App.tsx"
  }
})
```

### 前置条件

要让 Skill 正常触发 MCP 调用，需要：

| 条件 | 说明 |
|------|------|
| Skill 文件 | `.cursor/skills/codegen-engine/SKILL.md` 存在 |
| MCP 服务器 | `codegen-engine` 已在 Cursor MCP 设置中配置 |
| 服务运行 | MCP 服务已启动（`npm run start` 或 `npm run start:stdio`） |
| 名称匹配 | `CallMcpTool` 中的 `server` 与 MCP 配置名称一致 |

### MCP 服务器配置示例

在 Cursor 设置中配置 MCP 服务器：

**STDIO 模式**（推荐用于 AI IDE 集成）：
```json
{
  "mcpServers": {
    "codegen-engine": {
      "command": "node",
      "args": ["D:/path/to/codegen-engine/src/server.js"],
      "env": {}
    }
  }
}
```

**HTTP 模式**（推荐用于调试）：
```json
{
  "mcpServers": {
    "codegen-engine": {
      "url": "http://127.0.0.1:7331/mcp"
    }
  }
}
```

### 完整触发流程示例

```
用户: "帮我做一个员工管理列表页"
                ↓
AI 识别关键词 "列表页" 匹配 skill description
                ↓
AI 自动读取 .cursor/skills/codegen-engine/SKILL.md
                ↓
按照 SKILL.md 指导执行：
  1. 调用 quick_generate 获取代码生成上下文
  2. 根据返回的模板和示例生成代码（先 hooks 后组件）
  3. 调用 check_code_compliance 检查代码规范
```

---

## 核心工具列表

### ⭐ 必须掌握的工具（按调用顺序）

| 步骤 | 工具名 | 功能 | 关键参数 |
|------|--------|------|----------|
| 1️⃣ | `quick_generate` | 【首选入口】一键快速生成 | `text`, `projectPath` |
| 2️⃣ | (根据返回结果生成代码) | - | - |
| 3️⃣ | `check_code_compliance` | 【必须调用】检查代码规范 | `generatedFiles` |

### 📦 模板工具

| 工具名 | 功能 | 关键参数 |
|--------|------|----------|
| `list_templates` | 列出所有可用模板 | 无 |
| `get_template` | 获取指定模板详情 | `id` |
| `match_template` | 智能匹配模板 | `text`, `topK` |
| `smart_match_template` | 智能匹配（含技术栈+兜底） | `text`, `projectPath` |
| `get_code_examples` | 获取模板示例代码 | `templateId` |

### 🔍 项目分析工具

| 工具名 | 功能 | 关键参数 |
|--------|------|----------|
| `detect_tech_stack` | 检测项目技术栈 | `projectPath` |
| `analyze_project` | 分析项目结构和代码风格 | `projectPath`, `moduleName` |
| `check_global_types` | 检查全局类型声明 | `projectPath` |
| `find_similar_components` | 查找项目中相似组件 | `searchText`, `projectPath` |

### 📚 知识库工具

| 工具名 | 功能 | 关键参数 |
|--------|------|----------|
| `get_spec_content` | 获取规范文档内容 | `section`, `projectPath` |
| `get_component_knowledge` | 获取组件库知识图谱 | `scope` |
| `parse_api_types` | 解析接口类型文件 | `filePath` |

### ✅ 验证工具

| 工具名 | 功能 | 关键参数 |
|--------|------|----------|
| `check_code_compliance` | 检查代码规范符合性 | `generatedFiles` |
| `validate_code` | TSC + ESLint 一键检查 | `projectPath`, `files` |

---

## 关键工作流程

### 标准代码生成流程

```
1. quick_generate(text, projectPath)    → 获取完整上下文
2. 根据返回的模板和示例生成代码        → 严格遵守规则
3. check_code_compliance(generatedFiles) → 检查代码规范
4. (可选) validate_code(projectPath)    → TSC/ESLint验证
```

### 核心规则约束

**生成代码时必须遵守**：

| 规则 | 说明 |
|------|------|
| hooks优先 | 必须先生成 hooks/composables 文件，再生成组件文件 |
| 接口为准 | 接口数据结构以文件为主，不要推测字段 |
| 全局类型 | check_global_types 返回的类型【绝对不要 import】 |
| 禁止mock | 禁止生成任何 mock 数据或假数据 |

### 技术栈适配

| 技术栈 | UI库 | 模板前缀 |
|--------|------|----------|
| React | Ant Design/Ant Design Pro | `react-*` |
| Vue2 | Element UI | `vue2-*` |
| Vue3 | Element Plus | `vue3-*` |

---

## 常用场景

### 场景1：生成标准列表页（CRUD）

```javascript
// Step 1: 调用 quick_generate
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个员工列表页，支持姓名搜索、新增、编辑、删除",
    projectPath: "D:/project/src/App.tsx"
  }
})

// Step 2: 根据返回的 codeExamples 和 templateMatch 生成代码
// - 先生成 hooks/useTableData.ts
// - 再生成 index.tsx 组件
// - 可选生成 types.ts

// Step 3: 检查代码规范
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: [
      "src/pages/employee/hooks/useTableData.ts",
      "src/pages/employee/index.tsx",
      "src/pages/employee/types.ts"
    ]
  }
})
```

### 场景2：生成弹窗表单

```javascript
// Step 1: 调用 quick_generate
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个新增/编辑员工的弹窗表单",
    projectPath: "D:/project/src/pages/employee/index.tsx"
  }
})

// Step 2: 根据返回结果生成 EditModal 组件

// Step 3: 检查代码规范
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: ["src/pages/employee/components/EditModal.tsx"]
  }
})
```

### 场景3：生成详情页

```javascript
// Step 1: 明确指定模板
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "react-nonstandard-detail 做一个出差申请单详情页",
    projectPath: "D:/project/src/App.tsx"
  }
})

// Step 2: 根据返回结果生成代码
// - 先生成 hooks/useDetailData.ts
// - 再生成 index.tsx
// - 生成 index.less 样式

// Step 3: 检查代码规范
```

### 场景4：生成文件上传组件

```javascript
// Step 1: 调用 quick_generate
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个文件上传组件，支持图片预览和多文件上传",
    projectPath: "D:/project/src/App.tsx"
  }
})

// Step 2: 根据返回的 react-pc-file-upload 模板生成代码
```

---

## 分步调用流程（高级用法）

当需要更精细控制时，可以分步调用：

```
1. detect_tech_stack(projectPath)           → 获取技术栈信息
2. check_global_types(projectPath)          → 获取全局类型列表
3. smart_match_template(text, projectPath)  → 智能匹配模板
4. get_code_examples(templateId)            → 获取示例代码
5. get_spec_content(section)                → 获取规范内容
6. 根据上下文生成代码
7. check_code_compliance(generatedFiles)    → 检查代码规范
8. validate_code(projectPath, files)        → TSC/ESLint验证
```

---

## 可用模板列表

### React 模板

| 模板ID | 名称 | 适用场景 |
|--------|------|----------|
| `react-standard-list-crud` | 标准列表页 | 列表+搜索+CRUD弹窗 |
| `react-standard-modal-form` | 标准弹窗表单 | 新增/编辑弹窗 |
| `react-standard-form-page` | 标准表单页 | 独立表单页面 |
| `react-drawer-form` | 抽屉表单 | 侧边抽屉表单 |
| `react-drawer-detail` | 抽屉详情 | 侧边抽屉详情 |
| `react-nonstandard-detail` | 非标详情页 | 复杂详情页面 |
| `react-import-list-modal` | 导入列表弹窗 | 数据导入选择 |
| `react-pc-file-upload` | PC文件上传 | 文件上传组件 |
| `react-batch-schema-form` | 批量Schema表单 | 动态表单 |

### Vue2 模板

| 模板ID | 名称 | 适用场景 |
|--------|------|----------|
| `vue2-standard-list-crud` | 标准列表页 | 列表+搜索+CRUD弹窗 |
| `vue2-pc-file-upload` | PC文件上传 | 文件上传组件 |
| `vue2-h5-file-upload` | H5文件上传 | 移动端文件上传 |

### Vue3 模板

| 模板ID | 名称 | 适用场景 |
|--------|------|----------|
| `vue3-standard-list-crud` | 标准列表页 | 列表+搜索+CRUD弹窗 |

---

## 注意事项

### 关键约束

1. **必须先调用 quick_generate** - 获取完整上下文后再生成代码
2. **必须调用 check_code_compliance** - 生成代码后必须检查规范
3. **全局类型不要 import** - check_global_types 返回的类型是全局声明的
4. **hooks 优先生成** - 先生成数据处理逻辑，再生成 UI 组件
5. **禁止 mock 数据** - 不要生成任何假数据或示例数据

### 文件生成顺序

```
正确顺序：
1. hooks/useTableData.ts    ← 先生成数据处理
2. types.ts                 ← 再生成类型定义
3. index.tsx                ← 最后生成组件

错误顺序：
1. index.tsx                ← 不要先生成组件
2. hooks/useTableData.ts
```

### projectPath 参数

- 传入 IDE 当前打开的文件路径
- 工具会自动向上查找项目根目录
- 支持任意深度的文件路径

---

## 工具调用示例

### 使用 CallMcpTool 调用

```javascript
// 一键快速生成
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个用户管理列表页",
    projectPath: "D:/project/src/pages/user/index.tsx"
  }
})

// 检测技术栈
CallMcpTool({
  server: "codegen-engine",
  toolName: "detect_tech_stack",
  arguments: {
    projectPath: "D:/project/package.json"
  }
})

// 检查全局类型
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_global_types",
  arguments: {
    projectPath: "D:/project"
  }
})

// 获取模板示例代码
CallMcpTool({
  server: "codegen-engine",
  toolName: "get_code_examples",
  arguments: {
    templateId: "react-standard-list-crud"
  }
})

// 检查代码规范
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: [
      "src/pages/user/hooks/useTableData.ts",
      "src/pages/user/index.tsx"
    ]
  }
})

// 代码验证（TSC + ESLint）
CallMcpTool({
  server: "codegen-engine",
  toolName: "validate_code",
  arguments: {
    projectPath: "D:/project",
    files: ["src/pages/user/index.tsx"]
  }
})
```

---

## 完整代码生成模板

```
任务：生成[页面类型]

步骤：
1. [ ] 调用 quick_generate 获取上下文
2. [ ] 分析返回的 templateMatch 和 codeExamples
3. [ ] 检查 globalTypes.recommendation（避免重复import）
4. [ ] 生成 hooks/composables 文件
5. [ ] 生成 types.ts 类型文件（如需要）
6. [ ] 生成主组件文件 index.tsx/vue
7. [ ] 生成样式文件（如需要）
8. [ ] 调用 check_code_compliance 检查规范
9. [ ] (可选) 调用 validate_code 进行 TSC/ESLint 验证
```

---

## 返回数据结构说明

### quick_generate 返回结构

```json
{
  "techStack": {
    "detected": true,
    "techStack": "react",
    "framework": "umi",
    "uiLibrary": "antd",
    "isTypeScript": true
  },
  "globalTypes": {
    "found": true,
    "globalInterfaces": ["UserInfo", "TableItem"],
    "recommendation": "⚠️ 这些类型【绝对不要 import】"
  },
  "templateMatch": {
    "chosen": {
      "id": "react-standard-list-crud",
      "name": "React 标准列表页",
      "score": 18
    }
  },
  "codeExamples": {
    "hooks.example.ts": "...",
    "index.example.tsx": "...",
    "components/EditModal.example.tsx": "..."
  },
  "componentKnowledge": {
    "ant-design-pro": "..."
  },
  "criticalReminders": [
    "🚨 全局类型警告: UserInfo, TableItem 【绝对不要 import】",
    "📋 必须先生成 hooks 文件，再生成组件文件"
  ],
  "ruleEnforcement": {
    "coreRules": [
      "⭐ 【必须】先生成 hooks 文件，再生成组件文件",
      "⭐ 【禁止】生成任何 mock 数据"
    ]
  }
}
```

### check_code_compliance 返回结构

```json
{
  "summary": "✅ 所有检查通过",
  "passed": [
    { "rule": "hooks文件检查", "pass": true, "message": "✅ hooks文件已生成" },
    { "rule": "文件顺序检查", "pass": true, "message": "✅ 文件生成顺序正确" }
  ],
  "issues": [],
  "recommendation": "代码已准备就绪，可直接使用"
}
```

---

## 故障排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 模板匹配不准 | 技术栈未检测 | 确保传入正确的 projectPath |
| 全局类型报错 | 重复 import | 调用 check_global_types 获取全局类型列表 |
| hooks 缺失 | 生成顺序错误 | 先生成 hooks，再生成组件 |
| 示例代码为空 | 模板ID错误 | 调用 list_templates 获取正确的模板ID |
| 类型错误 | 接口字段推测 | 调用 parse_api_types 解析接口文件 |

---

## 触发关键词

当用户输入包含以下关键词时，**直接调用 `quick_generate`**：

| 类型 | 关键词示例 |
|------|-----------|
| 代码生成 | "生成代码"、"写代码"、"帮我写" |
| 页面创建 | "做一个页面"、"创建页面"、"列表页"、"详情页" |
| 组件开发 | "创建组件"、"做个组件"、"弹窗"、"表单" |
| CRUD操作 | "增删改查"、"CRUD"、"新增编辑" |

---

## 更多资源

- 需要**完整工具参数**，请参考 [tools-reference.md](tools-reference.md)
- 需要**使用示例**，请参考 [examples.md](examples.md)
- 需要**快速了解**，请参考 [README.md](README.md)
