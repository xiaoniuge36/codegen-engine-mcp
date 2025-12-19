import express from 'express'

const app = express()
const PORT = process.env.PORT || 7331

/**
 * 日志工具
 */
const logger = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [ERROR] ${message}`, error?.message || error)
  },
}

app.use(express.json())

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// 导入工具处理逻辑
import {
  handleListTools,
  handleCallTool,
} from './server-handlers.js'

/**
 * MCP HTTP endpoint
 * 支持 MCP 协议的 JSON-RPC 请求
 */
app.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body

  logger.info('收到 MCP 请求', { method, id })

  try {
    let result

    // 处理不同的 MCP 方法
    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'ai-codegen-engine',
            version: '1.0.0',
          },
        }
        logger.info('初始化成功')
        break

      case 'tools/list':
        result = await handleListTools()
        logger.info('列出工具成功')
        break

      case 'tools/call':
        result = await handleCallTool(params)
        logger.info('调用工具成功', { tool: params?.name })
        break

      case 'ping':
        result = {}
        break

      default:
        throw new Error(`不支持的方法: ${method}`)
    }

    // 返回 JSON-RPC 响应
    res.json({
      jsonrpc: '2.0',
      id,
      result,
    })
  } catch (error) {
    logger.error('MCP 请求处理失败', error)
    res.status(200).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: error.message,
        data: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    })
  }
})

// 健康检查
app.get('/health', (req, res) => {
  logger.info('健康检查')
  res.json({
    status: 'ok',
    service: 'AI 代码生成引擎',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// 根路径
app.get('/', (req, res) => {
  res.json({
    service: 'AI 代码生成引擎 (AI CodeGen Engine)',
    version: '1.0.0',
    description: '智能代码生成服务 - 通过模板匹配、组件库知识图谱和示例代码，提升前端代码生成质量',
    endpoints: {
      mcp: 'POST /mcp - MCP 协议端点',
      health: 'GET /health - 健康检查',
    },
    features: [
      '模板智能匹配',
      '组件库知识图谱',
      '示例代码注入',
      '规范文档检索',
      '增强版提示词生成',
    ],
  })
})

app.listen(PORT, () => {
  logger.info(`🚀 AI 代码生成引擎已启动`)
  logger.info(`📍 服务地址: http://127.0.0.1:${PORT}/mcp`)
  logger.info(`💚 健康检查: http://127.0.0.1:${PORT}/health`)
  logger.info(`📖 服务信息: http://127.0.0.1:${PORT}/`)
  console.log('')
  console.log('✨ 可用功能:')
  console.log('  - 模板智能匹配')
  console.log('  - 组件库知识图谱自动注入')
  console.log('  - 示例代码自动附加')
  console.log('  - 规范文档快速检索')
  console.log('')
})
