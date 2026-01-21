#!/bin/bash
# ============================================================
# AI 代码生成引擎 - 版本管理脚本
# 用法: 
#   ./scripts/version.sh patch   # 2.1.0 -> 2.1.1
#   ./scripts/version.sh minor   # 2.1.0 -> 2.2.0
#   ./scripts/version.sh major   # 2.1.0 -> 3.0.0
#   ./scripts/version.sh 2.2.0   # 指定版本号
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

# 获取当前版本
OLD_VERSION=$(node -p "require('./package.json').version")

# 检查参数
if [ -z "$1" ]; then
    echo -e "${YELLOW}当前版本: ${GREEN}${OLD_VERSION}${NC}"
    echo ""
    echo "用法:"
    echo "  ./scripts/version.sh patch   # 补丁版本 (x.x.0 -> x.x.1)"
    echo "  ./scripts/version.sh minor   # 次版本   (x.0.x -> x.1.0)"
    echo "  ./scripts/version.sh major   # 主版本   (0.x.x -> 1.0.0)"
    echo "  ./scripts/version.sh 2.2.0   # 指定版本号"
    exit 0
fi

VERSION_TYPE=$1

# 更新版本号
echo -e "${YELLOW}📦 更新版本号...${NC}"

if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # 指定版本号
    npm version "$VERSION_TYPE" --no-git-tag-version
    NEW_VERSION="$VERSION_TYPE"
else
    # patch/minor/major
    npm version "$VERSION_TYPE" --no-git-tag-version
    NEW_VERSION=$(node -p "require('./package.json').version")
fi

# 更新 CHANGELOG.md
CHANGELOG_FILE="$PROJECT_DIR/CHANGELOG.md"
TIMESTAMP=$(date +%Y-%m-%d)

if [ -f "$CHANGELOG_FILE" ]; then
    # 在文件开头插入新版本记录
    TEMP_FILE=$(mktemp)
    echo "## [${NEW_VERSION}] - ${TIMESTAMP}" > "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "### Changed" >> "$TEMP_FILE"
    echo "- 版本更新" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    cat "$CHANGELOG_FILE" >> "$TEMP_FILE"
    mv "$TEMP_FILE" "$CHANGELOG_FILE"
else
    # 创建新的 CHANGELOG.md
    cat > "$CHANGELOG_FILE" << EOF
# Changelog

All notable changes to this project will be documented in this file.

## [${NEW_VERSION}] - ${TIMESTAMP}

### Changed
- 初始版本

EOF
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 版本更新完成${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "旧版本: ${YELLOW}${OLD_VERSION}${NC}"
echo -e "新版本: ${GREEN}${NEW_VERSION}${NC}"
echo -e "更新文件:"
echo -e "  - package.json"
echo -e "  - CHANGELOG.md"
echo ""
echo -e "下一步: 运行 ${YELLOW}npm run build:full${NC} 打包发布"
echo ""
