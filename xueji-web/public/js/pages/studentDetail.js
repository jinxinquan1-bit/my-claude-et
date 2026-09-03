// 学生详情：档案卡 + 本月统计 + 记录时间线 + 记一笔 / 生成报告
import { api } from '../api.js';
import {
  toast, esc, icon, starsHTML, homeworkBadge, masteryBadge, tagsHTML,
  STUDENT_STATUS, shortDate, weekdayOf,
} from '../components.js';

export function render(id) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="page-header">
      <button class="back">${icon('back', 18)}</button>
      <div class="h1">学生档案</div>
    </div>
    <div id="body"><div class="muted" style="padding:16px 0">加载中…</div></div>`;
  wrap.querySelector('.back').addEventListener('click', () => history.back());
  load(wrap, id);
  return wrap;
}

async function load(wrap, id) {
  try {
    const [{ student, stats }, recordsData] = await Promise.all([
      api('/students/' + id),
      api('/records?student_id=' + id + '&limit=50'),
    ]);
    const s = student;
    const body = wrap.querySelector('#body');
    body.innerHTML = `
      <div class="card">
        <div class="flex-between">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="avatar" style="width:52px;height:52px;font-size:20px">${esc(s.name[0] || '?')}</div>
            <div>
              <div class="name" style="font-size:17px;font-weight:700;color:var(--text-title)">${esc(s.name)}</div>
              <div class="meta muted">${[s.grade, s.school].filter(Boolean).join(' · ') || '暂无更多信息'}
                ${s.status !== 'active' ? ` · ${STUDENT_STATUS[s.status]}` : ''}</div>
            </div>
          </div>
          <button class="btn btn-text" id="edit">${icon('edit', 16)} 编辑</button>
        </div>
        ${s.remark ? `<div class="muted" style="margin-top:8px">${esc(s.remark)}</div>` : ''}
      </div>

      <div class="stat-cards">
        <div class="stat-card"><div class="num blue">${stats.count}</div><div class="lbl">本月记录</div></div>
        <div class="stat-card"><div class="num ${stats.hwRate == null ? '' : 'green'}">${stats.hwRate == null ? '—' : stats.hwRate + '%'}</div><div class="lbl">作业完成率</div></div>
        <div class="stat-card"><div class="num">${stats.focusAvg ?? '—'}</div><div class="lbl">平均专注度</div></div>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:var(--gap)">
        <button class="btn btn-primary" id="go-record" style="flex:1">${icon('plus', 16)} 记一笔</button>
        <button class="btn btn-outline" id="go-report" style="flex:1">${icon('report', 16)} 生成报告</button>
      </div>

      <div class="section-title">学习记录</div>
      <div id="timeline"></div>`;

    body.querySelector('#edit').addEventListener('click', () => { location.hash = '#/students/' + id + '/edit'; });
    body.querySelector('#go-record').addEventListener('click', () => { location.hash = '#/record?student=' + id; });
    body.querySelector('#go-report').addEventListener('click', () => { location.hash = '#/reports/new?student=' + id; });

    const tl = body.querySelector('#timeline');
    const records = recordsData.records;
    if (!records.length) {
      tl.innerHTML = `<div class="empty">${icon('empty', 40)}<p>还没有学习记录，点「记一笔」开始</p></div>`;
      return;
    }
    tl.innerHTML = `<div class="timeline">` + records.map(r => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-date">${r.record_date} ${weekdayOf(r.record_date)}</div>
        <div class="card" data-rid="${r.id}" style="cursor:pointer">
          <div class="tl-head">
            ${r.subject ? `<span class="badge badge-blue">${esc(r.subject)}</span>` : ''}
            ${homeworkBadge(r.homework_status)}
          </div>
          ${r.content ? `<div class="tl-content">${esc(r.content)}</div>` : ''}
          <div class="tl-foot">
            ${starsHTML(r.focus)}
            ${tagsHTML(r.tags)}
            ${r.knowledge_point ? `<span class="badge badge-gray">${esc(r.knowledge_point)}</span>` : ''}
            ${masteryBadge(r.mastery_level)}
          </div>
          ${r.comment ? `<div class="tl-content muted">💬 ${esc(r.comment)}</div>` : ''}
        </div>
      </div>`).join('') + '</div>';
    tl.querySelectorAll('.card[data-rid]').forEach(c =>
      c.addEventListener('click', () => { location.hash = '#/records/' + c.dataset.rid; }));
  } catch (e) {
    toast(e.message, 'error');
  }
}
