---
name: react-hooks
description: React Hooks技能。当用户需要编写自定义Hooks、理解Hooks用法、封装Hooks逻辑、或询问React状态管理时使用此skill。
---

# React Hooks Skill

React Hooks 编写指导，帮助 AI 完成自定义 Hooks 设计、状态管理、副作用处理等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🎣 自定义 Hooks | 封装可复用逻辑 |
| 📊 状态管理 | useState/useReducer |
| ⚡ 副作用处理 | useEffect/useLayoutEffect |
| 🔧 性能优化 | useMemo/useCallback |
| 🔗 上下文 | useContext |

---

## 常用自定义 Hooks

### useToggle

```typescript
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { value, toggle, setTrue, setFalse };
}

// 使用
const { value: visible, toggle, setFalse: hide } = useToggle();
```

### useLocalStorage

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}
```

### useDebounce

```typescript
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 使用
const debouncedSearch = useDebounce(searchTerm, 500);
```

### useFetch

```typescript
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

---

## Hooks 规则

### 必须遵守

```typescript
// ✅ 顶层调用
function Component() {
  const [count, setCount] = useState(0);
  useEffect(() => {}, []);
}

// ❌ 条件调用
function BadComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // 错误！
  }
}

// ❌ 循环中调用
function BadComponent({ items }) {
  items.forEach(() => {
    const [state, setState] = useState(0); // 错误！
  });
}
```

### 依赖数组

```typescript
// ✅ 完整依赖
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ❌ 缺少依赖
useEffect(() => {
  fetchUser(userId); // userId 缺失
}, []);

// ✅ 稳定回调
const handleClick = useCallback(() => {
  doSomething(count);
}, [count]);
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 自定义Hooks | "自定义hooks"、"封装hooks"、"useXxx" |
| 状态管理 | "useState"、"useReducer"、"状态" |
| 副作用 | "useEffect"、"副作用"、"请求数据" |

---

## 最佳实践

```
✅ 推荐：
- 以 use 开头命名
- 返回稳定的函数引用
- 处理清理逻辑
- 完整的依赖数组

❌ 避免：
- 条件/循环中调用
- 忽略依赖警告
- 不清理副作用
```
