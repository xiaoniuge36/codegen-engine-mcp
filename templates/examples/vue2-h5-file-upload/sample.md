# Vue2 H5 文件上传组件模板

## 适用场景

- Vue 2 + Vant 移动端项目
- 需要文件/图片上传功能
- 支持水印添加（图片类型）
- 支持多种文件格式预览

## 功能特性

### 核心功能
- ✅ 基于 Vant Uploader 封装
- ✅ 支持单文件/多文件上传
- ✅ 支持图片水印（地理位置、天气、时间、拍摄人）
- ✅ 支持 COS/OSS 上传
- ✅ 支持文件格式限制和大小限制
- ✅ 支持示例文件展示

### 预览功能
- ✅ 图片预览（支持 jpg/jpeg/png/bmp/gif/webp）
- ✅ 视频预览（支持 mp4/mov）
- ✅ 文档类文件（doc/docx/pdf/ppt/xlsx 等）新窗口打开
- ✅ DWG 文件在线预览（通过 sharecad.org）

### 展示模式
- **grid（网格模式）**：九宫格预览图展示，适用于图片为主的场景
- **list（列表模式）**：文件列表展示，显示文件名和大小，适用于文档类场景

## Props 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| resultItem | Object | - | 文件配置对象，包含 fileFormat、fileUpperLimit、uploadList 等 |
| maxCount | Number | 100 | 最大上传数量 |
| maxSize | Number | - | 单文件最大大小（MB） |
| multiple | Boolean | true | 是否支持多选 |
| isSubmit | Boolean | true | 是否为提交态（提交态隐藏删除和上传按钮） |
| isShowExampleFile | Boolean | false | 是否显示示例文件 |
| isCamera | Boolean | false | 是否仅相机模式 |
| originalFile | Boolean | false | 是否保留原文件（水印场景下保留原图） |
| previewSize | String | '(width - 80) / 3' | 预览图尺寸 |
| displayMode | String | 'grid' | 展示模式：grid/list |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| updataFileListSuccess | fileList | 文件上传成功后触发 |
| updataDelFileList | fileList | 文件删除后触发 |

## 目录结构

```
vue2-h5-file-upload/
├── index.vue          # 主组件
├── waterMark.vue      # 水印组件
└── loadIcon.js        # 文件图标映射
```

## 使用示例

```vue
<template>
  <FileUpload
    :resultItem="fileConfig"
    :maxCount="9"
    :isSubmit="false"
    displayMode="grid"
    @updataFileListSuccess="handleUploadSuccess"
  />
</template>

<script setup>
import FileUpload from '@/components/FileUpload/index.vue'

const fileConfig = {
  fileFormat: '.jpg,.png,.pdf',
  fileUpperLimit: 10,
  fileTypeCode: 'BUSINESS_FILE',
  uploadList: [],
  fileLogList: []
}

const handleUploadSuccess = (list) => {
  console.log('上传成功', list)
}
</script>
```

## 依赖说明

- vant >= 4.0（Uploader、ImagePreview、Icon、Dialog）
- html2canvas（水印功能）
- compressorjs（图片压缩）
- pinia（水印数据状态管理）

## 水印功能说明

图片上传时自动添加水印，水印信息包括：
- 项目名称
- 地理位置（通过高德地图 API 获取）
- 天气信息
- 当前时间
- 拍摄人

如需禁用水印，可在 `singleUploadFn` 中跳过水印处理逻辑。

## 扩展配置

如果需要自定义上传逻辑，修改 `uploadFileAction` 函数中的 `cosUpload` 调用。
