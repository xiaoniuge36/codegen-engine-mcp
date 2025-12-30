/**
 * 代码验证工具 - 整合 TypeScript + ESLint 检查
 * 
 * 功能：
 * 1. 执行 TypeScript 类型检查（tsc --noEmit）
 * 2. 执行 ESLint 规则检查
 * 3. 返回错误列表和修复建议
 */

import { execSync, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { logger, findPackageJsonUpward } from '../utils/index.js'

/**
 * 检测项目中是否有 TypeScript
 */
function hasTypeScript(projectRoot) {
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
  return fs.existsSync(tsconfigPath)
}

/**
 * 检测项目中是否有 ESLint
 */
function hasEslint(projectRoot) {
  const eslintConfigs = [
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.json',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    'eslint.config.js',
    'eslint.config.mjs'
  ]
  
  return eslintConfigs.some(config => 
    fs.existsSync(path.join(projectRoot, config))
  )
}

/**
 * 执行 TypeScript 检查
 */
function runTypeScriptCheck(projectRoot, files = []) {
  const result = {
    success: false,
    errors: [],
    errorCount: 0,
    command: ''
  }

  if (!hasTypeScript(projectRoot)) {
    return { ...result, skipped: true, reason: '项目未配置 TypeScript' }
  }

  try {
    // 构建命令
    const tscPath = path.join(projectRoot, 'node_modules', '.bin', 'tsc')
    const hasTsc = fs.existsSync(tscPath) || fs.existsSync(tscPath + '.cmd')
    
    if (!hasTsc) {
      return { ...result, skipped: true, reason: '未安装 TypeScript (npm install typescript)' }
    }

    let command = 'npx tsc --noEmit --pretty false'
    if (files.length > 0) {
      // 只检查指定文件
      command = `npx tsc --noEmit --pretty false ${files.join(' ')}`
    }
    
    result.command = command

    const output = spawnSync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      shell: true,
      timeout: 60000 // 60秒超时
    })

    if (output.status === 0) {
      result.success = true
      return result
    }

    // 解析错误输出
    const errorOutput = output.stdout || output.stderr || ''
    const errorLines = errorOutput.split('\n').filter(line => line.trim())
    
    // 解析 TypeScript 错误格式: file(line,col): error TS1234: message
    const errorPattern = /^(.+)\((\d+),(\d+)\):\s*(error|warning)\s+(TS\d+):\s*(.+)$/
    
    for (const line of errorLines) {
      const match = line.match(errorPattern)
      if (match) {
        result.errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          severity: match[4],
          code: match[5],
          message: match[6]
        })
      }
    }

    result.errorCount = result.errors.length
    return result

  } catch (error) {
    logger.error('runTypeScriptCheck', error.message)
    return { ...result, error: error.message }
  }
}

/**
 * 执行 ESLint 检查
 */
function runEslintCheck(projectRoot, files = []) {
  const result = {
    success: false,
    errors: [],
    warnings: [],
    errorCount: 0,
    warningCount: 0,
    fixableCount: 0,
    command: ''
  }

  if (!hasEslint(projectRoot)) {
    return { ...result, skipped: true, reason: '项目未配置 ESLint' }
  }

  try {
    const eslintPath = path.join(projectRoot, 'node_modules', '.bin', 'eslint')
    const hasEslintBin = fs.existsSync(eslintPath) || fs.existsSync(eslintPath + '.cmd')
    
    if (!hasEslintBin) {
      return { ...result, skipped: true, reason: '未安装 ESLint (npm install eslint)' }
    }

    // 构建检查目标
    let targets = files.length > 0 ? files : ['src']
    const targetStr = targets.join(' ')
    
    result.command = `npx eslint ${targetStr} --format json`

    const output = spawnSync('npx', ['eslint', ...targets, '--format', 'json'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      shell: true,
      timeout: 60000
    })

    // ESLint 返回 0 表示无错误，1 表示有错误
    const jsonOutput = output.stdout || '[]'
    
    try {
      const eslintResults = JSON.parse(jsonOutput)
      
      for (const fileResult of eslintResults) {
        for (const msg of fileResult.messages || []) {
          const issue = {
            file: fileResult.filePath,
            line: msg.line,
            column: msg.column,
            severity: msg.severity === 2 ? 'error' : 'warning',
            ruleId: msg.ruleId,
            message: msg.message,
            fixable: !!msg.fix
          }
          
          if (msg.severity === 2) {
            result.errors.push(issue)
          } else {
            result.warnings.push(issue)
          }
          
          if (msg.fix) {
            result.fixableCount++
          }
        }
      }
      
      result.errorCount = result.errors.length
      result.warningCount = result.warnings.length
      result.success = result.errorCount === 0
      
    } catch (parseError) {
      // JSON 解析失败，尝试解析文本输出
      result.error = '无法解析 ESLint 输出'
    }

    return result

  } catch (error) {
    logger.error('runEslintCheck', error.message)
    return { ...result, error: error.message }
  }
}

/**
 * 生成修复建议
 */
