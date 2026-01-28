---
name: performance-audit
description: 性能审计技能。当用户需要分析性能问题、优化加载速度、解决渲染卡顿、或询问如何提升前端性能时使用此skill。
---

# Performance Audit Skill

前端性能审计指导，帮助 AI 完成性能瓶颈分析、加载优化、渲染优化、内存管理等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 📊 性能分析 | Lighthouse、Performance 面板分析 |
| ⚡ 加载优化 | 首屏加载、资源加载优化 |
| 🎨 渲染优化 | 减少重排重绘、动画优化 |
| 💾 内存管理 | 内存泄漏检测、内存优化 |
| 📦 打包优化 | Bundle 分析、代码分割 |

---

## 性能指标

### Core Web Vitals

| 指标 | 全称 | 良好 | 需改进 | 差 |
|------|------|------|--------|-----|
| LCP | Largest Contentful Paint | ≤2.5s | ≤4s | >4s |
| FID | First Input Delay | ≤100ms | ≤300ms | >300ms |
| CLS | Cumulative Layout Shift | ≤0.1 | ≤0.25 | >0.25 |
| INP | Interaction to Next Paint | ≤200ms | ≤500ms | >500ms |

### 其他关键指标

| 指标 | 说明 | 目标 |
|------|------|------|
| FCP | 首次内容绘制 | ≤1.8s |
| TTI | 可交互时间 | ≤3.8s |
| TBT | 总阻塞时间 | ≤300ms |
| Speed Index | 速度指数 | ≤3.4s |

---

## 加载性能优化

### 资源优化

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preload" href="/critical.css" as="style">

<!-- 预连接第三方源 -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预获取下一页资源 -->
<link rel="prefetch" href="/next-page.js">
```

### 图片优化

```tsx
// 使用 next/image 或类似组件
import Image from 'next/image';

// ✅ 响应式图片
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // LCP 图片
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// ✅ 懒加载非关键图片
<Image
  src="/feature.jpg"
  alt="Feature"
  loading="lazy"
/>
```

```html
<!-- 原生懒加载 -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 800px)" srcset="large.webp" type="image/webp">
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source srcset="small.webp" type="image/webp">
  <img src="small.jpg" alt="Description">
</picture>
```

### JavaScript 优化

```tsx
// ✅ 动态导入
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard')),
  },
];

// ✅ 条件加载
const loadAnalytics = async () => {
  if (process.env.NODE_ENV === 'production') {
    const analytics = await import('./analytics');
    analytics.init();
  }
};
```

### CSS 优化

```html
<!-- 关键 CSS 内联 -->
<style>
  /* 首屏关键样式 */
  .header { ... }
  .hero { ... }
</style>

<!-- 非关键 CSS 异步加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

---

## 渲染性能优化

### React 优化

```tsx
// ✅ React.memo 避免不必要渲染
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return (
    <ul>
      {items.map(item => <ListItem key={item.id} item={item} />)}
    </ul>
  );
});

// ✅ useMemo 缓存计算结果
function DataTable({ data, filter }) {
  const filteredData = useMemo(() => {
    return data.filter(item => item.name.includes(filter));
  }, [data, filter]);

  return <Table data={filteredData} />;
}

// ✅ useCallback 稳定回调引用
function Parent() {
  const handleClick = useCallback((id: number) => {
    console.log(id);
  }, []);

  return <Child onClick={handleClick} />;
}

// ✅ 虚拟列表处理大数据
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

### Vue 优化

```vue
<script setup>
import { computed, shallowRef } from 'vue';

// ✅ 计算属性缓存
const filteredList = computed(() => {
  return list.value.filter(item => item.active);
});

// ✅ shallowRef 大对象
const largeData = shallowRef(initialData);

// ✅ v-once 静态内容
</script>

<template>
  <!-- ✅ v-once 只渲染一次 -->
  <div v-once>{{ staticContent }}</div>
  
  <!-- ✅ v-memo 条件缓存 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.selected]">
    {{ item.name }}
  </div>
</template>
```

### 避免布局抖动

```javascript
// ❌ 强制同步布局
function badExample() {
  for (let i = 0; i < 100; i++) {
    const height = element.offsetHeight; // 读取
    element.style.height = height + 10 + 'px'; // 写入
    // 每次循环都触发重排
  }
}

// ✅ 批量读写
function goodExample() {
  // 先读取
  const heights = elements.map(el => el.offsetHeight);
  
  // 再写入
  elements.forEach((el, i) => {
    el.style.height = heights[i] + 10 + 'px';
  });
}

// ✅ 使用 requestAnimationFrame
function animateExample() {
  requestAnimationFrame(() => {
    element.style.transform = 'translateX(100px)';
  });
}
```

---

## 内存优化

### 内存泄漏检测

```typescript
// ❌ 内存泄漏：事件监听未清理
function BadComponent() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // 忘记清理
  }, []);
}

// ✅ 正确清理
function GoodComponent() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}

