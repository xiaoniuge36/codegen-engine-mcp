---
name: accessibility
description: 无障碍访问技能。当用户需要改进无障碍支持、添加ARIA属性、检查可访问性、或询问如何让网页对残障用户友好时使用此skill。
---

# Accessibility Skill

无障碍访问指导，帮助 AI 完成 ARIA 属性添加、键盘导航支持、屏幕阅读器适配等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| ♿ ARIA 属性 | 添加语义化 ARIA 属性 |
| ⌨️ 键盘导航 | 键盘操作支持 |
| 👁️ 视觉辅助 | 对比度、焦点样式 |
| 🔊 屏幕阅读器 | 读屏软件适配 |
| 📋 规范检查 | WCAG 标准检查 |

---

## WCAG 核心原则

### 四大原则

| 原则 | 英文 | 说明 |
|------|------|------|
| 可感知 | Perceivable | 信息可被用户感知 |
| 可操作 | Operable | 界面可被用户操作 |
| 可理解 | Understandable | 内容和操作可被理解 |
| 健壮性 | Robust | 兼容各种辅助技术 |

### 合规级别

| 级别 | 要求 | 适用场景 |
|------|------|----------|
| A | 基本无障碍 | 最低要求 |
| AA | 标准无障碍 | 政府/公共网站要求 |
| AAA | 高级无障碍 | 无障碍专项产品 |

---

## 语义化 HTML

### 使用正确的元素

```html
<!-- ❌ 非语义化 -->
<div class="header">...</div>
<div class="nav">...</div>
<div class="main">...</div>
<div class="footer">...</div>
<div class="button" onclick="...">点击</div>

<!-- ✅ 语义化 -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>
<button onclick="...">点击</button>
```

### 语义化元素对照

| 用途 | 推荐元素 | 避免使用 |
|------|----------|----------|
| 按钮 | `<button>` | `<div onclick>` |
| 链接 | `<a href>` | `<span onclick>` |
| 列表 | `<ul/ol/li>` | `<div>` 嵌套 |
| 表格 | `<table>` | `<div>` 模拟 |
| 表单 | `<form>` | `<div>` 包裹 |
| 标题 | `<h1-h6>` | `<div class="title">` |

---

## ARIA 属性指南

### 常用 ARIA 角色

```html
<!-- 地标角色 -->
<div role="banner">页头</div>
<div role="navigation">导航</div>
<div role="main">主内容</div>
<div role="contentinfo">页脚</div>

<!-- 组件角色 -->
<div role="button">按钮</div>
<div role="dialog">对话框</div>
<div role="tablist">标签列表</div>
<div role="alert">警告提示</div>
```

### 常用 ARIA 属性

| 属性 | 用途 | 示例 |
|------|------|------|
| aria-label | 可访问名称 | `<button aria-label="关闭">×</button>` |
| aria-labelledby | 引用标签 | `<div aria-labelledby="title-id">` |
| aria-describedby | 引用描述 | `<input aria-describedby="hint-id">` |
| aria-hidden | 对读屏隐藏 | `<div aria-hidden="true">装饰</div>` |
| aria-expanded | 展开状态 | `<button aria-expanded="true">` |
| aria-selected | 选中状态 | `<li aria-selected="true">` |
| aria-disabled | 禁用状态 | `<button aria-disabled="true">` |
| aria-live | 动态区域 | `<div aria-live="polite">` |

### ARIA 实践示例

```tsx
// 可访问的下拉菜单
function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown">
      <button
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="选择选项"
        onClick={() => setOpen(!open)}
      >
        {value || '请选择'}
      </button>
      
      {open && (
        <ul
          role="listbox"
          aria-label="选项列表"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              tabIndex={0}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

```tsx
// 可访问的模态框
function Modal({ open, onClose, title, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // 聚焦到模态框
      modalRef.current?.focus();
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <h2 id="modal-title">{title}</h2>
      <div>{children}</div>
      <button onClick={onClose} aria-label="关闭对话框">
        关闭
      </button>
    </div>
  );
}
```

---

## 键盘导航

### 焦点管理

```tsx
// Tab 顺序控制
<button tabIndex={0}>正常 Tab 顺序</button>
<button tabIndex={-1}>可编程聚焦，不在 Tab 序列</button>
<button tabIndex={1}>不推荐使用正数</button>

// 焦点陷阱（Modal 中使用）
function useFocusTrap(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [ref]);
}
```

### 键盘操作标准

| 按键 | 操作 |
|------|------|
| Tab | 移动到下一个可聚焦元素 |
| Shift+Tab | 移动到上一个可聚焦元素 |
| Enter/Space | 激活按钮/链接 |
| Escape | 关闭模态框/下拉菜单 |
| 方向键 | 在列表/菜单中导航 |
| Home/End | 跳到列表首/尾 |

### 键盘操作实现

```tsx
// 列表键盘导航
function useListNavigation<T>(items: T[]) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(items.length - 1);
          break;
      }
    },
    [items.length]
  );

  return { activeIndex, handleKeyDown };
}
```

---

## 视觉无障碍

### 颜色对比度

```css
/* WCAG AA 标准 */
/* 普通文本：对比度 >= 4.5:1 */
/* 大文本(18px+)：对比度 >= 3:1 */

