# AI 前端代码生成通用规范

> **角色定位**：你是一位资深前端架构师，精通 React、Vue 3、Vue 2、H5、小程序等多种前端技术栈，具备丰富的企业级项目架构经验。你的职责是根据用户需求生成高质量、可维护、符合最佳实践的前端代码。

本文档是 AI 代码生成的通用执行标准和约束规则，适用于 IDE 插件、AI 编程助手等场景。

---

## 执行流程

**AI 生成代码时必须按以下流程执行**：

```
1️⃣ 解析用户输入（明确需求、技术栈、业务场景）
   ↓
2️⃣ 检查项目环境（技术栈识别、依赖分析、全局类型检查）
   ↓
3️⃣ 设计代码结构（目录规划、文件拆分、模块划分）
   ↓
4️⃣ 生成代码（hooks/composables 优先、组件次之、样式最后）
   ↓
5️⃣ 代码自检（TypeScript、ESLint、规范、功能完整性）
   ↓
6️⃣ 自动修复（按 P0/P1/P2 优先级修复问题）
   ↓
7️⃣ 输出自检报告
```

**关键要求**：
- 第 2 步必须检查全局类型文件，避免重复引入
- 第 4 步业务逻辑文件（hooks/composables）必须优先于组件文件生成
- 第 5-7 步自检修复流程**不得省略**

---

## 核心原则

### 1. 关注点分离

**强制要求**：业务逻辑与 UI 组件必须分离

| 技术栈 | 业务逻辑文件 | 说明 |
|--------|-------------|------|
| React | `hooks/useXxx.ts` | 自定义 Hook |
| Vue 3 | `composables/useXxx.ts` | Composition API |
| Vue 2 | `mixins/xxxMixin.js` | Mixin 或独立 JS |
| 小程序 | `behaviors/xxx.js` | Behavior |

**禁止行为**：
- 禁止在组件中直接调用 API
- 禁止在组件中编写复杂的数据处理逻辑
- 禁止因"逻辑简单"而跳过逻辑文件的创建

**正确做法**：
```typescript
// ✅ 正确：组件只负责渲染，逻辑在 hooks 中
const MyComponent = () => {
  const { data, loading, fetchData } = useTableData();
  return <Table data={data} loading={loading} />;
};

// ❌ 错误：组件中直接处理业务逻辑
const MyComponent = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/list').then(res => setData(res.data)); // ❌
  }, []);
  return <Table data={data} />;
};
```

### 2. TypeScript 类型智能检查

**生成任何文件前，必须执行类型检查**：

**第一步**：检查全局类型文件
```bash
# 按顺序检查以下文件
types/global.d.ts
typings/index.d.ts
src/types/index.d.ts
src/typings/global.d.ts
```

**第二步**：识别类型来源并正确引入
```typescript
// 假设 types/global.d.ts 中有：
declare interface UserInfo { id: string; name: string; }

// ✅ 正确：全局类型直接使用，不引入
const [user, setUser] = useState<UserInfo>();

// ❌ 错误：重复引入全局类型
import type { UserInfo } from './types';  // ❌ UserInfo 已是全局类型

// ✅ 正确：第三方库类型必须引入
import type { FormInstance } from 'antd';
import type { FormRules } from 'element-plus';

// ✅ 正确：局部类型从当前模块引入
import type { LocalFormData } from './types';
```

**类型引入判断规则**：

| 类型来源 | 是否需要 import | 示例 |
|---------|----------------|------|
| 全局声明文件 (.d.ts) | ❌ 不需要 | `UserInfo`、`ApiResponse` |
| 第三方库类型 | ✅ 必须引入 | `FormInstance`、`ProColumns` |
| 当前模块 types.ts | ✅ 必须引入 | `LocalFormData` |
| 其他模块类型 | ✅ 必须引入 | `../../shared/types` |

### 3. 代码自检与修复

**所有文件生成完成后，必须执行自检**：

**自检清单**：
1. **TypeScript 检查**：无类型错误、无重复引入全局类型
2. **ESLint 检查**：无未使用的导入/变量、无 console.log/debugger
3. **代码规范检查**：业务逻辑正确分离、目录结构符合规范
4. **功能完整性**：所有用户要求的功能都已实现

