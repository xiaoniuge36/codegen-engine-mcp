#!/bin/bash
# ============================================================
# AI 代码生成引擎 - 一键发布脚本
# 用法: 
#   ./scripts/release.sh patch   # 更新patch版本 + 打包
#   ./scripts/release.sh minor   # 更新minor版本 + 打包
#   ./scripts/release.sh major   # 更新major版本 + 打包
# ============================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 检查参数
VERSION_TYPE=${1:-patch}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}❌ 无效的版本类型: $VERSION_TYPE${NC}"
    echo ""
    echo "用法:"
    echo "  ./scripts/release.sh patch   # 补丁版本 (x.x.0 -> x.x.1)"
    echo "  ./scripts/release.sh minor   # 次版本   (x.0.x -> x.1.0)"
    echo "  ./scripts/release.sh major   # 主版本   (0.x.x -> 1.0.0)"
    exit 1
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 AI 代码生成引擎 - 一键发布${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 步骤1: 更新版本号
echo -e "${YELLOW}📦 [1/2] 更新版本号 ($VERSION_TYPE)...${NC}"
bash "$SCRIPT_DIR/version.sh" "$VERSION_TYPE"

# 获取新版本号
NEW_VERSION=$(node -p "require('./package.json').version")

# 步骤2: 打包
echo ""
echo -e "${YELLOW}📦 [2/2] 打包完整版本...${NC}"
bash "$SCRIPT_DIR/build-full.sh"

# 完成
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 发布完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "版本: ${GREEN}${NEW_VERSION}${NC}"
echo -e "产物: ${YELLOW}dist/codegen-engine-${NEW_VERSION}-full.tar.gz${NC}"
echo ""
echo -e "下一步:"
echo -e "  1. scp dist/codegen-engine-${NEW_VERSION}-full.tar.gz user@server:/tmp/"
echo -e "  2. 服务器执行 ./deploy.sh"
echo ""
