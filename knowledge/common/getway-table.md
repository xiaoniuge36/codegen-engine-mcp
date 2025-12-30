# getwayTable 组件知识图谱

> Vue 2 + Element UI 封装的搜索表格组件，集成搜索表单、数据表格、分页功能

## 组件概述

getwayTable 是项目封装的标准列表组件，将搜索表单、el-table、el-pagination 整合为一体，通过配置化方式快速构建 CRUD 列表页。

**核心优势：**
- 接口请求自动处理（无需手动 fetch）
- 分页逻辑自动管理
- 搜索/重置按钮内置
- 支持多选/单选
- 支持合计行
- 支持列渲染/复制/点击

---

## 基础用法

```vue
<template>
  <getway-table
    ref="getwayTable"
    :model.sync="searchForm"
    :init-state="initSearchForm"
    :column="columns"
    :api-config="apiConfig"
    :operation="operationConfig"
    row-key="id"
    type="selection"
    @selectionChange="handleSelectionChange"
  >
    <!-- 搜索表单 -->
    <template slot="getwayform">
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入" clearable />
      </el-form-item>
    </template>
    
    <!-- 自定义按钮 -->
    <template slot="custombtn">
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </template>
    
    <!-- 操作列 -->
    <template slot="operation" slot-scope="row">
      <el-button type="text" @click="handleEdit(row)">编辑</el-button>
      <el-button type="text" @click="handleDelete(row.id)">删除</el-button>
    </template>
  </getway-table>
</template>

<script>
export default {
  data() {
    const initSearchForm = { name: '' };
    return {
      initSearchForm,
      searchForm: { ...initSearchForm },
      apiConfig: {
        url: '/list',
        method: 'post',
      },
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'createTime', label: '创建时间' },
      ],
      operationConfig: { label: '操作', width: 150 },
    };
  },
  methods: {
    refreshTable() {
      this.$refs.getwayTable.getDataSource();
    },
  },
};
</script>
```

---

## Props 完整列表

### 数据相关

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `model` | Object | {} | 搜索表单数据，使用 `.sync` 双向绑定 |
| `init-state` | Object | {} | 搜索表单初始值（重置时恢复） |
| `data` | Array | [] | 外部数据源（不使用 apiConfig 时） |
| `row-key` | String | - | 行唯一标识字段（多选/单选必填） |

### 接口配置

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `api-config` | Object | - | 接口配置对象 |
| `need-init-data` | Boolean | true | 是否初始化时自动请求 |

```javascript
apiConfig: {
  url: '/employee/list',  // 接口路径（组件内部会加 /api 前缀）
  method: 'post',         // 请求方法
  data: {},               // 额外固定参数
  neddJoin: false,        // 空值是否转为空字符串
  switchall: false,       // 是否过滤空值
}
```

### 表格配置

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `column` | Array | [] | 列配置数组 |
| `table` | Object | {} | el-table 属性透传 |
| `operation` | Object/Boolean | {label:'操作'} | 操作列配置，false 隐藏 |
| `type` | String | - | 'selection' 多选 / 'radio' 单选 |
| `is-serial` | Boolean | true | 是否显示序号列 |
| `show-summary` | Boolean | false | 是否显示合计行 |
| `summary-method` | Function | - | 自定义合计方法 |
| `span-method` | Function | - | 合并单元格方法 |
| `selectable` | Function | - | 多选禁用判断函数 |

### 表单配置

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `form-props` | Object | {} | el-form 属性透传 |
| `formconfig-props` | Object | {} | 按钮区域 el-form-item 属性 |
| `formcol-props` | Object | {} | 按钮区域 el-col 属性 |
| `is-filter` | Boolean | true | 是否显示搜索表单 |
| `is-top-button` | Boolean | true | 是否显示搜索/重置按钮 |
| `operation-span` | Number | - | 按钮区域占用列数 |

### 分页配置

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `need-page` | Boolean | true | 是否显示分页 |
| `pagination-props` | Object | {} | el-pagination 属性透传 |

### 其他

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `track-params` | Array | [] | 埋点参数 [eventId, params] |

---

## column 列配置详解

```javascript
columns: [
  // 基础列
  { prop: 'name', label: '姓名', width: 120 },
  
  // 带渲染函数（返回 HTML 字符串）
  { 
    prop: 'status', 
    label: '状态',
    render: (scope, value) => {
      const map = { 1: '<span style="color:green">启用</span>', 0: '禁用' };
      return map[value] || '-';
    }
  },
  
  // 可点击列（会触发父组件的 table[prop] 方法）
  { prop: 'orderNo', label: '订单号', custom: true },
  
  // 可复制列
  { prop: 'code', label: '编码', copy: true },
  
  // 数字类型（空值显示 0 而非 -）
  { prop: 'amount', label: '金额', type: 'num' },
  
  // 关闭省略提示
  { prop: 'remark', label: '备注', 'show-overflow-tooltip': false },
]
```

