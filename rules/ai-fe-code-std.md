# AI 前端代码生成规范库

本文档是 AI 代码生成的执行标准和约束规则。**严格遵循本规范生成代码**。

---

## 📖 执行流程总览

**AI 生成代码时必须按以下流程执行**：

```
0️⃣ 获取组件模板（通过 MCP 工具 codegen-engine 自动获取）
   ↓
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

**⚠️ 关键要求**：
- 第 0 步通过 MCP 工具 `codegen-engine` 自动匹配和获取组件模板
- 第 2 步必须检查全局类型文件，避免重复引入
- 第 4 步生成 hooks 文件必须优先于组件文件
- 第 5-7 步自检修复流程**不得省略**

## 🔧 组件模板获取方式

### 可用模板列表

#### React 模板
- **react-standard-list-crud**: React 标准列表页（ProTable + 搜索 + 新增/编辑弹窗）
- **react-standard-modal-form**: React 标准弹窗表单（ModalForm）
- **react-standard-form-page**: React 标准表单页（独立路由新增/编辑）
- **react-import-list-modal**: React 带列表导入弹窗（Excel 导入 + 异步/同步 + 导入记录列表）
- **react-nonstandard-detail**: React 非标独立详情页（审批流程/附件预览）
- **react-drawer-form**: React 抽屉编辑表单（DrawerForm）
- **react-drawer-detail**: React 抽屉详情（Drawer Detail）
- **react-pc-file-upload**: React PC 文件上传组件（Ant Design Upload + 进度显示 + picture-card 模式）
- **react-virtual-paginated-select**: React 大数据渲染下拉（虚拟列表 + 分页下拉 + 编辑回显）🆕

#### Vue 3 模板
- **vue3-standard-list-crud**: Vue 3 标准列表页（Element Plus + Composition API + 搜索 + 新增/编辑弹窗）
- **vue3-virtual-paginated-select**: Vue 3 大数据渲染下拉（el-table-v2 + 分页下拉 + 编辑回显）🆕

#### Vue 2 模板
- **vue2-standard-list-crud**: Vue 2 标准列表页（Element UI + Options API + 搜索 + 新增/编辑弹窗）
- **vue2-h5-file-upload**: Vue 2 H5 文件上传组件（Vant + 水印 + 多格式预览 + 网格/列表模式）
- **vue2-pc-file-upload**: Vue 2 PC 文件上传组件（Element UI/Plus + 进度显示 + picture-card 模式）
- **vue2-virtual-paginated-select**: Vue 2 大数据渲染下拉（vue-virtual-scroller + 分页下拉 + 编辑回显）🆕

### 使用方式

**方式 1：自动匹配（推荐）**
```
任务标准：ai-fe-code-std.md 为标准执行任务
一句话需求：做一个员工列表页，支持姓名/工号查询，新增编辑弹窗，支持删除和批量导出
```
> 💡 如果配置了 MCP 工具 `codegen-engine`，AI 会自动匹配最合适的模板并获取示例代码

**方式 2：显式指定模板**
```
任务标准：ai-fe-code-std.md 为标准执行任务
使用模板：react-standard-list-crud
一句话需求：...
```

---

## 🚨 核心规则（必读）

### 1. 非标独立页面 hooks/composables 文件强制生成

**适用场景**：当详情页或编辑页是**独立路由页面**（非弹窗/抽屉）时

**强制要求**：
- ⛔ **绝对禁止**省略 hooks/composables 文件
- ⛔ **绝对禁止**将业务逻辑直接写在组件中
- ⛔ hooks 文件必须**第一个**生成，先于组件文件

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

### 4. 代码生成后必须自检和修复（新增）

**⚠️ 所有文件生成完成后，必须执行自检，不得省略！**

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

## ⚠️ 非标独立页面必须生成 hooks/composables 文件（详细说明）

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

**❌ 禁止行为**：
- ⛔ **绝对禁止**：因为"逻辑简单"而跳过 hooks/composables 文件的生成
- ⛔ **绝对禁止**：将数据获取、表单逻辑直接写在组件文件中
- ⛔ **绝对禁止**：先生成组件主文件再生成 hooks 文件
- ⛔ **绝对禁止**：在非标独立页面中省略任何一个必需的 hooks 文件

**✅ 正确做法**：
1. hooks/composables 文件**必须第一个**生成（优先级最高）
2. 即使只有一个 API 调用，也**必须**创建独立的 hooks 文件
3. 所有业务逻辑（数据获取、表单提交、状态管理）必须在 hooks 中实现

详见：[非标独立页面文件生成检查清单](#非标独立页面文件生成检查清单)

---

## 支持的技术栈

- **React PC**: Ant Design Pro Components + TypeScript（**统一使用 Pro**）
- **Vue 3**: Element Plus + Composition API + TypeScript
- **Vue 2**: Element UI + Options API

### 🆕 React PC 统一使用 Pro 组件库

**所有 React PC 模板统一使用 `@ant-design/pro-components`**，包括：
- `ProTable` - 高级表格（替代 antd Table）
- `ModalForm` / `DrawerForm` - 弹窗/抽屉表单
- `ProFormText` / `ProFormSelect` 等 - 表单控件
- `BetaSchemaForm` - 动态 Schema 表单

**依赖检测与安装**：

MCP 工具会自动检测项目是否安装了 Pro 组件库：
- ✅ 已安装：直接生成代码
- ❌ 未安装：提示安装命令，AI Agent 可自动执行安装

```bash
# Pro 组件库安装命令
npm install @ant-design/pro-components --save
```

**为什么统一使用 Pro？**
1. 当前大部分 React 模板已依赖 Pro（ProTable、ModalForm 等）
2. Pro 组件功能更强大，代码更简洁
3. Pro 向下兼容 antd，可以混用
4. 统一技术栈减少维护成本

---

## 用户输入格式

用户通常会提供：

```
任务标准：AI前端代码生成规范库为标准执行任务
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

## 🎨 图片样式还原规范（重要）

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

### 特殊场景处理

#### 场景1：设计稿与 UI 库样式冲突
```less
// ❌ 错误：直接使用 UI 库样式（与设计稿不符）
<el-button type="primary">按钮</el-button>

// ✅ 正确：覆盖 UI 库样式以匹配设计稿
<el-button type="primary" class="custom-primary-btn">按钮</el-button>

.custom-primary-btn {
  height: 36px !important;        // 设计稿高度（非 UI 库默认的 32px）
  padding: 8px 20px !important;   // 设计稿内边距
  border-radius: 6px !important;  // 设计稿圆角（非默认的 4px）
  font-size: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;  // 设计稿渐变
}
```

#### 场景2：设计稿标注不完整
```typescript
/**
 * 当设计稿未标注某些细节时的处理优先级：
 * 1. 参考同类元素（如其他按钮的样式）
 * 2. 参考项目中类似页面
 * 3. 使用行业通用规范（如 8px 栅格系统）
 * 4. 最后才使用 UI 库默认值
 */
```

#### 场景3：图片中的复杂效果
```less
// 卡片悬停效果示例（完整还原设计稿）
.project-card {
  position: relative;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);                      // 上移效果
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);     // 阴影加深
    border-color: #1890ff;                            // 边框变色
    
    .card-title {
      color: #1890ff;                                 // 标题变色
    }
  }
}
```

### 生成代码时的强制要求

1. **创建独立样式文件**：复杂样式必须单独写在 `.less`/`.scss` 文件中
2. **使用CSS变量**：重复使用的颜色、尺寸定义为变量
3. **添加注释**：关键样式添加注释说明（如 `// 设计稿标注：主色 #1890ff`）
4. **响应式适配**：如设计稿有多尺寸，必须使用媒体查询

```less
// styles/variables.less（根据设计稿定义）
@primary-color: #1890ff;        // 主色
@success-color: #52c41a;        // 成功色
@warning-color: #faad14;        // 警告色
@error-color: #f5222d;          // 错误色
@text-color: #333333;           // 主文字色
@text-color-secondary: #666666; // 次要文字色
@border-radius-base: 4px;       // 基础圆角
@box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.08);  // 基础阴影
```

### 验收标准

完成的页面必须达到：
- 🎯 **视觉一致性**：与设计稿对比，视觉效果一致率 ≥ 98%
- 🎯 **像素精确度**：关键元素尺寸误差 ≤ 2px
- 🎯 **色值准确性**：颜色使用设计稿精确色值，无目测配色
- 🎯 **交互完整性**：所有交互状态（hover/active/disabled）都已实现

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

**简化版**：
```
src/views/[业务模块]/[文件夹名称]/
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

#### 标准列表页面（含详情、编辑）

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

**非标独立页面版（详情/编辑为独立路由页面）**：
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

**⚠️ TypeScript 类型引入规则（强制执行）**：

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

declare interface TableItem {
  id: number;
  // ...
}

// ✅ 正确：全局类型直接使用，不引入
// hooks/useTableData.ts
const [data, setData] = useState<TableItem[]>([]);  // ✅ TableItem 是全局类型
const [user, setUser] = useState<UserInfo>();       // ✅ UserInfo 是全局类型

// ❌ 错误：重复引入全局类型
import type { TableItem, UserInfo } from './types';  // ❌ 这些是全局类型！
const [data, setData] = useState<TableItem[]>([]);

// ✅ 正确：仅引入当前模块特有的局部类型
import type { LocalFormData } from './types';  // ✅ LocalFormData 是局部类型
const [formData, setFormData] = useState<LocalFormData>();
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

**Element Plus 引入规则**：
- 检查项目是否配置 `unplugin-auto-import`，若有则无需手动导入组件
- 若无，手动按需引入

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
      <!-- ... -->
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

    <!-- 表格（使用项目封装的 getwayTable） -->
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

## 📋 标准页面模板规则提示词（可直接复制）

> 目的：让用户不需要写复杂提示词，只要一句话 + 必要变量，就能生成标准页面（列表/表单/弹窗）。

### 1) 标准列表页（搜索 + 表格 + 新增/编辑弹窗）提示词模板

```
任务标准：AI前端代码生成执行规范（含vue、规范、完整版）.md 为标准执行任务

一句话需求：<例如：做一个员工列表页，支持姓名/工号查询，新增编辑弹窗，支持删除和批量导出>

页面类型：标准列表页（搜索 + 表格 + 新增/编辑弹窗）

文件夹名称: <kebab-case，例如 employee-list>

接口及数据结构（以文件为主，优先提供接口类型文件路径）：
- 列表接口：<fetchList>
- 新增接口：<createItem>
- 编辑接口：<updateItem>
- 删除接口：<deleteItem>
- 详情接口（可选，用于编辑回显）：<getDetail>

