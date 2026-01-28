---
name: table-generator
description: 表格生成技能。当用户需要生成表格、创建列表页、做数据展示、实现分页排序筛选、或询问如何处理表格逻辑时使用此skill。
---

# Table Generator Skill

表格生成和处理指导，帮助 AI 完成表格创建、分页排序、筛选搜索、批量操作等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 📊 表格生成 | 根据数据结构生成表格列配置 |
| 📄 分页处理 | 前端/后端分页实现 |
| 🔍 搜索筛选 | 关键词搜索、条件筛选 |
| ↕️ 排序功能 | 单列/多列排序 |
| ☑️ 批量操作 | 多选、批量删除、批量编辑 |
| 📥 数据导出 | Excel/CSV 导出 |

---

## 表格生成流程

### 标准流程

```
1. 分析数据结构        → 确定表格列和类型
2. 定义列配置          → columns 配置
3. 实现数据请求        → useTableData hooks
4. 配置分页排序        → pagination, sorter
5. 实现搜索筛选        → 搜索表单组件
6. 添加操作列          → 编辑、删除等操作
```

### 文件组织

```
src/pages/user/
├── components/
│   ├── SearchForm.tsx         # 搜索表单
│   └── OperationColumn.tsx    # 操作列
├── hooks/
│   └── useTableData.ts        # 表格数据 hooks
├── columns.tsx                # 列配置
├── types.ts                   # 类型定义
└── index.tsx
```

---

## React 表格实现

### 基于 Ant Design ProTable

```tsx
// index.tsx
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getUserList, deleteUser } from '@/services/user';
import type { UserInfo } from '@/services/types/user';

const columns: ProColumns<UserInfo>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    copyable: true,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: {
      0: { text: '禁用', status: 'Error' },
      1: { text: '启用', status: 'Success' },
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    sorter: true,
    hideInSearch: true,
  },
  {
    title: '操作',
    valueType: 'option',
    key: 'option',
    render: (_, record, __, action) => [
      <a key="edit" onClick={() => handleEdit(record)}>编辑</a>,
      <a key="delete" onClick={() => handleDelete(record, action)}>删除</a>,
    ],
  },
];

export default function UserListPage() {
  const actionRef = useRef<ActionType>();

  return (
    <ProTable<UserInfo>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params, sort) => {
        const { current, pageSize, ...rest } = params;
        const res = await getUserList({
          current,
          pageSize,
          ...rest,
          sortField: Object.keys(sort)[0],
          sortOrder: Object.values(sort)[0],
        });
        return {
          data: res.list,
          total: res.total,
          success: true,
        };
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      pagination={{
        pageSize: 10,
      }}
      toolBarRender={() => [
        <Button
          key="add"
          type="primary"
          onClick={() => handleAdd()}
        >
          新增
        </Button>,
      ]}
    />
  );
}
```

### 基于 Ant Design Table

```tsx
// index.tsx
import { Table, Button, Space, Input, Select } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useTableData } from './hooks/useTableData';
import type { UserInfo } from '@/services/types/user';

const columns: ColumnsType<UserInfo> = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: number) => (
      <Tag color={status === 1 ? 'green' : 'red'}>
        {status === 1 ? '启用' : '禁用'}
      </Tag>
    ),
    filters: [
      { text: '启用', value: 1 },
      { text: '禁用', value: 0 },
    ],
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true,
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space>
        <a onClick={() => handleEdit(record)}>编辑</a>
        <a onClick={() => handleDelete(record)}>删除</a>
      </Space>
    ),
  },
];

export default function UserListPage() {
  const {
    data,
    loading,
    pagination,
    handleTableChange,
    handleSearch,
    refresh,
  } = useTableData();

  return (
    <div>
      {/* 搜索区域 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="搜索姓名"
            onSearch={(value) => handleSearch({ keyword: value })}
            style={{ width: 200 }}
          />
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleSearch({ status: value })}
          >
            <Select.Option value={1}>启用</Select.Option>
            <Select.Option value={0}>禁用</Select.Option>
          </Select>
          <Button type="primary" onClick={() => handleAdd()}>
            新增
          </Button>
        </Space>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowKey="id"
      />
    </div>
  );
}
```

### 表格数据 Hooks

```typescript
// hooks/useTableData.ts
import { useState, useCallback, useEffect } from 'react';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { getUserList } from '@/services/user';
import type { UserInfo, GetUserListParams } from '@/services/types/user';

export function useTableData() {
  const [data, setData] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
  });
  const [searchParams, setSearchParams] = useState<Partial<GetUserListParams>>({});
  const [sortInfo, setSortInfo] = useState<{ field?: string; order?: string }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserList({
        current: pagination.current!,
        pageSize: pagination.pageSize!,
        ...searchParams,
        sortField: sortInfo.field,
        sortOrder: sortInfo.order,
      });
      setData(res.list);
      setPagination((prev) => ({ ...prev, total: res.total }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchParams, sortInfo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = useCallback(
    (
      pag: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<UserInfo> | SorterResult<UserInfo>[]
    ) => {
      setPagination((prev) => ({
        ...prev,
        current: pag.current,
        pageSize: pag.pageSize,
      }));

      // 处理筛选
      const filterParams: Record<string, any> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.length > 0) {
          filterParams[key] = value[0]; // 单选筛选
        }
      });
      setSearchParams((prev) => ({ ...prev, ...filterParams }));

      // 处理排序
      if (!Array.isArray(sorter) && sorter.field) {
        setSortInfo({
          field: sorter.field as string,
          order: sorter.order === 'ascend' ? 'asc' : 'desc',
        });
      } else {
        setSortInfo({});
      }
    },
    []
  );

  const handleSearch = useCallback((params: Partial<GetUserListParams>) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    pagination,
    handleTableChange,
    handleSearch,
    refresh,
  };
}
```

