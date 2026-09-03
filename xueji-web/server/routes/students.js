// 学生管理：CRUD（软删除）、搜索、状态、月度统计（详情页统计卡与报告复用）
const express = require('express');
const db = require('../db');
const { authRequired } = require('../auth');
const { sqlNow, todayStr, monthStartStr } = require('../util');

const router = express.Router();
router.use(authRequired);

const STATUS_SET = ['active', 'paused', 'finished'];

// 月度统计：记录次数 / 作业完成率 / 平均专注度
function monthStats(studentId, from, to) {
  const count = db.prepare(
    'SELECT COUNT(*) c FROM learning_records WHERE student_id = ? AND record_date BETWEEN ? AND ?'
  ).get(studentId, from, to).c;
  const hw = db.prepare(
    `SELECT homework_status hs, COUNT(*) c FROM learning_records
     WHERE student_id = ? AND record_date BETWEEN ? AND ? AND homework_status != '' GROUP BY homework_status`
  ).all(studentId, from, to);
  const homework = { done: 0, partial: 0, undone: 0, none: 0 };
  for (const row of hw) if (row.hs in homework) homework[row.hs] = row.c;
  const graded = homework.done + homework.partial + homework.undone;
  const hwRate = graded ? Math.round((homework.done / graded) * 100) : null;
  const focusAvg = db.prepare(
    'SELECT ROUND(AVG(focus), 1) f FROM learning_records WHERE student_id = ? AND record_date BETWEEN ? AND ?'
  ).get(studentId, from, to).f;
  return { count, homework, hwRate, focusAvg };
}

// 校验学生归属，返回学生行或 null（已响应 404/400）
function getOwnedStudent(req, res) {
  const row = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .get(Number(req.params.id), req.userId);
  if (!row) { res.status(404).json({ error: '学生不存在' }); return null; }
  return row;
}

// 列表：默认按最近记录时间排序（无记录的按创建时间），支持姓名搜索、状态筛选
router.get('/', (req, res) => {
  const { q = '', status = '' } = req.query;
  let sql = `
    SELECT s.*,
      (SELECT MAX(record_date) FROM learning_records r WHERE r.student_id = s.id) AS last_record_date,
      (SELECT COUNT(*) FROM learning_records r WHERE r.student_id = s.id) AS record_count
    FROM students s
    WHERE s.user_id = ? AND s.deleted_at IS NULL`;
  const params = [req.userId];
  if (q) { sql += ' AND (s.name LIKE ? OR s.nickname LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  if (status && STATUS_SET.includes(status)) { sql += ' AND s.status = ?'; params.push(status); }
  sql += ' ORDER BY last_record_date IS NULL, last_record_date DESC, s.created_at DESC';
  res.json({ students: db.prepare(sql).all(...params) });
});

// 添加学生：仅姓名必填，其余选填（10 秒可完成添加）
router.post('/', (req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim();
  if (!name) return res.status(400).json({ error: '姓名必填' });
  const now = sqlNow();
  const info = db.prepare(`INSERT INTO students
    (user_id, name, nickname, grade, school, default_subject, schedule, status, remark, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.userId, name.slice(0, 30),
      String(b.nickname || '').slice(0, 30), String(b.grade || '').slice(0, 20),
      String(b.school || '').slice(0, 50), String(b.default_subject || '').slice(0, 20),
      String(b.schedule || '').slice(0, 100),
      STATUS_SET.includes(b.status) ? b.status : 'active',
      String(b.remark || '').slice(0, 500), now, now);
  res.json({ id: Number(info.lastInsertRowid) });
});

// 详情：学生信息 + 本月统计卡
router.get('/:id', (req, res) => {
  const s = getOwnedStudent(req, res);
  if (!s) return;
  const from = monthStartStr();
  const to = todayStr();
  res.json({ student: s, stats: { from, to, ...monthStats(s.id, from, to) } });
});

router.put('/:id', (req, res) => {
  const s = getOwnedStudent(req, res);
  if (!s) return;
  const b = req.body || {};
  const name = String(b.name ?? s.name).trim();
  if (!name) return res.status(400).json({ error: '姓名必填' });
  db.prepare(`UPDATE students SET name=?, nickname=?, grade=?, school=?, default_subject=?, schedule=?, status=?, remark=?, updated_at=? WHERE id=?`)
    .run(name.slice(0, 30), String(b.nickname ?? s.nickname).slice(0, 30),
      String(b.grade ?? s.grade).slice(0, 20), String(b.school ?? s.school).slice(0, 50),
      String(b.default_subject ?? s.default_subject).slice(0, 20), String(b.schedule ?? s.schedule).slice(0, 100),
      STATUS_SET.includes(b.status) ? b.status : s.status,
      String(b.remark ?? s.remark).slice(0, 500), sqlNow(), s.id);
  res.json({ ok: true });
});

// 软删除（二次确认在前端；数据保留 30 天）
router.delete('/:id', (req, res) => {
  const s = getOwnedStudent(req, res);
  if (!s) return;
  db.prepare('UPDATE students SET deleted_at = ? WHERE id = ?').run(sqlNow(), s.id);
  res.json({ ok: true });
});

module.exports = { router, monthStats };
