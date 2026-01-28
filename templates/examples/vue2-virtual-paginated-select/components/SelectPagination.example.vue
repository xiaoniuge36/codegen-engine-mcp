<template>
  <div class="select-pagination" @click.stop>
    <el-pagination
      :current-page="currentPage"
      :page-size="pagePerNum"
      :total="pageTotal"
      :page-sizes="[10, 20, 50, 100]"
      size="small"
      layout="prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
export default {
  name: 'SelectPagination',
  props: {
    pageTotal: {
      type: Number,
      default: 0,
    },
    pagePerNum: {
      type: Number,
      default: 10,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
  },
  methods: {
    handleSizeChange(size) {
      this.$emit('handleSizeChange', size);
    },
    handleCurrentChange(page) {
      this.$emit('handleCurrentChange', page);
    },
  },
};
</script>

<style scoped lang="less">
.select-pagination {
  padding: 8px 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  background: #fff;

  /deep/ .el-pagination {
    .el-pager li,
    .btn-prev,
    .btn-next {
      min-width: 24px;
      height: 24px;
      line-height: 24px;
    }
  }
}
</style>
