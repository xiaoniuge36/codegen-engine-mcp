# React 标准弹窗表单（ModalForm）

## 模板说明

本模板适用于弹窗表单（ModalForm），包含：
- 新增/编辑弹窗
- 表单验证
- 自动提交
- 关闭时销毁

## 使用场景

- 简单表单（少于10个字段）
- 快速编辑
- 不需要独立URL
- 列表页的新增/编辑操作

## 文件结构

```
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   └── EditModalForm.tsx   # 弹窗表单组件
├── index.tsx               # 列表页（调用弹窗）
└── index.less
```

## 关键要点

1. **ModalForm 配置**
   - `open` 控制显示
   - `form` 表单实例
   - `onFinish` 处理提交
   - `destroyOnClose` 关闭时销毁
   - `maskClosable={false}` 禁止点击遮罩关闭

2. **表单项**
   - ProFormText: 文本输入
   - ProFormSelect: 下拉选择
   - ProFormDatePicker: 日期选择
   - ProFormTextArea: 多行文本

3. **数据回显**
   - 编辑模式：useEffect 中获取详情并 setFieldsValue
   - 新增模式：resetFields 重置表单

4. **提交处理**
   - onFinish 返回 true/false
   - 成功时调用 onSuccess 刷新列表

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个新增/编辑弹窗，包含名称、类型、有效期，提交成功刷新列表

页面类型：标准弹窗表单（ModalForm）

文件夹名称: components/edit-modal

接口及数据结构：
- 详情接口（可选）：getDetail(id)
- 提交接口：create/update
- 入参：editId?（无 id 为新增，有 id 为编辑）

组件需求：
- ModalForm：open/close；destroyOnClose；maskClosable=false
- 表单项：按字段类型生成；必填校验
- 提交：onFinish 返回 boolean；成功 toast；onSuccess 回调刷新

强制要求（P0）：
- 若包含取详情/提交逻辑，必须拆 hooks（如果逻辑复杂）
- 禁止残留 console.log/debugger
- 生成后必须 TypeScript/ESLint 自检并修复
```

## 调用示例

```typescript
// 列表页中调用
const [visible, setVisible] = useState(false);
const [editId, setEditId] = useState<string>();

<Button onClick={() => setVisible(true)}>新增</Button>

<EditModalForm
  visible={visible}
  editId={editId}
  onCancel={() => setVisible(false)}
  onSuccess={() => {
    setVisible(false);
    actionRef.current?.reload();
  }}
/>
```
