# React 批量 Schema 表单（BatchSchemaForm）

## 模板说明

本模板适用于批量操作的 Schema 驱动表单，包含：
- 批量选择记录
- 动态获取字段配置
- Schema 驱动表单渲染
- 批量提交更新

## 使用场景

- 批量编辑（批量修改状态、负责人、时间等）
- 批量审批（批量设置审批意见）
- 批量导入后修正（批量更新字段）
- 字段配置由后端控制的动态表单

## 文件结构

```
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   └── BatchSchemaForm.tsx   # 批量 Schema 表单组件
├── hooks/
│   └── useBatchForm.ts       # 批量表单逻辑 hooks（可选）
├── index.tsx                 # 列表页（调用弹窗）
└── index.less
```

## 关键要点

1. **Schema 配置**
   - `type`: 字段类型（text/select/date/number）
   - `name`: 字段名
   - `label`: 字段标签
   - `required`: 是否必填
   - `options`: 下拉选项（type=select 时）

2. **批量操作**
   - `selectedIds`: 选中记录的 ID 数组
   - `selectedRows`: 选中记录的完整数据（可选，用于预览）
   - `bizType`: 业务类型，用于获取对应的字段 schema

3. **动态渲染**
   - 根据 schema 动态渲染表单项
   - 支持条件渲染（ProFormDependency）
   - 只填写需要修改的字段

4. **提交处理**
   - 批量更新接口
   - 成功提示显示更新数量
   - onSuccess 回调刷新列表

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个批量编辑弹窗，支持动态字段配置，批量更新选中的记录

页面类型：批量 Schema 表单（BatchSchemaForm）

文件夹名称: components/batch-edit-modal

接口及数据结构：
- 字段配置接口：getFieldSchema(bizType)
- 批量更新接口：batchUpdateItems({ ids, bizType, updateFields })
- 入参：selectedIds（选中的 ID 数组）、bizType（业务类型）

组件需求：
- ModalForm：显示选中数量；destroyOnClose；maskClosable=false
- Schema 驱动：根据字段配置动态渲染表单项
- 批量提示：Alert 提示将要更新的记录数
- 提交：批量更新接口；成功 toast 显示数量；onSuccess 回调刷新

强制要求（P0）：
- 字段配置必须从后端获取或从 props 传入
- 表单项渲染必须根据 schema 动态生成
- 禁止残留 console.log/debugger
- 生成后必须 TypeScript/ESLint 自检并修复
```

## 调用示例

```typescript
// 列表页中调用
const [visible, setVisible] = useState(false);
const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
const [selectedRows, setSelectedRows] = useState<any[]>([]);

<Button 
  disabled={selectedRowKeys.length === 0}
  onClick={() => setVisible(true)}
>
  批量编辑（{selectedRowKeys.length}）
</Button>

<BatchSchemaForm
  visible={visible}
  selectedIds={selectedRowKeys}
  selectedRows={selectedRows}
  bizType="employee"
  onCancel={() => setVisible(false)}
  onSuccess={() => {
    setVisible(false);
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  }}
/>
```

## Schema 配置示例

```typescript
// 后端返回的字段配置
const fieldSchema = [
  {
    name: 'status',
    label: '状态',
    type: 'select',
    required: true,
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' },
    ],
  },
  {
    name: 'assignee',
    label: '负责人',
    type: 'text',
    required: false,
  },
  {
    name: 'expireDate',
    label: '到期日期',
    type: 'date',
    required: false,
  },
];
```
