<template>
  <div class="watermark-wrap" :id="`watermark${props.index}`" width="100%">
    <img :src="imageUrl" ref="imgEle" class="carmImg" style="width: 100%; height: 100%" />
    <div v-if="imageUrl" class="watermark-text">
      <div v-if="wmDatas.projectName">项目名称：{{ wmDatas.projectName }}</div>
      <div>地址：{{ wmDatas.address }}</div>
      <div>天气：{{ wmDatas.wather }} {{ wmDatas.temperature }}度</div>
      <div>时间：{{ wmDatas.dateNow }}</div>
      <div>拍摄人：{{ wmDatas.userName }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import Compressor from 'compressorjs'
import { storeToRefs } from 'pinia'
import { useWaterMarkStore } from '@/stores/index.js'
import { getBase64, dataURLtoFile, dateFormat } from '@/utils/index.js'

const waterMarkDatasStore = useWaterMarkStore()
const { waterMarkDatas } = storeToRefs(waterMarkDatasStore)
const imageUrl = ref('')
const wmDatas = ref({})

const props = defineProps({
  index: Number,
  file: Object
})

const emit = defineEmits(['waterMarkDid'])

const wmDataBundle = () => {
  wmDatas.value = {
    ...waterMarkDatas.value,
    dateNow: dateFormat(new Date())
  }
}

const waterMarkBundle = ({ file }, index) => {
  var image = new Image()
  if (!file) {
    return alert('没有选择图片哦~')
  }
  wmDataBundle()

  new Compressor(file, {
    quality: 0.6,
    convertSize: 2000000,
    success(result) {
      getBase64(result).then((res) => {
        imageUrl.value = res
        image.src = res
        image.onload = function () {
          const clientHeight = window.screen.height
          html2canvas(document.getElementById(`watermark${props.index}`), {
            allowTaint: true,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: -clientHeight
          }).then((canvas) => {
            let base64Url = canvas.toDataURL('image/jpeg')
            dataURLtoFile(base64Url, file.name).then((res) => {
              emit('waterMarkDid', {
                file: res,
                base64: base64Url,
                index
              })
            })
          })
        }
      })
    },
    error(err) {
      console.log(err.message)
    }
  })
}

defineExpose({ waterMarkBundle })

onMounted(() => {
  nextTick(() => {
    const clientHeight = window.screen.height
    const el = document.querySelector(`#watermark${props.index}`)
    if (el) {
      el.style.top = clientHeight + 'px'
    }
    if (props.file) {
      waterMarkBundle(props.file, props.index)
    }
  })
})
</script>

<style scoped lang="less">
.watermark-wrap {
  position: fixed;
  left: 0;
  top: 100vh;
  width: 100%;
}

.watermark-text {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60%;
  font-size: 12px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 5px;
  box-sizing: border-box;
  line-height: 12px;
}
</style>
