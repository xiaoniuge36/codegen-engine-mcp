# Vue 2 大数据渲染下拉组件（分页 + 虚拟列表 + 编辑回显）

## 模板说明

本模板适用于 Vue 2 + Element UI 处理大数据量场景下的两类核心需求：

1. **大数据量表格虚拟列表渲染**（不分页）
   - 场景：一次性加载 8000+ 条数据，支持批量编辑
   - 技术：`vue-virtual-scroller` 虚拟滚动

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
│   ├── VirtualTable.vue           # 虚拟列表表格
│   ├── PaginatedSelect.vue        # 分页下拉组件
│   └── SelectPagination.vue       # 下拉分页器
├── mixins/
│   ├── virtualTableMixin.js       # 虚拟表格数据管理
│   └── paginatedSelectMixin.js    # 分页下拉数据管理
├── index.vue                      # 页面主文件
└── index.less                     # 样式文件
```

## 关键要点

### 1. 虚拟列表表格（vue-virtual-scroller）

- 使用 `vue-virtual-scroller` 实现虚拟滚动
- 必须设置**固定行高** `item-size`
- 需要自己实现表头和列布局

```vue
<RecycleScroller
  class="virtual-table-body"
  :items="tableData"
  :item-size="60"
  key-field="rowKey"
  v-slot="{ item, index }"
>
  <div class="virtual-table-row">
    <!-- 自定义行内容 -->
  </div>
</RecycleScroller>
```

安装依赖：
```bash
npm install vue-virtual-scroller@^1.1.2
```

### 2. 分页下拉选择

- 基于 `el-select` 的 `remote` 模式 + 自定义分页组件
- 下拉面板底部使用自定义组件放置分页器
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
  <!-- Vue2 的 el-select 没有 footer 插槽，需要用其他方式 -->
  <el-option disabled value="" class="select-pagination-option">
    <SelectPagination ... />
  </el-option>
</el-select>
```

### 3. 编辑回显核心逻辑

```javascript
// 问题：编辑时选中项可能不在当前分页数据中
// 解决：合并选中项 + 分页数据，保证选中项始终可见

mergeOptions(pageItems) {
  const map = new Map();
  
  // 先放选中项（优先级最高）
  if (this.selectedItem && this.selectedItem.value) {
    map.set(this.selectedItem.value, this.selectedItem);
  }
  
  // 再放分页数据（去重）
  (pageItems || []).forEach(item => {
    if (item && item.value && !map.has(item.value)) {
      map.set(item.value, item);
    }
  });
  
  return Array.from(map.values());
}
```

## 技术要求

### 依赖安装

```bash
# 虚拟滚动（Vue 2 版本）
npm install vue-virtual-scroller@^1.1.2

# 防抖工具（可选，也可自己实现）
npm install lodash-es
```

### 版本要求

- Vue 2.6+
- Element UI 2.13+
- vue-virtual-scroller ^1.1.2

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个属性值管理页，8000+条数据不分页虚拟滚动，支持行内编辑；上级分类用分页下拉选择

页面类型：大数据渲染页面（虚拟列表 + 分页下拉 + 编辑回显）

技术栈：Vue 2 + Element UI + Options API + JavaScript

文件夹名称: attribute-value-list

接口及数据结构：
- 属性值列表：getAttributeValues（全量返回）
- 上级分类分页：getParentCategories（分页 + 搜索）
- 保存属性值：saveAttributeValue

页面需求：
- 虚拟表格：8000+ 行数据，vue-virtual-scroller，固定行高 60px，支持行内编辑
- 分页下拉：远程搜索 + 分页，编辑时正确回显选中项
- 批量操作：批量启用/停用

强制要求（P0）：
- 虚拟列表必须使用 vue-virtual-scroller 并设置固定行高
- 分页下拉必须实现选中项合并逻辑
- 搜索必须防抖处理
- 生成后必须 ESLint 自检并修复
```

## 性能优化建议

1. **vue-virtual-scroller 虚拟列表**
   - 行高固定，避免动态计算
   - 使用 key-field 指定唯一键
   - 行组件避免复杂计算

2. **分页下拉**
   - 搜索防抖 300-500ms
   - 首次展开才加载数据（`@visible-change`）
   - 使用 `reserve-keyword` 保留搜索关键字

3. **编辑表单**
   - 表单状态局部化，避免整表重渲染
   - 使用 computed 缓存计算结果

## Vue 2 vs Vue 3 差异

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 虚拟列表 | vue-virtual-scroller@1.x | el-table-v2 |
| API 风格 | Options API | Composition API |
| 状态复用 | Mixins | Composables |
| UI 库 | Element UI | Element Plus |
| Select 分页 | 自定义 option 插槽 | #footer 插槽 |