---

## Vue 表格实现

### 基于 Element Plus

```vue
<!-- index.vue -->
<template>
  <div class="user-list">
    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchParams.keyword"
        placeholder="搜索姓名"
        clearable
        style="width: 200px"
        @keyup.enter="handleSearch"
      />
      <el-select
        v-model="searchParams.status"
        placeholder="状态"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option :value="1" label="启用" />
        <el-option :value="0" label="禁用" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="data"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" sortable="custom" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSearch"
      @current-change="handleSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { useTableData } from './composables/useTableData';

const {
  data,
  loading,
  pagination,
  searchParams,
  handleSearch,
  handleSortChange,
  refresh,
} = useTableData();

// 操作方法
const handleAdd = () => { /* ... */ };
const handleEdit = (row) => { /* ... */ };
const handleDelete = (row) => { /* ... */ };
</script>
```

### Vue Composable

```typescript
// composables/useTableData.ts
import { ref, reactive, watch } from 'vue';
import { getUserList } from '@/services/user';
import type { UserInfo, GetUserListParams } from '@/services/types/user';

export function useTableData() {
  const data = ref<UserInfo[]>([]);
  const loading = ref(false);
  
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const searchParams = reactive<Partial<GetUserListParams>>({
    keyword: '',
    status: undefined,
  });
  
  const sortInfo = reactive({
    field: '',
    order: '',
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getUserList({
        current: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
        sortField: sortInfo.field,
        sortOrder: sortInfo.order,
      });
      data.value = res.list;
      pagination.total = res.total;
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    pagination.current = 1;
    fetchData();
  };

  const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
    sortInfo.field = prop;
    sortInfo.order = order === 'ascending' ? 'asc' : 'desc';
    fetchData();
  };

  // 初始加载
  fetchData();

  return {
    data,
    loading,
    pagination,
    searchParams,
    handleSearch,
    handleSortChange,
    refresh: fetchData,
  };
}
```

---

## 常见功能模式

### 批量操作

```tsx
function BatchOperationTable() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const handleBatchDelete = async () => {
    await batchDeleteUsers(selectedRowKeys as number[]);
    setSelectedRowKeys([]);
    refresh();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button
          danger
          disabled={selectedRowKeys.length === 0}
          onClick={handleBatchDelete}
        >
          批量删除 ({selectedRowKeys.length})
        </Button>
      </Space>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
      />
    </>
  );
}
```

### 可编辑表格

```tsx
function EditableTable() {
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: UserInfo) => record.id.toString() === editingKey;

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      editable: true,
      render: (text: string, record: UserInfo) => {
        return isEditing(record) ? (
          <Input defaultValue={text} />
        ) : (
          text
        );
      },
    },
    // ... 其他列
  ];

  return <Table columns={columns} dataSource={data} />;
}
```

### 数据导出

```typescript
// utils/export.ts
import { utils, writeFile } from 'xlsx';

export function exportToExcel<T extends object>(
  data: T[],
  columns: { title: string; dataIndex: keyof T }[],
  filename = 'export.xlsx'
) {
  const headers = columns.map((col) => col.title);
  const rows = data.map((item) =>
    columns.map((col) => item[col.dataIndex])
  );

  const worksheet = utils.aoa_to_sheet([headers, ...rows]);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  writeFile(workbook, filename);
}

// 使用
const handleExport = () => {
  exportToExcel(data, [
    { title: '姓名', dataIndex: 'name' },
    { title: '邮箱', dataIndex: 'email' },
  ], '用户列表.xlsx');
};
```

---

## 列配置速查

### 常用列类型

| 类型 | 说明 | 配置示例 |
|------|------|----------|
| 文本 | 普通文本 | `{ dataIndex: 'name' }` |
| 状态 | 标签展示 | `{ render: (v) => <Tag /> }` |
| 时间 | 格式化时间 | `{ valueType: 'dateTime' }` |
| 金额 | 格式化金额 | `{ valueType: 'money' }` |
| 操作 | 操作按钮 | `{ valueType: 'option' }` |
| 序号 | 行序号 | `{ valueType: 'indexBorder' }` |

### ProTable valueType

```typescript
// 常用 valueType
type ValueType =
  | 'text'       // 文本
  | 'money'      // 金额
  | 'date'       // 日期
  | 'dateTime'   // 日期时间
  | 'dateRange'  // 日期范围
  | 'select'     // 下拉选择
  | 'option'     // 操作列
  | 'digit'      // 数字
  | 'percent'    // 百分比
  | 'progress'   // 进度条
  | 'avatar'     // 头像
  | 'code'       // 代码
  | 'switch';    // 开关
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 表格创建 | "做表格"、"列表页"、"数据表格" |
| 分页功能 | "分页"、"翻页"、"每页条数" |
| 搜索筛选 | "搜索"、"筛选"、"过滤" |
| 排序功能 | "排序"、"升序降序"、"多列排序" |
| 批量操作 | "批量删除"、"多选"、"全选" |
| 数据导出 | "导出Excel"、"下载数据" |

---

## 注意事项

### 关键约束

| 约束 | 说明 |
|------|------|
| rowKey | 必须设置唯一的行标识 |
| 类型定义 | 列配置需类型安全 |
| 分页状态 | 搜索时重置到第一页 |
| loading | 请求时显示加载状态 |

### 最佳实践

```
✅ 推荐做法：
- 表格逻辑抽取到 hooks
- 列配置单独文件管理
- 使用 ProTable 减少代码
- 合理使用虚拟滚动（大数据量）

❌ 避免做法：
- 表格组件过于臃肿
- 忘记设置 rowKey
- 前端分页处理大数据
- 列配置硬编码在 JSX 中
```
