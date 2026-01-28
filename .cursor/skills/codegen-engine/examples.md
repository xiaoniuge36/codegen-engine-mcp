# CodeGen Engine MCP 使用示例

本文档提供 codegen-engine MCP 服务器的完整使用示例。

---

## 目录

1. [标准列表页（CRUD）完整流程](#1-标准列表页crud完整流程)
2. [弹窗表单生成](#2-弹窗表单生成)
3. [详情页生成](#3-详情页生成)
4. [文件上传组件](#4-文件上传组件)
5. [Vue项目代码生成](#5-vue项目代码生成)
6. [分步调用高级用法](#6-分步调用高级用法)
7. [项目分析与诊断](#7-项目分析与诊断)
8. [代码验证与修复](#8-代码验证与修复)
9. [大数据渲染（虚拟列表 + 分页下拉）](#9-大数据渲染虚拟列表--分页下拉)

---

## 1. 标准列表页（CRUD）完整流程

### 场景描述

用户需要创建一个员工管理列表页，支持：
- 姓名搜索
- 分页展示
- 新增员工
- 编辑员工
- 删除员工

### Step 1: 调用 quick_generate

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个员工列表页，支持姓名搜索、新增、编辑、删除",
    projectPath: "D:/project/src/pages/employee/index.tsx"
  }
})
```

### Step 2: 分析返回结果

返回结果包含：

```json
{
  "techStack": {
    "detected": true,
    "techStack": "react",
    "framework": "umi",
    "uiLibrary": "antd",
    "isTypeScript": true
  },
  "globalTypes": {
    "found": true,
    "globalInterfaces": ["UserInfo", "TableItem", "PageParams"],
    "recommendation": "⚠️ 这些类型【绝对不要 import】"
  },
  "templateMatch": {
    "chosen": {
      "id": "react-standard-list-crud",
      "name": "React 标准列表页",
      "score": 18
    }
  },
  "codeExamples": {
    "hooks.example.ts": "// hooks 示例代码...",
    "index.example.tsx": "// 组件示例代码...",
    "components/EditModal.example.tsx": "// 弹窗示例代码...",
    "types.example.ts": "// 类型定义示例..."
  },
  "criticalReminders": [
    "🚨 全局类型警告: UserInfo, TableItem, PageParams 【绝对不要 import】",
    "📋 必须先生成 hooks 文件，再生成组件文件"
  ]
}
```

### Step 3: 按顺序生成代码

**先生成 hooks 文件** `src/pages/employee/hooks/useTableData.ts`：

```typescript
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getEmployeeList, deleteEmployee } from '@/services/employee';

export function useTableData() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await getEmployeeList({
        ...params,
        pageNum: params?.current || pagination.current,
        pageSize: params?.pageSize || pagination.pageSize,
      });
      setDataSource(res.data.list);
      setPagination(prev => ({
        ...prev,
        total: res.data.total,
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteEmployee(id);
    message.success('删除成功');
    fetchData();
  }, [fetchData]);

  return {
    loading,
    dataSource,
    pagination,
    fetchData,
    handleDelete,
    setPagination,
  };
}
```

**再生成类型文件** `src/pages/employee/types.ts`：

```typescript
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  phone: string;
  email: string;
  status: number;
  createTime: string;
}

export interface SearchParams {
  name?: string;
  department?: string;
}
```

**最后生成组件文件** `src/pages/employee/index.tsx`：

```tsx
import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Space, Table, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTableData } from './hooks/useTableData';
import EditModal from './components/EditModal';
import type { Employee, SearchParams } from './types';

const EmployeeList: React.FC = () => {
  const [form] = Form.useForm();
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Employee | null>(null);
  
  const {
    loading,
    dataSource,
    pagination,
    fetchData,
    handleDelete,
  } = useTableData();

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    fetchData({ ...values, current: 1 });
  };

  const handleReset = () => {
    form.resetFields();
    fetchData({ current: 1 });
  };

  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '部门', dataIndex: 'department' },
    { title: '职位', dataIndex: 'position' },
    { title: '手机', dataIndex: 'phone' },
    {
      title: '操作',
      render: (_: any, record: Employee) => (
        <Space>
          <a onClick={() => { setCurrentRecord(record); setEditVisible(true); }}>编辑</a>
          <a onClick={() => Modal.confirm({
            title: '确认删除?',
            onOk: () => handleDelete(record.id),
          })}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="name" label="姓名">
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => { setCurrentRecord(null); setEditVisible(true); }}
        style={{ marginBottom: 16 }}
      >
        新增员工
      </Button>

      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={pagination}
        onChange={(pag) => fetchData({ current: pag.current, pageSize: pag.pageSize })}
      />

      <EditModal
        visible={editVisible}
        record={currentRecord}
        onClose={() => setEditVisible(false)}
        onSuccess={() => { setEditVisible(false); fetchData(); }}
      />
    </Card>
  );
};

export default EmployeeList;
```

### Step 4: 检查代码规范

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: [
      "src/pages/employee/hooks/useTableData.ts",
      "src/pages/employee/types.ts",
      "src/pages/employee/index.tsx"
    ]
  }
})
```

返回结果：

```json
{
  "summary": "✅ 所有检查通过",
  "passed": [
    { "rule": "hooks文件检查", "pass": true, "message": "✅ hooks文件已生成" },
    { "rule": "文件顺序检查", "pass": true, "message": "✅ 文件生成顺序正确" },
    { "rule": "类型文件检查", "pass": true, "message": "✅ 类型定义文件已生成" }
  ],
  "issues": [],
  "recommendation": "代码已准备就绪，可直接使用"
}
```

---

## 2. 弹窗表单生成

### 场景描述

为员工列表页创建新增/编辑弹窗。

### Step 1: 调用 quick_generate

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个新增/编辑员工的弹窗表单，包含姓名、部门、职位、手机、邮箱字段",
    projectPath: "D:/project/src/pages/employee/index.tsx"
  }
})
```

### Step 2: 生成弹窗组件

`src/pages/employee/components/EditModal.tsx`：

```tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { createEmployee, updateEmployee } from '@/services/employee';
import type { Employee } from '../types';

