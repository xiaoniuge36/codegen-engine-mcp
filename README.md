# 🚀 AI 代码生成引擎 (AI CodeGen Engine)

> **v2.0.0** - 模块化重构版本

智能前端代码生成服务 - 通过模板匹配、组件库知识图谱和示例代码，将代码可用度从 70% 提升至 80%。

---

## 📋 核心功能

### 1️⃣ 模板智能匹配
- 支持一句话需求自动匹配最合适的模板
- 支持明确模板ID与自然语言混合输入
- 智能关键词打分算法

### 2️⃣ 组件库知识图谱 🆕
- **通用组件库**：Ant Design Pro、Element Plus 等
- **业务组件库**：项目特定的自定义组件
- 自动注入到生成上下文中

### 3️⃣ 示例代码自动附加 🆕
- 为每个模板提供完整的示例代码
- hooks 示例、组件示例、类型示例
- AI 学习真实项目代码风格

### 4️⃣ 规范文档检索 🆕
- **规则文件已内置**：`rules/ai-fe-code-std.md` 集成在 MCP 中
- 用户无需手动添加规则文件，直接调用即可
- 支持 `get_spec_content` 获取规则内容
- 支持 `search_spec` 关键字精确定位

### 5️⃣ 增强版提示词生成 🆕
- 自动组装：提示词骨架 + 组件库知识 + 示例代码 + 规范文档
- 提升代码可用度至 **80%**

---

## 🏗️ 架构设计

```
用户输入（一句话需求/模板ID）
    ↓
AI 代码生成引擎
    ├── 模板智能匹配
    ├── 组件库知识图谱注入
    ├── 示例代码自动附加
    └── 规范文档检索
    ↓
增强版提示词（包含完整上下文）
    ↓
AI 生成代码（可用度 80%）
```

---

## 📁 目录结构

```
codegen-engine/
├── src/                          # v2.0 模块化源码
│   ├── index.js                  # 统一导出入口
│   ├── server.js                 # MCP 服务器（STDIO 模式）
│   ├── server-http.js            # HTTP 服务器
│   ├── utils/                    # 工具函数
│   │   ├── logger.js             # 日志工具
│   │   ├── file.js               # 文件操作
│   │   └── config.js             # 配置常量
│   ├── spec/                     # 规范文档相关
│   ├── matching/                 # 模板匹配相关
│   │   ├── tech-stack.js         # 技术栈检测
│   │   ├── matcher.js            # 模板匹配
│   │   └── knowledge.js          # 知识库/示例
│   ├── types/                    # 类型检查
│   └── tools/                    # MCP 工具
│       ├── definitions.js        # 工具定义
│       ├── handlers.js           # 工具处理器
│       ├── prompts.js            # 提示词构建
│       └── context.js            # 上下文生成
├── rules/                        # 规则文件（内置）
│   └── ai-fe-code-std.md
├── knowledge/                    # 组件库知识图谱
│   ├── common/
│   └── business/
└── templates/                    # 模板数据
    ├── template-registry.json
    └── examples/
```

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

## 🛠️ 可用工具

### 1. `list_templates`
列出所有可用模板

### 2. `get_template`
根据模板 ID 获取模板详情

**参数**：
- `id`: 模板 ID（如 `react-standard-list-crud`）

### 3. `match_template`
根据需求匹配最合适的模板

**参数**：
- `text`: 需求描述或模板ID
- `topK`: 返回前K个匹配结果（默认3）

**示例**：
```json
{
  "text": "做一个员工列表页，支持搜索、新增、编辑、删除"
}
```

### 4. `build_prompt` 🆕 增强版
构建增强版提示词（自动附加组件库知识和示例代码）

**参数**：
- `text`: 用户输入
- `templateId`: 可选的明确模板ID

**返回**：
```json
{
  "templateId": "react-standard-list-crud",
  "templateName": "React 标准列表页",
  "prompt": "任务标准：...",
  "enhancedContext": {
    "componentKnowledge": {
      "ant-design-pro": "# Ant Design Pro Components 知识图谱\n..."
    },
    "codeExamples": {
      "hooks.example.ts": "...",
      "index.example.tsx": "..."
    },
    "specPath": "/path/to/ai-fe-code-std.md"
  }
}
```

### 5. `get_component_knowledge` 🆕
获取组件库知识图谱

**参数**：
- `scope`: `common` 或 `business`
- `projectId`: 业务组件库的项目ID（scope=business时必填）

### 6. `get_code_examples` 🆕
获取模板的示例代码

**参数**：
- `templateId`: 模板ID

### 7. `search_spec`
在规范文档中搜索关键字

**参数**：
- `query`: 搜索关键字
- `maxResults`: 最多返回结果数（默认10）

---

## 📝 使用示例

