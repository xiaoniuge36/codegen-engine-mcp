# Ant Design Pro Components 知识图谱

## 🎯 组件库概述

Ant Design Pro Components 是基于 Ant Design 的高级组件库，专为企业级 B 端页面设计，提供开箱即用的高级组件。

**安装方式**：
```bash
npm install @ant-design/pro-components
```

---

## 📊 ProTable - 高级表格

### 用途
集成搜索、表格、分页、操作列的一体化表格组件，适用于标准 CRUD 列表页面。

### 必需属性

| 属性 | 类型 | 说明 | 必填 |
|------|------|------|------|
| `columns` | `ProColumns<T>[]` | 列配置数组 | ✅ |
| `request` | `(params) => Promise<{data, total, success}>` | 数据请求函数 | ✅ |
| `rowKey` | `string \| (record) => string` | 行唯一标识 | ✅ |

### 常用配置

```typescript
<ProTable<DataItem>
  columns={columns}
  actionRef={actionRef}
  request={async (params) => {
    const res = await fetchList(params);
    return {
      data: res.data,
      success: true,
      total: res.total,
    };
  }}
  rowKey="id"
  search={{
    labelWidth: 'auto',    // 搜索表单标签宽度
    span: 8,               // 每个搜索项占据的栅格数
  }}
  pagination={{
    pageSize: 10,
    showSizeChanger: true,
  }}
  toolbar={{
    actions: [
      <Button key="add" type="primary" onClick={handleAdd}>
        新增
      </Button>,
    ],
  }}
  rowSelection={{
    onChange: (_, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  }}
/>
```

### ProColumns 列配置

```typescript
const columns: ProColumns<DataItem>[] = [
  {
    title: '序号',
    dataIndex: 'index',
    valueType: 'indexBorder',  // 序号列
    width: 50,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    fieldProps: { 
      placeholder: '请输入姓名' 
    },
  },
  {
    title: '类型',
    dataIndex: 'type',
    valueType: 'select',
    valueEnum: {
      1: { text: '类型1', status: 'Default' },
      2: { text: '类型2', status: 'Success' },
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    valueType: 'dateTime',
    search: false,  // 不在搜索表单中显示
  },
  {
    title: '操作',
    valueType: 'option',
    render: (_, record) => [
      <a key="edit" onClick={() => handleEdit(record.id)}>编辑</a>,
      <a key="delete" onClick={() => handleDelete(record.id)}>删除</a>,
    ],
  },
];
```

### 常用 valueType

| valueType | 说明 | 搜索组件 | 展示组件 |
|-----------|------|----------|----------|
| `text` | 文本 | Input | 文本 |
| `textarea` | 多行文本 | TextArea | 多行文本 |
| `select` | 下拉选择 | Select | 标签 |
| `date` | 日期 | DatePicker | 日期格式化 |
| `dateTime` | 日期时间 | DatePicker | 日期时间格式化 |
| `dateRange` | 日期范围 | RangePicker | 日期范围 |
| `digit` | 数字 | InputNumber | 数字 |
| `money` | 金额 | InputNumber | 金额格式化 |
| `switch` | 开关 | Switch | 开关 |
| `indexBorder` | 序号 | - | 带边框序号 |
| `option` | 操作列 | - | 操作按钮组 |

### 示例引用
- 完整示例：`templates/examples/react-standard-list/index.example.tsx`
- Hooks 示例：`templates/examples/react-standard-list/hooks.example.ts`

---

## 📝 ModalForm - 模态框表单

### 用途
集成 Modal 和 Form 的表单弹窗组件，适用于新增/编辑操作。

### 必需属性

| 属性 | 类型 | 说明 | 必填 |
|------|------|------|------|
| `title` | `string` | 弹窗标题 | ✅ |
| `open` | `boolean` | 是否显示 | ✅ |
| `onFinish` | `(values) => Promise<boolean>` | 提交回调 | ✅ |

### 常用配置

