import fs from 'fs'
import path from 'path'
import { logger, REPO_ROOT } from '../utils/index.js'

/**
 * 检查项目全局类型声明
 */
export function checkGlobalTypes(projectPath = null) {
  logger.info('checkGlobalTypes', '检查项目全局类型声明', { projectPath })
  
  const possiblePaths = [
    projectPath,
    process.cwd(),
    path.join(REPO_ROOT, '..'),
  ].filter(Boolean)
  
  const typeFileCandidates = [
    'types/global.d.ts',
    'typings/index.d.ts',
    'src/types/index.d.ts',
    'src/typings/global.d.ts',
    'src/types/global.d.ts',
    'types/index.d.ts',
  ]
  
  const result = {
    found: false,
    globalTypesPath: null,
    globalTypes: [],
    globalInterfaces: [],
    globalEnums: [],
    recommendation: ''
  }
  
  for (const basePath of possiblePaths) {
    for (const typeFile of typeFileCandidates) {
      const fullPath = path.join(basePath, typeFile)
      
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          result.found = true
          result.globalTypesPath = fullPath
          
          // 提取 declare interface
          const interfaceMatches = content.matchAll(/declare\s+interface\s+(\w+)/g)
          for (const match of interfaceMatches) {
            result.globalInterfaces.push(match[1])
          }
          
          // 提取 declare type
          const typeMatches = content.matchAll(/declare\s+type\s+(\w+)/g)
          for (const match of typeMatches) {
            result.globalTypes.push(match[1])
          }
          
          // 提取 declare enum
          const enumMatches = content.matchAll(/declare\s+enum\s+(\w+)/g)
          for (const match of enumMatches) {
            result.globalEnums.push(match[1])
          }
          
          // 也检查非 declare 的全局类型
          const plainInterfaceMatches = content.matchAll(/^interface\s+(\w+)/gm)
          for (const match of plainInterfaceMatches) {
            if (!result.globalInterfaces.includes(match[1])) {
              result.globalInterfaces.push(match[1])
            }
          }
          
          const plainTypeMatches = content.matchAll(/^type\s+(\w+)/gm)
          for (const match of plainTypeMatches) {
            if (!result.globalTypes.includes(match[1])) {
              result.globalTypes.push(match[1])
            }
          }
          
          logger.info('checkGlobalTypes', `找到全局类型文件: ${fullPath}`, {
            interfaces: result.globalInterfaces.length,
            types: result.globalTypes.length,
            enums: result.globalEnums.length
          })
          
          result.recommendation = `⚠️ 以下类型是全局声明的，生成代码时【绝对不要 import】：\n` +
            `- Interfaces: ${result.globalInterfaces.join(', ') || '无'}\n` +
            `- Types: ${result.globalTypes.join(', ') || '无'}\n` +
            `- Enums: ${result.globalEnums.join(', ') || '无'}`
          
          return result
        } catch (e) {
          logger.warn('checkGlobalTypes', `读取类型文件失败: ${fullPath}`, { error: e.message })
        }
      }
    }
  }
  
  result.recommendation = '未找到全局类型文件，可以正常使用 import type'
  logger.info('checkGlobalTypes', '未找到全局类型文件')
  return result
}

/**
 * 解析接口类型文件
 */
