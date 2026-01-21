import fs from 'fs'
import path from 'path'
import { logger, readText, ENGINE_ROOT, REPO_ROOT } from '../utils/index.js'

/**
 * 构建规范文档候选路径列表
 * @param {string|null} projectPath - 用户项目路径（优先级最高）
 * @returns {string[]} 候选路径列表
 */
export function buildSpecCandidates(projectPath = null) {
  const candidates = []
  
  // 1. 用户项目路径（如果提供）- 最高优先级
  if (projectPath) {
    const absProjectPath = path.isAbsolute(projectPath) ? projectPath : path.resolve(projectPath)
    candidates.push(
      path.join(absProjectPath, '.lingma', 'rules', 'ai-fe-code-std.md'),
      path.join(absProjectPath, 'ai-fe-code-std.md'),
      path.join(absProjectPath, 'AI前端代码生成执行规范（含vue、规范、完整版）.md'),
    )
  }
  
  // 2. MCP 工具目录（codegen-engine）
  candidates.push(
    path.join(ENGINE_ROOT, 'rules', 'ai-fe-code-std.md'),  // ✅ 规则文件默认位置
    path.join(ENGINE_ROOT, '.lingma', 'rules', 'ai-fe-code-std.md'),
    path.join(ENGINE_ROOT, 'ai-fe-code-std.md'),
    path.join(ENGINE_ROOT, 'AI前端代码生成执行规范（含vue、规范、完整版）.md'),
  )
  
  // 3. 仓库根目录（AI-VIBE-CODING）作为兜底
  candidates.push(
    path.join(REPO_ROOT, '.lingma', 'rules', 'ai-fe-code-std.md'),
    path.join(REPO_ROOT, 'ai-fe-code-std.md'),
    path.join(REPO_ROOT, 'AI前端代码生成执行规范（含vue、规范、完整版）.md'),
  )
  
  // 去重
  return [...new Set(candidates)]
}

/**
 * 解析规范文档路径
 * @param {string|null} customPath - 自定义规范文件完整路径
 * @param {string|null} projectPath - 用户项目路径（用于在项目中查找规则文件）
 * @returns {string} 规范文档路径
 */
export function resolveSpecPath(customPath = null, projectPath = null) {
  logger.info('resolveSpecPath', '开始查找规范文档...', { customPath, projectPath })
  
  // 1. 如果提供了自定义完整路径，优先使用
  if (customPath) {
    const absPath = path.isAbsolute(customPath) ? customPath : path.resolve(customPath)
    if (fs.existsSync(absPath)) {
      logger.info('resolveSpecPath', `使用自定义规范文档路径: ${absPath}`)
      return absPath
    }
    logger.warn('resolveSpecPath', `自定义路径不存在: ${absPath}`)
  }
  
  // 2. 按优先级查找候选路径（优先用户项目，其次 MCP 仓库）
  const candidates = buildSpecCandidates(projectPath)
  logger.info('resolveSpecPath', `查找候选路径: ${candidates.length} 个`, { candidates })
  
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      logger.info('resolveSpecPath', `找到规范文档: ${p}`)
      return p
    }
  }
  
  // 3. 默认返回 MCP 工具仓库根目录的标准规范文件
  const defaultPath = path.join(REPO_ROOT, 'ai-fe-code-std.md')
  logger.warn('resolveSpecPath', '未找到任何规范文档，返回默认路径', { 
    path: defaultPath,
    searchedPaths: candidates 
  })
  return defaultPath
}

/**
 * 搜索规范文档中的内容
 */
export function searchSpecLines(query, maxResults = 10, customSpecPath = null) {
  logger.info('searchSpecLines', `搜索规范文档`, { query, maxResults, customSpecPath })
  
  const q = String(query || '').trim()
  if (!q) {
    logger.warn('searchSpecLines', '搜索关键词为空')
    return []
  }

  const specPath = customSpecPath || resolveSpecPath()
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

/**
 * 获取规范文档内容
 */
export function getSpecContent(specPath, projectPath = null, section = null) {
  const resolvedPath = resolveSpecPath(specPath, projectPath)
  
  if (!fs.existsSync(resolvedPath)) {
    return {
      success: false,
      error: '规范文档不存在',
      specPath: resolvedPath,
      projectPath: projectPath || '(未指定)',
      searchedPaths: buildSpecCandidates(projectPath),
      hint: '请传入 projectPath 参数指定用户项目路径'
    }
  }
  
  let content = readText(resolvedPath)
  
  // 如果指定了章节，提取该章节内容
  if (section) {
    const sectionRegex = new RegExp(`## .*${section}.*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i')
    const match = content.match(sectionRegex)
    if (match) {
      content = match[0]
    }
  }
  
  return {
    success: true,
    specPath: resolvedPath,
    projectPath: projectPath || '(未指定)',
    section: section || '(全部)',
    contentLength: content.length,
    content
  }
}
