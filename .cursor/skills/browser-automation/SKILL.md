---
name: browser-automation
description: 使用MCP浏览器自动化工具进行前端测试和网页交互。当用户需要测试前端页面、自动化网页操作、验证UI交互、截图对比、或询问如何使用浏览器MCP工具时使用此skill。
---

# Browser Automation MCP Skill

使用 `cursor-ide-browser` 和 `cursor-browser-extension` MCP服务器进行浏览器自动化操作。

## 可用的MCP服务器

| 服务器 | 用途 | 推荐场景 |
|--------|------|----------|
| `cursor-ide-browser` | IDE内置浏览器 | 开发测试、自动化验证 |
| `cursor-browser-extension` | 浏览器扩展 | 前端/webapp开发测试 |

## 核心工具列表

### 页面导航与标签管理

| 工具名 | 功能 | 关键参数 |
|--------|------|----------|
| `browser_navigate` | 导航到指定URL | `url` |
| `browser_tabs` | 管理标签页（list/create/close） | `action` |

### 页面交互

| 工具名 | 功能 | 关键参数 |
|--------|------|----------|
| `browser_snapshot` | 获取页面快照和元素refs | 无 |
| `browser_click` | 点击元素 | `ref` (从snapshot获取) |
| `browser_type` | 追加输入文本 | `ref`, `text` |
| `browser_fill` | 清空并填充文本 | `ref`, `text` |
| `browser_scroll` | 滚动页面 | `ref`, `scrollIntoView` |
| `browser_hover` | 悬停元素 | `ref` |

### 锁定与等待

| 工具名 | 功能 | 说明 |
|--------|------|------|
| `browser_lock` | 锁定浏览器 | 交互前必须调用 |
| `browser_unlock` | 解锁浏览器 | 完成所有操作后调用 |
| `browser_wait` | 等待指定时间 | 用于页面加载 |
| `browser_handle_dialog` | 处理对话框 | alert/confirm/prompt |

---

## 关键工作流程

### 标准操作流程

```
1. browser_tabs(action: "list")    → 检查现有标签
2. browser_navigate(url: "...")     → 导航到目标页面
3. browser_lock()                   → 锁定浏览器
4. browser_snapshot()               → 获取页面结构
5. browser_click/type/fill(...)     → 执行交互
6. browser_unlock()                 → 解锁浏览器
```

### 锁定/解锁规则

**关键约束**：
- `browser_lock` **必须在** `browser_navigate` 之后调用（需要已存在的标签页）
- 如果标签页已存在，先 `browser_lock` 再进行交互
- `browser_unlock` 在**所有操作完成后**才调用
- 每轮对话只解锁一次

### 等待策略

**推荐**：使用短间隔增量等待，而非单次长等待

```
✅ 正确方式：
wait 2s → snapshot → 检查是否就绪 → 未就绪则再 wait 2s → snapshot

❌ 错误方式：
wait 10s（总是等待最长时间）
```

---

## 常用场景

### 场景1：验证页面UI

```javascript
// Step 1: 打开页面
CallMcpTool("cursor-ide-browser", "browser_navigate", { url: "http://localhost:3000" })

// Step 2: 锁定
CallMcpTool("cursor-ide-browser", "browser_lock", {})

// Step 3: 获取快照检查页面结构
CallMcpTool("cursor-ide-browser", "browser_snapshot", {})

// Step 4: 解锁
CallMcpTool("cursor-ide-browser", "browser_unlock", {})
```

### 场景2：表单填写测试

```javascript
// 导航并锁定
browser_navigate → browser_lock → browser_snapshot

// 填写表单（使用snapshot中的ref）
browser_fill({ ref: "input-username", text: "testuser" })
browser_fill({ ref: "input-password", text: "password123" })
browser_click({ ref: "btn-submit" })

// 等待响应并验证
browser_wait({ time: 2000 })
browser_snapshot  // 验证结果

// 完成后解锁
browser_unlock
```

### 场景3：处理对话框

```javascript
// 对于 confirm() 返回 Cancel
browser_handle_dialog({ accept: false })  // 在触发操作之前调用
browser_click({ ref: "btn-delete" })

// 对于 prompt() 输入自定义值
browser_handle_dialog({ promptText: "custom input" })
browser_click({ ref: "btn-prompt" })
```

---

## 注意事项

### 限制

1. **Iframe 不可访问** - 只能交互 iframe 外部的元素
2. **需要已有标签页** - `browser_lock` 前必须有标签页存在
3. **元素遮挡** - 使用 `browser_scroll({ scrollIntoView: true })` 滚动到可见区域

### browser_type vs browser_fill

| 工具 | 行为 | 使用场景 |
|------|------|----------|
| `browser_type` | 追加文本 | 在现有内容后添加 |
| `browser_fill` | 清空后填充 | 替换全部内容，也支持 contenteditable |

### 对话框自动处理

- `confirm()` 默认返回 `true`
- `prompt()` 默认返回默认值
- 需要自定义响应时，**在触发操作之前**调用 `browser_handle_dialog`

---

## 工具调用示例

### 使用 CallMcpTool 调用

```javascript
// 导航到页面
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_navigate",
  arguments: { url: "http://localhost:3000/login" }
})

// 锁定浏览器
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_lock",
  arguments: {}
})

// 获取页面快照
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_snapshot",
  arguments: {}
})

// 点击按钮
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_click",
  arguments: { ref: "button-login" }
})

// 解锁浏览器
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_unlock",
  arguments: {}
})
```

---

## 完整测试流程模板

```
任务：测试登录页面功能

步骤：
1. [ ] 检查现有标签 (browser_tabs list)
2. [ ] 导航到登录页 (browser_navigate)
3. [ ] 锁定浏览器 (browser_lock)
4. [ ] 获取页面快照 (browser_snapshot)
5. [ ] 填写用户名 (browser_fill)
6. [ ] 填写密码 (browser_fill)
7. [ ] 点击登录按钮 (browser_click)
8. [ ] 等待响应 (browser_wait 2s)
9. [ ] 获取结果快照 (browser_snapshot)
10. [ ] 验证登录成功
11. [ ] 解锁浏览器 (browser_unlock)
```

---

## 故障排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| lock 失败 | 没有标签页 | 先调用 browser_navigate |
| 元素找不到 | ref 过期 | 重新调用 browser_snapshot |
| 点击无效 | 元素被遮挡 | 先 browser_scroll scrollIntoView |
| 页面未加载 | 等待不足 | 使用增量等待策略 |

---

## 更多资源

- 需要**工具详细参数**，请参考 [tools-reference.md](tools-reference.md)
- 需要**完整使用示例**（登录测试、CRUD测试、表单验证等），请参考 [examples.md](examples.md)
