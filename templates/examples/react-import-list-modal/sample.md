# React 导入弹窗 - 完整示例说明

## 📖 示例概述

本示例展示如何构建一个 Excel 导入弹窗，包含以下功能：
- 模板下载
- 文件上传（仅 xlsx/xls）
- 异步导入 + 轮询
- 导入记录列表
- 下载处理结果/错误文件

## 📁 文件结构

```
src/pages/[模块]/[功能]/components/
├── ImportModal/
│   ├── index.tsx               # 导入弹窗主文件
│   └── index.less              # 样式文件
```

## 🎯 核心要点

### 1. 文件上传限制

```typescript
<Upload
  accept=".xlsx,.xls"           // ✅ 仅允许 Excel 文件
  maxCount={1}                  // ✅ 只允许一个文件
  beforeUpload={handleBeforeUpload}
  customRequest={handleUpload}  // ✅ 自定义上传逻辑
>
  <Button icon={<UploadOutlined />}>选择文件</Button>
</Upload>
```

### 2. 异步导入 + 轮询

```typescript
// 上传成功后
const handleUpload = async (file) => {
  const res = await uploadExcelDataAsync(file);
  
  // 如果返回 processStatus = 1，说明需要轮询
  if (res.processStatus === 1) {
    // 显示通知
    notificationKey = notification.info({
      message: '导入处理中',
      description: '正在处理导入数据，请稍候...',
      duration: 0,  // ✅ 持续显示
    });
    
    // 开始轮询
    startPolling(res.invoice);
  }
};

// 轮询处理
const startPolling = (invoice) => {
  const timer = setInterval(async () => {
    const status = await getImportProcessingState(invoice);
    
    if (status.processStatus === 2) {  // 处理完成
      clearInterval(timer);
      notification.close(notificationKey);
      notification.success({ message: '导入成功' });
      refetchList();  // ✅ 刷新列表
    } else if (status.processStatus === 3) {  // 处理失败
      clearInterval(timer);
      notification.close(notificationKey);
      notification.error({ message: '导入失败' });
      refetchList();
    }
  }, 3000);  // 每 3 秒轮询一次
};
```

### 3. 导入记录列表

```typescript
const columns: ProColumns<ImportRecord>[] = [
  {
    title: '文件名',
    dataIndex: 'fileName',
    key: 'fileName',
  },
  {
    title: '导入时间',
    dataIndex: 'importTime',
    key: 'importTime',
  },
  {
    title: '处理结果',
    dataIndex: 'status',
    key: 'status',
    render: (status: number) => {
      const statusMap = {
        1: { text: '处理中', color: 'processing' },
        2: { text: '成功', color: 'success' },
        3: { text: '失败', color: 'error' },
      };
      return <Badge {...statusMap[status]} />;
    },
  },
  {
    title: '导入人',
    dataIndex: 'importerName',
    key: 'importerName',
  },
  {
    title: '操作',
    valueType: 'option',
    render: (_, record) => {
      if (record.status === 2) {
        return (
          <a onClick={() => downloadResult(record.resultFileUrl)}>
            下载结果
          </a>
        );
      }
      if (record.status === 3) {
        return (
          <a onClick={() => downloadErrorFile(record.errorFileUrl)}>
            下载错误详情
          </a>
        );
      }
      return null;
    },
  },
];
```

### 4. 模板下载

```typescript
const handleDownloadTemplate = async () => {
  try {
    // 方式1：自定义下载逻辑
    if (customDownload) {
      await customDownload();
      return;
    }
    
    // 方式2：默认下载逻辑
    await downloadTemplate({
      title: '员工信息导入模板',
      typeCode: 'EMPLOYEE_IMPORT',
    });
    
    message.success('模板下载成功');
  } catch (error) {
    message.error('模板下载失败');
  }
};
```

### 5. TypeScript 类型定义

```typescript
export interface ImportRecord {
  id: string;
  fileName: string;
  importTime: string;
  status: 1 | 2 | 3;  // 1-处理中, 2-成功, 3-失败
  importerName: string;
  resultFileUrl?: string;
  errorFileUrl?: string;
}

export interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  customDownload?: () => Promise<void>;
  uploadConfig?: {
    maxFileSize?: number;  // MB
    accept?: string;
  };
}
```

## 📝 使用示例

### 场景：员工信息导入

```typescript
import ImportModal from './components/ImportModal';

const EmployeeList = () => {
  const [importVisible, setImportVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setImportVisible(true)}>
        批量导入
      </Button>

      <ImportModal
        visible={importVisible}
        onCancel={() => setImportVisible(false)}
        onSuccess={() => {
          setImportVisible(false);
          refetchList();  // 刷新列表
        }}
        customDownload={async () => {
          // 自定义模板下载逻辑（可选）
          await downloadEmployeeTemplate();
        }}
        uploadConfig={{
          maxFileSize: 5,  // 5MB
        }}
      />
    </>
  );
};
```

## 🚨 强制要求

1. **上传限制**：仅允许 .xlsx/.xls 文件，单个文件
2. **异步导入**：必须实现轮询机制
3. **通知管理**：处理中通知持续显示，完成后关闭
4. **禁止残留**：禁止 console.log/debugger
5. **类型引入**：ProColumns、UploadProps 等第三方类型必须正确引入

## 🔗 相关资源

- [Ant Design Pro Components 知识图谱](../../../knowledge/common/ant-design-pro.md)
- [AI前端代码生成执行规范](../../../../AI前端代码生成执行规范（含vue、规范、完整版）.md)
