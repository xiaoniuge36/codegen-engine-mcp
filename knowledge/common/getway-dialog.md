# getwayDialog 组件知识图谱

> Vue 2 + Element UI 封装的弹窗表单组件，内置触发按钮 + 弹窗 + 表单 + 提交逻辑

## 组件概述

getwayDialog 是项目封装的弹窗表单组件，将触发按钮、el-dialog、el-form、接口提交整合为一体，适用于简单的新增场景。

**核心优势：**
- 内置触发按钮，无需单独控制弹窗显隐
- 接口提交自动处理（通过 apiConfig 配置）
- 表单验证自动处理
- 自带提交/重置/取消按钮

**适用场景：**
- 独立的"新增"按钮
- 简单表单提交
- 不需要编辑回显的场景

**不适用场景：**
- 编辑功能（需要数据回显）
- 新增/编辑共用弹窗
- 复杂的弹窗交互

---

## 基础用法

```vue
<template>
  <getway-dialog
    button-text="新增员工"
    :model="formData"
    :api-config="apiConfig"
    :dialog-props="dialogProps"
    :form-props="formProps"
    @onSubmit="handleSuccess"
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择" style="width: 100%">
            <el-option label="全职" :value="1" />
            <el-option label="兼职" :value="2" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </getway-dialog>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        name: '',
        type: undefined,
      },
      apiConfig: {
        url: '/employee/create',
        method: 'post',
      },
      dialogProps: {
        title: '新增员工',
        width: '600px',
      },
      formProps: {
        labelWidth: '100px',
        rules: {
          name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
          type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        },
      },
    };
  },
  methods: {
    handleSuccess(data) {
      this.$message.success('新增成功');
      // 刷新列表
      this.$refs.getwayTable.getDataSource();
    },
  },
};
</script>
```

---

## Props 完整列表

### 按钮相关

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `button-text` | String | '新增' | 触发按钮文字 |
| `button-type` | String | 'primary' | 按钮类型（primary/success/warning/danger/info） |
| `button-size` | String | 'mini' | 按钮大小（mini/small/medium） |

### 表单相关

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `model` | Object | - | 表单数据对象（必填） |
| `form-props` | Object | {} | el-form 属性透传（labelWidth、rules 等） |

### 弹窗相关

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `dialog-props` | Object | {} | el-dialog 属性透传（title、width 等） |
| `on-click-modal` | Boolean | true | 点击遮罩是否关闭弹窗 |

### 接口相关

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `api-config` | Object | - | 接口配置对象 |
| `before-submit` | Function | - | 提交前回调，返回 false 阻止提交 |

```javascript
apiConfig: {
  url: '/employee/create',  // 接口路径（组件内部会加 /api 前缀）
  method: 'post',           // 请求方法
  data: {},                 // 额外固定参数
  neddJoin: false,          // 空值是否转为空字符串
  switchall: false,         // 是否过滤空值
}
```

### 底部按钮相关

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `submit-text` | String | '提交' | 提交按钮文字 |
| `is-submit` | Boolean | true | 是否显示底部按钮区域 |
| `is-reset-btn` | Boolean | true | 是否显示重置按钮 |
| `operation-span` | Number | - | 按钮区域占用列数 |

### 其他

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `track-params` | Array | [] | 埋点参数 |

---

## Events 事件

| 事件名 | 参数 | 说明 |
|-------|------|------|
| `onSubmit` | data（接口返回数据） | 提交成功后触发 |
| `open` | - | 弹窗打开时触发 |
| `close` | - | 弹窗关闭时触发 |
| `requestParam` | (params, callback) | 请求前拦截，可修改参数 |

### requestParam 用法

```vue
<getway-dialog @requestParam="handleRequestParam">
```

```javascript
handleRequestParam(params, callback) {
  // 添加额外参数
  callback({ orgId: this.currentOrgId });
}
```

---

## Slots 插槽

| 插槽名 | 说明 |
|-------|------|
| `default` | 表单内容区域 |

表单内容通过默认插槽传入：

```vue
<getway-dialog :model="formData">
  <!-- 表单内容 -->
  <el-form-item label="姓名" prop="name">
    <el-input v-model="formData.name" />
  </el-form-item>
</getway-dialog>
```

---

## Methods 方法

| 方法名 | 参数 | 说明 |
|-------|------|------|
| `openDialog` | - | 打开弹窗 |
| `closeDialog` | - | 关闭弹窗 |
| `resetForm` | - | 重置表单 |
| `onSubmit` | params? | 手动触发提交 |

---

## 常见场景

### 1. 带表单验证

```vue
<getway-dialog
  :model="formData"
  :form-props="{
    labelWidth: '100px',
    rules: {
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
      ],
    },
  }"
>
  <!-- 表单内容 -->
</getway-dialog>
```

### 2. 提交前校验/处理

```vue
<getway-dialog
  :before-submit="handleBeforeSubmit"
>
```

```javascript
handleBeforeSubmit() {
  if (this.formData.amount <= 0) {
    this.$message.error('金额必须大于0');
    return false; // 阻止提交
  }
  return true; // 继续提交
}
```

### 3. 添加额外请求参数

```vue
<getway-dialog @requestParam="handleRequestParam">
```

```javascript
handleRequestParam(params, callback) {
  callback({
    orgId: this.$store.state.currentOrgId,
    createBy: this.$store.state.userId,
  });
}
```

### 4. 弹窗打开时初始化

```vue
<getway-dialog @open="handleOpen">
```

```javascript
handleOpen() {
  // 获取下拉选项数据
  this.fetchOptions();
}
```

---

## 与 EditDialog 的区别

| 场景 | 推荐组件 | 原因 |
|-----|---------|------|
| 独立新增按钮 | getwayDialog | 内置按钮，一体化 |
| 列表页编辑 | EditDialog | 需要父组件控制显隐和数据回显 |
| 新增/编辑共用 | EditDialog | 需要根据 editData 判断模式 |

### EditDialog 用法（编辑场景）

```vue
<!-- 父组件 -->
<template>
  <div>
    <el-button @click="handleAdd">新增</el-button>
    <el-table>
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <edit-dialog
      :visible.sync="dialogVisible"
      :edit-data="editData"
      @success="refreshTable"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      editData: null,
    };
  },
  methods: {
    handleAdd() {
      this.editData = null;
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.editData = { ...row };
      this.dialogVisible = true;
    },
  },
};
</script>
```

---

## 注意事项

1. **model 必填**：必须传入 `model` 对象，用于表单数据绑定
2. **prop 必填**：表单项需要设置 `prop` 属性才能验证
3. **接口路径**：`apiConfig.url` 不需要 `/api` 前缀，组件内部会自动添加
4. **刷新列表**：提交成功后在 `@onSubmit` 中刷新列表
5. **不支持编辑**：如需编辑功能，使用独立的 EditDialog 组件
