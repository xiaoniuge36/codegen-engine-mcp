#!/bin/bash
# ============================================================
# AI 代码生成引擎 - 完整打包脚本（含依赖）
# 用法: ./scripts/build-full.sh
# 产物: dist/codegen-engine-{version}-full.tar.gz
# 说明: 包含 node_modules，适用于服务器无法访问 npm 的场景
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 从 package.json 读取版本号
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME="codegen-engine-${VERSION}-full"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 AI 代码生成引擎 - 完整打包工具${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "版本: ${YELLOW}${VERSION}${NC}"
echo -e "模式: ${YELLOW}完整包（含 node_modules）${NC}"
echo ""

# 确保依赖已安装
echo -e "${YELLOW}📦 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "   安装依赖中..."
    npm install --production --force
fi

# 创建临时目录
echo -e "${YELLOW}📁 准备打包目录...${NC}"
rm -rf dist
mkdir -p "dist/${PACKAGE_NAME}"

# 复制必要文件
echo -e "${YELLOW}📦 复制项目文件...${NC}"

# 源代码
cp -r src "dist/${PACKAGE_NAME}/"

# 资源文件
cp -r templates "dist/${PACKAGE_NAME}/"
cp -r knowledge "dist/${PACKAGE_NAME}/"
cp -r rules "dist/${PACKAGE_NAME}/"

# 依赖（关键！）
echo -e "${YELLOW}📦 复制 node_modules（这可能需要一点时间）...${NC}"
cp -r node_modules "dist/${PACKAGE_NAME}/"

# 配置文件
cp package.json "dist/${PACKAGE_NAME}/"

# 启动脚本（使用离线版本）
cp scripts/start-offline.sh "dist/${PACKAGE_NAME}/start.sh"
cp scripts/stop.sh "dist/${PACKAGE_NAME}/" 2>/dev/null || true

# 文档
cp README.md "dist/${PACKAGE_NAME}/" 2>/dev/null || true

echo -e "${YELLOW}📝 创建部署说明...${NC}"
cat > "dist/${PACKAGE_NAME}/DEPLOY.md" << 'EOF'
# 部署说明（离线版）

此版本已包含所有依赖，无需联网安装。

## 快速部署

```bash
# 1. 解压
tar -xzvf codegen-engine-*-full.tar.gz
cd codegen-engine-*-full

# 2. 添加执行权限（首次部署需要）
chmod +x start.sh

# 3. 启动服务
./start.sh

# 4. 验证
curl http://localhost:7331/health
```

## 环境要求

- Node.js v16+（必须预装）
- PM2（脚本会自动全局安装，需要 npm 可用）

如果 PM2 也无法安装，可直接运行：
```bash
node src/server-http.js
```

## 服务管理

- **启动**: `./start.sh`
- **停止**: `./stop.sh` 或 `pm2 stop codegen-engine`
- **重启**: `pm2 restart codegen-engine`
- **日志**: `pm2 logs codegen-engine`

## 端口配置

默认端口 7331，可通过环境变量修改：
```bash
PORT=8080 ./start.sh
```
EOF

# 打包
echo -e "${YELLOW}🗜️  压缩打包...${NC}"
cd dist
tar -czvf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}"

# 清理临时目录
rm -rf "${PACKAGE_NAME}"

# 显示结果
PACKAGE_SIZE=$(du -h "${PACKAGE_NAME}.tar.gz" | cut -f1)
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 完整包打包完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "📦 产物: ${YELLOW}dist/${PACKAGE_NAME}.tar.gz${NC}"
echo -e "📏 大小: ${YELLOW}${PACKAGE_SIZE}${NC}"
echo ""
echo -e "⚠️  此包已包含 node_modules，服务器只需安装 Node.js 即可运行"
echo ""
echo -e "部署步骤:"
echo -e "  1. 上传 ${PACKAGE_NAME}.tar.gz 到服务器"
echo -e "  2. tar -xzvf ${PACKAGE_NAME}.tar.gz"
echo -e "  3. cd ${PACKAGE_NAME} && chmod +x start.sh && ./start.sh"
echo ""
