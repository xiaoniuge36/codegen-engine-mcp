<template>
  <div class="upload_file" style="width: 100%">
    <!-- 网格模式（默认） -->
    <template v-if="displayMode === 'grid'">
      <van-uploader
        v-model="fileList"
        :after-read="afterRead"
        :preview-size="props.previewSize"
        :max-size="props.resultItem?.fileUpperLimit * 1024 * 1024"
        upload-icon="plus"
        :max-count="props.maxCount"
        :accept="computedAccept"
        :multiple="multiple"
        :deletable="!props.isSubmit"
        :show-upload="!props.isSubmit"
        :preview-full-image="false"
        @delete="onDeleteFile"
        @oversize="overSize"
        @click-preview="clickPreview"
      >
        <template #preview-cover="file">
          <img
            v-if="isImageFile(file)"
            :src="file.url"
            alt=""
            style="width: 100%; height: 100%"
          />
          <div v-else-if="isVideoFile(file)" class="video_box">
            <van-icon name="play-circle-o" size="30" color="#fff" />
          </div>
          <img
            v-else
            class="file_box"
            :src="defaultIcon[getExtend(file?.name ? file.name : file.file.name)]"
            alt=""
          />
          <div v-if="file.isExampleFile" style="text-align: center">示例</div>
        </template>
      </van-uploader>
    </template>

    <!-- 列表模式 -->
    <template v-else-if="displayMode === 'list'">
      <van-uploader
        v-model="fileList"
        :after-read="afterRead"
        :max-size="props.resultItem?.fileUpperLimit * 1024 * 1024"
        :max-count="props.maxCount"
        :accept="computedAccept"
        :multiple="multiple"
        :deletable="!props.isSubmit"
        :show-upload="!props.isSubmit"
        :preview-full-image="false"
        @delete="onDeleteFile"
        @oversize="overSize"
      >
        <template #default>
          <div class="upload-placeholder">
            <img src="@/assets/img/file.svg" alt="" class="upload-icon" />
            <span class="upload-text">上传附件</span>
          </div>
        </template>
        <template #preview-cover>
          <div style="display: none"></div>
        </template>
      </van-uploader>

      <!-- 自定义文件展示区域 -->
      <div class="attachment-list">
        <div
          class="attachment-item"
          v-for="(file, index) in fileListFeedBack"
          :key="index"
          @click="previewFile(file)"
        >
          <div class="attachment-icon">
            <img
              style="width: 100%; height: 100%"
              :src="defaultIcon[getExtend(file?.name ? file.name : file.file?.name)]"
              :alt="`${file?.name || file?.file?.name} icon`"
            />
          </div>
          <div class="attachment-info">
            <div class="attachment-title">{{ file.name || file.file?.name }}</div>
            <div class="attachment-size">{{ formatFileSize(file.size || file.fileSize) }}</div>
          </div>
          <div v-if="!props.isSubmit" class="attachment-delete" @click.stop="onDeleteFile(file)">
            <van-icon name="delete-o" />
          </div>
        </div>
      </div>
    </template>

    <!-- 图片和视频预览 -->
    <van-image-preview
      v-model:show="showImagePreview"
      :images="previewImages"
      :start-position="previewIndex"
      :close-on-click-image="false"
      class="attachment-preview"
      teleport="body"
    >
      <template #image="{ src }">
        <video
          v-if="isVideoFile(currentPreviewFile)"
          style="width: 100%"
          controls
          preload
          webkit-playsinline="true"
          playsinline="true"
          x5-playsinline="true"
          x5-video-player-fullscreen="true"
        >
          <source :src="src" />
        </video>
        <img v-else :src="src" style="width: 100%" />
      </template>
    </van-image-preview>

    <!-- 水印组件 -->
    <WaterMark
      v-for="(item, index) in waterMarkFileList.filter((d) => d.show !== false)"
      :key="item.index"
      :file="item.file"
      :index="item.index"
      @waterMarkDid="waterMarkDid"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, inject, onBeforeUnmount, onDeactivated } from 'vue'
import WaterMark from './waterMark.vue'
import { showFailToast, showDialog } from 'vant'
import { getPosiByGaode, getweatherLive, dataURLtoFile, cosUpload } from '@/utils/index.js'
import { useWaterMarkStore } from '@/stores/index.js'
import defaultIcon from './loadIcon'
import { storeToRefs } from 'pinia'

const waterMarkDatasStore = useWaterMarkStore()
const { waterMarkDatas } = storeToRefs(waterMarkDatasStore)
const $modal = inject('$modal')

