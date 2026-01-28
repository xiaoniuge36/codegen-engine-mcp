---
name: code-review
description: 代码审查技能。当用户需要审查代码、检查代码质量、发现潜在问题、评估代码规范、或询问如何改进代码时使用此skill。
---

# Code Review Skill

代码审查指导，帮助 AI 完成代码质量检查、潜在问题发现、性能优化建议、安全漏洞识别等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🔍 规范检查 | 代码风格、命名规范、目录结构 |
| 🐛 Bug 发现 | 潜在 bug、边界情况、异常处理 |
| ⚡ 性能分析 | 性能瓶颈、渲染优化、内存泄漏 |
| 🔒 安全审查 | XSS、敏感信息、权限校验 |
| 📐 架构评估 | 组件设计、代码复用、可维护性 |

---

## 审查流程

### 标准审查流程

```
1. 理解变更目的        → 阅读 PR 描述、commit 信息
2. 检查代码规范        → 命名、格式、注释
3. 审查业务逻辑        → 正确性、边界情况
4. 检查性能问题        → 渲染、请求、内存
5. 审查安全风险        → XSS、敏感数据
6. 评估可维护性        → 复杂度、可测试性
7. 输出审查报告        → 问题分类、优先级
```

### 审查报告模板

```markdown
## 代码审查报告

### 📊 概览
- 文件数：X 个
- 问题数：X 个（严重 X / 警告 X / 建议 X）

### 🔴 严重问题（必须修复）
1. [文件名:行号] 问题描述
   - 原因：...
   - 建议：...

### 🟡 警告问题（建议修复）
1. [文件名:行号] 问题描述
   - 建议：...

### 🔵 优化建议（可选改进）
1. [文件名:行号] 建议描述

### ✅ 亮点
- 做得好的地方
```

---

## 审查清单

### 1. 代码规范检查

| 检查项 | 说明 | 严重程度 |
|--------|------|----------|
| 命名规范 | 变量/函数/组件命名是否清晰 | 警告 |
| 代码格式 | 缩进、空格、换行是否一致 | 建议 |
| 注释完整 | 复杂逻辑是否有注释说明 | 建议 |
| 类型定义 | TypeScript 类型是否完整 | 警告 |
| 文件组织 | 目录结构是否合理 | 建议 |

```typescript
// ❌ 不规范的命名
const d = new Date();
const fn = (x) => x * 2;
function handleClick() { /* 处理搜索 */ }

// ✅ 规范的命名
const currentDate = new Date();
const double = (value: number) => value * 2;
function handleSearch() { /* 处理搜索 */ }
```

### 2. 业务逻辑审查

| 检查项 | 说明 | 严重程度 |
|--------|------|----------|
| 边界条件 | 空值、零值、极值处理 | 严重 |
| 错误处理 | try-catch、错误提示 | 严重 |
| 异步处理 | Promise 错误、竞态条件 | 严重 |
| 状态管理 | 状态更新的正确性 | 警告 |
| 数据校验 | 输入数据的有效性检查 | 警告 |

```typescript
// ❌ 缺少边界处理
function getUserName(user) {
  return user.name.toUpperCase();
}

// ✅ 完善的边界处理
function getUserName(user: User | null): string {
  if (!user?.name) {
    return '';
  }
  return user.name.toUpperCase();
}
```

### 3. 性能问题检查

| 检查项 | 说明 | 严重程度 |
|--------|------|----------|
| 不必要渲染 | 组件无效 re-render | 警告 |
| 内存泄漏 | 事件监听未清理 | 严重 |
| 大数据处理 | 大数组/对象操作 | 警告 |
| 重复请求 | 相同请求未缓存 | 警告 |
| Bundle 大小 | 不必要的依赖引入 | 建议 |

```typescript
// ❌ 性能问题
function UserList({ users }) {
  // 每次渲染都创建新函数和新对象
  const handleClick = (id) => console.log(id);
  const style = { color: 'red' };
  
  return users.map(user => (
    <div key={user.id} style={style} onClick={() => handleClick(user.id)}>
      {user.name}
    </div>
  ));
}

// ✅ 优化后
const style = { color: 'red' }; // 提升到组件外

function UserList({ users }) {
  const handleClick = useCallback((id: number) => {
    console.log(id);
  }, []);

  return users.map(user => (
    <UserItem key={user.id} user={user} onClick={handleClick} />
  ));
}

const UserItem = memo(({ user, onClick }) => (
  <div style={style} onClick={() => onClick(user.id)}>
    {user.name}
  </div>
));
```

### 4. 安全问题检查

