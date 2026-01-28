---
name: api-integration
description: API接口对接技能。当用户需要对接接口、调用API、封装请求、处理接口数据、或询问如何进行接口集成时使用此skill。
---

# API Integration Skill

API 接口对接指导，帮助 AI 完成接口调用、类型推断、错误处理、状态管理等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🔗 接口对接 | 调用后端 API，处理请求/响应 |
| 📝 类型推断 | 根据接口文档/响应推断 TypeScript 类型 |
| ⚠️ 错误处理 | 统一错误处理、重试、降级策略 |
| ⏳ 状态管理 | loading、error、data 状态管理 |
| 🔄 请求封装 | 封装通用请求方法、拦截器 |

---

## 接口对接流程

### 标准对接流程

```
1. 获取接口文档        → 确认请求/响应格式
2. 定义类型文件        → types.ts
3. 封装请求方法        → api.ts / services.ts
4. 创建数据 hooks      → useXxxData.ts
5. 组件中调用          → 处理 loading/error/data
6. 错误处理            → 统一错误提示
```

### 文件组织结构

```
src/
├── services/              # 或 api/
│   ├── request.ts         # 请求封装（axios实例）
│   ├── user.ts            # 用户相关接口
│   ├── order.ts           # 订单相关接口
│   └── types/             # 接口类型定义
│       ├── user.ts
│       └── order.ts
└── pages/
    └── user/
        ├── hooks/
        │   └── useUserData.ts  # 数据请求 hooks
        └── index.tsx
```

---

## 类型定义规范

### 请求/响应类型

```typescript
// services/types/user.ts

/** 用户列表请求参数 */
interface GetUserListParams {
  keyword?: string;
  status?: number;
  current: number;
  pageSize: number;
}

/** 用户信息 */
interface UserInfo {
  id: number;
  name: string;
  email: string;
  status: number;
  createdAt: string;
}

/** 用户列表响应 */
interface GetUserListResponse {
  list: UserInfo[];
  total: number;
}

/** 创建用户请求参数 */
interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}
```

### 通用响应结构

```typescript
// services/types/common.ts

/** 通用 API 响应结构 */
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/** 分页响应结构 */
interface PaginationResponse<T> {
  list: T[];
  total: number;
  current: number;
  pageSize: number;
}
```

---

## 请求封装

### Axios 实例封装

```typescript
// services/request.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd'; // 或其他 UI 库

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message: msg, data } = response.data;
    
    if (code === 0 || code === 200) {
      return data;
    }
    
    // 业务错误
    message.error(msg || '请求失败');
    return Promise.reject(new Error(msg));
  },
  (error) => {
    // HTTP 错误
    const status = error.response?.status;
    
    switch (status) {
      case 401:
        message.error('登录已过期，请重新登录');
        // 跳转登录页
        break;
      case 403:
        message.error('没有权限访问');
        break;
      case 500:
        message.error('服务器错误');
        break;
      default:
        message.error(error.message || '网络错误');
    }
    
    return Promise.reject(error);
  }
);

export default request;
```

### 接口方法封装

```typescript
// services/user.ts
import request from './request';
import type {
  GetUserListParams,
  GetUserListResponse,
  CreateUserParams,
  UserInfo,
} from './types/user';

/** 获取用户列表 */
export async function getUserList(params: GetUserListParams): Promise<GetUserListResponse> {
  return request.get('/user/list', { params });
}

/** 获取用户详情 */
export async function getUserDetail(id: number): Promise<UserInfo> {
  return request.get(`/user/${id}`);
}

/** 创建用户 */
export async function createUser(data: CreateUserParams): Promise<{ id: number }> {
  return request.post('/user', data);
}

/** 更新用户 */
export async function updateUser(id: number, data: Partial<CreateUserParams>): Promise<void> {
  return request.put(`/user/${id}`, data);
}

/** 删除用户 */
export async function deleteUser(id: number): Promise<void> {
  return request.delete(`/user/${id}`);
}
```

---

## 数据请求 Hooks

### React 模式

