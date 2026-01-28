<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :style="{ width: '100%', ...selectStyle }"
    filterable
    remote
    reserve-keyword
    :remote-method="handleSearch"
    :loading="loading"
    @update:model-value="handleChange"
    @visible-change="handleVisibleChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled"
    >
      <slot name="option" :item="item">
        <span>{{ item.label }}</span>
      </slot>
    </el-option>

    <!-- 下拉底部分页 -->
    <template #footer>
      <SelectPagination
        v-if="showPagination"
        :page-total="total"
        :page-per-num="pageSize"
        :current-page="pageNo"
        @handleSizeChange="handlePageSizeChange"
        @handleCurrentChange="handlePageChange"
      />
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import SelectPagination from './SelectPagination.example.vue';
import { usePaginatedSelect } from '../composables/usePaginatedSelect.example';
import type { SelectOption, PaginationParams, PaginationResponse } from '../types.example';

interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  selectStyle?: Record<string, string>;
  /** 获取分页数据的接口 */
  fetchApi: (params: PaginationParams) => Promise<PaginationResponse<SelectOption>>;
  /** 搜索防抖时间，默认 500ms */
  debounceMs?: number;
  /** 每页条数，默认 10 */
  defaultPageSize?: number;
  /** 编辑回显：初始选中项 */
  initialSelectedItem?: SelectOption | null;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string, option?: SelectOption): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: true,
  debounceMs: 500,
  defaultPageSize: 10,
});

const emit = defineEmits<Emits>();

const {
  options,
  loading,
  pageNo,
  pageSize,
  total,
  showPagination,
  handleSearch,
  handlePageChange,
  handlePageSizeChange,
  handleVisibleChange,
  setSelectedItem,
} = usePaginatedSelect({
  fetchApi: props.fetchApi,
  debounceMs: props.debounceMs,
  defaultPageSize: props.defaultPageSize,
});

// 编辑回显：设置初始选中项
watch(
  () => props.initialSelectedItem,
  (item) => {
    if (item) {
      setSelectedItem(item);
    }
  },
  { immediate: true }
);

const handleChange = (value: string) => {
  emit('update:modelValue', value);
  const option = options.value.find((item) => item.value === value);
  emit('change', value, option);
};
</script>
