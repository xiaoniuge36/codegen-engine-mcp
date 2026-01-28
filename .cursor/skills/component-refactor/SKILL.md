---
name: component-refactor
description: 组件重构和优化技能。当用户需要重构组件、拆分组件、优化组件结构、提取公共逻辑、或询问如何改进组件设计时使用此skill。
---

# Component Refactor Skill

组件重构和优化指导，帮助 AI 完成组件拆分、逻辑抽取、代码复用等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 🔀 组件拆分 | 识别大组件，按职责拆分为小组件 |
| 🎣 Hooks 提取 | 将组件内逻辑抽取为可复用的 hooks |
| 🔄 代码复用 | 识别重复代码，抽取为公共组件/工具函数 |
| 📐 结构优化 | 优化组件目录结构和文件组织 |
| 🧹 代码清理 | 移除冗余代码、简化复杂逻辑 |

---

## 重构原则

### 单一职责原则

| 检查项 | 说明 |
|--------|------|
| 组件行数 | 超过 300 行考虑拆分 |
| 职责数量 | 一个组件只做一件事 |
| 状态复杂度 | 状态过多时考虑拆分 |
| 渲染逻辑 | 复杂渲染逻辑抽取为子组件 |

### 拆分信号

当组件出现以下情况时，应考虑重构：

```
❌ 问题信号：
- 组件代码超过 300 行
- 需要多次滚动才能看完
- 多个不相关的 state 混在一起
- 相同逻辑在多处重复
- 组件名包含 "And" 或 "With"
- 难以编写单元测试

✅ 重构目标：
- 每个组件 100-200 行
- 单一职责，功能聚焦
- 逻辑可复用
- 易于测试和维护
```

---

## 重构工作流程

### 标准重构流程

```
1. 分析组件结构          → 识别职责边界
2. 识别可抽取逻辑        → hooks/composables/utils
3. 规划拆分方案          → 确定子组件划分
4. 执行重构              → 先抽取后拆分
5. 验证功能              → 确保行为一致
6. 代码检查              → TSC/ESLint 验证
```

### 抽取优先级

```
优先抽取顺序：
1. 数据请求逻辑    → useXxxData hooks
2. 表单处理逻辑    → useXxxForm hooks
3. 状态管理逻辑    → useXxxState hooks
4. 复杂计算逻辑    → useMemo / computed
5. 事件处理逻辑    → useCallback / methods
6. UI 子组件       → 独立组件文件
```

---

## 常见重构场景

### 场景1：抽取数据请求逻辑

**重构前：**

```tsx
// ❌ 数据请求逻辑混在组件中
function UserList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchData = async () => {
    setLoading(true);
    const res = await api.getUsers(pagination);
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [pagination]);

  // ... 300+ 行渲染逻辑
}
```

**重构后：**

```tsx
// ✅ hooks/useUserList.ts
export function useUserList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await api.getUsers(pagination);
    setData(res.data);
    setLoading(false);
  }, [pagination]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, pagination, setPagination, refresh: fetchData };
}

// ✅ index.tsx - 组件变得简洁
function UserList() {
  const { data, loading, pagination, setPagination } = useUserList();
  // ... 只剩渲染逻辑
}
```

### 场景2：拆分大型表单

**重构前：**

```tsx
// ❌ 所有表单字段在一个组件
function OrderForm() {
  // 基本信息
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // 收货地址
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  // 商品信息
  const [products, setProducts] = useState([]);
  // 支付信息
  const [payMethod, setPayMethod] = useState('');
  
  // ... 500+ 行
}
```

**重构后：**

```tsx
// ✅ 按职责拆分为子组件
function OrderForm() {
  const form = useOrderForm();
  
  return (
    <Form>
      <BasicInfoSection form={form} />
      <AddressSection form={form} />
      <ProductSection form={form} />
      <PaymentSection form={form} />
      <FormActions form={form} />
    </Form>
  );
}
```

### 场景3：抽取公共组件

**识别信号：**

```
✅ 应该抽取为公共组件：
- 相同 UI 结构出现 2 次以上
- 相同交互逻辑在多处使用
- 可配置化的 UI 模块
- 业务无关的通用功能
```

**抽取模板：**

```tsx
// components/common/SearchInput.tsx
interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({ 
  placeholder = '请输入搜索关键词',
  onSearch,
  debounceMs = 300 
}: SearchInputProps) {
  // 通用搜索输入组件
}
```

---

## 重构检查清单

### 重构前检查

```
□ 理解组件当前功能和业务逻辑
□ 确认测试覆盖（如有）
□ 识别所有对外接口（props、事件）
□ 梳理组件依赖关系
```

### 重构中检查

```
□ 保持 props 接口兼容
□ 不改变组件外部行为
□ hooks 命名规范（use 前缀）
□ 子组件职责单一
□ 避免 props drilling（考虑 Context）
```

### 重构后检查

```
□ 功能回归测试通过
□ TypeScript 类型正确
□ ESLint 无新增错误
□ 代码行数明显减少
□ 逻辑更易理解和维护
```

---

## 技术栈适配

### React 重构模式

| 场景 | 重构方式 |
|------|----------|
| 数据逻辑 | 抽取为 custom hooks |
| 复杂状态 | 使用 useReducer |
| 跨层传递 | 使用 Context |
| 渲染优化 | React.memo + useMemo |

### Vue 重构模式

| 场景 | 重构方式 |
|------|----------|
| 数据逻辑 | 抽取为 composables |
| 复杂状态 | 使用 Pinia store |
| 跨层传递 | 使用 provide/inject |
| 渲染优化 | computed + v-memo |

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 重构请求 | "重构组件"、"优化组件"、"改进代码" |
| 拆分请求 | "拆分组件"、"组件太大"、"代码太长" |
| 抽取请求 | "抽取逻辑"、"提取hooks"、"封装公共" |
| 复用请求 | "代码复用"、"重复代码"、"提取公共" |

---

## 注意事项

### 重构陷阱

| 陷阱 | 说明 | 避免方式 |
|------|------|----------|
| 过度拆分 | 拆得太细增加理解成本 | 保持适度粒度 |
| 破坏封装 | 暴露过多内部状态 | 只暴露必要接口 |
| Props Drilling | 多层传递 props | 使用 Context/Store |
| 过早抽象 | 只用一次就抽取 | 等出现重复再抽取 |

### 最佳实践

```
✅ 推荐做法：
- 小步重构，频繁验证
- 先写测试，再重构
- 保持 git 提交粒度小
- 重构和功能开发分开

❌ 避免做法：
- 大范围一次性重构
- 重构同时添加新功能
- 不验证就继续重构
- 修改公共组件不通知
```
