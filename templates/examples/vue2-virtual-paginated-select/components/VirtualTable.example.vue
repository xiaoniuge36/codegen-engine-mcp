<template>
  <div class="virtual-table" :style="{ width: tableWidth }">
    <!-- 表头 -->
    <div class="virtual-table-header" :style="{ height: headerHeight + 'px' }">
      <div
        v-for="(col, index) in columns"
        :key="col.key"
        class="virtual-table-header-cell"
        :class="{ [`fixed-${col.fixed}`]: col.fixed }"
        :style="{
          width: getColumnWidth(col, index) + 'px',
          textAlign: col.align || 'left',
        }"
      >
        {{ col.title }}
      </div>
    </div>

    <!-- 虚拟滚动列表 -->
    <RecycleScroller
      v-if="data.length > 0"
      ref="scroller"
      class="virtual-table-body"
      :items="data"
      :item-size="rowHeight"
      :key-field="rowKeyField"
      :style="{ height: bodyHeight + 'px' }"
      v-slot="{ item, index }"
    >
      <div
        class="virtual-table-row"
        :class="{ even: index % 2 === 0, odd: index % 2 !== 0 }"
        @click="$emit('row-click', item, index)"
      >
        <div
          v-for="(col, colIndex) in columns"
          :key="col.key"
          class="virtual-table-cell"
          :class="{ [`fixed-${col.fixed}`]: col.fixed }"
          :style="{
            width: getColumnWidth(col, colIndex) + 'px',
            textAlign: col.align || 'left',
          }"
        >
          <!-- 使用作用域插槽自定义单元格 -->
          <slot
            :name="`cell-${col.key}`"
            :row="item"
            :column="col"
            :index="index"
          >
            {{ getCellValue(item, col) }}
          </slot>
        </div>
      </div>
    </RecycleScroller>

    <!-- 空状态 -->
    <div v-else class="virtual-table-empty" :style="{ height: bodyHeight + 'px' }">
      <slot name="empty">
        <el-empty description="暂无数据" />
      </slot>
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="virtual-table-loading">
      <i class="el-icon-loading"></i>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
  name: 'VirtualTable',
  components: {
    RecycleScroller,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      required: true,
    },
    rowHeight: {
      type: Number,
      default: 60,
    },
    height: {
      type: Number,
      default: 500,
    },
    width: {
      type: [Number, String],
      default: '100%',
    },
    headerHeight: {
      type: Number,
      default: 48,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    rowKey: {
      type: String,
      default: 'rowKey',
    },
  },
  computed: {
    tableWidth() {
      return typeof this.width === 'number' ? `${this.width}px` : this.width;
    },
    bodyHeight() {
      return this.height - this.headerHeight;
    },
    rowKeyField() {
      return this.rowKey;
    },
    containerWidth() {
      return typeof this.width === 'number' ? this.width : 1000;
    },
  },
  methods: {
    getColumnWidth(col, index) {
      if (col.width) return col.width;

      const fixedWidth = this.columns.reduce((sum, c) => sum + (c.width || 0), 0);
      const flexColumns = this.columns.filter((c) => !c.width);
      const flexWidth = (this.containerWidth - fixedWidth) / (flexColumns.length || 1);

      return Math.max(col.minWidth || 100, flexWidth);
    },
    getCellValue(row, col) {
      const value = row[col.dataKey];
      return value !== undefined && value !== null ? value : '--';
    },
  },
};
</script>

<style scoped lang="less">
.virtual-table {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;

  &-header {
    display: flex;
    background: #fafafa;
    border-bottom: 1px solid #ebeef5;
    font-weight: 500;
  }

  &-header-cell {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    border-right: 1px solid #ebeef5;
    flex-shrink: 0;
    box-sizing: border-box;

    &:last-child {
      border-right: none;
    }

    &.fixed-left {
      position: sticky;
      left: 0;
      background: #fafafa;
      z-index: 2;
    }

    &.fixed-right {
      position: sticky;
      right: 0;
      background: #fafafa;
      z-index: 2;
    }
  }

  &-body {
    overflow-x: hidden !important;
  }

  &-row {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
      background: #f5f7fa;
    }

    &.even {
      background: #fff;
    }

    &.odd {
      background: #fafafa;
    }
  }

  &-cell {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    border-right: 1px solid #ebeef5;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;

    &:last-child {
      border-right: none;
    }

    &.fixed-left {
      position: sticky;
      left: 0;
      background: inherit;
      z-index: 1;
    }

    &.fixed-right {
      position: sticky;
      right: 0;
      background: inherit;
      z-index: 1;
    }
  }

  &-empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    z-index: 10;

    i {
      font-size: 24px;
      color: #409eff;
    }

    span {
      color: #606266;
    }
  }
}
</style>
