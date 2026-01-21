export interface DataItem {
  id: string;
  name: string;
  type: number;
  createTime: string;
  updateTime: string;
}

export interface SearchParams {
  name?: string;
  type?: number;
  pageNum: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  success: boolean;
  message?: string;
}
