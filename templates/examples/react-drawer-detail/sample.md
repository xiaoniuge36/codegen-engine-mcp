# React 抽屉详情（Drawer Detail）

## 模板说明

本模板适用于抽屉详情展示，包含：
- 侧边滑出抽屉
- 详情数据展示
- 加载状态
- 可选编辑按钮
- Hooks 数据管理

## 使用场景

- 列表页查看详情
- 不需要独立URL的详情页
- 快速查看数据
- 可以同时查看列表和详情

## 文件结构

```
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   └── DetailDrawer/
│       ├── hooks/
│       │   └── useDetailData.ts  # 详情数据获取逻辑
│       ├── index.tsx              # 抽屉详情组件
│       └── index.less             # 样式文件
└── index.tsx                      # 列表页（调用抽屉）
```

## 关键要点

1. **Drawer 配置**
   - `open` 控制显示
   - `onClose` 关闭回调
   - `width` 抽屉宽度（推荐 600-800）
   - `extra` 额外操作（如编辑按钮）

2. **Hooks 必须生成**
   - 数据获取逻辑必须在 hooks 中
   - 禁止在组件中直接调用 API
   - 加载状态管理

3. **数据展示**
   - 使用 Descriptions 组件
   - 默认 `column={2}` 一行展示两条数据
   - 支持通过 `span` 属性配置单个字段占用列数
   - 字段为空时显示 `-`
   - 状态/类型字段使用 Tag 组件

4. **交互功能**
   - 可选的编辑按钮（通过 onEdit 回调）
   - 点击编辑可以切换到编辑抽屉/弹窗

## 提示词模板

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个抽屉详情，展示基本信息和配置信息，支持编辑

页面类型：抽屉详情（Drawer Detail）

文件夹名称: components/detail-drawer

接口及数据结构：
- 详情接口：getDetail(id)
- 路由参数：id

组件需求：
- Drawer：open/close；width: 600
- 数据展示：Descriptions 组件；空值显示 `-`
- 布局配置：column=2（默认一行两列）；span 控制单个字段占用列数
- 编辑按钮：点击切换到编辑状态（可选）
- 加载状态：Spin 组件

强制要求（P0）：
- 必须生成 hooks：数据获取必须在 hooks 中
- 组件中禁止直接调用 API
- 生成后必须 TypeScript/ESLint 自检并修复
```

## 调用示例

```typescript
// 列表页中调用
const [detailVisible, setDetailVisible] = useState(false);
const [detailId, setDetailId] = useState<string>();
const [editVisible, setEditVisible] = useState(false);

// 查看详情
const handleView = (id: string) => {
  setDetailId(id);
  setDetailVisible(true);
};

// 从详情切换到编辑
const handleEdit = (id: string) => {
  setDetailVisible(false);
  setDetailId(id);
  setEditVisible(true);
};

<DetailDrawer
  visible={detailVisible}
  id={detailId}
  onClose={() => setDetailVisible(false)}
  onEdit={handleEdit}  // 可选
  column={2}           // 可选，默认2，一行展示几条数据
/>

<EditDrawerForm
  visible={editVisible}
  editId={detailId}
  onClose={() => setEditVisible(false)}
  onSuccess={() => {
    setEditVisible(false);
    actionRef.current?.reload();
  }}
/>
```

## 与独立详情页的区别

| 特性 | 抽屉详情 | 独立详情页 |
|------|---------|-----------|
| URL | 无独立URL | 有独立URL（如 `/detail/123`） |
| 场景 | 快速查看 | 复杂详情、需要分享链接 |
| 空间 | 侧边滑出，不影响主页面 | 独立页面，全屏展示 |
| 适用复杂度 | 简单-中等 | 中等-复杂 |
| 浏览器操作 | 不支持前进/后退 | 支持前进/后退 |
