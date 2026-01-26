# CodeGen Engine MCP 工具详细参数参考

本文档提供 codegen-engine MCP 服务器所有工具的详细参数说明。

---

## 目录

1. [quick_generate](#1-quick_generate)
2. [check_code_compliance](#2-check_code_compliance)
3. [validate_code](#3-validate_code)
4. [detect_tech_stack](#4-detect_tech_stack)
5. [check_global_types](#5-check_global_types)
6. [analyze_project](#6-analyze_project)
7. [smart_match_template](#7-smart_match_template)
8. [list_templates](#8-list_templates)
9. [get_template](#9-get_template)
10. [get_code_examples](#10-get_code_examples)
11. [get_component_knowledge](#11-get_component_knowledge)
12. [get_spec_content](#12-get_spec_content)
13. [parse_api_types](#13-parse_api_types)
14. [find_similar_components](#14-find_similar_components)
15. [match_template](#15-match_template)
16. [build_prompt](#16-build_prompt)
17. [search_spec](#17-search_spec)
18. [generate_code_context](#18-generate_code_context)
19. [get_stats](#19-get_stats)

---

## 1. quick_generate

**【1️⃣ 第一步 - 必须首先调用】** 代码生成的默认入口。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | ✅ | 用户需求描述（直接传入用户说的原话） |
| `projectPath` | string | ❌ | 用户当前打开的文件路径（优先使用 IDE 当前打开的文件） |

### 调用示例

```json
{
  "text": "做一个员工列表页，支持姓名搜索、新增、编辑、删除",
  "projectPath": "D:/project/src/App.tsx"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `techStack` | 技术栈信息（techStack/framework/uiLibrary/isTypeScript） |
| `globalTypes` | 全局类型声明（globalInterfaces/recommendation） |
| `templateMatch` | 匹配的模板（chosen/top） |
| `codeExamples` | 示例代码文件内容 |
| `componentKnowledge` | 组件库知识图谱 |
| `criticalReminders` | 关键提醒列表 |
| `ruleEnforcement` | 规则约束信息 |

---

## 2. check_code_compliance

**【3️⃣ 最后一步 - 必须调用】** 生成代码后必须调用此工具检查规范符合性。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `generatedFiles` | array | ✅ | 已生成的文件路径列表 |
| `projectPath` | string | ❌ | 项目路径（可选） |

### 调用示例

```json
{
  "generatedFiles": [
    "src/pages/employee/hooks/useTableData.ts",
    "src/pages/employee/index.tsx",
    "src/pages/employee/types.ts"
  ],
  "projectPath": "D:/project"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `summary` | 检查结果摘要 |
| `passed` | 通过的检查项列表 |
| `issues` | 发现的问题列表 |
| `recommendation` | 修复建议 |

---

## 3. validate_code

**【⭐ 代码验证工具】** 整合 TypeScript + ESLint 一键检查。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `projectPath` | string | ✅ | 项目路径（文件或目录均可） |
| `files` | array | ❌ | 要检查的文件列表（不传则检查整个项目） |

### 调用示例

```json
{
  "projectPath": "D:/project",
  "files": ["src/pages/employee/index.tsx", "src/pages/employee/hooks/useTableData.ts"]
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `success` | 是否全部通过 |
| `summary` | 错误/警告统计 |
| `typescript` | TypeScript 检查结果 |
| `eslint` | ESLint 检查结果 |
| `suggestions` | 修复建议列表 |
| `commands` | 修复命令 |

---

## 4. detect_tech_stack

检测项目技术栈（自动识别 React/Vue2/Vue3 及 UI 库）。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `projectPath` | string | ❌ | 项目中任意文件或目录的路径 |

### 调用示例

```json
{
  "projectPath": "D:/project/src/App.tsx"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `detected` | 是否成功检测 |
| `techStack` | 技术栈（react/vue2/vue3） |
| `framework` | 框架（umi/next/nuxt等） |
| `uiLibrary` | UI库（antd/element-plus/element-ui等） |
| `buildTool` | 构建工具（vite/webpack） |
| `isTypeScript` | 是否使用TypeScript |

---

## 5. check_global_types

**【⭐ 重要】** 检查项目全局类型声明，避免重复 import 全局类型。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `projectPath` | string | ❌ | 项目路径（默认自动检测） |

### 调用示例

```json
{
  "projectPath": "D:/project"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `found` | 是否找到全局类型文件 |
| `globalTypesPath` | 全局类型文件路径 |
| `globalInterfaces` | 全局 interface 列表 |
| `globalTypes` | 全局 type 列表 |
| `globalEnums` | 全局 enum 列表 |
| `recommendation` | 使用建议（这些类型不要import） |

---

## 6. analyze_project

分析项目结构和代码风格配置，提供智能目录推荐。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `projectPath` | string | ❌ | 项目中任意文件的路径 |
| `moduleName` | string | ❌ | 要创建的模块名称（用于生成推荐路径） |

### 调用示例

```json
{
  "projectPath": "D:/project/src/App.tsx",
  "moduleName": "employee-whitelist"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `projectContext` | 项目结构信息（rootDir/directories/routerType/stateManagement） |
| `codeStyle` | 代码风格配置（prettier/eslint/typescript） |
| `fileSuggestions` | 推荐的文件路径 |

---

## 7. smart_match_template

智能匹配模板（自动检测技术栈 + 基于需求匹配 + 兜底查找项目组件）。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | ✅ | 需求描述 |
| `projectPath` | string | ❌ | 项目中任意文件的路径 |
| `topK` | number | ❌ | 返回前K个匹配结果（默认5） |

### 调用示例

```json
{
  "text": "做一个文件上传组件，支持图片预览",
  "projectPath": "D:/project/src/App.tsx",
  "topK": 3
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `techStackInfo` | 检测到的技术栈信息 |
| `top` | 匹配结果排名 |
| `chosen` | 选中的模板 |
| `fallbackUsed` | 是否使用了兜底机制 |
| `recommendation` | 推荐说明 |

---

## 8. list_templates

列出模板注册表中的所有模板。

### 参数

无

### 调用示例

```json
{}
```

### 返回字段

返回模板数组，每个模板包含：

| 字段 | 说明 |
|------|------|
| `id` | 模板ID |
| `name` | 模板名称 |
| `scenes` | 适用场景 |
| `keywords` | 关键词 |

---

## 9. get_template

根据模板 ID 获取模板元数据。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 模板 ID |

### 调用示例

```json
{
  "id": "react-standard-list-crud"
}
```

---

## 10. get_code_examples

获取指定模板的示例代码。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `templateId` | string | ✅ | 模板ID |

### 调用示例

```json
{
  "templateId": "react-standard-list-crud"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `templateId` | 模板ID |
| `examples` | 示例代码文件内容（key为文件名，value为内容） |
| `fileCount` | 示例文件数量 |

---

## 11. get_component_knowledge

获取组件库知识图谱（通用组件库或业务组件库）。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `scope` | string | ✅ | `common`（通用）或 `business`（业务） |
| `projectId` | string | ❌ | 业务组件库的项目ID（scope=business时必填） |

### 调用示例

```json
{
  "scope": "common"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `scope` | 作用域 |
| `knowledge` | 知识图谱内容（key为组件库名，value为内容） |
| `fileCount` | 文件数量 |

---

## 12. get_spec_content

**【⭐⭐⭐ 最高优先级】** 获取规范文档内容（ai-fe-code-std.md）。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `section` | string | ❌ | 获取指定章节（如"核心规则"、"目录创建规则"） |
| `projectPath` | string | ❌ | 用户项目路径（如有自定义规则文件） |
| `specPath` | string | ❌ | 规范文件完整路径（直接指定） |

### 调用示例

```json
{
  "section": "核心规则"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `success` | 是否成功 |
| `specPath` | 规范文件路径 |
| `section` | 章节名 |
| `content` | 规范内容 |
| `contentLength` | 内容长度 |

---

## 13. parse_api_types

解析接口类型文件，提取 interface、type 和 API 方法定义。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `filePath` | string | ✅ | 接口类型文件路径 |

### 调用示例

```json
{
  "filePath": "src/services/user/types.ts"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `success` | 是否成功 |
| `filePath` | 文件路径 |
| `interfaces` | interface 列表（含字段信息） |
| `types` | type 列表 |
| `apiMethods` | API 方法列表 |
| `requestTypes` | 请求类型列表 |
| `responseTypes` | 响应类型列表 |

---

## 14. find_similar_components

从项目中查找相似组件（兜底规则）。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `searchText` | string | ✅ | 搜索文本 |
| `projectPath` | string | ❌ | 项目路径 |
| `techStack` | string | ❌ | 技术栈（react/vue2/vue3/vue） |

### 调用示例

```json
{
  "searchText": "上传 文件 图片",
  "projectPath": "D:/project",
  "techStack": "react"
}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `results` | 匹配结果列表（path/score/matchedLabels） |
| `count` | 结果数量 |

---

## 15. match_template

根据一句话需求匹配最合适的模板（基础版，不含技术栈检测）。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | ✅ | 需求描述或模板ID |
| `topK` | number | ❌ | 返回前K个匹配结果（默认3） |

### 调用示例

```json
{
  "text": "做一个员工列表页，支持搜索、新增、编辑、删除",
  "topK": 3
}
```

---

## 16. build_prompt

构建增强版提示词，自动附加组件库知识和示例代码。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | ✅ | 用户输入（可包含模板ID和需求描述） |
| `templateId` | string | ❌ | 可选的明确模板ID |

### 调用示例

```json
{
  "text": "react-nonstandard-detail 做一个出差申请单详情页"
}
```

---

## 17. search_spec

在规范文档中搜索关键字，快速定位规则。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | ✅ | 搜索关键字 |
| `maxResults` | number | ❌ | 最多返回结果数（默认10） |
| `specPath` | string | ❌ | 规范文件完整路径 |
| `projectPath` | string | ❌ | 用户项目路径 |

### 调用示例

```json
{
  "query": "hooks",
  "maxResults": 5,
  "projectPath": "D:/project"
}
```

---

## 18. generate_code_context

**【⭐⭐⭐ 必须优先调用】** 一键生成完整代码上下文（功能与 quick_generate 类似）。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | ✅ | 需求描述（可包含模板ID） |
| `projectPath` | string | ❌ | 项目路径 |
| `apiTypesPath` | string | ❌ | 接口类型文件路径 |

### 调用示例

```json
{
  "text": "做一个员工列表页",
  "projectPath": "D:/project",
  "apiTypesPath": "src/services/employee/types.ts"
}
```

---

## 19. get_stats

获取工具使用统计信息。

### 参数

无

### 调用示例

```json
{}
```

### 返回字段

| 字段 | 说明 |
|------|------|
| `created` | 统计开始时间 |
| `lastUpdated` | 最后更新时间 |
| `totalToolCalls` | 总调用次数 |
| `toolRanking` | 工具调用排名 |
| `templateRanking` | 模板使用排名 |
| `techStackDistribution` | 技术栈分布 |
