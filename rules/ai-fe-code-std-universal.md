# AI 前端代码生成通用规范

本文档是 AI 代码生成的通用执行标准和约束规则，适用于 IDE 插件、AI 编程助手等场景。

---

## 执行流程总览

**AI 生成代码时必须按以下流程执行**：

```
1️⃣ 解析用户输入 
   ↓
2️⃣ 检查项目环境（技术栈、依赖包、全局类型文件）⚠️ 必须检查 types/global.d.ts
   ↓
3️⃣ 判断模式（标准弹窗 vs 非标独立页面）
   ↓
4️⃣ 生成代码（每个文件生成前都要检查类型）
   ↓
5️⃣ 代码自检（TypeScript、ESLint、规范、功能）
   ↓
6️⃣ 自动修复错误（P0/P1/P2 优先级）
   ↓
7️⃣ 生成自检报告（✅ 检查通过项、⚠️ 已修复问题、📋 文件清单）
```

**关键要求**：
- 第 2 步必须检查全局类型文件，避免重复引入
- 第 4 步生成 hooks 文件必须优先于组件文件
- 第 5-7 步自检修复流程**不得省略**

---

## 核心规则（必读）

### 1. 非标独立页面 hooks/composables 文件强制生成

**适用场景**：当详情页或编辑页是**独立路由页面**（非弹窗/抽屉）时

**强制要求**：
- **绝对禁止**省略 hooks/composables 文件
- **绝对禁止**将业务逻辑直接写在组件中
- hooks 文件必须**第一个**生成，先于组件文件

### 2. TypeScript 类型引入智能检查（每个文件生成前必须检查）

**强制执行流程**：
1. **第一步**：检查项目中是否存在全局类型文件（`types/global.d.ts`、`typings/index.d.ts` 等）
2. **第二步**：如果存在，读取文件内容，记录所有 `declare interface/type` 的名称
3. **第三步**：生成代码时严格遵守：
   - 全局类型列表中的类型：**绝对不引入**（直接使用）
   - 第三方库的类型（如 `ProColumns`、`FormInstance`）：**必须引入**
   - 当前模块 `types.ts` 中的局部类型：从 `./types` 引入

**示例**：
```typescript
// 假设 types/global.d.ts 中有：
declare interface UserInfo { ... }
declare interface ProjectItem { ... }

// ✅ 正确：hooks 文件中不引入全局类型
const [data, setData] = useState<ProjectItem>();  // 直接使用

// ❌ 错误：重复引入全局类型
import type { ProjectItem } from './types';  // ❌ ProjectItem 是全局类型！
```

### 3. UI 设计图片 100% 还原

**识别标志**：用户提供图片、提到"按照图片"、"还原设计稿"

**还原要求**：
- 间距、尺寸：误差 ≤ 2px
- 颜色：使用精确 HEX 色值
- 字体：大小、粗细、行高精确匹配
- 交互：hover/active/disabled 状态完整

### 4. 代码生成后必须自检和修复

**所有文件生成完成后，必须执行自检，不得省略！**

**自检流程（按顺序）**：
1. **TypeScript 类型检查**：检查是否重复引入全局类型、是否缺少必要引入
2. **ESLint 规则检查**：删除未使用的导入、变量、console.log
3. **代码规范检查**：确认 hooks 文件存在、业务逻辑正确分离
4. **功能完整性检查**：确认所有用户要求的功能都已实现

**自动修复优先级**：
- P0（必须立即修复）：类型错误、语法错误、缺少 hooks
- P1（应该修复）：ESLint 警告、未使用的导入
- P2（建议优化）：代码可读性优化

**生成自检报告**：
```markdown
## 代码生成自检报告
✅ 检查通过项
⚠️ 已修复问题
📋 生成文件清单
✅ 代码质量确认
```

---

## 非标独立页面必须生成 hooks/composables 文件（详细说明）

**当生成独立详情页（detail）或编辑页（edit）时，必须创建以下文件：**

### React 项目必须生成：
- ✅ `components/detail/hooks/useDetailData.ts` - 详情数据获取逻辑
- ✅ `components/edit/hooks/useEditForm.ts` - 编辑表单逻辑

### Vue 3 项目必须生成：
- ✅ `components/detail/composables/useDetailData.ts` - 详情数据获取逻辑
- ✅ `components/edit/composables/useEditForm.ts` - 编辑表单逻辑

### Vue 2 项目必须生成：
- ✅ `components/detail/detail.js` - 详情逻辑
- ✅ `components/edit/edit.js` - 编辑逻辑

**禁止行为**：
- **绝对禁止**：因为"逻辑简单"而跳过 hooks/composables 文件的生成
- **绝对禁止**：将数据获取、表单逻辑直接写在组件文件中
- **绝对禁止**：先生成组件主文件再生成 hooks 文件
- **绝对禁止**：在非标独立页面中省略任何一个必需的 hooks 文件

**正确做法**：
1. hooks/composables 文件**必须第一个**生成（优先级最高）
2. 即使只有一个 API 调用，也**必须**创建独立的 hooks 文件
3. 所有业务逻辑（数据获取、表单提交、状态管理）必须在 hooks 中实现

---

## 支持的技术栈

- **React**: Ant Design Pro Components + TypeScript
- **Vue 3**: Element Plus + Composition API + TypeScript
- **Vue 2**: Element UI + Options API

---

## 用户输入格式

用户通常会提供：

```
文件夹名称: lists
接口数据结构：{
  "lastName": "姓氏",
  "firstName": "名字",
  "type": "类型"
}
页面需求：搜索表单 + 数据表格 + 编辑弹窗 + 批量操作
```

可能附加：
- 参考当前项目某个页面
- 特定业务规则（文件大小、权限控制等）
- 字段验证规则
- **UI 设计图片**（需 100% 还原样式）

---

## 图片样式还原规范（重要）

