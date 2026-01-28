<template>
  <div class="select-pagination">
    <el-pagination
      v-model:current-page="currentPageModel"
      v-model:page-size="pageSizeModel"
      :total="pageTotal"
      :page-sizes="[10, 20, 50, 100]"
      size="small"
      layout="prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  pageTotal: number;
  pagePerNum?: number;
  currentPage?: number;
}

interface Emits {
  (e: 'handleSizeChange', size: number): void;
  (e: 'handleCurrentChange', page: number): void;
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pagePerNum', size: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  pagePerNum: 10,
  currentPage: 1,
});

const emit = defineEmits<Emits>();

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val),
});

const pageSizeModel = computed({
  get: () => props.pagePerNum,
  set: (val) => emit('update:pagePerNum', val),
});

const handleSizeChange = (size: number) => {
  emit('handleSizeChange', size);
};

const handleCurrentChange = (page: number) => {
  emit('handleCurrentChange', page);
};
</script>

<style scoped lang="less">
.select-pagination {
  padding: 8px 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  background: #fff;

  :deep(.el-pagination) {
    --el-pagination-button-height: 24px;
    --el-pagination-button-width: 24px;
  }
}
</style>
