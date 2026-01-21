# ============================================================
# AI 代码生成引擎 - Windows 打包脚本
# 用法: .\scripts\build.ps1
# 产物: dist\codegen-engine-{version}.zip
# ============================================================

$ErrorActionPreference = "Stop"

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Set-Location $ProjectDir

# 从 package.json 读取版本号
$PackageJson = Get-Content "package.json" | ConvertFrom-Json
$Version = $PackageJson.version
$PackageName = "codegen-engine-$Version"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🚀 AI 代码生成引擎 - 打包工具" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "版本: $Version" -ForegroundColor Yellow
Write-Host ""

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

# 配置文件
Copy-Item "package.json" "dist\$PackageName\"
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "dist\$PackageName\"
}

# 启动脚本
Copy-Item "scripts\start.sh" "dist\$PackageName\"
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
# 部署说明

## 快速部署

```bash
# 1. 解压 (Linux)
tar -xzvf codegen-engine-*.tar.gz
# 或解压 (Windows 上传的 zip)
unzip codegen-engine-*.zip

cd codegen-engine-*

# 2. 启动（自动安装依赖）
chmod +x start.sh
./start.sh

# 3. 验证
curl http://localhost:7331/health
```

## 服务管理

- **启动**: ``./start.sh``
- **停止**: ``./stop.sh`` 或 ``pm2 stop codegen-engine``
- **重启**: ``pm2 restart codegen-engine``
- **日志**: ``pm2 logs codegen-engine``

## 端口配置

默认端口 7331，可通过环境变量修改：
```bash
PORT=8080 ./start.sh
```

## 健康检查

```bash
curl http://localhost:7331/health
```
"@
$DeployDoc | Out-File -FilePath "dist\$PackageName\DEPLOY.md" -Encoding UTF8

# 打包为 zip (Windows) 和 tar.gz (跨平台)
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
Write-Host "✅ 打包完成！" -ForegroundColor Green
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
Write-Host "部署步骤:" -ForegroundColor Cyan
Write-Host "  1. 上传 $PackageName.zip 到服务器"
Write-Host "  2. unzip $PackageName.zip 或 tar -xzvf $PackageName.tar.gz"
Write-Host "  3. cd $PackageName && chmod +x start.sh && ./start.sh"
Write-Host ""
