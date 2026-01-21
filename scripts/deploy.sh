#!/bin/bash
# ============================================================
# AI 代码生成引擎 - Linux 服务器发版脚本
# 用法: 将此脚本放到服务器，上传压缩包到 /tmp 后执行
# 
# 发版流程:
#   1. 本地打包: npm run build:full (生成 codegen-engine-{version}-full.tar.gz)
#   2. 上传到服务器: scp dist/codegen-engine-*-full.tar.gz user@server:/tmp/
#   3. 执行发版: ./deploy.sh
# ============================================================

set -e

# 定义目录
APP_DIR="/home/cyq/codegen"
CODEGEN_DIR="$APP_DIR/codegen-engine"
TMP_DIR="/tmp"
CURRENT_APP_DIR="$CODEGEN_DIR/codegen-last"
TIMESTAMP=$(date +%Y%m%d_%H%M%S_%3N)  # 包含毫秒的时间戳
BACKUP_DIR="$CODEGEN_DIR/codegen-$TIMESTAMP"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 AI 代码生成引擎 - 发版脚本${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 查找/tmp目录下的codegen-engine压缩包
# 支持两种命名格式:
#   - codegen-engine-{version}.tar.gz (轻量包)
#   - codegen-engine-{version}-full.tar.gz (完整包)
TAR_GZ_FILE=$(find $TMP_DIR -maxdepth 1 -name "codegen-engine-*.tar.gz" -type f | head -n 1)

# 检查是否找到压缩包
if [ -z "$TAR_GZ_FILE" ]; then
    echo -e "${RED}❌ 错误: 未找到 /tmp 目录下的 codegen-engine-*.tar.gz 文件${NC}"
    echo ""
    echo "请先上传压缩包到 /tmp 目录:"
    echo "  scp dist/codegen-engine-*-full.tar.gz user@server:/tmp/"
    exit 1
fi

echo -e "${GREEN}✓${NC} 找到压缩包: $TAR_GZ_FILE"

# 停止当前运行的node服务
echo ""
echo -e "${YELLOW}🛑 停止当前运行的服务...${NC}"
pkill -f "npm run start" || true
pkill -f "node.*server-http" || true

# 等待进程完全停止
sleep 3

# 创建应用目录（如果不存在）
mkdir -p "$CODEGEN_DIR"

# 如果当前应用目录存在，则重命名为带时间戳的备份目录
if [ -d "$CURRENT_APP_DIR" ]; then
    echo -e "${YELLOW}📦 备份当前版本到 $BACKUP_DIR${NC}"
    mv "$CURRENT_APP_DIR" "$BACKUP_DIR"
fi

# 将新的压缩包移动到应用目录并解压
echo -e "${YELLOW}📂 解压新版本...${NC}"
mv "$TAR_GZ_FILE" "$CODEGEN_DIR/"
TAR_GZ_BASENAME=$(basename "$TAR_GZ_FILE")
cd "$CODEGEN_DIR"

# 创建临时目录用于解压
TEMP_EXTRACT_DIR=$(mktemp -d)

# 解压到临时目录
tar -xzf "$TAR_GZ_BASENAME" -C "$TEMP_EXTRACT_DIR"

# 获取解压后的根目录名
EXTRACTED_DIR_NAME=$(ls -1 "$TEMP_EXTRACT_DIR" | head -n1)
EXTRACTED_DIR="$TEMP_EXTRACT_DIR/$EXTRACTED_DIR_NAME"

# 将解压后的目录移动到目标位置
mv "$EXTRACTED_DIR" "$CURRENT_APP_DIR"

# 清理临时目录和压缩包
rm -rf "$TEMP_EXTRACT_DIR"
rm -f "$TAR_GZ_BASENAME"

# 进入应用目录并启动
echo -e "${YELLOW}🚀 启动服务...${NC}"
cd "$CURRENT_APP_DIR"
nohup npm run start > app.log 2>&1 &

# 等待启动
sleep 3

# 健康检查
echo ""
echo -e "${YELLOW}💚 健康检查...${NC}"
if curl -s "http://localhost:7331/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 服务启动成功！${NC}"
else
    echo -e "${RED}⚠️  服务可能未正常启动，请检查日志${NC}"
fi

# 输出启动信息
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ 发版完成${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "📍 服务地址:   http://localhost:7331/mcp"
echo -e "📄 日志文件:   $CURRENT_APP_DIR/app.log"
echo -e "📦 旧版本备份: $BACKUP_DIR"
echo ""
echo -e "常用命令:"
echo -e "  查看日志: tail -f $CURRENT_APP_DIR/app.log"
echo -e "  停止服务: pkill -f 'node.*server-http'"
echo ""