### column 属性

| 属性 | 类型 | 说明 |
|-----|------|------|
| `prop` | String | 字段名（必填） |
| `label` | String | 列标题 |
| `width` | Number/String | 列宽 |
| `render` | Function | 渲染函数 `(scope, value) => string` |
| `custom` | Boolean | 是否可点击（触发 `table[prop]` 方法） |
| `copy` | Boolean | 是否可复制 |
| `type` | String | 'num' 数字类型，空值显示 0 |
| `show-overflow-tooltip` | Boolean | 是否显示省略提示（默认 true） |

---

## Slots 插槽

| 插槽名 | slot-scope | 说明 |
|-------|-----------|------|
| `getwayform` | - | 搜索表单区域 |
| `custombtn` | - | 表格上方自定义按钮区域 |
| `formconfigbtn` | - | 搜索按钮后追加按钮 |
| `formconfigLeftbtn` | - | 搜索按钮前追加按钮 |
| `operation` | `{ ...row, $index, handleLoading }` | 操作列内容 |
| `[prop]` | `{ ...row, $index }` | 自定义列内容（以 prop 值命名） |

### 自定义列示例

```vue
<!-- 状态列自定义 -->
<template slot="status" slot-scope="row">
  <el-tag :type="row.status === 1 ? 'success' : 'info'">
    {{ row.status === 1 ? '启用' : '禁用' }}
  </el-tag>
</template>

<!-- 操作列 -->
<template slot="operation" slot-scope="row">
  <el-button type="text" @click="handleEdit(row)">编辑</el-button>
  <el-button type="text" @click="handleDelete(row.id)">删除</el-button>
</template>
```

---

## Events 事件

| 事件名 | 参数 | 说明 |
|-------|------|------|
| `selectionChange` | (rows, index) | 多选变化时触发 |
| `row-click` | row | 行点击时触发（单选模式） |
| `submit` | model | 搜索按钮点击后触发 |
| `requestParam` | (params, callback, requestParam) | 请求前拦截，可修改参数 |
| `input` | value | 单选模式下选中值变化（v-model） |

### requestParam 用法

```vue
<getway-table @requestParam="handleRequestParam">
```

```javascript
handleRequestParam(params, callback, requestParam) {
  // 添加额外参数
  callback({ orgId: this.currentOrgId });
  
  // 阻止请求（权限不足等场景）
  // callback({ notLimited: false });
}
```

---

## Methods 方法

| 方法名 | 参数 | 说明 |
|-------|------|------|
| `getDataSource` | (params?) | 刷新表格数据 |
| `handleLoading` | ({ $index, ...rest }) | 更新指定行数据 |

### 刷新表格

```javascript
// 刷新表格
this.$refs.getwayTable.getDataSource();

// 带额外参数刷新
this.$refs.getwayTable.getDataSource({ status: 1 });
```

---

## 接口响应格式

组件期望的接口响应格式：

```javascript
// 分页列表
{
  items: [...],     // 列表数据
  totalNum: 100,    // 总条数
}

// 或直接返回数组
[...]
```

---

## 常见场景

### 1. 无搜索表单的纯列表

```vue
<getway-table
  :column="columns"
  :api-config="apiConfig"
  :is-filter="false"
  :operation="false"
/>
```

### 2. 外部数据源（不自动请求）

```vue
<getway-table
  :data="tableData"
  :column="columns"
  :need-init-data="false"
  :need-page="false"
/>
```

### 3. 单选模式

```vue
<getway-table
  v-model="selectedId"
  type="radio"
  row-key="id"
  @row-click="handleRowClick"
/>
```

### 4. 合计行

```vue
<getway-table
  :show-summary="true"
  :summary-method="getSummary"
/>
```

```javascript
getSummary({ columns, data }) {
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计';
    } else if (column.property === 'amount') {
      sums[index] = data.reduce((sum, row) => sum + (row.amount || 0), 0);
    } else {
      sums[index] = '';
    }
  });
  return sums;
}
```

---

## 注意事项

1. **row-key 必填**：使用多选/单选时必须指定 `row-key`
2. **接口路径**：`apiConfig.url` 不需要 `/api` 前缀，组件内部会自动添加
3. **刷新表格**：操作成功后调用 `this.$refs.getwayTable.getDataSource()` 刷新
4. **重置表单**：使用 `init-state` 配合 `model.sync`，重置时恢复初始值
5. **自定义列**：slot 名使用 prop 值，如 `slot="status"`
