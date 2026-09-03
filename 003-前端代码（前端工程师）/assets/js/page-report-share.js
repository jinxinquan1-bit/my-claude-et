// 家长报告页：演示快照数据渲染（免登录只读）
(function () {
  'use strict';

  const HOMEWORK = {
    done: { label: '作业已完成', cls: 'bg-success-light text-success-deep' },
    partial: { label: '部分完成', cls: 'bg-warning-light text-warning-text' },
    undone: { label: '作业未完成', cls: 'bg-danger-light text-danger-deep' },
    none: { label: '本次无作业', cls: 'bg-neutral-light text-neutral-tag' },
  };

  document.addEventListener('DOMContentLoaded', () => {
    const M = window.MOCK;
    const s = M.share;

    document.getElementById('stu-name').textContent = s.student.name;
    document.getElementById('stu-meta').textContent = [s.student.grade, s.student.school].filter(Boolean).join(' · ');
    document.getElementById('period').textContent = `${s.period.from} ~ ${s.period.to}`;
    document.getElementById('st-count').textContent = s.count;
    document.getElementById('st-rate').textContent = s.hwRate + '%';
    document.getElementById('st-focus').textContent = s.focusAvg;
    document.getElementById('teacher-name').textContent = s.teacher;
    document.getElementById('message').textContent = s.message;
    document.getElementById('records-title').textContent = `学习记录（${M.records.length} 次）`;

    // 图表
    XJ.lineChart(document.getElementById('c-line'), s.focusTrend);
    XJ.donutChart(document.getElementById('c-donut'), [
      { label: '已完成', value: s.homework.done, color: '#15803D' },
      { label: '部分完成', value: s.homework.partial, color: '#F59E0B' },
      { label: '未完成', value: s.homework.undone, color: '#EF4444' },
    ], { centerValue: s.hwRate + '%', centerNote: '作业完成率' });
    XJ.masteryBars(document.getElementById('c-mastery'), [
      { label: '未掌握', value: s.mastery.none, color: '#60A5FA' },
      { label: '初步掌握', value: s.mastery.initial, color: '#3B82F6' },
      { label: '基本掌握', value: s.mastery.basic, color: '#2563EB' },
      { label: '熟练掌握', value: s.mastery.proficient, color: '#1E40AF' },
    ]);

    // 学习记录列表
    document.getElementById('records').innerHTML = M.records.map(r => `
      <div class="bg-surface-card rounded-2xl border border-border-light p-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-label-sm text-text-secondary">${r.date}</span>
          <span class="text-label-sm px-2 py-0.5 rounded-full bg-primary-light text-primary">${XJ.esc(r.subject)}</span>
          ${r.homework ? `<span class="text-label-sm px-2 py-0.5 rounded-full ${HOMEWORK[r.homework].cls}">${HOMEWORK[r.homework].label}</span>` : ''}
        </div>
        ${r.content ? `<p class="text-body-sm text-text-body mt-2">${XJ.esc(r.content)}</p>` : ''}
        <div class="flex flex-wrap items-center gap-2 mt-2">
          ${XJ.starsHTML(r.focus)}
          ${r.point ? `<span class="text-label-sm px-2 py-0.5 rounded-full bg-neutral-light text-neutral-tag">${XJ.esc(r.point)}</span>` : ''}
        </div>
        ${r.comment ? `<p class="text-body-sm text-text-muted mt-1.5">💬 ${XJ.esc(r.comment)}</p>` : ''}
      </div>`).join('');
  });
})();
