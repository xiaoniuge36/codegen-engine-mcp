# 组件模板使用指南

本文档提供所有可用组件模板的使用指南和选择建议。

## 一、模板分类

### 1. React 模板

#### 列表类
- **react-standard-list-crud**: 标准列表页（ProTable + 搜索 + 新增/编辑弹窗）
- **react-import-modal**: Excel 导入弹窗（异步/同步 + 导入记录）

#### 表单类
- **react-standard-modal-form**: 弹窗表单（ModalForm）
- **react-drawer-form**: 抽屉表单（DrawerForm）
- **react-standard-form-page**: 独立表单页（路由页面）

#### 详情类
- **react-drawer-detail**: 抽屉详情（Drawer）
- **react-nonstandard-detail**: 独立详情页（审批流程/附件预览）

### 2. Vue 模板

#### Vue 3
- **vue3-standard-list-crud**: 标准列表页（Element Plus + Composition API）

#### Vue 2
- **vue2-standard-list-crud**: 标准列表页（Element UI + Options API）

## 二、表单容器选择指南

### 选择流程图

```
需要表单 → 字段数量？
  ├─ < 10个字段 → 使用 ModalForm（弹窗）
  ├─ 10-20个字段 → 使用 DrawerForm（抽屉）
  └─ > 20个字段 → 使用独立表单页
```

### 详细对比

| 特性 | ModalForm | DrawerForm | 独立表单页 |
|------|-----------|------------|-----------|
| **字段数量** | < 10个 | 10-20个 | > 20个 |
| **复杂度** | 简单 | 中等 | 复杂 |
| **空间占用** | 居中弹窗 | 侧边滑出 | 独立页面 |
| **独立URL** | ❌ | ❌ | ✅ |
| **同时查看列表** | ❌ | ✅ | ❌ |
| **适用场景** | 快速编辑 | 中等表单 | 多步骤/复杂表单 |

## 三、详情容器选择指南

### 选择流程图

```
需要详情页 → 信息复杂度？
  ├─ 简单信息 → 使用 Drawer 抽屉详情
  └─ 复杂信息（审批流程/附件预览） → 使用独立详情页
```

### 详细对比

| 特性 | Drawer 抽屉详情 | 独立详情页 |
|------|---------------|-----------|
| **信息量** | 简单-中等 | 中等-复杂 |
| **独立URL** | ❌ | ✅ |
| **分享链接** | ❌ | ✅ |
| **浏览器前进/后退** | ❌ | ✅ |
| **适用场景** | 快速查看 | 审批流程/附件预览/可分享 |

## 四、使用场景示例

### 场景1：员工管理列表

**需求**：员工列表 + 搜索 + 新增/编辑（姓名、工号、部门、岗位）

**选择**：`react-standard-list-crud` + `react-standard-modal-form`

**原因**：
- 列表功能标准（搜索 + 表格 + CRUD）
- 表单字段少（4个），适合弹窗

### 场景2：项目配置管理

**需求**：项目列表 + 查看详情 + 编辑配置（15个配置项）

**选择**：`react-standard-list-crud` + `react-drawer-detail` + `react-drawer-form`

**原因**：
- 列表功能标准
- 配置项较多（15个），使用抽屉更合适
- 需要快速查看和编辑，不需要独立URL

### 场景3：出差申请单

**需求**：申请单列表 + 详情（审批流程/附件预览）+ 编辑（20+字段）

**选择**：`react-standard-list-crud` + `react-nonstandard-detail` + `react-standard-form-page`

**原因**：
- 详情页复杂（审批流程、附件预览），需要独立页面
- 表单字段多（20+个），需要独立表单页
- 需要独立URL，支持分享链接

### 场景4：Excel 批量导入

**需求**：员工列表 + Excel 导入功能

**选择**：`react-standard-list-crud` + `react-import-modal`

**原因**：
- 标准的 Excel 导入场景
- 包含模板下载、上传、导入记录、错误处理

## 五、提示词模板

### 1. 使用 ModalForm 的提示词

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个员工列表页，支持搜索和新增/编辑弹窗

