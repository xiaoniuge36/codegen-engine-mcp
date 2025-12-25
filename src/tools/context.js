import { logger, readJson, REGISTRY_PATH } from '../utils/index.js'
import { resolveSpecPath } from '../spec/index.js'
import { 
  detectTechStack, 
  smartMatchTemplate, 
  extractExplicitTemplateId,
  getComponentKnowledge,
  getCodeExamples
} from '../matching/index.js'
import { checkGlobalTypes, parseApiTypes } from '../types/index.js'
import { buildEnhancedPrompt } from './prompts.js'

/**
 * 一键生成完整代码上下文
 */
export function generateCodeContext(text, projectPath = null, apiTypesPath = null) {
  logger.info('generateCodeContext', '一键生成代码上下文', { 
    text: text?.substring(0, 100), 
    projectPath,
    apiTypesPath 
  })
  
  const registry = readJson(REGISTRY_PATH)
  const templates = registry.templates || []
  
  // 1. 检测技术栈
  const techStackInfo = detectTechStack(projectPath)
  
  // 2. 检查全局类型
  const globalTypesInfo = checkGlobalTypes(projectPath)
  
  // 3. 智能匹配模板
  const explicit = extractExplicitTemplateId(text, templates)
  let matchResult
  
  if (explicit.templateId) {
    const tpl = templates.find(t => t.id === explicit.templateId)
    if (tpl) {
      matchResult = {
        chosen: { id: tpl.id, name: tpl.name, techStack: tpl.techStack, score: 999 },
        fallbackUsed: false,
        recommendation: `使用明确指定的模板: ${tpl.name}`
      }
    }
  }
  
  if (!matchResult) {
    matchResult = smartMatchTemplate(
      explicit.restText || text,
      templates,
      techStackInfo,
      projectPath
    )
  }
  
  // 4. 获取示例代码
  let codeExamples = null
  if (matchResult.chosen) {
    codeExamples = getCodeExamples(matchResult.chosen.id)
  }
  
  // 5. 获取组件库知识
  const componentKnowledge = getComponentKnowledge('common')
  
  // 6. 解析接口类型（如果提供）
  let apiTypesInfo = null
  if (apiTypesPath) {
    apiTypesInfo = parseApiTypes(apiTypesPath)
  }
  
  // 7. 构建增强提示词
  let enhancedPrompt = null
  if (matchResult.chosen) {
    const tpl = templates.find(t => t.id === matchResult.chosen.id)
    if (tpl) {
      enhancedPrompt = buildEnhancedPrompt(
        explicit.restText || text,
        tpl.id,
        templates
      )
    }
  }
  
  // 8. 生成代码生成检查清单
  const checklist = [
    `✅ 技术栈: ${techStackInfo.techStack || '未检测到'}`,
    `✅ UI 库: ${techStackInfo.uiLibrary || '未检测到'}`,
    `✅ 匹配模板: ${matchResult.chosen?.name || '未匹配'}`,
    globalTypesInfo.found 
      ? `⚠️ 全局类型: 发现 ${globalTypesInfo.globalInterfaces.length} 个全局 interface，生成代码时不要 import`
      : `✅ 全局类型: 未发现，可正常使用 import`,
    codeExamples 
      ? `✅ 示例代码: 已获取 ${Object.keys(codeExamples).length} 个文件`
      : `⚠️ 示例代码: 未找到`,
    apiTypesInfo?.success
      ? `✅ 接口类型: 解析到 ${apiTypesInfo.interfaces.length} 个 interface`
      : apiTypesPath ? `⚠️ 接口类型: 解析失败` : `ℹ️ 接口类型: 未提供`
  ]
  
  const result = {
    // 核心信息
    techStack: techStackInfo,
    globalTypes: globalTypesInfo,
    templateMatch: {
      chosen: matchResult.chosen,
      fallbackUsed: matchResult.fallbackUsed,
      fallbackResults: matchResult.fallbackResults,
      recommendation: matchResult.recommendation
    },
    
    // 代码资源
    codeExamples,
    componentKnowledge: Object.keys(componentKnowledge),
    apiTypes: apiTypesInfo,
    
    // 增强提示词
    enhancedPrompt: enhancedPrompt?.prompt,
    specPath: enhancedPrompt?.enhancedContext?.specPath,
    
    // 检查清单
    checklist,
    
    // 关键提醒
    criticalReminders: [
      globalTypesInfo.found 
        ? `🚨 全局类型警告: ${globalTypesInfo.globalInterfaces.join(', ')} 这些类型【绝对不要 import】，直接使用即可`
        : null,
      matchResult.chosen?.techStack !== techStackInfo.techStack
        ? `⚠️ 技术栈提醒: 项目是 ${techStackInfo.techStack}，但匹配到的模板是 ${matchResult.chosen?.techStack}`
        : null,
      '📋 必须先生成 hooks/composables 文件，再生成组件文件',
      '📋 生成后必须进行 TypeScript/ESLint 自检并修复'
    ].filter(Boolean),
    
    // 规则执行提醒（强化版）
    ruleEnforcement: {
      specPath: resolveSpecPath(null, projectPath),
      mandatory: true,
      
      // 执行流程（必须按顺序）
      executionFlow: [
        '0️⃣ 获取组件模板（已完成）',
        '1️⃣ 解析用户输入',
        '2️⃣ 检查项目环境（技术栈、依赖包、全局类型文件）⚠️ 必须检查 types/global.d.ts',
        '3️⃣ 判断模式（标准弹窗 vs 非标独立页面）',
        '4️⃣ 生成代码（每个文件生成前都要检查类型）⚠️ hooks 文件必须第一个生成',
        '5️⃣ 代码自检（TypeScript、ESLint、规范、功能）⚠️ 不得省略',
        '6️⃣ 自动修复错误（P0/P1/P2 优先级）',
        '7️⃣ 生成自检报告（✅ 检查通过项、⚠️ 已修复问题、📋 文件清单）'
      ],
      
      // 核心规则（绝对禁止违反）
      coreRules: [
        '⛔【绝对禁止】省略 hooks/composables 文件的生成',
        '⛔【绝对禁止】将业务逻辑直接写在组件中',
        '⛔【绝对禁止】先生成组件主文件再生成 hooks 文件',
        '⛔【绝对禁止】重复引入全局类型（types/global.d.ts 中的类型直接使用，不要 import）',
        '⛔【绝对禁止】生成任何 mock 数据或假数据',
        '⛔【绝对禁止】推测或编造 API 字段',
        '⛔【绝对禁止】省略代码自检和修复流程'
      ],
      
      // 必须执行的动作
      mandatoryActions: [
        '✅ hooks/composables 文件必须第一个生成（优先级最高）',
        '✅ 每个文件生成前检查全局类型，避免重复引入',
        '✅ 接口数据结构以用户提供的文件为主，不要推测字段',
        '✅ 生成完成后必须执行 TypeScript/ESLint 自检',
        '✅ 发现错误必须自动修复',
        '✅ 最后输出自检报告'
      ],
      
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
`,
      
      message: '⚠️ 以上规则必须 100% 执行，生成代码后必须输出自检报告'
    }
  }
  
  logger.info('generateCodeContext', '代码上下文生成完成', {
    techStack: techStackInfo.techStack,
    template: matchResult.chosen?.id,
    hasExamples: !!codeExamples,
    globalTypesFound: globalTypesInfo.found
  })
  
  return result
}
