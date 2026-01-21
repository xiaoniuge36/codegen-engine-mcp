/**
 * 项目上下文感知模块
 * 分析用户项目结构，提供智能推荐
 * 
 * 规则兆底逻辑：
 * - 如果项目结构符合规则，按项目结构执行
 * - 如果不符合，严格按照规则执行（规则是兆底）
 */

import fs from 'fs'
import path from 'path'
import { logger } from '../utils/index.js'

/**
 * 规则定义的标准目录结构（来自 ai-fe-code-std.md）
 * 这是兆底配置，当项目结构不符合时使用
 */
const RULE_STANDARD_STRUCTURE = {
  // React 项目标准结构
  react: {
    pageBase: 'src/pages',           // 页面基础目录
    hooksDir: 'hooks',               // hooks 目录名
    componentsDir: 'components',     // 组件目录
    indexFile: 'index.tsx',          // 主文件
    styleFile: 'index.less',         // 样式文件
    typesFile: 'types.ts',           // 类型文件
    hooksFile: 'useTableData.ts',    // hooks 文件示例
    // 非标独立页面结构
    nonStandard: {
      detail: 'components/detail',
      edit: 'components/edit',
      detailHooks: 'hooks/useDetailData.ts',
      editHooks: 'hooks/useEditForm.ts'
    }
  },
  // Vue 3 项目标准结构
  vue3: {
    pageBase: 'src/views',
    hooksDir: 'composables',
    componentsDir: 'components',
    indexFile: 'index.vue',
    styleFile: 'index.less',
    typesFile: 'types.ts',
    hooksFile: 'useTableData.ts',
    nonStandard: {
      detail: 'components/detail',
      edit: 'components/edit',
      detailHooks: 'composables/useDetailData.ts',
      editHooks: 'composables/useEditForm.ts'
    }
  },
  // Vue 2 项目标准结构
  vue2: {
    pageBase: 'src/views',
    hooksDir: 'mixins',
    componentsDir: 'components',
    indexFile: 'index.vue',
    styleFile: 'index.less',
    typesFile: null,                 // Vue 2 通常不用 TypeScript
    hooksFile: 'tableMixin.js',
    nonStandard: {
      detail: 'components/detail',
      edit: 'components/edit',
      detailHooks: null,
      editHooks: null
    }
  }
}

/**
 * 检查项目结构是否符合规则
 */
function checkStructureCompliance(projectContext, techStack) {
  const stack = techStack?.toLowerCase() || 'react'
  const ruleStructure = RULE_STANDARD_STRUCTURE[stack] || RULE_STANDARD_STRUCTURE.react
  
  const compliance = {
    compliant: false,
    issues: [],
    useFallback: false,
    ruleStructure
  }
  
  if (!projectContext.analyzed) {
    compliance.issues.push('未能分析项目结构')
    compliance.useFallback = true
    return compliance
  }
  
  const rootDir = projectContext.rootDir
  const srcDir = path.join(rootDir, 'src')
  
  // 检查页面基础目录是否存在
  const expectedPageBase = path.join(rootDir, ruleStructure.pageBase)
  if (!fs.existsSync(expectedPageBase)) {
    // 检查替代目录
    const altPageBase = stack === 'react' 
      ? path.join(rootDir, 'src/views') 
      : path.join(rootDir, 'src/pages')
    
    if (fs.existsSync(altPageBase)) {
      compliance.issues.push(`页面目录使用 ${altPageBase} 而非规则要求的 ${ruleStructure.pageBase}`)
      // 这种情况可以接受，使用项目实际结构
    } else {
      compliance.issues.push(`缺少页面目录 ${ruleStructure.pageBase}`)
      compliance.useFallback = true
    }
  }
  
  // 如果没有严重问题，认为符合规则
  compliance.compliant = !compliance.useFallback
  
  return compliance
}

/**
 * 分析项目结构
 */