页面类型：标准列表页 + 弹窗表单

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
- 编辑弹窗：ModalForm（新增/编辑共用）
```

### 2. 使用 DrawerForm 的提示词

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个项目配置列表页，支持抽屉编辑配置

页面类型：标准列表页 + 抽屉表单

文件夹名称: project-config

接口数据结构：{
  "projectName": "项目名称",
  // ... 15个配置字段
}

页面需求：
- 搜索表单：项目名称、状态
- 数据表格：序号 + 项目信息 + 操作列（编辑/查看）
- 编辑抽屉：DrawerForm，宽度 720px
```

### 3. 使用独立表单页的提示词

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个出差申请单新增/编辑页面，包含申请信息、行程信息、费用信息

页面类型：独立表单页（路由页面）

文件夹名称: travel-apply-edit

接口数据结构：{
  // ... 20+个字段
}

页面需求：
- 独立路由页面
- 多个表单分组（申请信息、行程信息、费用信息）
- 保存后返回列表
```

### 4. 使用抽屉详情的提示词

```
任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：做一个项目列表页，支持抽屉查看详情和编辑

页面类型：标准列表页 + 抽屉详情 + 抽屉编辑

文件夹名称: project-list

页面需求：
- 列表页：搜索 + 表格
- 抽屉详情：查看项目信息，包含编辑按钮
- 抽屉编辑：点击详情的编辑按钮，切换到编辑抽屉
```

## 六、组合使用模式

### 模式1：列表 + 弹窗编辑

```
react-standard-list-crud + react-standard-modal-form
```

**适用**：简单 CRUD 场景，字段少

### 模式2：列表 + 抽屉详情 + 抽屉编辑

```
react-standard-list-crud + react-drawer-detail + react-drawer-form
```

**适用**：需要查看和编辑，字段适中

### 模式3：列表 + 独立详情页 + 独立表单页

```
react-standard-list-crud + react-nonstandard-detail + react-standard-form-page
```

**适用**：复杂场景，需要独立URL

### 模式4：列表 + Excel 导入

```
react-standard-list-crud + react-import-modal
```

**适用**：批量数据导入场景

## 七、关键要点

### 1. Hooks/Composables 必须生成

**必须生成 Hooks 的场景**：
- 独立详情页（detail/）
- 独立编辑页（edit/）
- 独立表单页

**可选的场景**：
- ModalForm（逻辑简单时可以不拆）
- DrawerForm（逻辑简单时可以不拆）

### 2. TypeScript 类型引入规则

**检查流程**：
1. 先检查 `types/global.d.ts` 是否存在
2. 确认类型是否全局声明
3. 全局类型不引入，局部类型从 `./types` 引入
4. 第三方库类型必须引入

### 3. 代码自检

**生成后必须执行**：
- TypeScript 类型检查
- ESLint 规则检查
- 代码规范检查
- 功能完整性检查

## 八、常见问题

### Q1: 如何选择弹窗还是抽屉？
A: 根据字段数量：<10个用弹窗，10-20个用抽屉，>20个用独立页面

### Q2: 什么时候用独立详情页？
A: 当详情包含复杂信息（审批流程、附件预览）或需要分享链接时

### Q3: 抽屉详情和抽屉编辑如何切换？
A: 在详情抽屉的 extra 中放置编辑按钮，点击时关闭详情、打开编辑

### Q4: 独立表单页如何区分新增和编辑？
A: 通过路由参数 id，无 id 为新增，有 id 为编辑

### Q5: 如何实现详情页的编辑功能？
A: 
- 抽屉详情：在 extra 中放编辑按钮，切换到编辑抽屉
- 独立详情页：在页面右上角放编辑按钮，跳转到编辑页

## 九、模板扩展

如需自定义模板：

1. 在 `templates/examples/` 目录创建新模板
2. 创建 `.example.tsx`/`.example.vue` 文件
3. 创建 `sample.md` 说明文档
4. 在 `template-registry.json` 注册
5. 重启 MCP 服务

## 十、相关文档

- **AI 前端代码生成规范**：`ai-fe-code-std.md`
- **模板使用说明**：`codegen-engine/模板使用说明.md`
- **Ant Design Pro 知识库**：`knowledge/common/ant-design-pro.md`
- **抽屉表单知识库**：`knowledge/common/react-drawer-form.md`