当用户提供 UI 设计图片时，**必须 100% 还原图片中的所有视觉细节**。

### 识别标志

用户输入包含以下任一情况时，视为需要样式还原：
- 明确提供了设计图片/截图
- 提到"按照图片"、"参考图片"、"还原设计稿"
- 提到"UI设计"、"视觉稿"、"效果图"
- 附带了页面截图或 Figma/蓝湖等设计工具链接

### 还原要求（必须 100% 遵守）

#### 1. 布局还原
- ✅ **精确间距**：margin、padding 必须与图片一致（误差 ±2px 内）
- ✅ **精确尺寸**：宽度、高度、行高必须与设计稿匹配
- ✅ **对齐方式**：左对齐/右对齐/居中必须严格一致
- ✅ **响应式布局**：如果设计稿有多尺寸，需全部适配

#### 2. 颜色还原
- ✅ **精确色值**：使用设计稿中的准确 HEX/RGB 色值
- ✅ **渐变效果**：如有渐变，必须还原渐变方向、色值、位置
- ✅ **透明度**：opacity/rgba 的透明度必须一致
- ✅ **状态颜色**：hover/active/disabled 等状态颜色必须完整

#### 3. 字体样式
- ✅ **字体大小**：font-size 精确到 px
- ✅ **字体粗细**：font-weight（如 400/500/600）必须匹配
- ✅ **字体颜色**：文字颜色精确还原
- ✅ **行高/字间距**：line-height、letter-spacing 必须一致
- ✅ **字体族**：如设计稿指定字体（如 PingFang SC），必须使用

#### 4. 边框与圆角
- ✅ **边框样式**：border 宽度、颜色、样式（solid/dashed）
- ✅ **圆角大小**：border-radius 精确值（如 4px/8px/50%）
- ✅ **阴影效果**：box-shadow 的偏移、模糊、颜色必须一致

#### 5. 图标与图片
- ✅ **图标位置**：左侧/右侧图标位置精确
- ✅ **图标大小**：icon size 必须匹配
- ✅ **图标颜色**：SVG/IconFont 颜色必须一致
- ✅ **图片尺寸**：缩略图、头像等尺寸严格控制

#### 6. 交互效果
- ✅ **悬停效果**：hover 时的颜色、阴影、缩放等变化
- ✅ **点击效果**：active 状态的视觉反馈
- ✅ **禁用状态**：disabled 时的灰化效果
- ✅ **动画过渡**：transition 动画时长和效果

### 样式编写优先级

```less
// 1. 使用设计稿中的精确数值（最高优先级）
.custom-button {
  width: 120px;           // 设计稿标注的精确值
  height: 40px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 22px;
  padding: 9px 24px;      // 精确的内边距
  background: #1890ff;    // 精确的色值
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);  // 精确的阴影
}

// 2. 如果设计稿未明确，才使用 UI 库默认样式
.el-button {
  // 使用 Element Plus 默认样式
}

// 3. 避免使用模糊的值
.wrong-example {
  padding: 10px;         // ❌ 如果设计稿是 12px，这就是错误的
  color: blue;           // ❌ 应该用精确色值 #1890ff
  border-radius: 5px;    // ❌ 如果设计稿是 4px，这就不对
}
```

### 样式还原检查清单

在完成页面后，必须逐项检查：

- [ ] **间距检查**：所有 margin/padding 是否与设计稿一致
- [ ] **颜色检查**：主色、辅助色、文字色、边框色是否精确
- [ ] **字体检查**：大小、粗细、行高是否匹配
- [ ] **圆角检查**：按钮、卡片、输入框圆角是否一致
- [ ] **阴影检查**：卡片、弹窗阴影效果是否还原
- [ ] **图标检查**：大小、颜色、位置是否正确
- [ ] **响应式检查**：不同屏幕尺寸下布局是否正确
- [ ] **交互检查**：hover/active/disabled 状态是否完整

### 验收标准

完成的页面必须达到：
- **视觉一致性**：与设计稿对比，视觉效果一致率 ≥ 98%
- **像素精确度**：关键元素尺寸误差 ≤ 2px
- **色值准确性**：颜色使用设计稿精确色值，无目测配色
- **交互完整性**：所有交互状态（hover/active/disabled）都已实现

---

## 目录创建规则

### 核心约束

1. **目录位置**：只能在 `src/pages/[业务模块]/[文件夹名称]` 或 `src/views/[业务模块]/[文件夹名称]` 创建
   - ✅ 正确：`src/pages/user-management/lists/`
   - ❌ 错误：`src/pages/lists/`（一级目录）
   
2. **目录冲突**：若目录已存在，递增新建（如 `lists-v2`），不修改现有代码

3. **命名规范**：使用 kebab-case（短横线），如 `employee-whitelist`

4. **子组件位置**：
   - **详情页面**、**编辑表单**通常作为列表页的子组件，放在 `components/` 目录
   - 只有明确要求独立页面时，才创建独立目录
   
5. **非标独立页面**（重要）：
   - 当详情/编辑**不是弹窗或抽屉**，而是**独立路由页面**时
   - 在 `components/` 下创建独立文件夹：`detail/` 或 `edit/`
   - 每个文件夹包含完整的页面结构（hooks、样式、主文件）
   - 适用场景：复杂表单、多步骤流程、需要单独URL的页面

### React 项目目录结构

#### 标准列表页面（含详情、编辑）

```
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   ├── EditModal.tsx        # 编辑弹窗（新增/编辑）
│   ├── DetailDrawer.tsx     # 详情抽屉（可选）
│   └── BatchActions.tsx     # 批量操作组件（可选）
├── hooks/
│   ├── index.ts
│   └── useTableData.ts      # 表格数据管理
├── types.ts                  # TypeScript 类型定义
├── index.less
└── index.tsx                 # 页面主文件
```

**简化版（简单页面）**：
```
src/pages/[业务模块]/[文件夹名称]/
├── index.tsx
├── index.less
└── types.ts（可选）
```

