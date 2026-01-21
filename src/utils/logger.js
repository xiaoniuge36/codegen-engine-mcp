/**
 * 日志工具 - 记录所有工具调用
 */
export const logger = {
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

export default logger
