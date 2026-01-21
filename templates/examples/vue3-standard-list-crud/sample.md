# Vue 3 标准列表页（搜索 + 表格 + 新增/编辑弹窗）

## 模板说明

本模板适用于 Vue 3 + Element Plus 的标准 CRUD 列表页面，包含：
- 搜索表单
- 数据表格（el-table）
- 新增/编辑弹窗（el-dialog）
- 删除功能
- 批量操作（可选）

## 使用场景

- 用户管理列表
- 角色管理列表
- 权限管理列表
- 配置管理列表
- 等标准 CRUD 页面

## 文件结构

```
src/views/[业务模块]/[文件夹名称]/
├── components/
│   └── EditDialog.vue       # 编辑弹窗
├── composables/
│   └── useTableData.ts      # 表格数据管理（可选）
├── types.ts                 # TypeScript 类型定义
├── index.vue                # 页面主文件
└── index.less               # 样式文件
```

## 关键要点

1. **Composition API**
   - 使用 `<script setup>`
   - ref/reactive 响应式数据
   - onMounted 生命周期

2. **TypeScript 类型引入智能检查**
   - 生成前必须检查 `types/global.d.ts`
   - 全局类型不要 import
   - Element Plus 类型必须 import（FormInstance、FormRules）

3. **El-Table 配置**
   - v-loading 加载状态
   - selection 多选
   - 分页器 el-pagination

4. **El-Dialog 配置**
   - v-model 控制显示
   - el-form 表单
   - validate 表单验证

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个员工列表页，支持姓名/工号查询，新增编辑弹窗，支持删除和批量导出

页面类型：标准列表页（搜索 + 表格 + 新增/编辑弹窗）

技术栈：Vue 3 + Element Plus + Composition API + TypeScript

文件夹名称: employee-list

接口及数据结构：
- 列表接口：getList
- 新增接口：createItem
- 编辑接口：updateItem
- 删除接口：deleteItem

页面需求：
- 搜索表单：姓名（文本）、类型（下拉）
- 数据表格：序号 + 姓名 + 类型 + 创建时间 + 操作列（编辑/删除）
- 编辑弹窗：el-dialog（新增/编辑共用），提交成功刷新表格
- 批量操作（可选）：表格多选 + 批量删除

强制要求（P0）：
- 必须先生成 composables（如果逻辑复杂）
- 生成前必须检查全局类型声明（全局类型绝对不 import）
- Element Plus 类型必须 import（FormInstance、FormRules）
- 生成后必须 TypeScript/ESLint 自检并修复
```