页面需求：
- 搜索表单：按字段类型自动生成（文本模糊/枚举下拉/日期范围等）
- 数据表格：序号列 + 业务列 + 操作列（编辑/删除）
- 编辑弹窗：ModalForm（新增/编辑共用），提交成功刷新表格
- 批量操作（可选）：表格多选 + 批量按钮（明确批量动作）

强制要求（P0）：
- 必须先生成 hooks/composables：表格数据、分页、loading、删除/批量逻辑必须在 hooks 中
- 生成前必须检查全局类型声明（全局类型绝对不 import）
- 生成后必须 TypeScript/ESLint 自检并修复
```

### 2) 标准表单页（独立路由新增/编辑）提示词模板

```
任务标准：AI前端代码生成执行规范（含vue、规范、完整版）.md 为标准执行任务

一句话需求：<例如：做一个员工新增/编辑页面，包含基本信息与入职信息，保存后返回列表>

页面类型：标准表单页（独立路由页面，新增/编辑）

文件夹名称: <kebab-case，例如 employee-edit>

接口及数据结构（以文件为主）：
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

### 3) 标准弹窗表单（ModalForm/对话框）提示词模板

```
任务标准：AI前端代码生成执行规范（含vue、规范、完整版）.md 为标准执行任务

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

### 业务规则处理

**用户输入**：
```
业务规则：
- 白名单默认"否"
- 附件限制5MB
- 交通白名单变更需确认
```

**生成要求**：
1. **默认值**：表单初始化时设置 `trafficWhitelist: false`
2. **文件上传验证**：
   ```typescript
   beforeUpload: (file) => {
     const isLt5M = file.size / 1024 / 1024 < 5;
     if (!isLt5M) message.error('文件大小不能超过 5MB');
     return isLt5M;
   }
   ```
3. **确认弹窗**：
   ```typescript
   Modal.confirm({
     title: '确认变更交通白名单？',
     content: '此操作将影响员工的交通权限',
     onOk: handleSubmit,
   });
   ```

---

## React 前端规范

### 组件模板说明

**可用模板**：

#### 列表类
- **react-standard-list-crud**: 标准列表页（ProTable + 搜索 + 新增/编辑弹窗）

#### 表单类
- **react-standard-modal-form**: 弹窗表单（ModalForm）- 适合 <10个字段
- **react-drawer-form**: 抽屉表单（DrawerForm）- 适合 10-20个字段
- **react-standard-form-page**: 独立表单页（路由页面）- 适合 >20个字段

#### 详情类
- **react-drawer-detail**: 抽屉详情（Drawer）- 快速查看
- **react-nonstandard-detail**: 独立详情页（审批流程/附件预览）

#### 特殊功能
- **react-import-modal**: Excel 导入弹窗（异步/同步 + 导入记录）

**获取方式**：
```bash
# 通过 MCP 工具 codegen-engine 自动匹配和生成
# 在 AI 对话中直接使用规范 + 提示词即可
```

### 表单容器选择规则

**根据字段数量自动选择**：

| 字段数量 | 推荐组件 | 模板ID | 使用场景 |
|---------|---------|--------|---------|
| < 10个 | ModalForm 弹窗 | `react-standard-modal-form` | 快速编辑、简单表单 |
| 10-20个 | DrawerForm 抽屉 | `react-drawer-form` | 中等表单、需要更多空间 |
| > 20个 | 独立表单页 | `react-standard-form-page` | 复杂表单、多步骤表单 |

**判断标准**：
1. **字段少（<10个）**：使用 ModalForm，居中弹窗，快速编辑
2. **字段中等（10-20个）**：使用 DrawerForm，侧边滑出，不完全遮挡列表
3. **字段多（>20个）**：使用独立表单页，需要独立URL，支持前进/后退

### 详情容器选择规则

**根据信息复杂度选择**：

| 信息复杂度 | 推荐组件 | 模板ID | 使用场景 |
|-----------|---------|--------|---------|
| 简单-中等 | Drawer 抽屉 | `react-drawer-detail` | 快速查看、不需要URL |
| 中等-复杂 | 独立详情页 | `react-nonstandard-detail` | 审批流程、附件预览、需要分享 |

**判断标准**：
1. **简单信息查看**：使用 Drawer 抽屉详情，快速查看，不需要独立URL
2. **复杂详情展示**：使用独立详情页，包含审批流程、附件预览、需要分享链接

### 组合使用模式

**模式1：列表 + 弹窗编辑**（简单CRUD）
```
react-standard-list-crud + react-standard-modal-form
适用：字段 < 10个，快速编辑
```

**模式2：列表 + 抽屉详情 + 抽屉编辑**（中等复杂）
```
react-standard-list-crud + react-drawer-detail + react-drawer-form
适用：字段 10-20个，需要查看和编辑
```

**模式3：列表 + 独立详情页 + 独立表单页**（复杂场景）
```
react-standard-list-crud + react-nonstandard-detail + react-standard-form-page
适用：字段 > 20个，审批流程，需要独立URL
```

**模式4：列表 + Excel 导入**（批量导入）
```
react-standard-list-crud + react-import-modal
适用：批量数据导入场景
```

**模式5：表单 + 文件上传**（带附件）
```
react-standard-form-page + react-pc-file-upload
适用：需要上传附件的表单页面
```

### React 文件上传组件配置（react-pc-file-upload）

**适用场景**：
- React + Ant Design PC 端项目
- 需要文件/图片上传功能
- 需要显示上传进度
- 需要 picture-card 卡片式展示

**核心配置**：

```tsx
import React, { useRef } from 'react';
import FileUpload, { FileUploadRef } from '@/components/FileUpload';

const MyForm: React.FC = () => {
  const uploadRef = useRef<FileUploadRef>(null);

  const handleSuccess = (file, response) => {
    console.log('上传成功', file, response);
  };

  const handleSubmit = () => {
    const fileList = uploadRef.current?.getFileList();
    console.log('提交的文件列表', fileList);
  };

  return (
    <>
      <FileUpload
        ref={uploadRef}
        uploadUrl="/api/upload"
        maxCount={5}
        maxSize={10}
        acceptTypes={['image/jpeg', 'image/png', 'application/pdf']}
        uploadTip="支持 jpg、png、pdf 格式，单个文件不超过 10MB"
        listType="picture-card"
        progressColor="#1890ff"
        onSuccess={handleSuccess}
      />
      <button onClick={handleSubmit}>提交</button>
    </>
  );
};
```

**Props 说明**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| uploadUrl | string | '/api/upload' | 上传接口地址 |
| maxCount | number | 5 | 最大上传数量 |
| maxSize | number | 10 | 单文件最大大小（MB） |
| acceptTypes | string[] | ['image/jpeg', 'image/png', 'application/pdf'] | 允许的文件类型（MIME 类型） |
| progressColor | string | '#1890ff' | 进度条颜色 |
| uploadType | string \| number | 82 | 业务类型标识 |
| uploadTip | string | '' | 上传提示文案 |
| uploadBtnText | string | '上传文件' | 上传按钮文案 |
| listType | string | 'picture-card' | 列表展示类型（picture-card/text/picture） |
| disabled | boolean | false | 是否禁用 |
| defaultFileList | UploadFile[] | [] | 初始文件列表 |
| headers | Record<string, string> | {} | 自定义请求头 |
| extraData | Record<string, any> | {} | 额外的上传参数 |

**Events 事件**：

| 事件名 | 参数 | 说明 |
|--------|------|------|
| onSuccess | (file, response) => void | 单个文件上传成功 |
| onRemove | (file) => void | 文件移除 |
| onChange | (fileList) => void | 文件列表变化 |

**暴露的方法（通过 ref）**：

```typescript
// 通过 ref 获取组件实例
const uploadRef = useRef<FileUploadRef>(null);

// 可调用方法
uploadRef.current?.getFileList()      // 获取文件列表
uploadRef.current?.setFileList(list)  // 设置文件列表（用于回显）
uploadRef.current?.clearFileList()    // 清空文件列表
```

**在表单中使用**：

```tsx
import { Form, Button } from 'antd';
import FileUpload from '@/components/FileUpload';

const FormWithUpload: React.FC = () => {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item
        label="附件"
        name="attachments"
        valuePropName="fileList"
        getValueFromEvent={(e) => e}
      >
        <FileUpload
          uploadUrl="/api/upload"
          maxCount={3}
          maxSize={20}
          acceptTypes={[
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/msword',
          ]}
          onChange={(fileList) => form.setFieldValue('attachments', fileList)}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit">提交</Button>
    </Form>
  );
};
```

**依赖要求**：
```json
{
  "antd": ">=4.x 或 >=5.x",
  "axios": "*",
  "@ant-design/icons": "*"
}
```

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
    destroyOnClose: true,      // ⚠️ 必须：关闭时销毁
    maskClosable: false,       // ⚠️ 必须：禁止点击遮罩关闭
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

#### 3. Drawer 抽屉详情配置

```typescript
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

**关键要点**：
- 必须生成 Hooks 文件处理数据获取
- 空值显示 `-`
- 使用 Tag 组件展示状态/类型
- `extra` 中可放置编辑按钮

#### 4. 独立表单页配置

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

### 实际使用示例

#### 示例1：员工管理（简单CRUD）

**需求**：员工列表 + 搜索 + 新增/编辑（姓名、工号、部门、岗位）

**选择**：`react-standard-list-crud` + `react-standard-modal-form`

**提示词**：
```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个员工列表页，支持搜索和新增/编辑弹窗

文件夹名称: employee-list

接口数据结构：{
  "name": "姓名",
  "employeeNo": "工号",
  "department": "部门",
  "position": "岗位"
}

页面需求：
- 搜索表单：姓名、工号、部门
- 数据表格：序号 + 基本信息 + 操作列（编辑/删除）
- 编辑弹窗：ModalForm（4个字段）
```

#### 示例2：项目配置管理（中等复杂）

**需求**：项目列表 + 抽屉查看详情 + 抽屉编辑配置（15个配置项）

**选择**：`react-standard-list-crud` + `react-drawer-detail` + `react-drawer-form`

**提示词**：
```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个项目配置列表页，支持抽屉查看详情和编辑配置

文件夹名称: project-config

页面需求：
- 列表页：搜索 + 表格
- 抽屉详情：查看项目信息，包含编辑按钮
- 抽屉编辑：DrawerForm，宽度 720px，15个配置字段
```

#### 示例3：出差申请单（复杂场景）

**需求**：申请单列表 + 详情页（审批流程/附件） + 编辑页（20+字段）

**选择**：`react-standard-list-crud` + `react-nonstandard-detail` + `react-standard-form-page`

