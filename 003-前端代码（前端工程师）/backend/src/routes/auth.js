// 账号接口：注册 / 登录 / 登出 / 当前用户
// 数据表：xueji.users（username 唯一 + bcrypt 哈希）、xueji.sessions（token 存库，30 天有效）
// 设计依据：PRD V1.0.1 第 4.1 节（用户名+密码）、004 数据库脚本
const express = require('express');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_一-龥]{2,20}$/;
const SESSION_DAYS = 30;

// 异步路由错误包装（Express 4 不自动捕获 async 异常）
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

// 创建会话：token 32 字节随机 hex（CHAR(64)），30 天过期（交给 MySQL 计算，无时区问题）
async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.execute(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
    [userId, token, SESSION_DAYS]
  );
  return token;
}

// 认证中间件：Authorization: Bearer <token>
async function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: '请先登录' });
  const [rows] = await pool.execute(
    'SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()',
    [token]
  );
  if (!rows.length) return res.status(401).json({ error: '登录已过期，请重新登录' });
  req.userId = rows[0].user_id;
  req.token = token;
  next();
}

// 注册：用户名 + 密码
router.post('/register', wrap(async (req, res) => {
  const { username, password } = req.body || {};
  const name = String(username || '').trim();
  if (!USERNAME_RE.test(name)) {
    return res.status(400).json({ error: '用户名需为 2~20 位中文、英文、数字或下划线' });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: '密码至少 6 位' });
  }
  const [exists] = await pool.execute('SELECT id FROM users WHERE username = ?', [name]);
  if (exists.length) return res.status(409).json({ error: '该用户名已被注册' });

  const hash = bcrypt.hashSync(String(password), 10);
  const [result] = await pool.execute(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [name, hash]
  );
  const id = result.insertId;
  const token = await createSession(id);
  res.json({ token, user: { id, username: name } });
}));

// 登录：用户名 + 密码
router.post('/login', wrap(async (req, res) => {
  const { username, password } = req.body || {};
  const [rows] = await pool.execute(
    'SELECT id, username, password_hash FROM users WHERE username = ?',
    [String(username || '').trim()]
  );
  const user = rows[0];
  if (!user || !bcrypt.compareSync(String(password || ''), user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  const token = await createSession(user.id);
  res.json({ token, user: { id: user.id, username: user.username } });
}));

// 登出：删除当前会话
router.post('/logout', wrap(async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token) await pool.execute('DELETE FROM sessions WHERE token = ?', [token]);
  res.json({ ok: true });
}));

// 当前用户
router.get('/me', wrap(async (req, res) => {
  await authRequired(req, res, async () => {
    const [rows] = await pool.execute(
      'SELECT id, username, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    res.json({ user: rows[0] });
  });
}));

module.exports = router;
