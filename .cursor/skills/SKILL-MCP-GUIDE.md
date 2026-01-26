# Skill 与 MCP 关系指南

本文档说明 Cursor Skill 如何触发调用 MCP 工具。

---

## 核心概念

```
Skill = 指导文档（告诉 AI 如何做）
MCP = 实际工具（执行具体操作）
```

**关键点**：Skill 本身**不直接调用** MCP，而是**指导 AI 如何调用 MCP 工具**。

---

## 工作流程

```
用户输入 → AI 匹配 Skill description → 自动读取 SKILL.md → 按照指导调用 MCP 工具
```

### 详细流程

```
1. 用户输入: "帮我做一个员工管理列表页"
                    ↓
2. AI 识别关键词 "列表页" 匹配 skill 的 description
                    ↓
3. AI 自动读取 .cursor/skills/codegen-engine/SKILL.md
                    ↓
4. 按照 SKILL.md 中的指导执行:
   - 调用 quick_generate 获取代码生成上下文
   - 根据返回的模板和示例生成代码
   - 调用 check_code_compliance 检查代码规范
```

---

## Skill 触发机制

### Frontmatter 定义

Skill 的 `description` 字段定义了何时被触发：

```yaml
---
name: codegen-engine
description: 使用AI代码生成引擎MCP工具进行智能前端代码生成。当用户需要生成页面代码、创建组件、做列表页/表单页/详情页时使用此skill。
---
```

### 触发关键词示例

| 用户输入 | 匹配的 Skill | 触发原因 |
|----------|-------------|----------|
| "做一个列表页" | codegen-engine | 匹配 "列表页" |
| "生成代码" | codegen-engine | 匹配 "生成页面代码" |
| "测试前端页面" | browser-automation | 匹配 "测试前端页面" |

---

## MCP 调用方式

AI 读取 Skill 后，会使用 `CallMcpTool` 调用 MCP 工具：

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

### 参数说明

| 参数 | 说明 |
|------|------|
| `server` | MCP 服务器名称，需与 Cursor MCP 设置中的配置名称一致 |
| `toolName` | MCP 工具名称，由 MCP 服务器定义 |
| `arguments` | 工具参数，根据具体工具的 schema 定义 |

---

## 前置条件

要让 Skill 正常触发 MCP 调用，需要满足以下条件：

| 条件 | 说明 | 检查方法 |
|------|------|----------|
| Skill 文件存在 | `.cursor/skills/[name]/SKILL.md` | 检查文件是否存在 |
| MCP 服务器已配置 | 在 Cursor MCP 设置中配置 | Cursor 设置 → MCP |
| MCP 服务已运行 | 服务已启动 | 检查进程或端口 |
| 名称匹配 | `CallMcpTool` 的 `server` 与配置名称一致 | 对比配置 |

---

## MCP 服务器配置

在 Cursor 设置中配置 MCP 服务器：

### STDIO 模式（推荐用于 AI IDE 集成）

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

### HTTP 模式（推荐用于调试）

```json
{
  "mcpServers": {
    "codegen-engine": {
      "url": "http://127.0.0.1:7331/mcp"
    }
  }
}
```

---

## 本项目 Skill 列表

| Skill 名称 | 路径 | 触发场景 |
|------------|------|----------|
| codegen-engine | `.cursor/skills/codegen-engine/` | 生成页面代码、创建组件、列表页/表单页/详情页 |
| browser-automation | `.cursor/skills/browser-automation/` | 测试前端页面、自动化网页操作、验证UI交互 |

---

## 常见问题

### Q: Skill 会自动调用 MCP 吗？

**A**: 不会。Skill 是指导文档，AI 读取后会**按照文档指导**来调用 MCP。

### Q: MCP 服务器未启动会怎样？

**A**: AI 调用 `CallMcpTool` 时会报错 "MCP server does not exist"，需要先启动服务或配置 MCP。

### Q: 如何新增 Skill？

**A**: 在 `.cursor/skills/` 目录下创建新文件夹，包含 `SKILL.md` 文件，定义正确的 frontmatter。

### Q: Skill 和 Rule 有什么区别？

**A**: 
- **Skill**: 指导 AI 完成特定任务的文档，可以包含 MCP 调用指导
- **Rule**: 编码规范和约束，用于约束 AI 生成代码的风格

---

## 相关文档

- [codegen-engine Skill](./codegen-engine/SKILL.md) - 代码生成 MCP 使用指南
- [browser-automation Skill](./browser-automation/SKILL.md) - 浏览器自动化 MCP 使用指南