**非标独立页面版（详情/编辑为独立路由页面）**：
```
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   ├── detail/                # 详情独立页面
│   │   ├── hooks/
│   │   │   └── useDetailData.ts
│   │   ├── index.tsx
│   │   └── index.less
│   └── edit/                  # 编辑独立页面
│       ├── hooks/
│       │   └── useEditForm.ts
│       ├── index.tsx
│       └── index.less
├── hooks/
│   └── useTableData.ts
├── types.ts
├── index.less
└── index.tsx                  # 列表主页面
```

**特征识别**：
- 用户明确提到"跳转到详情页面"、"新页面编辑"、"独立URL"
- 表单复杂度高（超过10个字段）
- 需要多步骤操作流程
- 需要浏览器前进/后退支持

### Vue 3 项目目录结构

#### 标准列表页面（含详情、编辑）

```
src/views/[业务模块]/[文件夹名称]/
├── components/
│   ├── EditDialog.vue       # 编辑弹窗
│   ├── DetailDrawer.vue     # 详情抽屉（可选）
│   └── SearchForm.vue       # 搜索表单（可选）
├── composables/
│   ├── index.ts
│   └── useTableData.ts      # 表格数据管理
├── types.ts
├── index.vue
└── index.less
```

**非标独立页面版（详情/编辑为独立路由页面）**：
```
src/views/[业务模块]/[文件夹名称]/
├── components/
│   ├── detail/                # 详情独立页面
│   │   ├── composables/
│   │   │   └── useDetailData.ts
│   │   ├── index.vue
│   │   └── index.less
│   └── edit/                  # 编辑独立页面
│       ├── composables/
│       │   └── useEditForm.ts
│       ├── index.vue
│       └── index.less
├── composables/
│   └── useTableData.ts
├── types.ts
├── index.vue
└── index.less
```

### Vue 2 项目目录结构

```
src/views/[业务模块]/[文件夹名称]/
├── components/
│   ├── EditDialog.vue       # 编辑弹窗
│   └── SearchForm.vue       # 搜索表单（可选）
├── mixins/
│   └── tableMixin.js        # 表格逻辑（可选）
├── index.vue
└── index.less
```

**非标独立页面版**：
```
src/views/[业务模块]/[文件夹名称]/
├── components/
│   ├── detail/                # 详情独立页面
│   │   ├── index.vue
│   │   └── index.less
│   └── edit/                  # 编辑独立页面
│       ├── index.vue
│       └── index.less
├── mixins/
│   └── tableMixin.js
├── index.vue
└── index.less
```

### 文件命名规范

| 文件类型 | React | Vue 3 | Vue 2 |
|---------|-------|-------|-------|
| 主文件 | `index.tsx` | `index.vue` | `index.vue` |
| 子组件（弹窗/抽屉） | `EditModal.tsx` | `EditDialog.vue` | `EditDialog.vue` |
| 独立详情页 | `components/detail/index.tsx` | `components/detail/index.vue` | `components/detail/index.vue` |
| 独立编辑页 | `components/edit/index.tsx` | `components/edit/index.vue` | `components/edit/index.vue` |
| Hook/Composable | `useTableData.ts` | `useTableData.ts` | - |
| Mixin | - | - | `tableMixin.js` |
| 类型文件 | `types.ts` | `types.ts` | - |
| 样式文件 | `index.less` | `index.less` | `index.less` |

---

## 依赖引入规范

### React 项目依赖顺序

```typescript
// 1. React 核心库
import React, { useState, useEffect, useMemo } from 'react';

// 2. 第三方 UI 库（按字母顺序）
import { Button, Space, Table, Modal, Form, Input } from 'antd';
import { ProTable, ModalForm, DrawerForm } from '@ant-design/pro-components';

// 3. 第三方工具库
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

// 4. 项目内部模块
import { getUserList, createUser } from '@/services/user';
import { useRequest } from '@/hooks';

// 5. 当前目录模块
import { useTableData } from './hooks';
import EditModal from './components/EditModal';
import type { UserInfo } from './types';  // ⚠️ 仅当项目未全局引入 type 时才需要

// 6. 样式文件
import './index.less';
```

**TypeScript 类型引入规则（强制执行）**：

**第一步：生成任何文件前，必须先检查全局类型**
```bash
# 检查这些文件是否存在
types/global.d.ts
typings/index.d.ts
src/types/index.d.ts
src/typings/global.d.ts
```

**第二步：判断类型是否需要引入**
```typescript
// 如果在以下文件中找到类型定义，则该类型是全局类型
// 全局类型文件示例：types/global.d.ts
declare interface UserInfo {
  id: string;
  name: string;
}

// ✅ 正确：全局类型直接使用，不引入
// hooks/useTableData.ts
const [data, setData] = useState<TableItem[]>([]);  // ✅ TableItem 是全局类型
const [user, setUser] = useState<UserInfo>();       // ✅ UserInfo 是全局类型

// ❌ 错误：重复引入全局类型
import type { TableItem, UserInfo } from './types';  // ❌ 这些是全局类型！

// ✅ 正确：仅引入当前模块特有的局部类型
import type { LocalFormData } from './types';  // ✅ LocalFormData 是局部类型
```

**强制检查清单**：
- [ ] ❶ 生成 hooks 文件前，检查项目 `types/` 目录
- [ ] ❷ 确认哪些类型是全局声明的（在 `.d.ts` 文件中）
- [ ] ❸ 全局类型**绝对不引入** `import type`
- [ ] ❹ 只引入当前模块在 `types.ts` 中定义的局部类型
- [ ] ❺ index 文件同样遵循此规则

**Pro Components 智能引入规则**：
1. 优先检查 `package.json` 是否有 `@ant-design/pro-components`
2. 若有，从该包引入：`import { ProTable, ModalForm } from '@ant-design/pro-components';`
3. 若无，从单独包引入：
   ```typescript
   import { ProTable } from '@ant-design/pro-table';
   import { ModalForm } from '@ant-design/pro-form';
   ```

