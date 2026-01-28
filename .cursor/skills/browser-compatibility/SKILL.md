---
name: browser-compatibility
description: 浏览器兼容性检测技能。当用户需要检测CSS/JS兼容性、处理浏览器差异、添加polyfill、或询问如何支持旧版浏览器时使用此skill。
---

# Browser Compatibility Skill

浏览器兼容性检测和处理指导，帮助 AI 完成兼容性分析、Polyfill 添加、CSS 前缀处理等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🔍 兼容性检测 | 检测 CSS/JS API 浏览器支持情况 |
| 🔧 Polyfill | 为旧浏览器添加功能支持 |
| 🎨 CSS 前缀 | 处理浏览器私有前缀 |
| 📊 特性检测 | 运行时检测浏览器能力 |
| 🎯 目标浏览器 | 配置 browserslist |

---

## 目标浏览器配置

### Browserslist 配置

```json
// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie 11"
  ]
}
```

```
# .browserslistrc
# 生产环境
>= 0.5%
last 2 major versions
not dead
not op_mini all

# 国内项目推荐
> 1% in CN
last 2 versions
Chrome >= 80
Firefox >= 78
Safari >= 13
Edge >= 88
iOS >= 13
Android >= 80
not IE 11
```

### 常见配置场景

| 场景 | 配置 | 说明 |
|------|------|------|
| 现代浏览器 | `defaults` | Chrome/Firefox/Safari 最新2版 |
| 兼容 IE11 | `> 0.5%, last 2 versions, IE 11` | 需要大量 polyfill |
| 移动端优先 | `iOS >= 12, Android >= 8` | 移动端项目 |
| 企业内网 | `Chrome >= 80` | 指定浏览器 |

---

## CSS 兼容性

### 常见 CSS 兼容性问题

| CSS 特性 | Chrome | Firefox | Safari | Edge | 解决方案 |
|----------|--------|---------|--------|------|----------|
| Flexbox | 21+ | 28+ | 9+ | 12+ | 基本无需处理 |
| Grid | 57+ | 52+ | 10.1+ | 16+ | @supports 检测 |
| CSS Variables | 49+ | 31+ | 9.1+ | 15+ | PostCSS 插件 |
| gap (flexbox) | 84+ | 63+ | 14.1+ | 84+ | margin 替代 |
| aspect-ratio | 88+ | 89+ | 15+ | 88+ | padding-top hack |
| :has() | 105+ | 121+ | 15.4+ | 105+ | JS 替代 |
| Container Queries | 105+ | 110+ | 16+ | 105+ | @supports 检测 |

### Autoprefixer 配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
  ],
};

// 输入
.box {
  display: flex;
  user-select: none;
}

// 输出（自动添加前缀）
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}
```

### CSS 特性检测

```css
/* @supports 特性查询 */
.container {
  /* 回退方案 */
  display: flex;
  flex-wrap: wrap;
}

@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

/* 变量回退 */
.button {
  background: #1890ff; /* 回退色 */
  background: var(--primary-color, #1890ff);
}
```

### 常见 CSS 兼容写法

```css
/* Flexbox gap 替代方案 */
/* 不支持 gap 时使用 margin */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}

.flex-item {
  margin: 8px;
}

/* aspect-ratio 替代方案 */
.aspect-ratio-box {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
}

.aspect-ratio-box > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@supports (aspect-ratio: 16/9) {
  .aspect-ratio-box {
    padding-top: 0;
    aspect-ratio: 16/9;
  }
  
  .aspect-ratio-box > * {
    position: static;
  }
}

