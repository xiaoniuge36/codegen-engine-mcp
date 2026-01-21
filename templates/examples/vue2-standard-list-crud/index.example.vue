<template>
  <div class="list-page">
    <!--
      getwayTable 封装组件使用示例
      - 搜索表单通过 slot="getwayform" 传入
      - 表格列通过 :column 配置
      - 接口通过 :apiConfig 配置，组件内部自动请求
      - 操作列通过 slot="operation" 自定义
    -->
    <getway-table
      ref="getwayTable"
      :model.sync="searchForm"
      :init-state="initSearchForm"
      :column="columns"
      :api-config="apiConfig"
      :operation="operationConfig"
      :form-props="{ inline: true }"
      :is-serial="true"
      type="selection"
      row-key="id"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template slot="getwayform">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="类型1" :value="1" />
            <el-option label="类型2" :value="2" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义按钮插槽（表格上方） -->
      <template slot="custombtn">
        <el-button type="primary" size="small" @click="handleAdd">新增</el-button>
        <el-button 
          size="small" 
          :disabled="!selectedRows.length" 
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </template>

      <!-- 自定义列：状态列（通过 prop 名作为插槽名） -->
      <template slot="status" slot-scope="row">
        <el-tag :type="row.status === 1 ? 'success' : 'info'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>

      <!-- 操作列插槽 -->
      <template slot="operation" slot-scope="row">
        <el-button type="text" size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button type="text" size="small" @click="handleDelete(row.id)">删除</el-button>
      </template>
    </getway-table>

    <!-- 编辑弹窗 -->
    <edit-dialog
      :visible.sync="dialogVisible"
      :edit-data="editData"
      @success="refreshTable"
    />
  </div>
</template>

<script>
import { deleteItem } from '@/api';
import EditDialog from './components/EditDialog.vue';

export default {
  name: 'EmployeeList',
  components: {
    EditDialog,
  },
  data() {
    const initSearchForm = {
      name: '',
      type: undefined,
    };
    return {
      selectedRows: [],
      dialogVisible: false,
      editData: null,
      initSearchForm,
      searchForm: { ...initSearchForm },
      apiConfig: {
        url: '/employee/list',
        method: 'post',
      },
      columns: [
        { prop: 'name', label: '姓名', width: 120 },
        { prop: 'phone', label: '手机号', width: 140 },
        { 
          prop: 'type', 
          label: '类型',
          width: 100,
          render: (scope) => {
            const typeMap = { 1: '全职', 2: '兼职' };
            return typeMap[scope.row.type] || '-';
          },
        },
        { prop: 'status', label: '状态', width: 100 },
        { prop: 'createTime', label: '创建时间', width: 180 },
      ],
      operationConfig: {
        label: '操作',
        width: 150,
        fixed: 'right',
      },
    };
  },
  methods: {
    refreshTable() {
      this.$refs.getwayTable.getDataSource();
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
        await this.$confirm('确认删除该数据？', '提示', { type: 'warning' });
        await deleteItem(id);
        this.$message.success('删除成功');
        this.refreshTable();
      } catch (error) {
        // 用户取消或删除失败
      }
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows;
    },
    async handleBatchDelete() {
      try {
        await this.$confirm(`确认删除选中的 ${this.selectedRows.length} 条数据？`, '提示', {
          type: 'warning',
        });
        // 批量删除逻辑
        this.$message.success('删除成功');
        this.refreshTable();
      } catch (error) {
        // 用户取消
      }
    },
  },
};
</script>

<style scoped lang="less">
.list-page {
  padding: 20px;
}
</style>
