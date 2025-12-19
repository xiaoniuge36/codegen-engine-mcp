import React from 'react';
import { Drawer, Descriptions, Spin, Space, Button, Tag } from 'antd';
import { useDetailData } from './hooks/useDetailData';
import './index.less';

interface DetailDrawerProps {
  visible: boolean;
  id?: string;
  onClose: () => void;
  onEdit?: (id: string) => void;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ visible, id, onClose, onEdit }) => {
  const { data, loading } = useDetailData(id, visible);

  const handleEdit = () => {
    if (id && onEdit) {
      onEdit(id);
    }
  };

  return (
    <Drawer
      title="详情"
      open={visible}
      onClose={onClose}
      width={600}
      extra={
        <Space>
          {onEdit && (
            <Button type="primary" onClick={handleEdit}>
              编辑
            </Button>
          )}
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="名称">{data?.name || '-'}</Descriptions.Item>
          
          <Descriptions.Item label="类型">
            {data?.type ? (
              <Tag color={data.type === 1 ? 'blue' : 'green'}>
                {data.type === 1 ? '类型1' : '类型2'}
              </Tag>
            ) : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="开始日期">{data?.startDate || '-'}</Descriptions.Item>
          
          <Descriptions.Item label="状态">
            {data?.status ? (
              <Tag color={data.status === 1 ? 'success' : 'default'}>
                {data.status === 1 ? '启用' : '禁用'}
              </Tag>
            ) : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="描述">{data?.description || '-'}</Descriptions.Item>
          
          <Descriptions.Item label="创建时间">{data?.createTime || '-'}</Descriptions.Item>
          
          <Descriptions.Item label="更新时间">{data?.updateTime || '-'}</Descriptions.Item>
        </Descriptions>
      </Spin>
    </Drawer>
  );
};

export default DetailDrawer;
