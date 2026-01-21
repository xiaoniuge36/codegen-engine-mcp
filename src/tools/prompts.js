import { logger, readJson, REGISTRY_PATH } from '../utils/index.js'
import { resolveSpecPath } from '../spec/index.js'
import { extractExplicitTemplateId, scoreTemplate, getComponentKnowledge, getCodeExamples } from '../matching/index.js'

/**
 * 提示词骨架模板
 */
export function promptSkeletonByKey(key, requirementText) {
  const requirement = requirementText || '[替换为你的需求原句]'
  
  if (key === 'reactNonStandardDetail') {
    return `任务标准：ai-fe-code-std.md 为标准执行任务
文件夹名称: detail
页面类型：非标独立详情页
页面需求：${requirement}

⚠️ 必须生成以下文件：
1. hooks/useDetailData.ts - 详情数据获取逻辑（必须第一个生成）
2. index.tsx - 详情页组件
3. types.ts - 类型定义

生成后必须执行自检并输出自检报告。`
  }
  
  if (key === 'reactStandardListCrud') {
    return `任务标准：ai-fe-code-std.md 为标准执行任务
文件夹名称: list
页面类型：标准列表页（CRUD）
页面需求：${requirement}

⚠️ 必须生成以下文件：
1. hooks/useTableData.ts - 表格数据获取逻辑（必须第一个生成）
2. index.tsx - 列表页组件
3. components/EditModal.tsx - 编辑弹窗
4. types.ts - 类型定义

生成后必须执行自检并输出自检报告。`
  }
  
  // 默认模板
  return `任务标准：ai-fe-code-std.md 为标准执行任务
页面需求：${requirement}

⚠️ 生成代码时必须：
1. 先生成 hooks/composables 文件
2. 检查全局类型，避免重复引入
3. 生成后执行自检并输出自检报告`
}

/**
 * 构建增强版提示词
 */
export function buildEnhancedPrompt(text, templateId, templates) {
  logger.info('buildEnhancedPrompt', '构建增强版提示词', { text: text?.substring(0, 50), templateId })
  
  // 提取明确的模板 ID
  const explicit = extractExplicitTemplateId(text, templates)
  const finalTemplateId = templateId || explicit.templateId
  const requirementText = explicit.restText || text
  
  let template = null
  if (finalTemplateId) {
    template = templates.find(t => t.id === finalTemplateId)
  }
  
  // 如果没有明确指定，尝试匹配
  if (!template) {
    const scored = templates.map(t => ({
      ...scoreTemplate(text.toLowerCase(), t),
      template: t
    }))
    scored.sort((a, b) => b.score - a.score)
    if (scored[0]?.score >= 3) {
      template = scored[0].template
    }
  }
  
  const result = {
    matched: !!template,
    templateId: template?.id,
    templateName: template?.name,
    prompt: '',
    enhancedContext: {
      specPath: resolveSpecPath(),
      componentKnowledge: null,
      codeExamples: null
    }
  }
  
  // 生成提示词骨架
  if (template?.promptTemplateKey) {
    result.prompt = promptSkeletonByKey(template.promptTemplateKey, requirementText)
  } else {
    result.prompt = promptSkeletonByKey('default', requirementText)
  }
  
  // 获取组件库知识
  result.enhancedContext.componentKnowledge = Object.keys(getComponentKnowledge('common'))
  
  // 获取示例代码
  if (template?.id) {
    const examples = getCodeExamples(template.id)
    if (examples) {
      result.enhancedContext.codeExamples = Object.keys(examples)
    }
  }
  
  logger.info('buildEnhancedPrompt', '提示词构建完成', { 
    matched: result.matched, 
    templateId: result.templateId 
  })
  
  return result
}
