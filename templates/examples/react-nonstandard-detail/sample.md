# React 非标独立详情页 - 完整示例说明

## 📖 示例概述

本示例展示如何构建一个独立路由的详情页面（非弹窗/抽屉），适用于：
- 复杂详情展示（出差申请单、项目详情等）
- 需要单独URL的场景
- 包含审批流程/附件预览的场景

## 📁 文件结构

```
src/pages/[模块]/[功能]/components/detail/
├── hooks/
│   ├── index.ts                # Hooks 导出文件
│   └── useDetailData.ts        # 详情数据获取逻辑（必须生成）
├── index.tsx                   # 详情页面主文件
└── index.less                  # 样式文件
```

## 🎯 核心要点

### 1. hooks/useDetailData.ts 必须优先生成 ⚠️

**❌ 绝对禁止**：组件中直接调用 API
```typescript
// ❌ 错误示例
const Detail = () => {
  const { id } = useParams();
  const [data, setData] = useState();
  
  useEffect(() => {
    fetch(`/api/detail/${id}`).then(...)  // ❌ 禁止！
  }, [id]);
}
```

**✅ 正确做法**：必须先生成 hooks 文件
```typescript
// ✅ 第一步：生成 hooks/useDetailData.ts
export const useDetailData = (id?: string) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDetail(id);
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  
  return { data, loading };
};

// ✅ 第二步：组件中使用 hooks
const Detail = () => {
  const { id } = useParams();
  const { data, loading } = useDetailData(id);  // ✅ 正确
  
  return <div>...</div>;
};
```

### 2. 路由参数获取

```typescript
// React Router v6
import { useParams } from 'react-router-dom';

const Detail = () => {
  const { id } = useParams<{ id: string }>();
  // ...
};
```

### 3. 页面导航

```typescript
import { useNavigate } from 'react-router-dom';

const Detail = () => {
  const navigate = useNavigate();
  
  return (
    <Card
      extra={
        <>
          <Button onClick={() => navigate(-1)}>返回</Button>
          <Button type="primary" onClick={() => navigate(`/edit/${id}`)}>编辑</Button>
        </>
      }
    >
      {/* 详情内容 */}
    </Card>
  );
};
```

### 4. 模块化展示

**建议按模块拆分内容**：

```typescript
const Detail = () => {
  return (
    <div className="detail-page">
      {/* 基础信息卡片 */}
      <Card title="基础信息">
        <Descriptions column={2}>
          <Descriptions.Item label="项目名称">{data?.projectName}</Descriptions.Item>
          {/* ... */}
        </Descriptions>
      </Card>
      
      {/* 业务信息卡片 */}
      <Card title="差旅信息">
        <Descriptions column={2}>
          {/* ... */}
        </Descriptions>
      </Card>
      
      {/* 附件预览 */}
      <Card title="附件">
        {/* 图片/文件列表 */}
      </Card>
      
      {/* 流程信息（如有） */}
      <Card title="审批流程">
        <Steps current={currentStep}>
          {/* 审批节点 */}
        </Steps>
      </Card>
    </div>
  );
};
```

### 5. TypeScript 类型引入规则

```typescript
// ⚠️ 生成前必须检查：先查看项目 types/global.d.ts

// ✅ 第三方库类型必须引入
import type { CardProps } from 'antd';

// ⚠️ 全局类型不要引入
// 如果 ProjectItem 在 types/global.d.ts 中声明，则不要 import
// import type { ProjectItem } from '../../types';  // ❌ 如果是全局类型

// ✅ 直接使用全局类型
const [data, setData] = useState<ProjectItem>();  // ProjectItem 是全局类型

// ✅ 仅引入局部类型
import type { LocalFormData } from './types';  // ✅ 局部类型需要引入
```

## 📝 使用示例

### 场景：出差申请单详情页

**需求**：
- 显示单据号、申请人、申请时间
- 基础信息：出发地、目的地、出差事由
- 差旅信息：交通方式、住宿标准、预算
- 附件预览：行程单、费用明细
- 审批流程：审批节点、审批人、审批意见

**路由配置**：
```typescript
{
  path: '/travel-apply',
  children: [
    { path: '', element: <TravelApplyList /> },      // 列表
    { path: 'detail/:id', element: <Detail /> },     // 详情
    { path: 'edit/:id?', element: <Edit /> },        // 编辑
  ],
}
```

## 🚨 强制要求

1. **hooks 文件必须优先生成**（第一个文件）
2. **组件内禁止直接调用 API**
3. **必须检查全局类型声明**
4. **生成后必须进行 TypeScript/ESLint 自检**

## 🔗 相关资源

- [Ant Design 知识图谱](../../../knowledge/common/ant-design-pro.md)
- [AI前端代码生成执行规范](../../../../AI前端代码生成执行规范（含vue、规范、完整版）.md)
