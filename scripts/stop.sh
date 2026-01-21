#!/bin/bash
# ============================================================
# AI 代码生成引擎 - 停止脚本
# ============================================================

APP_NAME="codegen-engine"

echo "🛑 停止 ${APP_NAME}..."

if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 stop "$APP_NAME"
        pm2 delete "$APP_NAME"
        echo "✅ 服务已停止"
    else
        echo "⚠️  服务未在运行"
    fi
else
    echo "❌ PM2 未安装"
    # 尝试直接杀进程
    pkill -f "server-http.js" 2>/dev/null && echo "✅ 进程已终止" || echo "⚠️  未找到运行中的进程"
fi
