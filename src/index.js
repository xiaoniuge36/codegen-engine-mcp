/**
 * AI CodeGen Engine - 模块化入口
 * 
 * 目录结构:
 * src/
 * ├── utils/          # 工具函数（日志、文件操作、配置）
 * ├── spec/           # 规范文档相关
 * ├── templates/      # 模板相关（技术栈检测、匹配、知识库）
 * ├── types/          # 类型检查相关
 * ├── tools/          # MCP 工具定义和处理器
 * └── index.js        # 入口文件
 */

// 工具函数
export { 
  logger, 
  readJson, 
  readText, 
  normalizeText, 
  walkDirectory,
  ENGINE_ROOT, 
  REPO_ROOT, 
  REGISTRY_PATH, 
  KNOWLEDGE_DIR, 
  EXAMPLES_DIR, 
  RULES_DIR 
} from './utils/index.js'

// 规范文档
export { 
  buildSpecCandidates, 
  resolveSpecPath, 
  searchSpecLines, 
  getSpecContent 
} from './spec/index.js'

// 模板匹配相关
export { 
  detectTechStack, 
  findSimilarComponents,
  scoreTemplate, 
  smartMatchTemplate, 
  isStructuredPrompt, 
  extractExplicitTemplateId,
  getComponentKnowledge, 
  getCodeExamples 
} from './matching/index.js'

// 类型检查
export { 
  checkGlobalTypes, 
  parseApiTypes, 
  checkCodeCompliance 
} from './types/index.js'

// MCP 工具
export { 
  TOOLS_DEFINITION, 
  getStdioToolsDefinition, 
  handleToolCall,
  buildEnhancedPrompt,
  promptSkeletonByKey,
  generateCodeContext
} from './tools/index.js'
