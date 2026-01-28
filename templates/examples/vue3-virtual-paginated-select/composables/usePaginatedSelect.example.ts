import { ref, reactive, computed } from 'vue';
import type { SelectOption, PaginatedSelectState, UsePaginatedSelectOptions } from '../types.example';

/**
 * 防抖函数
 */
const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * 分页下拉选择 Composable
 * 
 * 核心功能：
 * 1. 远程搜索 + 分页
 * 2. 编辑场景回显（选中项始终可见）
 * 3. 防抖搜索
 * 4. 首次展开懒加载
 */
export const usePaginatedSelect = (options: UsePaginatedSelectOptions) => {
  const { fetchApi, debounceMs = 500, defaultPageSize = 10 } = options;

  // 状态
  const state = reactive<PaginatedSelectState>({
    options: [],
    loading: false,
    pageNo: 1,
    pageSize: defaultPageSize,
    total: 0,
    keyword: '',
    hasLoaded: false,
  });

  // 当前选中项（编辑回显用）
  const selectedItem = ref<SelectOption | null>(null);

  /**
   * 合并选中项和分页数据
   * 确保编辑场景下选中项始终可见
   */
  const mergeOptions = (pageItems: SelectOption[]): SelectOption[] => {
    const map = new Map<string, SelectOption>();

    // 先放选中项（优先级最高）
    if (selectedItem.value?.value) {
      map.set(selectedItem.value.value, selectedItem.value);
    }

    // 再放分页数据（去重）
    (pageItems || []).forEach((item) => {
      if (item?.value && !map.has(item.value)) {
        map.set(item.value, item);
      }
    });

    return Array.from(map.values());
  };

  /**
   * 获取分页数据
   */
  const fetchData = async () => {
    state.loading = true;

    try {
      const res = await fetchApi({
        pageNo: state.pageNo,
        pageSize: state.pageSize,
        keyword: state.keyword || undefined,
      });

      const pageItems = res.data || [];
      state.options = mergeOptions(pageItems);
      state.total = res.total || 0;
      state.hasLoaded = true;
    } catch (error) {
      console.error('获取分页数据失败:', error);
    } finally {
      state.loading = false;
    }
  };

  /**
   * 远程搜索内部函数
   */
  const handleSearchInner = (keyword: string) => {
    state.keyword = keyword || '';
    state.pageNo = 1;
    fetchData();
  };

  /**
   * 远程搜索（带防抖）
   */
  const handleSearch = debounce(handleSearchInner, debounceMs);

  /**
   * 分页变化
   */
  const handlePageChange = (page: number) => {
    state.pageNo = page;
    fetchData();
  };

  /**
   * 每页条数变化
   */
  const handlePageSizeChange = (size: number) => {
    state.pageSize = size;
    state.pageNo = 1;
    fetchData();
  };

  /**
   * 下拉展开事件
   * 首次展开时自动加载第一页
   */
  const handleVisibleChange = (visible: boolean) => {
    if (visible && !state.hasLoaded) {
      fetchData();
    }
  };

  /**
   * 设置选中项（编辑回显）
   * 在获取详情后调用，确保选中项始终可见
   */
  const setSelectedItem = (item: SelectOption | null) => {
    selectedItem.value = item;

    if (item) {
      // 如果还没加载数据，先把选中项放入 options
      if (state.options.length === 0) {
        state.options = [item];
      } else {
        // 已有数据，立即合并
        state.options = mergeOptions(state.options);
      }
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    selectedItem.value = null;
    Object.assign(state, {
      options: [],
      loading: false,
      pageNo: 1,
      pageSize: defaultPageSize,
      total: 0,
      keyword: '',
      hasLoaded: false,
    });
  };

  // 是否显示分页器
  const showPagination = computed(() => state.total > state.pageSize);

  return {
    // 状态
    options: computed(() => state.options),
    loading: computed(() => state.loading),
    pageNo: computed(() => state.pageNo),
    pageSize: computed(() => state.pageSize),
    total: computed(() => state.total),
    hasLoaded: computed(() => state.hasLoaded),
    showPagination,

    // 方法
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleVisibleChange,
    setSelectedItem,
    reset,
    fetchData,
  };
};
