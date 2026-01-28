import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Spin, Empty } from 'antd';
import type { VirtualTableProps, VirtualTableRow, VirtualTableColumn } from '../types.example';
import './VirtualTable.less';

/**
 * 虚拟滚动表格组件
 * 
 * 特性：
 * 1. 大数据量高性能渲染（8000+ 行）
 * 2. 固定行高虚拟滚动
 * 3. 支持单元格内编辑
 * 4. 支持固定列（左/右）
 */
const VirtualTable = <T extends VirtualTableRow = VirtualTableRow>({
  data,
  columns,
  rowHeight = 60,
  height = 500,
  width = '100%',
  headerHeight = 48,
  loading = false,
  rowKey = 'rowKey',
  onRowClick,
}: VirtualTableProps<T>) => {
  // 获取行 key
  const getRowKey = useCallback(
    (row: T, index: number): string => {
      if (typeof rowKey === 'function') {
        return rowKey(row);
      }
      return row[rowKey] || String(index);
    },
    [rowKey]
  );

  // 计算列宽
  const columnWidths = useMemo(() => {
    const containerWidth = typeof width === 'number' ? width : 1000;
    const fixedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
    const flexColumns = columns.filter((col) => !col.width);
    const flexWidth = (containerWidth - fixedWidth) / (flexColumns.length || 1);

    return columns.map((col) => col.width || Math.max(col.minWidth || 100, flexWidth));
  }, [columns, width]);

  // 渲染表头
  const renderHeader = () => (
    <div className="virtual-table-header" style={{ height: headerHeight }}>
      {columns.map((col, index) => (
        <div
          key={col.key}
          className={`virtual-table-header-cell ${col.fixed ? `fixed-${col.fixed}` : ''}`}
          style={{
            width: columnWidths[index],
            minWidth: col.minWidth,
            textAlign: col.align || 'left',
          }}
        >
          {col.title}
        </div>
      ))}
    </div>
  );

  // 渲染行
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const row = data[index];
      const key = getRowKey(row, index);

      return (
        <div
          key={key}
          className={`virtual-table-row ${index % 2 === 0 ? 'even' : 'odd'}`}
          style={style}
          onClick={() => onRowClick?.(row, index)}
        >
          {columns.map((col, colIndex) => {
            const cellContent = col.cellRenderer
              ? col.cellRenderer({ rowData: row, rowIndex: index, column: col })
              : row[col.dataKey] ?? '--';

            return (
              <div
                key={col.key}
                className={`virtual-table-cell ${col.fixed ? `fixed-${col.fixed}` : ''}`}
                style={{
                  width: columnWidths[colIndex],
                  minWidth: col.minWidth,
                  textAlign: col.align || 'left',
                }}
              >
                {cellContent}
              </div>
            );
          })}
        </div>
      );
    },
    [data, columns, columnWidths, getRowKey, onRowClick]
  );

  // 空状态
  if (!loading && data.length === 0) {
    return (
      <div className="virtual-table-empty" style={{ height }}>
        <Empty description="暂无数据" />
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div className="virtual-table" style={{ width }}>
        {renderHeader()}
        <List
          height={height - headerHeight}
          itemCount={data.length}
          itemSize={rowHeight}
          width="100%"
          className="virtual-table-body"
        >
          {Row}
        </List>
      </div>
    </Spin>
  );
};

export default VirtualTable;