interface Props {
  visible: boolean;
  record: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditModal: React.FC<Props> = ({ visible, record, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEdit = !!record;

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  }, [visible, record]);

  const handleOk = async () => {
    const values = await form.validateFields();
    if (isEdit) {
      await updateEmployee({ ...values, id: record.id });
      message.success('编辑成功');
    } else {
      await createEmployee(values);
      message.success('新增成功');
    }
    onSuccess();
  };

  return (
    <Modal
      title={isEdit ? '编辑员工' : '新增员工'}
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="department" label="部门" rules={[{ required: true }]}>
          <Select placeholder="请选择部门">
            <Select.Option value="技术部">技术部</Select.Option>
            <Select.Option value="产品部">产品部</Select.Option>
            <Select.Option value="运营部">运营部</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="position" label="职位">
          <Input placeholder="请输入职位" />
        </Form.Item>
        <Form.Item name="phone" label="手机">
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item name="email" label="邮箱">
          <Input placeholder="请输入邮箱" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
```

### Step 3: 检查代码规范

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: ["src/pages/employee/components/EditModal.tsx"]
  }
})
```

---

## 3. 详情页生成

### 场景描述

创建一个出差申请单详情页，展示申请信息、审批流程等。

### Step 1: 明确指定模板

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "react-nonstandard-detail 做一个出差申请单详情页，包含申请人信息、出差信息、审批流程",
    projectPath: "D:/project/src/pages/travel/detail.tsx"
  }
})
```

### Step 2: 生成详情页代码

**先生成 hooks** `src/pages/travel/hooks/useDetailData.ts`：

```typescript
import { useState, useCallback } from 'react';
import { getTravelDetail } from '@/services/travel';

