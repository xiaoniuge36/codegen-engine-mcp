import React, { useEffect, useMemo } from 'react';
import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProForm,
  ProFormDependency,
} from '@ant-design/pro-components';
import { message, Alert, Space, Tag } from 'antd';
import { batchUpdateItems, getFieldSchema } from '@/services/api';

/**
 * 字段配置项类型
 */
interface FieldSchema {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  required?: boolean;
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  rules?: any[];
}

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
 * - 根据 bizType 动态获取字段配置
 * - 支持批量更新多条记录
 * - 表单字段由 schema 驱动
 */
const BatchSchemaForm: React.FC<BatchSchemaFormProps> = ({
  visible,
  selectedIds,
  selectedRows,
  bizType,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();
  const [fieldSchema, setFieldSchema] = React.useState<FieldSchema[]>([]);
  const [loading, setLoading] = React.useState(false);

  // 获取字段配置
  useEffect(() => {
    if (visible && bizType) {
      setLoading(true);
      getFieldSchema(bizType)
        .then((res) => {
          setFieldSchema(res.data || []);
        })
        .finally(() => setLoading(false));
    }
  }, [visible, bizType]);

  // 重置表单
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

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

  // 根据 schema 渲染表单项
  const renderFormField = (field: FieldSchema) => {
    const commonProps = {
      name: field.name,
      label: field.label,
      placeholder: field.placeholder || `请输入${field.label}`,
      rules: field.required ? [{ required: true, message: `请输入${field.label}` }] : field.rules,
    };

    switch (field.type) {
      case 'select':
        return (
          <ProFormSelect
            key={field.name}
            {...commonProps}
            options={field.options}
            placeholder={field.placeholder || `请选择${field.label}`}
          />
        );
      case 'date':
        return (
          <ProFormDatePicker
            key={field.name}
            {...commonProps}
            placeholder={field.placeholder || `请选择${field.label}`}
          />
        );
      case 'number':
        return (
          <ProFormDigit
            key={field.name}
            {...commonProps}
            min={0}
          />
        );
      default:
        return <ProFormText key={field.name} {...commonProps} />;
    }
  };

  return (
    <ModalForm
      title={`批量编辑（已选 ${selectedIds.length} 条）`}
      open={visible}
      form={form}
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
    >
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

      {fieldSchema.map(renderFormField)}
    </ModalForm>
  );
};

export default BatchSchemaForm;