export function analyzeProjectStructure(projectPath) {
  logger.info('analyzeProjectStructure', '开始分析项目结构', { projectPath })
  
  if (!projectPath) {
    return { analyzed: false, error: '未提供项目路径' }
  }
  
  // 获取项目根目录
  let rootDir = projectPath
  if (fs.existsSync(projectPath) && fs.statSync(projectPath).isFile()) {
    rootDir = path.dirname(projectPath)
  }
  
  // 向上查找包含 package.json 的目录
  const root = path.parse(rootDir).root
  while (rootDir && rootDir !== root) {
    if (fs.existsSync(path.join(rootDir, 'package.json'))) {
      break
    }
    rootDir = path.dirname(rootDir)
  }
  
  if (!fs.existsSync(path.join(rootDir, 'package.json'))) {
    return { analyzed: false, error: '未找到项目根目录' }
  }
  
  const result = {
    analyzed: true,
    rootDir,
    structure: {
      hasPages: false,
      hasViews: false,
      hasComponents: false,
      hasServices: false,
      hasApi: false,
      hasTypes: false,
      hasHooks: false,
      hasUtils: false,
      hasStore: false,
      hasRouter: false
    },
    directories: [],
    suggestedPaths: {},
    routerType: null,
    stateManagement: null
  }
  
  const srcDir = path.join(rootDir, 'src')
  const checkDirs = fs.existsSync(srcDir) ? srcDir : rootDir
  
  // 检测目录结构
  const dirsToCheck = [
    { name: 'pages', key: 'hasPages' },
    { name: 'views', key: 'hasViews' },
    { name: 'components', key: 'hasComponents' },
    { name: 'services', key: 'hasServices' },
    { name: 'api', key: 'hasApi' },
    { name: 'types', key: 'hasTypes' },
    { name: 'typings', key: 'hasTypes' },
    { name: 'hooks', key: 'hasHooks' },
    { name: 'composables', key: 'hasHooks' },
    { name: 'utils', key: 'hasUtils' },
    { name: 'store', key: 'hasStore' },
    { name: 'stores', key: 'hasStore' },
    { name: 'router', key: 'hasRouter' },
    { name: 'routes', key: 'hasRouter' }
  ]
  
  for (const dir of dirsToCheck) {
    const dirPath = path.join(checkDirs, dir.name)
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      result.structure[dir.key] = true
      result.directories.push(dir.name)
    }
  }
  
  // 推荐路径
  if (result.structure.hasPages) {
    result.suggestedPaths.pages = path.join(checkDirs, 'pages')
  } else if (result.structure.hasViews) {
    result.suggestedPaths.pages = path.join(checkDirs, 'views')
  }
  
  if (result.structure.hasComponents) {
    result.suggestedPaths.components = path.join(checkDirs, 'components')
  }
  
  if (result.structure.hasServices) {
    result.suggestedPaths.services = path.join(checkDirs, 'services')
  } else if (result.structure.hasApi) {
    result.suggestedPaths.services = path.join(checkDirs, 'api')
  }
  
  if (result.structure.hasHooks) {
    const hooksDir = fs.existsSync(path.join(checkDirs, 'hooks')) ? 'hooks' : 'composables'
    result.suggestedPaths.hooks = path.join(checkDirs, hooksDir)
  }
  
  // 检测路由类型
  const routerFiles = [
    { file: 'config/routes.ts', type: 'umi' },
    { file: 'config/routes.js', type: 'umi' },
    { file: '.umirc.ts', type: 'umi' },
    { file: 'src/router/index.ts', type: 'vue-router' },
    { file: 'src/router/index.js', type: 'vue-router' },
    { file: 'src/routes/index.tsx', type: 'react-router' },
    { file: 'src/App.tsx', type: 'react' }
  ]
  
  for (const rf of routerFiles) {
    if (fs.existsSync(path.join(rootDir, rf.file))) {
      result.routerType = rf.type
      break
    }
  }
  
  // 检测状态管理
  try {
    const pkgPath = path.join(rootDir, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    
    if (deps['@reduxjs/toolkit'] || deps['redux']) {
      result.stateManagement = 'redux'
    } else if (deps['mobx']) {
      result.stateManagement = 'mobx'
    } else if (deps['zustand']) {
      result.stateManagement = 'zustand'
    } else if (deps['pinia']) {
      result.stateManagement = 'pinia'
    } else if (deps['vuex']) {
      result.stateManagement = 'vuex'
    } else if (deps['@umijs/max']) {
      result.stateManagement = 'umi-model'
    }
  } catch (e) {
    // ignore
  }
  
  logger.info('analyzeProjectStructure', '项目结构分析完成', result)
  return result
}

