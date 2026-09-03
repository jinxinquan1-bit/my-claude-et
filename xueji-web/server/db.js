// SQLite 初始化与建表
// 使用 Node 内置 node:sqlite（Node >= 22.5），无需原生编译依赖，单文件数据库部署简单
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'data.db'));

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '',
  grade TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '',
  default_subject TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',      -- active 在读 / paused 停课 / finished 结课
  remark TEXT NOT NULL DEFAULT '',
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date TEXT NOT NULL,                  -- 'YYYY-MM-DD'
  subject TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  homework_status TEXT NOT NULL DEFAULT '',   -- '' / done / partial / undone / none
  homework_desc TEXT NOT NULL DEFAULT '',
  focus INTEGER NOT NULL DEFAULT 3,           -- 1~5 星
  tags TEXT NOT NULL DEFAULT '[]',            -- JSON 数组
  knowledge_point TEXT NOT NULL DEFAULT '',
  mastery_level TEXT NOT NULL DEFAULT '',     -- '' / none / initial / basic / proficient
  comment TEXT NOT NULL DEFAULT '',
  photos TEXT NOT NULL DEFAULT '[]',          -- JSON 数组（P1 功能，预留）
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_student_date ON learning_records(student_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_records_user_date ON learning_records(user_id, record_date DESC);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  content_snapshot TEXT NOT NULL,             -- 快照机制：生成时固化，之后改记录不影响已发报告
  teacher_message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS share_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,                 -- 随机不可枚举
  expires_at TEXT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
`);

// 轻量迁移：V1.0（phone + nickname）→ V1.0.1（username）
const userCols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
if (userCols.includes('phone') && !userCols.includes('username')) {
  db.exec('ALTER TABLE users RENAME COLUMN phone TO username;');
}
if (userCols.includes('nickname')) {
  db.exec('ALTER TABLE users DROP COLUMN nickname;');
}

module.exports = db;
