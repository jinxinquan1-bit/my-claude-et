// 统计：全局概览（今日待记录 / 近 7 天记录量）+ 学生维度（趋势 / 作业 / 掌握度）
const express = require('express');
const db = require('../db');
const { authRequired } = require('../auth');
const { todayStr, daysAgoStr } = require('../util');
const { monthStats } = require('./students');

const router = express.Router();
router.use(authRequired);

// 全局概览：今日待记录（在读学生中今天还没有记录的）、近 7 天记录量、学生数
router.get('/overview', (req, res) => {
  const today = todayStr();
  const totalStudents = db.prepare('SELECT COUNT(*) c FROM students WHERE user_id = ? AND deleted_at IS NULL').get(req.userId).c;
  const activeStudents = db.prepare(
    "SELECT COUNT(*) c FROM students WHERE user_id = ? AND deleted_at IS NULL AND status = 'active'"
  ).get(req.userId).c;
  const pending = db.prepare(`
    SELECT s.id, s.name, s.default_subject FROM students s
    WHERE s.user_id = ? AND s.deleted_at IS NULL AND s.status = 'active'
      AND NOT EXISTS (SELECT 1 FROM learning_records r WHERE r.student_id = s.id AND r.record_date = ?)
    ORDER BY s.created_at`).all(req.userId, today);
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgoStr(i);
    const c = db.prepare('SELECT COUNT(*) c FROM learning_records WHERE user_id = ? AND record_date = ?').get(req.userId, d).c;
    last7.push({ date: d, count: c });
  }
  res.json({ totalStudents, activeStudents, pending, last7, todayCount: last7[6].count });
});

// 学生维度：时间段内次数 / 作业完成情况 / 专注度趋势 / 掌握度分布
router.get('/student/:id', (req, res) => {
  const id = Number(req.params.id);
  const s = db.prepare('SELECT id, name FROM students WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .get(id, req.userId);
  if (!s) return res.status(404).json({ error: '学生不存在' });
  const { from, to } = req.query;
  const f = String(from || '').slice(0, 10);
  const t = String(to || '').slice(0, 10);
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_RE.test(f) || !DATE_RE.test(t) || f > t) return res.status(400).json({ error: '时间范围不正确' });

  const base = monthStats(id, f, t);
  const focusTrend = db.prepare(`
    SELECT record_date, ROUND(AVG(focus), 1) f FROM learning_records
    WHERE student_id = ? AND record_date BETWEEN ? AND ? GROUP BY record_date ORDER BY record_date`)
    .all(id, f, t);
  const mastery = db.prepare(`
    SELECT mastery_level m, COUNT(*) c FROM learning_records
    WHERE student_id = ? AND record_date BETWEEN ? AND ? AND mastery_level != '' GROUP BY mastery_level`)
    .all(id, f, t);
  res.json({ from: f, to: t, ...base, focusTrend, mastery });
});

module.exports = router;