**提示词**：
```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个出差申请单管理，包含列表、审批详情页、新增/编辑页

文件夹名称: travel-apply

页面需求：
- 列表页：搜索 + 表格
- 详情页：独立路由页面，包含审批流程、附件预览
- 编辑页：独立路由页面，20+个字段，多个表单分组
```

---

## Vue 3 前端规范

### 组件模板说明

**可用模板**：
- **Vue 3 标准列表页**：Element Plus + Composition API + 搜索 + 新增/编辑弹窗

**获取方式**：
```bash
# 通过 MCP 工具 codegen-engine 自动匹配和生成
# 在 AI 对话中直接使用规范 + 提示词即可
```

**关键配置要点**：

---

## Vue 2 前端规范

### 组件模板说明

**可用模板**：
- **vue2-standard-list-crud**: Vue 2 标准列表页（Element UI + Options API + 搜索 + 新增/编辑弹窗）
- **vue2-h5-file-upload**: Vue 2 H5 文件上传组件（Vant Uploader + 水印 + 多格式预览）
- **vue2-pc-file-upload**: Vue 2 PC 文件上传组件（Element Upload + 进度显示 + picture-card）

**获取方式**：
```bash
# 通过 MCP 工具 codegen-engine 自动匹配和生成
# 在 AI 对话中直接使用规范 + 提示词即可
```

### 文件上传组件配置要点

#### H5 文件上传组件（vue2-h5-file-upload）

**适用场景**：
- Vue 2 + Vant 移动端项目
- 需要图片/文件上传功能
- 需要添加水印（地理位置、天气、时间、拍摄人）
- 需要支持多种文件格式预览

**核心配置**：

```vue
<template>
  <FileUpload
    :resultItem="fileConfig"
    :maxCount="9"
    :maxSize="10"
    :isSubmit="false"
    displayMode="grid"
    :isShowExampleFile="false"
    :isCamera="false"
    :originalFile="false"
    @updataFileListSuccess="handleUploadSuccess"
    @updataDelFileList="handleDelete"
  />
</template>

<script>
export default {
  data() {
    return {
      fileConfig: {
        fileFormat: '.jpg,.png,.pdf',       // 支持的文件格式
        fileUpperLimit: 10,                 // 单文件大小限制（MB）
        fileTypeCode: 'BUSINESS_FILE',      // 业务类型标识
        uploadList: [],                     // 已上传文件列表
        fileLogList: []                     // 示例文件列表
      }
    }
  },
  methods: {
    handleUploadSuccess(fileList) {
      console.log('上传成功', fileList)
    },
    handleDelete(fileList) {
      console.log('删除后文件列表', fileList)
    }
  }
}
</script>
```

**Props 说明**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| resultItem | Object | - | 文件配置对象（必填） |
| maxCount | Number | 100 | 最大上传数量 |
| maxSize | Number | - | 单文件最大大小（MB，通过 resultItem.fileUpperLimit 设置） |
| multiple | Boolean | true | 是否支持多选 |
| isSubmit | Boolean | true | 是否为提交态（提交态隐藏删除和上传按钮） |
| isShowExampleFile | Boolean | false | 是否显示示例文件 |
| isCamera | Boolean | false | 是否仅相机模式 |
| originalFile | Boolean | false | 是否保留原文件（水印场景下保留原图） |
| previewSize | String | '(width - 80) / 3' | 预览图尺寸 |
| displayMode | String | 'grid' | 展示模式：grid（网格）/list（列表） |

**展示模式说明**：
- **grid（网格模式）**：九宫格预览图展示，适用于图片为主的场景
- **list（列表模式）**：文件列表展示，显示文件名和大小，适用于文档类场景

**水印功能**：
- 图片上传时自动添加水印，包含：项目名称、地理位置（高德地图）、天气信息、当前时间、拍摄人
- 水印通过 html2canvas 生成，数据通过 pinia 管理
- 如需禁用水印，可在 `singleUploadFn` 中跳过水印处理逻辑

**文件预览支持**：
- 图片：jpg/jpeg/png/bmp/gif/webp
- 视频：mp4/mov
- 文档：doc/docx/pdf/ppt/pptx/xls/xlsx 等（新窗口打开）
- DWG：通过 sharecad.org 在线预览（限制 50MB）

**依赖要求**：
```json
{
  "vant": ">=4.0",
  "html2canvas": "*",
  "compressorjs": "*",
  "pinia": "*"
}
```

#### PC 文件上传组件（vue2-pc-file-upload）

**适用场景**：
- Vue 2/3 + Element Plus/Element UI PC 端项目
- 需要文件/图片上传功能
- 需要显示上传进度
- 需要 picture-card 卡片式展示

**核心配置**：

```vue
<template>
  <FileUpload
    uploadUrl="/api/upload"
    :maxCount="5"
    :maxSize="10"
    :acceptTypes="['image/jpeg', 'image/png', 'application/pdf']"
    :uploadType="82"
    uploadTip="支持 jpg、png、pdf 格式，单个文件不超过 10MB"
    uploadBtnText="上传文件"
    listType="picture-card"
    progressColor="#409EFF"
    :disabled="false"
    @success="handleSuccess"
    @remove="handleRemove"
    @change="handleChange"
  />
</template>

<script>
export default {
  methods: {
    handleSuccess(file, response) {
      console.log('上传成功', file, response)
    },
    handleRemove(file) {
      console.log('文件移除', file)
    },
    handleChange(fileList) {
      console.log('文件列表变化', fileList)
    }
  }
}
</script>
```

**Props 说明**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| uploadUrl | String | '/upload/img' | 上传接口地址 |
| maxCount | Number | 5 | 最大上传数量 |
| maxSize | Number | 10 | 单文件最大大小（MB） |
| acceptTypes | Array | ['image/jpeg', 'image/png', 'application/pdf'] | 允许的文件类型（MIME 类型） |
| progressColor | String | '#409EFF' | 进度条颜色 |
| uploadType | String/Number | 82 | 业务类型标识 |
| uploadTip | String | '' | 上传提示文案 |
| uploadBtnText | String | '上传文件' | 上传按钮文案 |
| listType | String | 'picture-card' | 列表展示类型（picture-card/text） |
| disabled | Boolean | false | 是否禁用 |

**Events 事件**：

| 事件名 | 参数 | 说明 |
|--------|------|------|
| success | file, response | 单个文件上传成功 |
| remove | file | 文件移除 |
| change | fileList | 文件列表变化 |

**上传模式说明**：
- **picture-card（卡片模式）**：适用于图片上传场景，显示缩略图
- **text（文本模式）**：适用于文档上传场景，显示文件列表

**文件类型识别**：
- 图片类型：自动展示缩略图
- 视频类型：显示视频图标和"视频"文字
- 文档类型：显示文档图标和文件扩展名

**自定义上传逻辑**：
```javascript
const customUpload = async (options) => {
  const { file, onProgress, onSuccess, onError } = options
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('uploadType', String(uploadType))
  
  try {
    const res = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: getToken('token_op_login_key') || ''
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress({ percent })
      }
    })
    
    if (res.data.code === 200 || res.data.success) {
      onSuccess(res.data.data)
    } else {
      throw new Error(res.data.message || '上传失败')
    }
  } catch (error) {
    onError(error)
  }
}
```

**暴露的方法**：
```javascript
// 通过 ref 获取组件实例
const uploadRef = ref(null)

// 可调用方法
uploadRef.value.getFileList()      // 获取文件列表
uploadRef.value.setFileList(list)  // 设置文件列表
uploadRef.value.clearFileList()    // 清空文件列表
```

**依赖要求**：
```json
{
  "element-plus": "*",  // 或 "element-ui": "*"
  "axios": "*"
}
```

### 文件上传组件使用场景选择

| 场景 | 推荐组件 | 说明 |
|------|---------|------|
| React PC 端图片上传 | react-pc-file-upload（picture-card） | Ant Design 卡片式展示，进度显示 |
| React PC 端文档上传 | react-pc-file-upload（text） | Ant Design 文本列表展示 |
| 移动端图片上传（需水印） | vue2-h5-file-upload | 支持水印、地理位置、天气信息 |
| 移动端文档上传 | vue2-h5-file-upload（list 模式） | 文件列表展示，适合文档类 |
| Vue PC 端图片上传 | vue2-pc-file-upload（picture-card） | Element 卡片式展示，进度显示 |
| Vue PC 端文档上传 | vue2-pc-file-upload（text） | Element 文本列表展示 |
| 需要复杂预览功能 | vue2-h5-file-upload | 支持多种格式在线预览 |
| 需要详细进度展示 | vue2-pc-file-upload / react-pc-file-upload | 实时显示上传进度百分比 |

**关键配置要点**：

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

