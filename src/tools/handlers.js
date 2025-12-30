import { z } from 'zod'
import { logger, readJson, REGISTRY_PATH, recordToolCall, recordTemplateUsage, recordTechStackDetection, getStatsSummary } from '../utils/index.js'
import { resolveSpecPath, searchSpecLines, getSpecContent, buildSpecCandidates } from '../spec/index.js'
import { 
  detectTechStack, 
  findSimilarComponents, 
  smartMatchTemplate, 
  extractExplicitTemplateId,
  scoreTemplate,
  getComponentKnowledge,
  getCodeExamples,
  analyzeProjectStructure,
  suggestFilePaths,
  detectCodeStyle
} from '../matching/index.js'
import { checkGlobalTypes, parseApiTypes, checkCodeCompliance } from '../types/index.js'
import { generateCodeContext } from './context.js'
import { buildEnhancedPrompt } from './prompts.js'
import { quickGenerate } from './quick-generate.js'
import { validateCode } from './validate.js'

/**
 * 处理工具调用
 */
export async function handleToolCall(name, args) {
  logger.info('handleToolCall', `工具调用: ${name}`, args)
  
  // 记录工具调用统计
  recordToolCall(name)
  
  const registry = readJson(REGISTRY_PATH)
  const templates = registry.templates || []

  // list_templates
  if (name === 'list_templates') {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(templates.map(t => ({ id: t.id, name: t.name, techStack: t.techStack })), null, 2) 
      }] 
    }
  }

  // get_template
  if (name === 'get_template') {
    const input = z.object({ id: z.string() }).parse(args)
    const tpl = templates.find(t => t.id === input.id)
    return { 
      content: [{ 
        type: 'text', 
        text: tpl ? JSON.stringify(tpl, null, 2) : `Template not found: ${input.id}` 
      }] 
    }
  }

  // match_template
  if (name === 'match_template') {
    const input = z.object({ 
      text: z.string(), 
      topK: z.number().default(3) 
    }).parse(args)
    
    const scored = templates.map(t => ({
      ...scoreTemplate(input.text.toLowerCase(), t),
      id: t.id,
      name: t.name,
      techStack: t.techStack
    }))
    scored.sort((a, b) => b.score - a.score)
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(scored.slice(0, input.topK), null, 2) 
      }] 
    }
  }

  // build_prompt
  if (name === 'build_prompt') {
    const input = z.object({ 
      text: z.string(), 
      templateId: z.string().optional() 
    }).parse(args)
    
    const result = buildEnhancedPrompt(input.text, input.templateId, templates)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // get_component_knowledge
  if (name === 'get_component_knowledge') {
    const input = z.object({ 
      scope: z.enum(['common', 'business']).default('common'), 
      projectId: z.string().optional() 
    }).parse(args)
    
    const knowledge = getComponentKnowledge(input.scope, input.projectId)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(knowledge, null, 2) 
      }] 
    }
  }

  // get_code_examples
  if (name === 'get_code_examples') {
    const input = z.object({ templateId: z.string() }).parse(args)
    const examples = getCodeExamples(input.templateId)
    return { 
      content: [{ 
        type: 'text', 
        text: examples ? JSON.stringify(examples, null, 2) : 'No examples found' 
      }] 
    }
  }

  // search_spec
  if (name === 'search_spec') {
    const input = z.object({ 
      query: z.string(), 
      maxResults: z.number().default(10),
      specPath: z.string().optional(),
      projectPath: z.string().optional()
    }).parse(args)
    
    const resolvedPath = resolveSpecPath(input.specPath, input.projectPath)
    const results = searchSpecLines(input.query, input.maxResults, resolvedPath)
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({ 
          specPath: resolvedPath, 
          projectPath: input.projectPath || '(未指定)',
          results 
        }, null, 2) 
      }] 
    }
  }

  // get_spec_content
  if (name === 'get_spec_content') {
    const input = z.object({ 
      specPath: z.string().optional(), 
      projectPath: z.string().optional(),
      section: z.string().optional() 
    }).parse(args)
    
    const result = getSpecContent(input.specPath, input.projectPath, input.section)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // detect_tech_stack
  if (name === 'detect_tech_stack') {
    const input = z.object({ projectPath: z.string().optional() }).parse(args)
    const result = detectTechStack(input.projectPath)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // smart_match_template
  if (name === 'smart_match_template') {
    const input = z.object({ 
      text: z.string(), 
      projectPath: z.string().optional(), 
      topK: z.number().default(5) 
    }).parse(args)
    
    const techStackInfo = detectTechStack(input.projectPath)
    const result = smartMatchTemplate(input.text, templates, techStackInfo, input.projectPath)
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // find_similar_components
  if (name === 'find_similar_components') {
    const input = z.object({ 
      searchText: z.string(), 
      projectPath: z.string().optional(), 
      techStack: z.string().optional() 
    }).parse(args)
    
    const results = findSimilarComponents(input.searchText, input.projectPath, input.techStack)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(results, null, 2) 
      }] 
    }
  }

  // check_global_types
  if (name === 'check_global_types') {
    const input = z.object({ projectPath: z.string().optional() }).parse(args)
    const result = checkGlobalTypes(input.projectPath)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // parse_api_types
  if (name === 'parse_api_types') {
    const input = z.object({ filePath: z.string() }).parse(args)
    const result = parseApiTypes(input.filePath)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // generate_code_context
  if (name === 'generate_code_context') {
    const input = z.object({
      text: z.string().min(1),
      projectPath: z.string().optional(),
      apiTypesPath: z.string().optional(),
    }).parse(args)
    
    const result = generateCodeContext(input.text, input.projectPath, input.apiTypesPath)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // check_code_compliance
  if (name === 'check_code_compliance') {
    const input = z.object({
      generatedFiles: z.array(z.string()),
      projectPath: z.string().optional(),
    }).parse(args)
    
    const result = checkCodeCompliance(input.generatedFiles, input.projectPath)
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // quick_generate
  if (name === 'quick_generate') {
    const input = z.object({
      text: z.string().min(1),
      projectPath: z.string().optional(),
    }).parse(args)
    
    const result = quickGenerate(input.text, input.projectPath)
    
    // 记录模板使用
    if (result.summary?.matchedTemplate) {
      recordTemplateUsage(result.summary.matchedTemplate, true)
    }
    // 记录技术栈检测
    if (result.summary?.techStack) {
      recordTechStackDetection(result.summary.techStack, result.techStack?.projectName)
    }
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // get_stats
  if (name === 'get_stats') {
    const stats = getStatsSummary()
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(stats, null, 2) 
      }] 
    }
  }

  // analyze_project
  if (name === 'analyze_project') {
    const input = z.object({
      projectPath: z.string().optional(),
      moduleName: z.string().optional(),
    }).parse(args)
    
    // 分析项目结构
    const projectContext = analyzeProjectStructure(input.projectPath)
    
    // 检测代码风格
    const codeStyle = detectCodeStyle(input.projectPath)
    
    // 生成推荐路径（如果提供了模块名）
    let fileSuggestions = null
    if (projectContext.analyzed && input.moduleName) {
      // 检测技术栈以确定文件扩展名
      const techStack = detectTechStack(input.projectPath)
      fileSuggestions = suggestFilePaths(projectContext, input.moduleName, techStack.techStack)
    }
    
    const result = {
      projectContext,
      codeStyle,
      fileSuggestions,
      summary: {
        analyzed: projectContext.analyzed,
        directories: projectContext.directories,
        routerType: projectContext.routerType,
        stateManagement: projectContext.stateManagement,
        hasPrettier: codeStyle.prettier?.found,
        hasEslint: codeStyle.eslint?.found,
        hasTypeScript: codeStyle.typescript?.found,
        tsStrict: codeStyle.typescript?.strict
      }
    }
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  // validate_code
  if (name === 'validate_code') {
    const input = z.object({
      projectPath: z.string(),
      files: z.array(z.string()).optional(),
    }).parse(args)
    
    const result = validateCode(input.projectPath, input.files || [])
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify(result, null, 2) 
      }] 
    }
  }

  throw new Error(`Unknown tool: ${name}`)
}
