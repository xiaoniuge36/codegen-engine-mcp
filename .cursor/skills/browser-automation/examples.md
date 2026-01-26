# Browser Automation 使用示例

## 示例1：登录功能测试

### 场景

测试用户登录页面，验证登录成功后跳转到首页。

### 步骤

```javascript
// 1. 检查现有标签
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_tabs",
  arguments: { action: "list" }
})

// 2. 导航到登录页
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_navigate",
  arguments: { url: "http://localhost:3000/login" }
})

// 3. 锁定浏览器
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_lock",
  arguments: {}
})

// 4. 获取页面快照
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_snapshot",
  arguments: {}
})
// 返回: { refs: { "input-email": {...}, "input-password": {...}, "btn-login": {...} } }

// 5. 填写邮箱
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_fill",
  arguments: { ref: "input-email", text: "test@example.com" }
})

// 6. 填写密码
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_fill",
  arguments: { ref: "input-password", text: "password123" }
})

// 7. 点击登录按钮
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_click",
  arguments: { ref: "btn-login" }
})

// 8. 等待页面响应
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_wait",
  arguments: { time: 2000 }
})

// 9. 获取结果快照
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_snapshot",
  arguments: {}
})
// 验证: 页面是否跳转到首页，是否显示用户信息

// 10. 解锁浏览器
CallMcpTool({
  server: "cursor-ide-browser",
  toolName: "browser_unlock",
  arguments: {}
})
```

---

## 示例2：列表页CRUD测试

### 场景

测试员工列表页的新增、编辑、删除功能。

### 新增员工

```javascript
// 导航到列表页并锁定
browser_navigate({ url: "http://localhost:3000/employee" })
browser_lock({})
browser_snapshot({})

// 点击新增按钮
browser_click({ ref: "btn-add" })

// 等待弹窗出现
browser_wait({ time: 1000 })
browser_snapshot({})

// 填写表单
browser_fill({ ref: "input-name", text: "张三" })
browser_fill({ ref: "input-phone", text: "13800138000" })
browser_fill({ ref: "input-email", text: "zhangsan@example.com" })

// 点击确定
browser_click({ ref: "btn-modal-ok" })

// 验证新增成功
browser_wait({ time: 2000 })
browser_snapshot({})
// 检查列表中是否有新增的员工

browser_unlock({})
```

### 删除员工（处理确认对话框）

```javascript
browser_navigate({ url: "http://localhost:3000/employee" })
browser_lock({})
browser_snapshot({})

// 在点击删除之前，预设对话框响应
browser_handle_dialog({ accept: true })

// 点击删除按钮
browser_click({ ref: "btn-delete-row-1" })

// 等待删除完成
browser_wait({ time: 2000 })
browser_snapshot({})
// 验证记录已删除

browser_unlock({})
```

---

## 示例3：表单验证测试

### 场景

测试表单必填项和格式验证。

```javascript
browser_navigate({ url: "http://localhost:3000/form" })
browser_lock({})
browser_snapshot({})

// 不填写任何内容，直接提交
browser_click({ ref: "btn-submit" })

// 等待验证提示出现
browser_wait({ time: 500 })
browser_snapshot({})
// 验证: 应该显示必填项错误提示

// 填写无效邮箱
browser_fill({ ref: "input-email", text: "invalid-email" })
browser_click({ ref: "btn-submit" })

browser_wait({ time: 500 })
browser_snapshot({})
// 验证: 应该显示邮箱格式错误提示

// 填写正确格式
browser_fill({ ref: "input-email", text: "valid@example.com" })
browser_fill({ ref: "input-name", text: "Test User" })
browser_click({ ref: "btn-submit" })

browser_wait({ time: 2000 })
browser_snapshot({})
// 验证: 提交成功

browser_unlock({})
```

---

## 示例4：滚动加载测试

### 场景

测试无限滚动加载列表。

```javascript
browser_navigate({ url: "http://localhost:3000/infinite-list" })
browser_lock({})
browser_snapshot({})

// 获取初始列表项数量
// 假设返回 10 条记录

// 滚动到底部
browser_scroll({ direction: "down" })
browser_wait({ time: 1500 })
browser_snapshot({})
// 验证: 应该加载更多记录

// 继续滚动
browser_scroll({ direction: "down" })
browser_wait({ time: 1500 })
browser_snapshot({})
// 验证: 记录数量增加

browser_unlock({})
```

---

## 示例5：Tab切换测试

### 场景

测试页面中的Tab组件切换。

```javascript
browser_navigate({ url: "http://localhost:3000/tabs-page" })
browser_lock({})
browser_snapshot({})

// 验证默认Tab内容
// 假设默认显示 "基本信息" Tab

// 切换到第二个Tab
browser_click({ ref: "tab-details" })
browser_wait({ time: 500 })
browser_snapshot({})
// 验证: 显示 "详细信息" Tab内容

// 切换到第三个Tab
browser_click({ ref: "tab-history" })
browser_wait({ time: 500 })
browser_snapshot({})
// 验证: 显示 "历史记录" Tab内容

browser_unlock({})
```

---

## 示例6：文件上传测试

### 场景

测试文件上传功能（注意：实际文件选择可能需要特殊处理）。

```javascript
browser_navigate({ url: "http://localhost:3000/upload" })
browser_lock({})
browser_snapshot({})

// 点击上传按钮触发文件选择
// 注意：文件选择对话框可能无法通过自动化处理
browser_click({ ref: "btn-upload" })

// 如果页面支持拖拽上传区域点击
browser_snapshot({})
// 检查上传区域状态

browser_unlock({})
```

---

## 示例7：响应式布局测试

### 场景

在不同视口大小下验证页面布局。

```javascript
// 测试桌面布局
browser_navigate({ url: "http://localhost:3000" })
browser_lock({})
browser_snapshot({})
// 验证: 侧边栏可见，内容区域宽度正常

// 可以通过浏览器开发者工具模拟移动端
// 或者访问响应式测试URL

browser_unlock({})
```

---

## 最佳实践总结

### 1. 始终遵循锁定流程

```
navigate → lock → (操作) → unlock
```

### 2. 操作前获取快照

```javascript
// 每次交互前获取最新快照
browser_snapshot({})
// 使用返回的最新 refs
browser_click({ ref: "..." })
```

### 3. 使用增量等待

```javascript
// 推荐
browser_wait({ time: 2000 })
browser_snapshot({})
// 检查是否就绪，未就绪继续等待

// 不推荐
browser_wait({ time: 10000 })  // 总是等待最长时间
```

### 4. 处理对话框提前设置

```javascript
// 先设置对话框响应
browser_handle_dialog({ accept: false })
// 再触发对话框
browser_click({ ref: "btn-delete" })
```

### 5. 滚动到可见再交互

```javascript
browser_scroll({ ref: "target", scrollIntoView: true })
browser_click({ ref: "target" })
```
