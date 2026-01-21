# ============================================================
# AI 代码生成引擎 - Windows 完整打包脚本（含依赖）
# 用法: .\scripts\build-full.ps1
# 产物: dist\codegen-engine-{version}-full.zip
# 说明: 包含 node_modules，适用于服务器无法访问 npm 的场景
# ============================================================

$ErrorActionPreference = "Stop"

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Set-Location $ProjectDir

# 从 package.json 读取版本号
$PackageJson = Get-Content "package.json" | ConvertFrom-Json
$Version = $PackageJson.version
$PackageName = "codegen-engine-$Version-full"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🚀 AI 代码生成引擎 - 完整打包工具" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "版本: $Version" -ForegroundColor Yellow
Write-Host "模式: 完整包（含 node_modules）" -ForegroundColor Yellow
Write-Host ""

# 确保依赖已安装
Write-Host "📦 检查依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   安装依赖中..."
    npm install --production --force
}

# 清理并创建临时目录
Write-Host "📁 准备打包目录..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
New-Item -ItemType Directory -Path "dist\$PackageName" -Force | Out-Null

# 复制必要文件
Write-Host "📦 复制项目文件..." -ForegroundColor Yellow

# 源代码
Copy-Item -Recurse "src" "dist\$PackageName\"

# 资源文件
Copy-Item -Recurse "templates" "dist\$PackageName\"
Copy-Item -Recurse "knowledge" "dist\$PackageName\"
Copy-Item -Recurse "rules" "dist\$PackageName\"

# 依赖（关键！）
Write-Host "📦 复制 node_modules（这可能需要一点时间）..." -ForegroundColor Yellow
Copy-Item -Recurse "node_modules" "dist\$PackageName\"

# 配置文件
Copy-Item "package.json" "dist\$PackageName\"

# 启动脚本（使用离线版本）
Copy-Item "scripts\start-offline.sh" "dist\$PackageName\start.sh"
if (Test-Path "scripts\stop.sh") {
    Copy-Item "scripts\stop.sh" "dist\$PackageName\"
}

# 文档
if (Test-Path "README.md") {
    Copy-Item "README.md" "dist\$PackageName\"
}

# 创建部署说明
Write-Host "📝 创建部署说明..." -ForegroundColor Yellow
$DeployDoc = @"
# 部署说明（离线版）

此版本已包含所有依赖，无需联网安装。

## 快速部署

```bash
# 1. 解压
tar -xzvf codegen-engine-*-full.tar.gz
# 或 Windows 上传的 zip
unzip codegen-engine-*-full.zip

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
- PM2（脚本会尝试安装，如失败可直接 node 运行）

如果 PM2 无法安装，可直接运行：
```bash
node src/server-http.js
```

## 服务管理

- **启动**: ``./start.sh``
- **停止**: ``./stop.sh`` 或 ``pm2 stop codegen-engine``
- **重启**: ``pm2 restart codegen-engine``
- **日志**: ``pm2 logs codegen-engine``
"@
$DeployDoc | Out-File -FilePath "dist\$PackageName\DEPLOY.md" -Encoding UTF8

# 打包
Write-Host "🗜️  压缩打包..." -ForegroundColor Yellow

# ZIP 格式
Compress-Archive -Path "dist\$PackageName" -DestinationPath "dist\$PackageName.zip" -Force

# 如果有 tar 命令，也生成 tar.gz
if (Get-Command tar -ErrorAction SilentlyContinue) {
    Set-Location "dist"
    tar -czvf "$PackageName.tar.gz" "$PackageName"
    Set-Location $ProjectDir
}

# 清理临时目录
Remove-Item -Recurse -Force "dist\$PackageName"

# 显示结果
$ZipSize = (Get-Item "dist\$PackageName.zip").Length / 1MB
$ZipSizeStr = "{0:N2} MB" -f $ZipSize

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ 完整包打包完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "📦 产物: dist\$PackageName.zip" -ForegroundColor Yellow
Write-Host "📏 大小: $ZipSizeStr" -ForegroundColor Yellow

if (Test-Path "dist\$PackageName.tar.gz") {
    $TarSize = (Get-Item "dist\$PackageName.tar.gz").Length / 1MB
    $TarSizeStr = "{0:N2} MB" -f $TarSize
    Write-Host "📦 产物: dist\$PackageName.tar.gz" -ForegroundColor Yellow
    Write-Host "📏 大小: $TarSizeStr" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⚠️  此包已包含 node_modules，服务器只需安装 Node.js 即可运行" -ForegroundColor Cyan
Write-Host ""
Write-Host "部署步骤:" -ForegroundColor Cyan
Write-Host "  1. 上传 $PackageName.zip 到服务器"
Write-Host "  2. unzip $PackageName.zip 或 tar -xzvf $PackageName.tar.gz"
Write-Host "  3. cd $PackageName && chmod +x start.sh && ./start.sh"
Write-Host ""
