<template>
  <el-select
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    style="width: 100%"
    filterable
    remote
    reserve-keyword
    :remote-method="handleSearchDebounced"
    :loading="loading"
    @input="handleInput"
    @change="handleChange"
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

    <!-- Vue2 el-select 没有 footer 插槽，用禁用的 option 模拟 -->
    <el-option
      v-if="showPagination"
      disabled
      value=""
      class="select-pagination-option"
    >
      <SelectPagination
        :page-total="total"
        :page-per-num="pageSize"
        :current-page="pageNo"
        @handleSizeChange="handlePageSizeChange"
        @handleCurrentChange="handlePageChange"
      />
    </el-option>
  </el-select>
</template>

<script>
import SelectPagination from './SelectPagination.example.vue';

/**
 * 防抖函数
 */
const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

export default {
  name: 'PaginatedSelect',
  components: {
    SelectPagination,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    /** 获取分页数据的接口 */
    fetchApi: {
      type: Function,
      required: true,
    },
    /** 搜索防抖时间，默认 500ms */
    debounceMs: {
      type: Number,
      default: 500,
    },
    /** 每页条数，默认 10 */
    defaultPageSize: {
      type: Number,
      default: 10,
    },
    /** 编辑回显：初始选中项 */
    initialSelectedItem: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      options: [],
      loading: false,
      pageNo: 1,
      pageSize: this.defaultPageSize,
      total: 0,
      keyword: '',
      hasLoaded: false,
      selectedItem: null,
    };
  },
  computed: {
    showPagination() {
      return this.total > this.pageSize;
    },
  },
  watch: {
    initialSelectedItem: {
      immediate: true,
      handler(item) {
        if (item) {
          this.setSelectedItem(item);
        }
      },
    },
  },
  created() {
    // 创建防抖搜索函数
    this.handleSearchDebounced = debounce(this.handleSearch, this.debounceMs);
  },
  methods: {
    /**
     * 合并选中项和分页数据
     * 确保编辑场景下选中项始终可见
     */
    mergeOptions(pageItems) {
      const map = new Map();

      // 先放选中项（优先级最高）
      if (this.selectedItem && this.selectedItem.value) {
        map.set(this.selectedItem.value, this.selectedItem);
      }

      // 再放分页数据（去重）
      (pageItems || []).forEach((item) => {
        if (item && item.value && !map.has(item.value)) {
          map.set(item.value, item);
        }
      });

      return Array.from(map.values());
    },

    /**
     * 获取分页数据
     */
    async fetchData() {
      this.loading = true;

      try {
        const res = await this.fetchApi({
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          keyword: this.keyword || undefined,
        });

        const pageItems = res.data || [];
        this.options = this.mergeOptions(pageItems);
        this.total = res.total || 0;
        this.hasLoaded = true;
      } catch (error) {
        console.error('获取分页数据失败:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 远程搜索
     */
    handleSearch(keyword) {
      this.keyword = keyword || '';
      this.pageNo = 1;
      this.fetchData();
    },

    /**
     * 分页变化
     */
    handlePageChange(page) {
      this.pageNo = page;
      this.fetchData();
    },

    /**
     * 每页条数变化
     */
    handlePageSizeChange(size) {
      this.pageSize = size;
      this.pageNo = 1;
      this.fetchData();
    },

    /**
     * 下拉展开事件
     */
    handleVisibleChange(visible) {
      if (visible && !this.hasLoaded) {
        this.fetchData();
      }
    },

    /**
     * 设置选中项（编辑回显）
     */
    setSelectedItem(item) {
      this.selectedItem = item;

      if (item) {
        if (this.options.length === 0) {
          this.options = [item];
        } else {
          this.options = this.mergeOptions(this.options);
        }
      }
    },

    /**
     * 值变化
     */
    handleInput(value) {
      this.$emit('input', value);
    },

    handleChange(value) {
      const option = this.options.find((item) => item.value === value);
      this.$emit('change', value, option);
    },

    /**
     * 重置状态
     */
    reset() {
      this.selectedItem = null;
      this.options = [];
      this.loading = false;
      this.pageNo = 1;
      this.pageSize = this.defaultPageSize;
      this.total = 0;
      this.keyword = '';
      this.hasLoaded = false;
    },
  },
};
</script>

<style scoped lang="less">
.select-pagination-option {
  padding: 0 !important;
  height: auto !important;
  line-height: normal !important;
  cursor: default !important;
  background: #fff !important;

  &:hover {
    background: #fff !important;
  }
}
</style>
