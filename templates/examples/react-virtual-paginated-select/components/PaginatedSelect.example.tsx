import React, { useEffect } from 'react';
import { Select, Pagination, Spin, Empty } from 'antd';
import type { SelectProps } from 'antd';
import { usePaginatedSelect } from '../hooks/usePaginatedSelect.example';
import type { SelectOption, PaginationParams, PaginationResponse } from '../types.example';
import './PaginatedSelect.less';

export interface PaginatedSelectProps extends Omit<SelectProps, 'options' | 'onSearch'> {
  /** 获取分页数据的接口 */
  fetchApi: (params: PaginationParams) => Promise<PaginationResponse<SelectOption>>;
  /** 搜索防抖时间，默认 500ms */
  debounceMs?: number;
  /** 每页条数，默认 10 */
  defaultPageSize?: number;
  /** 编辑回显：初始选中项 */
  initialSelectedItem?: SelectOption | null;
  /** 显示分页器 */
  showPagination?: boolean;
}

/**
 * 分页下拉选择组件
 * 
 * 特性：
 * 1. 远程搜索 + 分页
 * 2. 编辑场景回显（选中项始终可见）
 * 3. 防抖搜索
 * 4. 首次展开懒加载
 */
const PaginatedSelect: React.FC<PaginatedSelectProps> = ({
  fetchApi,
  debounceMs = 500,
  defaultPageSize = 10,
  initialSelectedItem,
  showPagination = true,
  value,
  onChange,
  placeholder = '请选择',
  disabled,
  allowClear = true,
  style,
  className,
  ...restProps
}) => {
  const {
    options,
    loading,
    pageNo,
    pageSize,
    total,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleDropdownVisibleChange,
    setSelectedItem,
  } = usePaginatedSelect({
    fetchApi,
    debounceMs,
    defaultPageSize,
  });

  // 编辑回显：设置初始选中项
  useEffect(() => {
    if (initialSelectedItem) {
      setSelectedItem(initialSelectedItem);
    }
  }, [initialSelectedItem, setSelectedItem]);

  // 自定义下拉面板渲染（带分页器）
  const dropdownRender = (menu: React.ReactNode) => (
    <div className="paginated-select-dropdown">
      {menu}
      {showPagination && total > pageSize && (
        <div className="paginated-select-pagination">
          <Pagination
            size="small"
            current={pageNo}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            showQuickJumper={false}
            onChange={handlePageChange}
            onShowSizeChange={(_, size) => handlePageSizeChange(size)}
          />
        </div>
      )}
    </div>
  );

  // 自定义空状态
  const notFoundContent = loading ? (
    <div className="paginated-select-loading">
      <Spin size="small" />
      <span>加载中...</span>
    </div>
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
  );

  return (
    <Select
      value={value}
      onChange={(val, opt) => {
        const option = Array.isArray(opt) ? opt[0] : opt;
        onChange?.(val, option as SelectOption);
      }}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      style={{ width: '100%', ...style }}
      className={`paginated-select ${className || ''}`}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      dropdownRender={dropdownRender}
      notFoundContent={notFoundContent}
      loading={loading}
      options={options.map((item) => ({
        value: item.value,
        label: item.label,
        disabled: item.disabled,
      }))}
      {...restProps}
    />
  );
};

export default PaginatedSelect;