export const getDetail = (id: string) => {
  return request.get(`/api/detail/${id}`);
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

export const deleteItem = (id: string) => {
  return request({
    url: `/api/delete/${id}`,
    method: 'delete',
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

#### React Hooks 使用规范

```typescript
// ✅ 正确：Hooks 在组件顶层调用
const MyComponent = () => {
  const [state, setState] = useState(0);
  const data = useMemo(() => computeData(state), [state]);
  
  useEffect(() => {
    // 副作用逻辑
  }, []);

  return <div>{data}</div>;
};

// ❌ 错误：条件调用 Hooks
const MyComponent = () => {
  if (condition) {
    const [state, setState] = useState(0); // 错误！
  }
};
```

#### Vue Composition API 使用规范

```typescript
// ✅ 正确：在 setup 中使用
const MyComponent = defineComponent({
  setup() {
    const state = ref(0);
    const computedValue = computed(() => state.value * 2);
    
    onMounted(() => {
      // 生命周期逻辑
    });

    return { state, computedValue };
  },
});

// ✅ 更推荐：使用 <script setup>
<script setup lang="ts">
const state = ref(0);
const computedValue = computed(() => state.value * 2);

onMounted(() => {
  // 生命周期逻辑
});
</script>
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

## 参考项目组件

在生成代码前，优先扫描项目中已有的封装组件：

### 常见封装组件类型

#### 表单组件
- `formInput` - 输入框
- `formSelect` - 下拉选择
- `formDatePicker` - 日期选择器
- `formCascader` - 级联选择器
- `formUpload` - 文件上传
- `formCustom` - 自定义表单组件

#### 表格组件
- `getwayTable` - 基础表格（Vue 2常见）
- `ProTable` - 高级表格（React）
- `TablePage` - 表格页面（Vue 3项目封装）
- `virtualTable` - 虚拟滚动表格

#### 弹窗组件
- `getwayDialog` - 基础弹窗（Vue 2）
- `ModalForm` - 表单弹窗（React）
- `DrawerForm` - 抽屉表单（React）

#### 业务组件
- `PageElementAuth` - 页面权限控制
- `DownloadTemplate` - 下载模板
- 其他业务特定组件

### 组件使用规则

1. **优先使用项目封装组件**：检查 `src/components` 目录
2. **保持一致性**：参考同项目中现有页面的写法
3. **按需引入**：避免全局引入大型组件库
4. **类型定义**：为封装组件补充 TypeScript 类型

---

## 执行流程

当接收到用户需求时，按以下步骤执行：

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

**示例判断流程**：
```typescript
// 假设检查到 types/global.d.ts 文件内容：
declare interface UserInfo {
  id: string;
  name: string;
}

declare interface TableItem {
  id: number;
  name: string;
}

declare interface ProjectItem {
  id: string;
  projectName: string;
}

// ✅ 记录全局类型列表：['UserInfo', 'TableItem', 'ProjectItem']

// 生成代码时的判断：
// ❌ 错误示例：重复引入全局类型
import type { UserInfo, TableItem } from './types';  // ❌ 这些在全局类型列表中！

// ✅ 正确示例：只引入局部类型
// 假设 types.ts 中定义了：export interface SearchForm { ... }
import type { SearchForm } from './types';  // ✅ SearchForm 不在全局类型列表中，可以引入

// ✅ 正确示例：第三方库类型必须引入
import type { ProColumns, ActionType } from '@ant-design/pro-components';  // ✅ 第三方库类型
import type { FormInstance } from 'element-plus';  // ✅ 第三方库类型
```

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

### 4. 生成代码（必须先完成全局类型检查）

**⚠️ 生成任何文件之前，必须先执行类型检查**：
```bash
# 第一步：检查全局类型文件是否存在
types/global.d.ts 或 typings/index.d.ts 等

# 第二步：读取并记录全局类型列表
记录所有 declare interface/type 的名称

# 第三步：生成代码时严格遵守
- 全局类型：不引入（直接使用）
- 局部类型：从 ./types 引入
- 第三方库类型：从对应包引入
```

#### 标准弹窗模式 - 按顺序生成（每个文件生成前都要检查类型）：
1. **types.ts** - 类型定义文件（如果需要局部类型）
2. **hooks/useTableData.ts** 或 **composables/useTableData.ts** - 业务逻辑
   - ⚠️ 生成前检查：该文件需要的类型是否在全局类型列表中
   - ✅ 如果在：不引入，直接使用
   - ✅ 如果不在：从 `../types` 引入
3. **components/EditModal.tsx** 或 **EditDialog.vue** - 子组件
   - ⚠️ 同样需要检查类型是否全局声明
4. **index.tsx** 或 **index.vue** - 主文件
   - ⚠️ 同样需要检查类型是否全局声明
5. **index.less** - 样式文件

#### 非标独立页面模式 - **严格按以下顺序逐一生成（强制执行）**：

**详情页（detail）必须生成的文件（按顺序）**：
1. ⛔ **第一步（强制）**：`components/detail/hooks/useDetailData.ts` （React/Vue3）或 `components/detail/composables/useDetailData.ts`（Vue3）或 `components/detail/detail.js`（Vue2）
   - 这是**最高优先级文件**，任何情况下都**不允许省略**
   - 即使只有一个 `fetch` 调用，也**必须**写在这个文件中
   - 该文件**必须先于**组件主文件生成
   - ⚠️ **生成前必须检查**：该文件需要的类型（如 `ProjectItem`）是否在全局类型列表中
     - 如果在 `types/global.d.ts` 中：**不引入**，直接使用
     - 如果不在：从 `../../types` 引入
2. **第二步（推荐）**：`components/detail/hooks/index.ts` - hooks导出文件
3. **第三步**：`components/detail/index.tsx` 或 `index.vue` - 详情页主组件
   - ⚠️ **同样需要检查类型是否全局声明**
4. **第四步**：`components/detail/index.less` - 详情页样式

**编辑页（edit）必须生成的文件（按顺序）**：
1. ⛔ **第一步（强制）**：`components/edit/hooks/useEditForm.ts` （React/Vue3）或 `components/edit/composables/useEditForm.ts`（Vue3）或 `components/edit/edit.js`（Vue2）
   - 这是**最高优先级文件**，任何情况下都**不允许省略**
   - 表单逻辑（获取数据、提交、验证）**必须全部**写在这个文件中
   - 该文件**必须先于**组件主文件生成
   - ⚠️ **生成前必须检查**：该文件需要的类型（如 `ProjectItem`）是否在全局类型列表中
     - 如果在 `types/global.d.ts` 中：**不引入**，直接使用
     - 如果不在：从 `../../types` 引入
2. **第二步（推荐）**：`components/edit/hooks/index.ts` - hooks导出文件
3. **第三步**：`components/edit/index.tsx` 或 `index.vue` - 编辑页主组件
   - ⚠️ **同样需要检查类型是否全局声明**
4. **第四步**：`components/edit/index.less` - 编辑页样式

**⚠️ 绝对禁止的行为（违反将导致生成失败）**：
- ⛔ **禁止跳过 hooks/composables 文件**：无论逻辑多简单，都**必须**创建
- ⛔ **禁止将业务逻辑写在组件中**：数据获取、状态管理必须在 hooks 中实现
- ⛔ **禁止先生成组件再补充 hooks**：必须严格按照 hooks → 组件的顺序
- ⛔ **禁止合并 hooks 文件**：detail 和 edit 的 hooks 必须分开，不能共用

**✅ 正确的生成示例**：

```typescript
// ✅ 步骤1：先生成 components/detail/hooks/useDetailData.ts
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getProjectDetail } from '@/services/project';

export const useDetailData = (id?: string) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getProjectDetail(id);
        setData(res.data);
      } catch (error) {
        message.error('获取详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, loading };
};

// ✅ 步骤2：再生成 components/detail/index.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useDetailData } from './hooks/useDetailData';  // 引入已生成的 hook

const Detail: React.FC = () => {
  const { id } = useParams();
  const { data, loading } = useDetailData(id);  // 使用 hook

  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
};
```

**❌ 错误的生成示例**：

```typescript
// ❌ 错误：直接在组件中写业务逻辑，没有创建 hooks 文件
const Detail: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ❌ 业务逻辑不应该直接写在组件中
    const fetchData = async () => {
      setLoading(true);
      const res = await getProjectDetail(id);
      setData(res.data);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  return <div>{/* ... */}</div>;
};
```

**强制执行机制**：
- AI 在生成非标独立页面时，必须首先输出 hooks 文件的完整代码
- 组件文件中**不允许**出现 `useEffect` + API 调用的组合（必须通过 hooks）
- 生成完成后，必须验证 hooks 文件是否存在且包含业务逻辑

### 5. 代码自检和修复流程（强制执行）

**⚠️ 所有文件生成完成后，必须执行以下自检流程，不得省略！**

#### 5.1 自动检查清单（按顺序执行）

**第一步：TypeScript 类型检查**
```bash
# 1. 检查是否有类型错误
- 读取所有生成的 .ts/.tsx/.vue 文件
- 检查是否有重复引入全局类型
- 检查是否缺少必要的类型引入
```

**常见类型错误及修复**：

| 错误类型 | 错误示例 | 正确写法 |
|---------|---------|---------|
| ❌ 重复引入全局类型 | `import type { ProjectItem } from './types'`<br/>（ProjectItem 在 global.d.ts 中） | 删除该引入，直接使用 `ProjectItem` |
| ❌ 缺少第三方库类型引入 | `const columns: ProColumns[] = []`<br/>（未引入 ProColumns） | `import type { ProColumns } from '@ant-design/pro-components'` |
| ❌ 局部类型未引入 | 使用了 `types.ts` 中的类型但未引入 | `import type { FormData } from './types'` |
| ❌ any 类型滥用 | `const data: any = []` | 使用明确的类型：`const data: ProjectItem[] = []` |

**第二步：ESLint 规则检查**
```bash
# 2. 检查常见 ESLint 错误
- 未使用的导入
- 未使用的变量
- console.log 残留
- debugger 残留
```

**常见 ESLint 错误及修复**：

```typescript
// ❌ 错误：导入了但未使用
import { Button, Form, Input, message } from 'antd';  // Input 未使用
// ✅ 修复：删除未使用的导入
import { Button, Form, message } from 'antd';

// ❌ 错误：变量定义但未使用
const [visible, setVisible] = useState(false);  // visible 从未读取
// ✅ 修复：删除未使用的变量或使用 _ 前缀
const [, setVisible] = useState(false);

// ❌ 错误：残留调试代码
console.log('debug:', data);
debugger;
// ✅ 修复：删除所有调试代码
```

**第三步：代码规范检查**
```bash
# 3. 检查是否符合项目规范
- hooks 文件是否存在且优先生成
- 业务逻辑是否正确分离
- 组件是否过度耦合
```

**代码规范检查项**：

✅ **必须通过的检查**：
- [ ] hooks/composables 文件已生成（非标独立页面）
- [ ] 组件文件中没有直接的 API 调用
- [ ] 没有在组件中直接使用 `useEffect` + `fetch` 组合
- [ ] 所有业务逻辑都在 hooks 中
- [ ] 类型引入符合全局类型规则

❌ **禁止出现的模式**：
```typescript
// ❌ 禁止：组件中直接调用 API
const MyComponent = () => {
  useEffect(() => {
    fetch('/api/data').then(...)  // ❌ 应该在 hooks 中
  }, []);
}

// ❌ 禁止：重复引入全局类型
import type { UserInfo } from './types';  // ❌ UserInfo 在 global.d.ts 中

// ❌ 禁止：使用 any 类型
const handleSubmit = (values: any) => { ... }  // ❌ 应该定义明确类型
```

**第四步：功能完整性检查**
```bash
# 4. 检查功能是否完整实现
- 用户要求的所有功能是否都已实现
- 是否遗漏了必要的字段
- 是否添加了必要的验证规则
```

**功能完整性检查清单**：
- [ ] 所有用户要求的字段都已添加
- [ ] 所有业务规则都已实现（如：默认值、验证规则）
- [ ] 表格的增删改查功能完整
- [ ] 错误提示和成功提示完整
- [ ] 加载状态处理完整

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

**修复示例**：

```typescript
// 【修复前】存在多个问题
import type { ProjectItem } from './types';  // ❌ 全局类型重复引入
import { Button, Form, Input } from 'antd';  // ❌ Input 未使用

const Detail: React.FC = () => {
  const [data, setData] = useState<any>();  // ❌ 使用 any
  
  useEffect(() => {
    console.log('fetching...');  // ❌ 残留 console
    fetch('/api/detail').then(res => {  // ❌ 组件中直接调用 API
      setData(res.data);
    });
  }, []);
  
  return <div>{data?.name}</div>;
};

// 【修复后】所有问题已解决
import { Button, Form } from 'antd';  // ✅ 删除未使用的 Input
import { useDetailData } from './hooks/useDetailData';  // ✅ 使用 hooks

const Detail: React.FC = () => {
  const { data, loading } = useDetailData();  // ✅ 从 hooks 获取数据，明确类型
  
  return (
    <div>
      {loading ? '加载中...' : data?.name}
    </div>
  );
};
```

#### 5.3 自检完成确认

**生成以下自检报告**：

```markdown
## 代码生成自检报告

### ✅ 检查通过项
- [x] TypeScript 类型检查通过
- [x] 无 ESLint 错误
- [x] hooks 文件已生成且符合规范
- [x] 类型引入符合全局类型规则
- [x] 功能完整实现

### ⚠️ 已修复问题
- 修复了 3 处全局类型重复引入
- 删除了 5 个未使用的导入
- 移除了 2 处 console.log

### 📋 生成文件清单
1. components/detail/hooks/useDetailData.ts ✅
2. components/detail/index.tsx ✅
3. components/detail/index.less ✅
4. types.ts ✅

### ✅ 代码质量确认
- 无语法错误
- 无类型错误
- 符合项目规范
- 功能完整
```

### 6. 适配业务规则

根据用户提供的业务规则添加：
- 默认值设置
- 表单验证规则
- 文件上传限制
- 确认弹窗
- 权限控制

### 7. 执行自检和修复（必须执行）

**⚠️ 这是最后一步，也是最关键的一步，绝对不能省略！**

#### 7.1 执行自检

**按以下顺序检查所有已生成的文件**：

```bash
# 1. 列出所有生成的文件
- index.tsx / index.vue
- hooks/useTableData.ts
- components/EditModal.tsx
- types.ts
- index.less

# 2. 逐个文件检查
对每个 .ts/.tsx/.vue 文件执行：
  ✓ TypeScript 类型检查
  ✓ ESLint 规则检查
  ✓ 代码规范检查
  ✓ 功能完整性检查
```

**使用自检清单**：

| 检查项 | 检查内容 | 通过标准 |
|--------|---------|----------|
| ✅ 类型引入 | 是否有重复引入全局类型 | 全局类型不应该被 import |
| ✅ 类型引入 | 第三方库类型是否正确引入 | ProColumns、FormInstance 等必须引入 |
| ✅ 未使用导入 | 是否有未使用的 import | 删除所有未使用的导入 |
| ✅ 未使用变量 | 是否有定义但未使用的变量 | 删除或使用 _ 前缀 |
| ✅ 调试代码 | 是否有 console.log/debugger | 必须全部删除 |
| ✅ hooks 文件 | 非标页面是否生成了 hooks | detail/edit 必须有对应 hooks |
| ✅ 业务逻辑 | 组件中是否直接调用 API | 必须通过 hooks 调用 |
| ✅ any 类型 | 是否滥用 any 类型 | 应使用明确的类型定义 |

#### 7.2 自动修复错误

**发现错误后，立即修复**：

```typescript
// 示例：检查发现以下问题

// ❌ 问题1: 重复引入全局类型
import type { ProjectItem } from './types';  // ProjectItem 在 global.d.ts 中

// ✅ 修复：删除该行引入

// ❌ 问题2: 未使用的导入
import { Button, Form, Input, message } from 'antd';  // Input 未使用

// ✅ 修复：删除 Input
import { Button, Form, message } from 'antd';

// ❌ 问题3: 残留调试代码
console.log('debug data:', data);

// ✅ 修复：删除该行

// ❌ 问题4: 组件中直接调用 API
useEffect(() => {
  fetch('/api/detail').then(res => setData(res.data));
}, []);

// ✅ 修复：移至 hooks 文件中
const { data, loading } = useDetailData();
```

#### 7.3 生成自检报告

**所有检查和修复完成后，输出以下报告**：

```markdown
## 🎯 代码生成自检报告

### ✅ 检查通过项
- [x] TypeScript 类型检查通过 - 无类型错误
- [x] ESLint 规则检查通过 - 无警告和错误
- [x] hooks/composables 文件已正确生成
- [x] 类型引入符合全局类型规则
- [x] 业务逻辑正确分离（组件 + hooks）
- [x] 功能完整实现

### ⚠️ 已修复问题（共 N 个）
1. ✅ 修复了 3 处全局类型重复引入
   - 文件：hooks/useTableData.ts
   - 删除：import type { ProjectItem } from './types'
   
2. ✅ 删除了 5 个未使用的导入
   - 文件：index.tsx
   - 删除：Input, Select 等
   
3. ✅ 移除了 2 处 console.log
   - 文件：components/EditModal.tsx

### 📋 生成文件清单（共 N 个文件）
1. ✅ src/pages/project-list/index.tsx
2. ✅ src/pages/project-list/hooks/useTableData.ts
3. ✅ src/pages/project-list/components/EditModal.tsx
4. ✅ src/pages/project-list/types.ts
5. ✅ src/pages/project-list/index.less

### ✅ 代码质量确认
- ✅ 无语法错误
- ✅ 无 TypeScript 类型错误
- ✅ 符合项目代码规范
- ✅ 所有用户要求的功能已实现
- ✅ 已通过所有自检项

### 🚀 可以直接使用
所有文件已生成并通过质量检查，可以直接在项目中使用。
```

**⚠️ 重要提醒**：
- 如果自检发现**任何 P0 级别错误**（类型错误、语法错误、缺少 hooks），必须**立即修复**
- 修复后**重新执行自检**，确保所有问题都已解决
- 只有**所有检查项都通过**，才能输出最终的自检报告

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

### 场景2：带批量操作的列表页

**用户输入**：
```
文件夹名称: whitelist-management
接口数据结构：{ ... }
页面需求：
  - 搜索表单
  - 表格（支持多选）
  - 批量推送到滴滴系统
  - 批量推送商旅系统
  - 编辑弹窗（修改白名单状态 + 文件上传）
业务规则：
  - 附件限制5MB
  - 白名单默认"否"
```

**生成内容**：
```
src/pages/system/whitelist-management/
├── components/
│   ├── EditModal.tsx        # 编辑弹窗（含文件上传）
│   └── BatchActions.tsx     # 批量操作组件（可选）
├── hooks/
│   ├── useTableData.ts      # 表格数据
│   └── useBatchPush.ts      # 批量推送逻辑
├── types.ts
├── index.less
└── index.tsx                 # 主页面（含批量按钮）
```

**关键代码**：
```typescript
// 批量推送按钮
<Button
  disabled={selectedRows.length === 0}
  onClick={handleBatchPushDidi}
>
  推送到滴滴系统
</Button>

// 文件上传限制
beforeUpload={(file) => {
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) message.error('文件大小不能超过 5MB');
  return isLt5M;
}}

// 白名单默认值
const [formData, setFormData] = useState({
  trafficWhitelist: false,  // 默认"否"
  accommodationWhitelist: false,
  approvalWhitelist: false,
});
```

### 场景3：非标独立详情/编辑页面

**用户输入**：
```
文件夹名称: project-management
接口数据结构：{
  "projectName": "项目名称",
  "projectCode": "项目编号",
  "budget": "预算",
  "startDate": "开始日期",
  "endDate": "结束日期",
  "members": "项目成员",
  "description": "项目描述",
  "attachments": "附件"
}
页面需求：
  - 列表页：搜索 + 表格
  - 点击"查看"跳转到新页面显示详情（非弹窗）
  - 点击"编辑"跳转到新页面编辑（非抽屉）
```

**生成内容**（React）：
```
src/pages/business/project-management/
├── components/
│   ├── detail/
│   │   ├── hooks/
│   │   │   ├── index.ts              # ✅ hooks导出文件
│   │   │   └── useDetailData.ts      # ✅ 必须生成：详情数据获取
│   │   ├── index.tsx                 # 详情页面
│   │   └── index.less
│   └── edit/
│       ├── hooks/
│       │   ├── index.ts              # ✅ hooks导出文件
│       │   └── useEditForm.ts        # ✅ 必须生成：编辑表单逻辑
│       ├── index.tsx                 # 编辑页面
│       └── index.less
├── hooks/
│   └── useTableData.ts
├── types.ts
├── index.less
└── index.tsx                          # 列表主页面
```

**关键代码**：

**列表页（index.tsx）**：
```typescript
import { useNavigate } from 'react-router-dom';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();

  const columns: ProColumns<ProjectItem>[] = [
    // ...其他列
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a key="detail" onClick={() => navigate(`/business/project-management/detail/${record.id}`)}>
          查看
        </a>,
        <a key="edit" onClick={() => navigate(`/business/project-management/edit/${record.id}`)}>
          编辑
        </a>,
      ],
    },
  ];

  return <ProTable columns={columns} {...otherProps} />;
};
```

**详情页Hook（components/detail/hooks/useProjectDetail.ts）**：
```typescript
// ⚠️ 生成前必须检查：先查看项目 types/global.d.ts，确认 ProjectItem 是否已全局声明
// 如果 ProjectItem 在 global.d.ts 中已声明，则绝对不要引入！

