<template>
  <div class="big-data-render-page">
    <!-- 分页下拉选择示例 -->
    <el-card class="mb-16">
      <template #header>
        <span>上级分类选择（分页下拉 + 编辑回显）</span>
      </template>
      <div class="select-demo">
        <PaginatedSelect
          v-model="selectedCategory"
          :fetch-api="fetchParentCategories"
          placeholder="请选择上级分类"
          :initial-selected-item="initialSelectedItem"
          @change="handleCategoryChange"
        />
        <p class="select-tip">
          当前选中: {{ selectedCategory || '未选择' }}
          <br />
          说明: 初始选中「分类 50」不在第一页，但仍能正确回显
        </p>
      </div>
    </el-card>

    <!-- 虚拟列表表格示例 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>属性值列表（虚拟滚动，共 {{ tableData.length }} 条）</span>
          <el-button type="primary" size="small" icon="el-icon-plus">新增</el-button>
        </div>
      </template>

      <VirtualTable
        :data="tableData"
        :columns="columns"
        :row-height="60"
        :height="500"
        :loading="tableLoading"
        row-key="rowKey"
        @row-click="handleRowClick"
      >
        <!-- 序号列 -->
        <template #cell-index="{ index }">
          {{ index + 1 }}
        </template>

        <!-- 属性值名称列（支持编辑） -->
        <template #cell-valueName="{ row, index }">
          <el-input
            v-if="row.isEditing"
            v-model="row.valueName"
            size="small"
            maxlength="20"
            placeholder="请输入"
          />
          <span v-else>{{ row.valueName || '--' }}</span>
        </template>

        <!-- 状态列 -->
        <template #cell-status="{ row }">
          <span :style="{ color: row.status === 1 ? '#67c23a' : '#909399' }">
            {{ row.status === 1 ? '启用' : '停用' }}
          </span>
        </template>

        <!-- 操作列 -->
        <template #cell-actions="{ row, index }">
          <template v-if="row.isEditing">
            <el-button type="text" size="small" @click="handleSave(index)">
              保存
            </el-button>
            <el-button type="text" size="small" @click="handleCancel(index)">
              取消
            </el-button>
          </template>
          <template v-else>
            <el-button type="text" size="small" @click="handleEdit(index)">
              编辑
            </el-button>
            <el-button type="text" size="small" class="text-danger">
              删除
            </el-button>
          </template>
        </template>
      </VirtualTable>
    </el-card>
  </div>
</template>

<script>
import PaginatedSelect from './components/PaginatedSelect.example.vue';
import VirtualTable from './components/VirtualTable.example.vue';

export default {
  name: 'BigDataRenderPage',
  components: {
    PaginatedSelect,
    VirtualTable,
  },
  data() {
    return {
      // 分页下拉
      selectedCategory: 'cat-50',
      initialSelectedItem: {
        value: 'cat-50',
        label: '分类 50',
      },

      // 虚拟表格
      tableData: [],
      tableLoading: false,
      columns: [
        {
          key: 'index',
          dataKey: 'rowKey',
          title: '序号',
          width: 80,
          align: 'center',
        },
        {
          key: 'valueName',
          dataKey: 'valueName',
          title: '属性值名称',
          minWidth: 200,
        },
        {
          key: 'valueCode',
          dataKey: 'valueCode',
          title: '属性值编码',
          width: 150,
        },
        {
          key: 'status',
          dataKey: 'status',
          title: '状态',
          width: 100,
          align: 'center',
        },
        {
          key: 'actions',
          dataKey: 'actions',
          title: '操作',
          width: 200,
          align: 'center',
          fixed: 'right',
        },
      ],
    };
  },
  mounted() {
    this.loadTableData();
  },
  methods: {
    // ==================== 分页下拉 ====================

    async fetchParentCategories(params) {
      // 模拟请求延迟
      await new Promise((resolve) => setTimeout(resolve, 300));

      const allData = Array.from({ length: 100 }, (_, i) => ({
        value: `cat-${i + 1}`,
        label: `分类 ${i + 1}`,
      }));

      const filtered = params.keyword
        ? allData.filter((item) => item.label.includes(params.keyword))
        : allData;

      const start = (params.pageNo - 1) * params.pageSize;
      const end = start + params.pageSize;

      return {
        data: filtered.slice(start, end),
        total: filtered.length,
      };
    },

    handleCategoryChange(value, option) {
      console.log('选中:', value, option);
    },

    // ==================== 虚拟列表表格 ====================

    async loadTableData() {
      this.tableLoading = true;
      try {
        // 模拟请求延迟
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 模拟 8000+ 条数据
        this.tableData = Array.from({ length: 8000 }, (_, i) => ({
          rowKey: `attr-${i + 1}`,
          valueName: `属性值 ${i + 1}`,
          valueCode: `CODE_${i + 1}`,
          status: i % 3 === 0 ? 0 : 1,
          isEditing: false,
        }));

        this.$message.success(`已加载 ${this.tableData.length} 条数据`);
      } finally {
        this.tableLoading = false;
      }
    },

    handleRowClick(row, index) {
      console.log('点击行:', index, row);
    },

    handleEdit(index) {
      this.$set(this.tableData[index], 'isEditing', true);
    },

    handleSave(index) {
      this.$set(this.tableData[index], 'isEditing', false);
      this.$message.success('保存成功');
    },

    handleCancel(index) {
      this.$set(this.tableData[index], 'isEditing', false);
    },
  },
};
</script>

<style scoped lang="less">
.big-data-render-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  .mb-16 {
    margin-bottom: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .select-demo {
    max-width: 400px;
  }

  .select-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }

  .text-danger {
    color: #f56c6c;
  }
}
</style>
