---
name: form-generator
description: 表单生成技能。当用户需要生成表单、创建表单页面、做表单验证、实现动态表单、或询问如何处理表单逻辑时使用此skill。
---

# Form Generator Skill

表单生成和处理指导，帮助 AI 完成表单创建、校验规则、联动逻辑、表单提交等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 📝 表单生成 | 根据字段配置生成表单 UI |
| ✅ 表单验证 | 前端校验规则配置 |
| 🔗 字段联动 | 字段间的显示/隐藏、值联动 |
| 📤 表单提交 | 表单数据收集、提交处理 |
| 🔄 动态表单 | Schema 驱动的动态表单 |

---

## 表单生成流程

### 标准流程

```
1. 分析表单需求        → 确定字段列表和类型
2. 定义表单类型        → FormValues 类型定义
3. 配置校验规则        → 必填、格式、自定义规则
4. 实现联动逻辑        → 字段间的依赖关系
5. 处理表单提交        → 数据转换、接口调用
6. 处理回显逻辑        → 编辑模式数据回显
```

### 文件组织

```
src/pages/user/
├── components/
│   ├── UserForm.tsx           # 表单组件
│   └── UserFormModal.tsx      # 表单弹窗
├── hooks/
│   └── useUserForm.ts         # 表单逻辑 hooks
├── types.ts                   # 类型定义
└── index.tsx
```

---

## 表单类型定义

### 表单值类型

```typescript
// types.ts

/** 用户表单值 */
interface UserFormValues {
  name: string;
  email: string;
  phone?: string;
  department: number;
  role: number[];
  status: number;
  remark?: string;
}

/** 表单 Props */
interface UserFormProps {
  initialValues?: Partial<UserFormValues>;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

---

## React 表单实现

### 基于 Ant Design Form

```tsx
// components/UserForm.tsx
import { Form, Input, Select, Button, Space } from 'antd';
import type { UserFormValues, UserFormProps } from '../types';

const { Option } = Select;

export function UserForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: UserFormProps) {
  const [form] = Form.useForm<UserFormValues>();

  const handleFinish = async (values: UserFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item
        name="name"
        label="姓名"
        rules={[
          { required: true, message: '请输入姓名' },
          { max: 20, message: '姓名不超过20个字符' },
        ]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>

      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="手机号"
        rules={[
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
        ]}
      >
        <Input placeholder="请输入手机号" />
      </Form.Item>

      <Form.Item
        name="department"
        label="部门"
        rules={[{ required: true, message: '请选择部门' }]}
      >
        <Select placeholder="请选择部门">
          <Option value={1}>技术部</Option>
          <Option value={2}>产品部</Option>
          <Option value={3}>运营部</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="状态"
        initialValue={1}
      >
        <Select>
          <Option value={1}>启用</Option>
          <Option value={0}>禁用</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
```

### 表单逻辑 Hooks

```typescript
// hooks/useUserForm.ts
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { createUser, updateUser } from '@/services/user';
import type { UserFormValues } from '../types';

interface UseUserFormOptions {
  mode: 'create' | 'edit';
  userId?: number;
  onSuccess?: () => void;
}

export function useUserForm({ mode, userId, onSuccess }: UseUserFormOptions) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (values: UserFormValues) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        await createUser(values);
        message.success('创建成功');
      } else {
        await updateUser(userId!, values);
        message.success('更新成功');
      }
      onSuccess?.();
    } catch (error) {
      // 错误已在请求拦截器处理
    } finally {
      setLoading(false);
    }
  }, [mode, userId, onSuccess]);

  return {
    loading,
    handleSubmit,
  };
}
```

---

## Vue 表单实现

### 基于 Element Plus

```vue
<!-- components/UserForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="姓名" prop="name">
      <el-input v-model="formData.name" placeholder="请输入姓名" />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input v-model="formData.email" placeholder="请输入邮箱" />
    </el-form-item>

    <el-form-item label="手机号" prop="phone">
      <el-input v-model="formData.phone" placeholder="请输入手机号" />
    </el-form-item>

    <el-form-item label="部门" prop="department">
      <el-select v-model="formData.department" placeholder="请选择部门">
        <el-option :value="1" label="技术部" />
        <el-option :value="2" label="产品部" />
        <el-option :value="3" label="运营部" />
      </el-select>
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-select v-model="formData.status">
        <el-option :value="1" label="启用" />
        <el-option :value="0" label="禁用" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        提交
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { UserFormValues } from '../types';

