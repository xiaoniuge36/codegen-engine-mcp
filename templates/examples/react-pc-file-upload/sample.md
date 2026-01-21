# React PC 文件上传组件模板

## 适用场景

- React + Ant Design PC 端项目
- 需要文件/图片上传功能
- 支持上传进度显示
- 支持多种文件格式预览
- 支持 picture-card 卡片式展示

## 功能特性

### 核心功能
- ✅ 基于 Ant Design Upload 封装
- ✅ 支持单文件/多文件上传
- ✅ 支持自定义上传进度显示
- ✅ 支持文件格式限制和大小限制
- ✅ 支持 picture-card / text / picture 展示模式

### 预览功能
- ✅ 图片预览（缩略图展示）
- ✅ 视频文件标识
- ✅ 文档类文件标识
- ✅ 点击预览/新窗口打开

### 上传模式
- **picture-card（卡片模式）**：适用于图片上传场景，显示缩略图
- **text（文本模式）**：适用于文档上传场景，显示文件列表
- **picture（图片模式）**：显示小缩略图的列表

## Props 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| uploadUrl | string | '/api/upload' | 上传接口地址 |
| maxCount | number | 5 | 最大上传数量 |
| maxSize | number | 10 | 单文件最大大小（MB） |
| acceptTypes | string[] | ['image/jpeg', 'image/png', 'application/pdf'] | 允许的文件类型（MIME 类型） |
| progressColor | string | '#1890ff' | 进度条颜色 |
| uploadType | string \| number | 82 | 业务类型标识 |
| uploadTip | string | '' | 上传提示文案 |
| uploadBtnText | string | '上传文件' | 上传按钮文案 |
| listType | 'picture-card' \| 'text' \| 'picture' | 'picture-card' | 列表展示类型 |
| disabled | boolean | false | 是否禁用 |
| defaultFileList | UploadFile[] | [] | 初始文件列表 |
| headers | Record<string, string> | {} | 自定义请求头 |
| extraData | Record<string, any> | {} | 额外的上传参数 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| onSuccess | (file, response) => void | 单个文件上传成功 |
| onRemove | (file) => void | 文件移除 |
| onChange | (fileList) => void | 文件列表变化 |

## 暴露的方法（通过 ref 调用）

| 方法名 | 参数 | 说明 |
|--------|------|------|
| getFileList | () => UploadFile[] | 获取当前文件列表 |
| setFileList | (list: UploadFile[]) => void | 设置文件列表 |
| clearFileList | () => void | 清空文件列表 |

## 目录结构

```
react-pc-file-upload/
├── index.tsx              # 主组件
├── index.less             # 样式文件
└── hooks/
    └── useFileUpload.ts   # 上传逻辑 Hook
```

## 使用示例

### 基础使用

```tsx
import React, { useRef } from 'react';
import FileUpload, { FileUploadRef } from '@/components/FileUpload';

const MyForm: React.FC = () => {
  const uploadRef = useRef<FileUploadRef>(null);

  const handleSuccess = (file, response) => {
    console.log('上传成功', file, response);
  };

  const handleSubmit = () => {
    const fileList = uploadRef.current?.getFileList();
    console.log('提交的文件列表', fileList);
  };

  return (
    <>
      <FileUpload
        ref={uploadRef}
        uploadUrl="/api/upload"
        maxCount={5}
        maxSize={10}
        acceptTypes={['image/jpeg', 'image/png', 'application/pdf']}
        uploadTip="支持 jpg、png、pdf 格式，单个文件不超过 10MB"
        onSuccess={handleSuccess}
      />
      <button onClick={handleSubmit}>提交</button>
    </>
  );
};
```

### 在表单中使用

```tsx
import React from 'react';
import { Form, Button } from 'antd';
import FileUpload from '@/components/FileUpload';

const FormWithUpload: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    console.log('表单数据', values);
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item
        label="附件"
        name="attachments"
        valuePropName="fileList"
        getValueFromEvent={(e) => e}
      >
        <FileUpload
          uploadUrl="/api/upload"
          maxCount={3}
          maxSize={20}
          acceptTypes={[
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ]}
          uploadTip="支持 jpg、png、pdf、doc、docx 格式，单个文件不超过 20MB"
          onChange={(fileList) => form.setFieldValue('attachments', fileList)}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
```

### 回显已有文件

```tsx
import React, { useEffect, useRef } from 'react';
import FileUpload, { FileUploadRef } from '@/components/FileUpload';

const EditForm: React.FC<{ initialFiles: any[] }> = ({ initialFiles }) => {
  const uploadRef = useRef<FileUploadRef>(null);

  useEffect(() => {
    // 回显已有文件
    if (initialFiles && initialFiles.length > 0) {
      const fileList = initialFiles.map((file, index) => ({
        uid: file.id || `-${index}`,
        name: file.fileName,
        status: 'done' as const,
        url: file.fileUrl,
      }));
      uploadRef.current?.setFileList(fileList);
    }
  }, [initialFiles]);

  return (
    <FileUpload
      ref={uploadRef}
      uploadUrl="/api/upload"
      maxCount={9}
    />
  );
};
```

## 自定义上传逻辑

如需自定义上传逻辑，可以修改 `hooks/useFileUpload.ts` 中的 `customUpload` 函数：

```typescript
const customUpload = async (options: UploadRequestOption) => {
  const { file, onProgress, onSuccess, onError } = options;
  const rcFile = file as RcFile;

  const formData = new FormData();
  formData.append('file', rcFile);
  formData.append('uploadType', String(uploadType));
  // 添加其他业务参数
  formData.append('businessId', 'xxx');

  try {
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getToken()}`,
        ...headers,
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.({ percent });
      },
    });

    // 根据实际接口响应格式处理
    if (response.data.code === 200) {
      onSuccess?.(response.data.data);
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    onError?.(error);
  }
};
```

## 文件类型扩展

如需支持更多文件类型，修改 `useFileUpload.ts` 中的常量：

```typescript
// 图片文件扩展名
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];

// 视频文件扩展名
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'm4v'];

// 文档文件扩展名（用于显示对应图标）
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
```

## 依赖说明

- antd >= 4.x 或 >= 5.x
- axios（自定义上传请求）
- @ant-design/icons（图标）

## 与 Vue 版本差异

| 特性 | React 版本 | Vue 版本 |
|------|-----------|----------|
| 状态管理 | useState + useRef | ref + reactive |
| Hook 封装 | useFileUpload | 内联或 composable |
| 暴露方法 | useImperativeHandle + forwardRef | defineExpose |
| 样式方案 | Less + CSS Modules 可选 | Less + scoped |
| 类型支持 | 完整 TypeScript | TypeScript / JavaScript |

