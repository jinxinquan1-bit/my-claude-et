// 学迹后端入口
const app = require('./app');

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`学迹后端已启动：http://localhost:${PORT}`);
  console.log('健康检查：GET /api/health');
});
