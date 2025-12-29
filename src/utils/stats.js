import fs from 'fs'
import path from 'path'
import { logger, ENGINE_ROOT } from './index.js'

const STATS_FILE = path.join(ENGINE_ROOT, '.stats.json')

/**
 * 格式化日期为易读格式
 */
function formatDate(isoString) {
  if (!isoString) return null
  try {
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (e) {
    return isoString
  }
}

/**
 * 读取统计数据
 */
function readStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'))
    }
  } catch (e) {
    logger.warn('stats', '读取统计文件失败', { error: e.message })
  }
  return {
    version: '1.0.0',
    created: new Date().toISOString(),
    toolCalls: {},
    templateUsage: {},
    techStackDetections: {},
    lastUpdated: null
  }
}

/**
 * 保存统计数据
 */
function saveStats(stats) {
  try {
    stats.lastUpdated = new Date().toISOString()
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2))
  } catch (e) {
    logger.warn('stats', '保存统计文件失败', { error: e.message })
  }
}

/**
 * 记录工具调用
 */
export function recordToolCall(toolName) {
  const stats = readStats()
  stats.toolCalls[toolName] = (stats.toolCalls[toolName] || 0) + 1
  saveStats(stats)
}

/**
 * 记录模板使用
 */
export function recordTemplateUsage(templateId, matched = false) {
  const stats = readStats()
  if (!stats.templateUsage[templateId]) {
    stats.templateUsage[templateId] = { total: 0, matched: 0 }
  }
  stats.templateUsage[templateId].total += 1
  if (matched) {
    stats.templateUsage[templateId].matched += 1
  }
  saveStats(stats)
}

/**
 * 记录技术栈检测
 */
export function recordTechStackDetection(techStack, projectName) {
  const stats = readStats()
  const key = techStack || 'unknown'
  if (!stats.techStackDetections[key]) {
    stats.techStackDetections[key] = { count: 0, projects: [] }
  }
  stats.techStackDetections[key].count += 1
  if (projectName && !stats.techStackDetections[key].projects.includes(projectName)) {
    stats.techStackDetections[key].projects.push(projectName)
  }
  saveStats(stats)
}

/**
 * 获取统计摘要
 */
export function getStatsSummary() {
  const stats = readStats()
  
  // 工具调用排名
  const toolRanking = Object.entries(stats.toolCalls)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  // 模板使用排名
  const templateRanking = Object.entries(stats.templateUsage)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
  
  // 技术栈分布
  const techStackDistribution = Object.entries(stats.techStackDetections)
    .map(([stack, data]) => ({ stack, count: data.count }))
    .sort((a, b) => b.count - a.count)
  
  return {
    created: formatDate(stats.created),
    lastUpdated: formatDate(stats.lastUpdated),
    totalToolCalls: Object.values(stats.toolCalls).reduce((a, b) => a + b, 0),
    totalTemplateUsage: Object.values(stats.templateUsage).reduce((a, b) => a + b.total, 0),
    toolRanking,
    templateRanking,
    techStackDistribution
  }
}
