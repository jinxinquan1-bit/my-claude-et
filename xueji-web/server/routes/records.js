// 每日学习记录（核心）：CRUD + "按上次记录填充" + 归属校验
const express = require('express');
const db = require('../db');
const { authRequired } = require('../auth');
const { sqlNow } = require('../util');

const router = express.Router();
router.use(authRequired);

const HOMEWORK_SET = ['done', 'partial', 'undone', 'none'];
const MASTERY_SET = ['none', 'initial', 'basic', 'proficient'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function getOwnedRecord(req, res) {
  const row = db.prepare(`SELECT r.*, s.name AS student_name
    FROM learning_records r JOIN students s ON s.id = r.student_id
    WHERE r.id = ? AND r.user_id = ?`).get(Number(req.params.id), req.userId);
  if (!row) { res.status(404).json({ error: '记录不存在' }); return null; }
  row.tags = JSON.parse(row.tags || '[]');
  row.photos = JSON.parse(row.photos || '[]');
  return row;
}

// 校验学生归属（记一笔前确认学生是本账号的）
function checkStudent(req, res, studentId) {
  const s = db.prepare('SELECT id, name, default_subject FROM students WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .get(studentId, req.userId);
  if (!s) { res.status(400).json({ error: '学生不存在' }); return null; }
  return s;
}

// 清洗提交字段：类型约束 + 长度截断
function cleanBody(b) {
  return {
    student_id: Number(b.student_id),
    record_date: String(b.record_date || '').slice(0, 10),
    subject: String(b.subject || '').slice(0, 50),
    content: String(b.content || '').slice(0, 2000),
    homework_status: HOMEWORK_SET.includes(b.homework_status) ? b.homework_status : '',
    homework_desc: String(b.homework_desc || '').slice(0, 500),
    focus: Math.min(5, Math.max(1, Number(b.focus) || 3)),
    tags: Array.isArray(b.tags) ? b.tags.map(t => String(t).slice(0, 20)).filter(Boolean).slice(0, 10) : [],
    knowledge_point: String(b.knowledge_point || '').slice(0, 100),
    mastery_level: MASTERY_SET.includes(b.mastery_level) ? b.mastery_level : '',
    comment: String(b.comment || '').slice(0, 2000),
  };
}

// 列表：按学生 / 日期范围筛选，倒序
router.get('/', (req, res) => {
  const { student_id, from, to, limit = 50, offset = 0 } = req.query;
  let sql = `SELECT r.*, s.name AS student_name, s.grade
    FROM learning_records r JOIN students s ON s.id = r.student_id WHERE r.user_id = ?`;
  const params = [req.userId];
  if (student_id) { sql += ' AND r.student_id = ?'; params.push(Number(student_id)); }
  if (from) { sql += ' AND r.record_date >= ?'; params.push(String(from)); }
  if (to) { sql += ' AND r.record_date <= ?'; params.push(String(to)); }
  sql += ' ORDER BY r.record_date DESC, r.id DESC LIMIT ? OFFSET ?';
  params.push(Math.min(200, Number(limit) || 50), Number(offset) || 0);
  const rows = db.prepare(sql).all(...params);
  rows.forEach(r => { r.tags = JSON.parse(r.tags || '[]'); r.photos = JSON.parse(r.photos || '[]'); });
  res.json({ records: rows });
});

// 最近一条记录（"按上次记录填充"）
router.get('/last', (req, res) => {
  const studentId = Number(req.query.student_id);
  if (!studentId) return res.status(400).json({ error: '缺少 student_id' });
  if (!checkStudent(req, res, studentId)) return;
  const row = db.prepare('SELECT * FROM learning_records WHERE student_id = ? ORDER BY record_date DESC, id DESC LIMIT 1')
    .get(studentId);
  if (!row) return res.json({ record: null });
  row.tags = JSON.parse(row.tags || '[]');
  res.json({ record: row });
});

// 记一笔：所有字段选填，最小可只选日期直接保存
router.post('/', (req, res) => {
  const b = cleanBody(req.body || {});
  const s = checkStudent(req, res, b.student_id);
  if (!s) return;
  if (!DATE_RE.test(b.record_date)) return res.status(400).json({ error: '日期格式不正确' });
  const now = sqlNow();
  const info = db.prepare(`INSERT INTO learning_records
    (student_id, user_id, record_date, subject, content, homework_status, homework_desc, focus, tags, knowledge_point, mastery_level, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(b.student_id, req.userId, b.record_date, b.subject, b.content, b.homework_status, b.homework_desc,
      b.focus, JSON.stringify(b.tags), b.knowledge_point, b.mastery_level, b.comment, now, now);
  res.json({ id: Number(info.lastInsertRowid) });
});

router.get('/:id', (req, res) => {
  const r = getOwnedRecord(req, res);
  if (r) res.json({ record: r });
});

router.put('/:id', (req, res) => {
  const r = getOwnedRecord(req, res);
  if (!r) return;
  const b = cleanBody(req.body || {});
  if (!DATE_RE.test(b.record_date)) return res.status(400).json({ error: '日期格式不正确' });
  db.prepare(`UPDATE learning_records SET record_date=?, subject=?, content=?, homework_status=?, homework_desc=?,
    focus=?, tags=?, knowledge_point=?, mastery_level=?, comment=?, updated_at=? WHERE id=?`)
    .run(b.record_date, b.subject, b.content, b.homework_status, b.homework_desc, b.focus,
      JSON.stringify(b.tags), b.knowledge_point, b.mastery_level, b.comment, sqlNow(), r.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const r = getOwnedRecord(req, res);
  if (!r) return;
  db.prepare('DELETE FROM learning_records WHERE id = ?').run(r.id);
  res.json({ ok: true });
});

module.exports = router;
