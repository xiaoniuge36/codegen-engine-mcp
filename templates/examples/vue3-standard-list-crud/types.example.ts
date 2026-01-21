export interface DataItem {
  id: string;
  name: string;
  type: number;
  createTime: string;
  updateTime: string;
}

export interface SearchForm {
  name?: string;
  type?: number;
}

export interface SearchParams extends SearchForm {
  pageNum: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  code: number;
  message?: string;
}