/**
 * 生成推荐的文件路径
 * 
 * 兆底逻辑：
 * 1. 先检查项目结构是否符合规则
 * 2. 如果符合，按项目实际结构生成路径
 * 3. 如果不符合，严格按照规则生成路径
 */
export function suggestFilePaths(projectContext, moduleName, techStack) {
  logger.info('suggestFilePaths', '开始生成推荐路径', { moduleName, techStack })
  
  // 规范化技术栈名称
  const stack = techStack?.toLowerCase() || 'react'
  const normalizedStack = stack.includes('vue3') ? 'vue3' 
    : stack.includes('vue2') || stack === 'vue' ? 'vue2' 
    : 'react'
  
  // 获取规则定义的标准结构
  const ruleStructure = RULE_STANDARD_STRUCTURE[normalizedStack]
  
  // 检查项目结构合规性
  const compliance = checkStructureCompliance(projectContext, normalizedStack)
  
  const suggestions = {
    pageDir: null,
    hooksDir: null,
    hooksFile: null,
    indexFile: null,
    styleFile: null,
    typesFile: null,
    componentsDir: null,
    // 兆底信息
    fallbackUsed: false,
    fallbackReason: null,
    ruleStructure: ruleStructure,
    compliance: compliance
  }
  
  // 模块名规范化（kebab-case，符合规则要求）
  const kebabName = moduleName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/[\s_]+/g, '-')
  
  // 确定页面基础目录
  let pagesBase
  
  if (compliance.useFallback || !projectContext.analyzed) {
    // ⭐ 兆底逻辑：严格按照规则执行
    suggestions.fallbackUsed = true
    suggestions.fallbackReason = compliance.issues.join('; ') || '项目结构未分析'
    
    // 使用规则定义的标准路径
    const rootDir = projectContext?.rootDir || process.cwd()
    pagesBase = path.join(rootDir, ruleStructure.pageBase)
    
    logger.info('suggestFilePaths', '⭐ 使用规则兆底结构', { 
      reason: suggestions.fallbackReason,
      pagesBase 
    })
  } else {
    // 项目结构符合规则，使用项目实际结构
    pagesBase = projectContext.suggestedPaths.pages || 
      path.join(projectContext.rootDir, ruleStructure.pageBase)
    
    logger.info('suggestFilePaths', '✅ 使用项目实际结构', { pagesBase })
  }
  
  // 生成页面目录路径
  suggestions.pageDir = path.join(pagesBase, kebabName)
  
  // 根据规则生成文件路径
  suggestions.hooksDir = path.join(suggestions.pageDir, ruleStructure.hooksDir)
  suggestions.hooksFile = path.join(suggestions.hooksDir, ruleStructure.hooksFile)
  suggestions.indexFile = path.join(suggestions.pageDir, ruleStructure.indexFile)
  suggestions.styleFile = path.join(suggestions.pageDir, ruleStructure.styleFile)
  suggestions.componentsDir = path.join(suggestions.pageDir, ruleStructure.componentsDir)
  
  // 类型文件（Vue 2 可能不需要）
  if (ruleStructure.typesFile) {
    suggestions.typesFile = path.join(suggestions.pageDir, ruleStructure.typesFile)
  }
  
  // 添加非标独立页面结构建议
  suggestions.nonStandard = {
    detailDir: path.join(suggestions.pageDir, ruleStructure.nonStandard.detail),
    editDir: path.join(suggestions.pageDir, ruleStructure.nonStandard.edit),
    detailHooksFile: ruleStructure.nonStandard.detailHooks 
      ? path.join(suggestions.pageDir, ruleStructure.nonStandard.detail, ruleStructure.nonStandard.detailHooks.split('/').pop())
      : null,
    editHooksFile: ruleStructure.nonStandard.editHooks
      ? path.join(suggestions.pageDir, ruleStructure.nonStandard.edit, ruleStructure.nonStandard.editHooks.split('/').pop())
      : null
  }
  
  logger.info('suggestFilePaths', '路径推荐完成', suggestions)
  return suggestions
}