const props = defineProps({
  resultItem: Object,
  index: {
    type: Number,
    default: 0
  },
  maxSize: Number,
  maxCount: {
    type: Number,
    default: 100
  },
  multiple: {
    type: Boolean,
    default: true
  },
  isShowExampleFile: {
    type: Boolean,
    default: false
  },
  isCamera: {
    type: Boolean,
    default: false
  },
  previewSize: {
    type: String,
    default: '(width - 80) / 3'
  },
  isSubmit: {
    type: Boolean,
    default: true
  },
  originalFile: {
    type: Boolean,
    default: false
  },
  formatType: {
    type: String,
    default: ''
  },
  displayMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

const emit = defineEmits(['updataDelFileList', 'updataFileListSuccess'])

const fileList = ref([])
const fileListFeedBack = ref([])
const waterMarkFileList = ref([])
const showImagePreview = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)
const currentPreviewFile = ref(null)

const computedAccept = computed(() => {
  const data = props.resultItem?.fileFormat || ''
  return data
    .toLowerCase()
    .replace(/\.jpg/g, 'image/jpg')
    .replace(/\.png/g, 'image/png')
    .replace(/\.gif/g, 'image/gif')
    .replace(/\.jpeg/g, 'image/jpeg')
    .replace(/\.pdf/g, 'application/pdf')
    .replace(/\.mp4/g, 'video/mp4')
})

onDeactivated(() => {
  showImagePreview.value = false
})

onBeforeUnmount(() => {
  showImagePreview.value = false
})

const addWaterMarkHandler = (file, index) => {
  waterMarkFileList.value.push({ file, index })
}

const removeWaterMark = (index) => {
  const item = waterMarkFileList.value.find((d) => d.index === index)
  if (item) {
    item.show = false
  }
}

const overSize = () => {
  showFailToast('最大上传' + props.resultItem?.fileUpperLimit + 'MB')
}

const getLocationByGaode = () => {
  getPosiByGaode()
    .then(({ locationData: ld }) => {
      getweatherLive(ld.addressComponent.province).then((data) => {
        waterMarkDatasStore.SETWATERMARKINFO({
          address: ld.formattedAddress,
          wather: data.weather,
          temperature: data.temperature,
          windDirection: data.windDirection,
          windPower: data.windPower,
          humidity: data.humidity
        })
      })
    })
    .catch(() => {
      waterMarkDatasStore.SETWATERMARKINFO({
        address: '未知',
        wather: '未知',
        temperature: '未知',
        windDirection: '未知',
        windPower: '未知',
        humidity: '未知'
      })
    })
}

let firstSet = ref(true)
watch(
  () => props.resultItem,
  () => {
    if (firstSet.value && props.resultItem) {
      props.resultItem.fileLogList?.forEach((item) => {
        item.deletable = false
        item.isExampleFile = props.isShowExampleFile
      })

      props.resultItem.uploadList?.forEach((item) => (item.isUploadSuccessFile = true))

      if (props.isShowExampleFile) {
        fileList.value = props.resultItem.fileLogList || []
        if (props.resultItem.uploadList) {
          fileList.value = [...props.resultItem.fileLogList, ...props.resultItem.uploadList]
        }
      } else {
        fileList.value = props.resultItem.uploadList || []
      }
      fileListFeedBack.value = JSON.parse(JSON.stringify(props.resultItem.uploadList || []))
      firstSet.value = false
    }
  },
  { immediate: true, deep: true }
)

const afterRead = (file) => {
  file.isUpload = false
  if (Array.isArray(file)) {
    multipleUploadFn(file)
  } else {
    if (props.originalFile && file?.content?.includes('image')) {
      dataURLtoFile(file.content, `原文件_${file.file.name}`).then((res) => {
        file.originalFile = res
        singleUploadFn(file)
      })
    } else {
      singleUploadFn(file)
    }
  }
}

const singleUploadFn = (file) => {
  if (!file.isExampleFile && !file.isUploadSuccessFile) {
    if (file.isUpload) {
      file.status = 'success'
      file.message = '上传成功'
    } else {
      file.status = 'uploading'
      file.message = '上传中...'
      if (file?.content?.includes('image')) {
        nextTick(() => {
          const idx = fileList.value.length - 1
          addWaterMarkHandler(fileList.value[idx], idx)
        })
      } else {
        uploadFileAction(file, fileList.value.length - 1)
      }
    }
  }
}

const onDeleteFile = (file) => {
  for (let i = 0; i < fileListFeedBack.value.length; i++) {
    if (fileListFeedBack.value[i].url === file.url) {
      fileListFeedBack.value.splice(i, 1)
      break
    }
  }
  if (props.resultItem) {
    props.resultItem.uploadList = fileListFeedBack.value
  }
  emit('updataDelFileList', fileListFeedBack.value)
}

const multipleUploadFn = async () => {
  for (let i = 0; i < fileList.value.length; i++) {
    const item = fileList.value[i]
    if (!item.isExampleFile && !item.isUploadSuccessFile) {
      if (item.isUpload) {
        item.status = 'success'
        item.message = '上传成功'
      } else {
        item.status = 'uploading'
        item.message = '上传中...'
        const fileName = item.name || item.file?.name || ''
        if (['bmp', 'png', 'jpg', 'jpeg'].includes(getExtend(fileName))) {
          nextTick(() => {
            addWaterMarkHandler(item, i)
          })
        } else {
          uploadFileAction(item, i)
        }
      }
    }
  }
}

const waterMarkDid = (opts) => {
  removeWaterMark(opts.index)
  fileList.value[opts.index].file = opts.file
  fileList.value[opts.index].url = opts.base64
  uploadFileAction(fileList.value[opts.index], opts.index)
}

const uploadFileAction = async (fileObj, index) => {
  if (fileObj.isUpload) return

  let formDataObj = new FormData()
  formDataObj.append('file', fileObj.file)

  try {
    let res = await cosUpload(formDataObj, props.resultItem?.fileTypeCode)

    let originalImageUrl = props.originalFile ? res.url : null
    if (fileObj.originalFile) {
      let orgFormDataObj = new FormData()
      orgFormDataObj.append('file', fileObj.originalFile)
      const originalFileRes = await cosUpload(orgFormDataObj, props.resultItem?.fileTypeCode)
      originalImageUrl = originalFileRes?.url
    }

    fileObj.status = 'success'
    fileObj.message = '上传完成'
    fileObj.isUpload = true
    fileObj.url = res.url

    const { uploadList, fileLogList, ...others } = props.resultItem || {}
    fileListFeedBack.value.push({
      ...others,
      url: fileObj.url,
      size: res.fileSize,
      fileSize: res.fileSize,
      name: fileObj.file.name,
      fileName: fileObj.file.name,
      fileFormat: res.fileFormat,
      originalImageUrl
    })

    if (props.resultItem) {
      props.resultItem.uploadList = fileListFeedBack.value
    }

    if (fileList.value.length - 1 === index) {
      emit('updataFileListSuccess', fileListFeedBack.value)
    }
  } catch (error) {
    fileObj.status = 'failed'
    fileObj.message = '上传失败'
    fileObj.isUpload = false
    fileObj.url = null
  }
}

const getExtend = (url) => {
  if (!url) return ''
  return url.substring(url.lastIndexOf('.') + 1).toLowerCase()
}

const isImageFile = (file) => {
  const imageExtensions = ['bmp', 'png', 'jpg', 'jpeg', 'gif', 'webp']
  const fileName = file?.name || file?.file?.name || ''
  return imageExtensions.includes(getExtend(fileName))
}

const isVideoFile = (file) => {
  const videoExtensions = ['mp4', 'mov']
  const fileName = file?.name || file?.file?.name || file?.fileName || ''
  return videoExtensions.includes(getExtend(fileName).toLowerCase())
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let fileSize = size
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }
  return `${fileSize.toFixed(2)} ${units[unitIndex]}`
}

