/**
 * 分页下拉选择 Mixin
 *
 * 使用方式：
 * 1. 在组件中引入此 mixin
 * 2. 实现 fetchApi 方法
 * 3. 调用 initPaginatedSelect 初始化
 *
 * 核心功能：
 * 1. 远程搜索 + 分页
 * 2. 编辑场景回显（选中项始终可见）
 * 3. 防抖搜索
 * 4. 首次展开懒加载
 */

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
  data() {
    return {
      // 分页下拉状态
      paginatedSelect: {
        options: [],
        loading: false,
        pageNo: 1,
        pageSize: 10,
        total: 0,
        keyword: '',
        hasLoaded: false,
        selectedItem: null,
      },
    };
  },
  computed: {
    showPagination() {
      return this.paginatedSelect.total > this.paginatedSelect.pageSize;
    },
  },
  methods: {
    /**
     * 初始化分页下拉
     * @param {Object} options - 配置项
     * @param {Function} options.fetchApi - 获取分页数据的接口
     * @param {number} options.debounceMs - 搜索防抖时间，默认 500ms
     * @param {number} options.pageSize - 每页条数，默认 10
     */
    initPaginatedSelect(options = {}) {
      const { fetchApi, debounceMs = 500, pageSize = 10 } = options;

      this._paginatedSelectFetchApi = fetchApi;
      this.paginatedSelect.pageSize = pageSize;

      // 创建防抖搜索函数
      this.handlePaginatedSelectSearch = debounce(
        this._handlePaginatedSelectSearchInner,
        debounceMs
      );
    },

    /**
     * 合并选中项和分页数据
     */
    _mergePaginatedSelectOptions(pageItems) {
      const map = new Map();
      const { selectedItem } = this.paginatedSelect;

      // 先放选中项
      if (selectedItem && selectedItem.value) {
        map.set(selectedItem.value, selectedItem);
      }

      // 再放分页数据
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
    async fetchPaginatedSelectData() {
      if (!this._paginatedSelectFetchApi) {
        console.warn('请先调用 initPaginatedSelect 初始化');
        return;
      }

      this.paginatedSelect.loading = true;

      try {
        const { pageNo, pageSize, keyword } = this.paginatedSelect;
        const res = await this._paginatedSelectFetchApi({
          pageNo,
          pageSize,
          keyword: keyword || undefined,
        });

        const pageItems = res.data || [];
        this.paginatedSelect.options = this._mergePaginatedSelectOptions(pageItems);
        this.paginatedSelect.total = res.total || 0;
        this.paginatedSelect.hasLoaded = true;
      } catch (error) {
        console.error('获取分页数据失败:', error);
      } finally {
        this.paginatedSelect.loading = false;
      }
    },

    /**
     * 远程搜索（内部）
     */
    _handlePaginatedSelectSearchInner(keyword) {
      this.paginatedSelect.keyword = keyword || '';
      this.paginatedSelect.pageNo = 1;
      this.fetchPaginatedSelectData();
    },

    /**
     * 分页变化
     */
    handlePaginatedSelectPageChange(page) {
      this.paginatedSelect.pageNo = page;
      this.fetchPaginatedSelectData();
    },

    /**
     * 每页条数变化
     */
    handlePaginatedSelectSizeChange(size) {
      this.paginatedSelect.pageSize = size;
      this.paginatedSelect.pageNo = 1;
      this.fetchPaginatedSelectData();
    },

    /**
     * 下拉展开事件
     */
    handlePaginatedSelectVisibleChange(visible) {
      if (visible && !this.paginatedSelect.hasLoaded) {
        this.fetchPaginatedSelectData();
      }
    },

    /**
     * 设置选中项（编辑回显）
     */
    setPaginatedSelectSelectedItem(item) {
      this.paginatedSelect.selectedItem = item;

      if (item) {
        if (this.paginatedSelect.options.length === 0) {
          this.paginatedSelect.options = [item];
        } else {
          this.paginatedSelect.options = this._mergePaginatedSelectOptions(
            this.paginatedSelect.options
          );
        }
      }
    },

    /**
     * 重置分页下拉状态
     */
    resetPaginatedSelect() {
      this.paginatedSelect = {
        options: [],
        loading: false,
        pageNo: 1,
        pageSize: 10,
        total: 0,
        keyword: '',
        hasLoaded: false,
        selectedItem: null,
      };
    },
  },
};
