// 家长报告页（免登录，只读）：通过 /r/:token 读取公开报告
import { esc, starsHTML, homeworkBadge, masteryBadge, tagsHTML, MASTERY, weekdayOf } from './components.js';
import { lineChart, donutChart, masteryBars, PALETTE } from './charts.js';

const token = location.pathname.split('/').filter(Boolean).pop();

function errorPage(msg) {
  return `
    <div style="text-align:center;padding:96px 24px">
      <div style="width:64px;height:64px;border-radius:18px;background:var(--primary);color:#fff;font-size:30px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">迹</div>
      <div class="h1" style="margin-bottom:8px">${esc(msg)}</div>
      <p class="muted">请联系老师重新发送报告链接</p>
    </div>`;
}

function renderReport(r) {
  const s = r.snapshot;
  const masteryMap = { none: 0, initial: 0, basic: 0, proficient: 0 };
  s.mastery.forEach(m => { masteryMap[m.m] = m.c; });

  const page = document.getElementById('page');
  page.innerHTML = `
    <div class="report-hero">
      <div class="muted" style="font-size:12px;margin-bottom:6px">学迹 · 学习报告</div>
      <div class="stu-name">${esc(s.student.name)}</div>
      <div class="stu-meta">${[s.student.grade, s.student.school].filter(Boolean).join(' · ') || ''}</div>
      <div class="period">${r.period_start} ~ ${r.period_end}</div>
    </div>

    <div class="stat-cards">
      <div class="stat-card"><div class="num blue">${s.count}</div><div class="lbl">上课次数</div></div>
      <div class="stat-card"><div class="num green">${s.hwRate == null ? '—' : s.hwRate + '%'}</div><div class="lbl">作业完成率</div></div>
      <div class="stat-card"><div class="num">${s.focusAvg ?? '—'}</div><div class="lbl">平均专注度</div></div>
    </div>

    <div class="report-section">
      <div class="chart-wrap">
        <div class="chart-title">专注度趋势</div>
        <div id="c-line"></div>
      </div>
      <div class="chart-wrap">
        <div class="chart-title">作业完成分布</div>
        <div id="c-donut"></div>
      </div>
      <div class="chart-wrap">
        <div class="chart-title">知识点掌握分布</div>
        <div id="c-mastery"></div>
      </div>
    </div>

    ${r.teacher_message ? `
    <div class="report-section">
      <div class="section-title">老师寄语</div>
      <div class="teacher-msg">${esc(r.teacher_message)}</div>
    </div>` : ''}

    <div class="report-section">
      <div class="section-title">学习记录（${s.count} 次）</div>
      <div id="records"></div>
    </div>

    <div class="report-footer">
      由 ${esc(s.teacher.name)} 通过「学迹」记录生成<br>记录每一步成长
    </div>`;

  lineChart(page.querySelector('#c-line'), s.focusTrend.map(r => ({ date: r.record_date, value: r.f })));
  donutChart(page.querySelector('#c-donut'), [
    { label: '已完成', value: s.homework.done, color: PALETTE.homework.done },
    { label: '部分完成', value: s.homework.partial, color: PALETTE.homework.partial },
    { label: '未完成', value: s.homework.undone, color: PALETTE.homework.undone },
  ], { centerValue: s.hwRate == null ? '—' : s.hwRate + '%', centerNote: '作业完成率' });
  if (s.homework.none > 0) {
    page.querySelector('#c-donut').insertAdjacentHTML('beforeend',
      `<div class="muted" style="margin-top:6px">另有 ${s.homework.none} 次无作业</div>`);
  }
  masteryBars(page.querySelector('#c-mastery'), [
    { label: MASTERY.none.label, value: masteryMap.none, color: PALETTE.mastery[0] },
    { label: MASTERY.initial.label, value: masteryMap.initial, color: PALETTE.mastery[1] },
    { label: MASTERY.basic.label, value: masteryMap.basic, color: PALETTE.mastery[2] },
    { label: MASTERY.proficient.label, value: masteryMap.proficient, color: PALETTE.mastery[3] },
  ]);

  const recEl = page.querySelector('#records');
  if (!s.records.length) {
    recEl.innerHTML = `<div class="card muted" style="text-align:center">该时间段没有学习记录</div>`;
  } else {
    recEl.innerHTML = s.records.map(r => `
      <div class="card">
        <div class="tl-head">
          <span class="muted" style="font-size:13px">${r.record_date} ${weekdayOf(r.record_date)}</span>
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
      </div>`).join('');
  }
}

(async () => {
  try {
    const res = await fetch('/api/public/reports/' + encodeURIComponent(token));
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || '报告不存在');
    renderReport(d.report);
  } catch (e) {
    document.getElementById('page').innerHTML = errorPage(e.message || '链接已失效');
  }
})();
