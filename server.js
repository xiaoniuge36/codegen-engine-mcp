import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPO_ROOT = path.join(__dirname, '..')
const REGISTRY_PATH = path.join(__dirname, 'templates', 'template-registry.json')
const KNOWLEDGE_DIR = path.join(__dirname, 'knowledge')
const EXAMPLES_DIR = path.join(__dirname, 'templates', 'examples')

/**
 * 日志工具 - 记录所有工具调用
 */
const logger = {
  info: (tool, message, data = {}) => {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [INFO] [${tool}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
  error: (tool, message, error) => {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [ERROR] [${tool}] ${message}`, error?.message || error)
  },
  warn: (tool, message, data = {}) => {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [WARN] [${tool}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  }
}

/**
 * Spec source priority:
 * 1) Project-root Lingma rules (team convention): .lingma/rules/ai-fe-code-std.md
 * 2) Root-level standard spec (default): ai-fe-code-std.md
 * 3) Legacy spec file (fallback): AI前端代码生成执行规范（含vue、规范、完整版）.md
 */
const SPEC_CANDIDATES = [
  path.join(REPO_ROOT, '.lingma', 'rules', 'ai-fe-code-std.md'),
  path.join(REPO_ROOT, 'ai-fe-code-std.md'),
  path.join(REPO_ROOT, 'AI前端代码生成执行规范（含vue、规范、完整版）.md'),
]

function resolveSpecPath() {
  logger.info('resolveSpecPath', '开始查找规范文档...')
  for (const p of SPEC_CANDIDATES) {
    if (fs.existsSync(p)) {
      logger.info('resolveSpecPath', `找到规范文档: ${p}`)
      return p
    }
  }
  // 默认返回标准规范文件（ai-fe-code-std.md）
  const defaultPath = path.join(REPO_ROOT, 'ai-fe-code-std.md')
  logger.warn('resolveSpecPath', '未找到任何规范文档，返回默认路径', { path: defaultPath })
  return defaultPath
}

function readJson(p) {
  logger.info('readJson', `读取 JSON 文件: ${p}`)
  try {
    const content = JSON.parse(fs.readFileSync(p, 'utf8'))
    logger.info('readJson', `成功读取 JSON 文件，包含 ${content?.templates?.length || 0} 个模板`)
    return content
  } catch (error) {
    logger.error('readJson', `读取 JSON 文件失败: ${p}`, error)
    throw error
  }
}

function readText(p) {
  logger.info('readText', `读取文本文件: ${p}`)
  try {
    const content = fs.readFileSync(p, 'utf8')
    logger.info('readText', `成功读取文本文件，共 ${content.length} 字符`)
    return content
  } catch (error) {
    logger.error('readText', `读取文本文件失败: ${p}`, error)
    throw error
  }
}

function normalizeText(input) {
  return String(input || '').trim().toLowerCase()
}

function scoreTemplate(text, tpl) {
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

function isStructuredPrompt(text) {
  const t = String(text || '')
  return (
    t.includes('任务标准：') ||
    t.includes('文件夹名称') ||
    t.includes('页面类型') ||
    t.includes('接口及数据结构') ||
    t.includes('页面需求：')
  )
}

function extractExplicitTemplateId(rawInput, templates) {
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

/**
 * 🆕 获取组件库知识图谱
 */
function getComponentKnowledge(scope = 'common', projectId = null) {
  logger.info('getComponentKnowledge', `获取组件库知识图谱`, { scope, projectId })
  
  try {
    let knowledgePath
    if (scope === 'common') {
      // 读取通用组件库（所有 common 下的 md 文件）
      const commonDir = path.join(KNOWLEDGE_DIR, 'common')
      const files = fs.readdirSync(commonDir).filter(f => f.endsWith('.md'))
      
      logger.info('getComponentKnowledge', `找到 ${files.length} 个通用组件库文件`)
      
      const knowledge = {}
      for (const file of files) {
        const content = readText(path.join(commonDir, file))
        knowledge[file.replace('.md', '')] = content
      }
      
      return knowledge
    } else if (scope === 'business' && projectId) {
      // 读取业务组件库
      const businessDir = path.join(KNOWLEDGE_DIR, 'business', projectId)
      if (!fs.existsSync(businessDir)) {
        logger.warn('getComponentKnowledge', `业务组件库不存在: ${projectId}`)
        return {}
      }
      
      const files = fs.readdirSync(businessDir).filter(f => f.endsWith('.md'))
      logger.info('getComponentKnowledge', `找到 ${files.length} 个业务组件库文件`)
      
      const knowledge = {}
      for (const file of files) {
        const content = readText(path.join(businessDir, file))
        knowledge[file.replace('.md', '')] = content
      }
      
      return knowledge
    }
    
    return {}
  } catch (error) {
    logger.error('getComponentKnowledge', '获取组件库知识失败', error)
    return {}
  }
}

/**
 * 🆕 获取示例代码
 */
function getCodeExamples(templateId) {
  logger.info('getCodeExamples', `获取示例代码: ${templateId}`)
  
  try {
    // 从模板注册表中查找模板配置
    const registry = readJson(REGISTRY_PATH)
    const template = registry.templates.find(t => t.id === templateId)
    
    if (!template) {
      logger.warn('getCodeExamples', `未找到模板: ${templateId}`)
      return null
    }
    
    if (!template.paths || template.paths.length === 0) {
      logger.warn('getCodeExamples', `模板未配置 paths 字段: ${templateId}`)
      return null
    }
    
    // 获取实际的示例目录路径（paths 中存储的是相对于 templates 目录的路径）
    // 例如: "templates/examples/react-standard-list/" -> "react-standard-list"
    const templatePath = template.paths[0].replace(/^templates\/examples\//, '').replace(/\/$/, '')
    const exampleDir = path.join(EXAMPLES_DIR, templatePath)
    
    logger.info('getCodeExamples', `解析路径: ${template.paths[0]} -> ${exampleDir}`)
    
    if (!fs.existsSync(exampleDir)) {
      logger.warn('getCodeExamples', `示例代码目录不存在: ${exampleDir}`)
      return null
    }
    
    const examples = {}
    
    // 递归读取目录下的所有示例文件
    function readDirRecursive(dir, baseDir = '') {
      const files = fs.readdirSync(dir)
      
      for (const file of files) {
        const filePath = path.join(dir, file)
        const relativePath = path.join(baseDir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory()) {
          readDirRecursive(filePath, relativePath)
        } else if (file.endsWith('.example.ts') || file.endsWith('.example.tsx') || file.endsWith('.example.vue') || file.endsWith('.example.less') || file === 'sample.md') {
          examples[relativePath] = readText(filePath)
          logger.info('getCodeExamples', `读取示例文件: ${relativePath}`)
        }
      }
    }
    
    readDirRecursive(exampleDir)
    
    logger.info('getCodeExamples', `成功读取 ${Object.keys(examples).length} 个示例文件`)
    
    return examples
  } catch (error) {
    logger.error('getCodeExamples', `获取示例代码失败: ${templateId}`, error)
    return null
  }
}

/**
 * 🆕 构建增强版提示词（自动附加组件库知识和示例代码）
 */
function buildEnhancedPrompt(templateId, templateName, promptSkeletonKey, requirementText, template) {
  logger.info('buildEnhancedPrompt', `构建增强版提示词`, { templateId, templateName })
  
  // 生成基础提示词骨架
  const prompt = promptSkeletonByKey(promptSkeletonKey, requirementText)
  
  // 获取组件库知识图谱
  const componentScope = template.componentScope || 'common'
  const componentKnowledge = getComponentKnowledge(componentScope)
  
  // 获取示例代码
  const codeExamples = getCodeExamples(templateId)
  
  const result = {
    templateId,
    templateName,
    templatePaths: template.paths || [],
    prompt,
    enhancedContext: {
      componentKnowledge: Object.keys(componentKnowledge).length > 0 ? componentKnowledge : null,
      codeExamples: codeExamples && Object.keys(codeExamples).length > 0 ? codeExamples : null,
      specPath: resolveSpecPath()
    }
  }
  
  logger.info('buildEnhancedPrompt', `增强版提示词构建完成`, {
    hasComponentKnowledge: !!result.enhancedContext.componentKnowledge,
    hasCodeExamples: !!result.enhancedContext.codeExamples,
    exampleCount: codeExamples ? Object.keys(codeExamples).length : 0
  })
  
  return result
}

function promptSkeletonByKey(key, requirementText) {
  const requirement = requirementText || '[替换为你的需求原句]'
  if (key === 'reactNonStandardDetail') {
    return `任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：${requirement}

页面类型：非标独立页面（详情页，独立路由）

文件夹名称: detail

参考模板（本仓库）：组件/react-detail/

接口及数据结构（优先以文件为主）：
- 接口类型文件：[例如 travelApply.d.ts / 或 types 文件路径]
- 详情接口函数：[例如 applyDetailApi]
- 路由参数：id / appNo（写清楚从哪里取）

页面需求：
- 标题：[例如 出差申请单]
- 单据号：展示路由参数或 query 参数
- 模块：基础信息 / 业务信息(差旅信息) / 附件预览 / 流程信息(节点卡片) / 流程明细(表格)
- 字段展示规则：无数据不展示；时间格式 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss
- 交互：返回上一页；附件可预览；流程节点不同状态不同颜色

强制要求：
- 必须先生成 hooks 文件（数据获取 + 数据组装），组件内禁止直接调用 API
- 生成后必须进行 TypeScript/ESLint 自检并修复
`
  }

  if (key === 'reactImportModal') {
    return `任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：${requirement}

页面类型：导入页面/导入弹窗（Excel 导入）

文件夹名称: import

参考模板（本仓库）：组件/react-import-modal/index.tsx

接口及数据结构（优先以文件为主）：
- 模板下载接口：downloadTemplate
- 上传接口：uploadExcelDataAsyc / uploadExcelDataSync（二选一或都要）
- 导入记录列表接口：getBatchFileList
- 处理状态查询/轮询：getImportProcessingTask / getImportProcessingState
- 结果文件下载：downloadProcessedFile

页面/弹窗需求：
- 功能：模板下载、上传 Excel（仅 xlsx/xls）、自动触发提交、导入记录列表、下载处理结果/错误详情
- 约束：只允许 1 个文件；格式校验；支持异步导入轮询；导入中通知提示
- UI：按钮区（刷新/模板下载/上传），下方表格展示导入记录

强制要求：
- 禁止残留 console.log/debugger
- 类型引入遵循全局类型规则；ProTable/UploadProps 等第三方类型必须正确引入
- 生成后必须进行 TypeScript/ESLint 自检并修复
`
  }

  if (key === 'reactStandardListCrud') {
    return `任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：${requirement}

页面类型：标准列表页（搜索 + 表格 + 新增/编辑弹窗，可含删除/批量操作）

文件夹名称: <kebab-case，例如 employee-list>

接口及数据结构（以文件为主，优先提供接口类型文件路径）：
- 列表接口：<例如 fetchList>
- 新增接口：<例如 createItem>
- 编辑接口：<例如 updateItem>
- 删除接口：<例如 deleteItem>
- 详情接口（可选）：<例如 getDetail>

页面需求：
- 搜索项：根据字段类型生成（文本模糊、枚举下拉、时间范围等）
- 表格列：序号列 + 业务列 + 操作列（编辑/删除）
- 弹窗：ModalForm（新增/编辑共用）；支持校验；成功后刷新表格
- 批量操作（可选）：表格多选 + 批量按钮（说明具体动作）

强制要求：
- hooks 优先：必须先生成 hooks/useTableData.ts（管理请求/分页/loading/删除/批量）
- 生成前必须检查全局类型声明（全局类型绝对不 import）
- 生成后必须 TypeScript/ESLint 自检并修复
`
  }

  if (key === 'reactStandardFormPage') {
    return `任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：${requirement}

页面类型：标准表单页（独立路由页面，用于新增/编辑）

文件夹名称: <kebab-case，例如 employee-edit>

接口及数据结构（以文件为主）：
- 详情接口（编辑态）：<例如 getDetail(id)>
- 新增接口：<例如 createItem>
- 编辑接口：<例如 updateItem(id)>
- 路由参数：id?（无 id 为新增，有 id 为编辑）

页面需求：
- 表单：按字段类型选择组件（Input/Select/DatePicker/Upload 等）
- 默认值：按业务规则设置
- 校验：必填/格式/范围等
- 交互：保存/取消（返回上一页）；保存成功提示并返回或跳转

强制要求：
- hooks 优先：必须先生成 hooks/useEditForm.ts（取详情、setFieldsValue、submit、loading）
- 组件内禁止直接写 API 调用（通过 hooks）
- 生成后必须 TypeScript/ESLint 自检并修复
`
  }

  if (key === 'reactStandardModalForm') {
    return `任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：${requirement}

页面类型：标准弹窗表单（ModalForm）

文件夹名称: <kebab-case，例如 components/edit-modal 或 module/components/edit-modal>

接口及数据结构：
- 详情接口（编辑态可选）：<例如 getDetail(id)>
- 提交接口：<create/update>
- 入参：editId?（无 id 为新增，有 id 为编辑）

组件需求：
- ModalForm：open/close；destroyOnClose；maskClosable=false
- 表单项：按字段类型生成；必填校验
- 提交：onFinish 返回 boolean；成功 toast；onSuccess 回调刷新

强制要求：
- hooks 优先：如果包含取详情/提交逻辑，必须拆 hooks/useModalForm.ts
- 禁止残留 console.log/debugger
- 生成后必须 TypeScript/ESLint 自检并修复
`
  }

  if (key === 'reactBatchSchemaForm') {
    return `任务标准：ai-fe-code-std.md 为标准执行任务

一句话需求：${requirement}

页面类型：批量 Schema 表单（BatchSchemaForm）

文件夹名称: <kebab-case，例如 components/batch-edit-modal>

接口及数据结构：
- 字段配置接口：<例如 getFieldSchema(bizType)>
- 批量更新接口：<例如 batchUpdateItems({ ids, bizType, updateFields })>
- 入参：selectedIds（选中的 ID 数组）、bizType（业务类型）

组件需求：
- ModalForm：显示选中数量；destroyOnClose；maskClosable=false
- Schema 驱动：根据字段配置动态渲染表单项（text/select/date/number）
- 批量提示：Alert 提示将要更新的记录数
- 预览：显示已选记录标签（可选）
- 提交：批量更新接口；成功 toast 显示数量；onSuccess 回调刷新

强制要求：
- 字段配置必须从后端获取或从 props 传入
- 表单项渲染必须根据 schema 动态生成
- 禁止残留 console.log/debugger
- 生成后必须 TypeScript/ESLint 自检并修复
`
  }

  return `任务标准：ai-fe-code-std.md 为标准执行任务
一句话需求：${requirement}
`
}

/**
 * 🆕 同步模板到图谱和 JSON
 */
function syncTemplateToRegistry(templateData) {
  logger.info('syncTemplateToRegistry', '同步模板到注册表', { templateId: templateData.id })
  
  try {
    const registry = readJson(REGISTRY_PATH)
    const existingIndex = registry.templates.findIndex(t => t.id === templateData.id)
    
    if (existingIndex >= 0) {
      // 更新现有模板
      registry.templates[existingIndex] = { ...registry.templates[existingIndex], ...templateData }
      logger.info('syncTemplateToRegistry', `更新模板: ${templateData.id}`)
    } else {
      // 添加新模板
      registry.templates.push(templateData)
      logger.info('syncTemplateToRegistry', `添加新模板: ${templateData.id}`)
    }
    
    // 写回 JSON
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8')
    logger.info('syncTemplateToRegistry', '模板注册表已更新')
    
    return { success: true, action: existingIndex >= 0 ? 'updated' : 'created' }
  } catch (error) {
    logger.error('syncTemplateToRegistry', '同步模板失败', error)
    return { success: false, error: error.message }
  }
}

/**
 * 🆕 同步知识图谱（更新组件库知识）
 */
function syncKnowledgeGraph(scope, fileName, content) {
  logger.info('syncKnowledgeGraph', '同步知识图谱', { scope, fileName })
  
  try {
    const targetDir = scope === 'common' 
      ? path.join(KNOWLEDGE_DIR, 'common')
      : path.join(KNOWLEDGE_DIR, 'business', fileName.split('/')[0] || 'default')
    
    // 确保目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    
    const targetFile = path.join(targetDir, fileName.endsWith('.md') ? fileName : `${fileName}.md`)
    const isUpdate = fs.existsSync(targetFile)
    
    fs.writeFileSync(targetFile, content, 'utf8')
    logger.info('syncKnowledgeGraph', `知识图谱已${isUpdate ? '更新' : '创建'}: ${targetFile}`)
    
    return { success: true, action: isUpdate ? 'updated' : 'created', path: targetFile }
  } catch (error) {
    logger.error('syncKnowledgeGraph', '同步知识图谱失败', error)
    return { success: false, error: error.message }
  }
}

/**
 * 🆕 批量同步：同时更新模板和知识图谱
 */
function batchSync(templateData, knowledgeUpdates = []) {
  logger.info('batchSync', '批量同步开始', { 
    templateId: templateData?.id, 
    knowledgeCount: knowledgeUpdates.length 
  })
  
  const results = {
    template: null,
    knowledge: [],
    success: true
  }
  
  // 同步模板
  if (templateData) {
    results.template = syncTemplateToRegistry(templateData)
    if (!results.template.success) {
      results.success = false
    }
  }
  
  // 同步知识图谱
  for (const kg of knowledgeUpdates) {
    const kgResult = syncKnowledgeGraph(kg.scope || 'common', kg.fileName, kg.content)
    results.knowledge.push({ fileName: kg.fileName, ...kgResult })
    if (!kgResult.success) {
      results.success = false
    }
  }
  
  logger.info('batchSync', '批量同步完成', results)
  return results
}

function searchSpecLines(query, maxResults = 10) {
  logger.info('searchSpecLines', `搜索规范文档`, { query, maxResults })
  
  const q = String(query || '').trim()
  if (!q) {
    logger.warn('searchSpecLines', '搜索关键词为空')
    return []
  }

  const specPath = resolveSpecPath()
  if (!fs.existsSync(specPath)) {
    logger.warn('searchSpecLines', `规范文档不存在: ${specPath}`)
    return []
  }

  const lines = readText(specPath).split(/\r?\n/)
  const res = []
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes(q)) {
      res.push({ line: i + 1, text: lines[i] })
      if (res.length >= maxResults) break
    }
  }
  
  logger.info('searchSpecLines', `找到 ${res.length} 条匹配结果`)
  return res
}

const server = new Server(
  { name: 'ai-codegen-engine', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('ListTools', '列出所有可用工具')
  
  return {
    tools: [
      {
        name: 'list_templates',
        description: '列出模板注册表中的所有模板',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_template',
        description: '根据模板 ID 获取模板元数据',
        inputSchema: {
          type: 'object',
          properties: { id: { type: 'string', description: '模板 ID' } },
          required: ['id'],
        },
      },
      {
        name: 'match_template',
        description: '根据一句话需求匹配最合适的模板（支持明确的模板ID与自然语言混合输入）',
        inputSchema: {
          type: 'object',
          properties: { 
            text: { type: 'string', description: '需求描述或模板ID' }, 
            topK: { type: 'number', default: 3, description: '返回前K个匹配结果' } 
          },
          required: ['text'],
        },
      },
      {
        name: 'build_prompt',
        description: '构建可复制的提示词骨架（自动附加组件库知识和示例代码）。如果用户已提供完整结构化提示词则原样返回',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: '用户输入，可能包含模板ID和需求描述' },
            templateId: { type: 'string', description: '可选的明确模板ID' },
          },
          required: ['text'],
        },
      },
      {
        name: 'get_component_knowledge',
        description: '🆕 获取组件库知识图谱（通用组件库或业务组件库）',
        inputSchema: {
          type: 'object',
          properties: {
            scope: { type: 'string', enum: ['common', 'business'], default: 'common', description: '组件库范围' },
            projectId: { type: 'string', description: '业务组件库的项目ID（scope=business时必填）' },
          },
          required: ['scope'],
        },
      },
      {
        name: 'get_code_examples',
        description: '🆕 获取模板的示例代码',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: { type: 'string', description: '模板ID' },
          },
          required: ['templateId'],
        },
      },
      {
        name: 'search_spec',
        description: '在规范文档中搜索关键字（快速定位规则）',
        inputSchema: {
          type: 'object',
          properties: { 
            query: { type: 'string', description: '搜索关键字' }, 
            maxResults: { type: 'number', default: 10, description: '最多返回结果数' } 
          },
          required: ['query'],
        },
      },
      {
        name: 'sync_template',
        description: '🆕 同步模板到注册表（新增或更新模板配置）',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '模板ID（kebab-case）' },
            name: { type: 'string', description: '模板名称' },
            paths: { type: 'array', items: { type: 'string' }, description: '模板示例路径' },
            scenes: { type: 'array', items: { type: 'string' }, description: '适用场景标签' },
            keywords: { type: 'array', items: { type: 'string' }, description: '匹配关键词' },
            antiKeywords: { type: 'array', items: { type: 'string' }, description: '排除关键词' },
            promptTemplateKey: { type: 'string', description: '提示词模板 key' },
            componentScope: { type: 'string', enum: ['common', 'business'], default: 'common', description: '组件库范围' },
          },
          required: ['id', 'name'],
        },
      },
      {
        name: 'sync_knowledge',
        description: '🆕 同步知识图谱（新增或更新组件库知识文档）',
        inputSchema: {
          type: 'object',
          properties: {
            scope: { type: 'string', enum: ['common', 'business'], default: 'common', description: '知识范围' },
            fileName: { type: 'string', description: '文件名（不含 .md 后缀也可）' },
            content: { type: 'string', description: '知识文档内容（Markdown 格式）' },
          },
          required: ['fileName', 'content'],
        },
      },
      {
        name: 'batch_sync',
        description: '🆕 批量同步：同时更新模板注册表和知识图谱',
        inputSchema: {
          type: 'object',
          properties: {
            template: { 
              type: 'object', 
              description: '模板配置（可选）',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                paths: { type: 'array', items: { type: 'string' } },
                scenes: { type: 'array', items: { type: 'string' } },
                keywords: { type: 'array', items: { type: 'string' } },
                antiKeywords: { type: 'array', items: { type: 'string' } },
                promptTemplateKey: { type: 'string' },
              },
            },
            knowledgeUpdates: { 
              type: 'array', 
              description: '知识图谱更新列表（可选）',
              items: {
                type: 'object',
                properties: {
                  scope: { type: 'string', enum: ['common', 'business'] },
                  fileName: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
          },
          required: [],
        },
      },
    ],
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  
  logger.info('CallTool', `工具调用开始: ${name}`, args)
  
  const registry = readJson(REGISTRY_PATH)
  const templates = registry.templates || []

  try {
    if (name === 'list_templates') {
      logger.info('list_templates', `返回 ${templates.length} 个模板`)
      return {
        content: [{ type: 'text', text: JSON.stringify(templates, null, 2) }],
      }
    }

    if (name === 'get_template') {
      const input = z.object({ id: z.string().min(1) }).parse(args)
      logger.info('get_template', `查找模板: ${input.id}`)
      
      const tpl = templates.find((t) => t.id === input.id)
      if (!tpl) {
        logger.warn('get_template', `模板未找到: ${input.id}`)
        return { content: [{ type: 'text', text: `Template not found: ${input.id}` }] }
      }
      
      logger.info('get_template', `找到模板: ${tpl.name}`)
      return { content: [{ type: 'text', text: JSON.stringify(tpl, null, 2) }] }
    }

    if (name === 'match_template') {
      const input = z.object({ text: z.string(), topK: z.number().int().min(1).max(10).default(3) }).parse(args)
      logger.info('match_template', `开始匹配模板`, { text: input.text, topK: input.topK })

      const explicit = extractExplicitTemplateId(input.text, templates)
      const normalized = normalizeText(explicit.restText || input.text)

      const scored = templates
        .map((tpl) => {
          const r = scoreTemplate(normalized, tpl)
          return { id: tpl.id, name: tpl.name, score: r.score, hits: r.hits, antiHits: r.antiHits }
        })
        .sort((a, b) => b.score - a.score)

      let chosen = scored[0]
      if (explicit.templateId) {
        const forced = templates.find((t) => t.id === explicit.templateId)
        chosen = forced
          ? { id: forced.id, name: forced.name, score: 999, hits: ['(explicit id)'], antiHits: [] }
          : chosen
      }

      const out = {
        explicitTemplateId: explicit.templateId,
        requirementText: explicit.restText,
        top: scored.slice(0, input.topK),
        chosen,
      }

      logger.info('match_template', `匹配完成，选中模板: ${chosen?.name}`, { chosen })
      return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] }
    }

    if (name === 'build_prompt') {
      const input = z.object({ text: z.string(), templateId: z.string().optional() }).parse(args)
      logger.info('build_prompt', `构建提示词`, { text: input.text.substring(0, 100), templateId: input.templateId })

      // If user already pasted a complete prompt, return unchanged to avoid duplication.
      if (isStructuredPrompt(input.text)) {
        logger.info('build_prompt', '检测到用户已提供完整提示词，原样返回')
        return {
          content: [
            {
              type: 'text',
              text: input.text,
            },
          ],
        }
      }

      const explicit = extractExplicitTemplateId(input.text, templates)
      const templateId = input.templateId || explicit.templateId
      const requirementText = explicit.restText || input.text

      let tpl = templateId ? templates.find((t) => t.id === templateId) : undefined
      if (!tpl) {
        const normalized = normalizeText(requirementText)
        const scored = templates
          .map((t) => ({ t, ...scoreTemplate(normalized, t) }))
          .sort((a, b) => b.score - a.score)
        tpl = scored[0]?.t
      }

      if (!tpl) {
        logger.error('build_prompt', '没有可用的模板')
        return { content: [{ type: 'text', text: 'No templates available.' }] }
      }

      logger.info('build_prompt', `使用模板: ${tpl.name}`, { templateId: tpl.id })

      // 🆕 使用增强版提示词构建函数
      const out = buildEnhancedPrompt(tpl.id, tpl.name, tpl.promptTemplateKey, requirementText, tpl)
      
      logger.info('build_prompt', '提示词构建完成，包含增强上下文')
      return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] }
    }

    // 🆕 获取组件库知识图谱
    if (name === 'get_component_knowledge') {
      const input = z.object({ 
        scope: z.enum(['common', 'business']).default('common'),
        projectId: z.string().optional() 
      }).parse(args)
      
      logger.info('get_component_knowledge', `获取组件库知识`, input)
      
      const knowledge = getComponentKnowledge(input.scope, input.projectId)
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              scope: input.scope,
              projectId: input.projectId,
              knowledge,
              fileCount: Object.keys(knowledge).length
            }, null, 2)
          }
        ]
      }
    }

    // 🆕 获取示例代码
    if (name === 'get_code_examples') {
      const input = z.object({ templateId: z.string().min(1) }).parse(args)
      logger.info('get_code_examples', `获取示例代码`, input)
      
      const examples = getCodeExamples(input.templateId)
      
      if (!examples) {
        logger.warn('get_code_examples', `未找到模板的示例代码: ${input.templateId}`)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                templateId: input.templateId,
                examples: null,
                message: '未找到该模板的示例代码'
              }, null, 2)
            }
          ]
        }
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              templateId: input.templateId,
              examples,
              fileCount: Object.keys(examples).length
            }, null, 2)
          }
        ]
      }
    }

    if (name === 'search_spec') {
      const input = z.object({ query: z.string().min(1), maxResults: z.number().int().min(1).max(50).default(10) }).parse(args)
      logger.info('search_spec', `搜索规范文档`, input)
      
      const specPath = resolveSpecPath()
      const results = searchSpecLines(input.query, input.maxResults)
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                specPath,
                query: input.query,
                results,
                resultCount: results.length
              },
              null,
              2
            ),
          },
        ],
      }
    }

    // 🆕 同步模板到注册表
    if (name === 'sync_template') {
      const input = z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        paths: z.array(z.string()).optional(),
        scenes: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        antiKeywords: z.array(z.string()).optional(),
        promptTemplateKey: z.string().optional(),
        componentScope: z.enum(['common', 'business']).default('common'),
      }).parse(args)
      
      logger.info('sync_template', `同步模板`, input)
      
      const result = syncTemplateToRegistry(input)
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ...result,
              templateId: input.id,
              templateName: input.name
            }, null, 2)
          }
        ]
      }
    }

    // 🆕 同步知识图谱
    if (name === 'sync_knowledge') {
      const input = z.object({
        scope: z.enum(['common', 'business']).default('common'),
        fileName: z.string().min(1),
        content: z.string().min(1),
      }).parse(args)
      
      logger.info('sync_knowledge', `同步知识图谱`, { scope: input.scope, fileName: input.fileName })
      
      const result = syncKnowledgeGraph(input.scope, input.fileName, input.content)
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }

    // 🆕 批量同步
    if (name === 'batch_sync') {
      const input = z.object({
        template: z.object({
          id: z.string(),
          name: z.string(),
          paths: z.array(z.string()).optional(),
          scenes: z.array(z.string()).optional(),
          keywords: z.array(z.string()).optional(),
          antiKeywords: z.array(z.string()).optional(),
          promptTemplateKey: z.string().optional(),
          componentScope: z.enum(['common', 'business']).optional(),
        }).optional(),
        knowledgeUpdates: z.array(z.object({
          scope: z.enum(['common', 'business']).optional(),
          fileName: z.string(),
          content: z.string(),
        })).optional(),
      }).parse(args)
      
      logger.info('batch_sync', `批量同步`, { 
        hasTemplate: !!input.template, 
        knowledgeCount: input.knowledgeUpdates?.length || 0 
      })
      
      const result = batchSync(input.template, input.knowledgeUpdates || [])
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }

    logger.error('CallTool', `未知工具: ${name}`)
    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] }
    
  } catch (error) {
    logger.error('CallTool', `工具调用失败: ${name}`, error)
    throw error
  }
})

/**
 * Exported factory for reusing the same MCP tool definitions in different transports
 * (e.g. stdio vs streamable HTTP).
 */
export function createServer() {
  logger.info('createServer', 'AI 代码生成引擎服务创建成功')
  return server
}

/**
 * 🆕 导出工具列表处理函数（供 HTTP 模式使用）
 */
export async function handleListTools() {
  const toolsResponse = await server.server?.listTools?.() || { tools: [] }
  return toolsResponse
}

/**
 * 🆕 导出工具调用处理函数（供 HTTP 模式使用）
 * 直接复用 server 的工具调用逻辑
 */
export async function handleCallTool(params) {
  const { name, arguments: args } = params
  
  logger.info('handleCallTool', `HTTP 模式工具调用: ${name}`, args)
  
  const registry = readJson(REGISTRY_PATH)
  const templates = registry.templates || []

  // list_templates
  if (name === 'list_templates') {
    return { content: [{ type: 'text', text: JSON.stringify(templates, null, 2) }] }
  }

  // get_template
  if (name === 'get_template') {
    const input = z.object({ id: z.string().min(1) }).parse(args)
    const tpl = templates.find((t) => t.id === input.id)
    if (!tpl) return { content: [{ type: 'text', text: `Template not found: ${input.id}` }] }
    return { content: [{ type: 'text', text: JSON.stringify(tpl, null, 2) }] }
  }

  // match_template
  if (name === 'match_template') {
    const input = z.object({ text: z.string(), topK: z.number().int().min(1).max(10).default(3) }).parse(args)
    const explicit = extractExplicitTemplateId(input.text, templates)
    const normalized = normalizeText(explicit.restText || input.text)
    const scored = templates.map((tpl) => {
      const r = scoreTemplate(normalized, tpl)
      return { id: tpl.id, name: tpl.name, score: r.score, hits: r.hits, antiHits: r.antiHits }
    }).sort((a, b) => b.score - a.score)
    let chosen = scored[0]
    if (explicit.templateId) {
      const forced = templates.find((t) => t.id === explicit.templateId)
      chosen = forced ? { id: forced.id, name: forced.name, score: 999, hits: ['(explicit id)'], antiHits: [] } : chosen
    }
    return { content: [{ type: 'text', text: JSON.stringify({ explicitTemplateId: explicit.templateId, requirementText: explicit.restText, top: scored.slice(0, input.topK), chosen }, null, 2) }] }
  }

  // build_prompt
  if (name === 'build_prompt') {
    const input = z.object({ text: z.string(), templateId: z.string().optional() }).parse(args)
    if (isStructuredPrompt(input.text)) {
      return { content: [{ type: 'text', text: input.text }] }
    }
    const explicit = extractExplicitTemplateId(input.text, templates)
    const templateId = input.templateId || explicit.templateId
    const requirementText = explicit.restText || input.text
    let tpl = templateId ? templates.find((t) => t.id === templateId) : undefined
    if (!tpl) {
      const normalized = normalizeText(requirementText)
      const scored = templates.map((t) => ({ t, ...scoreTemplate(normalized, t) })).sort((a, b) => b.score - a.score)
      tpl = scored[0]?.t
    }
    if (!tpl) return { content: [{ type: 'text', text: 'No templates available.' }] }
    const out = buildEnhancedPrompt(tpl.id, tpl.name, tpl.promptTemplateKey, requirementText, tpl)
    return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] }
  }

  // get_component_knowledge
  if (name === 'get_component_knowledge') {
    const input = z.object({ scope: z.enum(['common', 'business']).default('common'), projectId: z.string().optional() }).parse(args)
    const knowledge = getComponentKnowledge(input.scope, input.projectId)
    return { content: [{ type: 'text', text: JSON.stringify({ scope: input.scope, projectId: input.projectId, knowledge, fileCount: Object.keys(knowledge).length }, null, 2) }] }
  }

  // get_code_examples
  if (name === 'get_code_examples') {
    const input = z.object({ templateId: z.string().min(1) }).parse(args)
    const examples = getCodeExamples(input.templateId)
    if (!examples) return { content: [{ type: 'text', text: JSON.stringify({ templateId: input.templateId, examples: null, message: '未找到该模板的示例代码' }, null, 2) }] }
    return { content: [{ type: 'text', text: JSON.stringify({ templateId: input.templateId, examples, fileCount: Object.keys(examples).length }, null, 2) }] }
  }

  // search_spec
  if (name === 'search_spec') {
    const input = z.object({ query: z.string().min(1), maxResults: z.number().int().min(1).max(50).default(10) }).parse(args)
    const specPath = resolveSpecPath()
    const results = searchSpecLines(input.query, input.maxResults)
    return { content: [{ type: 'text', text: JSON.stringify({ specPath, query: input.query, results, resultCount: results.length }, null, 2) }] }
  }

  // sync_template
  if (name === 'sync_template') {
    const input = z.object({
      id: z.string().min(1), name: z.string().min(1), paths: z.array(z.string()).optional(),
      scenes: z.array(z.string()).optional(), keywords: z.array(z.string()).optional(),
      antiKeywords: z.array(z.string()).optional(), promptTemplateKey: z.string().optional(),
      componentScope: z.enum(['common', 'business']).default('common'),
    }).parse(args)
    const result = syncTemplateToRegistry(input)
    return { content: [{ type: 'text', text: JSON.stringify({ ...result, templateId: input.id, templateName: input.name }, null, 2) }] }
  }

  // sync_knowledge
  if (name === 'sync_knowledge') {
    const input = z.object({ scope: z.enum(['common', 'business']).default('common'), fileName: z.string().min(1), content: z.string().min(1) }).parse(args)
    const result = syncKnowledgeGraph(input.scope, input.fileName, input.content)
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
  }

  // batch_sync
  if (name === 'batch_sync') {
    const input = z.object({
      template: z.object({ id: z.string(), name: z.string(), paths: z.array(z.string()).optional(), scenes: z.array(z.string()).optional(), keywords: z.array(z.string()).optional(), antiKeywords: z.array(z.string()).optional(), promptTemplateKey: z.string().optional(), componentScope: z.enum(['common', 'business']).optional() }).optional(),
      knowledgeUpdates: z.array(z.object({ scope: z.enum(['common', 'business']).optional(), fileName: z.string(), content: z.string() })).optional(),
    }).parse(args)
    const result = batchSync(input.template, input.knowledgeUpdates || [])
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
  }

  throw new Error(`Unknown tool: ${name}`)
}

/**
 * 🆕 导出工具定义（供 HTTP 模式使用）
 */
export const TOOLS_DEFINITION = [
  { name: 'list_templates', description: '列出模板注册表中的所有模板', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_template', description: '根据模板 ID 获取模板元数据', inputSchema: { type: 'object', properties: { id: { type: 'string', description: '模板 ID' } }, required: ['id'] } },
  { name: 'match_template', description: '根据一句话需求匹配最合适的模板', inputSchema: { type: 'object', properties: { text: { type: 'string', description: '需求描述或模板ID' }, topK: { type: 'number', default: 3, description: '返回前K个匹配结果' } }, required: ['text'] } },
  { name: 'build_prompt', description: '构建增强版提示词（自动附加组件库知识和示例代码）', inputSchema: { type: 'object', properties: { text: { type: 'string', description: '用户输入' }, templateId: { type: 'string', description: '可选模板ID' } }, required: ['text'] } },
  { name: 'get_component_knowledge', description: '获取组件库知识图谱', inputSchema: { type: 'object', properties: { scope: { type: 'string', enum: ['common', 'business'], default: 'common' }, projectId: { type: 'string' } }, required: ['scope'] } },
  { name: 'get_code_examples', description: '获取模板的示例代码', inputSchema: { type: 'object', properties: { templateId: { type: 'string' } }, required: ['templateId'] } },
  { name: 'search_spec', description: '在规范文档中搜索关键字', inputSchema: { type: 'object', properties: { query: { type: 'string' }, maxResults: { type: 'number', default: 10 } }, required: ['query'] } },
  { name: 'sync_template', description: '同步模板到注册表', inputSchema: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, paths: { type: 'array' }, scenes: { type: 'array' }, keywords: { type: 'array' }, antiKeywords: { type: 'array' }, promptTemplateKey: { type: 'string' }, componentScope: { type: 'string' } }, required: ['id', 'name'] } },
  { name: 'sync_knowledge', description: '同步知识图谱', inputSchema: { type: 'object', properties: { scope: { type: 'string' }, fileName: { type: 'string' }, content: { type: 'string' } }, required: ['fileName', 'content'] } },
  { name: 'batch_sync', description: '批量同步模板和知识图谱', inputSchema: { type: 'object', properties: { template: { type: 'object' }, knowledgeUpdates: { type: 'array' } }, required: [] } },
]

async function mainStdio() {
  logger.info('mainStdio', 'AI 代码生成引擎启动（STDIO 模式）')
  const transport = new StdioServerTransport()
  await server.connect(transport)
  logger.info('mainStdio', 'AI 代码生成引擎已连接并准备就绪')
}

// If run directly (stdio mode), start stdio transport.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  mainStdio().catch((err) => {
    logger.error('mainStdio', 'AI 代码生成引擎启动失败', err)
    process.exit(1)
  })
}

