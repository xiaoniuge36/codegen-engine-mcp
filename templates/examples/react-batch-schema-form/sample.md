# React 批量 Schema 表单（BetaSchemaForm）

## 模板说明

本模板使用 `BetaSchemaForm` 实现 Schema 驱动的批量操作表单，包含：
- 批量选择记录
- 使用 `columns` 配置驱动表单渲染
- 支持多种 `valueType`：text、select、date、dateTime、digit、money、textarea 等
- 支持字段联动（dependency）、分组（group）等高级功能
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
│   └── BatchSchemaForm.tsx   # 批量 Schema 表单组件（使用 BetaSchemaForm）
├── hooks/
│   └── useBatchForm.ts       # 批量表单逻辑 hooks（可选）
├── index.tsx                 # 列表页（调用弹窗）
└── index.less
```

## 关键要点

1. **BetaSchemaForm columns 配置**
   - `title`: 字段标签
   - `dataIndex`: 字段名
   - `valueType`: 字段类型（text/select/date/dateTime/digit/money/textarea/group/dependency 等）
   - `valueEnum`: 枚举配置（用于 select/radio/checkbox 等）
   - `formItemProps`: 表单项配置（rules 等）
   - `fieldProps`: 组件属性配置
   - `width`: 宽度（xs/sm/md/lg/xl）
   - `columns`: 嵌套列配置（用于 group/formList/formSet）

2. **批量操作**
   - `selectedIds`: 选中记录的 ID 数组
   - `selectedRows`: 选中记录的完整数据（可选，用于预览）
   - `bizType`: 业务类型，用于获取对应的字段 schema

3. **高级功能**
   - `valueType: 'group'`: 字段分组
   - `valueType: 'dependency'`: 字段联动，根据其他字段值动态显示
   - `valueType: 'formList'`: 表单列表，可添加多条
   - `valueType: 'formSet'`: 表单集合

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

## columns 配置示例

```typescript
import type { ProFormColumnsType } from '@ant-design/pro-components';

// valueEnum 枚举配置
const statusValueEnum = {
  draft: { text: '草稿', status: 'Default' },
  pending: { text: '待审核', status: 'Processing' },
  approved: { text: '已通过', status: 'Success' },
  rejected: { text: '已拒绝', status: 'Error', disabled: true },
};

// BetaSchemaForm columns 配置
const columns: ProFormColumnsType<DataItem>[] = [
  {
    title: '基础信息',
    valueType: 'group',
    columns: [
      {
        title: '名称',
        dataIndex: 'name',
        valueType: 'text',
        formItemProps: {
          rules: [{ required: true, message: '请输入名称' }],
        },
        width: 'md',
      },
      {
        title: '状态',
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: statusValueEnum,
        width: 'sm',
      },
    ],
  },
  {
    // 字段联动示例：当状态为"已拒绝"时显示拒绝原因
    valueType: 'dependency',
    name: ['status'],
    columns: ({ status }) => {
      if (status === 'rejected') {
        return [
          {
            title: '拒绝原因',
            dataIndex: 'rejectReason',
            valueType: 'textarea',
            formItemProps: {
              rules: [{ required: true, message: '请输入拒绝原因' }],
            },
            width: 'xl',
          },
        ];
      }
      return [];
    },
  },
  {
    title: '扩展信息',
    valueType: 'group',
    columns: [
      {
        title: '金额',
        dataIndex: 'amount',
        valueType: 'money',
        width: 'sm',
      },
      {
        title: '生效日期',
        dataIndex: 'effectiveDate',
        valueType: 'date',
        width: 'sm',
      },
    ],
  },
];
```

## 常用 valueType 类型

| valueType | 说明 | 示例 |
|-----------|------|------|
| `text` | 文本输入框 | 名称、备注 |
| `select` | 下拉选择 | 状态、类型 |
| `date` | 日期选择 | 生效日期 |
| `dateTime` | 日期时间选择 | 创建时间 |
| `dateRange` | 日期区间 | 有效期 |
| `digit` | 数字输入 | 数量、排序 |
| `money` | 金额输入 | 价格、金额 |
| `textarea` | 多行文本 | 描述、备注 |
| `radio` | 单选框 | 性别 |
| `checkbox` | 多选框 | 标签 |
| `switch` | 开关 | 是否启用 |
| `group` | 字段分组 | 分组标题 |
| `dependency` | 字段联动 | 条件显示 |
| `formList` | 表单列表 | 可添加多条 |
```
