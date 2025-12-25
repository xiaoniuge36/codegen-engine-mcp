/**
 * MCP 工具定义
 */
export const TOOLS_DEFINITION = [
  { 
    name: 'list_templates', 
    description: '列出模板注册表中的所有模板', 
    inputSchema: { type: 'object', properties: {}, required: [] } 
  },
  { 
    name: 'get_template', 
    description: '根据模板 ID 获取模板元数据', 
    inputSchema: { type: 'object', properties: { id: { type: 'string', description: '模板 ID' } }, required: ['id'] } 
  },
  { 
    name: 'match_template', 
    description: '根据一句话需求匹配最合适的模板', 
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
    description: '获取模板的示例代码', 
    inputSchema: { type: 'object', properties: { templateId: { type: 'string' } }, required: ['templateId'] } 
  },
  { 
    name: 'search_spec', 
    description: '在规范文档中搜索关键字（规则文件已内置）', 
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, maxResults: { type: 'number', default: 10 }, specPath: { type: 'string', description: '规范文件完整路径' }, projectPath: { type: 'string', description: '⭐用户项目路径（优先查找）' } }, required: ['query'] } 
  },
  { 
    name: 'get_spec_content', 
    description: '【⭐推荐首先调用】获取规范文档内容。规则文件已内置，调用后必须严格按照规则执行代码生成任务。', 
    inputSchema: { type: 'object', properties: { specPath: { type: 'string' }, projectPath: { type: 'string', description: '用户项目路径' }, section: { type: 'string' } }, required: [] } 
  },
  { 
    name: 'detect_tech_stack', 
    description: '检测项目技术栈（自动识别 React/Vue2/Vue3 及 UI 库）', 
    inputSchema: { type: 'object', properties: { projectPath: { type: 'string', description: '项目路径（可选）' } }, required: [] } 
  },
  { 
    name: 'smart_match_template', 
    description: '智能匹配模板（自动检测技术栈 + 基于需求匹配 + 兜底查找项目组件）', 
    inputSchema: { type: 'object', properties: { text: { type: 'string', description: '需求描述' }, projectPath: { type: 'string', description: '项目路径（可选）' }, topK: { type: 'number', default: 5 } }, required: ['text'] } 
  },
  { 
    name: 'find_similar_components', 
    description: '从项目中查找相似组件（兜底规则）', 
    inputSchema: { type: 'object', properties: { searchText: { type: 'string' }, projectPath: { type: 'string' }, techStack: { type: 'string', enum: ['react', 'vue2', 'vue3', 'vue'] } }, required: ['searchText'] } 
  },
  { 
    name: 'check_global_types', 
    description: '检查项目全局类型声明（避免重复引入）', 
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
    description: '【⭐ 生成代码后必须调用】检查生成的代码是否符合规范，输出自检报告。', 
    inputSchema: { type: 'object', properties: { generatedFiles: { type: 'array', items: { type: 'string' }, description: '已生成的文件路径列表' }, projectPath: { type: 'string' } }, required: ['generatedFiles'] } 
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