import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getProjectDetail } from '@/services/project';
// import type { ProjectItem } from '../../types';  // ⚠️ 仅当 ProjectItem 未在 global.d.ts 中声明时才取消注释

export const useProjectDetail = (id?: string) => {
  const [data, setData] = useState<ProjectItem>();  // ProjectItem 应该在 global.d.ts 中声明
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getProjectDetail(id);
        setData(res.data);
      } catch (error) {
        message.error('获取详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return { data, loading };
};
```

**详情页（components/detail/index.tsx）**：
```typescript
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin } from 'antd';
import { useProjectDetail } from './hooks/useProjectDetail';
import './index.less';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading } = useProjectDetail(id);

  return (
    <div className="project-detail-page">
      <Card
        title="项目详情"
        extra={
          <>
            <Button onClick={() => navigate(-1)}>返回</Button>
            <Button type="primary" onClick={() => navigate(`/business/project-management/edit/${id}`)}>
              编辑
            </Button>
          </>
        }
      >
        <Spin spinning={loading}>
          <Descriptions column={2}>
            <Descriptions.Item label="项目名称">{data?.projectName}</Descriptions.Item>
            <Descriptions.Item label="项目编号">{data?.projectCode}</Descriptions.Item>
            <Descriptions.Item label="预算">{data?.budget}</Descriptions.Item>
            <Descriptions.Item label="开始日期">{data?.startDate}</Descriptions.Item>
            {/* 更多字段... */}
          </Descriptions>
        </Spin>
      </Card>
    </div>
  );
};

