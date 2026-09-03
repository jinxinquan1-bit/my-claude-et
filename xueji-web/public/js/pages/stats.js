// 统计页：全局概览 + 学生维度（趋势折线 / 作业环图 / 掌握度条形图）
import { api } from '../api.js';
import { toast, esc, todayStr, weekStartStr, monthStartStr } from '../components.js';
import { lineChart, donutChart, masteryBars, PALETTE } from '../charts.js';
import { MASTERY } from '../components.js';

const PERIODS = [
  { v: 'week', label: '本周' },
  { v: 'month', label: '本月' },
  { v: 'custom', label: '自定义' },
];

export function render() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="h1" style="margin-bottom:12px">统计</div>
    <div id="overview"><div class="muted" style="padding:12px 0">加载中…</div></div>
    <div class="section-title">学生统计</div>
    <div class="card">
      <div class="form-group" style="margin-bottom:10px">
        <label>选择学生</label>
        <select class="input" id="sel-student"></select>
      </div>
      <div class="seg" id="sel-period">
        ${PERIODS.map(p => `<button class="seg-btn ${p.v === 'week' ? 'on' : ''}" data-v="${p.v}">${p.label}</button>`).join('')}
      </div>
      <div id="custom-range" hidden style="display:flex;gap:8px;margin-top:10px">
        <input class="input" id="range-from" type="date" value="${weekStartStr()}">
        <input class="input" id="range-to" type="date" value="${todayStr()}">
      </div>
    </div>
    <div id="charts"><div class="muted" style="padding:12px 0">加载中…</div></div>`;

  let students = [];
  let period = 'week';
  let from = weekStartStr(), to = todayStr();

  // 概览
  api('/stats/overview').then(d => {
    const weekCount = d.last7.reduce((s, x) => s + x.count, 0);
    wrap.querySelector('#overview').innerHTML = `
      <div class="stat-cards">
        <div class="stat-card"><div class="num blue">${d.activeStudents}</div><div class="lbl">在读学生</div></div>
        <div class="stat-card"><div class="num">${d.todayCount}</div><div class="lbl">今日已记录</div></div>
        <div class="stat-card"><div class="num green">${d.pending.length}</div><div class="lbl">今日待记录</div></div>
      </div>
      <div class="stat-cards">
        <div class="stat-card"><div class="num">${d.totalStudents}</div><div class="lbl">学生总数</div></div>
        <div class="stat-card"><div class="num">${weekCount}</div><div class="lbl">近 7 天记录</div></div>
        <div class="stat-card"><div class="num">${d.last7[6].count}</div><div class="lbl">今天</div></div>
      </div>`;
  }).catch(e => toast(e.message, 'error'));

  // 学生列表
  api('/students?status=').then(d => {
    students = d.students;
    const sel = wrap.querySelector('#sel-student');
    sel.innerHTML = students.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('') ||
      `<option value="">暂无学生</option>`;
    sel.addEventListener('change', loadCharts);
    if (students.length) loadCharts();
  }).catch(e => toast(e.message, 'error'));

  // 周期切换
  wrap.querySelectorAll('#sel-period .seg-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('#sel-period .seg-btn').forEach(b => b.classList.toggle('on', b === btn));
      period = btn.dataset.v;
      const custom = wrap.querySelector('#custom-range');
      if (period === 'custom') {
        custom.hidden = false;
        custom.style.display = 'flex';
        from = wrap.querySelector('#range-from').value;
        to = wrap.querySelector('#range-to').value;
      } else {
        custom.hidden = true;
        custom.style.display = 'none';
        from = period === 'week' ? weekStartStr() : monthStartStr();
        to = todayStr();
      }
      loadCharts();
    }));
  wrap.querySelectorAll('#custom-range input').forEach(inp =>
    inp.addEventListener('change', () => {
      from = wrap.querySelector('#range-from').value;
      to = wrap.querySelector('#range-to').value;
      if (from && to) loadCharts();
    }));

  async function loadCharts() {
    const sid = Number(wrap.querySelector('#sel-student').value);
    if (!sid) return;
    try {
      const d = await api(`/stats/student/${sid}?from=${from}&to=${to}`);
      const masteryMap = { none: 0, initial: 0, basic: 0, proficient: 0 };
      d.mastery.forEach(m => { masteryMap[m.m] = m.c; });

      wrap.querySelector('#charts').innerHTML = `
        <div class="stat-cards">
          <div class="stat-card"><div class="num blue">${d.count}</div><div class="lbl">记录次数</div></div>
          <div class="stat-card"><div class="num green">${d.hwRate == null ? '—' : d.hwRate + '%'}</div><div class="lbl">作业完成率</div></div>
          <div class="stat-card"><div class="num">${d.focusAvg ?? '—'}</div><div class="lbl">平均专注度</div></div>
        </div>
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
        </div>`;

      lineChart(wrap.querySelector('#c-line'), d.focusTrend.map(r => ({ date: r.record_date, value: r.f })));
      donutChart(wrap.querySelector('#c-donut'), [
        { label: '已完成', value: d.homework.done, color: PALETTE.homework.done },
        { label: '部分完成', value: d.homework.partial, color: PALETTE.homework.partial },
        { label: '未完成', value: d.homework.undone, color: PALETTE.homework.undone },
      ], { centerValue: d.hwRate == null ? '—' : d.hwRate + '%', centerNote: '作业完成率' });
      if (d.homework.none > 0) {
        wrap.querySelector('#c-donut').insertAdjacentHTML('beforeend',
          `<div class="muted" style="margin-top:6px">另有 ${d.homework.none} 次无作业</div>`);
      }
      masteryBars(wrap.querySelector('#c-mastery'), [
        { label: MASTERY.none.label, value: masteryMap.none, color: PALETTE.mastery[0] },
        { label: MASTERY.initial.label, value: masteryMap.initial, color: PALETTE.mastery[1] },
        { label: MASTERY.basic.label, value: masteryMap.basic, color: PALETTE.mastery[2] },
        { label: MASTERY.proficient.label, value: masteryMap.proficient, color: PALETTE.mastery[3] },
      ]);
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return wrap;
}
