// Express 应用：中间件 + 路由挂载 + 统一错误处理
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors()); // 开发期允许前端跨域（file:// 或独立端口预览）
app.use(express.json({ limit: '1mb' }));

// 健康检查
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'xueji-backend' }));

// 业务路由
app.use('/api/auth', authRouter);

// API 404
app.use('/api', (req, res) => res.status(404).json({ error: '接口不存在' }));

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: '服务器开小差了，请稍后重试' });
});

module.exports = app;