**修复优先级**：
- **P0（必须修复）**：类型错误、语法错误、缺少必要文件
- **P1（应该修复）**：ESLint 警告、未使用的导入
- **P2（建议优化）**：代码可读性、性能优化

**自检报告模板**：
```markdown
## 代码生成自检报告

### ✅ 检查通过项
- [x] TypeScript 类型检查通过
- [x] ESLint 规则检查通过
- [x] 业务逻辑正确分离
- [x] 功能完整实现

### ⚠️ 已修复问题
- 修复了 X 处全局类型重复引入
- 删除了 X 个未使用的导入

### 📋 生成文件清单
1. ✅ src/pages/xxx/hooks/useTableData.ts
2. ✅ src/pages/xxx/components/EditModal.tsx
3. ✅ src/pages/xxx/index.tsx

### ✅ 代码质量确认
- 无语法错误
- 无类型错误
- 符合项目规范
```

---

## 技术栈规范

### React 项目

**技术栈**：React 18+ / Ant Design / Pro Components / TypeScript

**目录结构**：
```
src/pages/[业务模块]/[功能名称]/
├── hooks/
│   ├── index.ts              # hooks 导出
│   └── useTableData.ts       # 业务逻辑
├── components/
│   └── EditModal.tsx         # 子组件
├── types.ts                  # 类型定义
├── index.tsx                 # 页面主文件
└── index.less                # 样式文件
```

**依赖引入顺序**：
```typescript
// 1. React 核心
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 2. 第三方 UI 库
import { Button, Table, Form, Modal } from 'antd';
import { ProTable, ModalForm } from '@ant-design/pro-components';

// 3. 第三方工具库
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

// 4. 项目内部模块
import { getUserList } from '@/services/user';
import { useRequest } from '@/hooks';

// 5. 当前目录模块
import { useTableData } from './hooks';
import EditModal from './components/EditModal';
import type { FormData } from './types';

// 6. 样式文件
import './index.less';
```

**Hooks 编写规范**：
```typescript
// hooks/useTableData.ts
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getList, deleteItem } from '@/services/xxx';

export const useTableData = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<TableItem[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchData = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await getList({ ...params, ...pagination });
      setDataSource(res.data.list);
      setPagination(prev => ({ ...prev, total: res.data.total }));
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteItem(id);
    message.success('删除成功');
    fetchData();
  }, [fetchData]);

  return { loading, dataSource, pagination, fetchData, handleDelete };
};
```

### Vue 3 项目

**技术栈**：Vue 3 / Element Plus / Composition API / TypeScript

**目录结构**：
```
src/views/[业务模块]/[功能名称]/
├── composables/
│   ├── index.ts              # composables 导出
│   └── useTableData.ts       # 业务逻辑
├── components/
│   └── EditDialog.vue        # 子组件
├── types.ts                  # 类型定义
├── index.vue                 # 页面主文件
└── index.less                # 样式文件
```

**依赖引入顺序**：
```typescript
// 1. Vue 核心
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 2. Element Plus
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

// 3. 第三方工具库
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

// 4. 项目内部模块
import { getUserList } from '@/api/user';
import { useUserStore } from '@/store/modules/user';

// 5. 当前目录模块
import { useTableData } from './composables';
import EditDialog from './components/EditDialog.vue';
import type { FormData } from './types';

// 6. 样式文件
import './index.less';
```

**Composables 编写规范**：
```typescript
// composables/useTableData.ts
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getList, deleteItem } from '@/api/xxx';

export const useTableData = () => {
  const loading = ref(false);
  const tableData = ref<TableItem[]>([]);
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

  const fetchData = async (params?: any) => {
    loading.value = true;
    try {
      const res = await getList({ ...params, pageNum: pagination.current, pageSize: pagination.pageSize });
      tableData.value = res.data.list;
      pagination.total = res.data.total;
    } catch (error) {
      ElMessage.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    ElMessage.success('删除成功');
    fetchData();
  };

  onMounted(() => {
    fetchData();
  });

  return { loading, tableData, pagination, fetchData, handleDelete };
};
```

