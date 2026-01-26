# AI 代码生成体系概念指南

本文档说明 Rule（规则）、Knowledge（知识库）、MCP、Skill 之间的区别与联系。

---

## 概念总览

| 概念 | 定位 | 作用 | 存储位置 |
|------|------|------|----------|
| **Rule** | 约束层 | 约束 AI 行为和代码风格 | `.cursor/rules/` 或项目根目录 |
| **Knowledge** | 知识层 | 提供领域知识和最佳实践 | `knowledge/` 目录 |
| **MCP** | 工具层 | 提供可调用的工具能力 | MCP 服务器 |
| **Skill** | 指导层 | 指导 AI 完成特定任务 | `.cursor/skills/` |

---

## 一、Rule（规则）

### 定义

Rule 是**约束 AI 行为的规范文件**，告诉 AI "什么该做、什么不该做"。

### 特点

- **被动生效**：AI 会自动读取并遵守
- **全局约束**：影响整个代码生成过程
- **风格规范**：定义代码风格、命名规则、目录结构等

### 示例

```markdown
# ai-fe-code-std.md

## 核心规则

1. hooks 优先原则
   - 必须先生成 hooks 文件
   - 再生成组件文件

2. 禁止 mock 数据
   - 不要生成任何假数据
   - 接口数据以类型文件为准

3. 全局类型不要 import
   - 检查 global.d.ts 中的类型
   - 这些类型是全局声明的
```

### 存储位置

```
项目根目录/
├── .cursor/rules/
│   └── project-rules.md
├── .lingma/rules/
│   └── ai-fe-code-std.md
└── ai-fe-code-std.md
```

### 使用场景

- 统一团队代码风格
- 约束 AI 生成代码的质量
- 定义项目特定的规范

---

## 二、Knowledge（知识库）

### 定义

Knowledge 是**领域知识和最佳实践的集合**，告诉 AI "如何更好地做"。

### 特点

- **参考资料**：提供组件库用法、API 说明等
- **最佳实践**：包含经过验证的代码模式
- **可扩展**：可以不断积累和完善

### 示例

```markdown
# ant-design-pro.md

## ProTable 使用指南

### 基本用法
ProTable 是 Ant Design Pro 的高级表格组件...

### columns 配置
| 属性 | 说明 | 类型 |
|------|------|------|
| title | 列标题 | string |
| dataIndex | 数据字段 | string |
| valueType | 值类型 | string |

### 最佳实践
1. 使用 request 而不是 dataSource
2. 配置 rowKey 避免警告
3. 使用 actionRef 控制刷新
```

### 存储位置

```
codegen-engine/
└── knowledge/
    ├── common/                    # 通用组件库知识
    │   ├── ant-design-pro.md
    │   ├── element-plus.md
    │   ├── element-ui.md
    │   └── vant-components.md
    └── business/                  # 业务组件库知识
        └── [project-id]/
```

### 使用场景

- 组件库使用指南
- API 文档快速参考
- 业务领域知识积累

---

## 三、MCP（Model Context Protocol）

### 定义

MCP 是**提供可调用工具的服务**，让 AI 能够执行实际操作。

### 特点

- **工具提供者**：定义可调用的工具列表
- **实际执行**：真正执行检测、匹配、验证等操作
- **标准协议**：遵循 MCP 协议规范

### 工具示例

```javascript
// codegen-engine MCP 提供的工具
const TOOLS = [
  'quick_generate',        // 一键快速生成
  'detect_tech_stack',     // 检测技术栈
  'check_global_types',    // 检查全局类型
  'smart_match_template',  // 智能匹配模板
  'get_code_examples',     // 获取示例代码
  'check_code_compliance', // 检查代码规范
  'validate_code',         // TSC/ESLint 验证
];
```

### 配置方式

```json
{
  "mcpServers": {
    "codegen-engine": {
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

### 使用场景

- 项目技术栈检测
- 模板智能匹配
- 代码规范验证
- 知识库查询

---

## 四、Skill（技能）

### 定义

Skill 是**指导 AI 完成特定任务的文档**，告诉 AI "按什么步骤做"。

### 特点

- **任务导向**：针对特定类型的任务
- **步骤指导**：定义完成任务的流程
- **工具整合**：指导如何调用 MCP 工具

### 示例

```markdown
# SKILL.md

## 标准代码生成流程

1. 调用 quick_generate 获取上下文
2. 根据返回结果生成代码（先 hooks 后组件）
3. 调用 check_code_compliance 检查规范

## 触发关键词

- "做一个列表页"
- "生成代码"
- "创建组件"
```

### 存储位置

```
.cursor/skills/
├── codegen-engine/
│   ├── SKILL.md           # 主技能文档
│   ├── README.md          # 快速入门
│   ├── examples.md        # 使用示例
│   └── tools-reference.md # 工具参考
└── browser-automation/
    └── SKILL.md