function generateFixSuggestions(tsErrors, eslintErrors, eslintWarnings) {
  const suggestions = []

  // TypeScript 错误建议
  const tsErrorTypes = {}
  for (const err of tsErrors) {
    tsErrorTypes[err.code] = (tsErrorTypes[err.code] || 0) + 1
  }
  
  for (const [code, count] of Object.entries(tsErrorTypes)) {
    let suggestion = ''
    switch (code) {
      case 'TS2304':
        suggestion = `找不到名称：检查类型是否需要导入或是否为全局类型`
        break
      case 'TS2307':
        suggestion = `找不到模块：检查包是否安装或路径是否正确`
        break
      case 'TS2322':
        suggestion = `类型不匹配：检查赋值类型是否正确`
        break
      case 'TS2339':
        suggestion = `属性不存在：检查对象类型定义`
        break
      case 'TS2345':
        suggestion = `参数类型错误：检查函数参数类型`
        break
      case 'TS7006':
        suggestion = `参数隐式 any：添加类型注解`
        break
      default:
        suggestion = `TypeScript 错误 ${code}`
    }
    suggestions.push({ type: 'typescript', code, count, suggestion })
  }

  // ESLint 错误建议
  const eslintRules = {}
  for (const err of [...eslintErrors, ...eslintWarnings]) {
    if (err.ruleId) {
      eslintRules[err.ruleId] = (eslintRules[err.ruleId] || 0) + 1
    }
  }
  
  for (const [rule, count] of Object.entries(eslintRules)) {
    let suggestion = ''
    switch (rule) {
      case '@typescript-eslint/no-unused-vars':
      case 'no-unused-vars':
        suggestion = `删除未使用的变量或导入`
        break
      case 'no-console':
        suggestion = `删除 console.log 语句`
        break
      case 'react-hooks/exhaustive-deps':
        suggestion = `检查 useEffect/useMemo 依赖数组`
        break
      case 'react-hooks/rules-of-hooks':
        suggestion = `确保 Hooks 在组件顶层调用`
        break
      default:
        suggestion = `ESLint 规则: ${rule}`
    }
    suggestions.push({ type: 'eslint', rule, count, suggestion })
  }

  return suggestions
}

/**
 * 验证代码 - 主函数
 * @param {string} projectPath - 项目路径（可以是文件或目录）
 * @param {string[]} files - 要检查的文件列表（可选）
 * @param {object} options - 选项
 * @returns {object} 验证结果
 */
export function validateCode(projectPath, files = [], options = {}) {
  logger.info('validateCode', `验证代码: ${projectPath}`)
  
  // 查找项目根目录
  const packageInfo = findPackageJsonUpward(projectPath)
  if (!packageInfo) {
    return {
      success: false,
      error: '未找到 package.json，请确认项目路径正确',
      projectRoot: null
    }
  }

  const projectRoot = packageInfo.dir

  // 执行检查
  const tsResult = runTypeScriptCheck(projectRoot, files)
  const eslintResult = runEslintCheck(projectRoot, files)

  // 汇总结果
  const allErrors = [
    ...(tsResult.errors || []),
    ...(eslintResult.errors || [])
  ]
  
  const allWarnings = eslintResult.warnings || []
  
  const totalErrors = (tsResult.errorCount || 0) + (eslintResult.errorCount || 0)
  const totalWarnings = eslintResult.warningCount || 0

  // 生成修复建议
  const suggestions = generateFixSuggestions(
    tsResult.errors || [],
    eslintResult.errors || [],
    eslintResult.warnings || []
  )

  // 构建结果
  const result = {
    success: totalErrors === 0,
    projectRoot,
    summary: {
      totalErrors,
      totalWarnings,
      fixableCount: eslintResult.fixableCount || 0,
      tsSkipped: tsResult.skipped || false,
      eslintSkipped: eslintResult.skipped || false
    },
    typescript: {
      success: tsResult.success,
      skipped: tsResult.skipped,
      reason: tsResult.reason,
      errorCount: tsResult.errorCount || 0,
      errors: (tsResult.errors || []).slice(0, 10) // 最多返回10个错误
    },
    eslint: {
      success: eslintResult.success,
      skipped: eslintResult.skipped,
      reason: eslintResult.reason,
      errorCount: eslintResult.errorCount || 0,
      warningCount: eslintResult.warningCount || 0,
      fixableCount: eslintResult.fixableCount || 0,
      errors: (eslintResult.errors || []).slice(0, 10),
      warnings: (eslintResult.warnings || []).slice(0, 5)
    },
    suggestions,
    commands: {
      tsFix: tsResult.skipped ? null : 'npx tsc --noEmit',
      eslintFix: eslintResult.skipped ? null : 'npx eslint src --fix'
    }
  }

  // 生成报告
  if (result.success) {
    result.report = `✅ 代码验证通过！\n- TypeScript: ${tsResult.skipped ? '跳过' : '无错误'}\n- ESLint: ${eslintResult.skipped ? '跳过' : '无错误'}`
  } else {
    result.report = `❌ 发现 ${totalErrors} 个错误，${totalWarnings} 个警告\n\n` +
      `📋 修复建议：\n${suggestions.map(s => `- ${s.suggestion} (${s.count}处)`).join('\n')}`
  }

  return result
}