### Vue 3 项目依赖顺序

```typescript
// 1. Vue 核心库
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 2. Element Plus 组件
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

// 3. 第三方工具库
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

// 4. 项目内部模块
import { getUserList, createUser } from '@/api/user';
import { useUserStore } from '@/store/modules/user';

// 5. 当前目录模块
import { useTableData } from './composables';
import EditDialog from './components/EditDialog.vue';
import type { UserInfo } from './types';

// 6. 样式文件
import './index.less';
```

### Vue 2 项目依赖顺序

```javascript
// 1. Vue 核心库
import Vue from 'vue';

// 2. Element UI 组件
import { Message, MessageBox } from 'element-ui';

// 3. Vuex
import { mapState, mapActions } from 'vuex';

// 4. 第三方工具库
import { cloneDeep } from 'lodash';
import moment from 'moment';

// 5. 项目内部模块
import { getUserList, createUser } from '@/api/user';

// 6. 当前目录模块
import EditDialog from './components/EditDialog.vue';
import tableMixin from './mixins/tableMixin';

// 7. 样式文件
import './index.less';
```

---

## 接口数据结构处理

### 字段类型智能识别

根据接口字段自动选择合适的组件和搜索方式：

| 字段类型 | 特征 | 展示组件 | 搜索方式 |
|---------|-----|---------|---------|
| **ID类** | `id`, `userId`, `序号` | indexBorder（序号列） | 精确搜索 |
| **文本类** | `name`, `title`, `description`, `编号` | 文本展示 | 模糊搜索（Input） |
| **数字类** | `amount`, `price`, `count`, `数量` | 数字展示 | 范围搜索（InputNumber） |
| **日期时间** | `createTime`, `updateTime`, `date` | dateTime格式化 | 日期范围选择器 |
| **状态枚举** | `status`, `type`, `state`, `类型` | 标签展示 | 下拉多选（Select） |
| **布尔类** | `isValid`, `enabled`, `有效性` | 开关/标签 | 单选（Radio/Select） |
| **关联字段** | `departmentId`, `userId` | 关联名称 | 远程搜索/级联选择 |

### 示例：接口数据结构转换

**用户输入**：
```json
{
  "lastName": "姓氏",
  "firstName": "名字",
  "raCode": "RA代码",
  "trafficWhitelist": "交通白名单",
  "type": "类型",
  "createTime": "创建时间"
}
```

**生成规则**：
- `lastName`, `firstName`, `raCode` → 文本类 → 模糊搜索
- `trafficWhitelist` → 布尔类 → Radio/Switch → 单选搜索
- `type` → 枚举类 → Select → 多选搜索
- `createTime` → 日期时间类 → DatePicker → 范围搜索

---

## 页面需求解析

### 标准页面组成

用户描述：`搜索表单 + 数据表格 + 编辑弹窗 + 批量操作`

**生成内容**：

#### React - ProTable
```typescript
// 主页面：包含搜索 + 表格
<ProTable
  columns={columns}
  request={fetchData}
  toolbar={{
    actions: [
      <Button type="primary" onClick={handleAdd}>新增</Button>,
      <Button onClick={handleBatchPush}>批量推送</Button>,
    ],
  }}
  search={{
    labelWidth: 'auto',
    span: 8,
  }}
/>

// 子组件：编辑弹窗
<ModalForm
  title={editId ? '编辑' : '新增'}
  visible={visible}
  onFinish={handleSubmit}
>
  {/* 表单项 */}
</ModalForm>
```

#### Vue 3 - TablePage
```vue
<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button @click="handleBatchPush">批量推送</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" />
      <!-- 数据列 -->
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :total="total"
      :current-page="page"
      @current-change="handlePageChange"
    />

    <!-- 编辑弹窗 -->
    <EditDialog v-model="dialogVisible" :data="editData" @success="refresh" />
  </div>
</template>
```

#### Vue 2 - getwayTable
```vue
<template>
  <div>
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline>
      <!-- 搜索项 -->
    </el-form>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button @click="handleBatchAction">批量操作</el-button>
    </div>

    <!-- 表格 -->
    <getway-table
      :data="tableData"
      :columns="columns"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <template v-slot:actions="{ row }">
        <el-button type="text" @click="handleEdit(row)">编辑</el-button>
      </template>
    </getway-table>

    <!-- 编辑弹窗 -->
    <edit-dialog
      :visible.sync="dialogVisible"
      :data="editData"
      @success="fetchData"
    />
  </div>
</template>
```

---

## 标准页面模板规则提示词

### 1) 标准列表页（搜索 + 表格 + 新增/编辑弹窗）

```
一句话需求：<例如：做一个员工列表页，支持姓名/工号查询，新增编辑弹窗，支持删除和批量导出>

页面类型：标准列表页（搜索 + 表格 + 新增/编辑弹窗）

文件夹名称: <kebab-case，例如 employee-list>

接口及数据结构：
- 列表接口：<fetchList>
- 新增接口：<createItem>
- 编辑接口：<updateItem>
- 删除接口：<deleteItem>
- 详情接口（可选）：<getDetail>

页面需求：
- 搜索表单：按字段类型自动生成（文本模糊/枚举下拉/日期范围等）
- 数据表格：序号列 + 业务列 + 操作列（编辑/删除）
- 编辑弹窗：ModalForm（新增/编辑共用），提交成功刷新表格
- 批量操作（可选）：表格多选 + 批量按钮

强制要求（P0）：
- 必须先生成 hooks/composables：表格数据、分页、loading、删除/批量逻辑必须在 hooks 中
- 生成前必须检查全局类型声明（全局类型绝对不 import）
- 生成后必须 TypeScript/ESLint 自检并修复
```

