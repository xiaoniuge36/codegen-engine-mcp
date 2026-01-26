# Browser MCP Tools 详细参考

## browser_navigate

导航到指定URL。

**参数**：
```json
{
  "url": "string"  // 必填，完整URL
}
```

**示例**：
```json
{ "url": "http://localhost:3000" }
{ "url": "https://example.com/login" }
```

---

## browser_tabs

管理浏览器标签页。

**参数**：
```json
{
  "action": "list" | "create" | "close",
  "tabId": "string"  // close 时需要
}
```

**示例**：
```json
{ "action": "list" }
{ "action": "create" }
{ "action": "close", "tabId": "tab-123" }
```

---

## browser_snapshot

获取当前页面的结构快照，返回所有可交互元素的 refs。

**参数**：无

**返回内容**：
- 页面结构
- 元素 refs（用于后续交互）
- 元素类型和属性

---

## browser_click

点击指定元素。

**参数**：
```json
{
  "ref": "string"  // 从 snapshot 获取的元素引用
}
```

---

## browser_type

在元素中追加输入文本（不清空现有内容）。

**参数**：
```json
{
  "ref": "string",
  "text": "string"
}
```

---

## browser_fill

清空元素内容并填充新文本。适用于 input、textarea 和 contenteditable 元素。

**参数**：
```json
{
  "ref": "string",
  "text": "string"
}
```

---

## browser_scroll

滚动页面或将元素滚动到可见区域。

**参数**：
```json
{
  "ref": "string",           // 可选，目标元素
  "scrollIntoView": true,    // 滚动元素到可见区域
  "direction": "up" | "down" // 或指定方向
}
```

**使用场景**：
- 元素被遮挡时，先滚动再点击
- 嵌套滚动容器中的元素

---

## browser_hover

悬停在指定元素上。

**参数**：
```json
{
  "ref": "string"
}
```

---

## browser_lock

锁定浏览器进行自动化操作。

**参数**：无

**前置条件**：
- 必须有已存在的标签页
- 通常在 browser_navigate 之后调用

---

## browser_unlock

解锁浏览器，完成自动化操作。

**参数**：无

**调用时机**：
- 当前轮次所有浏览器操作完成后
- 每轮对话只调用一次

---

## browser_wait

等待指定时间。

**参数**：
```json
{
  "time": 2000  // 毫秒
}
```

**最佳实践**：
- 使用短间隔（1-3秒）配合 snapshot 检查
- 避免单次长时间等待

---

## browser_handle_dialog

处理浏览器原生对话框（alert/confirm/prompt）。

**参数**：
```json
{
  "accept": true | false,     // confirm 对话框的响应
  "promptText": "string"      // prompt 对话框的输入值
}
```

**重要**：必须在触发对话框的操作**之前**调用。

**示例**：
```json
// 点击取消按钮
{ "accept": false }

// 输入自定义值
{ "promptText": "my custom input" }
```

---

## 工具调用顺序图

```
开始测试
    │
    ▼
browser_tabs(list) ─── 检查现有标签
    │
    ▼
browser_navigate ───── 打开目标页面
    │
    ▼
browser_lock ───────── 锁定浏览器
    │
    ▼
browser_snapshot ───── 获取页面结构
    │
    ├── browser_fill ─── 填写表单
    ├── browser_click ── 点击按钮
    ├── browser_wait ─── 等待响应
    └── browser_snapshot 验证结果
    │
    ▼
browser_unlock ─────── 解锁浏览器
    │
    ▼
完成测试
```

---

## 常见错误处理

### Error: No browser tab exists

**原因**：在没有标签页的情况下调用 browser_lock

**解决**：先调用 browser_navigate 创建标签页

### Error: Element ref not found

**原因**：使用了过期的元素引用

**解决**：重新调用 browser_snapshot 获取最新的 refs

### Error: Element is obscured

**原因**：目标元素被其他元素遮挡

**解决**：
```json
// 先滚动到可见
browser_scroll({ "ref": "target-element", "scrollIntoView": true })
// 再点击
browser_click({ "ref": "target-element" })
```

### 页面加载不完全

**原因**：等待时间不足

**解决**：使用增量等待
```
browser_wait(2000) → browser_snapshot → 检查 → 未完成 → browser_wait(2000) → ...
```