/* position: sticky 回退 */
.sticky-header {
  position: relative; /* 回退 */
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
```

---

## JavaScript 兼容性

### 常见 JS API 兼容性

| API | Chrome | Firefox | Safari | Edge | Polyfill |
|-----|--------|---------|--------|------|----------|
| Promise | 32+ | 29+ | 8+ | 12+ | core-js |
| fetch | 42+ | 39+ | 10.1+ | 14+ | whatwg-fetch |
| IntersectionObserver | 51+ | 55+ | 12.1+ | 15+ | intersection-observer |
| ResizeObserver | 64+ | 69+ | 13.1+ | 79+ | resize-observer-polyfill |
| Optional Chaining | 80+ | 74+ | 13.1+ | 80+ | Babel 转译 |
| Nullish Coalescing | 80+ | 72+ | 13.1+ | 80+ | Babel 转译 |
| Array.at() | 92+ | 90+ | 15.4+ | 92+ | core-js |
| structuredClone | 98+ | 94+ | 15.4+ | 98+ | 手动 polyfill |
| AbortController | 66+ | 57+ | 11.1+ | 16+ | abortcontroller-polyfill |

### Babel 配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage', // 按需引入 polyfill
        corejs: 3,
        targets: '> 0.25%, not dead',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
```

### Polyfill 配置

```javascript
// core-js 按需引入
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 或者在入口文件顶部
// polyfills.js
import 'core-js/features/promise';
import 'core-js/features/array/from';
import 'core-js/features/array/includes';
import 'core-js/features/object/assign';
import 'whatwg-fetch';
```

### 运行时特性检测

```typescript
// 检测 API 是否可用
const supportsIntersectionObserver = 'IntersectionObserver' in window;
const supportsResizeObserver = 'ResizeObserver' in window;
const supportsFetch = 'fetch' in window;
const supportsWebP = async () => {
  const img = new Image();
  return new Promise((resolve) => {
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
};

// 按需加载 polyfill
async function loadPolyfills() {
  const polyfills: Promise<any>[] = [];

  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }

  if (!('ResizeObserver' in window)) {
    polyfills.push(import('resize-observer-polyfill').then((m) => {
      window.ResizeObserver = m.default;
    }));
  }

  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }

  await Promise.all(polyfills);
}

// 在应用启动前调用
loadPolyfills().then(() => {
  // 启动应用
});
```

---

## 特性检测工具

### Modernizr 使用

```html
<!-- 引入 Modernizr -->
<script src="modernizr-custom.js"></script>

<script>
// 检测特性
if (Modernizr.flexbox) {
  // 支持 Flexbox
}

if (Modernizr.webp) {
  // 支持 WebP
}

// CSS 类自动添加到 html 元素
// <html class="js flexbox webp no-touchevents">
</script>
```

```css
/* 根据 Modernizr 添加的类设置样式 */
.no-flexbox .container {
  display: table;
}

.flexbox .container {
  display: flex;
}
```

### 自定义检测函数

```typescript
// utils/featureDetect.ts

/** 检测 CSS 特性支持 */
export function supportsCSSProperty(property: string, value?: string): boolean {
  if (typeof CSS !== 'undefined' && CSS.supports) {
    return value
      ? CSS.supports(property, value)
      : CSS.supports(property);
  }
  
  // 回退方案
  const el = document.createElement('div');
  if (property in el.style) {
    if (value) {
      el.style[property as any] = value;
      return el.style[property as any] === value;
    }
    return true;
  }
  return false;
}

/** 检测触摸支持 */
export function supportsTouch(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/** 检测 WebGL 支持 */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/** 检测 Storage 支持 */
export function supportsStorage(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch {
    return false;
  }
}

/** 检测图片格式支持 */
export async function supportsImageFormat(format: 'webp' | 'avif'): Promise<boolean> {
  const testImages: Record<string, string> = {
    webp: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgADlAgIGkyCR/wAABAABAAMAAAAV4AAAA=',
  };

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = testImages[format];
  });
}
```

---

## 兼容性检查清单

### 开发前检查

```markdown
## 兼容性检查清单

### 项目配置
- [ ] 配置 browserslist 目标浏览器
- [ ] 配置 Babel 和 core-js
- [ ] 配置 Autoprefixer
- [ ] 确认 polyfill 策略

### CSS 检查
- [ ] Flexbox/Grid 布局兼容性
- [ ] CSS 变量使用及回退
- [ ] 特殊属性浏览器前缀
- [ ] @supports 特性查询

### JavaScript 检查
- [ ] ES6+ 语法转译
- [ ] 新 API polyfill
- [ ] 可选链/空值合并
- [ ] 异步语法支持

### 测试
- [ ] 真机/模拟器测试
- [ ] 主流浏览器测试
- [ ] 移动端浏览器测试
```

### Can I Use 快速查询

| 查询方式 | 地址 |
|----------|------|
| 网站 | https://caniuse.com |
| CLI | `npx caniuse-cli <feature>` |
| VS Code 扩展 | Can I Use 扩展 |

```bash
# 命令行查询
npx caniuse-cli css-grid
npx caniuse-cli fetch
npx caniuse-cli optional-chaining
```

---

## 常见问题解决

### Safari 特有问题

```css
/* 100vh 问题 */
.full-height {
  height: 100vh;
  height: -webkit-fill-available;
  height: 100dvh; /* 动态视口高度 */
}

/* 日期输入样式 */
input[type="date"]::-webkit-calendar-picker-indicator {
  /* Safari 日期选择器样式 */
}

/* Flex gap 问题 */
@supports not (gap: 1px) {
  .flex-container > * + * {
    margin-left: 8px;
  }
}
```

### iOS Safari 问题

```css
/* 点击高亮移除 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 输入框缩放问题 */
input, textarea, select {
  font-size: 16px; /* 防止 iOS 自动缩放 */
}

/* 滚动回弹 */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* position: fixed 问题 */
.fixed-element {
  position: fixed;
  /* iOS 需要额外处理 */
  transform: translateZ(0);
}
```

```typescript
// iOS 输入框键盘遮挡问题
function handleInputFocus(e: FocusEvent) {
  const input = e.target as HTMLInputElement;
  setTimeout(() => {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}
```

### IE11 兼容（如需支持）

```javascript
// 注意：现代项目已很少需要支持 IE11

// polyfills-ie11.js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';
import 'element-closest-polyfill';
import 'classlist-polyfill';

// CSS 变量 polyfill
import cssVars from 'css-vars-ponyfill';
cssVars({ watch: true });
```

---

## 兼容性测试工具

| 工具 | 用途 | 类型 |
|------|------|------|
| BrowserStack | 跨浏览器测试 | 云服务 |
| Sauce Labs | 自动化测试 | 云服务 |
| LambdaTest | 跨浏览器测试 | 云服务 |
| Chrome DevTools | 设备模拟 | 本地 |
| Firefox 响应式设计模式 | 设备模拟 | 本地 |

### 使用 DevTools 模拟

```javascript
// Chrome DevTools 网络限速和设备模拟
// 1. F12 打开 DevTools
// 2. Ctrl+Shift+M 切换设备模式
// 3. Network 面板选择网络限速
// 4. 选择不同设备预设
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 兼容性检测 | "浏览器兼容"、"兼容性问题"、"不支持" |
| Polyfill | "polyfill"、"补丁"、"向下兼容" |
| CSS 前缀 | "CSS前缀"、"autoprefixer"、"-webkit" |
| 特定浏览器 | "Safari问题"、"iOS兼容"、"IE11" |
| 特性检测 | "特性检测"、"modernizr"、"支持检测" |

---

## 注意事项

### 最佳实践

```
✅ 推荐做法：
- 项目初期确定目标浏览器
- 使用 browserslist 统一配置
- 优先使用特性检测而非浏览器检测
- 渐进增强，优雅降级
- 保持 polyfill 按需加载

❌ 避免做法：
- 使用 navigator.userAgent 判断浏览器
- 全量引入所有 polyfill
- 忽略移动端浏览器测试
- 不设置 CSS 回退值
```

### 浏览器检测 vs 特性检测

```typescript
// ❌ 浏览器检测（不推荐）
if (navigator.userAgent.includes('Safari')) {
  // Safari 特殊处理
}

// ✅ 特性检测（推荐）
if ('IntersectionObserver' in window) {
  // 使用 IntersectionObserver
} else {
  // 使用替代方案
}

// ✅ CSS 特性检测
if (CSS.supports('display', 'grid')) {
  // 使用 Grid 布局
}
```

---

## 更多资源

| 资源 | 地址 |
|------|------|
| Can I Use | https://caniuse.com |
| MDN 兼容性表格 | https://developer.mozilla.org |
| Browserslist | https://browsersl.ist |
| Core-js | https://github.com/zloirock/core-js |
| Autoprefixer | https://autoprefixer.github.io |