export function useDetailData(id: string) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<TravelDetail | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getTravelDetail(id);
      setDetail(res.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    loading,
    detail,
    fetchDetail,
  };
}
```

**再生成组件** `src/pages/travel/detail.tsx`：

```tsx
import React, { useEffect } from 'react';
import { Card, Descriptions, Spin, Steps, Tag } from 'antd';
import { useParams } from 'umi';
import { useDetailData } from './hooks/useDetailData';
import styles from './detail.less';

const TravelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, detail, fetchDetail } = useDetailData(id);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return <Spin />;
  }

  if (!detail) {
    return <div>数据不存在</div>;
  }

  return (
    <div className={styles.container}>
      <Card title="申请人信息" style={{ marginBottom: 16 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="申请人">{detail.applicant}</Descriptions.Item>
          <Descriptions.Item label="部门">{detail.department}</Descriptions.Item>
          <Descriptions.Item label="申请时间">{detail.applyTime}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="出差信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="出发地">{detail.fromCity}</Descriptions.Item>
          <Descriptions.Item label="目的地">{detail.toCity}</Descriptions.Item>
          <Descriptions.Item label="开始日期">{detail.startDate}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{detail.endDate}</Descriptions.Item>
          <Descriptions.Item label="出差事由" span={2}>{detail.reason}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="审批流程">
        <Steps current={detail.currentStep}>
          {detail.approvalSteps?.map((step, index) => (
            <Steps.Step
              key={index}
              title={step.title}
              description={step.approver}
              status={step.status}
            />
          ))}
        </Steps>
      </Card>
    </div>
  );
};

export default TravelDetail;
```

---

## 4. 文件上传组件

### 场景描述

创建一个支持图片预览和多文件上传的组件。

### Step 1: 调用 quick_generate

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个文件上传组件，支持图片预览、多文件上传、文件大小限制",
    projectPath: "D:/project/src/components/FileUpload/index.tsx"
  }
})
```

### Step 2: 生成文件上传组件

**先生成 hooks** `src/components/FileUpload/hooks/useFileUpload.ts`：

```typescript
import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { UploadFile } from 'antd/es/upload';

interface Options {
  maxCount?: number;
  maxSize?: number; // MB
  accept?: string;
}

export function useFileUpload(options: Options = {}) {
  const { maxCount = 5, maxSize = 10, accept } = options;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const beforeUpload = useCallback((file: File) => {
    const isOverSize = file.size / 1024 / 1024 > maxSize;
    if (isOverSize) {
      message.error(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }
    return true;
  }, [maxSize]);

  const handleChange = useCallback(({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  }, []);

  const handleRemove = useCallback((file: UploadFile) => {
    setFileList(prev => prev.filter(f => f.uid !== file.uid));
  }, []);

  return {
    fileList,
    uploading,
    beforeUpload,
    handleChange,
    handleRemove,
    maxCount,
    accept,
  };
}
```

**再生成组件** `src/components/FileUpload/index.tsx`：

```tsx
import React from 'react';
import { Upload, Button, Modal } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useFileUpload } from './hooks/useFileUpload';
import type { UploadFile } from 'antd/es/upload';

interface Props {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxCount?: number;
  maxSize?: number;
  accept?: string;
  listType?: 'text' | 'picture' | 'picture-card';
}

const FileUpload: React.FC<Props> = ({
  value,
  onChange,
  maxCount = 5,
  maxSize = 10,
  accept,
  listType = 'picture-card',
}) => {
  const {
    fileList,
    beforeUpload,
    handleChange,
    handleRemove,
  } = useFileUpload({ maxCount, maxSize, accept });

  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState('');

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || file.thumbUrl || '');
    setPreviewVisible(true);
  };

  const uploadButton = listType === 'picture-card' ? (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  ) : (
    <Button icon={<UploadOutlined />}>上传文件</Button>
  );

  return (
    <>
      <Upload
        listType={listType}
        fileList={value || fileList}
        beforeUpload={beforeUpload}
        onChange={(info) => {
          handleChange(info);
          onChange?.(info.fileList);
        }}
        onRemove={handleRemove}
        onPreview={handlePreview}
        maxCount={maxCount}
        accept={accept}
      >
        {(value || fileList).length >= maxCount ? null : uploadButton}
      </Upload>
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default FileUpload;
```

---

## 5. Vue项目代码生成

### 场景描述

为 Vue3 + Element Plus 项目生成列表页。

### Step 1: 调用 quick_generate

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个用户管理列表页，支持搜索、新增、编辑、删除",
    projectPath: "D:/vue-project/src/views/user/index.vue"
  }
})
```

### Step 2: 生成 Vue3 代码

**先生成 composables** `src/views/user/composables.ts`：

```typescript
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserList, deleteUser } from '@/api/user';

