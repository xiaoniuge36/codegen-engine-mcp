# React 抽屉和表单组件知识库

本文档提供 React 抽屉（Drawer）和表单（Form）组件的使用知识和最佳实践。

## 一、组件类型对比

### 1. 表单容器对比

| 组件类型 | 使用场景 | 字段数量 | 空间占用 | 独立URL |
|---------|---------|---------|---------|---------|
| **ModalForm** | 简单快速编辑 | <10个 | 居中弹窗，遮挡页面 | ❌ 无 |
| **DrawerForm** | 中等复杂表单 | 10-20个 | 侧边滑出，部分遮挡 | ❌ 无 |
| **独立表单页** | 复杂表单 | 20+个 | 独立页面，全屏 | ✅ 有 |

### 2. 详情容器对比

| 组件类型 | 使用场景 | 信息量 | 空间占用 | 独立URL |
|---------|---------|--------|---------|---------|
| **Drawer详情** | 快速查看 | 简单-中等 | 侧边滑出 | ❌ 无 |
| **独立详情页** | 复杂详情、审批流程 | 中等-复杂 | 独立页面 | ✅ 有 |

## 二、ModalForm 弹窗表单

### 基础用法

```typescript
import { ModalForm, ProFormText } from '@ant-design/pro-components';

<ModalForm
  title="编辑"
  open={visible}
  onFinish={async (values) => {
    await updateItem(values);
    return true;  // 返回 true 自动关闭
  }}
  modalProps={{
    onCancel: () => setVisible(false),
    destroyOnClose: true,
    maskClosable: false,
  }}
>
  <ProFormText name="name" label="名称" />
</ModalForm>
```

### 关键属性

- **open**: 控制显示/隐藏
- **modalProps.destroyOnClose**: 关闭时销毁表单（重要！）
- **modalProps.maskClosable**: 禁止点击遮罩关闭
- **onFinish**: 返回 true 自动关闭，返回 false 保持打开

### 数据回显

```typescript
useEffect(() => {
  if (visible && editId) {
    getDetail(editId).then((res) => {
      form.setFieldsValue(res.data);
    });
  }
}, [visible, editId]);
```

## 三、DrawerForm 抽屉表单

### 基础用法

```typescript
import { DrawerForm, ProFormText } from '@ant-design/pro-components';

<DrawerForm
  title="编辑"
  open={visible}
  onFinish={async (values) => {
    await updateItem(values);
    return true;
  }}
  drawerProps={{
    onClose: () => setVisible(false),
    destroyOnClose: true,
    maskClosable: false,
    width: 600,  // 推荐 600-800
  }}
>
  <ProFormText name="name" label="名称" />
</DrawerForm>
```

### 关键属性

- **drawerProps.width**: 抽屉宽度（600-800px）
- **drawerProps.destroyOnClose**: 关闭时销毁
- **drawerProps.maskClosable**: 禁止点击遮罩关闭
- 其他与 ModalForm 类似

### 宽度建议

```typescript
// 字段数量 5-10个：width: 600
// 字段数量 10-15个：width: 720
// 字段数量 15-20个：width: 800
// 字段数量 20+个：建议使用独立页面
```

## 四、Drawer 抽屉详情

### 基础用法

```typescript
import { Drawer, Descriptions } from 'antd';

<Drawer
  title="详情"
  open={visible}
  onClose={onClose}
  width={600}
  extra={
    <Button type="primary" onClick={handleEdit}>
      编辑
    </Button>
  }
>
  <Descriptions column={1} bordered>
    <Descriptions.Item label="名称">{data?.name || '-'}</Descriptions.Item>
    <Descriptions.Item label="类型">
      <Tag>{data?.type}</Tag>
    </Descriptions.Item>
  </Descriptions>
</Drawer>
```

### 关键属性

- **extra**: 额外操作按钮（如编辑按钮）
- **width**: 抽屉宽度（推荐 600-800）
- 使用 Descriptions 组件展示数据
- 空值显示 `-`

### Hooks 数据管理

```typescript
// hooks/useDetailData.ts
export const useDetailData = (id?: string, visible?: boolean) => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !visible) return;
    
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getDetail(id);
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, visible]);

  return { data, loading };
};
```

## 五、独立表单页

### 基础用法

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button } from 'antd';

const FormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data, loading, saveData } = useFormEdit(id);

  const handleSubmit = async (values: any) => {
    await saveData(values);
    navigate(-1);  // 返回上一页
  };

  return (
    <Card title={id ? '编辑' : '新增'}>
      <Form form={form} onFinish={handleSubmit}>
        {/* 表单项 */}
        <Form.Item>
          <Button htmlType="submit">保存</Button>
          <Button onClick={() => navigate(-1)}>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
```

### 路由配置

```typescript
{
  path: '/employee',
  children: [
    { path: 'list', element: <EmployeeList /> },
    { path: 'edit/:id?', element: <EmployeeEdit /> },  // id 可选
  ],
}
```

## 六、ProForm 表单项组件

### 常用组件

```typescript
import {
  ProFormText,           // 文本输入
  ProFormTextArea,       // 多行文本
  ProFormDigit,          // 数字输入
  ProFormSelect,         // 下拉选择
  ProFormRadio,          // 单选
  ProFormCheckbox,       // 多选
  ProFormDatePicker,     // 日期选择
  ProFormDateRangePicker,// 日期范围
  ProFormSwitch,         // 开关
  ProFormUploadButton,   // 文件上传
} from '@ant-design/pro-components';
```

### 示例

```typescript
// 文本输入
<ProFormText
  name="name"
  label="名称"
  placeholder="请输入名称"
  rules={[{ required: true, message: '请输入名称' }]}
/>

// 下拉选择
<ProFormSelect
  name="type"
  label="类型"
  options={[
    { label: '类型1', value: 1 },
    { label: '类型2', value: 2 },
  ]}
  rules={[{ required: true }]}
/>

// 日期选择
<ProFormDatePicker
  name="date"
  label="日期"
  fieldProps={{
    format: 'YYYY-MM-DD',
  }}
/>

// 多行文本
<ProFormTextArea
  name="description"
  label="描述"
  fieldProps={{
    rows: 4,
    maxLength: 200,
    showCount: true,
  }}
/>
```

## 七、最佳实践

### 1. 何时使用 Hooks

**必须使用 Hooks 的场景**：
- 数据获取（API 调用）
- 复杂状态管理
- 表单提交逻辑
- 数据转换处理

**可以不用 Hooks 的场景**：
- 纯展示组件
- 简单的状态切换
- 直接使用 ProForm 提供的功能

### 2. 表单验证

```typescript
// 自定义验证规则
rules={[
  { required: true, message: '请输入名称' },
  { min: 2, max: 50, message: '名称长度2-50字符' },
  { 
    pattern: /^[a-zA-Z0-9_]+$/, 
    message: '只能包含字母、数字和下划线' 
  },
  {
    validator: async (_, value) => {
      if (value && await checkNameExists(value)) {
        throw new Error('名称已存在');
      }
    },
  },
]}
```

### 3. 表单联动

```typescript
<ProFormDependency name={['type']}>
  {({ type }) => {
    if (type === 1) {
      return <ProFormText name="extra" label="额外信息" />;
    }
    return null;
  }}
</ProFormDependency>
```

### 4. 提交处理

```typescript
const handleSubmit = async (values: any) => {
  try {
    // 数据转换
    const submitData = {
      ...values,
      date: values.date?.format('YYYY-MM-DD'),
    };
    
    // 提交
    if (editId) {
      await updateItem(editId, submitData);
      message.success('编辑成功');
    } else {
      await createItem(submitData);
      message.success('新增成功');
    }
    
    return true;  // 返回 true 自动关闭
  } catch (error) {
    message.error('操作失败');
    return false;  // 返回 false 保持打开
  }
};
```

## 八、性能优化

### 1. destroyOnClose

```typescript
// 关闭时销毁，避免数据残留
modalProps={{
  destroyOnClose: true,
}}
```

### 2. 条件渲染

```typescript
// 只在打开时渲染
{visible && (
  <DrawerForm
    open={visible}
    // ...
  />
)}
```

### 3. 防止重复提交

```typescript
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (values: any) => {
  if (submitting) return false;
  
  setSubmitting(true);
  try {
    await saveData(values);
    return true;
  } finally {
    setSubmitting(false);
  }
};
```

## 九、常见问题

### Q1: 抽屉/弹窗关闭后数据残留？
A: 设置 `destroyOnClose: true`

### Q2: 编辑时数据不回显？
A: 检查 useEffect 依赖，确保在 visible 变化时获取数据

### Q3: 表单提交后不关闭？
A: onFinish 必须返回 true

### Q4: 何时使用抽屉，何时使用弹窗？
A: 
- 字段少（<10个）：弹窗
- 字段中等（10-20个）：抽屉
- 字段多（20+个）：独立页面

### Q5: 如何从详情切换到编辑？
A:
```typescript
const [detailVisible, setDetailVisible] = useState(false);
const [editVisible, setEditVisible] = useState(false);

const handleEdit = (id: string) => {
  setDetailVisible(false);  // 关闭详情
  setEditId(id);
  setEditVisible(true);     // 打开编辑
};
```

## 十、相关资源

- [Ant Design Pro Components 官方文档](https://procomponents.ant.design/)
- [Ant Design Drawer 组件](https://ant.design/components/drawer-cn)
- [Ant Design Modal 组件](https://ant.design/components/modal-cn)
- [Ant Design Form 组件](https://ant.design/components/form-cn)
