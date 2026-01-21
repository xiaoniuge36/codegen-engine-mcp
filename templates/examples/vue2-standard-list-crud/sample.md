# Vue 2 标准列表页（搜索 + 表格 + 新增/编辑弹窗）

## 模板说明

本模板适用于 Vue 2 + Element UI 的标准 CRUD 列表页面，**优先使用项目封装的 getwayTable 组件**。

## 使用场景

- 用户管理列表
- 角色管理列表
- 权限管理列表
- 配置管理列表
- 等标准 CRUD 页面

## 文件结构

```
src/views/[业务模块]/[文件夹名称]/
├── components/
│   └── EditDialog.vue       # 编辑弹窗
├── index.vue                # 页面主文件
└── index.less               # 样式文件（可选）
```

---

## getwayTable 组件使用指南（核心）

### 基础用法

```vue
<getway-table
  ref="getwayTable"
  :model.sync="searchForm"
  :init-state="initSearchForm"
  :column="columns"
  :api-config="apiConfig"
  :operation="operationConfig"
  row-key="id"
>
  <!-- 搜索表单插槽 -->
  <template slot="getwayform">
    <el-form-item label="姓名">
      <el-input v-model="searchForm.name" />
    </el-form-item>
  </template>
  
  <!-- 操作列插槽 -->
  <template slot="operation" slot-scope="row">
    <el-button type="text" @click="handleEdit(row)">编辑</el-button>
  </template>
</getway-table>
```

### 核心 Props

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `model.sync` | Object | {} | 搜索表单数据（双向绑定） |
| `init-state` | Object | {} | 搜索表单初始值（用于重置） |
| `column` | Array | [] | 表格列配置 |
| `api-config` | Object | - | 接口配置 |
| `operation` | Object/Boolean | {label:'操作'} | 操作列配置，false 隐藏 |
| `row-key` | String | - | 行唯一标识（多选必填） |
| `type` | String | - | 'selection' 多选 / 'radio' 单选 |
| `is-serial` | Boolean | true | 是否显示序号列 |
| `need-page` | Boolean | true | 是否显示分页 |
| `need-init-data` | Boolean | true | 是否初始化加载数据 |
| `is-filter` | Boolean | true | 是否显示搜索表单 |
| `is-top-button` | Boolean | true | 是否显示搜索/重置按钮 |
| `show-summary` | Boolean | false | 是否显示合计行 |
| `form-props` | Object | {} | el-form 属性透传 |
| `table` | Object | {} | el-table 属性透传 |
| `pagination-props` | Object | {} | el-pagination 属性透传 |

### apiConfig 配置

```javascript
apiConfig: {
  url: '/api/list',      // 接口路径（不含 /api 前缀）
  method: 'post',        // 请求方法
  data: {},              // 额外参数
  neddJoin: false,       // 是否拼接空字符串
  switchall: false,      // 是否过滤空值
}
```

### column 列配置

```javascript
columns: [
  // 基础列
  { prop: 'name', label: '姓名', width: 120 },
  
  // 带渲染函数
  { 
    prop: 'status', 
    label: '状态',
    render: (scope) => {
      return scope.row.status === 1 ? '启用' : '禁用';
    }
  },
  
  // 可点击列（触发父组件 table+prop 方法）
  { prop: 'orderNo', label: '订单号', custom: true },
  
  // 可复制列
  { prop: 'code', label: '编码', copy: true },
  
  // 数字类型（空值显示 0）
  { prop: 'amount', label: '金额', type: 'num' },
]
```

### 插槽（Slots）

| 插槽名 | 说明 |
|-------|------|
| `getwayform` | 搜索表单区域 |
| `custombtn` | 表格上方自定义按钮区域 |
| `formconfigbtn` | 搜索按钮后追加按钮 |
| `formconfigLeftbtn` | 搜索按钮前追加按钮 |
| `operation` | 操作列内容 |
| `[prop]` | 自定义列内容（以 prop 值命名） |

### 事件（Events）

| 事件名 | 参数 | 说明 |
|-------|------|------|
| `selectionChange` | rows | 多选变化 |
| `row-click` | row | 行点击 |
| `submit` | model | 搜索提交 |
| `requestParam` | (params, callback, requestParam) | 请求前拦截 |

### 方法（Methods）

```javascript
// 刷新表格
this.$refs.getwayTable.getDataSource();

// 带参数刷新
this.$refs.getwayTable.getDataSource({ extraParam: 'value' });
```

---

