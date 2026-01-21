# Element Plus 知识图谱

## 🎯 组件库概述

Element Plus 是基于 Vue 3 的桌面端组件库，专为企业级 B 端页面设计。

**安装方式**：
```bash
npm install element-plus
```

---

## 📊 el-table - 表格组件

### 用途
数据展示表格，支持排序、筛选、分页等功能。

### 基本用法

```vue
<template>
  <div>
    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag>{{ typeMap[row.type] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, prev, pager, next, sizes"
      @current-change="fetchData"
      @size-change="fetchData"
    />
  </div>
</template>
```

### 常用 Column 类型

| type | 说明 | width |
|------|------|-------|
| `selection` | 多选列 | 50 |
| `index` | 序号列 | 60 |
| `expand` | 展开列 | - |

### 示例引用
- 完整示例：`templates/examples/vue3-standard-list/index.example.vue`

---

## 📝 el-form - 表单组件

### 用途
数据收集、验证和提交。

### 基本用法

```vue
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item label="姓名" prop="name">
      <el-input v-model="formData.name" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="类型" prop="type">
      <el-select v-model="formData.type" placeholder="请选择类型">
        <el-option label="类型1" :value="1" />
        <el-option label="类型2" :value="2" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

const formRef = ref<FormInstance>();
const formData = reactive({
  name: '',
  type: undefined as number | undefined,
});

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;
  // 提交逻辑
};
</script>
```

### 常用表单组件

| 组件 | 说明 | 适用场景 |
|------|------|----------|
| `el-input` | 文本输入框 | 姓名、编号等 |
| `el-input-number` | 数字输入框 | 金额、数量等 |
| `el-select` | 下拉选择 | 类型、状态等 |
| `el-date-picker` | 日期选择 | 日期字段 |
| `el-time-picker` | 时间选择 | 时间字段 |
| `el-switch` | 开关 | 是否启用等 |
| `el-radio-group` | 单选框组 | 单选项 |
| `el-checkbox-group` | 多选框组 | 多选项 |
| `el-upload` | 文件上传 | 附件、图片等 |

---

## 🪟 el-dialog - 对话框

### 用途
弹出式对话框，用于新增/编辑等操作。

### 基本用法

```vue
<template>
  <el-dialog
    :model-value="modelValue"
    :title="editData?.id ? '编辑' : '新增'"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules">
      <!-- 表单项 -->
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  editData?: DataItem;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClose = () => {
  emit('update:modelValue', false);
};
</script>
```

---

## 💬 ElMessage - 消息提示

### 用途
全局消息提示。

### 基本用法

```typescript
import { ElMessage, ElMessageBox } from 'element-plus';

// 成功提示
ElMessage.success('操作成功');

// 错误提示
ElMessage.error('操作失败');

// 警告提示
ElMessage.warning('请注意');

// 确认对话框
try {
  await ElMessageBox.confirm('确认删除该数据？', '提示', {
    type: 'warning',
  });
  await deleteItem(id);
  ElMessage.success('删除成功');
} catch (error) {
  // 用户取消
}
```

---

## 📦 类型定义

### FormInstance 和 FormRules

```typescript
import type { FormInstance, FormRules } from 'element-plus';

const formRef = ref<FormInstance>();

const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' },
  ],
};
```

---

## ⚠️ 常见注意事项

### 1. 类型引入规则
```typescript
// ✅ 正确：第三方库类型必须引入
import type { FormInstance, FormRules } from 'element-plus';

// ❌ 错误：缺少类型引入
const formRef = ref<FormInstance>();  // 类型未定义错误
```

### 2. v-model 双向绑定
```vue
<!-- ✅ 正确：使用 v-model -->
<el-dialog v-model="dialogVisible" title="标题">

<!-- ❌ 错误：Vue 2 的写法（Vue 3 不支持 .sync） -->
<el-dialog :visible.sync="dialogVisible" title="标题">
```

### 3. 表单验证
```typescript
// ✅ 正确：异步验证
const valid = await formRef.value?.validate();
if (!valid) return;

// ❌ 错误：同步验证（不等待结果）
formRef.value?.validate();
// 直接提交（可能验证未完成）
```

---

## 🔗 相关资源

- 官方文档：https://element-plus.org/
- Table 文档：https://element-plus.org/zh-CN/component/table.html
- Form 文档：https://element-plus.org/zh-CN/component/form.html
- 示例代码库：`templates/examples/vue3-standard-list/`

