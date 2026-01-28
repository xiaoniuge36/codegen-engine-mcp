/**
 * 大数据渲染组件类型定义 - Vue 3
 */

import type { VNode } from 'vue';

/** 下拉选项 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  [key: string]: any;
}

/** 分页参数 */
export interface PaginationParams {
  pageNo: number;
  pageSize: number;
  keyword?: string;
}

/** 分页响应 */
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page?: {
    pageNo: number;
    pageSize: number;
    total: number;
  };
}

/** 虚拟表格行数据 */
export interface VirtualTableRow {
  rowKey: string;
  isEditing?: boolean;
  [key: string]: any;
}

/** el-table-v2 列配置 */
export interface VirtualTableColumn<T = VirtualTableRow> {
  key: string;
  dataKey: string;
  title: string;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right' | true;
  cellRenderer?: (params: {
    rowData: T;
    rowIndex: number;
    column: VirtualTableColumn<T>;
  }) => VNode | string;
}

/** 分页下拉状态 */
export interface PaginatedSelectState {
  options: SelectOption[];
  loading: boolean;
  pageNo: number;
  pageSize: number;
  total: number;
  keyword: string;
  hasLoaded: boolean;
}

/** 分页下拉 Composable 选项 */
export interface UsePaginatedSelectOptions {
  /** 获取分页数据的接口 */
  fetchApi: (params: PaginationParams) => Promise<PaginationResponse<SelectOption>>;
  /** 搜索防抖时间，默认 500ms */
  debounceMs?: number;
  /** 每页条数，默认 10 */
  defaultPageSize?: number;
}