export function useTableData() {
  const loading = ref(false);
  const tableData = ref<User[]>([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (params?: any) => {
    loading.value = true;
    try {
      const res = await getUserList({
        ...params,
        pageNum: params?.current || pagination.current,
        pageSize: params?.pageSize || pagination.pageSize,
      });
      tableData.value = res.data.list;
      pagination.total = res.data.total;
    } finally {
      loading.value = false;
    }
  };

  const handleDelete = async (id: string) => {
    await ElMessageBox.confirm('确认删除?', '提示');
    await deleteUser(id);
    ElMessage.success('删除成功');
    fetchData();
  };

  return {
    loading,
    tableData,
    pagination,
    fetchData,
    handleDelete,
  };
}
```

**再生成组件** `src/views/user/index.vue`：

```vue
<template>
  <div class="user-list">
    <el-card>
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-button type="primary" @click="handleAdd" style="margin-bottom: 16px">
        新增用户
      </el-button>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="createTime" label="创建时间" />
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
        @change="fetchData"
        style="margin-top: 16px"
      />
    </el-card>

    <!-- 编辑弹窗 -->
    <EditDialog
      v-model:visible="editVisible"
      :record="currentRecord"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useTableData } from './composables';
import EditDialog from './components/EditDialog.vue';

const searchForm = reactive({
  username: '',
});

const editVisible = ref(false);
const currentRecord = ref(null);

const { loading, tableData, pagination, fetchData, handleDelete } = useTableData();

onMounted(() => {
  fetchData();
});

const handleSearch = () => {
  fetchData({ ...searchForm, current: 1 });
};

const handleReset = () => {
  searchForm.username = '';
  fetchData({ current: 1 });
};

const handleAdd = () => {
  currentRecord.value = null;
  editVisible.value = true;
};

const handleEdit = (row: any) => {
  currentRecord.value = row;
  editVisible.value = true;
};

const handleSuccess = () => {
  editVisible.value = false;
  fetchData();
};
</script>
```

---

## 6. 分步调用高级用法

### 场景描述

需要更精细控制代码生成流程时使用。

### 完整分步流程

```javascript
// Step 1: 检测技术栈
const techStack = await CallMcpTool({
  server: "codegen-engine",
  toolName: "detect_tech_stack",
  arguments: { projectPath: "D:/project/src/App.tsx" }
});
// 返回: { techStack: "react", uiLibrary: "antd", isTypeScript: true }

// Step 2: 检查全局类型
const globalTypes = await CallMcpTool({
  server: "codegen-engine",
  toolName: "check_global_types",
  arguments: { projectPath: "D:/project" }
});
// 返回: { globalInterfaces: ["UserInfo", "TableItem"], recommendation: "不要import这些类型" }

// Step 3: 智能匹配模板
const templateMatch = await CallMcpTool({
  server: "codegen-engine",
  toolName: "smart_match_template",
  arguments: {
    text: "做一个员工列表页",
    projectPath: "D:/project/src/App.tsx"
  }
});
// 返回: { chosen: { id: "react-standard-list-crud", score: 18 } }

// Step 4: 获取示例代码
const examples = await CallMcpTool({
  server: "codegen-engine",
  toolName: "get_code_examples",
  arguments: { templateId: "react-standard-list-crud" }
});
// 返回: { examples: { "hooks.example.ts": "...", "index.example.tsx": "..." } }

// Step 5: 获取规范内容
const spec = await CallMcpTool({
  server: "codegen-engine",
  toolName: "get_spec_content",
  arguments: { section: "核心规则" }
});
// 返回: { content: "## 核心规则\n..." }

// Step 6: 根据上下文生成代码...

// Step 7: 检查代码规范
const compliance = await CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: [
      "src/pages/employee/hooks/useTableData.ts",
      "src/pages/employee/index.tsx"
    ]
  }
});

