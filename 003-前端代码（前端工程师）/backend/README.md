# 学迹后端（Express + MySQL 8.4）

学习管理产品「学迹」的后端服务。当前实现 **登录 / 注册** 模块，对接 004 数据库脚本建好的 `xueji` 库。

## 技术栈

- Node.js ≥ 22 + Express 4
- mysql2（promise 连接池）
- bcryptjs（密码哈希，不存明文）
- 会话方案：token 存 `sessions` 表（30 天有效），与数据库设计一致

## 快速开始

```bash
cd 003-前端代码（前端工程师）/backend
npm install
npm start            # 默认 http://localhost:3001
```

前置条件：本机 Docker MySQL 8.4 容器 `mysql` 已启动（宿主机 3307），且已执行 `004-数据库脚本(数据库管理员DBA)/学迹数据库脚本.sql` 建库建表。

数据库连接配置在 `.env`（模板见 `.env.example`，默认 root/root@127.0.0.1:3307/xueji）。

## 接口文档

统一约定：请求/响应均为 JSON；错误响应格式 `{ "error": "描述" }`；认证接口用请求头 `Authorization: Bearer <token>`。

### POST /api/auth/register —— 注册

请求：`{ "username": "王老师", "password": "123456" }`
约束：用户名 2~20 位中文/英文/数字/下划线（全局唯一）；密码 ≥ 6 位

成功（200）：`{ "token": "<64位hex>", "user": { "id": 1, "username": "王老师" } }`
用户名已被注册（409）；格式不合法（400）

### POST /api/auth/login —— 登录

请求：`{ "username": "王老师", "password": "123456" }`

成功（200）：`{ "token": "...", "user": { "id": 1, "username": "王老师" } }`
用户名或密码错误（401）

### POST /api/auth/logout —— 登出

请求头：`Authorization: Bearer <token>`；成功后该 token 立即失效

### GET /api/auth/me —— 当前用户

请求头：`Authorization: Bearer <token>`
成功（200）：`{ "user": { "id": 1, "username": "王老师", "created_at": "..." } }`
未登录/已过期（401）

### GET /api/health —— 健康检查

`{ "ok": true, "service": "xueji-backend" }`

## 目录结构

```
backend/
├── package.json
├── .env / .env.example      # 数据库与端口配置
└── src/
    ├── server.js            # 入口（PORT 默认 3001，避免与 xueji-web 3000 冲突）
    ├── app.js               # Express 应用：CORS、路由、错误处理
    ├── db.js                # mysql2 连接池
    └── routes/
        └── auth.js          # 注册/登录/登出/me
```

## 后续规划

- 学生管理 / 学习记录 / 统计 / 报告分享等接口（表结构已就绪，见 004 脚本）
- 已过期会话清理任务（sessions 表无自动清理，可加定时任务）
- 接入前端：把 `frontend/assets/js/mock-data.js` 的演示数据替换为真实接口调用
