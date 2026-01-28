---
name: vue-composables
description: Vue Composables技能。当用户需要编写Vue组合式函数、理解Composition API、封装composables逻辑、或询问Vue3状态管理时使用此skill。
---

# Vue Composables Skill

Vue 3 Composables 编写指导，帮助 AI 完成组合式函数设计、响应式状态管理等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🔧 Composables | 封装可复用逻辑 |
| 📊 响应式 | ref/reactive |
| ⚡ 生命周期 | onMounted/onUnmounted |
| 👁️ 侦听器 | watch/watchEffect |
| 🔗 依赖注入 | provide/inject |

---

## 常用 Composables

### useToggle

```typescript
import { ref } from 'vue';

export function useToggle(initialValue = false) {
  const value = ref(initialValue);
  
  const toggle = () => { value.value = !value.value; };
  const setTrue = () => { value.value = true; };
  const setFalse = () => { value.value = false; };
  
  return { value, toggle, setTrue, setFalse };
}
```

### useLocalStorage

```typescript
import { ref, watch } from 'vue';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const storedValue = ref<T>(initialValue);
  
  // 初始化
  const item = localStorage.getItem(key);
  if (item) {
    storedValue.value = JSON.parse(item);
  }
  
  // 同步
  watch(storedValue, (val) => {
    localStorage.setItem(key, JSON.stringify(val));
  }, { deep: true });
  
  return storedValue;
}
```

### useFetch

```typescript
import { ref, watchEffect } from 'vue';

export function useFetch<T>(url: string | (() => string)) {
  const data = ref<T | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const urlValue = typeof url === 'function' ? url() : url;
      const res = await fetch(urlValue);
      data.value = await res.json();
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  watchEffect(() => {
    fetchData();
  });

  return { data, loading, error, refetch: fetchData };
}
```

### useMouse

```typescript
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  const update = (e: MouseEvent) => {
    x.value = e.pageX;
    y.value = e.pageY;
  };

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}
```

---

## 响应式技巧

### ref vs reactive

```typescript
// ref - 基础类型或需要替换整个对象
const count = ref(0);
const user = ref<User | null>(null);
user.value = { name: 'John' }; // 替换整个对象

// reactive - 对象/数组，不需要替换
const state = reactive({
  count: 0,
  user: null as User | null,
});
state.count++; // 直接修改属性
```

### 保持响应式

```typescript
// ❌ 解构丢失响应式
const { count } = state; // count 不再响应

// ✅ 使用 toRefs
const { count } = toRefs(state);

// ✅ 使用 toRef
const count = toRef(state, 'count');
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| Composables | "composables"、"组合式函数"、"useXxx" |
| 响应式 | "ref"、"reactive"、"响应式" |
| 生命周期 | "onMounted"、"生命周期"、"挂载" |

---

## 最佳实践

```
✅ 推荐：
- 以 use 开头命名
- 返回 ref 或 reactive
- 清理副作用
- 使用 toRefs 解构

❌ 避免：
- 直接解构 reactive
- 忘记清理监听器
- 在 setup 外调用
```
