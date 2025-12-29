# 🚀 AI 代码生成引擎 (AI CodeGen Engine)

> **v2.1.0** - 无脑调用版本

智能前端代码生成服务 - 通过模板匹配、组件库知识图谱和示例代码，显著提升 AI 生成代码的可用度。

---

## ⭐ 快速了解

```
用户说“做个列表页” → AI 调用 quick_generate → 生成代码 → 自动检查
```

**核心功能**：
- 🎯 **智能模板匹配** - 17 个内置模板（React/Vue2/Vue3）
- 📚 **组件库知识** - Ant Design Pro、Element Plus 等
- 📝 **示例代码** - 每个模板都有完整示例
- ✅ **规范内置** - 无需手动添加规则文件


---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd codegen-engine
npm install
```

### 2. 启动服务

#### HTTP 模式（推荐用于调试和测试）

```bash
npm run start
```

#### STDIO 模式（用于 AI 工具集成，如通义灵码）

```bash
npm run start:stdio
```

> **注意**：STDIO 模式不会打印服务地址，这是正常的。AI 工具会自动拉起进程。

启动后会打印：

```
🚀 AI 代码生成引擎已启动
📍 服务地址: http://127.0.0.1:7331/mcp
💚 健康检查: http://127.0.0.1:7331/health
```

### 3. 配置 AI 工具

在通义灵码或其他 AI 工具中添加 MCP 服务：

- **类型**：Streamable HTTP
- **服务地址**：`http://127.0.0.1:7331/mcp`

---

## 🛠️ MCP 工具

详细工具文档请查看：[📖 MCP-TOOLS.md](./MCP-TOOLS.md)


---

## 📄 相关文档

- [📖 MCP-TOOLS.md](./MCP-TOOLS.md) - 完整工具文档
- [📝 OPTIMIZATION-LOG.md](./OPTIMIZATION-LOG.md) - 优化日志
- [📋 rules/ai-fe-code-std.md](./rules/ai-fe-code-std.md) - 代码生成规范

---

**🎉 享受智能代码生成的乐趣！**

