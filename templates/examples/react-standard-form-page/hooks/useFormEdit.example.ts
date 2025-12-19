import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getDetail, createItem, updateItem } from '@/services/api';

export const useFormEdit = (id?: string) => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getDetail(id);
        setData(res.data);
      } catch (error) {
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const saveData = async (values: any) => {
    setLoading(true);
    try {
      if (id) {
        await updateItem(id, values);
      } else {
        await createItem(values);
      }
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, saveData };
};