// Step 8: 代码验证
const validation = await CallMcpTool({
  server: "codegen-engine",
  toolName: "validate_code",
  arguments: {
    projectPath: "D:/project",
    files: [
      "src/pages/employee/hooks/useTableData.ts",
      "src/pages/employee/index.tsx"
    ]
  }
});
```

---

## 7. 项目分析与诊断

### 场景描述

了解项目结构，获取智能路径推荐。

### 调用 analyze_project

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "analyze_project",
  arguments: {
    projectPath: "D:/project/src/App.tsx",
    moduleName: "employee-management"
  }
})
```

### 返回结果

```json
{
  "projectContext": {
    "rootDir": "D:/project",
    "directories": ["pages", "components", "hooks", "services", "utils"],
    "routerType": "umi",
    "stateManagement": "redux"
  },
  "codeStyle": {
    "prettier": { "found": true, "configPath": ".prettierrc" },
    "eslint": { "found": true, "configPath": ".eslintrc.js" },
    "typescript": { "found": true, "strict": true }
  },
  "fileSuggestions": {
    "pageDir": "src/pages/employee-management",
    "hooksFile": "src/pages/employee-management/hooks/useTableData.ts",
    "indexFile": "src/pages/employee-management/index.tsx",
    "typesFile": "src/pages/employee-management/types.ts"
  }
}
```

---

## 8. 代码验证与修复

### 场景描述

生成代码后验证质量，定位并修复问题。

### 调用 validate_code

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "validate_code",
  arguments: {
    projectPath: "D:/project",
    files: [
      "src/pages/employee/hooks/useTableData.ts",
      "src/pages/employee/index.tsx"
    ]
  }
})
```

### 返回结果（有问题时）

```json
{
  "success": false,
  "projectRoot": "D:/project",
  "summary": {
    "totalErrors": 2,
    "totalWarnings": 3,
    "fixableCount": 2
  },
  "typescript": {
    "success": false,
    "errorCount": 1,
    "errors": [
      {
        "file": "src/pages/employee/index.tsx",
        "line": 15,
        "code": "TS2304",
        "message": "找不到名称 'UserInfo'"
      }
    ]
  },
  "eslint": {
    "success": false,
    "errorCount": 1,
    "warningCount": 3,
    "errors": [
      {
        "file": "src/pages/employee/hooks/useTableData.ts",
        "line": 8,
        "ruleId": "no-unused-vars",
        "message": "'data' is defined but never used"
      }
    ]
  },
  "suggestions": [
    {
      "type": "typescript",
      "code": "TS2304",
      "count": 1,
      "suggestion": "找不到名称：检查类型是否需要导入或是否为全局类型"
    },
    {
      "type": "eslint",
      "rule": "no-unused-vars",
      "count": 1,
      "suggestion": "删除未使用的变量或导入"
    }
  ],
  "commands": {
    "tsFix": "npx tsc --noEmit",
    "eslintFix": "npx eslint src --fix"
  },
  "report": "❌ 发现 2 个错误，3 个警告\n\n📋 修复建议：\n- 找不到名称：检查类型是否需要导入或是否为全局类型 (1处)\n- 删除未使用的变量或导入 (1处)"
}
```

### 修复后再次验证

```javascript
// 修复问题后再次验证
CallMcpTool({
  server: "codegen-engine",
  toolName: "validate_code",
  arguments: {
    projectPath: "D:/project",
    files: [
      "src/pages/employee/hooks/useTableData.ts",
      "src/pages/employee/index.tsx"
    ]
  }
})

