import React, { useEffect } from 'react';
import { ModalForm, ProFormText, ProFormSelect, ProForm } from '@ant-design/pro-components';
import { message } from 'antd';
import { createItem, updateItem, getDetail } from '@/services/api';

interface EditModalProps {
  visible: boolean;
  editId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ visible, editId, onCancel, onSuccess }) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible && editId) {
      // 编辑模式：获取详情
      getDetail(editId).then((data) => {
        form.setFieldsValue(data);
      });
    } else if (visible) {
      // 新增模式：重置表单
      form.resetFields();
    }
  }, [visible, editId]);

  const handleSubmit = async (values: any) => {
    try {
      if (editId) {
        await updateItem(editId, values);
        message.success('编辑成功');
      } else {
        await createItem(values);
        message.success('新增成功');
      }
      onSuccess();
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <ModalForm
      title={editId ? '编辑' : '新增'}
      open={visible}
      form={form}
      modalProps={{
        onCancel,
        destroyOnClose: true,
      }}
      onFinish={handleSubmit}
    >
      <ProFormText
        name="name"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      />
      <ProFormSelect
        name="type"
        label="类型"
        options={[
          { label: '类型1', value: 1 },
          { label: '类型2', value: 2 },
        ]}
        rules={[{ required: true, message: '请选择类型' }]}
      />
    </ModalForm>
  );
};

export default EditModal;
