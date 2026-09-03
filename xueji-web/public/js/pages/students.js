// 学生列表：搜索 + 状态筛选 + 最近记录排序
import { api } from '../api.js';
import { toast, esc, icon, STUDENT_STATUS } from '../components.js';

export function render() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="flex-between" style="margin-bottom:12px">
      <div class="h1">学生</div>
      <button class="btn btn-primary" id="add" style="padding:9px 16px">${icon('plus', 15)} 添加</button>
    </div>
    <div class="search-bar">${icon('search', 16)}<input class="input" id="q" placeholder="搜索学生姓名"></div>
    <div class="seg" style="margin-bottom:12px">
      <button class="seg-btn on" data-status="">全部</button>
      <button class="seg-btn" data-status="active">在读</button>
      <button class="seg-btn" data-status="paused">停课</button>
      <button class="seg-btn" data-status="finished">结课</button>
    </div>
    <div id="list"><div class="muted" style="padding:12px 0">加载中…</div></div>`;

  wrap.querySelector('#add').addEventListener('click', () => { location.hash = '#/students/new'; });

  let status = '';
  wrap.querySelectorAll('.seg-btn[data-status]').forEach(btn =>
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.seg-btn[data-status]').forEach(b => b.classList.toggle('on', b === btn));
      status = btn.dataset.status;
      load();
    }));

  let timer;
  wrap.querySelector('#q').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => load(e.target.value.trim()), 300);
  });

  async function load(q = wrap.querySelector('#q').value.trim()) {
    try {
      const d = await api(`/students?q=${encodeURIComponent(q)}&status=${status}`);
      const list = wrap.querySelector('#list');
      if (!d.students.length) {
        list.innerHTML = `<div class="empty">${icon('students', 40)}<p>${q ? '没有找到匹配的学生' : '还没有学生，点击右上角「添加」'}</p></div>`;
        return;
      }
      list.innerHTML = d.students.map(s => `
        <div class="list-row" data-id="${s.id}">
          <div class="avatar ${s.status === 'active' ? '' : 'gray'}">${esc(s.name[0] || '?')}</div>
          <div class="main">
            <div class="name">${esc(s.name)}
              ${s.status !== 'active' ? `<span class="badge badge-gray" style="margin-left:6px">${STUDENT_STATUS[s.status]}</span>` : ''}
            </div>
            <div class="meta">${[s.grade, s.school, s.default_subject && s.default_subject + '课'].filter(Boolean).join(' · ') || '暂无更多信息'}</div>
          </div>
          <div class="right">
            <div class="muted">${s.last_record_date ? '最近 ' + s.last_record_date.slice(5) : '暂无记录'}</div>
            <div class="sub">${s.record_count ? s.record_count + ' 条记录' : ''}</div>
          </div>
        </div>`).join('');
      list.querySelectorAll('.list-row').forEach(row =>
        row.addEventListener('click', () => { location.hash = '#/students/' + row.dataset.id; }));
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  load();
  return wrap;
}