### 2) 标准表单页（独立路由新增/编辑）

```
一句话需求：<例如：做一个员工新增/编辑页面，包含基本信息与入职信息，保存后返回列表>

页面类型：标准表单页（独立路由页面，新增/编辑）

文件夹名称: <kebab-case，例如 employee-edit>

接口及数据结构：
- 详情接口（编辑态）：<getDetail(id)>
- 新增接口：<createItem>
- 编辑接口：<updateItem(id)>
- 路由参数：id?（无 id 为新增，有 id 为编辑）

页面需求：
- 表单：按字段类型选择组件（Input/Select/DatePicker/Upload 等）
- 默认值：按业务规则设置
- 校验：必填/格式/范围等
- 交互：保存/取消（返回上一页）；保存成功提示并返回或跳转

强制要求（P0）：
- 必须先生成 hooks/composables：取详情、回显、submit、loading 必须在 hooks 中
- 组件中禁止直接调用 API（通过 hooks）
- 生成后必须 TypeScript/ESLint 自检并修复
```

### 3) 标准弹窗表单（ModalForm/对话框）

```
一句话需求：<例如：做一个新增/编辑弹窗，包含名称、类型、有效期，提交成功刷新列表>

页面类型：标准弹窗表单（ModalForm/对话框）

文件夹名称: <kebab-case，例如 components/edit-modal>

接口及数据结构：
- 详情接口（可选）：<getDetail(id)>
- 提交接口：<create/update>
- 入参：editId?（无 id 为新增，有 id 为编辑）

组件需求：
- ModalForm：open/close；destroyOnClose；maskClosable=false
- 表单项：按字段类型生成；必填校验
- 提交：onFinish 返回 boolean；成功 toast；onSuccess 回调刷新

强制要求（P0）：
- 若包含取详情/提交逻辑，必须拆 hooks/composables（禁止堆在组件里）
- 禁止残留 console.log/debugger
- 生成后必须 TypeScript/ESLint 自检并修复
```

### 非标独立页面识别

**用户输入示例1（明确说明）**：
```
页面需求：
  - 列表页：搜索 + 表格
  - 点击"查看"跳转到新页面显示详情
  - 点击"编辑"打开新页面进行编辑
```
**判断**：✅ 使用独立页面模式（components/detail/、components/edit/）

**用户输入示例2（复杂表单）**：
```
页面需求：编辑表单包含20+字段，需要多个tab页
```
**判断**：✅ 使用独立页面模式（表单过于复杂，不适合弹窗）

**用户输入示例3（默认情况）**：
```
页面需求：搜索表单 + 数据表格 + 编辑
```
**判断**：❌ 使用弹窗模式（EditModal/EditDialog），除非字段数量>10

**用户输入示例4（明确弹窗）**：
```
页面需求：点击编辑弹出弹窗
```
**判断**：❌ 使用弹窗模式（EditModal/EditDialog）

---

## React 前端规范

### 表单容器选择规则

**根据字段数量自动选择**：

| 字段数量 | 推荐组件 | 使用场景 |
|---------|---------|---------|
| < 10个 | ModalForm 弹窗 | 快速编辑、简单表单 |
| 10-20个 | DrawerForm 抽屉 | 中等表单、需要更多空间 |
| > 20个 | 独立表单页 | 复杂表单、多步骤表单 |

**判断标准**：
1. **字段少（<10个）**：使用 ModalForm，居中弹窗，快速编辑
2. **字段中等（10-20个）**：使用 DrawerForm，侧边滑出，不完全遮挡列表
3. **字段多（>20个）**：使用独立表单页，需要独立URL，支持前进/后退

### 详情容器选择规则

**根据信息复杂度选择**：

| 信息复杂度 | 推荐组件 | 使用场景 |
|-----------|---------|---------|
| 简单-中等 | Drawer 抽屉 | 快速查看、不需要URL |
| 中等-复杂 | 独立详情页 | 审批流程、附件预览、需要分享 |

### 关键配置要点

#### 1. ModalForm 弹窗表单配置

```typescript
<ModalForm
  title={editId ? '编辑' : '新增'}
  open={visible}
  form={form}
  modalProps={{
    onCancel,
    destroyOnClose: true,      // ⚠️ 必须：关闭时销毁
    maskClosable: false,       // ⚠️ 必须：禁止点击遮罩关闭
  }}
  layout="horizontal"
  labelCol={{ span: 6 }}
  wrapperCol={{ span: 16 }}
  onFinish={handleSubmit}      // ⚠️ 必须返回 true/false
>
  {/* 表单项 */}
</ModalForm>
```

**关键要点**：
- `destroyOnClose: true` - 关闭时销毁表单，避免数据残留
- `maskClosable: false` - 禁止点击遮罩关闭，防止误操作
- `onFinish` 返回 `true` 自动关闭，返回 `false` 保持打开

#### 2. DrawerForm 抽屉表单配置

```typescript
<DrawerForm
  title={editId ? '编辑' : '新增'}
  open={visible}
  form={form}
  drawerProps={{
    onClose,
    destroyOnClose: true,
    maskClosable: false,
    width: 600,                // 推荐：600-800
  }}
  layout="horizontal"
  labelCol={{ span: 6 }}
  wrapperCol={{ span: 16 }}
  onFinish={handleSubmit}
>
  {/* 表单项 */}
</DrawerForm>
```

**宽度建议**：
- 5-10个字段：`width: 600`
- 10-15个字段：`width: 720`
- 15-20个字段：`width: 800`
- 20+个字段：使用独立表单页

#### 3. 独立表单页配置

```typescript
const FormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // ⚠️ 路由参数
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data, loading, saveData } = useFormEdit(id);  // ⚠️ 必须使用 Hooks

  const handleSubmit = async (values: any) => {
    await saveData(values);
    navigate(-1);  // 返回上一页
  };

  return (
    <Card title={id ? '编辑' : '新增'}>
      <Form form={form} onFinish={handleSubmit}>
        {/* 表单项 */}
      </Form>
    </Card>
  );
};
```

