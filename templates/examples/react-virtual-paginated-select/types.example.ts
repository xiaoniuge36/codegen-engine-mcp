/**
 * 大数据渲染组件类型定义
 */

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

/** 虚拟表格列配置 */
export interface VirtualTableColumn<T = VirtualTableRow> {
  key: string;
  dataKey: string;
  title: string;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  cellRenderer?: (params: {
    rowData: T;
    rowIndex: number;
    column: VirtualTableColumn<T>;
  }) => React.ReactNode;
}

/** 分页下拉组件 Props */
export interface PaginatedSelectProps {
  value?: string;
  onChange?: (value: string, option?: SelectOption) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** 获取分页数据的接口 */
  fetchApi: (params: PaginationParams) => Promise<PaginationResponse<SelectOption>>;
  /** 搜索防抖时间，默认 500ms */
  debounceMs?: number;
  /** 每页条数，默认 10 */
  pageSize?: number;
  /** 编辑回显：初始选中项 */
  initialSelectedItem?: SelectOption | null;
}

/** 虚拟表格组件 Props */
export interface VirtualTableProps<T extends VirtualTableRow = VirtualTableRow> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight?: number;
  height?: number;
  width?: number | string;
  headerHeight?: number;
  loading?: boolean;
  rowKey?: string | ((row: T) => string);
  onRowClick?: (row: T, index: number) => void;
}
