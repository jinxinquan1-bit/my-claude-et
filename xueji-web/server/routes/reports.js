// 学习报告与家长分享
// 快照机制：生成报告时固化数据，之后修改原始记录不影响已发出的报告
// 分享链接：随机不可枚举、默认 7 天有效、可撤销；家长免登录查看
const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const { authRequired } = require('../auth');
const { sqlNow, sqlDaysLater } = require('../util');
const { monthStats } = require('./students');

const router = express.Router();
const SHARE_DAYS = 7;

// 生成报告数据快照（含老师署名，家长页展示用）
function buildSnapshot(userId, studentId, from, to) {
  const s = db.prepare('SELECT id, name, nickname, grade, school FROM students WHERE id = ?').get(studentId);
  const stats = monthStats(studentId, from, to);
  const focusTrend = db.prepare(`
    SELECT record_date, ROUND(AVG(focus), 1) f FROM learning_records
    WHERE student_id = ? AND record_date BETWEEN ? AND ? GROUP BY record_date ORDER BY record_date`)
    .all(studentId, from, to);
  const mastery = db.prepare(`
    SELECT mastery_level m, COUNT(*) c FROM learning_records
    WHERE student_id = ? AND record_date BETWEEN ? AND ? AND mastery_level != '' GROUP BY mastery_level`)
    .all(studentId, from, to);
  const records = db.prepare(`
    SELECT record_date, subject, content, homework_status, homework_desc, focus, tags, knowledge_point, mastery_level, comment
    FROM learning_records WHERE student_id = ? AND record_date BETWEEN ? AND ? ORDER BY record_date DESC, id DESC`)
    .all(studentId, from, to);
  records.forEach(r => { r.tags = JSON.parse(r.tags || '[]'); });
  const teacher = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
  return {
    student: { name: s.name, nickname: s.nickname, grade: s.grade, school: s.school },
    period: { from, to },
    count: stats.count,
    homework: stats.homework,
    hwRate: stats.hwRate,
    focusAvg: stats.focusAvg,
    focusTrend,
    mastery,
    records,
    teacher: { name: teacher.username || '老师' },
  };
}

function createShareToken(reportId) {
  const token = crypto.randomBytes(24).toString('hex'); // 192bit 随机串，不可枚举
  db.prepare('INSERT INTO share_tokens (report_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .run(reportId, token, sqlDaysLater(SHARE_DAYS), sqlNow());
  return token;
}

router.use(authRequired);

// 生成报告：快照 + 分享链接
router.post('/', (req, res) => {
  const { student_id, period_start, period_end, teacher_message } = req.body || {};
  const s = db.prepare('SELECT id FROM students WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .get(Number(student_id), req.userId);
  if (!s) return res.status(400).json({ error: '学生不存在' });
  const from = String(period_start || '').slice(0, 10);
  const to = String(period_end || '').slice(0, 10);
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_RE.test(from) || !DATE_RE.test(to) || from > to) return res.status(400).json({ error: '时间范围不正确' });

  const snapshot = buildSnapshot(req.userId, s.id, from, to);
  const info = db.prepare(`INSERT INTO reports
    (student_id, user_id, period_start, period_end, content_snapshot, teacher_message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(s.id, req.userId, from, to, JSON.stringify(snapshot),
      String(teacher_message || '').slice(0, 1000), sqlNow());
  const reportId = Number(info.lastInsertRowid);
  const token = createShareToken(reportId);
  res.json({ report: { id: reportId, period_start: from, period_end: to }, shareToken: token, shareUrl: `/r/${token}` });
});

// 报告列表（含最新分享链接状态）
router.get('/', (req, res) => {
  const { student_id } = req.query;
  let sql = `SELECT r.*, s.name AS student_name, s.grade,
    (SELECT token FROM share_tokens t WHERE t.report_id = r.id ORDER BY t.id DESC LIMIT 1) AS share_token,
    (SELECT revoked FROM share_tokens t WHERE t.report_id = r.id ORDER BY t.id DESC LIMIT 1) AS revoked,
    (SELECT expires_at FROM share_tokens t WHERE t.report_id = r.id ORDER BY t.id DESC LIMIT 1) AS expires_at
    FROM reports r JOIN students s ON s.id = r.student_id WHERE r.user_id = ?`;
  const params = [req.userId];
  if (student_id) { sql += ' AND r.student_id = ?'; params.push(Number(student_id)); }
  sql += ' ORDER BY r.created_at DESC LIMIT 100';
  const rows = db.prepare(sql).all(...params);
  rows.forEach(r => { r.content_snapshot = JSON.parse(r.content_snapshot); });
  res.json({ reports: rows });
});

// 撤销分享链接（立即失效）
router.post('/:id/revoke', (req, res) => {
  const r = db.prepare('SELECT id FROM reports WHERE id = ? AND user_id = ?').get(Number(req.params.id), req.userId);
  if (!r) return res.status(404).json({ error: '报告不存在' });
  db.prepare('UPDATE share_tokens SET revoked = 1 WHERE report_id = ?').run(r.id);
  res.json({ ok: true });
});

// 重新生成分享链接（旧链接全部撤销，新链接 7 天有效）
router.post('/:id/reissue', (req, res) => {
  const r = db.prepare('SELECT id FROM reports WHERE id = ? AND user_id = ?').get(Number(req.params.id), req.userId);
  if (!r) return res.status(404).json({ error: '报告不存在' });
  db.prepare('UPDATE share_tokens SET revoked = 1 WHERE report_id = ?').run(r.id);
  const token = createShareToken(r.id);
  res.json({ shareToken: token, shareUrl: `/r/${token}` });
});

// ---- 家长公开接口（免登录，供 share.html 使用）----
function publicRouter() {
  const pub = express.Router();
  pub.get('/reports/:token', (req, res) => {
    const t = db.prepare('SELECT * FROM share_tokens WHERE token = ?').get(String(req.params.token || ''));
    if (!t || t.revoked) return res.status(404).json({ error: '链接不存在或已被撤销' });
    if (t.expires_at < sqlNow()) return res.status(410).json({ error: '链接已过期，请联系老师重新发送' });
    const r = db.prepare('SELECT * FROM reports WHERE id = ?').get(t.report_id);
    if (!r) return res.status(404).json({ error: '报告不存在' });
    res.json({
      report: {
        period_start: r.period_start,
        period_end: r.period_end,
        teacher_message: r.teacher_message,
        snapshot: JSON.parse(r.content_snapshot),
      },
    });
  });
  return pub;
}

module.exports = { router, publicRouter };
