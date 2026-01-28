# 大数据渲染与分页下拉组件知识库

本文档详细介绍前端大数据渲染场景的技术方案，涵盖 React、Vue2、Vue3 三种技术栈。

---

## 1. 适用场景

### 1.1 大数据量表格（虚拟列表）

**问题**：一次性渲染 8000+ 行数据导致页面卡顿

**解决方案**：虚拟滚动（Virtual Scroll）
- 只渲染可视区域 + 少量缓冲行
- 随滚动动态替换渲染内容
- 保持滚动条高度准确

**适用场景**：
- 属性值批量编辑（8000+ 条）
- 日志查看器
- 大型数据导出预览
- 任何需要不分页展示大量数据的场景

### 1.2 分页下拉选择

**问题**：下拉选项数量巨大（1000+），一次性加载卡顿

**解决方案**：远程搜索 + 分页加载
- 下拉框首次展开时加载第一页
- 支持搜索关键字过滤
- 分页切换加载更多数据
- **编辑回显**：选中项不在当前页也能正确显示

**适用场景**：
- 上级分类选择
- 商品关联
- 用户/角色选择
- 任何数据量大的下拉场景

---

## 2. 技术方案对比

### 2.1 虚拟列表技术选型

| 技术栈 | 推荐方案 | 备选方案 |
|--------|----------|----------|
| React | `react-window` | `@tanstack/react-virtual` |
| Vue 3 | `el-table-v2` | `vue-virtual-scroller@2.x` |
| Vue 2 | `vue-virtual-scroller@1.x` | 自定义虚拟滚动 |

### 2.2 方案详情

#### React - react-window

```tsx
import { FixedSizeList as List } from 'react-window';

<List
  height={500}
  itemCount={data.length}
  itemSize={60}  // 固定行高
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* 行内容 */}
    </div>
  )}
</List>
```

**优点**：
- 轻量（~6KB gzip）
- 性能优秀
- API 简洁

**注意**：
- 行高必须固定
- 需要自己实现表头

#### Vue 3 - el-table-v2

```vue
<el-table-v2
  :columns="columns"
  :data="data"
  :width="1000"
  :height="500"
  :row-height="60"
  row-key="id"
/>
```

**优点**：
- Element Plus 官方组件
- 开箱即用
- 支持固定列

**注意**：
- Element Plus 2.3.0+ 支持
- 行高必须固定
- 列宽用数值，避免警告

#### Vue 2 - vue-virtual-scroller

```vue
<RecycleScroller
  :items="data"
  :item-size="60"
  key-field="id"
  v-slot="{ item, index }"
>
  <div class="row">
    {{ item.name }}
  </div>
</RecycleScroller>
```

**优点**：
- 通用性强
- 支持动态高度（DynamicScroller）

**注意**：
- 需要安装 `vue-virtual-scroller@^1.1.2`
- 需要自己实现表头和列布局

---

## 3. 分页下拉核心逻辑

### 3.1 核心状态

```typescript
interface PaginatedSelectState {
  options: SelectOption[];      // 当前选项列表
  loading: boolean;             // 加载状态
  pageNo: number;               // 当前页码
  pageSize: number;             // 每页条数
  total: number;                // 总数
  keyword: string;              // 搜索关键字
  hasLoaded: boolean;           // 是否已加载过
  selectedItem: SelectOption;   // 当前选中项（编辑回显用）
}
```

### 3.2 编辑回显核心逻辑

**问题**：编辑时，选中项可能不在当前分页数据中，导致：
- v-model 有值但显示为空
- 下拉列表中看不到选中项

**解决方案**：合并选中项与分页数据

```typescript
const mergeOptions = (
  pageItems: SelectOption[],
  selectedItem: SelectOption | null
): SelectOption[] => {
  const map = new Map<string, SelectOption>();
  
  // 1. 先放选中项（优先级最高）
  if (selectedItem?.value) {
    map.set(selectedItem.value, selectedItem);
  }
  
  // 2. 再放分页数据（去重）
  pageItems.forEach(item => {
    if (item?.value && !map.has(item.value)) {
      map.set(item.value, item);
    }
  });
  
  return Array.from(map.values());
};
```

**使用时机**：
1. 详情接口返回后，设置 `selectedItem`
2. 每次分页请求后，调用 `mergeOptions` 合并数据

### 3.3 防抖搜索