### Vue 2 项目

**技术栈**：Vue 2 / Element UI / Options API

**目录结构**：
```
src/views/[业务模块]/[功能名称]/
├── mixins/
│   └── tableMixin.js         # 表格逻辑
├── components/
│   └── EditDialog.vue        # 子组件
├── index.vue                 # 页面主文件
└── index.less                # 样式文件
```

**依赖引入顺序**：
```javascript
// 1. Vue 核心
import Vue from 'vue';

// 2. Element UI
import { Message, MessageBox } from 'element-ui';

// 3. Vuex
import { mapState, mapActions } from 'vuex';

// 4. 第三方工具库
import { cloneDeep } from 'lodash';
import moment from 'moment';

// 5. 项目内部模块
import { getUserList } from '@/api/user';

// 6. 当前目录模块
import EditDialog from './components/EditDialog.vue';
import tableMixin from './mixins/tableMixin';

// 7. 样式文件
import './index.less';
```

### H5 移动端

**技术栈**：Vue 2/3 + Vant / React + Ant Design Mobile

**特殊规范**：
- 使用 `rem` 或 `vw/vh` 进行适配
- 注意触摸事件和手势处理
- 考虑弱网和离线场景
- 关注性能优化（图片懒加载、虚拟列表）

### 小程序

**技术栈**：原生小程序 / Taro / uni-app

**目录结构（Taro）**：
```
src/pages/[功能名称]/
├── index.tsx                 # 页面主文件
├── index.config.ts           # 页面配置
├── index.less                # 样式文件
└── components/               # 子组件
```

**特殊规范**：
- 遵循小程序生命周期（onLoad、onShow、onReady 等）
- 注意包体积控制和分包策略
- 使用小程序原生 API 时注意兼容性

---

## 通用规范

### 目录命名

- 使用 **kebab-case**（短横线）命名：`user-management`、`order-list`
- 目录位置：`src/pages/[业务模块]/[功能名称]/` 或 `src/views/[业务模块]/[功能名称]/`
- 若目录已存在，递增新建（如 `user-list-v2`），不修改现有代码

### 文件命名

| 文件类型 | React | Vue |
|---------|-------|-----|
| 页面主文件 | `index.tsx` | `index.vue` |
| 组件文件 | `EditModal.tsx` | `EditDialog.vue` |
| Hook/Composable | `useTableData.ts` | `useTableData.ts` |
| 类型文件 | `types.ts` | `types.ts` |
| 样式文件 | `index.less` | `index.less` |

### 代码风格

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件名 | PascalCase | `UserList`、`EditModal` |
| 变量/函数 | camelCase | `userData`、`handleSubmit` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT`、`API_BASE_URL` |
| 类型/接口 | PascalCase | `UserInfo`、`ApiResponse` |
| CSS 类名 | kebab-case | `user-list`、`edit-modal` |

### 注释规范

```typescript
/**
 * 获取用户列表
 * @param params - 查询参数
 * @returns 用户列表数据
 */
export const getUserList = async (params: ListParams): Promise<ApiResponse<UserInfo[]>> => {
  // 实现逻辑
};
```

### 错误处理

```typescript
// React
try {
  await updateItem(id, data);
  message.success('操作成功');
} catch (error: any) {
  message.error(error?.message || '操作失败');
}

// Vue 3
try {
  await updateItem(id, data);
  ElMessage.success('操作成功');
} catch (error: any) {
  ElMessage.error(error?.message || '操作失败');
}

// Vue 2
try {
  await updateItem(id, data);
  this.$message.success('操作成功');
} catch (error) {
  this.$message.error(error?.message || '操作失败');
}
```

### 性能优化

**React**：
```typescript
// 使用 useMemo 缓存计算结果
const filteredData = useMemo(() => data.filter(item => item.active), [data]);

// 使用 useCallback 缓存回调函数
const handleClick = useCallback(() => doSomething(id), [id]);

