import React, { useRef, useState } from 'react';
import { Button, message } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { fetchList, deleteItem } from '@/services/api';
import EditModal from './components/EditModal';

const ListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<string>();

  const columns: ProColumns<DataItem>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 50,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      fieldProps: { placeholder: '请输入姓名' },
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '类型1', status: 'Default' },
        2: { text: '类型2', status: 'Success' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, record) => [
        <a key="edit" onClick={() => handleEdit(record.id)}>编辑</a>,
        <a key="delete" onClick={() => handleDelete(record.id)}>删除</a>,
      ],
    },
  ];

  const handleAdd = () => {
    setEditId(undefined);
    setEditVisible(true);
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setEditVisible(true);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    message.success('删除成功');
    actionRef.current?.reload();
  };

  return (
    <>
      <ProTable<DataItem>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const res = await fetchList(params);
          return {
            data: res.data,
            success: true,
            total: res.total,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
        toolbar={{
          actions: [
            <Button key="add" type="primary" onClick={handleAdd}>
              新增
            </Button>,
          ],
        }}
      />

      <EditModal
        visible={editVisible}
        editId={editId}
        onCancel={() => setEditVisible(false)}
        onSuccess={() => {
          setEditVisible(false);
          actionRef.current?.reload();
        }}
      />
    </>
  );
};

export default ListPage;
