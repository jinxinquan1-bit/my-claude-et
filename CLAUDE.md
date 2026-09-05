# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

「学迹」——面向家教/培训老师的轻量学生每日学习记录与成长档案工具（中文用户、中文 UI，与用户中文交流）。工作区分两部分：

- `001-产品PRD/学生学习管理产品PRD-V1.0.1.md` — 产品需求文档**最新版本**（V1.0.1 起注册登录为用户名+密码）。功能与视觉（第 6 章配色规范）的唯一权威来源，需求变更先改这里；`学生学习管理产品PRD.md` 为 V1.0 历史版本
- `xueji-web/` — V1.0 实现（Web 端，Mobile-first，后续规划小程序/App）
- `002-UI界面（美术设计）/` — stitch 原始设计稿（UI原型 + DESIGN.md 设计规范）
- `003-前端代码（前端工程师）/` — 前端工程师交付区：`frontend/` 纯前端原型（多页静态站，11 页，无构建双击可预览；Tailwind 已本地化；主题统一在 `frontend/assets/js/theme.js`，壳注入在 `frontend/assets/js/common.js`，演示数据在 `frontend/assets/js/mock-data.js`；详见其 README.md 的页面统一模板）；`backend/` Express 后端（Node ≥22 + mysql2 + bcryptjs，端口 3001，已实现登录/注册/登出/me，对接 MySQL 8.4 xueji 库；`.env` 配置数据库连接，测试脚本 e2e-auth-test.js）
- `004-数据库脚本(数据库管理员DBA)/` — MySQL 建库建表脚本（学迹数据库脚本.sql，6 张表 utf8mb4；本机 Docker MySQL 8.4 容器 `mysql`，端口 3307，root/root；⚠️ 本机另有 Windows 原生 MySQL 5.7 服务占用 3306）

## 常用命令

```bash
cd xueji-web
npm install          # 依赖仅 express + bcryptjs（无原生编译依赖）
npm start            # 启动，http://localhost:3000（可用 PORT 环境变量改端口）
node e2e-test.js     # 端到端测试 19 项断言；需服务已启动；⚠️ 会向 data.db 写入测试数据，勿在用户真实数据上跑
```

无构建步骤：前端是原生 ES Modules，改完直接刷新浏览器。

## 架构

**技术栈**：Node ≥22.5 + Express + SQLite（Node 内置 `node:sqlite`，勿引入 better-sqlite3 等原生依赖）+ 原生 HTML/CSS/JS SPA（hash 路由，无框架）。

**后端** `xueji-web/server/`：
- `index.js` 入口：静态服务 `public/`、`/api/*` REST、`/r/:token` 家长公开报告页
- `db.js`：SQLite 初始化与 6 张表（users / sessions / students / learning_records / reports / share_tokens）；日期统一 `'YYYY-MM-DD'` 文本可直接字符串比较
- `auth.js`：`authRequired` 中间件（Bearer token 存 sessions 表，30 天）；所有业务路由都挂在它后面，且必须校验数据归属 `user_id`（模式见 routes 内 `getOwnedStudent`/`checkStudent`）
- `routes/students.js` 导出的 `monthStats()` 被 stats 与 reports 复用，改动统计口径时注意三处一致性
- **报告快照机制**：生成报告时把统计与记录 JSON 固化进 `reports.content_snapshot`，之后修改原始记录不影响已发出的报告；分享链接 = `share_tokens` 高熵随机 token（默认 7 天、可撤销、可重新生成）

**前端** `xueji-web/public/`：
- `js/router.js`：hash 路由表。**匹配前必须先 `hash.split('?')[0]` 去掉查询串**——`#/record?student=3`、`#/reports/new?student=3` 这类带参跳转是首页/学生详情核心流程，曾因正则不兼容查询串出过 bug
- `js/api.js`：fetch 封装，token 注入 + 401 自动清 token 跳登录
- `js/components.js`：共享工具与组件（`esc` HTML 转义、星级、徽章、枚举、日期工具）
- `js/charts.js`：手写 SVG 图表（折线/环图/条形图）。**色板已经过 CVD 色盲/对比度校验，不要随意改颜色**；折线图入参格式是 `{date, value}`，而接口返回 `{record_date, f}`，调用点已做映射，新增调用勿漏
- `pages/`：每页一个模块，`render()` 返回 DOM 节点，异步数据在渲染后自行填充（模式：先渲染骨架，fetch 后替换内部容器）
- 设计 Token 集中在 `css/app.css` 的 `:root`：品牌蓝 `#3B82F6` 唯一主色、圆角 12px、留白 16px、每屏最多 1 个实心蓝主按钮

## 边界与约定

- 用户数据在 `xueji-web/data/data.db`（已 gitignore），改动涉及数据逻辑前先备份
- V1.1 尚未做的（PRD 第 9 章，除非用户明确要求）：照片上传、提醒、Excel 导入导出、报告长图导出
- 家长分享页 `public/share.html` 是免登录只读入口，任何改动都要保证微信内置浏览器可直接打开