const previewFile = (file) => {
  const fileName = file?.fileName || file?.file?.fileName || file?.name || ''
  const ext = getExtend(fileName)
  const fileUrl = file.url || file.file?.url

  if (ext === 'dwg') {
    const maxDwgViewSize = 50 * Math.pow(1024, 2)
    if (file.fileSize && Number(file.fileSize) > maxDwgViewSize) {
      showDialog({
        title: '提示',
        message: '文件大小超出50M，请下载文件进行预览。'
      })
      return
    }
    window.open(`https://sharecad.org/cadframe/load?url=${fileUrl}`)
    return
  }

  if (['doc', 'docx', 'pdf', 'ppt', 'pptx', 'rar', 'xls', 'xlsx', 'zip'].includes(ext)) {
    window.open(fileUrl)
    return
  }

  if (isVideoFile(file) || isImageFile(file)) {
    currentPreviewFile.value = file
    previewImages.value = [fileUrl]
    previewIndex.value = 0
    showImagePreview.value = true
    return
  }

  window.open(fileUrl)
}

const clickPreview = (file) => {
  const ext = getExtend(file.url)

  if (ext === 'dwg') {
    const maxDwgViewSize = 50 * Math.pow(1024, 2)
    if (file.fileSize && Number(file.fileSize) > maxDwgViewSize) {
      showDialog({
        title: '提示',
        message: '文件大小超出50M，请下载文件进行预览。'
      })
      return
    }
    window.open(`https://sharecad.org/cadframe/load?url=${file.url}`)
    return
  }

  if (['doc', 'docx', 'pdf', 'ppt', 'pptx', 'rar', 'xls', 'xlsx', 'zip'].includes(ext)) {
    window.open(file.url)
    return
  }

  if (['mp4', 'mov'].includes(ext.toLowerCase())) {
    currentPreviewFile.value = file
    previewImages.value = [file.url]
    previewIndex.value = 0
    showImagePreview.value = true
    return
  }

  const data = {
    list: fileList.value,
    i: fileList.value.findIndex((d) => d.url === file.url)
  }
  $modal('ImgPreview', data)
}

