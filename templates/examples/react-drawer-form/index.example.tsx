import React, { useEffect } from 'react';
import { DrawerForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import { message } from 'antd';
import { createItem, updateItem, getDetail } from '@/services/api';

interface DrawerFormProps {
  visible: boolean;
  editId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditDrawerForm: React.FC<DrawerFormProps> = ({ visible, editId, onClose, onSuccess }) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible && editId) {
      // 编辑模式：获取详情
      getDetail(editId).then((res) => {
        form.setFieldsValue(res.data);
      });
    } else if (visible) {
      // 新增模式：重置表单
      form.resetFields();
    }
  }, [visible, editId, form]);

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
    <DrawerForm
      title={editId ? '编辑' : '新增'}
      open={visible}
      form={form}
      drawerProps={{
        onClose,
        destroyOnClose: true,
        maskClosable: false,
        width: 600,
      }}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      onFinish={handleSubmit}
      submitter={{
        searchConfig: {
          submitText: '确定',
          resetText: '取消',
        },
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="请输入名称"
        rules={[{ required: true, message: '请输入名称' }]}
      />
      
      <ProFormSelect
        name="type"
        label="类型"
        placeholder="请选择类型"
        options={[
          { label: '类型1', value: 1 },
          { label: '类型2', value: 2 },
        ]}
        rules={[{ required: true, message: '请选择类型' }]}
      />

      <ProFormDatePicker
        name="startDate"
        label="开始日期"
        placeholder="请选择日期"
      />

      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入描述"
        fieldProps={{
          rows: 4,
        }}
      />
    </DrawerForm>
  );
};

export default EditDrawerForm;