| 检查项 | 说明 | 严重程度 |
|--------|------|----------|
| XSS 风险 | dangerouslySetInnerHTML、v-html | 严重 |
| 敏感信息 | 密码、token 暴露 | 严重 |
| SQL 注入 | 动态拼接 SQL | 严重 |
| CSRF | 跨站请求伪造 | 严重 |
| 权限校验 | 前端权限绕过 | 警告 |

```typescript
// ❌ XSS 风险
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 安全处理
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ❌ 敏感信息暴露
const API_KEY = 'sk-xxxxx'; // 硬编码在前端

// ✅ 使用环境变量（仅限公开 key）
const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY;
```

### 5. React 特定检查

| 检查项 | 说明 | 严重程度 |
|--------|------|----------|
| Hooks 规则 | 条件调用 hooks | 严重 |
| Key 属性 | 列表 key 不合理 | 警告 |
| 依赖数组 | useEffect 依赖不完整 | 警告 |
| 状态更新 | 异步更新竞态 | 警告 |
| Ref 使用 | 直接操作 DOM | 建议 |

```typescript
// ❌ Hooks 规则违反
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(false); // 条件调用
  }
}

// ❌ 依赖不完整
useEffect(() => {
  fetchData(userId);
}, []); // 缺少 userId 依赖

// ✅ 正确写法
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 6. Vue 特定检查

| 检查项 | 说明 | 严重程度 |
|--------|------|----------|
| 响应式丢失 | 解构 reactive 对象 | 严重 |
| v-for key | key 使用 index | 警告 |
| 双向绑定 | v-model 滥用 | 建议 |
| 组件通信 | props 直接修改 | 严重 |
| 生命周期 | onUnmounted 清理 | 警告 |

```typescript
// ❌ 响应式丢失
const state = reactive({ count: 0 });
const { count } = state; // count 不再是响应式

// ✅ 保持响应式
const state = reactive({ count: 0 });
const count = toRef(state, 'count');
// 或使用 ref
const count = ref(0);

// ❌ 修改 props
const props = defineProps<{ value: string }>();
props.value = 'new'; // 错误！

// ✅ 使用 emit
const emit = defineEmits<{ (e: 'update:value', v: string): void }>();
emit('update:value', 'new');
```

---

## 常见问题模式

### 问题模式速查

| 模式 | 问题 | 解决方案 |
|------|------|----------|
| 魔法数字 | 硬编码数字 | 定义常量 |
| 过长函数 | 函数超过50行 | 拆分函数 |
| 深层嵌套 | if/else 超过3层 | 提前返回 |
| 重复代码 | 相同逻辑多处出现 | 抽取函数 |
| 过大组件 | 组件超过300行 | 拆分组件 |
| Props Drilling | 多层传递props | Context/Store |

### 审查评语模板

```markdown
// 严重问题
🔴 **[严重]** 这里存在内存泄漏风险，useEffect 中的事件监听未在清理函数中移除。
建议：添加 cleanup 函数移除监听器。

// 警告问题
🟡 **[警告]** useEffect 依赖数组缺少 `userId`，可能导致数据不同步。
建议：将 `userId` 添加到依赖数组中。

// 优化建议
🔵 **[建议]** 这个函数可以抽取为自定义 hook，提高复用性。

// 肯定反馈
✅ **[亮点]** 错误处理做得很完善，考虑了多种边界情况。
```

---

## 自动化检查

### 配合工具使用

| 工具 | 用途 | 检查范围 |
|------|------|----------|
| ESLint | 代码规范 | 语法、规范 |
| TypeScript | 类型检查 | 类型安全 |
| Prettier | 代码格式 | 格式一致性 |
| SonarQube | 代码质量 | 复杂度、重复 |

### MCP 工具集成

如果项目配置了 `codegen-engine` MCP，可以调用：

```javascript
// 检查代码规范
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: ["src/pages/user/index.tsx"]
  }
})

// TSC + ESLint 验证
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

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 代码审查 | "审查代码"、"review代码"、"检查代码" |
| 质量检查 | "代码质量"、"代码问题"、"代码规范" |
| 性能分析 | "性能问题"、"优化代码"、"渲染慢" |
| 安全检查 | "安全问题"、"XSS"、"漏洞" |
| 最佳实践 | "最佳实践"、"改进建议"、"如何改进" |

---

## 注意事项

### 审查原则

```
✅ 审查时应该：
- 保持客观，就事论事
- 提供具体的改进建议
- 区分必须修复和建议优化
- 肯定代码中的亮点

❌ 审查时避免：
- 主观偏好强加于人
- 只批评不给建议
- 忽视上下文和背景
- 吹毛求疵、过度追求完美
```

### 优先级排序

```
修复优先级：
1. 🔴 安全问题 - 立即修复
2. 🔴 严重 Bug - 必须修复
3. 🟡 性能问题 - 建议修复
4. 🟡 代码规范 - 建议修复
5. 🔵 优化建议 - 可选改进
```
