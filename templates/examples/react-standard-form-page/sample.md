# React 标准表单页（独立路由新增/编辑）

## 模板说明

本模板适用于独立路由的表单页面（非弹窗/抽屉），包含：
- 独立页面路由
- 新增/编辑共用
- 表单验证
- 保存/取消功能
- 路由参数获取

## 使用场景

- 复杂表单（超过10个字段）
- 多步骤表单
- 需要独立URL的表单
- 需要浏览器前进/后退支持的表单

## 文件结构

```
src/pages/[业务模块]/[文件夹名称]/
├── hooks/
│   └── useFormEdit.ts      # 表单编辑逻辑
├── index.tsx               # 表单页面主文件
└── index.less              # 样式文件
```

## 关键要点

1. **路由参数**
   - 通过 `useParams` 获取 id
   - 无 id 为新增，有 id 为编辑

2. **数据获取**
   - 编辑模式：useEffect 中获取详情
   - 新增模式：使用空表单

3. **表单提交**
   - 保存成功后返回上一页
   - 使用 `navigate(-1)` 或 `navigate('/list')`

4. **Hooks 文件必须生成**
   - 数据获取逻辑
   - 表单提交逻辑
   - 加载状态管理

5. **表单布局（重要）**
   - 使用 `Row` + `Col` 实现多列布局，避免单列竖向排列
   - 短字段（Input、Select、DatePicker等）使用两列布局：`<Col span={12}>`
   - 长字段（TextArea、富文本等）单独占一行：`<Col span={24}>`，并调整 labelCol/wrapperCol
   - 按钮区域居中显示
   - Row 设置 `gutter={24}` 保持列间距
   - 两列布局时 Form 的 labelCol 建议 `span: 8`，wrapperCol 建议 `span: 16`

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个员工新增/编辑页面，包含基本信息与入职信息，保存后返回列表

页面类型：标准表单页（独立路由页面，新增/编辑）

文件夹名称: employee-edit

接口及数据结构：
- 详情接口（编辑态）：getDetail(id)
- 新增接口：createItem
- 编辑接口：updateItem(id)
- 路由参数：id?（无 id 为新增，有 id 为编辑）

页面需求：
- 表单：按字段类型选择组件（Input/Select/DatePicker/Upload 等）
- 默认值：按业务规则设置
- 校验：必填/格式/范围等
- 交互：保存/取消（返回上一页）；保存成功提示并返回或跳转

强制要求（P0）：
- 必须先生成 hooks：取详情、回显、submit、loading 必须在 hooks 中
- 组件中禁止直接调用 API（通过 hooks）
- 生成后必须 TypeScript/ESLint 自检并修复
```

## 路由配置示例

```typescript
{
  path: '/employee',
  children: [
    { path: 'list', element: <EmployeeList /> },
    { path: 'edit/:id?', element: <EmployeeEdit /> },  // id 可选
  ],
}
```
