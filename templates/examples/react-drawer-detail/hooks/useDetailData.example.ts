import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getDetail } from '@/services/api';

export const useDetailData = (id?: string, visible?: boolean) => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !visible) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getDetail(id);
        setData(res.data);
      } catch (error) {
        message.error('获取详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, visible]);

  return { data, loading };
};
