/**
 * AI CodeGen Engine - HTTP 服务器
 * 使用模块化架构
 */
import express from 'express'

// 从模块化源码导入
import { logger, TOOLS_DEFINITION, handleToolCall } from './index.js'

const app = express()
const PORT = process.env.PORT || 7331

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

/**
 * MCP HTTP endpoint
 * 支持 MCP 协议的 JSON-RPC 请求
 */
app.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body

  logger.info('MCP', `收到请求: ${method}`, { id })

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
            version: '2.0.0',
          },
        }
        logger.info('MCP', '客户端初始化成功')
        break

      case 'notifications/initialized':
        // 客户端通知已初始化完成，无需返回结果
        result = {}
        logger.info('MCP', '客户端已就绪')
        break

      case 'tools/list':
        result = { tools: TOOLS_DEFINITION }
        logger.info('MCP', `列出工具: ${TOOLS_DEFINITION.length} 个`)
        break

      case 'tools/call':
        const toolName = params?.name
        logger.info('MCP', `调用工具: ${toolName}`)
        result = await handleToolCall(toolName, params?.arguments)
        logger.info('MCP', `工具执行完成: ${toolName}`)
        break

      case 'ping':
        result = {}
        break

      default:
        logger.warn('MCP', `未知方法: ${method}`)
        throw new Error(`不支持的方法: ${method}`)
    }

    // 返回 JSON-RPC 响应
    res.json({
      jsonrpc: '2.0',
      id,
      result,
    })
  } catch (error) {
    logger.error('MCP', `请求处理失败: ${method}`, error)
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
  res.json({
    status: 'ok',
    service: 'AI 代码生成引擎',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  })
})

// 根路径
app.get('/', (req, res) => {
  res.json({
    service: 'AI 代码生成引擎 (AI CodeGen Engine)',
    version: '2.0.0',
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
  console.log('')
  console.log('🚀 AI 代码生成引擎 v2.0.0')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📍 MCP 端点:   http://127.0.0.1:${PORT}/mcp`)
  console.log(`💚 健康检查:   http://127.0.0.1:${PORT}/health`)
  console.log(`📖 服务信息:   http://127.0.0.1:${PORT}/`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ 可用工具: 15 个')
  console.log('  - generate_code_context   一键生成代码上下文')
  console.log('  - check_code_compliance   检查代码规范符合性')
  console.log('  - detect_tech_stack       检测项目技术栈')
  console.log('  - smart_match_template    智能匹配模板')
  console.log('  - get_spec_content        获取规范文档内容')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
})
