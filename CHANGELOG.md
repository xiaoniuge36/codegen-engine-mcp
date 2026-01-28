## [2.2.0] - 2026-01-28

### Added
- 🆕 React PC 统一使用 `@ant-design/pro-components` 组件库
- 🆕 Pro 依赖自动检测功能（`detect_tech_stack` 返回 `hasProComponents`、`missingProDependency` 等字段）
- 🆕 兜底安装方案：检测到缺少 Pro 依赖时，返回安装命令供 AI Agent 执行
- 🆕 `generate_code_context` 返回 `proDependency` 对象，包含安装状态和建议

### Changed
- 更新 `rules/ai-fe-code-std.md` 技术栈说明，明确 React PC 统一使用 Pro
- 更新 `MCP-TOOLS.md` 文档，添加 Pro 依赖检测和自动安装说明

## [2.1.1] - 2026-01-07

### Changed
- 版本更新

# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2025-01-07

### Added
- 完整打包脚本 `build-full.sh`（含 node_modules）
- 离线启动脚本 `start-offline.sh`
- Linux 服务器发版脚本 `deploy.sh`
- 版本管理脚本 `version.sh`
- CHANGELOG.md 版本历史记录

### Changed
- 优化打包流程，支持轻量包和完整包两种模式
- Node.js 最低版本要求改为 v16

## [2.0.0] - 2025-01-01

### Added
- MCP 协议支持
- 19 个代码生成工具
- 模板智能匹配
- 组件库知识图谱
- HTTP 和 STDIO 双模式

