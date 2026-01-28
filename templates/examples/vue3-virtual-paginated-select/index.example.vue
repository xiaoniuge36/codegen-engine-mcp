<template>
  <div class="big-data-render-page">
    <!-- 分页下拉选择示例 -->
    <el-card title="上级分类选择（分页下拉 + 编辑回显）" class="mb-16">
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
          <el-button type="primary" :icon="Plus">新增</el-button>
        </div>
      </template>

      <el-table-v2
        v-loading="tableLoading"
        class="virtual-table"
        :columns="columns"
        :data="tableData"
        :width="tableWidth"
        :height="500"
        :header-height="48"
        :row-height="60"
        row-key="rowKey"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue';
import { ElButton, ElInput, ElMessage, ElCard } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import PaginatedSelect from './components/PaginatedSelect.example.vue';
import type { VirtualTableColumn, VirtualTableRow, SelectOption } from './types.example';

// ==================== 分页下拉 ====================

const selectedCategory = ref<string>('cat-50');

// 编辑回显：模拟从详情接口获取的选中项（不在第一页）
const initialSelectedItem = ref<SelectOption | null>({
  value: 'cat-50',
  label: '分类 50',
});

// 模拟分页接口
const fetchParentCategories = async (params: {
  pageNo: number;
  pageSize: number;
  keyword?: string;
}) => {
  // 模拟请求延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  const allData = Array.from({ length: 100 }, (_, i) => ({
    value: `cat-${i + 1}`,
    label: `分类 ${i + 1}`,
  }));

  const filtered = params.keyword
    ? allData.filter((item) => item.label.includes(params.keyword!))
    : allData;

  const start = (params.pageNo - 1) * params.pageSize;
  const end = start + params.pageSize;

  return {
    data: filtered.slice(start, end),
    total: filtered.length,
  };
};

const handleCategoryChange = (value: string, option?: SelectOption) => {
  console.log('选中:', value, option);
};

// ==================== 虚拟列表表格 ====================

const tableData = ref<VirtualTableRow[]>([]);
const tableLoading = ref(false);
const tableWidth = ref(1000);

// 加载大数据
onMounted(async () => {
  tableLoading.value = true;
  try {
    // 模拟 8000+ 条数据
    await new Promise((resolve) => setTimeout(resolve, 500));
    tableData.value = Array.from({ length: 8000 }, (_, i) => ({
      rowKey: `attr-${i + 1}`,
      valueName: `属性值 ${i + 1}`,
      valueCode: `CODE_${i + 1}`,
      status: i % 3 === 0 ? 0 : 1,
      isEditing: false,
    }));
    ElMessage.success(`已加载 ${tableData.value.length} 条数据`);
  } finally {
    tableLoading.value = false;
  }
});

// 编辑行
const handleEdit = (rowIndex: number) => {
  tableData.value[rowIndex].isEditing = true;
};

// 保存行
const handleSave = (rowIndex: number) => {
  tableData.value[rowIndex].isEditing = false;
  ElMessage.success('保存成功');
};

// 取消编辑
const handleCancel = (rowIndex: number) => {
  tableData.value[rowIndex].isEditing = false;
};

// 虚拟表格列配置
const columns: VirtualTableColumn[] = [
  {
    key: 'index',
    dataKey: 'rowKey',
    title: '序号',
    width: 80,
    align: 'center',
    cellRenderer: ({ rowIndex }) => h('span', rowIndex + 1),
  },
  {
    key: 'valueName',
    dataKey: 'valueName',
    title: '属性值名称',
    minWidth: 200,
    cellRenderer: ({ rowData, rowIndex }) => {
      if (rowData.isEditing) {
        return h(ElInput, {
          modelValue: rowData.valueName,
          size: 'small',
          maxlength: 20,
          placeholder: '请输入',
          'onUpdate:modelValue': (val: string) => {
            tableData.value[rowIndex].valueName = val;
          },
        });
      }
      return h('span', rowData.valueName || '--');
    },
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
    cellRenderer: ({ rowData }) =>
      h(
        'span',
        { style: { color: rowData.status === 1 ? '#67c23a' : '#909399' } },
        rowData.status === 1 ? '启用' : '停用'
      ),
  },
  {
    key: 'actions',
    dataKey: 'actions',
    title: '操作',
    width: 200,
    align: 'center',
    fixed: 'right',
    cellRenderer: ({ rowData, rowIndex }) => {
      const buttons = [];

      if (rowData.isEditing) {
        buttons.push(
          h(
            ElButton,
            {
              link: true,
              type: 'primary',
              onClick: () => handleSave(rowIndex),
            },
            () => '保存'
          ),
          h(
            ElButton,
            {
              link: true,
              onClick: () => handleCancel(rowIndex),
            },
            () => '取消'
          )
        );
      } else {
        buttons.push(
          h(
            ElButton,
            {
              link: true,
              type: 'primary',
              onClick: () => handleEdit(rowIndex),
            },
            () => '编辑'
          ),
          h(
            ElButton,
            {
              link: true,
              type: 'danger',
            },
            () => '删除'
          )
        );
      }

      return h('div', buttons);
    },
  },
];
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

  .virtual-table {
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }
}
</style>
