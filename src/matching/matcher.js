import { logger, normalizeText } from '../utils/index.js'
import { findSimilarComponents } from './tech-stack.js'

/**
 * 场景权重配置
 */
const SCENE_WEIGHTS = {
  // 导入场景
  import: {
    keywords: ['excel', 'xlsx', 'xls', '导入', '导入数据', '批量导入', '上传excel', '模板下载', '导入历史'],
    weight: 5
  },
  // 详情场景
  detail: {
    keywords: ['详情', '详情页', '单据详情', '审批', '流程', '节点', '时间轴', '附件预览'],
    weight: 4
  },
  // 列表场景
  list: {
    keywords: ['列表', '列表页', '表格', '查询', '搜索', 'crud', '增删改查'],
    weight: 3
  },
  // 表单场景
  form: {
    keywords: ['表单', '新增', '编辑', '提交', '保存'],
    weight: 3
  },
  // 弹窗场景
  modal: {
    keywords: ['弹窗', '弹框', '对话框', 'modal', '抽屉', 'drawer'],
    weight: 2
  },
  // 上传场景
  upload: {
    keywords: ['上传', '文件上传', '图片上传', '附件', 'upload'],
    weight: 4
  },
  // 大数据渲染场景
  bigdata: {
    keywords: ['虚拟列表', '虚拟滚动', '分页下拉', '大数据', '大数据量', '8000', '万级', '高性能', 'virtual', '回显', '属性值'],
    weight: 6
  },
  // 虚拟滚动场景
  virtual: {
    keywords: ['虚拟', 'virtual', 'scroller', 'el-table-v2', 'react-window', '不分页'],
    weight: 5
  },
  // 分页下拉场景
  paginated: {
    keywords: ['分页下拉', '分页选择', '远程搜索', '远程分页', '下拉分页', '编辑回显'],
    weight: 5
  }
}

/**
 * 模板评分（增强版）
 */
export function scoreTemplate(text, tpl) {
  const keywords = Array.isArray(tpl.keywords) ? tpl.keywords : []
  const antiKeywords = Array.isArray(tpl.antiKeywords) ? tpl.antiKeywords : []
  const scenes = Array.isArray(tpl.scenes) ? tpl.scenes : []

  let score = 0
  const hits = []
  const antiHits = []
  const sceneBoosts = []

  // 基础关键词匹配
  for (const k of keywords) {
    const kk = String(k).toLowerCase()
    if (kk && text.includes(kk)) {
      // 精确匹配加分更高
      if (text.includes(kk + '页') || text.includes(kk + '组件')) {
        score += 3
      } else {
        score += 2
      }
      hits.push(k)
    }
  }
  
  // 反向关键词扣分
  for (const k of antiKeywords) {
    const kk = String(k).toLowerCase()
    if (kk && text.includes(kk)) {
      score -= 3
      antiHits.push(k)
    }
  }

  // 场景权重加分（增强版）
  for (const scene of scenes) {
    const config = SCENE_WEIGHTS[scene]
    if (config) {
      const matchedKeywords = config.keywords.filter(kw => text.includes(kw.toLowerCase()))
      if (matchedKeywords.length > 0) {
        const boost = config.weight * matchedKeywords.length
        score += boost
        sceneBoosts.push(`${scene}: +${boost} (匹配: ${matchedKeywords.join(', ')})`)
      }
    }
  }

  // 特殊场景组合加分
  if (scenes.includes('import') && (text.includes('excel') || text.includes('导入'))) {
    if (!text.includes('详情') && !text.includes('单据')) {
      score += 5
      sceneBoosts.push('导入场景组合: +5')
    }
  }
  
  if (scenes.includes('detail') && (text.includes('详情') || text.includes('单据'))) {
    if (!text.includes('导入') && !text.includes('excel')) {
      score += 5
      sceneBoosts.push('详情场景组合: +5')
    }
  }

  // 大数据渲染场景组合加分
  if (scenes.includes('bigdata') || scenes.includes('virtual') || scenes.includes('paginated')) {
    const bigDataKeywords = ['虚拟', '分页下拉', '大数据', '8000', '万级', '回显']
    const matched = bigDataKeywords.filter(kw => text.includes(kw))
    if (matched.length >= 2) {
      score += 8
      sceneBoosts.push(`大数据渲染场景组合: +8 (匹配: ${matched.join(', ')})`)
    } else if (matched.length === 1) {
      score += 4
      sceneBoosts.push(`大数据渲染场景: +4 (匹配: ${matched[0]})`)
    }
  }

  return { score, hits, antiHits, sceneBoosts }
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
