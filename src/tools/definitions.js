/**
 * MCP 工具定义 - AI 代码生成引擎
 * 
 * ⚠️⚠️⚠️ 最高优先级规则（必须遵守）⚠️⚠️⚠️
 * 
 * 【规则文件】rules/ai-fe-code-std.md 是代码生成的绝对标准
 * 【强制要求】生成任何代码前，必须严格遵守规则文件中的所有约束
 * 【包括但不限于】目录结构、文件命名、代码风格、hooks 生成顺序等
 * 
 * ⭐⭐⭐ 强制调用顺序（必须遵守）⭐⭐⭐
 * 
 * 步骤1️⃣ 调用 quick_generate 或分步调用：
 *   - detect_tech_stack → check_global_types → smart_match_template
 *   - → get_code_examples → get_spec_content
 * 
 * 步骤2️⃣ 根据返回的模板和示例生成代码（严格遵守规则）
 * 
 * 步骤3️⃣ 【必须】调用 check_code_compliance 检查代码
 * 
 * 调用流程图：
 * quick_generate → 生成代码 → check_code_compliance
 *       ↓                              ↑
 *   必须遵守规则 ←←←←←←←←←←←←←←←←
 */
export const TOOLS_DEFINITION = [
  { 
    name: 'quick_generate', 
    description: '【1️⃣ 第一步 - 必须首先调用】代码生成的默认入口。用户说“生成代码/做页面/创建组件”时必须先调用。自动执行：检测技术栈→检查全局类型→匹配模板→获取示例→读取规则。【下一步】根据返回结果生成代码，【最后一步】必须调用 check_code_compliance 检查。', 
    inputSchema: { 
      type: 'object', 
      properties: { 
        text: { type: 'string', description: '用户需求描述（直接传入用户说的原话）' }, 
        projectPath: { type: 'string', description: '用户当前打开的文件路径（优先使用 IDE 当前打开的文件）' } 
      }, 
      required: ['text'] 
    } 
  },
  { 
    name: 'list_templates', 
    description: '列出模板注册表中的所有模板。下一步：调用 get_template 获取具体模板详情', 
    inputSchema: { type: 'object', properties: {}, required: [] } 
  },
  { 
    name: 'get_template', 
    description: '根据模板 ID 获取模板元数据。下一步：调用 get_code_examples 获取示例代码', 
    inputSchema: { type: 'object', properties: { id: { type: 'string', description: '模板 ID' } }, required: ['id'] } 
  },
  { 
    name: 'match_template', 
    description: '根据一句话需求匹配最合适的模板。下一步：调用 get_code_examples 获取匹配模板的示例代码', 
    inputSchema: { type: 'object', properties: { text: { type: 'string', description: '需求描述或模板ID' }, topK: { type: 'number', default: 3, description: '返回前K个匹配结果' } }, required: ['text'] } 
  },
  { 
    name: 'build_prompt', 
    description: '【必须按照规则执行】构建增强版提示词，自动附加组件库知识和示例代码。生成代码时必须严格遵循 rules/ai-fe-code-std.md 规范。', 
    inputSchema: { type: 'object', properties: { text: { type: 'string', description: '用户输入' }, templateId: { type: 'string', description: '可选模板ID' } }, required: ['text'] } 
  },
  { 
    name: 'get_component_knowledge', 
    description: '获取组件库知识图谱', 
    inputSchema: { type: 'object', properties: { scope: { type: 'string', enum: ['common', 'business'], default: 'common' }, projectId: { type: 'string' } }, required: ['scope'] } 
  },
  { 
    name: 'get_code_examples', 
    description: '获取模板的示例代码。下一步：根据示例代码生成业务代码，完成后调用 check_code_compliance', 
    inputSchema: { type: 'object', properties: { templateId: { type: 'string' } }, required: ['templateId'] } 
  },
  { 
    name: 'search_spec', 
    description: '在规范文档中搜索关键字（规则文件已内置）', 
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, maxResults: { type: 'number', default: 10 }, specPath: { type: 'string', description: '规范文件完整路径' }, projectPath: { type: 'string', description: '⭐用户项目路径（优先查找）' } }, required: ['query'] } 
  },
  { 
    name: 'get_spec_content', 
    description: '【⭐⭐⭐ 最高优先级 - 必须遵守】获取规范文档内容（ai-fe-code-std.md）。⚠️ 强制要求：生成任何代码前必须获取并严格遵守规则，包括目录结构、文件命名、代码风格等。规则是代码生成的绝对标准，不可违反。', 
    inputSchema: { type: 'object', properties: { specPath: { type: 'string' }, projectPath: { type: 'string', description: '用户项目路径' }, section: { type: 'string' } }, required: [] } 
  },
  { 
    name: 'detect_tech_stack', 
    description: '检测项目技术栈（自动识别 React/Vue2/Vue3 及 UI 库）。⚠️ 重要：请传入项目中任意文件的路径。下一步：调用 smart_match_template 根据技术栈匹配模板', 
    inputSchema: { type: 'object', properties: { projectPath: { type: 'string', description: '⭐ 项目中任意文件或目录的路径（如 /path/to/project/package.json 或 /path/to/project/src/App.tsx）' } }, required: [] } 
  },
  { 
    name: 'smart_match_template', 
    description: '智能匹配模板（自动检测技术栈 + 基于需求匹配 + 兜底查找项目组件）。下一步：调用 get_code_examples 获取匹配模板的示例代码', 
    inputSchema: { type: 'object', properties: { text: { type: 'string', description: '需求描述' }, projectPath: { type: 'string', description: '⭐ 项目中任意文件的路径' }, topK: { type: 'number', default: 5 } }, required: ['text'] } 
  },
  { 
    name: 'find_similar_components', 
    description: '从项目中查找相似组件（兜底规则）', 
    inputSchema: { type: 'object', properties: { searchText: { type: 'string' }, projectPath: { type: 'string' }, techStack: { type: 'string', enum: ['react', 'vue2', 'vue3', 'vue'] } }, required: ['searchText'] } 
  },
  { 
    name: 'check_global_types', 
    description: '【⭐ 重要】检查项目全局类型声明。⚠️ 生成代码前必须检查，避免重复 import 全局类型。返回的全局类型【绝对不要 import】。', 
    inputSchema: { type: 'object', properties: { projectPath: { type: 'string' } }, required: [] } 
  },
  { 
    name: 'parse_api_types', 
    description: '解析接口类型文件', 
    inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] } 
  },
  { 
    name: 'generate_code_context', 
    description: '【⭐⭐⭐ 必须优先调用】一键生成完整代码上下文。返回结果包含规则摘要，生成代码时必须严格遵循规则执行。', 
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, projectPath: { type: 'string' }, apiTypesPath: { type: 'string' } }, required: ['text'] } 
  },
  { 
    name: 'check_code_compliance', 
    description: '【3️⃣ 最后一步 - 必须调用】生成代码后必须调用此工具检查规范符合性。⚠️ 跳过此步骤将导致代码质量问题。检查项：hooks文件顺序、类型定义、文件结构等。', 
    inputSchema: { type: 'object', properties: { generatedFiles: { type: 'array', items: { type: 'string' }, description: '已生成的文件路径列表' }, projectPath: { type: 'string' } }, required: ['generatedFiles'] } 
  },
  { 
    name: 'get_stats', 
    description: '获取工具使用统计（工具调用次数、模板使用排名、技术栈分布）', 
    inputSchema: { type: 'object', properties: {}, required: [] } 
  },
  { 
    name: 'analyze_project', 
    description: '分析项目结构和代码风格配置。返回：目录结构、路由类型、状态管理、Prettier/ESLint/TypeScript 配置、推荐文件路径。', 
    inputSchema: { 
      type: 'object', 
      properties: { 
        projectPath: { type: 'string', description: '项目中任意文件的路径' },
        moduleName: { type: 'string', description: '要创建的模块名称（可选，用于生成推荐路径）' }
      }, 
      required: [] 
    } 
  },
  { 
    name: 'validate_code', 
    description: '【⭐ 代码验证工具】整合 TypeScript + ESLint 一键检查。执行 tsc --noEmit 类型检查和 ESLint 规则检查，返回错误列表和修复建议。生成代码后推荐调用此工具验证质量。', 
    inputSchema: { 
      type: 'object', 
      properties: { 
        projectPath: { type: 'string', description: '项目路径（文件或目录均可）' },
        files: { type: 'array', items: { type: 'string' }, description: '要检查的文件列表（可选，不传则检查整个项目）' }
      }, 
      required: ['projectPath'] 
    } 
  },
]

/**
 * STDIO 模式工具定义（完整版）
 */
export function getStdioToolsDefinition() {
  return TOOLS_DEFINITION.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }))
}
