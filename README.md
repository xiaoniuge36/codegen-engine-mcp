# 🚀 AI 代码生成引擎 (AI CodeGen Engine)

> **v2.2.0** - React PC 统一使用 Pro + 依赖自动检测

智能前端代码生成服务 - 通过模板匹配、组件库知识图谱和示例代码，显著提升 AI 生成代码的可用度。

---

## ⭐ 快速了解

```
用户说“做个列表页” → AI 调用 quick_generate → 生成代码 → 自动检查
```

**核心功能**：
- 🎯 **智能模板匹配** - 16 个内置模板（React/Vue2/Vue3）
- 📚 **组件库知识** - Ant Design Pro、Element Plus 等
- 📝 **示例代码** - 每个模板都有完整示例
- ✅ **规范内置** - 无需手动添加规则文件
- 🚀 **大数据渲染** - 虚拟列表 + 分页下拉 + 编辑回显
- 🔧 **依赖检测** - React PC 自动检测 Pro 依赖，支持兜底安装


---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd codegen-engine
npm install
```

### 2. 启动服务

#### HTTP 模式（推荐用于调试和测试）

```bash
npm run start
```

#### STDIO 模式（用于 AI 工具集成，如通义灵码）

```bash
npm run start:stdio
```

> **注意**：STDIO 模式不会打印服务地址，这是正常的。AI 工具会自动拉起进程。

启动后会打印：

```
🚀 AI 代码生成引擎已启动
📍 服务地址: http://127.0.0.1:7331/mcp
💚 健康检查: http://127.0.0.1:7331/health
```

### 3. 配置 AI 工具

在通义灵码或其他 AI 工具中添加 MCP 服务：

- **类型**：Streamable HTTP
- **服务地址**：`http://127.0.0.1:7331/mcp`

---

## 📦 打包部署

### 脚本说明

| 脚本 | 平台 | 用途 |
|------|------|------|
| `scripts/build.sh` | Linux/macOS | 轻量打包（不含依赖） |
| `scripts/build.ps1` | Windows | 轻量打包（不含依赖） |
| `scripts/build-full.sh` | Linux/macOS | 完整打包（含 node_modules） |
| `scripts/build-full.ps1` | Windows | 完整打包（含 node_modules） |
| `scripts/start.sh` | Linux/macOS | 在线启动（自动安装依赖） |
| `scripts/start-offline.sh` | Linux/macOS | 离线启动（跳过依赖安装） |
| `scripts/stop.sh` | Linux/macOS | 停止服务 |
| `scripts/deploy.sh` | Linux | 服务器一键发版 |
| `scripts/version.sh` | Linux/macOS | 版本号管理 |
| `scripts/release.sh` | Linux/macOS | 一键发布（更新版本+打包） |

### 打包方式选择

| 方式 | 命令 | 产物大小 | 适用场景 |
|------|------|---------|---------|
| **轻量包** | `npm run build` | ~144KB | 服务器可访问 npm |
| **完整包** | `npm run build:full` | ~5MB | 服务器无法访问 npm |

---

### 方式一：轻量打包（服务器可联网）

#### 1. 本地打包

```bash
# Windows
npm run build:win

# Linux/macOS
npm run build
```

**产物**：`dist/codegen-engine-{version}.tar.gz`（约 144KB）

#### 2. 服务器部署

```bash
# 解压
tar -xzvf codegen-engine-2.1.0.tar.gz
cd codegen-engine-2.1.0

# 添加执行权限（首次部署需要）
chmod +x start.sh

# 启动服务（自动安装 Node.js、依赖、PM2）
./start.sh
```

**start.sh 会自动执行**：
- 检测 Node.js 环境（要求 v16+），未安装则自动安装
- 安装项目依赖（`npm install --production --force`）
- 安装 PM2 进程管理器
- 启动服务并进行健康检查

---

### 方式二：完整打包（服务器无法联网）

#### 1. 本地打包

```bash
# Windows
npm run build:full:win

# Linux/macOS
npm run build:full
```

**产物**：`dist/codegen-engine-{version}-full.tar.gz`（约 5MB，含 node_modules）

#### 2. 服务器部署

**前提**：服务器需预装 Node.js v16+

```bash
# 解压
tar -xzvf codegen-engine-2.1.0-full.tar.gz
cd codegen-engine-2.1.0-full

# 添加执行权限（首次部署需要）
chmod +x start.sh

# 启动服务
./start.sh
```

**如果 PM2 也无法安装**，可直接运行：

```bash
node src/server-http.js
```

---

### 服务管理

```bash
# 停止服务
./stop.sh
# 或
pm2 stop codegen-engine

# 重启服务
pm2 restart codegen-engine

# 查看日志
pm2 logs codegen-engine

# 查看状态
pm2 status
```

### 端口配置

默认端口 `7331`，可通过环境变量修改：

```bash
PORT=8080 ./start.sh
```

### 健康检查

```bash
curl http://localhost:7331/health
```

---

### 方式三：Linux 服务器一键发版

适用于已有部署环境的服务器更新发版。

#### 发版流程

```bash
# 1. 本地打包（完整包）
npm run build:full

# 2. 上传到服务器 /tmp 目录
scp dist/codegen-engine-*-full.tar.gz user@server:/tmp/

# 3. 服务器执行发版脚本
./deploy.sh
```

#### 发版脚本功能

`scripts/deploy.sh` 会自动执行：
- 查找 `/tmp` 目录下的 `codegen-engine-*.tar.gz`
- 停止当前运行的服务
- 备份旧版本（带时间戳）
- 解压并部署新版本
- 启动服务并健康检查

#### 命名规则

打包产物命名格式：
- 轻量包：`codegen-engine-{version}.tar.gz`
- 完整包：`codegen-engine-{version}-full.tar.gz`

示例：`codegen-engine-2.1.0-full.tar.gz`

#### 目录结构

```
/home/cyq/codegen/codegen-engine/
├── codegen-last/              # 当前运行版本
├── codegen-20250107_143000/   # 备份版本（带时间戳）
└── ...
```

---

## 🏷️ 版本管理

版本号统一在 `package.json` 中管理，版本历史记录在 `CHANGELOG.md`。

### 一键发布（推荐）

自动完成：**更新版本号 → 更新 CHANGELOG → 打包**

```bash
# 一键发布（默认 patch）
npm run release

# 指定版本类型
npm run release:patch   # 2.1.0 -> 2.1.1
npm run release:minor   # 2.1.0 -> 2.2.0
npm run release:major   # 2.1.0 -> 3.0.0
```

### 完整发版流程

```bash
# 1. 一键发布（更新版本 + 打包）
npm run release

# 2. 上传到服务器
scp dist/codegen-engine-*-full.tar.gz user@server:/tmp/

# 3. 服务器执行发版
./deploy.sh
```

### 仅更新版本号（不打包）

```bash
npm run version:patch
npm run version:minor
npm run version:major
```

### 相关文件

- `package.json` - 版本号定义
- `CHANGELOG.md` - 版本历史记录
- `scripts/version.sh` - 版本管理脚本
- `scripts/release.sh` - 一键发布脚本

---

## 🛠️ MCP 工具

详细工具文档请查看：[📖 MCP-TOOLS.md](./MCP-TOOLS.md)

---

## 📄 相关文档

- [📖 MCP-TOOLS.md](./MCP-TOOLS.md) - 完整工具文档
- [📝 OPTIMIZATION-LOG.md](./OPTIMIZATION-LOG.md) - 优化日志
- [📋 rules/ai-fe-code-std.md](./rules/ai-fe-code-std.md) - 代码生成规范

---

**🎉 享受智能代码生成的乐趣！**

