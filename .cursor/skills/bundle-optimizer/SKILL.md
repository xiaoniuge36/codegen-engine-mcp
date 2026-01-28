---
name: bundle-optimizer
description: 打包优化技能。当用户需要优化打包体积、分析Bundle大小、实现代码分割、或询问如何减小构建产物时使用此skill。
---

# Bundle Optimizer Skill

打包优化指导，帮助 AI 完成 Bundle 分析、代码分割、Tree Shaking、依赖优化等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 📊 Bundle 分析 | 分析打包产物构成 |
| ✂️ 代码分割 | 路由/组件级别分割 |
| 🌳 Tree Shaking | 移除未使用代码 |
| 📦 依赖优化 | 减少第三方库体积 |
| 🗜️ 压缩优化 | Gzip/Brotli 压缩 |

---

## Bundle 分析

### 分析工具

```bash
# webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# 在 webpack 配置中
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
plugins: [new BundleAnalyzerPlugin()]

# Vite 使用 rollup-plugin-visualizer
npm install --save-dev rollup-plugin-visualizer
```

### 分析报告解读

| 指标 | 说明 | 目标 |
|------|------|------|
| 总大小 | 所有 chunks 总和 | < 500KB (gzip) |
| 主包大小 | main chunk | < 150KB (gzip) |
| 最大 chunk | 单个最大包 | < 200KB (gzip) |
| 重复依赖 | 同一库多个版本 | 0 |

---

## 代码分割

### 路由级分割

```tsx
// React 路由懒加载
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

```typescript
// Vue 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard.vue'),
  },
  {
    path: '/settings',
    component: () => import('./pages/Settings.vue'),
  },
];
```

### 组件级分割

```tsx
// 重组件动态导入
const HeavyChart = lazy(() => import('./HeavyChart'));
const RichEditor = lazy(() => import('./RichEditor'));

// 条件加载
function Editor({ type }) {
  const EditorComponent = useMemo(() => {
    if (type === 'rich') {
      return lazy(() => import('./RichEditor'));
    }
    return lazy(() => import('./SimpleEditor'));
  }, [type]);

  return (
    <Suspense fallback={<Skeleton />}>
      <EditorComponent />
    </Suspense>
  );
}
```

### 魔法注释

```javascript
// 命名 chunk
const Dashboard = lazy(() => 
  import(/* webpackChunkName: "dashboard" */ './Dashboard')
);

// 预加载
const Settings = lazy(() => 
  import(/* webpackPrefetch: true */ './Settings')
);

// 预获取
const Reports = lazy(() => 
  import(/* webpackPreload: true */ './Reports')
);
```

---

## 依赖优化

### 按需导入

```typescript
// ❌ 全量导入
import _ from 'lodash';
import * as antd from 'antd';

// ✅ 按需导入
import debounce from 'lodash/debounce';
import { Button, Table } from 'antd';

// ✅ 使用 babel-plugin-import
// .babelrc
{
  "plugins": [
    ["import", { "libraryName": "antd", "style": true }]
  ]
}
```

### 替换大型依赖

| 原依赖 | 替代方案 | 体积减少 |
|--------|----------|----------|
| moment | dayjs | ~95% |
| lodash | lodash-es + 按需 | ~80% |
| axios | ky / redaxios | ~70% |
| uuid | nanoid | ~90% |

```typescript
// moment -> dayjs
// ❌ import moment from 'moment';
// ✅ import dayjs from 'dayjs';

// lodash -> 按需
// ❌ import _ from 'lodash';
// ✅ import debounce from 'lodash-es/debounce';
```

### 外部化依赖

```javascript
// webpack externals
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};

// vite rollupOptions
export default {
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
};
```

---

## Tree Shaking

### 确保生效

```javascript
// package.json 设置 sideEffects
{
  "sideEffects": false
}

// 或指定有副作用的文件
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}
```

### 避免阻碍

```typescript
// ❌ 阻碍 Tree Shaking
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
};

// ✅ 支持 Tree Shaking
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
```

---

## 压缩配置

### Terser 配置

```javascript
// webpack
optimization: {
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    }),
  ],
}
```

### Gzip/Brotli

```javascript
// vite
import viteCompression from 'vite-plugin-compression';

export default {
  plugins: [
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' }),
  ],
};
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 打包优化 | "包体积"、"Bundle大"、"打包优化" |
| 代码分割 | "代码分割"、"懒加载"、"动态导入" |
| 依赖优化 | "依赖太大"、"替换lodash"、"按需导入" |

---

## 检查清单

```markdown
## Bundle 优化清单

- [ ] 运行 Bundle 分析
- [ ] 实现路由级代码分割
- [ ] 按需导入 UI 库
- [ ] 替换大型依赖
- [ ] 启用 Tree Shaking
- [ ] 配置 Gzip/Brotli
- [ ] 设置性能预算
```