export default ProjectDetail;
```

**编辑页Hook（components/edit/hooks/useProjectEdit.ts）**：
```typescript
// ⚠️ 生成前必须检查：先查看项目 types/global.d.ts，确认 ProjectItem 是否已全局声明
// 如果 ProjectItem 在 global.d.ts 中已声明，则绝对不要引入！

import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getProjectDetail, createProject, updateProject } from '@/services/project';
// import type { ProjectItem } from '../../types';  // ⚠️ 仅当 ProjectItem 未在 global.d.ts 中声明时才取消注释

export const useProjectEdit = (id?: string) => {
  const [data, setData] = useState<ProjectItem>();  // ProjectItem 应该在 global.d.ts 中声明
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getProjectDetail(id);
        setData(res.data);
      } catch (error) {
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const saveData = async (values: any) => {
    if (id) {
      return await updateProject(id, values);
    } else {
      return await createProject(values);
    }
  };

  return { data, loading, saveData };
};
```

**编辑页（components/edit/index.tsx）**：
```typescript
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, DatePicker, Button, message } from 'antd';
import { useProjectEdit } from './hooks/useProjectEdit';
import './index.less';

const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data, loading, saveData } = useProjectEdit(id);

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data]);

  const handleSubmit = async (values: any) => {
    try {
      await saveData(values);
      message.success('保存成功');
      navigate(-1);
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <div className="project-edit-page">
      <Card title={id ? '编辑项目' : '新增项目'} loading={loading}>
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} onFinish={handleSubmit}>
          <Form.Item label="项目名称" name="projectName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="项目编号" name="projectCode" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="预算" name="budget">
            <Input />
          </Form.Item>
          {/* 更多表单项... */}
          
          <Form.Item wrapperCol={{ offset: 6 }}>
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProjectEdit;
```

**路由配置**：
```typescript
{
  path: '/business/project-management',
  children: [
    { path: '', element: <ProjectList /> },                    // 列表
    { path: 'detail/:id', element: <ProjectDetail /> },        // 详情
    { path: 'edit/:id?', element: <ProjectEdit /> },           // 编辑（id可选）
  ],
}
```

**Vue 3 版本 - 详情页Composable（components/detail/composables/useDetailData.ts）**：
```typescript
// ⚠️ 生成前必须检查：先查看项目 types/global.d.ts，确认 ProjectItem 是否已全局声明
// 如果 ProjectItem 在 global.d.ts 中已声明，则绝对不要引入！

import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getProjectDetail } from '@/api/project';
// import type { ProjectItem } from '../../types';  // ⚠️ 仅当 ProjectItem 未在 global.d.ts 中声明时才取消注释

export const useProjectDetail = (id: string) => {
  const data = ref<ProjectItem>();  // ProjectItem 应该在 global.d.ts 中声明
  const loading = ref(false);

  const fetchDetail = async () => {
    if (!id) return;
    
    loading.value = true;
    try {
      const res = await getProjectDetail(id);
      data.value = res.data;
    } catch (error) {
      ElMessage.error('获取详情失败');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchDetail();
  });

  return { data, loading, fetchDetail };
};
```

**Vue 3 版本 - 详情页（components/detail/index.vue）**：
```vue
<template>
  <div class="project-detail-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目详情</span>
          <div>
            <el-button @click="router.back()">返回</el-button>
            <el-button type="primary" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>
      
      <el-descriptions :column="2" v-loading="loading">
        <el-descriptions-item label="项目名称">{{ data?.projectName }}</el-descriptions-item>
        <el-descriptions-item label="项目编号">{{ data?.projectCode }}</el-descriptions-item>
        <el-descriptions-item label="预算">{{ data?.budget }}</el-descriptions-item>
        <!-- 更多字段... -->
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useProjectDetail } from './composables/useProjectDetail';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const { data, loading } = useProjectDetail(id);

const handleEdit = () => {
  router.push(`/business/project-management/edit/${id}`);
};
</script>
```

**Vue 3 版本 - 编辑页Composable（components/edit/composables/useEditForm.ts）**：
```typescript
// ⚠️ 生成前必须检查：先查看项目 types/global.d.ts，确认 ProjectItem 是否已全局声明
// 如果 ProjectItem 在 global.d.ts 中已声明，则绝对不要引入！

import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getProjectDetail, createProject, updateProject } from '@/api/project';
// import type { ProjectItem } from '../../types';  // ⚠️ 仅当 ProjectItem 未在 global.d.ts 中声明时才取消注释

export const useProjectEdit = (id?: string) => {
  const data = ref<ProjectItem>();  // ProjectItem 应该在 global.d.ts 中声明
  const loading = ref(false);

  const fetchDetail = async () => {
    if (!id) return;

    loading.value = true;
    try {
      const res = await getProjectDetail(id);
      data.value = res.data;
    } catch (error) {
      ElMessage.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  const saveData = async (values: any) => {
    if (id) {
      return await updateProject(id, values);
    } else {
      return await createProject(values);
    }
  };

  onMounted(() => {
    fetchDetail();
  });

  return { data, loading, saveData };
};
```

**Vue 3 版本 - 编辑页（components/edit/index.vue）**：
```vue
<template>
  <div class="project-edit-page">
    <el-card :title="id ? '编辑项目' : '新增项目'" v-loading="loading">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="formData.projectName" />
        </el-form-item>
        <el-form-item label="项目编号" prop="projectCode">
          <el-input v-model="formData.projectCode" />
        </el-form-item>
        <el-form-item label="预算" prop="budget">
          <el-input v-model="formData.budget" />
        </el-form-item>
        <!-- 更多表单项... -->

        <el-form-item>
          <el-button @click="router.back()">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// ⚠️ 生成前必须检查：FormInstance/FormRules 是 element-plus 的类型，必须引入

import { ref, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';  // ✅ 第三方库类型必须引入
import { ElMessage } from 'element-plus';
import { useProjectEdit } from './composables/useProjectEdit';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const { data, loading, saveData } = useProjectEdit(id);

const formData = reactive({
  projectName: '',
  projectCode: '',
  budget: '',
});

const rules: FormRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  projectCode: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
};

watch(data, (newData) => {
  if (newData) {
    Object.assign(formData, newData);
  }
});

const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  submitLoading.value = true;
  try {
    await saveData(formData);
    ElMessage.success('保存成功');
    router.back();
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    submitLoading.value = false;
  }
};
</script>
```

### 场景4：参考现有页面

**用户输入**：
```
参考 src/pages/user/user-list，创建角色管理列表页
文件夹名称: role-list
接口数据结构：{ "roleName": "角色名称", "roleCode": "角色编码" }
```

**执行步骤**：
1. 读取 `src/pages/user/user-list` 的代码结构
2. 识别项目使用的组件（ProTable、自定义Hook等）
3. 复用相同的代码风格和组件
4. 替换字段为角色相关字段

### 场景5：Vue 2 H5 文件上传（含水印）

**用户输入**：
```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个移动端现场拍照上传组件，需要自动添加水印（包含地理位置、天气、时间、拍摄人）

技术栈：Vue 2 + Vant
组件类型：文件上传组件
使用模板：vue2-h5-file-upload

功能要求：
- 支持拍照和相册选择
- 图片自动添加水印（地理位置、天气、拍摄人、时间）
- 支持最多 9 张图片
- 单张图片不超过 10MB
- 网格模式展示（九宫格）
- 支持预览和删除
```

**生成内容**：
```
src/components/FileUpload/
├── index.vue          # 主组件
├── waterMark.vue      # 水印组件
└── loadIcon.js        # 文件图标映射
```

**关键配置**：
```vue
<template>
  <FileUpload
    :resultItem="fileConfig"
    :maxCount="9"
    :isSubmit="false"
    displayMode="grid"
    :originalFile="true"
    @updataFileListSuccess="handleUploadSuccess"
  />
</template>

<script>
export default {
  data() {
    return {
      fileConfig: {
        fileFormat: '.jpg,.png',
        fileUpperLimit: 10,
        fileTypeCode: 'SITE_PHOTO',
        uploadList: [],
        fileLogList: []
      }
    }
  },
  methods: {
    handleUploadSuccess(fileList) {
      this.$message.success('上传成功')
      // 处理上传成功后的逻辑
    }
  }
}
</script>
```

**水印功能说明**：
- 自动获取地理位置（高德地图 API）
- 自动获取当前天气信息
- 自动添加拍摄时间和拍摄人
- 通过 html2canvas 生成带水印的图片
- 支持保留原图（originalFile: true）

### 场景6：Vue 2 PC 文件上传（多格式）

**用户输入**：
```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个 PC 端文件上传组件，支持图片、PDF、Word 文档上传，显示上传进度

技术栈：Vue 2 + Element UI
组件类型：文件上传组件
使用模板：vue2-pc-file-upload

功能要求：
- 支持多种格式：jpg、png、pdf、doc、docx
- 最多上传 5 个文件
- 单文件不超过 10MB
- picture-card 卡片式展示
- 显示实时上传进度
- 支持预览和删除
```

**生成内容**：
```
src/components/FileUpload/
├── index.vue          # 主组件
└── types.ts           # 类型定义（可选）
```

**关键配置**：
```vue
<template>
  <FileUpload
    uploadUrl="/api/upload"
    :maxCount="5"
    :maxSize="10"
    :acceptTypes="[
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]"
    :uploadType="82"
    uploadTip="支持 jpg、png、pdf、doc、docx 格式，单个文件不超过 10MB"
    listType="picture-card"
    progressColor="#409EFF"
    @success="handleSuccess"
    @change="handleChange"
  />
</template>

<script>
export default {
  methods: {
    handleSuccess(file, response) {
      this.$message.success('上传成功')
      console.log('上传结果', response)
    },
    handleChange(fileList) {
      console.log('当前文件列表', fileList)
      // 可以将 fileList 保存到表单数据中
      this.formData.attachments = fileList
    }
  }
}
</script>
```

**进度显示说明**：
- 上传过程中自动显示进度条
- 进度条颜色可自定义（progressColor）
- 上传完成后自动隐藏进度条
- 上传失败自动移除失败文件

**文件类型识别**：
- 图片文件：显示缩略图
- 视频文件：显示视频图标
- 文档文件：显示文档图标和扩展名

### 场景7：移动端文档上传（列表模式）

**用户输入**：
```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个移动端文档上传组件，支持 PDF、Word、Excel 文档上传，以列表形式展示

技术栈：Vue 2 + Vant
组件类型：文件上传组件
使用模板：vue2-h5-file-upload

