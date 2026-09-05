// 学生列表：卡片渲染 + 搜索过滤（演示数据）
(function () {
  'use strict';

  const STATUS = {
    active: { label: '在读', cls: 'bg-success-light text-success-deep' },
    paused: { label: '停课', cls: 'bg-warning-light text-warning-text' },
    finished: { label: '结课', cls: 'bg-neutral-light text-neutral-tag' },
  };

  function render(keyword) {
    const kw = (keyword || '').trim();
    const list = window.MOCK.students.filter(s => !kw || s.name.includes(kw));
    document.getElementById('count').textContent = `(${list.length})`;

    document.getElementById('student-grid').innerHTML = list.map(s => {
      const st = STATUS[s.status];
      return `
      <a href="student-detail.html" class="group bg-surface-card rounded-2xl p-5 shadow-level-1 border border-border-light hover:shadow-level-2 transition-shadow">
        <div class="flex items-center gap-4">
          <span class="avatar-initial ${s.status === 'active' ? '' : 'gray'} w-12 h-12 rounded-full text-title-md" data-initial="${XJ.esc(s.name)}"></span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-title-md font-semibold text-text-heading truncate">${XJ.esc(s.name)}</span>
              <span class="text-label-sm px-2 py-0.5 rounded-full ${st.cls}">${st.label}</span>
            </div>
            <div class="text-label-md text-text-muted mt-0.5 truncate">${XJ.esc(s.grade)} · ${XJ.esc(s.subject)} · ${XJ.esc(s.school)}</div>
          </div>
        </div>
        ${s.tags.length ? `<div class="flex gap-1.5 mt-3">${s.tags.map(t =>
          `<span class="text-label-sm px-2 py-0.5 rounded-full bg-primary-light text-primary">${XJ.esc(t)}</span>`).join('')}</div>` : ''}
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
          <span class="text-label-sm text-text-muted">最后记录：${XJ.esc(s.lastRecord)}</span>
          <span class="text-label-md text-primary group-hover:text-primary-hover">详情 ›</span>
        </div>
      </a>`;
    }).join('') || '<div class="col-span-full text-center text-text-placeholder py-16">没有找到匹配的学生</div>';

    document.querySelectorAll('.avatar-initial[data-initial]').forEach(el => {
      el.textContent = (el.dataset.initial || '?').charAt(0);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();
    document.getElementById('search').addEventListener('input', e => render(e.target.value));
  });
})();