// ❌ 内存泄漏：定时器未清理
function BadTimer() {
  useEffect(() => {
    setInterval(tick, 1000);
  }, []);
}

// ✅ 正确清理
function GoodTimer() {
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
}

// ❌ 内存泄漏：闭包引用
function BadClosure() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(result => {
      setData(result); // 组件卸载后仍执行
    });
  }, []);
}

// ✅ 使用取消标志
function GoodClosure() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetchData().then(result => {
      if (!cancelled) {
        setData(result);
      }
    });
    
    return () => { cancelled = true; };
  }, []);
}
```

### 大数据处理

```typescript
// ✅ 分页加载
function usePaginatedData() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  
  const loadMore = async () => {
    const newData = await fetchPage(page);
    setData(prev => [...prev, ...newData]);
    setPage(p => p + 1);
  };
  
  return { data, loadMore };
}

// ✅ Web Worker 处理耗时计算
const worker = new Worker('/heavy-computation.js');
worker.postMessage(largeData);
worker.onmessage = (e) => {
  setResult(e.data);
};

// ✅ 及时释放大对象
function processLargeData() {
  let largeArray = new Array(1000000).fill(0);
  // 处理数据
  const result = process(largeArray);
  // 释放引用
  largeArray = null;
  return result;
}
```

---

## 网络优化

### 请求优化

```typescript
// ✅ 请求去重
const pendingRequests = new Map<string, Promise<any>>();

async function dedupedFetch(url: string) {
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url);
  }
  
  const promise = fetch(url).then(r => r.json());
  pendingRequests.set(url, promise);
  
  try {
    return await promise;
  } finally {
    pendingRequests.delete(url);
  }
}

// ✅ 请求合并
function useBatchedRequests() {
  const queue = useRef<string[]>([]);
  const timer = useRef<number>();
  
  const add = (id: string) => {
    queue.current.push(id);
    
    if (!timer.current) {
      timer.current = window.setTimeout(() => {
        const ids = queue.current;
        queue.current = [];
        timer.current = undefined;
        
        // 批量请求
        fetchBatch(ids);
      }, 50);
    }
  };
  
  return { add };
}

// ✅ 缓存策略
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

async function cachedFetch(url: string) {
  const cached = cache.get(url);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: Date.now() });
  
  return data;
}
```

### HTTP/2 优化

```javascript
// ✅ 利用多路复用，移除域名分片
// 不再需要：cdn1.example.com, cdn2.example.com

// ✅ 服务器推送
// 在服务端配置 Link header
// Link: </styles.css>; rel=preload; as=style
```

---

## 性能监控

### 性能指标收集

```typescript
// 使用 web-vitals 库
import { onCLS, onFID, onLCP, onINP } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric.name, metric.value);
  // 发送到分析服务
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);

// 自定义性能标记
performance.mark('feature-start');
// ... 执行操作
performance.mark('feature-end');
performance.measure('feature-duration', 'feature-start', 'feature-end');

const measures = performance.getEntriesByName('feature-duration');
console.log('Duration:', measures[0].duration);
```

### 性能预算

```json
// bundlesize 配置
{
  "files": [
    {
      "path": "dist/main.*.js",
      "maxSize": "150 kB"
    },
    {
      "path": "dist/vendor.*.js",
      "maxSize": "100 kB"
    }
  ]
}
```

---

## 检查清单

### 性能优化清单

```markdown
## 性能检查清单

### 加载性能
- [ ] 启用 Gzip/Brotli 压缩
- [ ] 使用 CDN
- [ ] 图片使用 WebP/AVIF 格式
- [ ] 实现代码分割
- [ ] 预加载关键资源

### 渲染性能
- [ ] 避免大型渲染树
- [ ] 使用虚拟滚动
- [ ] 避免强制同步布局
- [ ] 使用 transform 动画

### 内存
- [ ] 清理事件监听器
- [ ] 清理定时器
- [ ] 避免内存泄漏
- [ ] 分页加载大数据

### 网络
- [ ] 请求去重/合并
- [ ] 实现缓存策略
- [ ] 使用 HTTP/2
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 性能优化 | "性能优化"、"加载慢"、"卡顿" |
| 首屏优化 | "首屏"、"白屏"、"FCP" |
| 渲染优化 | "渲染慢"、"掉帧"、"动画卡" |
| 内存问题 | "内存泄漏"、"内存占用高" |
| 打包优化 | "包体积"、"打包慢" |

---

## 注意事项

### 优化原则

```
✅ 性能优化原则：
- 先测量，后优化
- 关注用户体验指标
- 渐进式优化
- 持续监控

❌ 常见误区：
- 过早优化
- 不测量就优化
- 忽视真实用户数据
- 只关注包体积
```

### 工具推荐

| 工具 | 用途 |
|------|------|
| Lighthouse | 综合性能审计 |
| Chrome DevTools | 性能/内存分析 |
| WebPageTest | 真实环境测试 |
| Bundle Analyzer | 打包分析 |
