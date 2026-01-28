# Vue 3 大数据渲染下拉组件（分页 + 虚拟列表 + 编辑回显）

## 模板说明

本模板适用于 Vue 3 + Element Plus 处理大数据量场景下的两类核心需求：

1. **大数据量表格虚拟列表渲染**（不分页）
   - 场景：一次性加载 8000+ 条数据，支持批量编辑
   - 技术：Element Plus `el-table-v2`（虚拟滚动表格）

2. **分页下拉选择 + 编辑回显**
   - 场景：下拉选项数量大，不适合一次性加载
   - 支持：远程搜索 + 分页 + 编辑场景回显

## 使用场景

- 属性值管理（8000+ 条属性值批量编辑）
- 分类管理（上级分类远程搜索分页选择）
- 商品关联（大量商品下拉选择）
- 标签管理（批量标签编辑）
- 等需要处理「大数据 + 复杂交互」的场景

## 文件结构

```
src/views/[业务模块]/[文件夹名称]/
├── components/
│   ├── VirtualTable.vue           # 虚拟列表表格（el-table-v2）
│   ├── PaginatedSelect.vue        # 分页下拉组件
│   └── SelectPagination.vue       # 下拉分页器
├── composables/
│   ├── useVirtualTable.ts         # 虚拟表格数据管理
│   └── usePaginatedSelect.ts      # 分页下拉数据管理
├── types.ts                       # TypeScript 类型定义
├── index.vue                      # 页面主文件
└── index.less                     # 样式文件
```

## 关键要点

### 1. 虚拟列表表格（el-table-v2）

- Element Plus 2.3.0+ 支持 `el-table-v2`
- 必须设置**固定行高** `row-height`（虚拟滚动需要）
- 列配置使用 `cellRenderer` 返回 VNode
- 支持 `fixed: 'left' | 'right'` 固定列

```vue
<el-table-v2
  :columns="columns"
  :data="tableData"
  :width="tableWidth"
  :height="500"
  :row-height="60"
  row-key="rowKey"
/>
```

### 2. 分页下拉选择

- 基于 `el-select` 的 `remote` 模式 + 自定义分页组件
- 下拉面板底部使用 `#footer` 插槽放置分页器
- 防抖处理搜索请求（300-500ms）
- **编辑回显机制**：合并选中项与分页数据，确保跨页可见

```vue
<el-select
  v-model="value"
  filterable
  remote
  :remote-method="handleSearch"
  reserve-keyword
>
  <el-option v-for="item in options" ... />
  <template #footer>
    <SelectPagination ... />
  </template>
</el-select>
```

### 3. 编辑回显核心逻辑

```typescript
// 问题：编辑时选中项可能不在当前分页数据中
// 解决：合并选中项 + 分页数据，保证选中项始终可见

const mergeOptions = (pageItems: Option[], selectedItem: Option | null) => {
  const map = new Map<string, Option>();
  
  // 先放选中项（优先级最高）
  if (selectedItem?.value) {
    map.set(selectedItem.value, selectedItem);
  }
  
  // 再放分页数据（去重）
  pageItems.forEach(item => {
    if (item?.value && !map.has(item.value)) {
      map.set(item.value, item);
    }
  });
  
  return Array.from(map.values());
};
```

## 技术要求

### Element Plus 版本

- `el-table-v2` 需要 Element Plus **2.3.0+**
- 推荐使用 Element Plus **2.4.0+**

### Vue 版本

- Vue 3.2+ 推荐
- 使用 Composition API + `<script setup>`

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个属性值管理页，8000+条数据不分页虚拟滚动，支持行内编辑；上级分类用分页下拉选择

页面类型：大数据渲染页面（虚拟列表 + 分页下拉 + 编辑回显）

技术栈：Vue 3 + Element Plus + Composition API + TypeScript

文件夹名称: attribute-value-list

接口及数据结构：
- 属性值列表：getAttributeValues（全量返回）
- 上级分类分页：getParentCategories（分页 + 搜索）
- 保存属性值：saveAttributeValue

页面需求：
- 虚拟表格：8000+ 行数据，el-table-v2，固定行高 60px，支持行内编辑
- 分页下拉：远程搜索 + 分页，编辑时正确回显选中项
- 批量操作：批量启用/停用

强制要求（P0）：
- 虚拟列表必须使用 el-table-v2 并设置固定行高
- 分页下拉必须实现选中项合并逻辑
- 搜索必须防抖处理
- Element Plus 类型必须 import（FormInstance、FormRules）
- 生成后必须 TypeScript/ESLint 自检并修复
```

## 性能优化建议

1. **el-table-v2 虚拟列表**
   - 行高固定，避免动态计算
   - 列宽使用数值，避免 `width` 警告
   - cellRenderer 中避免创建新函数

2. **分页下拉**
   - 搜索防抖 300-500ms
   - 首次展开才加载数据（`@visible-change`）
   - 使用 `reserve-keyword` 保留搜索关键字

3. **编辑表单**
   - 表单状态局部化，避免整表重渲染
   - 使用 `computed` 缓存计算结果