onMounted(() => {
  getLocationByGaode()
})
</script>

<style lang="less" scoped>
.upload_file {
  :deep(.van-uploader__preview-delete-icon) {
    position: absolute;
    font-size: 14px;
  }
  :deep(.van-uploader__preview-cover) {
    background: #fff;
    font-size: 12px;
  }
  :deep(.van-uploader__wrapper) {
    margin-left: -12px;
    margin-bottom: -12px;
    font-size: 0;
    display: block;
  }
  :deep(.van-uploader) {
    width: 100%;
    vertical-align: top;
  }
  :deep(.van-uploader__preview-image) {
    position: relative;
    margin-left: 12px;
    margin-bottom: 12px;
    width: auto;
    height: auto;
    &:after {
      content: '';
      padding-top: 100%;
      display: block;
    }
    img {
      object-fit: cover;
      object-position: center;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
    }
  }
  :deep(.van-uploader__file) {
    margin-left: 12px;
    width: auto;
    height: auto;
    display: block;
    position: relative;
    .van-uploader__file-name {
      display: none;
    }
    &:after {
      content: '';
      padding-top: 100%;
      display: block;
    }
  }
  :deep(.van-uploader__preview),
  :deep(.van-uploader__upload) {
    display: inline-block;
    vertical-align: top;
    margin: 0;
    width: 25%;
  }
  :deep(.van-uploader__upload) {
    height: auto;
    width: calc(25% - 12px);
    margin-left: 12px;
    &::after {
      content: '';
      display: block;
      padding-top: 100%;
    }
    .van-icon {
      font-size: 18px;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      margin: auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  :deep(.van-uploader__mask) {
    left: 12px;
    bottom: 12px;
  }
}

.video_box {
  width: 71px;
  height: 71px;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file_box {
  width: 71px;
  height: 71px;
}

.upload-placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 56px;
  border: 0.5px dashed #c8c8c8;
  border-radius: 4px;
  .upload-icon {
    width: 24px;
    height: 24px;
  }
  .upload-text {
    font-family: PingFang SC;
    font-size: 14px;
    color: #222222;
    margin-left: 4px;
  }
}

.attachment-list {
  margin-top: 12px;
  .attachment-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 0.5px solid #e5e5e5;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    width: 100%;
    &:last-child {
      margin-bottom: 0;
    }
    .attachment-icon {
      width: 40px;
      height: 40px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .attachment-info {
      flex: 1;
      min-width: 0;
      .attachment-title {
        font-size: 14px;
        color: #222222;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .attachment-size {
        font-size: 12px;
        color: #999999;
      }
    }
    .attachment-delete {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #f5f5f5;
      color: #999999;
      flex-shrink: 0;
      &:active {
        background-color: #e5e5e5;
      }
    }
  }
}
</style>

<style>
.attachment-preview {
  background: rgba(0, 0, 0, 0.7) !important;
  max-width: 100% !important;
  width: 100% !important;
}
.attachment-preview .van-swipe__track {
  margin: 0 auto;
}
.attachment-preview .van-image-preview__close-icon {
  z-index: 1000 !important;
  top: 16px !important;
  right: 16px !important;
  display: block !important;
  position: absolute;
}
.attachment-preview .van-image-preview__close-icon .van-icon {
  font-size: 24px !important;
  color: #ffffff !important;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.attachment-preview .van-image-preview__image-wrap {
  max-width: 80%;
}
.attachment-preview .van-image-preview__index {
  display: none;
}
</style>
