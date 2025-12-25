# Vant Components 知识图谱（Vue2/Vue3 H5 移动端）

## Uploader 文件上传

### 基础用法

```vue
<van-uploader v-model="fileList" :after-read="afterRead" />
```

### 常用属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| v-model | FileListItem[] | [] | 已上传的文件列表 |
| accept | string | 'image/*' | 允许上传的文件类型 |
| max-count | number | - | 文件上传数量限制 |
| max-size | number | - | 文件大小限制（字节） |
| multiple | boolean | false | 是否开启多选 |
| deletable | boolean | true | 是否显示删除按钮 |
| show-upload | boolean | true | 是否显示上传区域 |
| preview-size | number/string | 80px | 预览图和上传区域的尺寸 |
| preview-full-image | boolean | true | 是否在点击预览图后展示全屏图片预览 |
| upload-icon | string | 'photograph' | 上传区域图标名称 |

### 常用事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| after-read | file/file[] | 文件读取完成后触发 |
| oversize | file/file[] | 文件大小超过限制时触发 |
| delete | file, detail | 删除文件预览时触发 |
| click-preview | file, detail | 点击预览图时触发 |

### FileListItem 数据结构

```typescript
interface FileListItem {
  url?: string          // 图片/文件 URL
  file?: File           // 原始文件对象
  content?: string      // 文件内容（base64）
  name?: string         // 文件名
  status?: string       // 状态：uploading/done/failed
  message?: string      // 状态提示文案
  deletable?: boolean   // 是否可删除
  imageFit?: string     // 预览图裁剪模式
  isImage?: boolean     // 是否为图片
}
```

### 自定义上传流程

```vue
<script setup>
const afterRead = (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  
  // 调用上传接口
  uploadFile(file.file).then(res => {
    file.status = 'done'
    file.url = res.url
  }).catch(() => {
    file.status = 'failed'
    file.message = '上传失败'
  })
}
</script>
```

### 自定义预览插槽

```vue
<van-uploader v-model="fileList">
  <template #preview-cover="{ file }">
    <div class="preview-cover">
      <p>{{ file.name }}</p>
    </div>
  </template>
</van-uploader>
```

---

## ImagePreview 图片预览

### 函数调用

```javascript
import { showImagePreview } from 'vant'

showImagePreview({
  images: ['https://...', 'https://...'],
  startPosition: 0,
  onClose: () => {}
})
```

### 组件调用

```vue
<van-image-preview
  v-model:show="show"
  :images="images"
  :start-position="0"
  :close-on-click-image="false"
>
  <template #image="{ src }">
    <img :src="src" />
  </template>
</van-image-preview>
```

### 视频预览（自定义 image 插槽）

```vue
<van-image-preview v-model:show="show" :images="[videoUrl]">
  <template #image="{ src }">
    <video
      controls
      webkit-playsinline="true"
      playsinline="true"
      x5-playsinline="true"
    >
      <source :src="src" />
    </video>
  </template>
</van-image-preview>
```

---

## Dialog 对话框

### 函数调用

```javascript
import { showDialog, showConfirmDialog } from 'vant'

// 消息提示
showDialog({
  title: '标题',
  message: '内容'
})

// 确认框
showConfirmDialog({
  title: '标题',
  message: '确定要删除吗？'
}).then(() => {
  // 确认
}).catch(() => {
  // 取消
})
```

---

## Toast 轻提示

```javascript
import { showToast, showSuccessToast, showFailToast, showLoadingToast, closeToast } from 'vant'

showToast('提示内容')
showSuccessToast('成功')
showFailToast('失败')

// loading
const toast = showLoadingToast({
  message: '加载中...',
  forbidClick: true,
  duration: 0
})
// 关闭
closeToast()
```

---

## 最佳实践

### 1. 文件上传状态管理

```javascript
const uploadFile = async (file) => {
  // 1. 设置上传中状态
  file.status = 'uploading'
  file.message = '上传中...'
  
  try {
    // 2. 执行上传
    const formData = new FormData()
    formData.append('file', file.file)
    const res = await api.upload(formData)
    
    // 3. 更新成功状态
    file.status = 'done'
    file.url = res.url
    
  } catch (error) {
    // 4. 更新失败状态
    file.status = 'failed'
    file.message = '上传失败'
  }
}
```

### 2. 文件格式校验

```javascript
const beforeRead = (file) => {
  const allowTypes = ['image/jpeg', 'image/png', 'application/pdf']
  
  if (!allowTypes.includes(file.type)) {
    showFailToast('文件格式不支持')
    return false
  }
  return true
}
```

### 3. 图片压缩（使用 compressorjs）

```javascript
import Compressor from 'compressorjs'

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      convertSize: 2000000,
      success: resolve,
      error: reject
    })
  })
}
```
