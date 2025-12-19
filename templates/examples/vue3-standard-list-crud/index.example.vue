<template>
  <div class="list-page">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
          <el-option label="类型1" :value="1" />
          <el-option label="类型2" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button :disabled="!selectedRows.length" @click="handleBatchDelete">
        批量删除
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag>{{ typeMap[row.type] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, prev, pager, next, sizes"
      @current-change="fetchData"
      @size-change="fetchData"
    />

    <!-- 编辑弹窗 -->
    <EditDialog
      v-model="dialogVisible"
      :edit-data="editData"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getList, deleteItem } from '@/api';
import EditDialog from './components/EditDialog.vue';

const loading = ref(false);
const tableData = ref<DataItem[]>([]);
const selectedRows = ref<DataItem[]>([]);
const dialogVisible = ref(false);
const editData = ref<DataItem>();

const searchForm = reactive<SearchForm>({
  name: '',
  type: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const typeMap: Record<number, string> = {
  1: '类型1',
  2: '类型2',
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getList({
      ...searchForm,
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

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  Object.assign(searchForm, { name: '', type: undefined });
  handleSearch();
};

const handleAdd = () => {
  editData.value = undefined;
  dialogVisible.value = true;
};

const handleEdit = (row: DataItem) => {
  editData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该数据？', '提示', {
      type: 'warning',
    });
    await deleteItem(id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (error) {
    // 用户取消
  }
};

const handleSelectionChange = (rows: DataItem[]) => {
  selectedRows.value = rows;
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条数据？`, '提示', {
      type: 'warning',
    });
    // 批量删除逻辑
    ElMessage.success('删除成功');
    fetchData();
  } catch (error) {
    // 用户取消
  }
};

const handleSuccess = () => {
  dialogVisible.value = false;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.list-page {
  padding: 20px;

  .toolbar {
    margin-bottom: 16px;
  }
}
</style>
