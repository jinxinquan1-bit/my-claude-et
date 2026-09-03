// 首页：今日待记录 + 概览卡 + 快捷入口
import { api } from '../api.js';
import { toast, esc, icon, todayStr } from '../components.js';

export function render() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="greet">
      <div class="h1">你好，${esc(localStorage.getItem('xueji_username') || '老师')}</div>
      <div class="muted">${todayStr()} · 记录让进步看得见</div>
    </div>
    <div id="stat-cards"><div class="muted" style="padding:12px 0">加载中…</div></div>
    <div class="section-title">今日待记录</div>
    <div id="pending"><div class="muted" style="padding:4px 0">加载中…</div></div>
    <div class="section-title">快捷操作</div>
    <div class="quick-grid">
      <div class="quick-item" data-go="#/record"><span class="qi-icon">${icon('plus', 20)}</span>记一笔</div>
      <div class="quick-item" data-go="#/students/new"><span class="qi-icon">${icon('students', 20)}</span>添加学生</div>
      <div class="quick-item" data-go="#/reports/new"><span class="qi-icon">${icon('report', 20)}</span>生成报告</div>
      <div class="quick-item" data-go="#/stats"><span class="qi-icon">${icon('chart', 20)}</span>查看统计</div>
    </div>`;
  wrap.querySelectorAll('[data-go]').forEach(el =>
    el.addEventListener('click', () => { location.hash = el.dataset.go; }));
  load(wrap);
  return wrap;
}

async function load(wrap) {
  try {
    const d = await api('/stats/overview');
    wrap.querySelector('#stat-cards').innerHTML = `
      <div class="stat-cards">
        <div class="stat-card"><div class="num blue">${d.activeStudents}</div><div class="lbl">在读学生</div></div>
        <div class="stat-card"><div class="num">${d.todayCount}</div><div class="lbl">今日已记录</div></div>
        <div class="stat-card"><div class="num green">${d.pending.length}</div><div class="lbl">今日待记录</div></div>
      </div>`;
    const pending = wrap.querySelector('#pending');
    if (!d.pending.length) {
      pending.innerHTML = `<div class="card" style="text-align:center;color:var(--text-secondary)">今天全部记录完成 🎉</div>`;
    } else {
      pending.innerHTML = d.pending.map(s => `
        <div class="list-row">
          <div class="avatar">${esc(s.name[0] || '?')}</div>
          <div class="main">
            <div class="name">${esc(s.name)}</div>
            <div class="meta">${s.default_subject ? '科目：' + esc(s.default_subject) : '今天还没有学习记录'}</div>
          </div>
          <button class="btn btn-primary" style="padding:8px 14px;font-size:13px" data-id="${s.id}">记一笔</button>
        </div>`).join('');
      pending.querySelectorAll('button[data-id]').forEach(b =>
        b.addEventListener('click', () => { location.hash = '#/record?student=' + b.dataset.id; }));
    }
  } catch (e) {
    toast(e.message, 'error');
  }
}