interface Props {
  initialValues?: Partial<UserFormValues>;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', values: UserFormValues): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();

const formData = reactive<UserFormValues>({
  name: '',
  email: '',
  phone: '',
  department: undefined,
  status: 1,
  ...props.initialValues,
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 20, message: '姓名不超过20个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' },
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' },
  ],
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (valid) {
    emit('submit', { ...formData });
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>
```

---

## 常见表单模式

### 模式1：弹窗表单

```tsx
// components/UserFormModal.tsx
import { Modal } from 'antd';
import { UserForm } from './UserForm';
import { useUserForm } from '../hooks/useUserForm';
import type { UserInfo } from '@/services/types/user';

interface UserFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  record?: UserInfo;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserFormModal({
  visible,
  mode,
  record,
  onClose,
  onSuccess,
}: UserFormModalProps) {
  const { loading, handleSubmit } = useUserForm({
    mode,
    userId: record?.id,
    onSuccess: () => {
      onClose();
      onSuccess();
    },
  });

  return (
    <Modal
      title={mode === 'create' ? '新增用户' : '编辑用户'}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <UserForm
        initialValues={record}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
}
```

### 模式2：字段联动

```tsx
// 部门-角色联动示例
function DepartmentRoleForm() {
  const [form] = Form.useForm();
  const departmentValue = Form.useWatch('department', form);

  // 部门变化时，清空角色选择
  useEffect(() => {
    form.setFieldValue('role', undefined);
  }, [departmentValue, form]);

  // 根据部门获取角色选项
  const roleOptions = useMemo(() => {
    return getRolesByDepartment(departmentValue);
  }, [departmentValue]);

  return (
    <Form form={form}>
      <Form.Item name="department" label="部门">
        <Select options={departmentOptions} />
      </Form.Item>

      <Form.Item name="role" label="角色">
        <Select
          options={roleOptions}
          disabled={!departmentValue}
          placeholder={departmentValue ? '请选择角色' : '请先选择部门'}
        />
      </Form.Item>
    </Form>
  );
}
```

### 模式3：动态表单项

```tsx
// 动态增减表单项
function DynamicFieldsForm() {
  return (
    <Form>
      <Form.List name="contacts">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  rules={[{ required: true, message: '请输入联系人' }]}
                >
                  <Input placeholder="联系人" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'phone']}
                  rules={[{ required: true, message: '请输入电话' }]}
                >
                  <Input placeholder="电话" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()} block>
              添加联系人
            </Button>
          </>
        )}
      </Form.List>
    </Form>
  );
}
```

---

## 校验规则速查

### 内置规则

| 规则 | 说明 | 示例 |
|------|------|------|
| required | 必填 | `{ required: true, message: '必填' }` |
| type | 类型 | `{ type: 'email', message: '邮箱格式' }` |
| min/max | 长度 | `{ min: 6, max: 20, message: '6-20位' }` |
| pattern | 正则 | `{ pattern: /^1\d{10}$/, message: '手机号' }` |
| len | 精确长度 | `{ len: 11, message: '11位' }` |
| whitespace | 空白 | `{ whitespace: true, message: '不能为空' }` |

### 常用正则

```typescript
const PATTERNS = {
  phone: /^1[3-9]\d{9}$/,
  email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
  idCard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  url: /^https?:\/\/.+/,
  chinese: /^[\u4e00-\u9fa5]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
};
```

### 自定义校验

```typescript
const customRules = {
  // 自定义异步校验
  checkUsername: {
    validator: async (_, value) => {
      if (!value) return;
      const exists = await checkUsernameExists(value);
      if (exists) {
        throw new Error('用户名已存在');
      }
    },
  },

  // 确认密码校验
  confirmPassword: ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('两次密码不一致'));
    },
  }),
};
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 表单创建 | "做表单"、"创建表单"、"表单页面" |
| 表单验证 | "表单验证"、"校验规则"、"必填校验" |
| 联动逻辑 | "字段联动"、"表单联动"、"级联选择" |
| 动态表单 | "动态表单"、"动态增减"、"Schema表单" |
| 表单提交 | "表单提交"、"保存表单"、"数据提交" |

---

## 注意事项

### 关键约束

| 约束 | 说明 |
|------|------|
| 类型定义 | 表单值类型必须明确 |
| 校验提示 | 每个规则必须有 message |
| 初始值 | 编辑模式需正确回显 |
| 提交状态 | loading 状态防止重复提交 |

### 最佳实践

```
✅ 推荐做法：
- 表单逻辑抽取到 hooks
- 校验规则集中管理
- 使用 Form.useWatch 监听字段
- 弹窗表单用 destroyOnClose

❌ 避免做法：
- 表单组件过于臃肿
- 硬编码校验规则
- 忘记处理 loading
- 编辑模式不回显数据
```
