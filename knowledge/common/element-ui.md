# Element UI/Plus Upload 组件知识图谱（Vue2/Vue3 PC 端）

## Upload 文件上传

### 基础用法

```vue
<el-upload
  action="/api/upload"
  :on-success="handleSuccess"
  :before-upload="beforeUpload"
>
  <el-button type="primary">点击上传</el-button>
</el-upload>
```

### 常用属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| action | string | - | 上传地址（必填） |
| headers | object | - | 请求头 |
| data | object | - | 额外参数 |
| name | string | 'file' | 上传文件字段名 |
| accept | string | - | 接受的文件类型 |
| limit | number | - | 最大上传文件数 |
| multiple | boolean | false | 是否支持多选 |
| file-list / v-model:file-list | array | [] | 上传的文件列表 |
| list-type | string | 'text' | 文件列表类型：text/picture/picture-card |
| auto-upload | boolean | true | 是否自动上传 |
| http-request | function | - | 自定义上传方法 |
| disabled | boolean | false | 是否禁用 |
| show-file-list | boolean | true | 是否显示文件列表 |
| drag | boolean | false | 是否启用拖拽上传 |

### 常用事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| on-success | response, file, fileList | 上传成功回调 |
| on-error | error, file, fileList | 上传失败回调 |
| on-progress | event, file, fileList | 上传进度回调 |
| on-change | file, fileList | 文件状态改变回调 |
| on-remove | file, fileList | 文件移除回调 |
| on-preview | file | 点击文件列表中已上传的文件时触发 |
| on-exceed | files, fileList | 超出限制时触发 |
| before-upload | file | 上传前钩子，返回 false 可阻止上传 |
| before-remove | file, fileList | 删除前钩子 |

### file 对象属性

```typescript
interface UploadFile {
  name: string          // 文件名
  percentage?: number   // 上传进度
  status: string        // 状态：ready/uploading/success/fail
  size: number          // 文件大小
  response?: any        // 服务端响应
  uid: number           // 唯一标识
  url?: string          // 文件地址
  raw?: File            // 原始文件对象
}
```

---

## 自定义上传（http-request）

```vue
<template>
  <el-upload
    :http-request="customUpload"
    :on-remove="handleRemove"
    v-model:file-list="fileList"
  >
    <el-button type="primary">上传文件</el-button>
  </el-upload>
</template>

<script setup>
import axios from 'axios'

const customUpload = async (options) => {
  const { file, onProgress, onSuccess, onError } = options
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const res = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / e.total)
        onProgress({ percent })
      }
    })
    onSuccess(res.data)
  } catch (error) {
    onError(error)
  }
}
</script>
```

---

## 图片卡片模式（picture-card）

```vue
<template>
  <el-upload
    v-model:file-list="fileList"
    action="/api/upload"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>

  <!-- 图片预览对话框 -->
  <el-dialog v-model="dialogVisible">
    <img :src="dialogImageUrl" style="width: 100%" />
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const fileList = ref([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const handleRemove = (file) => {
  console.log('remove', file)
}
</script>
```

---

## 拖拽上传

```vue
<el-upload
  drag
  action="/api/upload"
  :on-success="handleSuccess"
>
  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
  <div class="el-upload__text">
    将文件拖到此处，或<em>点击上传</em>
  </div>
  <template #tip>
    <div class="el-upload__tip">
      只能上传 jpg/png 文件，且不超过 500kb
    </div>
  </template>
</el-upload>
```

---

## 文件校验最佳实践

```vue
<script setup>
import { ElMessage } from 'element-plus'

const beforeUpload = (file) => {
  // 1. 文件类型校验
  const allowTypes = ['image/jpeg', 'image/png', 'application/pdf']
  if (!allowTypes.includes(file.type)) {
    ElMessage.error('文件格式不支持！')
    return false
  }
  
  // 2. 文件大小校验（10MB）
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB！')
    return false
  }
  
  // 3. 文件名长度校验
  if (file.name.length > 100) {
    ElMessage.error('文件名过长！')
    return false
  }
  
  return true
}

const handleExceed = (files, fileList) => {
  ElMessage.warning(`最多只能上传 ${limit} 个文件`)
}
</script>
```

---

## 自定义文件列表插槽

```vue
<el-upload v-model:file-list="fileList" list-type="picture-card">
  <template #file="{ file }">
    <div class="custom-file">
      <img v-if="isImage(file)" :src="file.url" />
      <span v-else>{{ file.name }}</span>
      
      <!-- 操作按钮 -->
      <span class="actions">
        <el-icon @click="handlePreview(file)"><ZoomIn /></el-icon>
        <el-icon @click="handleRemove(file)"><Delete /></el-icon>
      </span>
      
      <!-- 进度条 -->
      <el-progress
        v-if="file.status === 'uploading'"
        :percentage="file.percentage"
      />
    </div>
  </template>
</el-upload>
```

---

## 手动上传

```vue
<template>
  <el-upload
    ref="uploadRef"
    action="/api/upload"
    :auto-upload="false"
    v-model:file-list="fileList"
  >
    <el-button>选取文件</el-button>
  </el-upload>
  <el-button type="success" @click="submitUpload">上传到服务器</el-button>
</template>

<script setup>
import { ref } from 'vue'

const uploadRef = ref()
const fileList = ref([])

const submitUpload = () => {
  uploadRef.value.submit()
}
</script>
```

---

## 常见问题

### 1. 跨域上传

使用 `http-request` 自定义上传，添加 `withCredentials` 或 `headers`。

### 2. 文件回显

```javascript
// 编辑场景：将已有文件设置到 fileList
fileList.value = existingFiles.map(file => ({
  name: file.fileName,
  url: file.fileUrl,
  uid: file.id
}))
```

### 3. 获取上传结果

```javascript
// 从 fileList 中提取已上传文件的 URL
const getUploadedUrls = () => {
  return fileList.value
    .filter(f => f.status === 'success')
    .map(f => f.response?.url || f.url)
}
```
