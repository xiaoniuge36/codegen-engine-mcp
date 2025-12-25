import fs from 'fs'
import { logger } from './logger.js'

/**
 * 读取 JSON 文件
 */
export function readJson(p) {
  logger.info('readJson', `读取 JSON 文件: ${p}`)
  try {
    const content = JSON.parse(fs.readFileSync(p, 'utf8'))
    logger.info('readJson', `读取成功`)
    return content
  } catch (e) {
    logger.error('readJson', `读取失败: ${p}`, e)
    return {}
  }
}

/**
 * 读取文本文件
 */
export function readText(p) {
  logger.info('readText', `读取文本文件: ${p}`)
  try {
    const content = fs.readFileSync(p, 'utf8')
    logger.info('readText', `读取成功，长度: ${content.length}`)
    return content
  } catch (e) {
    logger.error('readText', `读取失败: ${p}`, e)
    return ''
  }
}

/**
 * 规范化文本
 */
export function normalizeText(input) {
  return String(input || '').trim().toLowerCase()
}

/**
 * 递归遍历目录
 */
export function walkDirectory(dir, extensions, maxDepth, currentDepth = 0) {
  if (currentDepth > maxDepth) return []
  
  const results = []
  
  try {
    if (!fs.existsSync(dir)) return results
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = `${dir}/${item}`
      
      try {
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          // 跳过 node_modules 等目录
          if (['node_modules', '.git', 'dist', 'build'].includes(item)) continue
          results.push(...walkDirectory(fullPath, extensions, maxDepth, currentDepth + 1))
        } else if (stat.isFile()) {
          const ext = item.split('.').pop()?.toLowerCase()
          if (extensions.includes(ext)) {
            results.push(fullPath)
          }
        }
      } catch (e) {
        // 跳过无法访问的文件
      }
    }
  } catch (e) {
    // 跳过无法访问的目录
  }
  
  return results
}
