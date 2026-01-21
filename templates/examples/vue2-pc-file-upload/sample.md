# Vue2 PC 文件上传组件模板

## 适用场景

- Vue 2/3 + Element Plus/Element UI PC 端项目
- 需要文件/图片上传功能
- 支持上传进度显示
- 支持多种文件格式预览

## 功能特性

### 核心功能
- ✅ 基于 Element Upload 封装
- ✅ 支持单文件/多文件上传
- ✅ 支持自定义上传进度显示
- ✅ 支持文件格式限制和大小限制
- ✅ 支持 picture-card 展示模式

### 预览功能
- ✅ 图片预览（缩略图展示）
- ✅ 视频文件标识
- ✅ 文档类文件标识
- ✅ 点击预览/新窗口打开

### 上传模式
- **picture-card（卡片模式）**：适用于图片上传场景
- **text（文本模式）**：适用于文档上传场景

## Props 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| uploadUrl | String | '/upload/img' | 上传接口地址 |
| maxCount | Number | 5 | 最大上传数量 |
| maxSize | Number | 10 | 单文件最大大小（MB） |
| acceptTypes | Array | ['image/jpeg', 'image/png', 'application/pdf'] | 允许的文件类型 |
| progressColor | String | '#409EFF' | 进度条颜色 |
| uploadType | String/Number | 82 | 业务类型标识 |
| uploadTip | String | '最多可上传5个文件,最大10M' | 上传提示文案 |
| listType | String | 'picture-card' | 列表展示类型 |
| disabled | Boolean | false | 是否禁用 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| success | file, response | 单个文件上传成功 |
| remove | file | 文件移除 |
| change | fileList | 文件列表变化 |

## 目录结构

```
vue2-pc-file-upload/
├── index.vue          # 主组件
└── types.ts           # 类型定义（可选）
```

## 使用示例

```vue
<template>
  <FileUpload
    uploadUrl="/api/upload"
    :maxCount="5"
    :maxSize="10"
    :acceptTypes="['image/jpeg', 'image/png', 'application/pdf']"
    uploadTip="支持 jpg、png、pdf 格式，单个文件不超过 10MB"
    @success="handleSuccess"
  />
</template>

<script setup>
import FileUpload from '@/components/FileUpload/index.vue'

const handleSuccess = (file, response) => {
  console.log('上传成功', file, response)
}
</script>
```

## 依赖说明

- element-plus 或 element-ui
- axios（自定义上传请求）

## 扩展配置

### 自定义上传逻辑

修改 `customUpload` 函数以适配不同的上传接口：

```javascript
const customUpload = async (options) => {
  const { file, onProgress, onSuccess, onError } = options
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const res = await axios.post(uploadUrl, formData, {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress({ percent })
      }
    })
    onSuccess(res.data)
  } catch (error) {
    onError(error)
  }
}
```

### 文件类型判断扩展

```javascript
const isImageFile = (file) => {
  const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  return imageTypes.some(type => file.name?.toLowerCase().endsWith(type))
}

const isVideoFile = (file) => {
  const videoTypes = ['.mp4', '.mov', '.avi', '.wmv']
  return videoTypes.some(type => file.name?.toLowerCase().endsWith(type))
}
```
