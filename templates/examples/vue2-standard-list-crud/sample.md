# Vue 2 标准列表页（搜索 + 表格 + 新增/编辑弹窗）

## 模板说明

本模板适用于 Vue 2 + Element UI 的标准 CRUD 列表页面，包含：
- 搜索表单
- 数据表格（getwayTable 或 el-table）
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
├── mixins/
│   └── tableMixin.js        # 表格逻辑（可选）
├── index.vue                # 页面主文件
└── index.less               # 样式文件
```

## 关键要点

1. **Options API**
   - data 定义数据
   - methods 定义方法
   - computed 计算属性
   - watch 监听

2. **getwayTable 配置**
   - :data 数据源
   - :columns 列配置
   - :pagination 分页
   - @selection-change 多选
   - @page-change 翻页

3. **el-dialog 配置**
   - :visible.sync 双向绑定
   - el-form 表单
   - validate 表单验证
   - slot="footer" 底部按钮

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个员工列表页，支持姓名/工号查询，新增编辑弹窗，支持删除和批量导出

页面类型：标准列表页（搜索 + 表格 + 新增/编辑弹窗）

技术栈：Vue 2 + Element UI + Options API

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
- 检查项目是否有 getwayTable 封装组件，优先使用
- 生成后必须 ESLint 自检并修复
```
