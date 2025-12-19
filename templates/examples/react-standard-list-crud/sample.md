# React 标准列表页（搜索 + 表格 + 新增/编辑弹窗）

## 模板说明

本模板适用于标准的 CRUD 列表页面，包含：
- 搜索表单
- 数据表格（ProTable）
- 新增/编辑弹窗（ModalForm）
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
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   └── EditModal.tsx        # 编辑弹窗（新增/编辑）
├── hooks/
│   └── useTableData.ts      # 表格数据管理（可选）
├── types.ts                 # TypeScript 类型定义
├── index.less               # 样式文件
└── index.tsx                # 页面主文件
```

## 关键要点

1. **TypeScript 类型引入智能检查**
   - 生成前必须检查 `types/global.d.ts`
   - 全局类型不要 import
   - 第三方库类型必须 import

2. **ProTable 配置**
   - columns 配置搜索和展示
   - request 处理数据请求
   - toolbar 配置新增按钮
   - pagination 配置分页

3. **ModalForm 配置**
   - open 控制显示
   - form 表单实例
   - onFinish 处理提交
   - destroyOnClose 关闭时销毁

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个员工列表页，支持姓名/工号查询，新增编辑弹窗，支持删除和批量导出

页面类型：标准列表页（搜索 + 表格 + 新增/编辑弹窗）

文件夹名称: employee-list

接口及数据结构：
- 列表接口：fetchList
- 新增接口：createItem
- 编辑接口：updateItem
- 删除接口：deleteItem
- 详情接口：getDetail

页面需求：
- 搜索表单：姓名（文本模糊）、类型（枚举下拉）
- 数据表格：序号列 + 姓名 + 类型 + 创建时间 + 操作列（编辑/删除）
- 编辑弹窗：ModalForm（新增/编辑共用），提交成功刷新表格
- 批量操作（可选）：表格多选 + 批量删除/导出

强制要求（P0）：
- 必须先生成 hooks（如果逻辑复杂）
- 生成前必须检查全局类型声明（全局类型绝对不 import）
- 生成后必须 TypeScript/ESLint 自检并修复
```
