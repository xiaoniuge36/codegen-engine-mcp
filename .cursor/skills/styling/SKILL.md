---
name: styling
description: 样式编写技能。当用户需要编写CSS样式、使用Tailwind CSS、实现响应式布局、或询问如何组织样式代码时使用此skill。
---

# Styling Skill

前端样式编写指导，帮助 AI 完成 CSS 编写、样式方案选择、响应式布局等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🎨 CSS 编写 | 原生 CSS/SCSS/Less |
| 🌊 Tailwind | 原子化 CSS |
| 📦 CSS Modules | 模块化样式 |
| 💅 CSS-in-JS | styled-components |
| 📱 响应式 | 移动端适配 |

---

## 样式方案对比

| 方案 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| CSS Modules | 作用域隔离 | 类名动态 | 通用 |
| Tailwind | 快速开发 | 类名长 | 快速原型 |
| styled-components | 动态样式 | 运行时开销 | 主题切换 |
| SCSS | 功能强大 | 需编译 | 大型项目 |

---

## Tailwind CSS

### 常用类名

```html
<!-- 布局 -->
<div class="flex items-center justify-between gap-4">
<div class="grid grid-cols-3 gap-4">

<!-- 间距 -->
<div class="p-4 m-2 px-6 py-3">

<!-- 尺寸 -->
<div class="w-full h-screen max-w-md min-h-[200px]">

<!-- 颜色 -->
<div class="bg-blue-500 text-white hover:bg-blue-600">

<!-- 响应式 -->
<div class="w-full md:w-1/2 lg:w-1/3">

<!-- 暗黑模式 -->
<div class="bg-white dark:bg-gray-800">
```

### 自定义配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
};
```

---

## CSS Modules

```tsx
// Button.module.css
.button {
  padding: 8px 16px;
  border-radius: 4px;
}

.primary {
  background: #1890ff;
  color: white;
}

// Button.tsx
import styles from './Button.module.css';

function Button({ variant = 'primary' }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      Click
    </button>
  );
}
```

---

## 响应式设计

### 断点

```css
/* 移动优先 */
.container { width: 100%; }

@media (min-width: 768px) {
  .container { width: 750px; }
}

@media (min-width: 1024px) {
  .container { width: 970px; }
}
```

### Tailwind 响应式

```html
<div class="
  text-sm       /* 默认 */
  md:text-base  /* >= 768px */
  lg:text-lg    /* >= 1024px */
">
```

---

## 最佳实践

```
✅ 推荐：
- 使用 CSS 变量
- 移动优先设计
- 统一设计系统
- 避免 !important

❌ 避免：
- 内联样式过多
- 深层选择器嵌套
- 硬编码数值
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| CSS | "CSS样式"、"写样式"、"布局" |
| Tailwind | "Tailwind"、"原子类"、"utility" |
| 响应式 | "响应式"、"移动端"、"自适应" |