/**
 * 获取规则定义的标准结构（导出供外部使用）
 */
export function getRuleStandardStructure(techStack) {
  const stack = techStack?.toLowerCase() || 'react'
  const normalizedStack = stack.includes('vue3') ? 'vue3' 
    : stack.includes('vue2') || stack === 'vue' ? 'vue2' 
    : 'react'
  
  return RULE_STANDARD_STRUCTURE[normalizedStack]
}

/**
 * 从提示词中提取文件夹名称
 * 支持格式：
 * - 文件夹名称: lists
 * - 文件夹名称：lists
 * - 目录名称: lists
 * - folder: lists
 */
export function extractFolderName(text) {
  logger.info('extractFolderName', '开始提取文件夹名称', { textLength: text?.length })
  
  if (!text) {
    return { found: false, folderName: null, source: null }
  }
  
  // 匹配模式
  const patterns = [
    /文件夹名称[:：]\s*([a-zA-Z0-9_-]+)/i,
    /目录名称[:：]\s*([a-zA-Z0-9_-]+)/i,
    /folder[:：]\s*([a-zA-Z0-9_-]+)/i,
    /folderName[:：]\s*([a-zA-Z0-9_-]+)/i,
    /页面目录[:：]\s*([a-zA-Z0-9_-]+)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const folderName = match[1].trim()
      logger.info('extractFolderName', '✅ 找到用户指定的文件夹名称', { folderName })
      return {
        found: true,
        folderName,
        source: 'user_specified'
      }
    }
  }
  
  logger.info('extractFolderName', '未找到用户指定的文件夹名称')
  return { found: false, folderName: null, source: null }
}

/**
 * 文件夹命名规则
 */
const FOLDER_NAMING_RULES = {
  // 强制规则（来自 ai-fe-code-std.md）
  mandatory: {
    format: 'kebab-case',
    pattern: /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    directoryBase: ['src/pages', 'src/views'],
    conflictResolution: 'increment', // lists -> lists-v2
    rules: [
      '使用 kebab-case 格式（小写字母 + 中划线）',
      '页面目录只能在 src/pages/[业务模块]/[文件夹名称] 或 src/views/[业务模块]/[文件夹名称] 下创建',
      '禁止直接在 src/pages/ 或 src/views/ 下创建一级页面目录',
      '如果页面目录已存在，追加新建（如 lists -> lists-v2），不修改现有代码'
    ]
  },
  // 示例
  examples: [
    { business: '员工白名单', folderName: 'employee-whitelist' },
    { business: '订单管理', folderName: 'order-management' },
    { business: '审批流程', folderName: 'approval-flow' },
    { business: '差旅申请', folderName: 'travel-apply' },
    { business: '员工列表', folderName: 'employee-list' },
    { business: '项目配置', folderName: 'project-config' }
  ],
  // 页面类型后缀规则
  suffixRules: [
    { keywords: ['列表', 'list', '表格', 'table', '查询', 'search'], suffix: '-list', description: '列表页' },
    { keywords: ['详情', 'detail', '查看', 'view'], suffix: '-detail', description: '详情页' },
    { keywords: ['表单', 'form', '新增', '编辑', 'add', 'edit'], suffix: '-form', description: '表单页' },
    { keywords: ['弹窗', 'modal', '对话框'], suffix: '-modal', description: '弹窗组件' },
    { keywords: ['抽屉', 'drawer'], suffix: '-drawer', description: '抽屉组件' },
    { keywords: ['导入', 'import', 'excel'], suffix: '-import', description: '导入页' }
  ],
  // AI 提示语（强制规则）
  prompt: `文件夹命名规则强制遵循 ai-fe-code-std.md 规定

【强制规则】
1. 格式：kebab-case（小写字母 + 中划线）
2. 结构：[业务模块]-[页面类型]
3. 示例：employee-whitelist, order-list, travel-apply-detail

【禁止】
- 禁止使用大写字母
- 禁止使用下划线
- 禁止使用中文

【流程】
1. 从需求中提取业务名称
2. 将中文转换为英文
3. 添加页面类型后缀
4. 转换为 kebab-case`
}