### 场景1：标准列表页开发

**用户输入**：
```
做一个员工列表页，支持姓名搜索、新增、编辑、删除
```

**AI 工具调用**：
1. `match_template` → 匹配到 `react-standard-list-crud`
2. `build_prompt` → 生成增强版提示词（自动附加 Ant Design Pro 知识图谱和示例代码）
3. AI 根据增强上下文生成代码

**代码可用度**：**80%** ✨

---

### 场景2：非标详情页开发

**用户输入**：
```
react-nonstandard-detail 做一个出差申请单详情页，包含基础信息、差旅信息、附件预览、流程信息
```

**AI 工具调用**：
1. `build_prompt` → 识别明确模板ID `react-nonstandard-detail`
2. 自动附加：
   - Ant Design Pro 知识图谱
   - 详情页示例代码（hooks + 组件）
   - 规范文档路径
3. AI 生成代码

**代码可用度**：**80%** ✨

---

## 🆕 新增功能说明

### 组件库知识图谱

**位置**：`knowledge/common/ant-design-pro.md`

**内容示例**：
```markdown
# Ant Design Pro Components 知识图谱

## ProTable - 高级表格

### 必需属性
- columns: ProColumns<T>[]
- request: (params) => Promise<{data, total, success}>
- rowKey: string

### 常用配置
...
```

**作用**：
- AI 学习组件的正确使用方式
- 避免常见错误（如 request 返回值格式错误）
- 提升代码质量

---

### 示例代码库

**位置**：`templates/examples/react-standard-list/`

**文件结构**：
```
react-standard-list/
├── sample.md                # 示例说明文档
├── hooks.example.ts         # Hooks 示例
├── index.example.tsx        # 主文件示例
└── components/
    └── EditModal.example.tsx  # 子组件示例
```

**作用**：
- AI 模仿真实项目代码风格
- 学习正确的代码结构和最佳实践
- 提升代码可用度

---

## 📊 效果对比

| 方案 | 代码可用度 | 使用成本 | 维护成本 |
|------|-----------|---------|---------|
| 纯提示词 | 40% | 高 | 低 |
| 提示词 + Rule | 70% | 中 | 中 |
| **增强版引擎** | **80%** ✨ | **低** | **中** |

---

## 🔧 开发指南

### 添加新模板

1. 在 `templates/template-registry.json` 中注册模板
2. 在 `templates/examples/[template-id]/` 创建示例代码
3. 更新 `server.js` 中的 `promptSkeletonByKey` 函数

### 添加组件库知识

1. 在 `knowledge/common/` 创建 `[library-name].md`
2. 按照统一格式编写组件使用说明
3. 重启服务即可生效

### 添加业务组件库

1. 在 `knowledge/business/[project-id]/` 创建目录
2. 添加自定义组件的 markdown 文档
3. 调用 `get_component_knowledge` 时指定 `scope=business` 和 `projectId`

---

## 📖 日志说明

所有工具调用都会记录详细日志（输出到 stderr，不影响 STDIO 协议）：

```
[2025-01-19T10:30:45.123Z] [INFO] [match_template] 开始匹配模板 {"text":"做一个员工列表页","topK":3}
[2025-01-19T10:30:45.234Z] [INFO] [match_template] 匹配完成，选中模板: React 标准列表页
[2025-01-19T10:30:45.345Z] [INFO] [build_prompt] 构建提示词 {"templateId":"react-standard-list-crud"}
[2025-01-19T10:30:45.456Z] [INFO] [getComponentKnowledge] 找到 2 个通用组件库文件
[2025-01-19T10:30:45.567Z] [INFO] [getCodeExamples] 成功读取 3 个示例文件
[2025-01-19T10:30:45.678Z] [INFO] [buildEnhancedPrompt] 增强版提示词构建完成
```

---

## 🎯 最佳实践

### 1. 保持本地规范配置
继续在项目中配置 `.lingma/rules/ai-fe-code-std.md`，作为基础约束。

### 2. 使用 MCP 降本提效
通过 MCP 自动匹配模板、注入知识图谱和示例代码。

### 3. 定期更新示例代码
将项目中优秀的代码片段整理成示例，持续提升生成质量。

### 4. 团队共享知识图谱
将常用组件库的使用规范整理成 markdown，团队共享。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT

---

## 🔗 相关资源

- [AI前端代码生成执行规范](../AI前端代码生成执行规范（含vue、规范、完整版）.md)
- [参考博客：仅凭几张图片生成 70% 可用代码](../参考博客-仅凭几张图片，我们是如何让 AI 自动生成 70% 可用前端代码的.md)
- [MCP 协议文档](https://github.com/modelcontextprotocol/specification)

---

**🎉 享受智能代码生成的乐趣！**

