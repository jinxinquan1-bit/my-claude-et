// 通用工具：时间与日期格式化（统一使用 'YYYY-MM-DD HH:MM:SS' 文本，SQLite 可直接字符串比较）

const DAY = 24 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, '0');

function fmtSql(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fmtDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 当前时间（SQLite 文本格式）
function sqlNow() {
  return fmtSql(new Date());
}

// N 天后的时间（SQLite 文本格式）
function sqlDaysLater(days) {
  return fmtSql(new Date(Date.now() + days * DAY));
}

// 今天的日期 'YYYY-MM-DD'
function todayStr() {
  return fmtDate(new Date());
}

// N 天前的日期 'YYYY-MM-DD'
function daysAgoStr(n) {
  return fmtDate(new Date(Date.now() - n * DAY));
}

// 本周一、本月 1 号的日期
function weekStartStr() {
  const d = new Date();
  const day = d.getDay() || 7; // 周一为一周开始
  return fmtDate(new Date(Date.now() - (day - 1) * DAY));
}

function monthStartStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

module.exports = { sqlNow, sqlDaysLater, todayStr, daysAgoStr, weekStartStr, monthStartStr };
