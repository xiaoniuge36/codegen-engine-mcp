import fs from 'fs'
import path from 'path'
import { logger, normalizeText, walkDirectory, ENGINE_ROOT, REPO_ROOT } from '../utils/index.js'

/**
 * 检测项目技术栈
 * @param {string} projectPath 项目路径
 * @returns {object} 技术栈信息
 */
export function detectTechStack(projectPath = null) {
  logger.info('detectTechStack', '开始检测项目技术栈', { projectPath })
  
  let pkgPath = null
  let pkgContent = null
  
  // 辅助函数：向上查找 package.json，排除引擎自身
  const findPackageJsonUpward = (startPath) => {
    if (!startPath) return null
    
    // 如果是文件路径，先取目录
    let currentPath = path.resolve(startPath)
    if (fs.existsSync(currentPath) && fs.statSync(currentPath).isFile()) {
      currentPath = path.dirname(currentPath)
    }
    
    const root = path.parse(currentPath).root
    
    while (currentPath && currentPath !== root) {
      const testPath = path.join(currentPath, 'package.json')
      if (fs.existsSync(testPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(testPath, 'utf8'))
          // 排除引擎自身的 package.json
          if (content.name !== 'ai-codegen-engine') {
            return { path: testPath, content }
          }
        } catch (e) {
          // 解析失败，继续向上查找
        }
      }
      currentPath = path.dirname(currentPath)
    }
    return null
  }
  
  // 1. 优先使用用户传入的路径（支持文件或目录）
  if (projectPath) {
    const result = findPackageJsonUpward(projectPath)
    if (result) {
      pkgPath = result.path
      pkgContent = result.content
    }
  }
  
  // 2. 如果未找到，从 cwd 向上查找（但排除引擎目录）
  if (!pkgContent && process.cwd()) {
    const result = findPackageJsonUpward(process.cwd())
    if (result) {
      pkgPath = result.path
      pkgContent = result.content
    }
  }
  
  if (!pkgContent) {
    logger.warn('detectTechStack', '未找到 package.json，无法检测技术栈')
    return {
      detected: false,
      techStack: 'unknown',
      framework: null,
      uiLibrary: null,
      buildTool: null,
      packagePath: null
    }
  }
  
  logger.info('detectTechStack', `找到 package.json: ${pkgPath}`)
  
  const deps = {
    ...pkgContent.dependencies,
    ...pkgContent.devDependencies,
  }
  
  const result = {
    detected: true,
    techStack: 'unknown',
    framework: null,
    uiLibrary: null,
    buildTool: null,
    isTypeScript: false,
    packagePath: pkgPath,
    projectName: pkgContent.name || 'unknown'
  }
  
  // 检测框架
  if (deps['react'] || deps['react-dom']) {
    result.techStack = 'react'
    result.framework = 'react'
    if (deps['next']) result.framework = 'next'
    if (deps['umi'] || deps['@umijs/max']) result.framework = 'umi'
  } else if (deps['vue']) {
    const vueVersion = deps['vue']
    if (vueVersion?.startsWith('^3') || vueVersion?.startsWith('3') || vueVersion?.includes('next')) {
      result.techStack = 'vue3'
      result.framework = 'vue3'
    } else {
      result.techStack = 'vue2'
      result.framework = 'vue2'
    }
    if (deps['nuxt'] || deps['nuxt3']) result.framework = 'nuxt'
  }
  
  // 检测 UI 库
  if (deps['antd'] || deps['@ant-design/pro-components']) {
    result.uiLibrary = 'antd'
  } else if (deps['element-plus']) {
    result.uiLibrary = 'element-plus'
  } else if (deps['element-ui']) {
    result.uiLibrary = 'element-ui'
  } else if (deps['vant']) {
    result.uiLibrary = 'vant'
  } else if (deps['@arco-design/web-react'] || deps['@arco-design/web-vue']) {
    result.uiLibrary = 'arco-design'
  }
  
  // 检测构建工具
  if (deps['vite']) {
    result.buildTool = 'vite'
  } else if (deps['webpack'] || deps['@vue/cli-service'] || deps['react-scripts']) {
    result.buildTool = 'webpack'
  }
  
  // 检测 TypeScript
  if (deps['typescript']) {
    result.isTypeScript = true
  }
  
  logger.info('detectTechStack', '技术栈检测完成', result)
  return result
}

/**
 * 从项目中查找相似组件（兜底规则）
 */
export function findSimilarComponents(searchText, projectPath = null, techStack = null) {
  logger.info('findSimilarComponents', '开始查找项目中的相似组件', { searchText, projectPath, techStack })
  
  const basePaths = [
    projectPath,
    process.cwd(),
    path.join(REPO_ROOT, '..'),
  ].filter(Boolean)
  
  const results = []
  const searchLower = normalizeText(searchText)
  
  // 需要搜索的目录
  const searchDirs = [
    'src/components',
    'src/pages',
    'src/views',
    'components',
    'pages',
    'views',
  ]
  
  // 根据技术栈确定文件扩展名
  const extensions = []
  if (!techStack || techStack === 'react') {
    extensions.push('tsx', 'jsx', 'ts', 'js')
  }
  if (!techStack || techStack.startsWith('vue')) {
    extensions.push('vue')
  }
  
  // 关键词匹配权重
  const keywordPatterns = [
    { pattern: /upload|uploader/i, weight: 10, label: '上传' },
    { pattern: /file|attachment/i, weight: 8, label: '文件' },
    { pattern: /image|img|photo/i, weight: 6, label: '图片' },
    { pattern: /list|table/i, weight: 5, label: '列表' },
    { pattern: /form|edit|add/i, weight: 5, label: '表单' },
    { pattern: /modal|dialog|drawer/i, weight: 4, label: '弹窗' },
    { pattern: /detail|view/i, weight: 4, label: '详情' },
    { pattern: /import|export/i, weight: 6, label: '导入导出' },
  ]
  
  for (const basePath of basePaths) {
    for (const searchDir of searchDirs) {
      const fullDir = path.join(basePath, searchDir)
      
      if (!fs.existsSync(fullDir)) continue
      
      try {
        const files = walkDirectory(fullDir, extensions, 3)
        
        for (const file of files) {
          const fileName = path.basename(file).toLowerCase()
          const relativePath = path.relative(basePath, file)
          
          let score = 0
          const matchedLabels = []
          
          for (const { pattern, weight, label } of keywordPatterns) {
            if (pattern.test(fileName) || pattern.test(relativePath)) {
              score += weight
              matchedLabels.push(label)
            }
          }
          
          if (searchLower) {
            const searchWords = searchLower.split(/\s+/).filter(Boolean)
            for (const word of searchWords) {
              if (fileName.includes(word) || relativePath.toLowerCase().includes(word)) {
                score += 5
              }
            }
          }
          
          if (score > 0) {
            results.push({
              path: relativePath,
              fullPath: file,
              score,
              matchedLabels,
              fileName: path.basename(file),
            })
          }
        }
      } catch (e) {
        logger.warn('findSimilarComponents', `扫描目录失败: ${fullDir}`, { error: e.message })
      }
    }
  }
  
  // 按分数排序并去重
  const uniqueResults = []
  const seenPaths = new Set()
  
  results
    .sort((a, b) => b.score - a.score)
    .forEach(r => {
      if (!seenPaths.has(r.path)) {
        seenPaths.add(r.path)
        uniqueResults.push(r)
      }
    })
  
  logger.info('findSimilarComponents', `找到 ${uniqueResults.length} 个相似组件`)
  return uniqueResults.slice(0, 10)
}