**关键要点**：
- 必须生成 Hooks 文件（`useFormEdit`）
- 通过路由参数 `id` 判断新增/编辑
- 保存成功后返回上一页或跳转列表

---

## Vue 3 前端规范

### 关键配置要点

#### 1. el-dialog 弹窗配置

```vue
<el-dialog
  v-model="dialogVisible"
  :title="editId ? '编辑' : '新增'"
  :close-on-click-modal="false"
  :destroy-on-close="true"
  width="600px"
>
  <el-form :model="formData" :rules="rules" ref="formRef">
    <!-- 表单项 -->
  </el-form>
  <template #footer>
    <el-button @click="dialogVisible = false">取消</el-button>
    <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
      确定
    </el-button>
  </template>
</el-dialog>
```

#### 2. Composables 使用规范

```typescript
// composables/useTableData.ts
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getList, deleteItem } from '@/api/xxx';

export const useTableData = () => {
  const loading = ref(false);
  const tableData = ref([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
      tableData.value = res.data.list;
      pagination.total = res.data.total;
    } catch (error) {
      ElMessage.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchData();
  });

  return { loading, tableData, pagination, fetchData };
};
```

---

## Vue 2 前端规范

### 关键配置要点

#### 1. el-dialog 配置

```vue
<el-dialog
  :visible.sync="dialogVisible"
  :title="editId ? '编辑' : '新增'"
  :close-on-click-modal="false"
  :destroy-on-close="true"
  width="600px"
>
  <el-form :model="formData" :rules="rules" ref="form">
    <!-- 表单项 -->
  </el-form>
  <div slot="footer">
    <el-button @click="dialogVisible = false">取消</el-button>
    <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
      确定
    </el-button>
  </div>
</el-dialog>
```

#### 2. Mixin 使用规范

```javascript
// mixins/tableMixin.js
export default {
  data() {
    return {
      loading: false,
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
    };
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await this.getListApi({
          pageNum: this.pagination.current,
          pageSize: this.pagination.pageSize,
        });
        this.tableData = res.data.list;
        this.pagination.total = res.data.total;
      } catch (error) {
        this.$message.error('获取数据失败');
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchData();
  },
};
```

---

## 通用规范

### API 请求规范

#### 请求封装（React）

```typescript
// services/api.ts
import request from '@/utils/request';

export interface ListParams {
  name?: string;
  type?: number;
  pageNum: number;
  pageSize: number;
}

export const getList = (params: ListParams) => {
  return request.get('/api/list', { params });
};

export const createItem = (data: any) => {
  return request.post('/api/create', data);
};

export const updateItem = (id: string, data: any) => {
  return request.put(`/api/update/${id}`, data);
};

export const deleteItem = (id: string) => {
  return request.delete(`/api/delete/${id}`);
};
```

#### 请求封装（Vue）

```typescript
// api/index.ts
import request from '@/utils/request';

export const getList = (params: any) => {
  return request({
    url: '/api/list',
    method: 'get',
    params,
  });
};

export const createItem = (data: any) => {
  return request({
    url: '/api/create',
    method: 'post',
    data,
  });
};

export const updateItem = (id: string, data: any) => {
  return request({
    url: `/api/update/${id}`,
    method: 'put',
    data,
  });
};
```

### 代码风格规范

#### 命名规范

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件名 | PascalCase | `UserList`, `EditModal` |
| 文件名（组件） | PascalCase（React）/ kebab-case（Vue） | `UserList.tsx`, `edit-dialog.vue` |
| 变量/函数 | camelCase | `userData`, `handleSubmit` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT`, `API_BASE_URL` |
| 类型/接口 | PascalCase | `UserInfo`, `ApiResponse` |
| CSS类名 | kebab-case | `user-list`, `edit-modal` |

#### 注释规范

```typescript
/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表数据
 */
export const getUserList = async (params: ListParams): Promise<ApiResponse<UserInfo[]>> => {
  // 实现逻辑
};
```

### 错误处理规范

#### 统一错误提示

```typescript
// React
try {
  await updateItem(id, data);
  message.success('操作成功');
} catch (error) {
  message.error(error.message || '操作失败');
}

// Vue 3
try {
  await updateItem(id, data);
  ElMessage.success('操作成功');
} catch (error) {
  ElMessage.error(error.message || '操作失败');
}

// Vue 2
try {
  await updateItem(id, data);
  this.$message.success('操作成功');
} catch (error) {
  this.$message.error(error.message || '操作失败');
}
```

### 性能优化规范

#### React 性能优化

```typescript
// 使用 useMemo 缓存计算结果
const expensiveData = useMemo(() => {
  return computeExpensiveValue(props.data);
}, [props.data]);

// 使用 useCallback 缓存回调函数
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// 使用 React.memo 避免不必要的重渲染
const MemoizedComponent = React.memo(MyComponent);
```

#### Vue 性能优化

```vue
<!-- 使用 v-show 代替 v-if（频繁切换） -->
<div v-show="visible">内容</div>

<!-- 使用 computed 缓存计算结果 -->
<script setup>
const expensiveData = computed(() => {
  return computeExpensiveValue(props.data);
});
</script>

