import type { ProFormColumnsType } from '@ant-design/pro-components';
import { BetaSchemaForm } from '@ant-design/pro-components';
import { message, Alert, Space, Tag } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { batchUpdateItems, getFieldSchema } from '@/services/api';

/**
 * 状态枚举配置示例
 */
const statusValueEnum = {
  draft: { text: '草稿', status: 'Default' },
  pending: { text: '待审核', status: 'Processing' },
  approved: { text: '已通过', status: 'Success' },
  rejected: { text: '已拒绝', status: 'Error', disabled: true },
};

/**
 * 表单数据类型
 */
type DataItem = {
  name: string;
  status: string;
  [key: string]: any;
};

interface BatchSchemaFormProps {
  visible: boolean;
  /** 批量操作的记录 ID 列表 */
  selectedIds: string[];
  /** 批量操作的记录数据（可选，用于预览） */
  selectedRows?: any[];
  /** 业务类型，用于获取对应的字段 schema */
  bizType: string;
  onCancel: () => void;
  onSuccess: () => void;
}

/**
 * 批量 Schema 表单组件
 * - 使用 BetaSchemaForm 实现 schema 驱动的表单
 * - 支持多种 valueType：text, select, date, dateTime, digit, money, textarea 等
 * - 支持字段联动（dependency）、分组（group）、表单列表（formList）等高级功能
 */
const BatchSchemaForm: React.FC<BatchSchemaFormProps> = ({
  visible,
  selectedIds,
  selectedRows,
  bizType,
  onCancel,
  onSuccess,
}) => {
  const [columns, setColumns] = React.useState<ProFormColumnsType<DataItem>[]>([]);
  const [loading, setLoading] = React.useState(false);

  // 获取字段配置并转换为 columns
  useEffect(() => {
    if (visible && bizType) {
      setLoading(true);
      getFieldSchema(bizType)
        .then((res) => {
          // 将后端 schema 转换为 BetaSchemaForm 的 columns 格式
          const schemaColumns: ProFormColumnsType<DataItem>[] = (res.data || []).map(
            (field: any) => ({
              title: field.label,
              dataIndex: field.name,
              valueType: field.type || 'text',
              valueEnum: field.options
                ? field.options.reduce(
                    (acc: any, opt: any) => ({
                      ...acc,
                      [opt.value]: { text: opt.label },
                    }),
                    {},
                  )
                : undefined,
              formItemProps: {
                rules: field.required
                  ? [{ required: true, message: `请输入${field.label}` }]
                  : field.rules,
              },
              fieldProps: {
                placeholder: field.placeholder || `请输入${field.label}`,
              },
              width: 'md',
            }),
          );
          setColumns(schemaColumns);
        })
        .finally(() => setLoading(false));
    }
  }, [visible, bizType]);

  // 提交处理
  const handleSubmit = async (values: Record<string, any>) => {
    if (!selectedIds.length) {
      message.warning('请选择要操作的记录');
      return false;
    }

    try {
      await batchUpdateItems({
        ids: selectedIds,
        bizType,
        updateFields: values,
      });
      message.success(`批量更新 ${selectedIds.length} 条记录成功`);
      onSuccess();
      return true;
    } catch (error) {
      message.error('批量更新失败');
      return false;
    }
  };

  // 示例：带分组和字段联动的 columns 配置
  const exampleColumns: ProFormColumnsType<DataItem>[] = useMemo(
    () => [
      {
        title: '基础信息',
        valueType: 'group',
        columns: [
          {
            title: '名称',
            dataIndex: 'name',
            valueType: 'text',
            formItemProps: {
              rules: [{ required: true, message: '请输入名称' }],
            },
            width: 'md',
          },
          {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: statusValueEnum,
            width: 'sm',
          },
        ],
      },
      {
        valueType: 'dependency',
        name: ['status'],
        columns: ({ status }) => {
          if (status === 'rejected') {
            return [
              {
                title: '拒绝原因',
                dataIndex: 'rejectReason',
                valueType: 'textarea',
                formItemProps: {
                  rules: [{ required: true, message: '请输入拒绝原因' }],
                },
                width: 'xl',
              },
            ];
          }
          return [];
        },
      },
      {
        title: '扩展信息',
        valueType: 'group',
        columns: [
          {
            title: '金额',
            dataIndex: 'amount',
            valueType: 'money',
            width: 'sm',
          },
          {
            title: '生效日期',
            dataIndex: 'effectiveDate',
            valueType: 'date',
            width: 'sm',
          },
          {
            title: '数量',
            dataIndex: 'quantity',
            valueType: 'digit',
            fieldProps: {
              min: 0,
              precision: 0,
            },
            width: 'sm',
          },
        ],
      },
    ],
    [],
  );

  // 实际使用时根据 columns 是否为空决定使用动态配置还是示例配置
  const formColumns = columns.length > 0 ? columns : exampleColumns;

  if (!visible) {
    return null;
  }

  return (
    <>
      <Alert
        message={`将对选中的 ${selectedIds.length} 条记录进行批量更新，仅填写需要修改的字段`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {selectedRows && selectedRows.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>已选记录：</span>
          <Space wrap>
            {selectedRows.slice(0, 5).map((row, index) => (
              <Tag key={index}>{row.name || row.id}</Tag>
            ))}
            {selectedRows.length > 5 && <Tag>+{selectedRows.length - 5} 条</Tag>}
          </Space>
        </div>
      )}

      <BetaSchemaForm<DataItem>
        layoutType="ModalForm"
        title={`批量编辑（已选 ${selectedIds.length} 条）`}
        open={visible}
        loading={loading}
        modalProps={{
          onCancel,
          destroyOnClose: true,
          maskClosable: false,
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        onFinish={handleSubmit}
        columns={formColumns}
      />
    </>
  );
};

export default BatchSchemaForm;
