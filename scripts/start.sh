#!/bin/bash
# ============================================================
# AI 代码生成引擎 - 服务器启动脚本
# 用法: ./start.sh
# 功能: 自动检测环境、安装依赖、启动服务
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
NODE_MIN_VERSION="16"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 AI 代码生成引擎 - 启动脚本${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================
# 检查 Node.js
# ============================================================
check_node() {
    echo -e "${YELLOW}🔍 检查 Node.js 环境...${NC}"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        echo -e "   Node.js 版本: ${GREEN}$(node -v)${NC}"
        
        if [ "$NODE_VERSION" -lt "$NODE_MIN_VERSION" ]; then
            echo -e "${RED}❌ Node.js 版本过低，需要 v${NODE_MIN_VERSION}+${NC}"
            install_node
        fi
    else
        echo -e "${RED}❌ 未检测到 Node.js${NC}"
        install_node
    fi
}

# ============================================================
# 安装 Node.js
# ============================================================
install_node() {
    echo ""
    echo -e "${YELLOW}📥 安装 Node.js...${NC}"
    
    # 检测操作系统
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    elif [ "$(uname)" == "Darwin" ]; then
        OS="macos"
    else
        OS="unknown"
    fi
    
    case $OS in
        ubuntu|debian)
            echo -e "   检测到 ${BLUE}Ubuntu/Debian${NC}，使用 NodeSource 安装..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        centos|rhel|fedora)
            echo -e "   检测到 ${BLUE}CentOS/RHEL${NC}，使用 NodeSource 安装..."
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        alpine)
            echo -e "   检测到 ${BLUE}Alpine${NC}，使用 apk 安装..."
            sudo apk add --update nodejs npm
            ;;
        macos)
            echo -e "   检测到 ${BLUE}macOS${NC}..."
            if command -v brew &> /dev/null; then
                brew install node@18
            else
                echo -e "${RED}请先安装 Homebrew 或手动安装 Node.js${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}无法自动安装 Node.js，请手动安装 v${NODE_MIN_VERSION}+${NC}"
            echo -e "访问: https://nodejs.org/"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ Node.js 安装完成: $(node -v)${NC}"
}

# ============================================================
# 安装依赖
# ============================================================
install_deps() {
    echo ""
    echo -e "${YELLOW}📦 检查项目依赖...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "   安装依赖中..."
        npm install --production --force --silent
        echo -e "${GREEN}✅ 依赖安装完成${NC}"
    else
        echo -e "   依赖已存在，跳过安装"
    fi
}

# ============================================================
# 检查 PM2
# ============================================================
check_pm2() {
    echo ""
    echo -e "${YELLOW}🔍 检查 PM2...${NC}"
    
    if ! command -v pm2 &> /dev/null; then
        echo -e "   安装 PM2..."
        npm install -g pm2 --silent
        echo -e "${GREEN}✅ PM2 安装完成${NC}"
    else
        echo -e "   PM2 版本: ${GREEN}$(pm2 -v)${NC}"
    fi
}

# ============================================================
# 启动服务
# ============================================================
start_service() {
    echo ""
    echo -e "${YELLOW}🚀 启动服务...${NC}"
    
    # 检查是否已在运行
    if pm2 list | grep -q "$APP_NAME"; then
        echo -e "   服务已存在，重启中..."
        pm2 restart "$APP_NAME"
    else
        # 启动新服务
        PORT=$PORT pm2 start src/server-http.js \
            --name "$APP_NAME" \
            --time \
            --log-date-format "YYYY-MM-DD HH:mm:ss"
    fi
    
    # 等待启动
    sleep 2
    
    # 健康检查
    echo ""
    echo -e "${YELLOW}💚 健康检查...${NC}"
    
    if curl -s "http://localhost:${PORT}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服务启动成功！${NC}"
    else
        echo -e "${RED}⚠️  服务可能未正常启动，请检查日志: pm2 logs ${APP_NAME}${NC}"
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
    echo -e "📖 服务信息:   ${BLUE}http://localhost:${PORT}/${NC}"
    echo ""
    echo -e "常用命令:"
    echo -e "  ${YELLOW}pm2 logs ${APP_NAME}${NC}     - 查看日志"
    echo -e "  ${YELLOW}pm2 restart ${APP_NAME}${NC}  - 重启服务"
    echo -e "  ${YELLOW}pm2 stop ${APP_NAME}${NC}     - 停止服务"
    echo -e "  ${YELLOW}./stop.sh${NC}               - 停止服务"
    echo ""
}

# ============================================================
# 主流程
# ============================================================
main() {
    check_node
    install_deps
    check_pm2
    start_service
    show_info
}

main "$@"
