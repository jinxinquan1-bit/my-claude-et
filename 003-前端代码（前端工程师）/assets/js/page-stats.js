// 统计页：概览 + 学生维度三图表（演示数据，切换学生/周期刷新）
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const M = window.MOCK;

    // 全局概览
    const ov = M.stats.overview;
    document.getElementById('ov-active').textContent = ov.activeStudents;
    document.getElementById('ov-today').textContent = ov.todayCount;
    document.getElementById('ov-pending').textContent = ov.pendingCount;
    document.getElementById('ov-week').textContent = ov.weekCount;

    // 学生选择器
    const sel = document.getElementById('sel-student');
    sel.innerHTML = M.students.map((s, i) =>
      `<option value="${i}" ${i === 0 ? 'selected' : ''}>${XJ.esc(s.name)}（${XJ.esc(s.subject)}）</option>`).join('');
    sel.addEventListener('change', renderCharts);

    // 周期切换（演示：数据同源）
    document.querySelectorAll('#period-seg .seg-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        document.querySelectorAll('#period-seg .seg-btn').forEach(b => b.classList.toggle('on', b === btn));
        document.getElementById('custom-range').classList.toggle('hidden', btn.dataset.v !== 'custom');
        XJ.toast(`已切换到「${btn.textContent}」视角（演示数据）`);
      }));

    function renderCharts() {
      const s = M.stats;
      document.getElementById('st-count').textContent = s.count;
      document.getElementById('st-rate').textContent = s.hwRate + '%';
      document.getElementById('st-focus').textContent = s.focusAvg;

      XJ.lineChart(document.getElementById('c-line'), s.focusTrend);
      XJ.donutChart(document.getElementById('c-donut'), [
        { label: '已完成', value: s.homework.done, color: '#15803D' },
        { label: '部分完成', value: s.homework.partial, color: '#F59E0B' },
        { label: '未完成', value: s.homework.undone, color: '#EF4444' },
      ], { centerValue: s.hwRate + '%', centerNote: '作业完成率' });
      if (s.homework.none > 0) {
        document.getElementById('c-donut').insertAdjacentHTML('beforeend',
          `<div class="text-label-sm text-text-muted mt-2">另有 ${s.homework.none} 次无作业</div>`);
      }
      XJ.masteryBars(document.getElementById('c-mastery'), [
        { label: '未掌握', value: s.mastery.none, color: '#60A5FA' },
        { label: '初步掌握', value: s.mastery.initial, color: '#3B82F6' },
        { label: '基本掌握', value: s.mastery.basic, color: '#2563EB' },
        { label: '熟练掌握', value: s.mastery.proficient, color: '#1E40AF' },
      ]);
    }

    renderCharts();
  });
})();
