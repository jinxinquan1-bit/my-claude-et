// 学迹服务入口：静态资源 + REST API + 家长公开报告页
const path = require('node:path');
const express = require('express');
const { router: authRouter } = require('./auth');
const { router: studentsRouter } = require('./routes/students');
const recordsRouter = require('./routes/records');
const statsRouter = require('./routes/stats');
const { router: reportsRouter, publicRouter } = require('./routes/reports');

const app = express();
app.use(express.json({ limit: '1mb' }));

const publicDir = path.join(__dirname, '..', 'public');

// 家长报告公开页：/r/:token（免登录，微信内置浏览器可直接打开）
app.get('/r/:token', (req, res) => res.sendFile(path.join(publicDir, 'share.html')));

// REST API
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/records', recordsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/public', publicRouter());
app.use('/api', (req, res) => res.status(404).json({ error: '接口不存在' }));

// 前端静态资源
app.use(express.static(publicDir));

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: '服务器开小差了，请稍后重试' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`学迹已启动：http://localhost:${PORT}`);
});
