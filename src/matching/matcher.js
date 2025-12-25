import { logger, normalizeText } from '../utils/index.js'
import { findSimilarComponents } from './tech-stack.js'

/**
 * 模板评分
 */
export function scoreTemplate(text, tpl) {
  const keywords = Array.isArray(tpl.keywords) ? tpl.keywords : []
  const antiKeywords = Array.isArray(tpl.antiKeywords) ? tpl.antiKeywords : []

  let score = 0
  const hits = []
  const antiHits = []

  for (const k of keywords) {
    const kk = String(k).toLowerCase()
    if (kk && text.includes(kk)) {
      score += 2
      hits.push(k)
    }
  }
  for (const k of antiKeywords) {
    const kk = String(k).toLowerCase()
    if (kk && text.includes(kk)) {
      score -= 3
      antiHits.push(k)
    }
  }

  // Heuristic boosts
  if (tpl.scenes && tpl.scenes.includes('import')) {
    if (text.includes('excel') || text.includes('xlsx') || text.includes('导入') || text.includes('上传')) score += 3
  }
  if (tpl.scenes && tpl.scenes.includes('detail')) {
    if (text.includes('详情') || text.includes('单据') || text.includes('审批') || text.includes('流程')) score += 3
  }

  return { score, hits, antiHits }
}

/**
 * 智能匹配模板
 */
export function smartMatchTemplate(text, templates, techStackInfo = null, projectPath = null) {
  logger.info('smartMatchTemplate', '开始智能匹配模板', { text: text?.substring(0, 100), techStack: techStackInfo?.techStack })
  
  const normalized = normalizeText(text)
  
  // 对每个模板评分，考虑技术栈
  const scored = templates.map(tpl => {
    const baseResult = scoreTemplate(normalized, tpl)
    let score = baseResult.score
    const boosts = []
    
    // 技术栈匹配加分
    if (techStackInfo?.detected && tpl.techStack) {
      const projTech = techStackInfo.techStack.toLowerCase()
      const tplTech = tpl.techStack.toLowerCase()
      
      if (projTech === tplTech) {
        score += 10
        boosts.push(`技术栈完全匹配: ${tplTech}`)
      } else if (
        (projTech === 'vue2' && tplTech === 'vue') ||
        (projTech === 'vue3' && tplTech === 'vue') ||
        (projTech.startsWith('vue') && tplTech.startsWith('vue'))
      ) {
        score += 5
        boosts.push(`技术栈部分匹配: ${tplTech}`)
      } else if (projTech !== tplTech) {
        score -= 15
        boosts.push(`技术栈不匹配: 项目=${projTech}, 模板=${tplTech}`)
      }
    }
    
    // UI 库匹配加分
    if (techStackInfo?.uiLibrary && tpl.keywords) {
      const uiLib = techStackInfo.uiLibrary.toLowerCase()
      const hasUIKeyword = tpl.keywords.some(k => 
        String(k).toLowerCase().includes(uiLib) ||
        (uiLib === 'antd' && String(k).toLowerCase().includes('ant')) ||
        (uiLib === 'element-plus' && String(k).toLowerCase().includes('element')) ||
        (uiLib === 'element-ui' && String(k).toLowerCase().includes('element'))
      )
      if (hasUIKeyword) {
        score += 3
        boosts.push(`UI库匹配: ${uiLib}`)
      }
    }
    
    return {
      id: tpl.id,
      name: tpl.name,
      techStack: tpl.techStack,
      score,
      baseScore: baseResult.score,
      hits: baseResult.hits,
      antiHits: baseResult.antiHits,
      boosts,
    }
  })
  
  // 按分数排序
  scored.sort((a, b) => b.score - a.score)
  
  const chosen = scored[0]
  
  // 如果最高分太低，尝试兜底查找
  let fallbackResults = null
  if (chosen.score < 3 && projectPath) {
    logger.info('smartMatchTemplate', '模板匹配分数过低，尝试兜底查找项目中的相似组件')
    fallbackResults = findSimilarComponents(text, projectPath, techStackInfo?.techStack)
  }
  
  const result = {
    techStackInfo,
    top: scored.slice(0, 5),
    chosen: chosen.score >= 3 ? chosen : null,
    fallbackUsed: chosen.score < 3,
    fallbackResults,
    recommendation: chosen.score < 3 
      ? '未找到高匹配度的模板，建议参考项目中的相似组件或提供更多需求关键词'
      : `推荐使用模板: ${chosen.name}`
  }
  
  logger.info('smartMatchTemplate', '智能匹配完成', { 
    chosenId: result.chosen?.id, 
    chosenScore: result.chosen?.score,
    fallbackUsed: result.fallbackUsed 
  })
  
  return result
}

/**
 * 检查是否为结构化提示词
 */
export function isStructuredPrompt(text) {
  const t = String(text || '')
  return (
    t.includes('任务标准：') ||
    t.includes('文件夹名称') ||
    t.includes('页面类型') ||
    t.includes('接口及数据结构') ||
    t.includes('页面需求：')
  )
}

/**
 * 提取明确的模板 ID
 */
export function extractExplicitTemplateId(rawInput, templates) {
  const input = String(rawInput || '').trim()
  if (!input) return { templateId: undefined, restText: '' }

  const ids = new Set((templates || []).map((t) => t.id))
  const hits = []

  const patterns = [
    /(?:^|\s)([a-z0-9][a-z0-9-]{2,})(?:\s|$)/gi,
    /(?:模板id|组件id|templateId|template-id|id)\s*[:=]\s*([a-z0-9][a-z0-9-]{2,})/gi,
  ]

  for (const re of patterns) {
    let m
    while ((m = re.exec(input))) {
      const cand = m[1]
      if (ids.has(cand)) hits.push({ id: cand, index: m.index, len: m[0].length })
    }
  }

  if (hits.length === 0) return { templateId: undefined, restText: input }

  hits.sort((a, b) => a.index - b.index)
  const chosen = hits[0]

  const before = input.slice(0, chosen.index)
  const after = input.slice(chosen.index + chosen.len)
  const restText = `${before} ${after}`.replace(/\s+/g, ' ').trim()

  logger.info('extractExplicitTemplateId', `提取到明确的模板ID: ${chosen.id}`, { restText })

  return { templateId: chosen.id, restText }
}
