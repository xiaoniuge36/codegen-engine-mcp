import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPO_ROOT = path.join(__dirname, '..')
const REGISTRY_PATH = path.join(__dirname, 'templates', 'template-registry.json')
const KNOWLEDGE_DIR = path.join(__dirname, 'knowledge')
const EXAMPLES_DIR = path.join(__dirname, 'templates', 'examples')

const logger = {
  info: (tool, message, data = {}) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [INFO] [${tool}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
  error: (tool, message, error) => {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [ERROR] [${tool}] ${message}`, error?.message || error)
  },
  warn: (tool, message, data = {}) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [WARN] [${tool}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
}

const SPEC_CANDIDATES = [
  path.join(REPO_ROOT, '.lingma', 'rules', 'ai-fe-code-std.md'),
  path.join(REPO_ROOT, 'ai-fe-code-std.md'),
  path.join(REPO_ROOT, 'AI前端代码生成执行规范（含vue、规范、完整版）.md'),
]

function resolveSpecPath() {
  for (const p of SPEC_CANDIDATES) {
    if (fs.existsSync(p)) {
      return p
    }
  }
  // 默认返回标准规范文件（ai-fe-code-std.md）
  return path.join(REPO_ROOT, 'ai-fe-code-std.md')
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function readText(p) {
  return fs.readFileSync(p, 'utf8')
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

  if (tpl.scenes && tpl.scenes.includes('import')) {
    if (text.includes('excel') || text.includes('xlsx') || text.includes('导入') || text.includes('上传'))
      score += 3
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

  return { templateId: chosen.id, restText }
}

function getComponentKnowledge(scope = 'common', projectId = null) {
  try {
    let knowledgePath
    if (scope === 'common') {
      const commonDir = path.join(KNOWLEDGE_DIR, 'common')
      const files = fs.readdirSync(commonDir).filter((f) => f.endsWith('.md'))

      const knowledge = {}
      for (const file of files) {
        const content = readText(path.join(commonDir, file))
        knowledge[file.replace('.md', '')] = content
      }

      return knowledge
    } else if (scope === 'business' && projectId) {
      const businessDir = path.join(KNOWLEDGE_DIR, 'business', projectId)
      if (!fs.existsSync(businessDir)) {
        return {}
      }

      const files = fs.readdirSync(businessDir).filter((f) => f.endsWith('.md'))

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

function getCodeExamples(templateId) {
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

    if (!fs.existsSync(exampleDir)) {
      logger.warn('getCodeExamples', `示例代码目录不存在: ${exampleDir}`)
      return null
    }

    const examples = {}

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
        }
      }
    }

    readDirRecursive(exampleDir)

    return examples
  } catch (error) {
    logger.error('getCodeExamples', `获取示例代码失败: ${templateId}`, error)
    return null
  }
}

function buildEnhancedPrompt(templateId, templateName, promptSkeletonKey, requirementText, template) {
  const prompt = promptSkeletonByKey(promptSkeletonKey, requirementText)

  const componentScope = template.componentScope || 'common'
  const componentKnowledge = getComponentKnowledge(componentScope)

  const codeExamples = getCodeExamples(templateId)

  const result = {
    templateId,
    templateName,
    templatePaths: template.paths || [],
    prompt,
    enhancedContext: {
      componentKnowledge: Object.keys(componentKnowledge).length > 0 ? componentKnowledge : null,
      codeExamples: codeExamples && Object.keys(codeExamples).length > 0 ? codeExamples : null,
      specPath: resolveSpecPath(),
    },
  }

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

  return `任务标准：ai-fe-code-std.md 为标准执行任务
一句话需求：${requirement}
`
}

function searchSpecLines(query, maxResults = 10) {
  const q = String(query || '').trim()
  if (!q) {
    return []
  }

  const specPath = resolveSpecPath()
  if (!fs.existsSync(specPath)) {
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

  return res
}

/**
 * 处理 tools/list 请求
 */
export async function handleListTools() {
  logger.info('handleListTools', '列出所有可用工具')

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
            topK: { type: 'number', default: 3, description: '返回前K个匹配结果' },
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
            scope: {
              type: 'string',
              enum: ['common', 'business'],
              default: 'common',
              description: '组件库范围',
            },
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
            maxResults: { type: 'number', default: 10, description: '最多返回结果数' },
          },
          required: ['query'],
        },
      },
    ],
  }
}

/**
 * 处理 tools/call 请求
 */
export async function handleCallTool(params) {
  const { name, arguments: args } = params

  logger.info('handleCallTool', `工具调用: ${name}`, args)

  const registry = readJson(REGISTRY_PATH)
  const templates = registry.templates || []

  if (name === 'list_templates') {
    return {
      content: [{ type: 'text', text: JSON.stringify(templates, null, 2) }],
    }
  }

  if (name === 'get_template') {
    const input = z.object({ id: z.string().min(1) }).parse(args)

    const tpl = templates.find((t) => t.id === input.id)
    if (!tpl) {
      return { content: [{ type: 'text', text: `Template not found: ${input.id}` }] }
    }

    return { content: [{ type: 'text', text: JSON.stringify(tpl, null, 2) }] }
  }

  if (name === 'match_template') {
    const input = z.object({ text: z.string(), topK: z.number().int().min(1).max(10).default(3) }).parse(args)

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

    return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] }
  }

  if (name === 'build_prompt') {
    const input = z.object({ text: z.string(), templateId: z.string().optional() }).parse(args)

    if (isStructuredPrompt(input.text)) {
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
      const scored = templates.map((t) => ({ t, ...scoreTemplate(normalized, t) })).sort((a, b) => b.score - a.score)
      tpl = scored[0]?.t
    }

    if (!tpl) {
      return { content: [{ type: 'text', text: 'No templates available.' }] }
    }

    const out = buildEnhancedPrompt(tpl.id, tpl.name, tpl.promptTemplateKey, requirementText, tpl)

    return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] }
  }

  if (name === 'get_component_knowledge') {
    const input = z
      .object({
        scope: z.enum(['common', 'business']).default('common'),
        projectId: z.string().optional(),
      })
      .parse(args)

    const knowledge = getComponentKnowledge(input.scope, input.projectId)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              scope: input.scope,
              projectId: input.projectId,
              knowledge,
              fileCount: Object.keys(knowledge).length,
            },
            null,
            2
          ),
        },
      ],
    }
  }

  if (name === 'get_code_examples') {
    const input = z.object({ templateId: z.string().min(1) }).parse(args)

    const examples = getCodeExamples(input.templateId)

    if (!examples) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                templateId: input.templateId,
                examples: null,
                message: '未找到该模板的示例代码',
              },
              null,
              2
            ),
          },
        ],
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              templateId: input.templateId,
              examples,
              fileCount: Object.keys(examples).length,
            },
            null,
            2
          ),
        },
      ],
    }
  }

  if (name === 'search_spec') {
    const input = z
      .object({ query: z.string().min(1), maxResults: z.number().int().min(1).max(50).default(10) })
      .parse(args)

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
              resultCount: results.length,
            },
            null,
            2
          ),
        },
      ],
    }
  }

  throw new Error(`Unknown tool: ${name}`)
}