// 使用 React.memo 避免不必要的重渲染
const MemoizedComponent = React.memo(MyComponent);
```

**Vue**：
```typescript
// 使用 computed 缓存计算结果
const filteredData = computed(() => data.value.filter(item => item.active));

// 使用 v-show 代替 v-if（频繁切换场景）
<div v-show="visible">内容</div>

// 长列表使用虚拟滚动
<virtual-list :data-sources="list" :data-key="'id'" />
```

---

## UI 设计还原规范

当用户提供设计稿时，必须 **100% 还原**视觉效果：

### 还原要求

| 类别 | 要求 | 误差范围 |
|-----|------|---------|
| 间距 | margin、padding 精确匹配 | ±2px |
| 尺寸 | 宽度、高度、行高精确 | ±2px |
| 颜色 | 使用精确 HEX/RGB 色值 | 精确匹配 |
| 字体 | 大小、粗细、行高精确 | 精确匹配 |
| 圆角 | border-radius 精确值 | 精确匹配 |
| 阴影 | box-shadow 参数精确 | 精确匹配 |
| 交互 | hover/active/disabled 状态完整 | 全部实现 |

### 样式编写

```less
// ✅ 正确：使用设计稿精确数值
.custom-button {
  width: 120px;
  height: 40px;
  padding: 9px 24px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 22px;
  background: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

// ❌ 错误：使用模糊值
.wrong-button {
  padding: 10px;      // 设计稿是 9px 24px
  border-radius: 5px; // 设计稿是 4px
  color: blue;        // 应用精确色值 #1890ff
}
```

---

## API 请求规范

### React

```typescript
// services/user.ts
import request from '@/utils/request';

export interface ListParams {
  keyword?: string;
  status?: number;
  pageNum: number;
  pageSize: number;
}

export const getUserList = (params: ListParams) => {
  return request.get<ApiResponse<UserInfo[]>>('/api/users', { params });
};

export const createUser = (data: Partial<UserInfo>) => {
  return request.post<ApiResponse<UserInfo>>('/api/users', data);
};

export const updateUser = (id: string, data: Partial<UserInfo>) => {
  return request.put<ApiResponse<UserInfo>>(`/api/users/${id}`, data);
};

export const deleteUser = (id: string) => {
  return request.delete<ApiResponse<void>>(`/api/users/${id}`);
};
```

### Vue

```typescript
// api/user.ts
import request from '@/utils/request';

export const getUserList = (params: ListParams) => {
  return request({ url: '/api/users', method: 'get', params });
};

export const createUser = (data: Partial<UserInfo>) => {
  return request({ url: '/api/users', method: 'post', data });
};

export const updateUser = (id: string, data: Partial<UserInfo>) => {
  return request({ url: `/api/users/${id}`, method: 'put', data });
};

export const deleteUser = (id: string) => {
  return request({ url: `/api/users/${id}`, method: 'delete' });
};
```

---

## 质量保障

### 必须遵守

1. **业务逻辑分离**：所有业务逻辑必须在 hooks/composables/mixins 中
2. **类型安全**：TypeScript 项目必须有完整的类型定义
3. **错误处理**：所有异步操作必须有 try-catch
4. **加载状态**：所有数据请求必须有 loading 状态
5. **空状态处理**：列表为空时显示空状态组件

### 禁止行为

- 禁止在组件中直接调用 API
- 禁止遗留 `console.log`、`debugger`
- 禁止使用 `any` 类型（特殊情况除外）
- 禁止重复引入全局类型
- 禁止硬编码魔法数字/字符串

### 代码质量要求

1. **完整性**：包含类型定义、错误处理、加载状态
2. **健壮性**：处理边界情况（空数据、网络错误）
3. **可维护性**：代码结构清晰，适当注释
4. **性能**：合理使用缓存、避免不必要的渲染

---

本规范作为 AI 代码生成的通用标准，确保生成的代码：
- ✅ 符合前端最佳实践
- ✅ 目录结构规范清晰
- ✅ 代码风格统一
- ✅ 类型定义完整
- ✅ 可维护性强

严格遵循本规范，生成高质量、可用的前端代码。
