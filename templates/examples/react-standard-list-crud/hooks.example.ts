import { useState } from 'react';
import { message } from 'antd';
import { fetchList, deleteItem } from '@/services/api';

export const useTableData = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataItem[]>([]);
  const [total, setTotal] = useState(0);

  const fetchData = async (params: any) => {
    setLoading(true);
    try {
      const res = await fetchList(params);
      setDataSource(res.data);
      setTotal(res.total);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      message.success('删除成功');
      return true;
    } catch (error) {
      message.error('删除失败');
      return false;
    }
  };

  return {
    loading,
    dataSource,
    total,
    fetchData,
    handleDelete,
  };
};
