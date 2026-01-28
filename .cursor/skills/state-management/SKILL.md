---
name: state-management
description: 状态管理技能。当用户需要实现全局状态管理、使用Redux/Zustand/Pinia、处理跨组件状态、或询问如何管理应用状态时使用此skill。
---

# State Management Skill

前端状态管理指导，帮助 AI 完成全局状态设计、状态库选择、状态持久化等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🏪 状态设计 | 状态结构设计 |
| 🔄 状态更新 | action/mutation |
| 💾 持久化 | localStorage/sessionStorage |
| 🎯 选择器 | 状态派生/缓存 |

---

## React 状态管理

### Zustand（推荐）

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'user-storage' }
  )
);

// 使用
function Profile() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
}
```

### Context + useReducer

```typescript
interface State { count: number; }
type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
  }
}

const CountContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

function CountProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <CountContext.Provider value={{ state, dispatch }}>
      {children}
    </CountContext.Provider>
  );
}
```

---

## Vue 状态管理

### Pinia（推荐）

```typescript
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user,
    userName: (state) => state.user?.name ?? 'Guest',
  },
  
  actions: {
    async login(credentials: Credentials) {
      const user = await api.login(credentials);
      this.user = user;
    },
    logout() {
      this.user = null;
    },
  },
});

// 使用
const userStore = useUserStore();
userStore.login({ email, password });
```

### Setup Store 语法

```typescript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  
  function increment() {
    count.value++;
  }
  
  return { count, doubleCount, increment };
});
```

---

## 状态设计原则

### 状态分类

| 类型 | 说明 | 存储位置 |
|------|------|----------|
| 服务端状态 | API 数据 | React Query/SWR |
| 客户端状态 | UI 状态 | Zustand/Pinia |
| URL 状态 | 路由参数 | Router |
| 表单状态 | 表单数据 | 组件/表单库 |

### 最佳实践

```
✅ 推荐：
- 最小化全局状态
- 服务端状态用专门工具
- 状态扁平化
- 使用选择器优化

❌ 避免：
- 所有状态放全局
- 深层嵌套状态
- 组件内复制全局状态
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 状态管理 | "状态管理"、"全局状态"、"store" |
| Redux | "Redux"、"reducer"、"action" |
| Zustand | "Zustand"、"create store" |
| Pinia | "Pinia"、"defineStore" |