// 返回: { success: true, summary: { totalErrors: 0, totalWarnings: 0 } }
```

---

## 9. 大数据渲染（虚拟列表 + 分页下拉）

### 场景描述

用户需要创建一个属性值管理页面，包含：
- 8000+ 条属性值数据，使用虚拟滚动不分页展示
- 支持行内编辑
- 上级分类使用分页下拉选择
- 编辑时正确回显选中的分类

### Step 1: 调用 quick_generate

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个属性值管理页，8000+条数据虚拟滚动，支持行内编辑；上级分类用分页下拉选择",
    projectPath: "D:/project/src/pages/attribute/index.tsx"
  }
})
```

### Step 2: 分析返回结果

返回结果包含：

```json
{
  "techStack": {
    "detected": true,
    "techStack": "react",
    "framework": "umi",
    "uiLibrary": "antd",
    "isTypeScript": true
  },
  "templateMatch": {
    "chosen": {
      "id": "react-virtual-paginated-select",
      "name": "React 大数据渲染下拉组件",
      "score": 22
    }
  },
  "codeExamples": {
    "hooks/usePaginatedSelect.example.ts": "// 分页下拉 Hook 示例...",
    "components/VirtualTable.example.tsx": "// 虚拟表格组件示例...",
    "components/PaginatedSelect.example.tsx": "// 分页下拉组件示例...",
    "index.example.tsx": "// 主页面示例...",
    "types.example.ts": "// 类型定义示例..."
  },
  "criticalReminders": [
    "📋 虚拟列表必须设置固定行高（rowHeight/itemSize）",
    "📋 分页下拉必须实现选中项合并逻辑（编辑回显）",
    "📋 搜索必须防抖处理（300-500ms）"
  ]
}
```

### Step 3: 按顺序生成代码

**1. 先生成 hooks 文件** `src/pages/attribute/hooks/usePaginatedSelect.ts`：

```typescript
import { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash-es';

export interface SelectOption {
  value: string;
  label: string;
}

export const usePaginatedSelect = (options: {
  fetchApi: (params: any) => Promise<{ data: SelectOption[]; total: number }>;
  debounceMs?: number;
}) => {
  const { fetchApi, debounceMs = 500 } = options;
  
  const [state, setState] = useState({
    options: [] as SelectOption[],
    loading: false,
    pageNo: 1,
    pageSize: 10,
    total: 0,
    keyword: '',
    hasLoaded: false,
  });

  // 当前选中项（编辑回显用）
  const selectedItemRef = useRef<SelectOption | null>(null);

  /**
   * 合并选中项和分页数据
   * 确保编辑场景下选中项始终可见
   */
  const mergeOptions = useCallback((pageItems: SelectOption[]) => {
    const map = new Map<string, SelectOption>();

    // 先放选中项（优先级最高）
    const selectedItem = selectedItemRef.current;
    if (selectedItem?.value) {
      map.set(selectedItem.value, selectedItem);
    }

    // 再放分页数据（去重）
    pageItems.forEach((item) => {
      if (item?.value && !map.has(item.value)) {
        map.set(item.value, item);
      }
    });

    return Array.from(map.values());
  }, []);

  // 获取分页数据
  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetchApi({
        pageNo: state.pageNo,
        pageSize: state.pageSize,
        keyword: state.keyword || undefined,
      });

      setState((prev) => ({
        ...prev,
        options: mergeOptions(res.data || []),
        total: res.total || 0,
        hasLoaded: true,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [fetchApi, state.pageNo, state.pageSize, state.keyword, mergeOptions]);

  // 远程搜索（带防抖）
  const handleSearch = useCallback(
    debounce((keyword: string) => {
      setState((prev) => ({ ...prev, keyword, pageNo: 1 }));
      fetchData();
    }, debounceMs),
    [fetchData, debounceMs]
  );

  // 设置选中项（编辑回显）
  const setSelectedItem = useCallback((item: SelectOption | null) => {
    selectedItemRef.current = item;
    if (item) {
      setState((prev) => ({
        ...prev,
        options: mergeOptions(prev.options.length > 0 ? prev.options : [item]),
      }));
    }
  }, [mergeOptions]);

  return {
    ...state,
    handleSearch,
    handlePageChange: (page: number) => {
      setState((prev) => ({ ...prev, pageNo: page }));
      fetchData();
    },
    handleVisibleChange: (open: boolean) => {
      if (open && !state.hasLoaded) fetchData();
    },
    setSelectedItem,
    fetchData,
  };
};
```

