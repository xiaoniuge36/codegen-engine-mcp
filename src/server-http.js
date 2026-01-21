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
  console.log(`✨ 可用工具: ${TOOLS_DEFINITION.length} 个`)
  console.log('')
  console.log('\u2b50 \u6838\u5fc3\u5de5\u5177\uff08\u5fc5\u987b\u4e86\u89e3\uff09:')
  console.log('  - quick_generate          \u3010\u9ed8\u8ba4\u5165\u53e3\u3011\u4e00\u952e\u5feb\u901f\u751f\u6210')
  console.log('  - generate_code_context   \u4e00\u952e\u751f\u6210\u5b8c\u6574\u4ee3\u7801\u4e0a\u4e0b\u6587')
  console.log('  - check_code_compliance   \u3010\u751f\u6210\u540e\u8c03\u7528\u3011\u68c0\u67e5\u4ee3\u7801\u89c4\u8303')
  console.log('')
  console.log('\ud83d\udce6 \u6a21\u677f\u5de5\u5177:')
  console.log('  - smart_match_template    \u667a\u80fd\u5339\u914d\u6a21\u677f')
  console.log('  - list_templates          \u5217\u51fa\u6240\u6709\u6a21\u677f')
  console.log('  - get_template            \u83b7\u53d6\u6a21\u677f\u8be6\u60c5')
  console.log('  - get_code_examples       \u83b7\u53d6\u793a\u4f8b\u4ee3\u7801')
  console.log('')
  console.log('\ud83d\udd0d \u9879\u76ee\u5206\u6790\u5de5\u5177:')
  console.log('  - detect_tech_stack       \u68c0\u6d4b\u9879\u76ee\u6280\u672f\u6808')
  console.log('  - analyze_project         \u5206\u6790\u9879\u76ee\u7ed3\u6784\u548c\u4ee3\u7801\u98ce\u683c')
  console.log('  - check_global_types      \u68c0\u67e5\u5168\u5c40\u7c7b\u578b\u58f0\u660e')
  console.log('  - find_similar_components \u67e5\u627e\u76f8\u4f3c\u7ec4\u4ef6')
  console.log('')
  console.log('\ud83d\udcda \u77e5\u8bc6\u5e93\u5de5\u5177:')
  console.log('  - get_spec_content        \u83b7\u53d6\u89c4\u8303\u6587\u6863\u5185\u5bb9')
  console.log('  - get_component_knowledge \u83b7\u53d6\u7ec4\u4ef6\u5e93\u77e5\u8bc6')
  console.log('  - parse_api_types         \u89e3\u6790\u63a5\u53e3\u7c7b\u578b\u6587\u4ef6')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
})
