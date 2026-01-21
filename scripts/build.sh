#!/bin/bash
# ============================================================
# AI 代码生成引擎 - 本地打包脚本
# 用法: ./scripts/build.sh
# 产物: dist/codegen-engine-{version}.tar.gz
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 从 package.json 读取版本号
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME="codegen-engine-${VERSION}"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 AI 代码生成引擎 - 打包工具${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "版本: ${YELLOW}${VERSION}${NC}"
echo ""

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

# 配置文件
cp package.json "dist/${PACKAGE_NAME}/"
cp package-lock.json "dist/${PACKAGE_NAME}/" 2>/dev/null || true

# 启动脚本
cp scripts/start.sh "dist/${PACKAGE_NAME}/"
cp scripts/stop.sh "dist/${PACKAGE_NAME}/" 2>/dev/null || true

# 文档
cp README.md "dist/${PACKAGE_NAME}/" 2>/dev/null || true

echo -e "${YELLOW}📝 创建部署说明...${NC}"
cat > "dist/${PACKAGE_NAME}/DEPLOY.md" << 'EOF'
# 部署说明

## 快速部署

```bash
# 1. 解压
tar -xzvf codegen-engine-*.tar.gz
cd codegen-engine-*

# 2. 启动（自动安装依赖）
chmod +x start.sh
./start.sh

# 3. 验证
curl http://localhost:7331/health
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

## 健康检查

```bash
curl http://localhost:7331/health
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
echo -e "${GREEN}✅ 打包完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "📦 产物: ${YELLOW}dist/${PACKAGE_NAME}.tar.gz${NC}"
echo -e "📏 大小: ${YELLOW}${PACKAGE_SIZE}${NC}"
echo ""
echo -e "部署步骤:"
echo -e "  1. 上传 ${PACKAGE_NAME}.tar.gz 到服务器"
echo -e "  2. tar -xzvf ${PACKAGE_NAME}.tar.gz"
echo -e "  3. cd ${PACKAGE_NAME} && ./start.sh"
echo ""
