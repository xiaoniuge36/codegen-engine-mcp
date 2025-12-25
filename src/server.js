/**
 * AI CodeGen Engine - MCP 服务器（模块化版本）
 */
import path from 'path'
import { fileURLToPath } from 'url'

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

import { logger } from './utils/index.js'
import { getStdioToolsDefinition, handleToolCall, TOOLS_DEFINITION } from './tools/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建 MCP 服务器
const server = new Server(
  { name: 'codegen-engine', version: '2.0.0' },
  { capabilities: { tools: {} } }
)

// 注册工具列表处理器
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('ListTools', 'AI 代码生成引擎 - 工具列表')
  return {
    tools: getStdioToolsDefinition()
  }
})

// 注册工具调用处理器
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  
  logger.info('CallTool', `工具调用开始: ${name}`, args)
  
  try {
    const result = await handleToolCall(name, args)
    logger.info('CallTool', `工具调用完成: ${name}`)
    return result
  } catch (error) {
    logger.error('CallTool', `工具调用失败: ${name}`, error)
    throw error
  }
})

/**
 * 创建服务器实例（供外部使用）
 */
export function createServer() {
  logger.info('createServer', 'AI 代码生成引擎服务创建成功')
  return server
}

/**
 * 处理工具列表请求（供 HTTP 模式使用）
 */
export async function handleListTools() {
  return { tools: TOOLS_DEFINITION }
}

/**
 * 处理工具调用请求（供 HTTP 模式使用）
 */
export async function handleCallTool(name, args) {
  return await handleToolCall(name, args)
}

// 导出工具定义
export { TOOLS_DEFINITION }

/**
 * STDIO 模式启动
 */
async function mainStdio() {
  logger.info('mainStdio', 'AI 代码生成引擎启动（STDIO 模式）')
  const transport = new StdioServerTransport()
  await server.connect(transport)
  logger.info('mainStdio', 'AI 代码生成引擎已连接并准备就绪')
}

// 如果直接运行，启动 STDIO 模式
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  mainStdio().catch((err) => {
    logger.error('mainStdio', 'AI 代码生成引擎启动失败', err)
    process.exit(1)
  })
}