/* ❌ 对比度不足 */
.low-contrast {
  color: #999;
  background: #fff;  /* 对比度约 2.8:1 */
}

/* ✅ 符合标准 */
.good-contrast {
  color: #595959;
  background: #fff;  /* 对比度约 7:1 */
}
```

### 焦点样式

```css
/* ❌ 移除焦点样式 */
button:focus {
  outline: none;
}

/* ✅ 保持清晰的焦点指示 */
button:focus {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}

/* ✅ 使用 focus-visible 优化 */
button:focus-visible {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}

button:focus:not(:focus-visible) {
  outline: none;
}
```

### 不依赖颜色传达信息

```tsx
// ❌ 仅用颜色区分状态
<span style={{ color: 'red' }}>错误</span>
<span style={{ color: 'green' }}>成功</span>

// ✅ 颜色 + 图标/文字
<span style={{ color: 'red' }}>
  <ErrorIcon /> 错误
</span>
<span style={{ color: 'green' }}>
  <CheckIcon /> 成功
</span>
```

---

## 表单无障碍

### 表单标签

```tsx
// ❌ 缺少 label
<input type="text" placeholder="用户名" />

// ✅ 使用 label
<label htmlFor="username">用户名</label>
<input id="username" type="text" />

// ✅ 隐藏但可访问的 label
<label htmlFor="search" className="sr-only">搜索</label>
<input id="search" type="search" placeholder="搜索..." />
```

### 错误提示

```tsx
function FormField({ label, error, ...props }) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

### 必填字段

```tsx
<label htmlFor="email">
  邮箱
  <span aria-hidden="true">*</span>
  <span className="sr-only">（必填）</span>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>
```

---

## 屏幕阅读器

### 隐藏内容策略

| 方式 | 视觉 | 读屏 | 用途 |
|------|------|------|------|
| `display: none` | 隐藏 | 隐藏 | 完全隐藏 |
| `visibility: hidden` | 隐藏 | 隐藏 | 完全隐藏 |
| `aria-hidden="true"` | 可见 | 隐藏 | 装饰性内容 |
| `.sr-only` 类 | 隐藏 | 可读 | 仅读屏可见 |

### sr-only 样式

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 动态内容通知

```tsx
// 使用 aria-live 通知屏幕阅读器
function Toast({ message }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

// 使用 role="alert" 紧急通知
function ErrorAlert({ message }) {
  return (
    <div role="alert">
      {message}
    </div>
  );
}
```

---

## 检查清单

### 快速检查

```markdown
## 无障碍检查清单

### 基础
- [ ] 页面有正确的 lang 属性
- [ ] 页面有唯一的 <title>
- [ ] 标题层级正确（h1-h6）
- [ ] 图片有 alt 文本

### 键盘
- [ ] 所有功能可通过键盘操作
- [ ] 焦点顺序合理
- [ ] 焦点样式清晰可见
- [ ] 无键盘陷阱

### 表单
- [ ] 所有输入有关联的 label
- [ ] 必填字段有标识
- [ ] 错误提示关联到输入
- [ ] 表单有提交反馈

### 颜色
- [ ] 文本对比度 >= 4.5:1
- [ ] 不仅用颜色传达信息
- [ ] 链接与文本有区分
```

### 测试工具

| 工具 | 用途 |
|------|------|
| axe DevTools | 浏览器扩展，自动检测 |
| WAVE | 在线检测工具 |
| Lighthouse | Chrome 内置审计 |
| NVDA/VoiceOver | 屏幕阅读器测试 |

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 无障碍 | "无障碍"、"a11y"、"accessibility" |
| ARIA | "ARIA属性"、"aria-label"、"role" |
| 键盘 | "键盘导航"、"Tab顺序"、"焦点" |
| 读屏 | "屏幕阅读器"、"读屏"、"VoiceOver" |
| 标准 | "WCAG"、"可访问性标准" |

---

## 注意事项

### 核心原则

```
✅ 无障碍优先：
- 语义化 HTML 优先
- 不要移除焦点样式
- 保持键盘可操作
- 提供文本替代

❌ 常见错误：
- 使用 div 模拟按钮
- outline: none 不提供替代
- 仅用颜色表示状态
- 忽略动态内容通知
```

### 测试建议

```
测试方法：
1. 仅用键盘操作整个页面
2. 使用屏幕阅读器浏览
3. 运行自动化检测工具
4. 邀请残障用户测试
```
