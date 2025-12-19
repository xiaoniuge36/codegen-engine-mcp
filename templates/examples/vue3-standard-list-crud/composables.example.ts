import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getList, deleteItem } from '@/api';

export const useTableData = () => {
  const loading = ref(false);
  const tableData = ref<DataItem[]>([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (params?: Partial<SearchParams>) => {
    loading.value = true;
    try {
      const res = await getList({
        ...params,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
      tableData.value = res.data;
      pagination.total = res.total;
    } catch (error) {
      ElMessage.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      ElMessage.success('删除成功');
      await fetchData();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  };

  return {
    loading,
    tableData,
    pagination,
    fetchData,
    handleDelete,
  };
};
