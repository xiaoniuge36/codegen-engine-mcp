<template>
  <div class="custom-upload">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :accept="acceptTypesString"
      :http-request="customUpload"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      v-model:file-list="fileList"
      :before-upload="beforeUpload"
      :limit="maxCount"
      :on-exceed="handleExceed"
      :list-type="listType"
      :disabled="disabled"
      :class="{ 'hide-upload': fileList.length >= maxCount }"
    >
      <!-- 自定义上传触发按钮 -->
      <template #default>
        <div v-if="fileList.length < maxCount" class="upload-plus">
          <i class="el-icon-plus"></i>
          <div class="el-upload__text m-t-8">{{ uploadBtnText }}</div>
        </div>
      </template>

      <!-- 自定义文件展示插槽 -->
      <template #file="{ file }">
        <div class="custom-file-item">
          <!-- 图片类型：直接展示缩略图 -->
          <img
            v-if="isImageFile(file)"
            :src="file.url"
            class="el-upload-list__item-thumbnail"
          />
          <!-- 视频类型：自定义视频缩略图 -->
          <div v-else-if="isVideoFile(file)" class="video-thumbnail">
            <i class="el-icon-video-camera"></i>
            <span>视频</span>
          </div>
          <!-- 其他类型：文档缩略图 -->
          <div v-else class="doc-thumbnail">
            <i class="el-icon-document"></i>
            <span>{{ getFileExtension(file.name) }}</span>
          </div>

          <!-- 操作按钮 -->
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePreview(file)"
            >
              <i class="el-icon-zoom-in"></i>
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleRemove(file)"
            >
              <i class="el-icon-delete"></i>
            </span>
          </span>

          <!-- 进度条 -->
          <div v-if="file.status === 'uploading'" class="progress-container">
            <el-progress
              :percentage="file.percentage || 0"
              :color="progressColor"
              :stroke-width="6"
            />
          </div>
        </div>
      </template>

      <!-- 提示 -->
      <template #tip>
        <div class="el-upload__tip">{{ uploadTip }}</div>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { getToken } from '@/utils/auth'

const props = defineProps({
  uploadUrl: {
    type: String,
    default: '/upload/img'
  },
  maxCount: {
    type: Number,
    default: 5
  },
  maxSize: {
    type: Number,
    default: 10
  },
  acceptTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'application/pdf']
  },
  progressColor: {
    type: String,
    default: '#409EFF'
  },
  uploadType: {
    type: [String, Number],
    default: 82
  },
  uploadTip: {
    type: String,
    default: ''
  },
  uploadBtnText: {
    type: String,
    default: '上传文件'
  },
  listType: {
    type: String,
    default: 'picture-card'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['success', 'remove', 'change'])

const fileList = ref([])
const uploadRef = ref(null)

const acceptTypesString = computed(() => {
  return props.acceptTypes.join(',')
})

const customUpload = async (options) => {
  const { file, onProgress, onSuccess, onError } = options

  const formData = new FormData()
  formData.append('file', file)
  formData.append('uploadType', String(props.uploadType))

  try {
    const res = await axios.post(
      (process.env.VUE_APP_BASE_API || '') + props.uploadUrl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: getToken('token_op_login_key') || ''
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          const index = fileList.value.findIndex((f) => f.uid === file.uid)
          if (index !== -1) {
            fileList.value[index].percentage = percent
          }
          onProgress({ percent })
        }
      }
    )

    const response = res.data
    if (response.code === 200 || response.success) {
      onSuccess(response.data)
      const index = fileList.value.findIndex((f) => f.uid === file.uid)
      if (index !== -1) {
        fileList.value[index].url = response.data?.url || response.data?.fileUrl
        fileList.value[index].fileId = response.data?.fileId || response.data?.id
        fileList.value[index].status = 'success'
      }
      emit('success', file, response.data)
      emit('change', fileList.value)
    } else {
      throw new Error(response.message || '上传失败')
    }
  } catch (error) {
    onError(error)
    const index = fileList.value.findIndex((f) => f.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }
    ElMessage.error(error.message || '上传失败')
  }
}

const handlePreview = (file) => {
  if (file.url) {
    window.open(file.url)
  }
}

const handleRemove = (file) => {
  const index = fileList.value.findIndex((f) => f.uid === file.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
  }
  emit('remove', file)
  emit('change', fileList.value)
}

const beforeUpload = (file) => {
  if (file.size > props.maxSize * 1024 * 1024) {
    ElMessage.error(`文件大小不能超过${props.maxSize}M`)
    return false
  }

  if (props.acceptTypes.length > 0 && !props.acceptTypes.includes(file.type)) {
    const acceptStr = props.acceptTypes
      .map((t) => t.split('/')[1])
      .join('、')
    ElMessage.error(`仅支持上传${acceptStr}格式的文件`)
    return false
  }

  return true
}

const handleExceed = () => {
  ElMessage.warning(`最多只能上传${props.maxCount}个文件`)
}

const getFileExtension = (fileName) => {
  if (!fileName) return ''
  const ext = fileName.split('.').pop()
  return ext ? ext.toUpperCase() : ''
}

const isImageFile = (file) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
  const ext = getFileExtension(file.name || file.url || '').toLowerCase()
  return imageExtensions.includes(ext)
}

const isVideoFile = (file) => {
  const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv']
  const ext = getFileExtension(file.name || file.url || '').toLowerCase()
  return videoExtensions.includes(ext)
}

const getFileList = () => {
  return fileList.value
}

const setFileList = (list) => {
  fileList.value = list
}

const clearFileList = () => {
  fileList.value = []
}

defineExpose({
  fileList,
  getFileList,
  setFileList,
  clearFileList
})
</script>

<style lang="less" scoped>
.custom-upload {
  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: 100px;
      height: 100px;
    }
  }

  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 1;
    margin-bottom: 8px;

    .upload-plus {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100px;

      .el-icon-plus {
        font-size: 24px;
        color: #8c939d;
      }

      .el-upload__text {
        color: #606266;
        font-size: 12px;
        margin-top: 8px;
      }
    }
  }

  .custom-file-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100px;
    height: 100px;
    overflow: hidden;

    .el-upload-list__item-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-thumbnail {
      width: 100%;
      height: 100%;
      background-color: #000;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      text-align: center;

      i {
        font-size: 24px;
        margin-bottom: 4px;
      }
    }

    .doc-thumbnail {
      width: 100%;
      height: 100%;
      background-color: #f5f7fa;
      color: #606266;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      text-align: center;

      i {
        font-size: 24px;
        margin-bottom: 4px;
        color: #409eff;
      }
    }

    .el-upload-list__item-actions {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s;

      span {
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 8px;

        &:hover {
          color: #409eff;
        }
      }
    }

    &:hover .el-upload-list__item-actions {
      opacity: 1;
    }

    .progress-container {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 4px;
      background: rgba(255, 255, 255, 0.9);
    }
  }

  &.hide-upload :deep(.el-upload--picture-card) {
    display: none;
  }

  .el-upload__tip {
    color: #909399;
    line-height: 22px;
    font-size: 12px;
    margin-top: 8px;
  }
}
</style>