<!-- 长列表虚拟滚动 -->
<virtual-list :data-sources="list" :data-key="'id'" />
```

---

## 执行流程详解

### 1. 解析用户输入

```
文件夹名称: lists
接口数据结构：{ ... }
页面需求：搜索 + 表格 + 编辑弹窗
```

提取信息：
- 文件夹名称 → 目录路径
- 接口字段 → columns 配置
- 页面需求 → 确定需要的组件

### 2. 检查项目环境（强制执行）

#### ❶ 识别技术栈
React/Vue 3/Vue 2

#### ❷ 检查依赖包
`package.json` 中的 Pro Components、Element Plus等

#### ❸ **检查类型声明（最高优先级，必须执行）**

**强制检查清单**：
```bash
# 按顺序检查以下文件，只要有一个存在，就说明项目使用全局类型声明
[ ] types/global.d.ts
[ ] typings/index.d.ts
[ ] src/types/index.d.ts
[ ] src/types/global.d.ts
[ ] src/typings/global.d.ts
```

**检查步骤**：
1. **读取文件内容**：如果上述任一文件存在，读取其内容
2. **识别全局类型**：查找所有 `declare interface`、`declare type`、`declare namespace` 声明
3. **记录全局类型列表**：将所有全局类型名称记录下来
4. **生成代码时强制遵守**：
   - ✅ 全局类型列表中的类型，**绝对不引入**
   - ✅ 仅引入**当前模块局部定义**的类型（types.ts 中的类型）
   - ✅ 第三方库的类型（如 `FormInstance`、`ProColumns`）**必须引入**

#### ❹ 扫描可复用组件
`src/components` 查找项目封装的组件

#### ❺ 检查参考页面
是否有类似页面可以参考

#### ❻ 检查设计稿
是否提供了 UI 图片（需 100% 还原样式）

### 3. 确定目录结构

根据页面复杂度和交互方式选择：
- **简单**（仅表格展示）→ 仅创建 `index` 文件
- **标准**（搜索+表格+弹窗/抽屉）→ 创建 `components/` 目录，子组件用弹窗/抽屉
- **复杂**（多模块）→ 创建完整目录结构
- **非标独立页面**（详情/编辑为新页面）→ 在 `components/` 下创建 `detail/`、`edit/` 文件夹

**识别非标独立页面的关键词**：
- "跳转到新页面"、"打开新页面"
- "独立详情页"、"独立编辑页"
- "单独的URL"、"可分享的链接"
- "需要路由"、"页面跳转"
- 表单字段超过10个
- 需要多步骤操作流程
- 需要浏览器历史记录支持

### 4. 生成代码

#### 标准弹窗模式 - 按顺序生成：
1. **types.ts** - 类型定义文件（如果需要局部类型）
2. **hooks/useTableData.ts** 或 **composables/useTableData.ts** - 业务逻辑
3. **components/EditModal.tsx** 或 **EditDialog.vue** - 子组件
4. **index.tsx** 或 **index.vue** - 主文件
5. **index.less** - 样式文件

#### 非标独立页面模式 - **严格按以下顺序逐一生成**：

**详情页必须生成的文件（按顺序）**：
1. **第一步（强制）**：hooks/composables 文件
2. **第二步（推荐）**：hooks 导出文件
3. **第三步**：详情页主组件
4. **第四步**：详情页样式

**编辑页必须生成的文件（按顺序）**：
1. **第一步（强制）**：hooks/composables 文件
2. **第二步（推荐）**：hooks 导出文件
3. **第三步**：编辑页主组件
4. **第四步**：编辑页样式

### 5. 代码自检和修复流程（强制执行）

#### 5.1 自动检查清单（按顺序执行）

**第一步：TypeScript 类型检查**
- 检查是否有重复引入全局类型
- 检查是否缺少必要的类型引入

**第二步：ESLint 规则检查**
- 未使用的导入
- 未使用的变量
- console.log 残留
- debugger 残留

**第三步：代码规范检查**
- hooks 文件是否存在且优先生成
- 业务逻辑是否正确分离
- 组件是否过度耦合

**第四步：功能完整性检查**
- 用户要求的所有功能是否都已实现
- 是否遗漏了必要的字段
- 是否添加了必要的验证规则

#### 5.2 自动修复流程

**发现错误后，按以下优先级修复**：

**优先级 P0（必须立即修复）**：
1. TypeScript 类型错误
2. 语法错误
3. 缺少必要的 hooks 文件

**优先级 P1（应该修复）**：
4. ESLint 警告
5. 未使用的导入和变量
6. 代码规范问题

**优先级 P2（建议优化）**：
7. 代码可读性优化
8. 性能优化建议

#### 5.3 生成自检报告

```markdown
## 代码生成自检报告

### ✅ 检查通过项
- [x] TypeScript 类型检查通过 - 无类型错误
- [x] ESLint 规则检查通过 - 无警告和错误
- [x] hooks/composables 文件已正确生成
- [x] 类型引入符合全局类型规则
- [x] 业务逻辑正确分离（组件 + hooks）
- [x] 功能完整实现

### ⚠️ 已修复问题（共 N 个）
1. ✅ 修复了 X 处全局类型重复引入
2. ✅ 删除了 X 个未使用的导入
3. ✅ 移除了 X 处 console.log

### 📋 生成文件清单（共 N 个文件）
1. ✅ src/pages/xxx/index.tsx
2. ✅ src/pages/xxx/hooks/useTableData.ts
3. ✅ src/pages/xxx/components/EditModal.tsx

### ✅ 代码质量确认
- ✅ 无语法错误
- ✅ 无 TypeScript 类型错误
- ✅ 符合项目代码规范
- ✅ 所有用户要求的功能已实现
```

---

## 常见场景示例

### 场景1：标准列表页 + 编辑弹窗

**用户输入**：
```
文件夹名称: employee-list
接口数据结构：{
  "name": "姓名",
  "email": "邮箱",
  "department": "部门",
  "status": "状态"
}
页面需求：搜索表单 + 数据表格 + 新增/编辑弹窗
```

**生成内容**：
```
src/pages/hr/employee-list/
├── components/
│   └── EditModal.tsx     # 编辑弹窗
├── hooks/
│   └── useTableData.ts   # 表格逻辑
├── types.ts
├── index.less
└── index.tsx             # 主页面（ProTable + 搜索）
```

### 场景2：非标独立详情/编辑页面

**用户输入**：
```
文件夹名称: project-management
页面需求：
  - 列表页：搜索 + 表格
  - 点击"查看"跳转到新页面显示详情（非弹窗）
  - 点击"编辑"跳转到新页面编辑（非抽屉）
