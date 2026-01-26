# CodeGen Engine MCP Skill

AI 代码生成引擎 MCP 技能文档 - 智能前端代码生成服务。

## Skill 与 MCP 的关系

```
Skill = 指导文档（告诉 AI 如何做）
MCP = 实际工具（执行具体操作）
```

**工作流程**：
```
用户输入 → AI 匹配 Skill → 读取 SKILL.md → 按指导调用 MCP 工具
```

**关键点**：
- Skill 本身**不直接调用** MCP，而是**指导 AI 如何调用**
- 当用户说"做列表页"时，AI 自动加载此 skill 并按指导使用 `CallMcpTool`
- 需要在 Cursor MCP 设置中配置 `codegen-engine` 服务器

## 快速了解

```
用户说"做个列表页" → AI 调用 quick_generate → 获取上下文 → 生成代码 → check_code_compliance
```

## 核心能力

| 能力 | 说明 |
|------|------|
| 🎯 智能模板匹配 | 17个内置模板（React/Vue2/Vue3） |
| 📚 组件库知识 | Ant Design Pro、Element Plus 等 |
| 📝 示例代码 | 每个模板都有完整示例 |
| ✅ 规范内置 | ai-fe-code-std.md 已集成 |
| 🔍 项目分析 | 自动检测技术栈、全局类型 |

## 最简使用流程

### 1. 调用 quick_generate

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个员工列表页，支持搜索、新增、编辑、删除",
    projectPath: "D:/project/src/App.tsx"
  }
})
```

### 2. 根据返回结果生成代码

按照返回的 `codeExamples` 和 `criticalReminders` 生成代码：
- 先生成 hooks 文件
- 再生成类型文件
- 最后生成组件文件

### 3. 检查代码规范

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: [
      "src/pages/employee/hooks/useTableData.ts",
      "src/pages/employee/index.tsx"
    ]
  }
})
```

## 核心规则（必须遵守）

| 规则 | 说明 |
|------|------|
| ⭐ hooks优先 | 必须先生成 hooks 文件，再生成组件 |
| ⭐ 接口为准 | 接口数据结构以文件为主，不推测字段 |
| ⭐ 全局类型 | check_global_types 返回的类型不要 import |
| ⭐ 禁止mock | 禁止生成任何 mock 数据 |

## 触发关键词

当用户输入包含以下关键词时，直接调用 `quick_generate`：

- 代码生成："生成代码"、"写代码"、"帮我写"
- 页面创建："做一个页面"、"列表页"、"详情页"
- 组件开发："创建组件"、"弹窗"、"表单"

## 可用模板

### React 模板
- `react-standard-list-crud` - 标准列表页
- `react-standard-modal-form` - 标准弹窗表单
- `react-standard-form-page` - 标准表单页
- `react-drawer-form` - 抽屉表单
- `react-drawer-detail` - 抽屉详情
- `react-nonstandard-detail` - 非标详情页
- `react-pc-file-upload` - PC文件上传

### Vue2 模板
- `vue2-standard-list-crud` - 标准列表页
- `vue2-pc-file-upload` - PC文件上传

### Vue3 模板
- `vue3-standard-list-crud` - 标准列表页

## 文档导航

| 文档 | 说明 |
|------|------|
| [SKILL.md](SKILL.md) | 完整技能文档 |
| [tools-reference.md](tools-reference.md) | 工具详细参数 |
| [examples.md](examples.md) | 完整使用示例 |

## 服务配置

- **MCP 服务器**: `codegen-engine`
- **默认端口**: 7331
- **MCP 端点**: `http://127.0.0.1:7331/mcp`
- **健康检查**: `http://127.0.0.1:7331/health`

## 启动方式

```bash
# HTTP 模式（推荐）
npm run start

# STDIO 模式
npm run start:stdio
```
