// 首页：问候语 + 待记录名单 + 本周活跃柱状图（演示数据渲染）
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const M = window.MOCK;

    // 问候语（真实登录用户名）
    const demoUser = XJ_API.getUser();
    if (demoUser) document.getElementById('user-name').textContent = demoUser;

    // 待记录名单
    const pending = M.students.filter(s => s.status === 'active');
    document.getElementById('stat-pending').innerHTML =
      `${pending.length}<span class="text-body-lg text-text-muted font-normal ml-1">节课</span>`;
    document.getElementById('today-line').textContent =
      `今天也要记录哦 · 有 ${pending.length} 位学生待记录`;

    const list = document.getElementById('pending-list');
    list.innerHTML = pending.map((s, i) => `
      <a href="student-detail.html" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-app-bg transition-colors border-b border-border-light last:border-0">
        <span class="avatar-initial w-10 h-10 rounded-full text-body-md" data-initial="${XJ.esc(s.name)}"></span>
        <span class="flex-1 min-w-0">
          <span class="block text-body-md font-medium text-text-main truncate">${XJ.esc(s.name)}</span>
          <span class="block text-label-sm text-text-muted">${XJ.esc(s.grade)} · ${XJ.esc(s.subject)}${s.tags.length ? ' · ' + XJ.esc(s.tags[0]) : ''}</span>
        </span>
        ${i === 0
          ? '<span class="text-label-sm px-2 py-1 rounded-full bg-danger-light text-danger">已逾期</span>'
          : '<span class="text-label-sm px-2 py-1 rounded-full bg-primary-light text-primary">今天</span>'}
        <span class="material-symbols-outlined text-text-placeholder text-[20px]">chevron_right</span>
      </a>`).join('');

    // 本周活跃柱状图
    const week = [3, 4, 2, 5, 3, 4, 2];
    const max = Math.max(...week);
    document.getElementById('week-chart').innerHTML = week.map((v, i) => {
      const h = Math.round((v / max) * 100);
      const today = i === 6;
      return `<div class="group flex-1 flex flex-col items-center gap-2" title="${v} 条记录">
        <span class="text-label-sm ${today ? 'text-primary font-semibold' : 'text-text-muted'} opacity-0 group-hover:opacity-100 transition-opacity">${v}</span>
        <div class="w-full max-w-10 rounded-lg ${today ? 'bg-primary' : 'bg-primary/30 group-hover:bg-primary/50'} transition-colors" style="height:${Math.max(h, 6)}%"></div>
      </div>`;
    }).join('');
  });
})();