```typescript
<ModalForm
  title={editId ? '编辑' : '新增'}
  open={visible}
  form={form}
  modalProps={{
    onCancel: () => setVisible(false),
    destroyOnClose: true,     // 关闭时销毁表单
    maskClosable: false,      // 点击遮罩层不关闭
  }}
  onFinish={async (values) => {
    try {
      if (editId) {
        await updateItem(editId, values);
        message.success('编辑成功');
      } else {
        await createItem(values);
        message.success('新增成功');
      }
      setVisible(false);
      actionRef.current?.reload();
      return true;  // 返回 true 关闭弹窗
    } catch (error) {
      return false; // 返回 false 保持弹窗打开
    }
  }}
>
  <ProFormText
    name="name"
    label="姓名"
    rules={[{ required: true, message: '请输入姓名' }]}
  />
  <ProFormSelect
    name="type"
    label="类型"
    options={[
      { label: '类型1', value: 1 },
      { label: '类型2', value: 2 },
    ]}
    rules={[{ required: true, message: '请选择类型' }]}
  />
</ModalForm>
```

### ProForm 表单项组件

| 组件 | 说明 | 适用场景 |
|------|------|----------|
| `ProFormText` | 文本输入框 | 姓名、编号等 |
| `ProFormTextArea` | 多行文本 | 备注、描述等 |
| `ProFormSelect` | 下拉选择 | 类型、状态等 |
| `ProFormDatePicker` | 日期选择 | 日期字段 |
| `ProFormDateRangePicker` | 日期范围 | 时间范围查询 |
| `ProFormDigit` | 数字输入 | 金额、数量等 |
| `ProFormSwitch` | 开关 | 是否启用等 |
| `ProFormRadio.Group` | 单选框组 | 单选项 |
| `ProFormCheckbox.Group` | 多选框组 | 多选项 |
| `ProFormUploadButton` | 文件上传 | 附件、图片等 |

### 示例引用
- 完整示例：`templates/examples/react-standard-list/components/EditModal.example.tsx`

---

## 🎨 DrawerForm - 抽屉表单

### 用途
集成 Drawer 和 Form 的抽屉表单组件，适用于详情展示或复杂编辑。

### 常用配置

```typescript
<DrawerForm
  title="查看详情"
  open={visible}
  drawerProps={{
    width: 720,
    destroyOnClose: true,
  }}
  onOpenChange={setVisible}
>
  {/* 表单项 */}
</DrawerForm>
```

---

## 🔧 ActionType - 表格操作引用

### 用途
用于操作 ProTable 实例，实现刷新、重置等功能。

### 常用方法

```typescript
const actionRef = useRef<ActionType>();

// 刷新表格（保持当前分页和搜索条件）
actionRef.current?.reload();

// 重置表格（清空搜索条件，回到第一页）
actionRef.current?.reset();

// 清空选中项
actionRef.current?.clearSelected();
```

---

## 📦 类型定义

### ProColumns 类型

```typescript
import type { ProColumns, ActionType } from '@ant-design/pro-components';

interface DataItem {
  id: string;
  name: string;
  type: number;
  createTime: string;
}

const columns: ProColumns<DataItem>[] = [
  // ...
];

const actionRef = useRef<ActionType>();
```

---

## ⚠️ 常见注意事项

### 1. 类型引入规则
```typescript
// ✅ 正确：第三方库类型必须引入
import type { ProColumns, ActionType } from '@ant-design/pro-components';

// ❌ 错误：缺少类型引入
const columns: ProColumns[] = [];  // 类型错误
```

### 2. request 函数返回值格式
```typescript
// ✅ 正确：必须返回 {data, total, success}
request={async (params) => {
  const res = await fetchList(params);
  return {
    data: res.data,      // 数据数组
    total: res.total,    // 总条数
    success: true,       // 是否成功
  };
}}

// ❌ 错误：直接返回数组
request={async () => await fetchList()}
```

### 3. onFinish 必须返回 boolean
```typescript
// ✅ 正确：返回 true 关闭弹窗，false 保持打开
onFinish={async (values) => {
  try {
    await save(values);
    return true;   // 成功，关闭弹窗
  } catch (error) {
    return false;  // 失败，保持弹窗打开
  }
}}

// ❌ 错误：没有返回值
onFinish={async (values) => {
  await save(values);
  // 没有 return，弹窗不会自动关闭
}}
```

---

## 🔗 相关资源

- 官方文档：https://procomponents.ant.design/
- ProTable 文档：https://procomponents.ant.design/components/table
- ModalForm 文档：https://procomponents.ant.design/components/modal-form
- 示例代码库：`templates/examples/react-standard-list/`

