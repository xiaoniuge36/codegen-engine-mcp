import { logger, readJson, REGISTRY_PATH } from '../utils/index.js'
import { 
  detectTechStack, 
  smartMatchTemplate, 
  getCodeExamples, 
  getComponentKnowledge,
  analyzeProjectStructure,
  suggestFilePaths,
  detectCodeStyle,
  parseCompositeRequirement,
  resolveFolderName
} from '../matching/index.js'
import { checkGlobalTypes } from '../types/index.js'
import { getSpecContent } from '../spec/index.js'
import { buildEnhancedPrompt } from './prompts.js'

/**
 * 一键快速生成 - 合并所有准备步骤
 * 替代手动调用多个工具的流程
 */
export function quickGenerate(text, projectPath = null, options = {}) {
  logger.info('quickGenerate', '🚀 一键快速生成启动', { 
    text: text?.substring(0, 100), 
    projectPath,
    options 
  })
  
  const startTime = Date.now()
  const steps = []
  const errors = []
  
  // Step 1: 检测技术栈
  steps.push({ step: 1, name: '检测技术栈', status: 'running' })
  let techStackInfo
  try {
    techStackInfo = detectTechStack(projectPath)
    steps[0].status = 'done'
    steps[0].result = {
      techStack: techStackInfo.techStack,
      framework: techStackInfo.framework,
      uiLibrary: techStackInfo.uiLibrary
    }
  } catch (e) {
    steps[0].status = 'error'
    steps[0].error = e.message
    errors.push({ step: 1, error: e.message })
    techStackInfo = { detected: false, techStack: 'unknown' }
  }
  
  // Step 2: 检查全局类型
  steps.push({ step: 2, name: '检查全局类型', status: 'running' })
  let globalTypesInfo
  try {
    globalTypesInfo = checkGlobalTypes(projectPath)
    steps[1].status = 'done'
    steps[1].result = {
      found: globalTypesInfo.found,
      globalInterfaces: globalTypesInfo.globalInterfaces?.length || 0
    }
  } catch (e) {
    steps[1].status = 'error'
    steps[1].error = e.message
    errors.push({ step: 2, error: e.message })
    globalTypesInfo = { found: false }
  }
  
  // Step 3: 智能匹配模板
  steps.push({ step: 3, name: '智能匹配模板', status: 'running' })
  const registry = readJson(REGISTRY_PATH)
  const templates = registry.templates || []
  let matchResult
  try {
    matchResult = smartMatchTemplate(text, templates, techStackInfo, projectPath)
    steps[2].status = 'done'
    steps[2].result = {
      matched: !!matchResult.chosen,
      templateId: matchResult.chosen?.id,
      templateName: matchResult.chosen?.name,
      score: matchResult.chosen?.score
    }
  } catch (e) {
    steps[2].status = 'error'
    steps[2].error = e.message
    errors.push({ step: 3, error: e.message })
    matchResult = { chosen: null }
  }
  
  // Step 4: 获取示例代码
  steps.push({ step: 4, name: '获取示例代码', status: 'running' })
  let codeExamples = null
  if (matchResult.chosen) {
    try {
      codeExamples = getCodeExamples(matchResult.chosen.id)
      steps[3].status = 'done'
      steps[3].result = {
        hasExamples: !!codeExamples,
        fileCount: codeExamples ? Object.keys(codeExamples).length : 0
      }
    } catch (e) {
      steps[3].status = 'error'
      steps[3].error = e.message
      errors.push({ step: 4, error: e.message })
    }
  } else {
    steps[3].status = 'skipped'
    steps[3].result = { reason: '未匹配到模板' }
  }
  
  // Step 5: 获取组件知识
  steps.push({ step: 5, name: '获取组件知识', status: 'running' })
  let componentKnowledge
  try {
    componentKnowledge = getComponentKnowledge('common')
    steps[4].status = 'done'
    steps[4].result = {
      knowledgeFiles: Object.keys(componentKnowledge).length
    }
  } catch (e) {
    steps[4].status = 'error'
    steps[4].error = e.message
    errors.push({ step: 5, error: e.message })
    componentKnowledge = {}
  }
  
  // Step 6: 获取规范内容
  steps.push({ step: 6, name: '获取规范内容', status: 'running' })
  let specContent
  try {
    specContent = getSpecContent(null, projectPath, null)
    steps[5].status = 'done'
    steps[5].result = {
      loaded: specContent.success,
      path: specContent.specPath,
      contentLength: specContent.content?.length || 0
    }
  } catch (e) {
    steps[5].status = 'error'
    steps[5].error = e.message
    errors.push({ step: 6, error: e.message })
    specContent = { success: false }
  }
  
  // Step 7: 构建增强提示词
  steps.push({ step: 7, name: '构建增强提示词', status: 'running' })
  let enhancedPrompt = null
  if (matchResult.chosen) {
    try {
      enhancedPrompt = buildEnhancedPrompt(text, matchResult.chosen.id, templates)
      steps[6].status = 'done'
      steps[6].result = {
        hasPrompt: !!enhancedPrompt?.prompt
      }
    } catch (e) {
      steps[6].status = 'error'
      steps[6].error = e.message
      errors.push({ step: 7, error: e.message })
    }
  } else {
    steps[6].status = 'skipped'
    steps[6].result = { reason: '未匹配到模板' }
  }
  
  // Step 8: 解析文件夹名称（用户指定 或 自动生成）
  steps.push({ step: 8, name: '解析文件夹名称', status: 'running' })
  let folderNameResult = null
  try {
    folderNameResult = resolveFolderName(text, matchResult.chosen?.id)
    steps[7].status = 'done'
    steps[7].result = {
      folderName: folderNameResult.folderName,
      source: folderNameResult.source,
      message: folderNameResult.message
    }
  } catch (e) {
    steps[7].status = 'error'
    steps[7].error = e.message
    errors.push({ step: 8, error: e.message })
    folderNameResult = { folderName: 'new-page', source: 'default' }
  }
  
  // Step 9: 分析项目结构（上下文感知）
  steps.push({ step: 9, name: '分析项目结构', status: 'running' })
  let projectContext = null
  let fileSuggestions = null
  try {
    projectContext = analyzeProjectStructure(projectPath)
    if (projectContext.analyzed) {
      // 使用解析出的文件夹名称
      const moduleName = folderNameResult.folderName
      fileSuggestions = suggestFilePaths(projectContext, moduleName, techStackInfo.techStack)
    }
    steps[8].status = 'done'
    steps[8].result = {
      analyzed: projectContext.analyzed,
      directories: projectContext.directories,
      routerType: projectContext.routerType,
      stateManagement: projectContext.stateManagement
    }
  } catch (e) {
    steps[8].status = 'error'
    steps[8].error = e.message
    errors.push({ step: 9, error: e.message })
  }
  
  // Step 10: 检测代码风格配置
  steps.push({ step: 10, name: '检测代码风格', status: 'running' })
  let codeStyleConfig = null
  try {
    codeStyleConfig = detectCodeStyle(projectPath)
    steps[9].status = 'done'
    steps[9].result = {
      prettier: codeStyleConfig.prettier?.found,
      eslint: codeStyleConfig.eslint?.found,
      typescript: codeStyleConfig.typescript?.found,
      strict: codeStyleConfig.typescript?.strict
    }
  } catch (e) {
    steps[9].status = 'error'
    steps[9].error = e.message
    errors.push({ step: 10, error: e.message })
  }
  
  // Step 11: 解析组合需求
  steps.push({ step: 11, name: '解析组合需求', status: 'running' })
  let compositeRequirement = null
  try {
    compositeRequirement = parseCompositeRequirement(text)
    steps[10].status = 'done'
    steps[10].result = {
      isComposite: compositeRequirement.isComposite,
      templates: compositeRequirement.templates
    }
  } catch (e) {
    steps[10].status = 'error'
    steps[10].error = e.message
    errors.push({ step: 11, error: e.message })
  }
  
  const duration = Date.now() - startTime
  
  // 构建最终结果
  const result = {
    success: errors.length === 0,
    duration: `${duration}ms`,
    
    // 执行摘要
    summary: {
      techStack: techStackInfo.techStack || 'unknown',
      framework: techStackInfo.framework,
      uiLibrary: techStackInfo.uiLibrary,
      matchedTemplate: matchResult.chosen?.id,
      matchedTemplateName: matchResult.chosen?.name,
      globalTypesFound: globalTypesInfo.found,
      globalTypesCount: globalTypesInfo.globalInterfaces?.length || 0,
      hasExamples: !!codeExamples,
      hasSpec: specContent.success,
      // 文件夹名称信息
      folderName: folderNameResult?.folderName,
      folderNameSource: folderNameResult?.source
    },
    
    // 执行步骤
    steps,
    errors: errors.length > 0 ? errors : undefined,
    
    // 详细数据
    techStack: techStackInfo,
    globalTypes: globalTypesInfo,
    templateMatch: {
      chosen: matchResult.chosen,
      top5: matchResult.top?.slice(0, 5),
      fallbackUsed: matchResult.fallbackUsed,
      recommendation: matchResult.recommendation
    },
    codeExamples,
    componentKnowledge: Object.keys(componentKnowledge),
    
    // 增强提示词
    enhancedPrompt: enhancedPrompt?.prompt,
    
    // 规范内容
    specContent: specContent.success ? {
      path: specContent.specPath,
      content: specContent.content
    } : null,
    
    // 核心规则提醒
    coreRules: [
      '⛔【绝对禁止】省略 hooks/composables 文件的生成',
      '⛔【绝对禁止】将业务逻辑直接写在组件中',
      '⛔【绝对禁止】先生成组件主文件再生成 hooks 文件',
      '⛔【绝对禁止】重复引入全局类型（types/global.d.ts 中的类型直接使用，不要 import）',
      '⛔【绝对禁止】生成任何 mock 数据或假数据',
      '⛔【绝对禁止】推测或编造 API 字段',
      '⛔【绝对禁止】省略代码自检和修复流程'
    ],
    
    // 全局类型警告
    globalTypesWarning: globalTypesInfo.found 
      ? `🚨 警告：以下类型是全局声明的，【绝对不要 import】：${globalTypesInfo.globalInterfaces?.join(', ')}`
      : null,
    
    // ⭐⭐⭐ 强制执行顺序（必须遵守）
    mandatorySteps: {
      current: '1️⃣ 已完成：获取代码生成上下文',
      next: '2️⃣ 下一步：根据 codeExamples 和 enhancedPrompt 生成代码（严格遵守 coreRules）',
      final: '3️⃣ 【必须】生成代码后调用 check_code_compliance 检查',
      warning: '⚠️ 跳过 check_code_compliance 将导致代码质量问题'
    },
    
    // 下一步建议（详细）
    nextSteps: [
      '1️⃣ 【遵守规则】严格按照 coreRules 中的禁止项执行',
      '2️⃣ 【先 hooks】优先生成 hooks/composables 文件',
      '3️⃣ 【后组件】再生成组件主文件（index.tsx/index.vue）',
      '4️⃣ 【必须检查】生成完成后必须调用 check_code_compliance',
      '5️⃣ 【输出报告】展示自检报告给用户'
    ],
    
    // 文件夹名称解析结果（新增）
    folderName: folderNameResult ? {
      name: folderNameResult.folderName,
      source: folderNameResult.source,
      message: folderNameResult.message,
      extractedBusiness: folderNameResult.extractedBusiness
    } : null,
    
    // 项目上下文
    projectContext: projectContext?.analyzed ? {
      rootDir: projectContext.rootDir,
      directories: projectContext.directories,
      suggestedPaths: projectContext.suggestedPaths,
      routerType: projectContext.routerType,
      stateManagement: projectContext.stateManagement
    } : null,
    
    // 推荐文件路径（新增）
    fileSuggestions,
    
    // 代码风格配置（新增）
    codeStyle: codeStyleConfig?.detected ? {
      prettier: codeStyleConfig.prettier,
      eslint: codeStyleConfig.eslint,
      typescript: codeStyleConfig.typescript
    } : null,
    
    // 组合需求分析（新增）
    compositeRequirement: compositeRequirement?.isComposite ? {
      isComposite: true,
      mainTemplate: compositeRequirement.mainTemplate,
      subTemplates: compositeRequirement.subTemplates,
      allTemplates: compositeRequirement.templates
    } : null,
    
    // 自检报告模板
    selfCheckTemplate: `
## 代码生成自检报告
✅ **检查通过项**
- [ ] hooks/composables 文件已生成
- [ ] 全局类型未重复引入
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过

⚠️ **已修复问题**
- （列出已自动修复的问题）

📋 **生成文件清单**
- （列出所有生成的文件）

✅ **代码质量确认**
- 代码已准备就绪，可直接使用
`
  }
  
  logger.info('quickGenerate', '🎉 一键快速生成完成', { 
    duration, 
    success: result.success,
    template: result.summary.matchedTemplate 
  })
  
  return result
}
