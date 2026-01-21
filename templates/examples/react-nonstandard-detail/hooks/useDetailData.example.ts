// ⚠️ 生成前必须检查：先查看项目 types/global.d.ts
// 如果 ProjectItem 在 global.d.ts 中已声明，则不要引入！

import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getProjectDetail } from '@/services/project';

// ⚠️ 仅当 ProjectItem 未在 global.d.ts 中声明时才取消下面的注释
// import type { ProjectItem } from '../../types';

/**
 * 详情数据获取 Hook
 * 
 * @param id - 详情ID（从路由参数获取）
 * @returns { data, loading, refetch }
 * 
 * 使用示例：
 * ```typescript
 * const { id } = useParams();
 * const { data, loading } = useDetailData(id);
 * ```
 */
export const useDetailData = (id?: string) => {
  // ProjectItem 应该在 global.d.ts 中声明，直接使用
  const [data, setData] = useState<ProjectItem>();
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    if (!id) {
      console.warn('useDetailData: id is undefined');
      return;
    }

    setLoading(true);
    try {
      const res = await getProjectDetail(id);
      setData(res.data);
    } catch (error) {
      message.error('获取详情失败');
      console.error('useDetailData fetchDetail error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // 提供 refetch 方法，用于手动刷新数据
  const refetch = () => {
    fetchDetail();
  };

  return {
    data,
    loading,
    refetch,
  };
};