```typescript
// React
const handleSearch = useMemo(
  () => debounce((keyword: string) => {
    setKeyword(keyword);
    setPageNo(1);
    fetchData();
  }, 500),
  []
);

// Vue 3
const handleSearch = debounce((keyword: string) => {
  state.keyword = keyword;
  state.pageNo = 1;
  fetchData();
}, 500);
```

### 3.4 首次展开懒加载

```typescript
// React
const handleDropdownVisibleChange = (open: boolean) => {
  if (open && !hasLoaded) {
    fetchData();
  }
};

// Vue
const handleVisibleChange = (visible: boolean) => {
  if (visible && !state.hasLoaded) {
    fetchData();
  }
};
```

---

## 4. 组件设计模式

### 4.1 分页下拉组件结构

```
PaginatedSelect/
├── index.tsx/vue           # 主组件
├── hooks/composables/      # 数据逻辑
│   └── usePaginatedSelect.ts
├── components/
│   └── SelectPagination.tsx/vue  # 分页器
└── types.ts                # 类型定义
```

### 4.2 虚拟表格组件结构

```
VirtualTable/
├── index.tsx/vue           # 主组件
├── hooks/composables/      # 数据逻辑
│   └── useVirtualTable.ts
├── components/
│   ├── TableHeader.tsx/vue # 表头
│   └── TableRow.tsx/vue    # 行组件
└── types.ts                # 类型定义
```

---

## 5. 模板使用指南

### 5.1 React 模板

模板ID：`react-virtual-paginated-select`

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个属性值管理页，8000+条数据虚拟滚动，支持行内编辑；上级分类用分页下拉选择",
    projectPath: "D:/project/src/App.tsx"
  }
})
```

技术栈：
- 虚拟列表：`react-window`
- 状态管理：自定义 Hook `usePaginatedSelect`
- UI 组件：Ant Design Select + Pagination

### 5.2 Vue 3 模板

模板ID：`vue3-virtual-paginated-select`

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个属性值管理页，虚拟滚动表格，分页下拉选择",
    projectPath: "D:/project/src/App.vue"
  }
})
```

技术栈：
- 虚拟列表：`el-table-v2`
- 状态管理：Composable `usePaginatedSelect`
- UI 组件：Element Plus Select + Pagination

### 5.3 Vue 2 模板

模板ID：`vue2-virtual-paginated-select`

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个属性值管理页，虚拟滚动表格，分页下拉选择",
    projectPath: "D:/project/src/App.vue"
  }
})
```

技术栈：
- 虚拟列表：`vue-virtual-scroller`
- 状态管理：Mixin `paginatedSelectMixin`
- UI 组件：Element UI Select + Pagination

---

## 6. 性能优化建议

### 6.1 虚拟列表优化

1. **固定行高**：虚拟滚动依赖预计算位置
2. **React.memo / shallowRef**：减少不必要的重渲染
3. **避免在 cellRenderer 中创建新函数**
4. **使用 useMemo/computed 缓存列配置**

### 6.2 分页下拉优化

1. **搜索防抖**：300-500ms
2. **首次展开懒加载**：避免预加载
3. **reserve-keyword**：保留搜索关键字
4. **缓存已加载数据**（可选）

### 6.3 编辑场景优化

1. **局部状态**：编辑状态放在行数据中
2. **避免整表重渲染**：使用 key 或 memo
3. **批量提交**：收集变更后统一提交

---

## 7. 常见问题

### Q1: 虚拟列表滚动条跳动

**原因**：行高计算不准确

**解决**：
- 确保 `rowHeight`/`itemSize` 与实际行高一致
- 避免行内动态高度内容

### Q2: 编辑时选中项显示为空

**原因**：选中项不在 options 中

**解决**：
- 详情接口返回后设置 `selectedItem`
- 使用 `mergeOptions` 合并选中项和分页数据

### Q3: 搜索请求过于频繁

**原因**：未做防抖处理

**解决**：
- 使用 `debounce` 包装搜索函数
- 推荐防抖时间 300-500ms

### Q4: Vue 2 下 el-select 没有 footer 插槽

**解决**：
- 使用禁用的 `el-option` 模拟底部区域
- 设置 `disabled` 防止选中
- 使用 CSS 去除禁用样式

---

## 8. 相关模板

| 模板ID | 技术栈 | 特点 |
|--------|--------|------|
| `react-virtual-paginated-select` | React | react-window + Ant Design |
| `vue3-virtual-paginated-select` | Vue 3 | el-table-v2 + Element Plus |
| `vue2-virtual-paginated-select` | Vue 2 | vue-virtual-scroller + Element UI |
