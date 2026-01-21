import fs from 'fs'
import path from 'path'
import { logger, readJson, readText, KNOWLEDGE_DIR, EXAMPLES_DIR } from '../utils/index.js'

/**
 * 获取组件库知识图谱
 */
export function getComponentKnowledge(scope = 'common', projectId = null) {
  logger.info('getComponentKnowledge', `获取组件库知识图谱`, { scope, projectId })
  
  try {
    let knowledgePath
    if (scope === 'common') {
      knowledgePath = path.join(KNOWLEDGE_DIR, 'common')
    } else if (scope === 'business' && projectId) {
      knowledgePath = path.join(KNOWLEDGE_DIR, 'business', projectId)
    } else {
      knowledgePath = path.join(KNOWLEDGE_DIR, 'common')
    }
    
    if (!fs.existsSync(knowledgePath)) {
      logger.warn('getComponentKnowledge', `知识图谱目录不存在: ${knowledgePath}`)
      return {}
    }
    
    const result = {}
    const files = fs.readdirSync(knowledgePath)
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const name = file.replace('.md', '')
        const content = readText(path.join(knowledgePath, file))
        result[name] = content
      }
    }
    
    logger.info('getComponentKnowledge', `获取到 ${Object.keys(result).length} 个组件库知识`)
    return result
  } catch (e) {
    logger.error('getComponentKnowledge', '获取组件库知识失败', e)
    return {}
  }
}

/**
 * 获取示例代码
 */
export function getCodeExamples(templateId) {
  logger.info('getCodeExamples', `获取示例代码: ${templateId}`, { EXAMPLES_DIR })
  
  try {
    const exampleDir = path.join(EXAMPLES_DIR, templateId)
    logger.info('getCodeExamples', `查找目录: ${exampleDir}`)
    
    if (!fs.existsSync(exampleDir)) {
      logger.warn('getCodeExamples', `示例代码目录不存在: ${exampleDir}`, {
        EXAMPLES_DIR,
        templateId,
        exampleDir
      })
      return null
    }
    
    const result = {}
    
    function readExamplesRecursive(dir, prefix = '') {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const relativePath = prefix ? `${prefix}/${item}` : item
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          readExamplesRecursive(fullPath, relativePath)
        } else if (stat.isFile()) {
          // 只读取代码文件
          const ext = path.extname(item).toLowerCase()
          if (['.ts', '.tsx', '.js', '.jsx', '.vue', '.css', '.scss', '.less'].includes(ext)) {
            result[relativePath] = readText(fullPath)
          }
        }
      }
    }
    
    readExamplesRecursive(exampleDir)
    
    logger.info('getCodeExamples', `获取到 ${Object.keys(result).length} 个示例文件`)
    return result
  } catch (e) {
    logger.error('getCodeExamples', '获取示例代码失败', e)
    return null
  }
}
