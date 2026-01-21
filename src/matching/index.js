export { detectTechStack, findSimilarComponents } from './tech-stack.js'
export { scoreTemplate, smartMatchTemplate, isStructuredPrompt, extractExplicitTemplateId } from './matcher.js'
export { getComponentKnowledge, getCodeExamples } from './knowledge.js'
export { 
  analyzeProjectStructure, 
  suggestFilePaths, 
  detectCodeStyle, 
  parseCompositeRequirement,
  getRuleStandardStructure,
  extractFolderName,
  resolveFolderName,
  getFolderNamingRules
} from './project-context.js'
