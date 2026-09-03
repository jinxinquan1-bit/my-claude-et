// 账号：注册 / 登录 / 登出 / 当前用户；会话 token 存 sessions 表，30 天有效
// V1.0.1：用户名 + 密码（用户名 2~20 位，支持中文/英文/数字/下划线，全局唯一）
const express = require('express');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { sqlNow, sqlDaysLater } = require('./util');

const router = express.Router();
const USERNAME_RE = /^[a-zA-Z0-9_一-龥]{2,20}$/;

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .run(userId, token, sqlDaysLater(30), sqlNow());
  return token;
}

// 认证中间件：Authorization: Bearer <token>
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: '请先登录' });
  const row = db.prepare('SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?').get(token, sqlNow());
  if (!row) return res.status(401).json({ error: '登录已过期，请重新登录' });
  req.userId = row.user_id;
  req.token = token;
  next();
}

// 注册：用户名 + 密码
router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  const name = String(username || '').trim();
  if (!USERNAME_RE.test(name)) {
    return res.status(400).json({ error: '用户名需为 2~20 位中文、英文、数字或下划线' });
  }
  if (!password || String(password).length < 6) return res.status(400).json({ error: '密码至少 6 位' });
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(name);
  if (exists) return res.status(409).json({ error: '该用户名已被注册' });
  const hash = bcrypt.hashSync(String(password), 10);
  const info = db.prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)')
    .run(name, hash, sqlNow());
  const id = Number(info.lastInsertRowid);
  const token = createSession(id);
  res.json({ token, user: { id, username: name } });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username || '').trim());
  if (!user || !bcrypt.compareSync(String(password || ''), user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  const token = createSession(user.id);
  res.json({ token, user: { id: user.id, username: user.username } });
});

router.post('/logout', authRequired, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(req.token);
  res.json({ ok: true });
});

router.get('/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(req.userId);
  res.json({ user });
});

module.exports = { router, authRequired };