/**
 * 检测页面类型后缀
 */
function detectPageTypeSuffix(text) {
  if (!text) return ''
  const normalized = text.toLowerCase()
  
  for (const rule of FOLDER_NAMING_RULES.suffixRules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return rule.suffix
      }
    }
  }
  return ''
}

/**
 * 解析文件夹名称（组合函数）
 * 逻辑：
 * 1. 用户输入了文件夹名称 → 使用用户输入的
 * 2. 用户未输入 → 返回命名规则让 AI 自行决定
 */
export function resolveFolderName(text, templateId = null) {
  logger.info('resolveFolderName', '解析文件夹名称', { textLength: text?.length })

  // 先尝试从用户输入中提取
  const extracted = extractFolderName(text)
  if (extracted.found) {
    return {
      folderName: extracted.folderName,
      source: 'user_specified',
      needAIDecision: false,
      message: `✅ 使用用户指定的文件夹名称: ${extracted.folderName}`
    }
  }

  // 用户未指定，返回命名规则让 AI 自行决定
  const detectedSuffix = detectPageTypeSuffix(text)
  
  return {
    folderName: null,
    source: 'ai_decision',
    needAIDecision: true,
    detectedSuffix,
    namingRules: FOLDER_NAMING_RULES,
    aiPrompt: `请根据需求描述生成文件夹名称：使用 kebab-case，根据需求提取业务名称转换为英文，添加页面类型后缀${detectedSuffix ? `（检测到页面类型：${detectedSuffix}）` : ''}`,
    message: `未找到用户指定的文件夹名称，请根据需求描述生成文件夹名称${detectedSuffix ? `（检测到页面类型：${detectedSuffix}）` : ''}`
  }
}

/**
 * 获取文件夹命名规则（导出供外部使用）
 */
export function getFolderNamingRules() {
  return FOLDER_NAMING_RULES
}

/**
 * 检测项目代码风格配置
 */
export function detectCodeStyle(projectPath) {
  logger.info('detectCodeStyle', '检测项目代码风格配置', { projectPath })
  
  if (!projectPath) {
    return { detected: false }
  }
  
  let rootDir = projectPath
  if (fs.existsSync(projectPath) && fs.statSync(projectPath).isFile()) {
    rootDir = path.dirname(projectPath)
  }
  
  // 向上查找 package.json
  const root = path.parse(rootDir).root
  while (rootDir && rootDir !== root) {
    if (fs.existsSync(path.join(rootDir, 'package.json'))) {
      break
    }
    rootDir = path.dirname(rootDir)
  }
  
  const result = {
    detected: true,
    rootDir,
    prettier: {
      found: false,
      configPath: null,
      config: null
    },
    eslint: {
      found: false,
      configPath: null
    },
    editorconfig: {
      found: false,
      configPath: null
    },
    typescript: {
      found: false,
      configPath: null,
      strict: false
    }
  }
  
  // 检测 Prettier
  const prettierConfigs = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.cjs',
    'prettier.config.js',
    'prettier.config.cjs'
  ]
  
  for (const config of prettierConfigs) {
    const configPath = path.join(rootDir, config)
    if (fs.existsSync(configPath)) {
      result.prettier.found = true
      result.prettier.configPath = configPath
      
      // 尝试读取配置
      if (config.endsWith('.json') || config === '.prettierrc') {
        try {
          result.prettier.config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        } catch (e) {
          // ignore
        }
      }
      break
    }
  }
  
  // 检查 package.json 中的 prettier 配置
  if (!result.prettier.found) {
    try {
      const pkgPath = path.join(rootDir, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      if (pkg.prettier) {
        result.prettier.found = true
        result.prettier.configPath = pkgPath
        result.prettier.config = pkg.prettier
      }
    } catch (e) {
      // ignore
    }
  }
  
  // 检测 ESLint
  const eslintConfigs = [
    '.eslintrc',
    '.eslintrc.json',
    '.eslintrc.js',
    '.eslintrc.cjs',
    'eslint.config.js',
    'eslint.config.mjs'
  ]
  
  for (const config of eslintConfigs) {
    const configPath = path.join(rootDir, config)
    if (fs.existsSync(configPath)) {
      result.eslint.found = true
      result.eslint.configPath = configPath
      break
    }
  }
  
  // 检测 EditorConfig
  const editorConfigPath = path.join(rootDir, '.editorconfig')
  if (fs.existsSync(editorConfigPath)) {
    result.editorconfig.found = true
    result.editorconfig.configPath = editorConfigPath
  }
  
  // 检测 TypeScript
  const tsConfigPath = path.join(rootDir, 'tsconfig.json')
  if (fs.existsSync(tsConfigPath)) {
    result.typescript.found = true
    result.typescript.configPath = tsConfigPath
    
    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'))
      result.typescript.strict = tsConfig.compilerOptions?.strict === true
    } catch (e) {
      // ignore
    }
  }
  
  logger.info('detectCodeStyle', '代码风格检测完成', result)
  return result
}

