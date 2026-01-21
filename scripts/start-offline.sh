#!/bin/bash
# ============================================================
# AI 代码生成引擎 - 离线启动脚本
# 用法: ./start.sh
# 说明: 适用于服务器无法访问 npm 的场景，跳过依赖安装
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 配置
APP_NAME="codegen-engine"
PORT="${PORT:-7331}"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 AI 代码生成引擎 - 离线启动${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================
# 检查 Node.js
# ============================================================
check_node() {
    echo -e "${YELLOW}🔍 检查 Node.js 环境...${NC}"
    
    if command -v node &> /dev/null; then
        echo -e "   Node.js 版本: ${GREEN}$(node -v)${NC}"
    else
        echo -e "${RED}❌ 未检测到 Node.js，请先安装 Node.js v16+${NC}"
        echo -e "   下载地址: https://nodejs.org/"
        exit 1
    fi
}

# ============================================================
# 检查依赖
# ============================================================
check_deps() {
    echo ""
    echo -e "${YELLOW}📦 检查项目依赖...${NC}"
    
    if [ -d "node_modules" ]; then
        echo -e "   ${GREEN}✓${NC} node_modules 已存在"
    else
        echo -e "${RED}❌ 未找到 node_modules 目录${NC}"
        echo -e "   此为离线包，应已包含依赖。请检查解压是否完整。"
        exit 1
    fi
}

# ============================================================
# 启动服务
# ============================================================
start_service() {
    echo ""
    echo -e "${YELLOW}🚀 启动服务...${NC}"
    
    # 检查 PM2
    if command -v pm2 &> /dev/null; then
        echo -e "   使用 PM2 管理进程..."
        
        # 检查是否已在运行
        if pm2 list | grep -q "$APP_NAME"; then
            echo -e "   服务已存在，重启中..."
            pm2 restart "$APP_NAME"
        else
            PORT=$PORT pm2 start src/server-http.js \
                --name "$APP_NAME" \
                --time \
                --log-date-format "YYYY-MM-DD HH:mm:ss"
        fi
    else
        echo -e "${YELLOW}⚠️  PM2 未安装，尝试安装...${NC}"
        
        # 尝试安装 PM2
        if npm install -g pm2 2>/dev/null; then
            echo -e "${GREEN}✅ PM2 安装成功${NC}"
            PORT=$PORT pm2 start src/server-http.js \
                --name "$APP_NAME" \
                --time \
                --log-date-format "YYYY-MM-DD HH:mm:ss"
        else
            echo -e "${YELLOW}⚠️  PM2 安装失败，使用直接运行模式${NC}"
            echo -e "   提示: 直接运行模式下，关闭终端服务会停止"
            echo -e "   按 Ctrl+C 可停止服务"
            echo ""
            PORT=$PORT node src/server-http.js
            exit 0
        fi
    fi
    
    # 等待启动
    sleep 2
    
    # 健康检查
    echo ""
    echo -e "${YELLOW}💚 健康检查...${NC}"
    
    if curl -s "http://localhost:${PORT}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服务启动成功！${NC}"
    else
        echo -e "${RED}⚠️  服务可能未正常启动${NC}"
        if command -v pm2 &> /dev/null; then
            echo -e "   查看日志: pm2 logs ${APP_NAME}"
        fi
    fi
}

# ============================================================
# 显示信息
# ============================================================
show_info() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✨ AI 代码生成引擎已启动${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "📍 MCP 端点:   ${BLUE}http://localhost:${PORT}/mcp${NC}"
    echo -e "💚 健康检查:   ${BLUE}http://localhost:${PORT}/health${NC}"
    echo ""
    if command -v pm2 &> /dev/null; then
        echo -e "常用命令:"
        echo -e "  ${YELLOW}pm2 logs ${APP_NAME}${NC}     - 查看日志"
        echo -e "  ${YELLOW}pm2 restart ${APP_NAME}${NC}  - 重启服务"
        echo -e "  ${YELLOW}pm2 stop ${APP_NAME}${NC}     - 停止服务"
    fi
    echo ""
}

# ============================================================
# 主流程
# ============================================================
main() {
    check_node
    check_deps
    start_service
    show_info
}

main "$@"