```

**生成内容（React）**：
```
src/pages/business/project-management/
├── components/
│   ├── detail/
│   │   ├── hooks/
│   │   │   ├── index.ts              # hooks导出
│   │   │   └── useDetailData.ts      # 详情数据获取
│   │   ├── index.tsx                 # 详情页面
│   │   └── index.less
│   └── edit/
│       ├── hooks/
│       │   ├── index.ts              # hooks导出
│       │   └── useEditForm.ts        # 编辑表单逻辑
│       ├── index.tsx                 # 编辑页面
│       └── index.less
├── hooks/
│   └── useTableData.ts
├── types.ts
├── index.less
└── index.tsx                          # 列表主页面
```

---

## 注意事项

### 必须遵守的约束

1. **目录位置限制**：只能在 `src/pages/[模块]/[文件夹]` 或 `src/views/[模块]/[文件夹]` 创建
2. **不修改现有代码**：若目录已存在，递增新建
3. **依赖优先级**：优先使用项目已安装的依赖包
4. **保持一致性**：与项目现有代码风格保持一致
5. **类型安全**：React 和 Vue 3 项目必须使用 TypeScript

### 灵活处理的场景

1. **组件封装程度**：根据页面复杂度决定是否拆分子组件
2. **Hook/Composable**：简单逻辑可直接写在页面，复杂逻辑才提取
3. **样式方案**：根据项目实际情况使用 Less/Scss/CSS Modules
4. **状态管理**：简单页面使用本地状态，复杂业务考虑 Redux/Pinia
5. **详情/编辑形式**：
   - **弹窗/抽屉**（默认）：适用于简单表单（<10字段）、快速编辑
   - **独立页面**（非标）：适用于复杂表单、需要单独URL、多步骤流程

### 代码质量要求

1. **完整性**：包含完整的类型定义、错误处理、加载状态
2. **健壮性**：处理边界情况（空数据、网络错误等）
3. **可维护性**：代码结构清晰，注释充分
4. **性能**：合理使用 memo、computed 等优化手段

---

## 快速参考

### React 关键组件

```typescript
// ProTable 必需配置
<ProTable
  columns={columns}           // 列配置
  request={fetchData}         // 数据请求
  rowKey="id"                 // 行唯一标识
  search={{ labelWidth: 'auto' }}  // 搜索配置
  toolbar={{ actions: [...] }}     // 工具栏
/>

// ModalForm 必需配置
<ModalForm
  title="标题"
  open={visible}
  form={form}
  onFinish={handleSubmit}
/>
```

### Vue 3 关键组件

```vue
<!-- el-table 必需配置 -->
<el-table :data="tableData" @selection-change="handleSelectionChange">
  <el-table-column type="selection" />
  <el-table-column prop="name" label="姓名" />
</el-table>

<!-- el-form 必需配置 -->
<el-form :model="formData" :rules="rules" ref="formRef">
  <el-form-item label="姓名" prop="name">
    <el-input v-model="formData.name" />
  </el-form-item>
</el-form>
```

### Vue 2 关键组件

```vue
<!-- getwayTable 示例 -->
<getway-table
  :data="tableData"
  :columns="columns"
  :pagination="pagination"
  @page-change="handlePageChange"
/>

<!-- el-dialog 配置 -->
<el-dialog :visible.sync="dialogVisible" title="标题">
  <el-form :model="formData" :rules="rules" ref="form">
    <!-- 表单项 -->
  </el-form>
  <div slot="footer">
    <el-button @click="dialogVisible = false">取消</el-button>
    <el-button type="primary" @click="handleSubmit">确定</el-button>
  </div>
</el-dialog>
```

### 非标独立页面必须生成文件总结表

| 技术栈 | 详情页hooks/逻辑文件 | 编辑页hooks/逻辑文件 | 其他必须文件 |
|--------|---------------------|---------------------|-------------|
| **React** | `components/detail/hooks/useDetailData.ts` ✅ | `components/edit/hooks/useEditForm.ts` ✅ | `hooks/index.ts`（导出文件）|
| **Vue 3** | `components/detail/composables/useDetailData.ts` ✅ | `components/edit/composables/useEditForm.ts` ✅ | `composables/index.ts`（导出文件）|
| **Vue 2** | `components/detail/detail.js` ✅ | `components/edit/edit.js` ✅ | 无 |

### TypeScript 类型引入快速参考

**判断规则表**：

| 类型定义位置 | 是否需要 import | 说明 |
|------------|----------------|------|
| `types/global.d.ts` | ❌ 不需要 | 全局声明，自动可用 |
| `typings/index.d.ts` | ❌ 不需要 | TypeScript 自动加载 |
| `@types/xxx` | ❌ 不需要 | npm 包的类型声明 |
| `当前模块/types.ts` | ✅ 需要 | 局部类型，必须引入 |
| `../../shared/types.ts` | ✅ 需要 | 其他模块类型，必须引入 |

### 识别规则总结

| 场景 | 使用模式 |
|------|---------|
| 明确提到"跳转"、"新页面" | 独立页面 |
| 表单字段 > 10个 | 独立页面 |
| 需要多步骤流程 | 独立页面 |
| 需要单独URL/可分享链接 | 独立页面 |
| 明确提到"弹窗"、"抽屉" | 弹窗/抽屉 |
| 简单编辑（<10字段） | 弹窗/抽屉（默认）|
| 未明确说明 | 弹窗/抽屉（默认）|

---

本规范作为 AI 代码生成的通用执行标准，确保生成的代码：
- ✅ 符合项目规范
- ✅ 目录结构正确
- ✅ 依赖引入合理
- ✅ 类型定义完整
- ✅ 代码可维护

严格遵循本规范，确保生成高质量、可用的前端代码。