```typescript
// hooks/useUserList.ts
import { useState, useCallback, useEffect } from 'react';
import { getUserList } from '@/services/user';
import type { GetUserListParams, UserInfo } from '@/services/types/user';

interface UseUserListResult {
  data: UserInfo[];
  total: number;
  loading: boolean;
  error: Error | null;
  params: GetUserListParams;
  setParams: (params: Partial<GetUserListParams>) => void;
  refresh: () => Promise<void>;
}

export function useUserList(initialParams?: Partial<GetUserListParams>): UseUserListResult {
  const [data, setData] = useState<UserInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParamsState] = useState<GetUserListParams>({
    current: 1,
    pageSize: 10,
    ...initialParams,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserList(params);
      setData(res.list);
      setTotal(res.total);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const setParams = useCallback((newParams: Partial<GetUserListParams>) => {
    setParamsState((prev) => ({ ...prev, ...newParams }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    total,
    loading,
    error,
    params,
    setParams,
    refresh: fetchData,
  };
}
```

### Vue 3 模式

```typescript
// composables/useUserList.ts
import { ref, reactive, watch } from 'vue';
import { getUserList } from '@/services/user';
import type { GetUserListParams, UserInfo } from '@/services/types/user';

export function useUserList(initialParams?: Partial<GetUserListParams>) {
  const data = ref<UserInfo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  
  const params = reactive<GetUserListParams>({
    current: 1,
    pageSize: 10,
    ...initialParams,
  });

  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await getUserList(params);
      data.value = res.list;
      total.value = res.total;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  watch(params, fetchData, { immediate: true, deep: true });

  return {
    data,
    total,
    loading,
    error,
    params,
    refresh: fetchData,
  };
}
```

---

## 错误处理策略

### 错误分类

| 类型 | 说明 | 处理方式 |
|------|------|----------|
| 网络错误 | 断网、超时 | 提示重试 |
| HTTP 错误 | 4xx、5xx | 根据状态码处理 |
| 业务错误 | code !== 0 | 显示后端错误信息 |
| 数据错误 | 格式不符预期 | 降级处理 |

### 重试机制

```typescript
// utils/retry.ts
export async function retry<T>(
  fn: () => Promise<T>,
  options: { times?: number; delay?: number } = {}
): Promise<T> {
  const { times = 3, delay = 1000 } = options;
  
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === times - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Retry failed');
}

// 使用
const data = await retry(() => getUserList(params), { times: 3 });
```

---

## 常见场景

### 场景1：列表页数据请求

```tsx
function UserListPage() {
  const { data, loading, total, params, setParams, refresh } = useUserList();

  const handleSearch = (keyword: string) => {
    setParams({ keyword, current: 1 });
  };

  const handlePageChange = (current: number, pageSize: number) => {
    setParams({ current, pageSize });
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <Table
        dataSource={data}
        loading={loading}
        pagination={{
          current: params.current,
          pageSize: params.pageSize,
          total,
          onChange: handlePageChange,
        }}
      />
    </div>
  );
}
```

### 场景2：表单提交

```tsx
function useCreateUser() {
  const [loading, setLoading] = useState(false);

  const create = async (data: CreateUserParams) => {
    setLoading(true);
    try {
      const result = await createUser(data);
      message.success('创建成功');
      return result;
    } catch (error) {
      // 错误已在拦截器中处理
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading };
}
```

### 场景3：详情页数据

```tsx
function useUserDetail(id: number) {
  const [data, setData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDetail(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 接口对接 | "对接接口"、"调用API"、"请求后端" |
| 请求封装 | "封装请求"、"axios封装"、"接口封装" |
| 类型定义 | "接口类型"、"定义类型"、"TypeScript类型" |
| 错误处理 | "错误处理"、"异常处理"、"请求失败" |
| 状态管理 | "loading状态"、"请求状态"、"数据状态" |

---

## 注意事项

### 关键约束

| 约束 | 说明 |
|------|------|
| 类型优先 | 先定义类型，再写接口方法 |
| 统一封装 | 使用统一的 request 实例 |
| 错误处理 | 在拦截器统一处理，组件按需覆盖 |
| 接口分类 | 按业务模块拆分接口文件 |

### 最佳实践

```
✅ 推荐做法：
- 接口方法返回类型明确
- 使用 hooks 封装请求逻辑
- loading/error 状态完整处理
- 请求参数校验

❌ 避免做法：
- 在组件中直接调用 axios
- 硬编码 API 地址
- 忽略错误处理
- 不定义接口类型
```