```

### 使用场景

- 指导 AI 完成代码生成任务
- 定义 MCP 工具调用流程
- 提供任务执行的最佳实践

---

## 五、四者的关系

### 层次关系图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户需求                              │
│                    "做一个员工列表页"                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Skill（指导层）                          │
│                                                             │
│  匹配关键词 → 读取 SKILL.md → 指导 AI 按步骤执行              │
│                                                             │
│  "先调用 quick_generate，再生成代码，最后检查规范"            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MCP（工具层）                           │
│                                                             │
│  quick_generate() → detect_tech_stack()                     │
│  smart_match_template() → get_code_examples()               │
│  check_code_compliance() → validate_code()                  │
│                                                             │
│  返回：技术栈、模板、示例代码、知识库内容                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Knowledge（知识层）     │    │     Rule（约束层）        │
│                          │    │                          │
│  - 组件库使用指南         │    │  - hooks 优先原则        │
│  - API 最佳实践           │    │  - 禁止 mock 数据        │
│  - 示例代码模板           │    │  - 全局类型不 import     │
│                          │    │  - 目录结构规范          │
└──────────────────────────┘    └──────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        生成代码                              │
│                                                             │
│  hooks/useTableData.ts → types.ts → index.tsx               │
└─────────────────────────────────────────────────────────────┘
```

### 协作流程

```
1. 用户输入需求
        ↓
2. AI 匹配 Skill（根据 description 关键词）
        ↓
3. AI 读取 SKILL.md（获取任务执行步骤）
        ↓
4. AI 调用 MCP 工具（quick_generate 等）
        ↓
5. MCP 返回数据（包含 Knowledge 中的知识）
        ↓
6. AI 生成代码（遵循 Rule 约束）
        ↓
7. AI 调用 MCP 检查（check_code_compliance）
        ↓
8. 输出最终代码
```

---

## 六、对比总结

### 功能对比

| 维度 | Rule | Knowledge | MCP | Skill |
|------|------|-----------|-----|-------|
| **核心功能** | 约束行为 | 提供知识 | 提供工具 | 指导流程 |
| **生效方式** | 被动遵守 | 按需查询 | 主动调用 | 自动匹配 |
| **作用范围** | 全局 | 特定领域 | 特定功能 | 特定任务 |
| **可编程性** | 否 | 否 | 是 | 否 |
| **动态性** | 静态 | 静态 | 动态 | 静态 |

### 类比理解

| 概念 | 类比 |
|------|------|
| **Rule** | 公司规章制度（必须遵守的规范） |
| **Knowledge** | 培训手册（学习参考资料） |
| **MCP** | 工具箱（提供各种可用工具） |
| **Skill** | 操作指南（完成任务的步骤说明） |

### 依赖关系

```
Skill 依赖 → MCP（调用工具）
MCP 依赖 → Knowledge（返回知识）
AI 遵守 → Rule（生成代码时）
```

---

## 七、最佳实践

### 1. Rule 编写建议

- 规则要具体、可执行
- 避免模糊描述
- 优先级要明确（P0/P1/P2）

### 2. Knowledge 维护建议

- 保持内容更新
- 包含实际可用的代码示例
- 按组件/功能分类组织

### 3. MCP 工具设计建议

- 工具功能要单一
- 返回结构要清晰
- 错误处理要完善

### 4. Skill 编写建议

- description 关键词要准确
- 步骤要清晰完整
- 包含常见场景示例

---

## 八、本项目结构

```
codegen-engine/
├── rules/                         # Rule - 规则文件
│   └── ai-fe-code-std.md
├── knowledge/                     # Knowledge - 知识库
│   └── common/
│       ├── ant-design-pro.md
│       ├── element-plus.md
│       └── ...
├── src/                           # MCP - 服务源码
│   ├── server.js
│   └── tools/
│       ├── definitions.js
│       └── handlers.js
├── templates/                     # Knowledge - 模板示例
│   └── examples/
│       ├── react-standard-list-crud/
│       └── ...
└── .cursor/skills/                # Skill - 技能文档
    ├── codegen-engine/
    │   └── SKILL.md
    └── browser-automation/
        └── SKILL.md
```

---

## 相关文档

- [SKILL-MCP-GUIDE.md](./SKILL-MCP-GUIDE.md) - Skill 与 MCP 关系详解
- [MCP-TOOLS.md](./MCP-TOOLS.md) - MCP 工具完整文档
- [rules/ai-fe-code-std.md](./rules/ai-fe-code-std.md) - 代码生成规范