export function parseApiTypes(filePath) {
  logger.info('parseApiTypes', '解析接口类型文件', { filePath })
  
  if (!filePath || !fs.existsSync(filePath)) {
    logger.warn('parseApiTypes', `文件不存在: ${filePath}`)
    return {
      success: false,
      error: '文件不存在',
      filePath
    }
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    const result = {
      success: true,
      filePath,
      interfaces: [],
      types: [],
      apiMethods: [],
      requestTypes: [],
      responseTypes: []
    }
    
    // 提取 interface 定义
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:<[^>]+>)?\s*\{([^}]+)\}/gs
    let match
    while ((match = interfaceRegex.exec(content)) !== null) {
      const name = match[1]
      const body = match[2]
      
      const fields = []
      const fieldRegex = /(\w+)(\?)?:\s*([^;]+);/g
      let fieldMatch
      while ((fieldMatch = fieldRegex.exec(body)) !== null) {
        fields.push({
          name: fieldMatch[1],
          optional: !!fieldMatch[2],
          type: fieldMatch[3].trim()
        })
      }
      
      result.interfaces.push({ name, fields })
      
      if (name.endsWith('Request') || name.endsWith('Params') || name.endsWith('Query')) {
        result.requestTypes.push(name)
      } else if (name.endsWith('Response') || name.endsWith('Result') || name.endsWith('Data')) {
        result.responseTypes.push(name)
      }
    }
    
    // 提取 type 定义
    const typeRegex = /(?:export\s+)?type\s+(\w+)(?:<[^>]+>)?\s*=\s*([^;]+);/g
    while ((match = typeRegex.exec(content)) !== null) {
      result.types.push({
        name: match[1],
        definition: match[2].trim()
      })
    }
    
    // 提取 API 方法
    const apiRegex = /(?:export\s+)?(?:const|function)\s+(\w+)\s*[=:]\s*(?:async\s*)?\([^)]*\)\s*(?:=>|:)/g
    while ((match = apiRegex.exec(content)) !== null) {
      const methodName = match[1]
      if (/^(get|fetch|create|update|delete|post|put|patch|remove|add|save|submit|upload|download|import|export)/i.test(methodName)) {
        result.apiMethods.push(methodName)
      }
    }
    
    logger.info('parseApiTypes', '解析完成', {
      interfaces: result.interfaces.length,
      types: result.types.length,
      apiMethods: result.apiMethods.length
    })
    
    return result
  } catch (error) {
    logger.error('parseApiTypes', '解析文件失败', error)
    return {
      success: false,
      error: error.message,
      filePath
    }
  }
}

/**
 * 检查代码是否符合规范
 */
export function checkCodeCompliance(generatedFiles, projectPath = null) {
  logger.info('checkCodeCompliance', '检查代码规范符合性', { 
    fileCount: generatedFiles?.length,
    projectPath 
  })
  
  const issues = []
  const passed = []
  
  const checks = [
    {
      name: 'hooks/composables 文件检查',
      check: () => {
        const hasHooks = generatedFiles.some(f => 
          f.includes('/hooks/') || f.includes('/composables/') || 
          f.includes('\\hooks\\') || f.includes('\\composables\\')
        )
        const hasComponent = generatedFiles.some(f => 
          f.endsWith('.tsx') || f.endsWith('.vue') || 
          (f.includes('/components/') && f.endsWith('.ts'))
        )
        if (hasComponent && !hasHooks) {
          return { pass: false, message: '⛔ 发现组件文件但缺少 hooks/composables 文件' }
        }
        if (hasHooks) {
          return { pass: true, message: '✅ hooks/composables 文件已生成' }
        }
        return { pass: true, message: '✅ 无需 hooks 文件（非组件场景）' }
      }
    },
    {
      name: 'hooks 文件生成顺序检查',
      check: () => {
        const hooksIndex = generatedFiles.findIndex(f => 
          f.includes('/hooks/') || f.includes('/composables/')
        )
        const componentIndex = generatedFiles.findIndex(f => 
          f.endsWith('.tsx') || f.endsWith('.vue')
        )
        if (hooksIndex >= 0 && componentIndex >= 0 && hooksIndex > componentIndex) {
          return { pass: false, message: '⛔ hooks 文件应该在组件文件之前生成' }
        }
        return { pass: true, message: '✅ 文件生成顺序正确' }
      }
    },
    {
      name: '类型文件检查',
      check: () => {
        const hasTypes = generatedFiles.some(f => f.includes('types.ts'))
        if (hasTypes) {
          return { pass: true, message: '✅ 类型定义文件已生成' }
        }
        return { pass: true, message: 'ℹ️ 无类型定义文件（可能使用全局类型）' }
      }
    },
    {
      name: '文件数量检查',
      check: () => {
        if (generatedFiles.length === 0) {
          return { pass: false, message: '⛔ 未生成任何文件' }
        }
        return { pass: true, message: `✅ 已生成 ${generatedFiles.length} 个文件` }
      }
    }
  ]
  
  for (const { name, check } of checks) {
    try {
      const result = check()
      if (result.pass) {
        passed.push({ rule: name, ...result })
      } else {
        issues.push({ rule: name, ...result })
      }
    } catch (e) {
      issues.push({ rule: name, pass: false, message: `检查异常: ${e.message}` })
    }
  }
  
  const report = {
    summary: issues.length === 0 ? '✅ 所有检查通过' : `⚠️ 发现 ${issues.length} 个问题`,
    passed,
    issues,
    generatedFiles,
    recommendation: issues.length > 0 
      ? '请根据以上问题修复代码后重新提交'
      : '代码已准备就绪，可直接使用'
  }
  
  logger.info('checkCodeCompliance', '检查完成', { 
    passedCount: passed.length, 
    issueCount: issues.length 
  })
  
  return report
}