## getwayDialog 弹窗组件使用指南

getwayDialog 是封装的弹窗表单组件，**内置触发按钮 + 弹窗 + 表单 + 提交逻辑**。

### 适用场景

- 独立的"新增"按钮触发弹窗
- 简单表单提交（无需编辑回显）

### 基础用法

```vue
<getway-dialog
  button-text="新增员工"
  :model="formData"
  :api-config="apiConfig"
  :dialog-props="{ title: '新增员工', width: '600px' }"
  :form-props="{ labelWidth: '100px' }"
  @onSubmit="handleSuccess"
>
  <el-form-item label="姓名" prop="name">
    <el-input v-model="formData.name" placeholder="请输入姓名" />
  </el-form-item>
  <el-form-item label="类型" prop="type">
    <el-select v-model="formData.type" placeholder="请选择">
      <el-option label="全职" :value="1" />
      <el-option label="兼职" :value="2" />
    </el-select>
  </el-form-item>
</getway-dialog>
```

### 核心 Props

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `button-text` | String | '新增' | 触发按钮文字 |
| `button-type` | String | 'primary' | 按钮类型 |
| `button-size` | String | 'mini' | 按钮大小 |
| `model` | Object | - | 表单数据对象 |
| `api-config` | Object | - | 接口配置 |
| `dialog-props` | Object | {} | el-dialog 属性透传（title、width等） |
| `form-props` | Object | {} | el-form 属性透传（labelWidth、rules等） |
| `submit-text` | String | '提交' | 提交按钮文字 |
| `is-submit` | Boolean | true | 是否显示底部按钮 |
| `is-reset-btn` | Boolean | true | 是否显示重置按钮 |
| `on-click-modal` | Boolean | true | 点击遮罩是否关闭 |
| `before-submit` | Function | - | 提交前回调，返回 false 阻止提交 |

### 事件

| 事件名 | 参数 | 说明 |
|-------|------|------|
| `onSubmit` | data | 提交成功后触发 |
| `open` | - | 弹窗打开时触发 |
| `close` | - | 弹窗关闭时触发 |
| `requestParam` | (params, callback) | 请求前拦截 |

### 注意：编辑场景使用独立 EditDialog

getwayDialog **不适合编辑场景**（需要回显数据），编辑建议使用独立封装的 EditDialog 组件：

```vue
<!-- 列表页 -->
<edit-dialog
  :visible.sync="dialogVisible"
  :edit-data="editData"
  @success="refreshTable"
/>

<!-- EditDialog 组件内部 -->
<el-dialog :visible.sync="dialogVisible" :title="isEdit ? '编辑' : '新增'">
  <el-form ref="formRef" :model="formData" :rules="rules">
    <!-- 表单项 -->
  </el-form>
</el-dialog>
```

---

## 关键要点

1. **优先使用 getwayTable**
   - 搜索 + 表格 + 分页一体化
   - 接口请求自动处理
   - 分页自动管理

2. **弹窗选择**
   - 独立新增按钮 → getwayDialog
   - 编辑/新增共用弹窗 → 独立 EditDialog 组件

3. **Options API 规范**
   - data 定义数据
   - methods 定义方法
   - 不要使用 Composition API

4. **表单验证**
   - 使用回调方式：`this.$refs.formRef.validate((valid) => {})`
   - 不使用 async/await 方式

---

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个员工列表页，支持姓名/工号查询，新增编辑弹窗，支持删除和批量导出

页面类型：标准列表页（搜索 + 表格 + 新增/编辑弹窗）

技术栈：Vue 2 + Element UI + Options API + getwayTable

文件夹名称: employee-list

接口及数据结构：
- 列表接口：/employee/list (POST)
- 新增接口：/employee/create
- 编辑接口：/employee/update
- 删除接口：/employee/delete

页面需求：
- 搜索表单：姓名（文本）、类型（下拉）
- 数据表格：序号 + 姓名 + 类型 + 创建时间 + 操作列（编辑/删除）
- 编辑弹窗：el-dialog（新增/编辑共用），提交成功刷新表格
- 批量操作（可选）：表格多选 + 批量删除

强制要求（P0）：
- 必须使用 getwayTable 封装组件
- 使用 apiConfig 配置接口，不要手动请求列表
- 使用 slot="getwayform" 配置搜索表单
- 使用 slot="operation" 配置操作列
- 刷新表格使用 this.$refs.getwayTable.getDataSource()
- 生成后必须 ESLint 自检并修复
```