**2. 生成虚拟表格组件** `src/pages/attribute/components/VirtualTable.tsx`：

```tsx
import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Spin, Empty, Input, Button, Space } from 'antd';

interface VirtualTableProps<T> {
  data: T[];
  columns: any[];
  rowHeight?: number;
  height?: number;
  loading?: boolean;
}

const VirtualTable = <T extends { rowKey: string }>({
  data,
  columns,
  rowHeight = 60,
  height = 500,
  loading = false,
}: VirtualTableProps<T>) => {
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const row = data[index];
      return (
        <div style={style} className="virtual-table-row">
          {columns.map((col) => (
            <div key={col.key} className="virtual-table-cell">
              {col.cellRenderer
                ? col.cellRenderer({ rowData: row, rowIndex: index })
                : row[col.dataKey] ?? '--'}
            </div>
          ))}
        </div>
      );
    },
    [data, columns]
  );

  if (!loading && data.length === 0) {
    return <Empty description="暂无数据" />;
  }

  return (
    <Spin spinning={loading}>
      <div className="virtual-table-header">
        {columns.map((col) => (
          <div key={col.key} className="virtual-table-header-cell">
            {col.title}
          </div>
        ))}
      </div>
      <List height={height} itemCount={data.length} itemSize={rowHeight} width="100%">
        {Row}
      </List>
    </Spin>
  );
};

export default VirtualTable;
```

**3. 生成分页下拉组件** `src/pages/attribute/components/PaginatedSelect.tsx`：

```tsx
import React, { useEffect } from 'react';
import { Select, Pagination, Spin, Empty } from 'antd';
import { usePaginatedSelect } from '../hooks/usePaginatedSelect';

interface PaginatedSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  fetchApi: (params: any) => Promise<{ data: any[]; total: number }>;
  initialSelectedItem?: { value: string; label: string } | null;
}

const PaginatedSelect: React.FC<PaginatedSelectProps> = ({
  value,
  onChange,
  fetchApi,
  initialSelectedItem,
}) => {
  const {
    options,
    loading,
    pageNo,
    pageSize,
    total,
    handleSearch,
    handlePageChange,
    handleVisibleChange,
    setSelectedItem,
  } = usePaginatedSelect({ fetchApi });

  // 编辑回显：设置初始选中项
  useEffect(() => {
    if (initialSelectedItem) {
      setSelectedItem(initialSelectedItem);
    }
  }, [initialSelectedItem, setSelectedItem]);

  return (
    <Select
      value={value}
      onChange={onChange}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      onDropdownVisibleChange={handleVisibleChange}
      loading={loading}
      options={options.map((item) => ({ value: item.value, label: item.label }))}
      dropdownRender={(menu) => (
        <div>
          {menu}
          {total > pageSize && (
            <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
              <Pagination
                size="small"
                current={pageNo}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
      notFoundContent={loading ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    />
  );
};

export default PaginatedSelect;
```

