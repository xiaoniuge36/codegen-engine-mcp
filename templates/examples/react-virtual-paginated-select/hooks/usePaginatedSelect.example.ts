import { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash-es';

export interface SelectOption {
  value: string;
  label: string;
  [key: string]: any;
}

export interface PaginatedSelectState {
  options: SelectOption[];
  loading: boolean;
  pageNo: number;
  pageSize: number;
  total: number;
  keyword: string;
  hasLoaded: boolean;
}

export interface UsePaginatedSelectOptions {
  /** 获取分页数据的接口 */
  fetchApi: (params: {
    pageNo: number;
    pageSize: number;
    keyword?: string;
  }) => Promise<{ data: SelectOption[]; total: number }>;
  /** 搜索防抖时间，默认 500ms */
  debounceMs?: number;
  /** 每页条数，默认 10 */
  defaultPageSize?: number;
}

/**
 * 分页下拉选择 Hook
 * 
 * 核心功能：
 * 1. 远程搜索 + 分页
 * 2. 编辑场景回显（选中项始终可见）
 * 3. 防抖搜索
 * 4. 首次展开懒加载
 */
export const usePaginatedSelect = (options: UsePaginatedSelectOptions) => {
  const { fetchApi, debounceMs = 500, defaultPageSize = 10 } = options;

  const [state, setState] = useState<PaginatedSelectState>({
    options: [],
    loading: false,
    pageNo: 1,
    pageSize: defaultPageSize,
    total: 0,
    keyword: '',
    hasLoaded: false,
  });

  // 当前选中项（编辑回显用）
  const selectedItemRef = useRef<SelectOption | null>(null);

  /**
   * 合并选中项和分页数据
   * 确保编辑场景下选中项始终可见
   */
  const mergeOptions = useCallback(
    (pageItems: SelectOption[]): SelectOption[] => {
      const map = new Map<string, SelectOption>();

      // 先放选中项（优先级最高）
      const selectedItem = selectedItemRef.current;
      if (selectedItem?.value) {
        map.set(selectedItem.value, selectedItem);
      }

      // 再放分页数据（去重）
      pageItems.forEach((item) => {
        if (item?.value && !map.has(item.value)) {
          map.set(item.value, item);
        }
      });

      return Array.from(map.values());
    },
    []
  );

  /**
   * 获取分页数据
   */
  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetchApi({
        pageNo: state.pageNo,
        pageSize: state.pageSize,
        keyword: state.keyword || undefined,
      });

      const pageItems = res.data || [];
      const mergedOptions = mergeOptions(pageItems);

      setState((prev) => ({
        ...prev,
        options: mergedOptions,
        total: res.total || 0,
        hasLoaded: true,
        loading: false,
      }));
    } catch (error) {
      console.error('获取分页数据失败:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [fetchApi, state.pageNo, state.pageSize, state.keyword, mergeOptions]);

  /**
   * 远程搜索（带防抖）
   */
  const handleSearch = useCallback(
    debounce((keyword: string) => {
      setState((prev) => ({
        ...prev,
        keyword,
        pageNo: 1, // 搜索时重置页码
      }));
      // 触发数据获取
      fetchData();
    }, debounceMs),
    [fetchData, debounceMs]
  );

  /**
   * 分页变化
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setState((prev) => ({ ...prev, pageNo: page }));
      fetchData();
    },
    [fetchData]
  );

  /**
   * 每页条数变化
   */
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setState((prev) => ({ ...prev, pageSize: size, pageNo: 1 }));
      fetchData();
    },
    [fetchData]
  );

  /**
   * 下拉展开事件
   * 首次展开时自动加载第一页
   */
  const handleDropdownVisibleChange = useCallback(
    (open: boolean) => {
      if (open && !state.hasLoaded) {
        fetchData();
      }
    },
    [state.hasLoaded, fetchData]
  );

  /**
   * 设置选中项（编辑回显）
   * 在获取详情后调用，确保选中项始终可见
   */
  const setSelectedItem = useCallback(
    (item: SelectOption | null) => {
      selectedItemRef.current = item;

      // 如果当前已有数据，立即合并
      if (item && state.options.length > 0) {
        setState((prev) => ({
          ...prev,
          options: mergeOptions(prev.options),
        }));
      } else if (item) {
        // 如果还没加载数据，先把选中项放入 options
        setState((prev) => ({
          ...prev,
          options: [item],
        }));
      }
    },
    [state.options, mergeOptions]
  );

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    selectedItemRef.current = null;
    setState({
      options: [],
      loading: false,
      pageNo: 1,
      pageSize: defaultPageSize,
      total: 0,
      keyword: '',
      hasLoaded: false,
    });
  }, [defaultPageSize]);

  return {
    ...state,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleDropdownVisibleChange,
    setSelectedItem,
    reset,
    fetchData,
  };
};
