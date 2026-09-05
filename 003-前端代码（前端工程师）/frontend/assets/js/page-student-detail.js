// 学生详情：趋势图 + 学习记录时间线渲染（演示数据）
(function () {
  'use strict';

  const HOMEWORK = {
    done: { label: '作业已完成', cls: 'bg-success-light text-success-deep' },
    partial: { label: '部分完成', cls: 'bg-warning-light text-warning-text' },
    undone: { label: '作业未完成', cls: 'bg-danger-light text-danger-deep' },
    none: { label: '本次无作业', cls: 'bg-neutral-light text-neutral-tag' },
  };
  const TAG_CLS = { '状态很好': 'bg-success-light text-success-deep', '进步明显': 'bg-success-light text-success-deep', '状态一般': 'bg-primary-light text-primary', '需要鼓励': 'bg-warning-light text-warning-text', '注意力不集中': 'bg-warning-light text-warning-text', '情绪低落': 'bg-neutral-light text-neutral-tag' };

  document.addEventListener('DOMContentLoaded', () => {
    const M = window.MOCK;

    // 趋势图
    XJ.lineChart(document.getElementById('trend-chart'), M.stats.focusTrend);

    // 学习记录时间线
    document.getElementById('record-list').innerHTML = M.records.map(r => `
      <div class="px-4 py-3.5 border-b border-border-light last:border-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-label-md text-text-muted">${r.date}</span>
          <span class="text-label-sm px-2 py-0.5 rounded-full bg-primary-light text-primary">${XJ.esc(r.subject)}</span>
          ${r.homework ? `<span class="text-label-sm px-2 py-0.5 rounded-full ${HOMEWORK[r.homework].cls}">${HOMEWORK[r.homework].label}</span>` : ''}
        </div>
        ${r.content ? `<p class="text-body-sm text-text-body mt-2">${XJ.esc(r.content)}</p>` : ''}
        <div class="flex flex-wrap items-center gap-2 mt-2">
          ${XJ.starsHTML(r.focus)}
          ${r.tags.map(t => `<span class="text-label-sm px-2 py-0.5 rounded-full ${TAG_CLS[t] || 'bg-primary-light text-primary'}">${XJ.esc(t)}</span>`).join('')}
          ${r.point ? `<span class="text-label-sm px-2 py-0.5 rounded-full bg-neutral-light text-neutral-tag">${XJ.esc(r.point)}</span>` : ''}
        </div>
        ${r.comment ? `<p class="text-body-sm text-text-muted mt-1.5">💬 ${XJ.esc(r.comment)}</p>` : ''}
      </div>`).join('');
  });
})();