**4. 生成主页面** `src/pages/attribute/index.tsx`：

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, message } from 'antd';
import VirtualTable from './components/VirtualTable';
import PaginatedSelect from './components/PaginatedSelect';
import { getAttributeValues, getParentCategories } from '@/services/attribute';

const AttributeValuePage: React.FC = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  
  // 编辑回显：初始选中项
  const [initialSelectedItem] = useState({
    value: 'cat-50',
    label: '分类 50',
  });

  // 加载 8000+ 条数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await getAttributeValues();
        setTableData(res.data);
        message.success(`已加载 ${res.data.length} 条数据`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const columns = [
    { key: 'index', title: '序号', cellRenderer: ({ rowIndex }) => rowIndex + 1 },
    {
      key: 'valueName',
      dataKey: 'valueName',
      title: '属性值名称',
      cellRenderer: ({ rowData, rowIndex }) => (
        rowData.isEditing ? (
          <Input value={rowData.valueName} onChange={(e) => handleEdit(rowIndex, e.target.value)} />
        ) : (
          rowData.valueName
        )
      ),
    },
    { key: 'valueCode', dataKey: 'valueCode', title: '属性值编码' },
    { key: 'actions', title: '操作', cellRenderer: ({ rowIndex }) => <Button>编辑</Button> },
  ];

  return (
    <div className="attribute-page">
      <Card title="上级分类" style={{ marginBottom: 16 }}>
        <PaginatedSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
          fetchApi={getParentCategories}
          initialSelectedItem={initialSelectedItem}
        />
      </Card>

      <Card title={`属性值列表（共 ${tableData.length} 条）`}>
        <VirtualTable
          data={tableData}
          columns={columns}
          rowHeight={60}
          height={500}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default AttributeValuePage;
```

### Step 4: 检查代码规范

```javascript
CallMcpTool({
  server: "codegen-engine",
  toolName: "check_code_compliance",
  arguments: {
    generatedFiles: [
      "src/pages/attribute/hooks/usePaginatedSelect.ts",
      "src/pages/attribute/components/VirtualTable.tsx",
      "src/pages/attribute/components/PaginatedSelect.tsx",
      "src/pages/attribute/index.tsx"
    ]
  }
})
```

### Vue 3 版本示例

```javascript
// 使用 vue3-virtual-paginated-select 模板
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个属性值管理页，8000+条数据虚拟滚动，上级分类分页下拉选择",
    projectPath: "D:/vue3-project/src/App.vue"
  }
})
```

Vue 3 版本使用：
- 虚拟列表：`el-table-v2`（Element Plus 2.3.0+）
- 分页下拉：Composable `usePaginatedSelect`
- 编辑回显：合并选中项逻辑相同

### Vue 2 版本示例

```javascript
// 使用 vue2-virtual-paginated-select 模板
CallMcpTool({
  server: "codegen-engine",
  toolName: "quick_generate",
  arguments: {
    text: "做一个属性值管理页，虚拟滚动表格，分页下拉选择",
    projectPath: "D:/vue2-project/src/App.vue"
  }
})
```

Vue 2 版本使用：
- 虚拟列表：`vue-virtual-scroller@^1.1.2`
- 分页下拉：Mixin `paginatedSelectMixin`
- 编辑回显：合并选中项逻辑相同

### 关键注意事项

1. **虚拟列表**
   - 必须设置固定行高 `rowHeight` / `itemSize`
   - 使用 `React.memo` 或 `shallowRef` 优化重渲染

2. **分页下拉**
   - 搜索必须防抖（300-500ms）
   - 必须实现 `mergeOptions` 选中项合并逻辑
   - 首次展开时才加载数据

3. **编辑回显**
   - 详情接口返回后设置 `selectedItem`
   - 每次分页请求后调用 `mergeOptions` 合并数据
