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

    <!-- 表格（使用项目封装的 getwayTable 或 el-table） -->
    <getway-table
      v-loading="loading"
      :data="tableData"
      :columns="columns"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
    >
      <!-- 操作列插槽 -->
      <template v-slot:actions="{ row }">
        <el-button type="text" @click="handleEdit(row)">编辑</el-button>
        <el-button type="text" @click="handleDelete(row.id)">删除</el-button>
      </template>
    </getway-table>

    <!-- 编辑弹窗 -->
    <edit-dialog
      :visible.sync="dialogVisible"
      :edit-data="editData"
      @success="fetchData"
    />
  </div>
</template>

<script>
import { getList, deleteItem } from '@/api';
import EditDialog from './components/EditDialog.vue';

export default {
  name: 'ListPage',
  components: {
    EditDialog,
  },
  data() {
    return {
      loading: false,
      tableData: [],
      selectedRows: [],
      dialogVisible: false,
      editData: null,
      searchForm: {
        name: '',
        type: undefined,
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      columns: [
        { type: 'selection', width: 50 },
        { type: 'index', label: '序号', width: 60 },
        { prop: 'name', label: '姓名' },
        { prop: 'type', label: '类型', formatter: this.formatType },
        { prop: 'createTime', label: '创建时间' },
        { slot: 'actions', label: '操作', width: 150 },
      ],
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await getList({
          ...this.searchForm,
          pageNum: this.pagination.current,
          pageSize: this.pagination.pageSize,
        });
        this.tableData = res.data;
        this.pagination.total = res.total;
      } catch (error) {
        this.$message.error('获取数据失败');
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.pagination.current = 1;
      this.fetchData();
    },
    handleReset() {
      this.searchForm = {
        name: '',
        type: undefined,
      };
      this.handleSearch();
    },
    handleAdd() {
      this.editData = null;
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.editData = { ...row };
      this.dialogVisible = true;
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确认删除该数据？', '提示', {
          type: 'warning',
        });
        await deleteItem(id);
        this.$message.success('删除成功');
        this.fetchData();
      } catch (error) {
        // 用户取消
      }
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows;
    },
    handlePageChange(page) {
      this.pagination.current = page;
      this.fetchData();
    },
    handleBatchDelete() {
      this.$confirm(`确认删除选中的 ${this.selectedRows.length} 条数据？`, '提示', {
        type: 'warning',
      }).then(async () => {
        // 批量删除逻辑
        this.$message.success('删除成功');
        this.fetchData();
      }).catch(() => {});
    },
    formatType(row) {
      const typeMap = {
        1: '类型1',
        2: '类型2',
      };
      return typeMap[row.type] || '-';
    },
  },
};
</script>

<style scoped lang="less">
.list-page {
  padding: 20px;

  .toolbar {
    margin-bottom: 16px;
  }
}
</style>
