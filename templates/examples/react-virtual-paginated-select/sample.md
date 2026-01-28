# React 大数据渲染下拉组件（分页 + 虚拟列表 + 编辑回显）

## 模板说明

本模板适用于处理大数据量场景下的两类核心需求：

1. **大数据量表格虚拟列表渲染**（不分页）
   - 场景：一次性加载 8000+ 条数据，支持批量编辑
   - 技术：React-Window / React-Virtualized / Ant Design ProTable 虚拟滚动

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
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   ├── VirtualTable.tsx           # 虚拟列表表格
│   └── PaginatedSelect.tsx        # 分页下拉组件
├── hooks/
│   ├── useVirtualTable.ts         # 虚拟表格数据管理
│   └── usePaginatedSelect.ts      # 分页下拉数据管理
├── types.ts                       # TypeScript 类型定义
├── index.less                     # 样式文件
└── index.tsx                      # 页面主文件
```

## 关键要点

### 1. 虚拟列表表格（VirtualTable）

- 使用 `react-window` 或 `@tanstack/react-virtual` 实现虚拟滚动
- 必须设置**固定行高**（虚拟滚动需要预先计算位置）
- 只渲染可视区域 + buffer 行，保证大数据量流畅滚动
- 支持单元格内编辑（Input、Select等）

### 2. 分页下拉选择（PaginatedSelect）

- 基于 Ant Design Select 的 `filterOption={false}` + `onSearch` 实现远程搜索
- 下拉面板底部集成分页器
- 防抖处理搜索请求（300-500ms）
- **编辑回显机制**：合并选中项与分页数据，确保跨页可见

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

## 技术选型

### 虚拟列表库

| 库 | 优点 | 适用场景 |
|---|---|---|
| `react-window` | 轻量、性能好 | 固定行高列表 |
| `react-virtualized` | 功能全、支持 Grid | 复杂表格、二维虚拟 |
| `@tanstack/react-virtual` | 现代、Hooks友好 | 新项目推荐 |
| `ProTable virtual` | 集成度高 | Ant Design Pro 项目 |

### 下拉组件

- Ant Design Select：`filterOption={false}` + 自定义 `dropdownRender`
- 分页器：自定义渲染在下拉面板底部

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个属性值管理页，8000+条数据不分页虚拟滚动，支持行内编辑；上级分类用分页下拉选择

页面类型：大数据渲染页面（虚拟列表 + 分页下拉 + 编辑回显）

技术栈：React + Ant Design + react-window + TypeScript

文件夹名称: attribute-value-list

接口及数据结构：
- 属性值列表：getAttributeValues（全量返回）
- 上级分类分页：getParentCategories（分页 + 搜索）
- 保存属性值：saveAttributeValue

页面需求：
- 虚拟表格：8000+ 行数据，固定行高 60px，支持行内编辑
- 分页下拉：远程搜索 + 分页，编辑时正确回显选中项
- 批量操作：批量启用/停用

强制要求（P0）：
- 虚拟列表必须设置固定行高
- 分页下拉必须实现选中项合并逻辑
- 搜索必须防抖处理
- 生成后必须 TypeScript/ESLint 自检并修复
```

## 性能优化建议

1. **虚拟列表**
   - 行高固定，避免动态计算
   - 使用 `React.memo` 优化行组件
   - 避免在 cellRenderer 中创建新函数

2. **分页下拉**
   - 搜索防抖 300-500ms
   - 首次展开才加载数据
   - 缓存已加载的分页数据（可选）

3. **编辑表单**
   - 表单状态局部化，避免整表重渲染
   - 使用 `useMemo` 缓存计算结果