/**
 * 解析多模板组合需求
 */
export function parseCompositeRequirement(text) {
  logger.info('parseCompositeRequirement', '解析组合需求', { text })
  
  const result = {
    isComposite: false,
    templates: [],
    mainTemplate: null,
    subTemplates: []
  }
  
  const normalized = text.toLowerCase()
  
  // 组合模式检测
  const compositePatterns = [
    // 列表 + 弹窗
    { pattern: /列表.*弹窗|弹窗.*列表|list.*modal|modal.*list/, templates: ['list', 'modal'] },
    { pattern: /列表.*抽屉|抽屉.*列表|list.*drawer|drawer.*list/, templates: ['list', 'drawer'] },
    // 列表 + 详情
    { pattern: /列表.*详情|详情.*列表/, templates: ['list', 'detail'] },
    // 表单 + 弹窗
    { pattern: /表单.*弹窗|弹窗.*表单|form.*modal|modal.*form/, templates: ['form', 'modal'] },
    // 导入 + 列表
    { pattern: /导入.*列表|列表.*导入|import.*list/, templates: ['import', 'list'] },
    // CRUD 完整
    { pattern: /crud|增删改查/, templates: ['list', 'modal', 'form'] }
  ]
  
  for (const cp of compositePatterns) {
    if (cp.pattern.test(normalized)) {
      result.isComposite = true
      result.templates = cp.templates
      result.mainTemplate = cp.templates[0]
      result.subTemplates = cp.templates.slice(1)
      break
    }
  }
  
  // 单独检测各种场景
  if (!result.isComposite) {
    const scenes = []
    
    if (/列表|list|表格|table|查询|search/.test(normalized)) scenes.push('list')
    if (/弹窗|弹框|modal|对话框|dialog/.test(normalized)) scenes.push('modal')
    if (/抽屉|drawer/.test(normalized)) scenes.push('drawer')
    if (/详情|detail|查看|view/.test(normalized)) scenes.push('detail')
    if (/表单|form|新增|编辑|add|edit/.test(normalized)) scenes.push('form')
    if (/导入|import|excel|上传/.test(normalized)) scenes.push('import')
    if (/上传|upload|文件|附件/.test(normalized)) scenes.push('upload')
    
    if (scenes.length > 1) {
      result.isComposite = true
      result.templates = scenes
      result.mainTemplate = scenes[0]
      result.subTemplates = scenes.slice(1)
    }
  }
  
  logger.info('parseCompositeRequirement', '组合需求解析完成', result)
  return result
}
