# React 抽屉编辑表单（DrawerForm）

## 模板说明

本模板适用于抽屉表单（DrawerForm），包含：
- 侧边滑出抽屉
- 新增/编辑表单
- 表单验证
- 自动提交
- 关闭时销毁

## 使用场景

- 中等复杂度表单（10-20个字段）
- 需要更大展示空间
- 不影响主页面操作
- 可以同时查看列表和表单

## 文件结构

```
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   └── EditDrawerForm.tsx  # 抽屉表单组件
├── index.tsx               # 列表页（调用抽屉）
└── index.less
```

## 关键要点

1. **DrawerForm 配置**
   - `open` 控制显示
   - `form` 表单实例
   - `onFinish` 处理提交
   - `drawerProps.width` 抽屉宽度（推荐 600-800）
   - `destroyOnClose` 关闭时销毁
   - `maskClosable={false}` 禁止点击遮罩关闭

2. **与 ModalForm 的区别**
   - 从右侧滑出，不遮挡整个页面
   - 适合更多字段的表单
   - 更好的空间利用

3. **表单项**
   - 与 ModalForm 相同，使用 ProForm 组件
   - 支持所有 ProForm 表单项

4. **提交处理**
   - onFinish 返回 true/false
   - 成功时调用 onSuccess 刷新列表

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个抽屉编辑表单，包含基本信息、配置信息，提交成功刷新列表

页面类型：抽屉编辑表单（DrawerForm）

文件夹名称: components/edit-drawer

接口及数据结构：
- 详情接口：getDetail(id)
- 提交接口：create/update
- 入参：editId?（无 id 为新增，有 id 为编辑）

组件需求：
- DrawerForm：open/close；width: 600；destroyOnClose；maskClosable=false
- 表单项：按字段类型生成；必填校验
- 提交：onFinish 返回 boolean；成功 toast；onSuccess 回调刷新

强制要求（P0）：
- 若包含复杂逻辑，必须拆 hooks
- 禁止残留 console.log/debugger
- 生成后必须 TypeScript/ESLint 自检并修复
```

## 调用示例

```typescript
// 列表页中调用
const [drawerVisible, setDrawerVisible] = useState(false);
const [editId, setEditId] = useState<string>();

<Button onClick={() => setDrawerVisible(true)}>新增</Button>

<EditDrawerForm
  visible={drawerVisible}
  editId={editId}
  onClose={() => setDrawerVisible(false)}
  onSuccess={() => {
    setDrawerVisible(false);
    actionRef.current?.reload();
  }}
/>
```

## 抽屉宽度建议

| 字段数量 | 推荐宽度 | 说明 |
|---------|---------|------|
| 5-10个 | 600px | 基础表单 |
| 10-15个 | 720px | 中等表单 |
| 15-20个 | 800px | 复杂表单 |
| 20+个 | 建议使用独立页面 | 字段过多，抽屉不适合 |