功能要求：
- 支持多种文档格式：pdf、doc、docx、xls、xlsx
- 最多上传 10 个文件
- 单文件不超过 20MB
- 列表模式展示（显示文件名和大小）
- 支持预览和删除
- 不需要水印功能
```

**生成内容**：
使用 vue2-h5-file-upload 组件，配置为 list 模式

**关键配置**：
```vue
<template>
  <FileUpload
    :resultItem="fileConfig"
    :maxCount="10"
    :isSubmit="false"
    displayMode="list"
    @updataFileListSuccess="handleUploadSuccess"
  />
</template>

<script>
export default {
  data() {
    return {
      fileConfig: {
        fileFormat: '.pdf,.doc,.docx,.xls,.xlsx',
        fileUpperLimit: 20,
        fileTypeCode: 'BUSINESS_DOC',
        uploadList: [],
        fileLogList: []
      }
    }
  },
  methods: {
    handleUploadSuccess(fileList) {
      this.$toast.success('上传成功')
      // 处理上传成功后的逻辑
    }
  }
}
</script>
```

**列表模式特点**：
- 显示文件图标、文件名、文件大小
- 适合文档类文件展示
- 点击可预览或下载
- 支持删除操作（非提交态）

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

### 非标独立页面特别说明

当生成独立详情/编辑页面时，需要额外注意：

1. **路由配置**：
   - 必须提醒用户添加路由配置
   - 详情页路由：`detail/:id`
   - 编辑页路由：`edit/:id?`（id可选，支持新增）

2. **导航处理**：
   - 列表页：使用 `navigate()` 或 `router.push()` 跳转
   - 详情/编辑页：提供"返回"按钮，使用 `navigate(-1)` 或 `router.back()`

3. **参数获取**：
   - React：`const { id } = useParams<{ id: string }>()`
   - Vue 3：`const id = route.params.id as string`
   - Vue 2：`const id = this.$route.params.id`

4. **页面标识**：
   - 根据是否有 `id` 判断是新增还是编辑
   - 详情页总是需要 `id`，否则显示错误或重定向

5. **文件结构（❗必须完整创建）**：
   ```
   components/
   ├── detail/           # 独立详情页（完整的页面组件）
   │   ├── hooks/       # ❗必须创建：详情页专属逻辑
   │   │   └── useDetailData.ts    # ❗必须生成此文件
   │   ├── index.tsx    # 详情页主文件
   │   └── index.less   # 详情页样式
   └── edit/            # 独立编辑页（完整的页面组件）
       ├── hooks/       # ❗必须创建：编辑页专属逻辑
       │   └── useEditForm.ts      # ❗必须生成此文件
       ├── index.tsx    # 编辑页主文件
       └── index.less   # 编辑页样式
   ```

### 非标独立页面文件生成检查清单

生成非标独立页面时，**必须严格按照以下清单逐一创建文件**：

#### React 项目 - 详情页必须文件：
- [ ] `components/detail/index.tsx` - 详情页主组件
- [ ] `components/detail/index.less` - 详情页样式
- [ ] `components/detail/hooks/index.ts` - hooks导出文件
- [ ] `components/detail/hooks/useDetailData.ts` - **必须生成**：数据获取逻辑

#### React 项目 - 编辑页必须文件：
- [ ] `components/edit/index.tsx` - 编辑页主组件
- [ ] `components/edit/index.less` - 编辑页样式
- [ ] `components/edit/hooks/index.ts` - hooks导出文件
- [ ] `components/edit/hooks/useEditForm.ts` - **必须生成**：表单逻辑

#### Vue 3 项目 - 详情页必须文件：
- [ ] `components/detail/index.vue` - 详情页主组件
- [ ] `components/detail/index.less` - 详情页样式
- [ ] `components/detail/composables/index.ts` - composables导出文件
- [ ] `components/detail/composables/useDetailData.ts` - **必须生成**：数据获取逻辑

#### Vue 3 项目 - 编辑页必须文件：
- [ ] `components/edit/index.vue` - 编辑页主组件
- [ ] `components/edit/index.less` - 编辑页样式
- [ ] `components/edit/composables/index.ts` - composables导出文件
- [ ] `components/edit/composables/useEditForm.ts` - **必须生成**：表单逻辑

#### Vue 2 项目 - 详情页必须文件：
- [ ] `components/detail/index.vue` - 详情页主组件
- [ ] `components/detail/index.less` - 详情页样式
- [ ] `components/detail/detail.js` - **必须生成**：详情逻辑（Vue 2使用独立js文件）

#### Vue 2 项目 - 编辑页必须文件：
- [ ] `components/edit/index.vue` - 编辑页主组件
- [ ] `components/edit/index.less` - 编辑页样式
- [ ] `components/edit/edit.js` - **必须生成**：编辑逻辑（Vue 2使用独立js文件）

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

<!-- H5 文件上传（Vant）- 网格模式 -->
<FileUpload
  :resultItem="{
    fileFormat: '.jpg,.png,.pdf',
    fileUpperLimit: 10,
    fileTypeCode: 'BUSINESS_FILE',
    uploadList: [],
    fileLogList: []
  }"
  :maxCount="9"
  :isSubmit="false"
  displayMode="grid"
  @updataFileListSuccess="handleSuccess"
/>

<!-- H5 文件上传（Vant）- 列表模式 -->
<FileUpload
  :resultItem="fileConfig"
  :maxCount="10"
  displayMode="list"
  @updataFileListSuccess="handleSuccess"
/>

<!-- PC 文件上传（Element）- picture-card -->
<FileUpload
  uploadUrl="/api/upload"
  :maxCount="5"
  :maxSize="10"
  :acceptTypes="['image/jpeg', 'image/png']"
  listType="picture-card"
  @success="handleSuccess"
/>
```

### 非标独立页面快速参考

#### 目录结构对比

**标准弹窗模式**：
```
src/pages/[模块]/[功能]/
├── components/
│   └── EditModal.tsx          # 弹窗组件
└── index.tsx                  # 列表页
```

**非标独立页面模式**：
```
src/pages/[模块]/[功能]/
├── components/
│   ├── detail/
│   │   ├── hooks/
│   │   │   ├── index.ts           # ✅ 必须：hooks导出
│   │   │   └── useDetailData.ts   # ✅ 必须：详情逻辑
│   │   ├── index.tsx              # 完整的详情页面
│   │   └── index.less
│   └── edit/
│       ├── hooks/
│       │   ├── index.ts           # ✅ 必须：hooks导出
│       │   └── useEditForm.ts     # ✅ 必须：编辑逻辑
│       ├── index.tsx              # 完整的编辑页面
│       └── index.less
└── index.tsx                      # 列表页
```

#### 关键代码对比

**列表页跳转（弹窗 vs 独立页面）**：
```typescript
// 弹窗模式
<a onClick={() => setEditVisible(true)}>编辑</a>

// 独立页面模式（React）
<a onClick={() => navigate(`/path/edit/${record.id}`)}>编辑</a>

// 独立页面模式（Vue）
<a @click="router.push(`/path/edit/${row.id}`)">编辑</a>
```

#### 识别规则总结

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

## 🧩 非标页面模板规则提示词（可直接复制）

> 目的：把“非标页面”常见模板固化成可复制提示词，让用户只填关键变量即可生成一致的代码结构。
>
> 适配：React / Vue 3（Vue 2 可按同逻辑落地，但不强制写全模板）。

### 1) 非标详情页（独立路由 Detail Page）提示词模板

```
任务标准：AI前端代码生成执行规范（含vue、规范、完整版）.md 为标准执行任务

一句话需求：<粘贴用户的一句话需求，例如：做一个出差申请单详情页，包含基础信息、差旅信息、附件预览、流程信息和流程明细>

页面类型：非标独立页面（详情页，独立路由，非弹窗/抽屉）

文件夹名称: detail

接口及数据结构（以文件为主，优先提供接口类型文件路径）：
- 接口类型文件：<例如 travelApply.d.ts / 或 @/types/xxx.d.ts>
- 详情接口函数：<例如 applyDetailApi>
- 路由参数：<例如 id / appNo>（写清楚从 route params / query / location state 获取）

页面结构（必须按模块拆分，模块标题与内容风格保持一致）：
1. 页面标题：<例如 出差申请单>
2. 单据号：展示 <appNo>
3. 基础信息：label/value 列表（无 value 不展示）
4. 业务信息（例如差旅信息）：label/value 列表，支持单行字段（如备注）
5. 附件：缩略图列表，点击预览
6. 流程信息：审批节点卡片（不同状态不同颜色）
7. 流程明细：表格展示节点明细（审批节点/审批人/结果/意见/时间）

字段展示规则：
- 选填字段：无数据不渲染该字段
- 时间字段：统一格式化为 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss（按需求选择）

交互要求：
- 返回：提供“返回”按钮，使用 history.go(-1) 或 navigate(-1) 或 router.back()

强制要求（P0）：
- ⛔ 必须先生成 hooks/composables 文件：数据获取 + 数据组装必须在 hooks 内完成
- ⛔ 组件文件禁止直接调用 API（禁止 useEffect + API 调用组合出现在组件里）
- ✅ 生成完成后必须执行 TypeScript/ESLint 自检并修复

输出要求：
- React：先输出 hooks，再输出 index.tsx，再输出 index.less
- Vue 3：先输出 composables，再输出 index.vue，再输出 index.less
```

### 2) 导入页面/导入弹窗（Import / Excel 导入）提示词模板

> 说明：导入场景通常不是"详情/编辑"，但同样属于强业务场景；需要固化"模板下载 + 上传 + 导入记录 + 结果下载 + 异步轮询"的通用能力。

```
任务标准：AI前端代码生成执行规范（含vue、规范、完整版）.md 为标准执行任务

一句话需求：<粘贴用户的一句话需求，例如：做一个excel导入弹窗，支持模板下载、上传、导入记录和下载错误文件>

页面类型：导入页面/导入弹窗（Excel 导入）

文件夹名称: import

接口及数据结构（以文件为主，明确函数名与参数）：
- 模板下载：downloadTemplate（入参：title/typeCode 等）
- 上传（异步/同步二选一或都支持）：
  - uploadExcelDataAsyc（推荐：异步导入）
  - uploadExcelDataSync（可选：同步导入）
- 导入记录列表：getBatchFileList（分页）
- 导入任务查询/轮询：
  - getImportProcessingTask（查询进行中任务）
  - getImportProcessingState（轮询任务状态）
- 结果/错误文件下载：downloadProcessedFile

功能要求：
- 模板下载按钮：支持自定义下载逻辑（customDownload）或默认 downloadTemplate
- 上传：仅允许 xlsx/xls；只允许 1 个文件；选择文件后自动触发提交
- 导入过程：
  - 异步导入：上传后返回 invoice/processStatus；processStatus=1 则弹通知并轮询
  - 同步导入：直接返回结果
- 导入记录：表格展示 文件名/导入时间/处理结果/导入人/操作(下载)
- 导入中提醒：notification 常驻提示；成功/失败时自动关闭并刷新列表

强制要求（P0）：
- 禁止残留 console.log/debugger
- 第三方类型必须正确引入（如 ProColumns/UploadProps）
- 类型引入遵循全局类型规则（全局类型绝对不 import）
- 生成完成后必须执行 TypeScript/ESLint 自检并修复

输出要求：
- React：组件代码 + typings（如需要）+ 样式（如需要）
- Vue 3：如实现导入页面，必须拆 composables（上传/轮询/列表逻辑）+ 页面组件
```

