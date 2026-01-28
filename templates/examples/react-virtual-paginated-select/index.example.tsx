import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Input, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import VirtualTable from './components/VirtualTable.example';
import PaginatedSelect from './components/PaginatedSelect.example';
import { usePaginatedSelect } from './hooks/usePaginatedSelect.example';
import type { VirtualTableColumn, VirtualTableRow, SelectOption } from './types.example';
import './index.less';

// 模拟 API
const mockFetchAttributeValues = async (): Promise<VirtualTableRow[]> => {
  // 模拟 8000+ 条数据
  return Array.from({ length: 8000 }, (_, i) => ({
    rowKey: `attr-${i + 1}`,
    valueName: `属性值 ${i + 1}`,
    valueCode: `CODE_${i + 1}`,
    status: i % 3 === 0 ? 0 : 1,
    isEditing: false,
  }));
};

const mockFetchParentCategories = async (params: {
  pageNo: number;
  pageSize: number;
  keyword?: string;
}): Promise<{ data: SelectOption[]; total: number }> => {
  // 模拟分页数据
  const allData = Array.from({ length: 100 }, (_, i) => ({
    value: `cat-${i + 1}`,
    label: `分类 ${i + 1}`,
  }));

  const filtered = params.keyword
    ? allData.filter((item) => item.label.includes(params.keyword!))
    : allData;

  const start = (params.pageNo - 1) * params.pageSize;
  const end = start + params.pageSize;

  return {
    data: filtered.slice(start, end),
    total: filtered.length,
  };
};

/**
 * 大数据渲染页面示例
 * 
 * 包含：
 * 1. 虚拟列表表格（8000+ 行数据）
 * 2. 分页下拉选择（远程搜索 + 编辑回显）
 */
const BigDataRenderPage: React.FC = () => {
  // 虚拟表格数据
  const [tableData, setTableData] = useState<VirtualTableRow[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // 分页下拉选中值
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  
  // 编辑回显：模拟从详情接口获取的选中项
  const [initialSelectedItem] = useState<SelectOption | null>({
    value: 'cat-50',
    label: '分类 50', // 不在第一页，但需要回显
  });

  // 加载虚拟表格数据
  useEffect(() => {
    const loadData = async () => {
      setTableLoading(true);
      try {
        const data = await mockFetchAttributeValues();
        setTableData(data);
        message.success(`已加载 ${data.length} 条数据`);
      } catch (error) {
        message.error('加载失败');
      } finally {
        setTableLoading(false);
      }
    };
    loadData();
  }, []);

  // 编辑行
  const handleEdit = useCallback((rowIndex: number) => {
    setTableData((prev) =>
      prev.map((row, idx) =>
        idx === rowIndex ? { ...row, isEditing: true } : row
      )
    );
  }, []);

  // 保存行
  const handleSave = useCallback((rowIndex: number) => {
    setTableData((prev) =>
      prev.map((row, idx) =>
        idx === rowIndex ? { ...row, isEditing: false } : row
      )
    );
    message.success('保存成功');
  }, []);

  // 取消编辑
  const handleCancel = useCallback((rowIndex: number) => {
    setTableData((prev) =>
      prev.map((row, idx) =>
        idx === rowIndex ? { ...row, isEditing: false } : row
      )
    );
  }, []);

  // 虚拟表格列配置
  const columns: VirtualTableColumn<VirtualTableRow>[] = useMemo(
    () => [
      {
        key: 'index',
        dataKey: 'rowKey',
        title: '序号',
        width: 80,
        align: 'center',
        cellRenderer: ({ rowIndex }) => <span>{rowIndex + 1}</span>,
      },
      {
        key: 'valueName',
        dataKey: 'valueName',
        title: '属性值名称',
        minWidth: 200,
        cellRenderer: ({ rowData, rowIndex }) => {
          if (rowData.isEditing) {
            return (
              <Input
                size="small"
                value={rowData.valueName}
                maxLength={20}
                placeholder="请输入"
                onChange={(e) => {
                  setTableData((prev) =>
                    prev.map((row, idx) =>
                      idx === rowIndex
                        ? { ...row, valueName: e.target.value }
                        : row
                    )
                  );
                }}
              />
            );
          }
          return <span>{rowData.valueName || '--'}</span>;
        },
      },
      {
        key: 'valueCode',
        dataKey: 'valueCode',
        title: '属性值编码',
        width: 150,
      },
      {
        key: 'status',
        dataKey: 'status',
        title: '状态',
        width: 100,
        align: 'center',
        cellRenderer: ({ rowData }) => (
          <span style={{ color: rowData.status === 1 ? '#52c41a' : '#999' }}>
            {rowData.status === 1 ? '启用' : '停用'}
          </span>
        ),
      },
      {
        key: 'actions',
        dataKey: 'actions',
        title: '操作',
        width: 200,
        align: 'center',
        fixed: 'right',
        cellRenderer: ({ rowData, rowIndex }) => {
          if (rowData.isEditing) {
            return (
              <Space>
                <Button type="link" size="small" onClick={() => handleSave(rowIndex)}>
                  保存
                </Button>
                <Button type="link" size="small" onClick={() => handleCancel(rowIndex)}>
                  取消
                </Button>
              </Space>
            );
          }
          return (
            <Space>
              <Button type="link" size="small" onClick={() => handleEdit(rowIndex)}>
                编辑
              </Button>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Space>
          );
        },
      },
    ],
    [handleEdit, handleSave, handleCancel]
  );

  return (
    <div className="big-data-render-page">
      <Card title="上级分类选择（分页下拉 + 编辑回显）" style={{ marginBottom: 16 }}>
        <div style={{ maxWidth: 400 }}>
          <PaginatedSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            fetchApi={mockFetchParentCategories}
            placeholder="请选择上级分类"
            initialSelectedItem={initialSelectedItem}
          />
          <p style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            当前选中: {selectedCategory || '未选择'} 
            <br />
            说明: 初始选中「分类 50」不在第一页，但仍能正确回显
          </p>
        </div>
      </Card>

      <Card
        title={`属性值列表（虚拟滚动，共 ${tableData.length} 条）`}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新增
          </Button>
        }
      >
        <VirtualTable
          data={tableData}
          columns={columns}
          rowHeight={60}
          height={500}
          loading={tableLoading}
        />
      </Card>
    </div>
  );
};

export default BigDataRenderPage;