### 3) 文件上传组件（H5 移动端 / PC 端）提示词模板

> 说明：文件上传是常见的基础组件场景，区分移动端（Vant）和 PC 端（Element）两种实现。

#### 3.1) Vue 2 H5 文件上传组件（Vant）

```
任务标准：AI前端代码生成执行规范（含vue、规范、完整版）.md 为标准执行任务

一句话需求：<例如：做一个移动端文件上传组件，支持图片上传和水印功能>

页面类型：文件上传组件（Vue 2 + Vant）
使用模板：vue2-h5-file-upload

文件夹名称: components/FileUpload

功能要求：
- 展示模式：<grid（网格模式，适合图片）/ list（列表模式，适合文档）>
- 支持格式：<例如：.jpg,.png,.pdf>
- 文件数量限制：<例如：最多 9 个>
- 文件大小限制：<例如：单个不超过 10MB>
- 是否需要水印：<是/否>
- 水印内容：<地理位置/天气/时间/拍摄人>
- 是否保留原图：<是/否>
- 是否显示示例文件：<是/否>

配置示例：
- 网格模式 + 水印：displayMode="grid", 支持图片格式, maxCount=9
- 列表模式 + 文档：displayMode="list", 支持 pdf/doc/xlsx, maxCount=10

Props 配置：
- resultItem: { fileFormat, fileUpperLimit, fileTypeCode, uploadList, fileLogList }
- maxCount: <数量>
- displayMode: "grid" / "list"
- isSubmit: false（编辑态）/ true（提交态/查看态）
- isShowExampleFile: false / true
- originalFile: false（不保留原图）/ true（保留原图）

强制要求（P0）：
- 必须包含水印组件（waterMark.vue）和图标映射（loadIcon.js）
- 水印功能需要调用高德地图 API 获取位置
- 支持多种文件格式预览（图片/视频/DWG/PDF 等）
- 生成完成后必须执行 ESLint 自检并修复

输出要求：
- index.vue：主组件
- waterMark.vue：水印组件（如需要）
- loadIcon.js：文件图标映射
```

#### 3.2) Vue 2 PC 文件上传组件（Element）

```
任务标准：AI前端代码生成执行规范（含vue、规范、完整版）.md 为标准执行任务

一句话需求：<例如：做一个 PC 端文件上传组件，支持多种格式上传和进度显示>

页面类型：文件上传组件（Vue 2 + Element UI/Plus）
使用模板：vue2-pc-file-upload

文件夹名称: components/FileUpload

功能要求：
- 展示模式：<picture-card（卡片模式，适合图片）/ text（文本模式，适合文档）>
- 支持格式：<例如：jpg、png、pdf、doc、docx>
- 文件数量限制：<例如：最多 5 个>
- 文件大小限制：<例如：单个不超过 10MB>
- 上传接口：<例如：/api/upload>
- 业务类型标识：<例如：82>
- 进度条颜色：<例如：#409EFF>
- 是否禁用：<false / true>

配置示例：
- 图片上传：picture-card 模式, acceptTypes=['image/jpeg', 'image/png']
- 文档上传：text 模式, acceptTypes=['application/pdf', 'application/msword']

Props 配置：
- uploadUrl: <上传接口地址>
- maxCount: <数量>
- maxSize: <大小（MB）>
- acceptTypes: <允许的 MIME 类型数组>
- listType: "picture-card" / "text"
- uploadTip: <提示文案>
- uploadBtnText: <按钮文案>
- progressColor: <进度条颜色>
- disabled: false / true

事件：
- @success: 上传成功回调
- @remove: 文件移除回调
- @change: 文件列表变化回调

暴露方法：
- getFileList(): 获取文件列表
- setFileList(list): 设置文件列表
- clearFileList(): 清空文件列表

强制要求（P0）：
- 必须支持自定义上传逻辑（customUpload）
- 必须显示实时上传进度
- 必须支持文件类型识别（图片/视频/文档）
- 生成完成后必须执行 ESLint 自检并修复

输出要求：
- index.vue：主组件
- types.ts：类型定义（如需要）
```

---

## 🗺️ 一句话输入 -> 模板匹配规则（降低使用成本）

> 目标：用户只输入“一句话需求”，就能被归类到某个模板（例如：非标详情页、导入弹窗）。

### 匹配原则（从强到弱）

1. **强触发词优先**：出现“导入/excel/模板下载/xlsx”→ 直接命中导入模板；出现“详情/单据/审批/流程”→ 直接命中详情模板。
2. **场景冲突时**：按更强业务词优先（导入 > 详情 > 列表）。
3. **无法命中时**：要求用户补充 1-2 个关键词（例如“详情/导入/excel/审批/流程/模板下载”）。

### 模板索引

| 模板ID | 模板名称 | 一句话常见触发词 |
|---|---|---|
| `react-nonstandard-detail` | React 非标独立详情页 | 详情/单据详情/审批/流程/节点/附件预览/卡片布局 |
| `react-import-modal` | React 导入弹窗（Excel 导入） | 导入/上传/excel/xlsx/模板下载/导入记录/下载错误 |
| `react-pc-file-upload` | React PC 文件上传组件 | React/Ant Design/文件上传/图片上传/上传进度/picture-card/附件 |
| `vue2-h5-file-upload` | Vue 2 H5 文件上传组件 | 移动端/H5/Vant/文件上传/图片上传/水印/拍照/地理位置/网格列表 |
| `vue2-pc-file-upload` | Vue 2 PC 文件上传组件 | PC端/Element/文件上传/图片上传/上传进度/picture-card/卡片上传 |

### 可执行匹配（MCP 工具）

> 如果使用 MCP 工具 `codegen-engine`，可通过以下方式自动匹配模板：

**方式 1：自动匹配**
```
让 AI 根据你的需求描述自动调用 MCP 工具进行模板匹配
```

**方式 2：显式指定模板 ID**
```
使用模板：react-nonstandard-detail
一句话需求：做一个出差申请单详情页，包含基础信息、差旅信息、附件预览、流程信息和流程明细
```

#### 非标独立页面必须生成文件总结表

| 技术栈 | 详情页hooks/逻辑文件 | 编辑页hooks/逻辑文件 | 其他必须文件 |
|--------|---------------------|---------------------|-------------|
| **React** | `components/detail/hooks/useDetailData.ts` ✅ | `components/edit/hooks/useEditForm.ts` ✅ | `hooks/index.ts`（导出文件）|
| **Vue 3** | `components/detail/composables/useDetailData.ts` ✅ | `components/edit/composables/useEditForm.ts` ✅ | `composables/index.ts`（导出文件）|
| **Vue 2** | `components/detail/detail.js` ✅ | `components/edit/edit.js` ✅ | 无 |

**文件生成优先级**：
1. **第一步**：创建 hooks/composables 目录
2. **第二步**：生成逻辑文件（useDetailData.ts / useEditForm.ts 等）
3. **第三步**：生成导出文件（index.ts）
4. **第四步**：生成组件主文件（index.tsx / index.vue）
5. **第五步**：生成样式文件（index.less）

### TypeScript 类型引入快速参考

**检查流程**：
```typescript
// 步骤1：检查项目中是否存在全局类型声明
// 查找文件：types/global.d.ts、typings/index.d.ts、src/types/index.d.ts

// 步骤2：判断类型是否已全局声明
// 如果在全局类型文件中找到，则无需引入

// ✅ 正确示例：全局类型无需引入
// types/global.d.ts 中已声明
declare interface UserInfo {
  id: string;
  name: string;
}

// hooks/useUserData.ts 中直接使用，无需 import
const [user, setUser] = useState<UserInfo>();  // ✅ 直接使用

// ❌ 错误示例：重复引入全局类型
import type { UserInfo } from '../types';  // ❌ UserInfo 已是全局类型，不应引入
const [user, setUser] = useState<UserInfo>();

// ✅ 正确示例：局部类型需要引入
// 当前模块特有的类型，必须引入
import type { LocalFormData } from './types';
const [formData, setFormData] = useState<LocalFormData>();
```

**判断规则表**：

| 类型定义位置 | 是否需要 import | 说明 |
|------------|----------------|------|
| `types/global.d.ts` | ❌ 不需要 | 全局声明，自动可用 |
| `typings/index.d.ts` | ❌ 不需要 | TypeScript 自动加载 |
| `@types/xxx` | ❌ 不需要 | npm 包的类型声明 |
| `当前模块/types.ts` | ✅ 需要 | 局部类型，必须引入 |
| `../../shared/types.ts` | ✅ 需要 | 其他模块类型，必须引入 |

### UI 设计图片还原快速检查

生成带设计稿的页面时，必须检查：

```less
// ✅ 正确：精确还原设计稿
.custom-card {
  width: 360px;              // 设计稿标注值
  height: 240px;
  padding: 24px;
  margin: 16px;
  border-radius: 8px;        // 设计稿圆角
  background: #ffffff;       // 精确色值
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);  // 精确阴影参数
  
  &:hover {
    transform: translateY(-2px);  // 设计稿标注的交互效果
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
}

// ❌ 错误：模糊数值
.wrong-card {
  padding: 20px;             // ❌ 设计稿是 24px
  border-radius: 5px;        // ❌ 设计稿是 8px
  background: #fff;          // ✅ 可以，等同于 #ffffff
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  // ❌ 设计稿是 0 4px 12px rgba(0, 0, 0, 0.08)
}
```

**关键检查项**：
- [ ] 间距精确度：margin/padding 误差 ≤ 2px
- [ ] 颜色准确性：使用设计稿 HEX 色值
- [ ] 字体匹配度：font-size、font-weight、line-height 精确
- [ ] 圆角一致性：border-radius 与设计稿完全相同
- [ ] 阴影还原度：box-shadow 参数精确匹配
- [ ] 交互完整性：hover/active/disabled 状态全部实现

---

本规范作为 AI 代码生成的执行标准，确保生成的代码：
- ✅ 符合项目规范
- ✅ 目录结构正确
- ✅ 依赖引入合理
- ✅ 类型定义完整
- ✅ 代码可维护

严格遵循本规范，确保生成高质量、可用的前端代码。
