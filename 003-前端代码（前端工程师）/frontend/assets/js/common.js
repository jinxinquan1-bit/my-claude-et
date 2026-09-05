// 学迹公共脚本（多页静态站共享层）
// - 共享壳注入：桌面（侧栏+顶栏）/ 移动（顶栏+底栏+中央 FAB），导航为真实页面链接
// - 通用交互：toast / 弹窗 / 星级 / 演示按钮 / 首字母头像
// - SVG 图表：折线 / 环图 / 掌握度条形图（配色遵循 PRD 第 6 章校验色板）
(function () {
  'use strict';

  const XJ = (window.XJ = {});

  // ---------- 导航配置（跳转矩阵的唯一来源） ----------
  const NAV = [
    { key: 'home', label: '首页', icon: 'home', href: 'home.html' },
    { key: 'students', label: '学生', icon: 'group', href: 'students.html' },
    { key: 'stats', label: '统计', icon: 'monitoring', href: 'stats.html' },
    { key: 'me', label: '我的', icon: 'person', href: 'me.html' },
  ];

  // ---------- 工具 ----------
  XJ.esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  XJ.toast = function (msg, type) {
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 2200);
  };

  XJ.dialog = function ({ title = '', html = '', buttons = [] }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.innerHTML = `
        <div class="dialog">
          ${title ? `<div class="dialog-title">${XJ.esc(title)}</div>` : ''}
          ${html ? `<div class="dialog-msg">${html}</div>` : ''}
          <div class="dialog-btns">${buttons.map((b, i) =>
            `<button class="px-4 py-2.5 rounded-xl text-body-md font-medium transition-opacity active:opacity-75 ${b.cls || 'bg-primary text-white hover:bg-primary-hover'}" data-v="${i}">${XJ.esc(b.text)}</button>`).join('')}
          </div>
        </div>`;
      overlay.addEventListener('click', e => {
        if (e.target === overlay) { overlay.remove(); resolve(null); return; }
        const btn = e.target.closest('button[data-v]');
        if (btn) { overlay.remove(); resolve(buttons[Number(btn.dataset.v)].value); }
      });
      document.body.appendChild(overlay);
    });
  };

  XJ.confirm = async function ({ title = '确认操作', message = '', okText = '确定', danger = false } = {}) {
    const v = await XJ.dialog({
      title, html: XJ.esc(message),
      buttons: [
        { text: '取消', cls: 'border border-border-light text-text-body hover:bg-app-bg', value: false },
        { text: okText, cls: danger ? 'bg-danger text-white hover:bg-danger-deep' : 'bg-primary text-white hover:bg-primary-hover', value: true },
      ],
    });
    return v === true;
  };

  // ---------- 星级（容器内交互） ----------
  XJ.bindStars = function (container, onChange) {
    container.querySelectorAll('.stars').forEach(el => {
      el.addEventListener('click', e => {
        const btn = e.target.closest('button[data-star]');
        if (!btn) return;
        const v = Number(btn.dataset.star);
        el.dataset.value = v;
        el.querySelectorAll('button').forEach(b => b.classList.toggle('on', Number(b.dataset.star) <= v));
        el.querySelectorAll('button').forEach(b => b.classList.toggle('off', Number(b.dataset.star) > v));
        onChange && onChange(v);
      });
    });
  };
  XJ.starsHTML = function (n) {
    let html = '<span class="stars" data-value="' + (n || 0) + '">';
    for (let i = 1; i <= 5; i++) {
      html += `<button type="button" data-star="${i}" class="${i <= n ? 'on' : 'off'}">
        <span class="material-symbols-outlined fill">star</span></button>`;
    }
    return html + '</span>';
  };

  // ---------- SVG 图表（PRD 校验色板） ----------
  const C = {
    primary: '#3B82F6',
    homework: { done: '#15803D', partial: '#F59E0B', undone: '#EF4444' },
    mastery: ['#60A5FA', '#3B82F6', '#2563EB', '#1E40AF'],
    ink: '#111827', inkSec: '#6B7280', inkMuted: '#9CA3AF',
    grid: '#E5E7EB', track: '#F1F5F9',
  };

  // 折线图：points = [{ date:'MM-DD', value }]
  XJ.lineChart = function (el, points, { min = 1, max = 5, ticks = [1, 2, 3, 4, 5] } = {}) {
    if (!points || !points.length) { el.innerHTML = '<div class="text-body-sm text-text-placeholder text-center py-6">该时间段暂无数据</div>'; return; }
    const W = 320, H = 190, padL = 26, padR = 10, padT = 14, padB = 26;
    const iw = W - padL - padR, ih = H - padT - padB;
    const x = i => padL + (points.length === 1 ? iw / 2 : iw * i / (points.length - 1));
    const y = v => padT + ih * (1 - (v - min) / (max - min));
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="趋势图">`;
    ticks.forEach(t => {
      svg += `<line x1="${padL}" y1="${y(t).toFixed(1)}" x2="${W - padR}" y2="${y(t).toFixed(1)}" stroke="${C.grid}" stroke-width="1"/>`;
      svg += `<text x="${padL - 6}" y="${(y(t) + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="${C.inkMuted}">${t}</text>`;
    });
    const step = Math.max(1, Math.ceil(points.length / 5));
    points.forEach((p, i) => {
      if (i % step === 0 || i === points.length - 1) {
        svg += `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="${C.inkMuted}">${p.date}</text>`;
      }
    });
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join('');
    svg += `<path d="${d}" fill="none" stroke="${C.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    points.forEach((p, i) => {
      svg += `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4" fill="${C.primary}" stroke="#FFFFFF" stroke-width="2"/>`;
    });
    svg += '</svg>';
    el.innerHTML = svg;
  };

  // 环图：segments = [{ label, value, color }]
  XJ.donutChart = function (el, segments, { centerValue = '—', centerNote = '' } = {}) {
    const total = segments.reduce((s, x) => s + (x.value || 0), 0);
    if (!total) { el.innerHTML = '<div class="text-body-sm text-text-placeholder text-center py-6">暂无作业记录</div>'; return; }
    const W = 320, H = 176, cx = 84, cy = 86, R = 58, ring = 24;
    const circ = 2 * Math.PI * R;
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="分布图">`;
    let acc = 0;
    segments.forEach(s => {
      if (!s.value) return;
      const frac = s.value / total;
      const len = Math.max(frac * circ - 2, 2);
      svg += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${s.color}" stroke-width="${ring}"
        stroke-dasharray="${len.toFixed(1)} ${(circ - len).toFixed(1)}" stroke-dashoffset="${-(acc * circ + 1).toFixed(1)}"/>`;
      acc += frac;
    });
    svg += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="26" font-weight="700" fill="${C.ink}">${centerValue}</text>`;
    svg += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="${C.inkSec}">${centerNote}</text></svg>`;
    const legend = `<div class="legend">${segments.map(s =>
      `<span><i style="background:${s.color}"></i>${s.label} ${s.value} 次</span>`).join('')}</div>`;
    el.innerHTML = svg + legend;
  };

  // 掌握度条形图：rows = [{ label, value, color }]
  XJ.masteryBars = function (el, rows) {
    const total = rows.reduce((s, r) => s + (r.value || 0), 0);
    if (!total) { el.innerHTML = '<div class="text-body-sm text-text-placeholder text-center py-6">暂无知识点记录</div>'; return; }
    const max = Math.max(...rows.map(r => r.value));
    el.innerHTML = rows.map(r => `
      <div class="flex items-center gap-3 text-body-sm mb-2">
        <span class="w-16 flex-none text-text-secondary">${XJ.esc(r.label)}</span>
        <span class="flex-1 h-2 bg-neutral-light rounded-full overflow-hidden">
          <span class="block h-full rounded-full" style="width:${Math.max(8, (r.value / max) * 100).toFixed(0)}%;background:${r.color}"></span>
        </span>
        <span class="w-10 flex-none text-right text-text-secondary">${r.value} 次</span>
      </div>`).join('');
  };

  // ---------- 共享壳注入 ----------
  function navLinkHTML(n) {
    const activeCls = n.key === activeKey
      ? 'bg-primary-light text-primary border-primary'
      : 'text-text-body hover:bg-primary-light/50 border-transparent';
    return `<a href="${n.href}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-body-md font-medium border-l-4 ${activeCls} transition-colors">
      <span class="material-symbols-outlined text-[22px]">${n.icon}</span>${n.label}
    </a>`;
  }
  function bottomItem(key, href, label, icon) {
    const act = key === activeKey ? 'text-primary' : 'text-text-placeholder';
    return `<a href="${href}" class="flex flex-col items-center justify-center gap-1 pb-1 tap-highlight ${act}">
      <span class="material-symbols-outlined text-[22px]">${icon}</span>
      <span class="text-label-sm">${label}</span>
    </a>`;
  }

  let activeKey = '';

  // 返回是否注入了壳（公开页 index/report-share 无壳，返回 false）
  function initShell() {
    const slot = document.querySelector('[data-shell="app"]');
    if (!slot) return false;
    activeKey = slot.dataset.active || '';

    const sideNav = `
      <aside class="hidden md:flex fixed inset-y-0 left-0 w-[260px] flex-col bg-card-white border-r border-border-light z-40">
        <div class="px-5 py-6 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center">
            <span class="material-symbols-outlined text-[22px]">school</span>
          </div>
          <div>
            <div class="text-title-lg font-semibold text-text-main">学迹</div>
            <div class="text-label-sm text-text-muted">教师端</div>
          </div>
        </div>
        <nav class="flex-1 px-3 space-y-1 mt-2">${NAV.map(navLinkHTML).join('')}</nav>
        <div class="px-3 pb-4 space-y-1">
          <a href="record.html" class="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium text-body-md py-3 shadow-fab transition-colors">
            <span class="material-symbols-outlined text-[20px]">edit_note</span>记一笔
          </a>
          <div class="flex text-label-sm text-text-muted pt-2">
            <button class="flex-1 py-1.5 rounded-lg hover:bg-app-bg tap-highlight" data-demo="设置">设置</button>
            <button class="flex-1 py-1.5 rounded-lg hover:bg-app-bg tap-highlight" data-demo="帮助">帮助</button>
          </div>
        </div>
      </aside>`;

    const topBar = `
      <header class="hidden md:flex fixed top-0 left-[260px] right-0 h-16 items-center gap-3 px-6 bg-card-white/80 backdrop-blur border-b border-border-light z-30">
        <div class="relative flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-text-placeholder">search</span>
          <input class="w-full pl-10 pr-4 py-2 rounded-xl bg-app-bg border border-border-light text-input-text placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-shadow" placeholder="搜索学生、记录…" />
        </div>
        <button class="w-10 h-10 rounded-xl hover:bg-app-bg flex items-center justify-center relative tap-highlight" data-demo="通知">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger"></span>
        </button>
        <button class="w-10 h-10 rounded-xl hover:bg-app-bg flex items-center justify-center tap-highlight" data-demo="日历">
          <span class="material-symbols-outlined">calendar_month</span>
        </button>
        <a href="record.html" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-body-sm font-medium transition-colors">
          <span class="material-symbols-outlined text-[18px]">edit_note</span>记一笔
        </a>
        <a href="me.html" class="avatar-initial w-9 h-9 rounded-full text-body-sm">王</a>
      </header>`;

    const mobileTop = `
      <header class="md:hidden sticky top-0 z-30 bg-card-white/90 backdrop-blur border-b border-border-light">
        <div class="flex items-center gap-2 px-4 h-14">
          <button class="w-10 h-10 rounded-xl hover:bg-app-bg flex items-center justify-center tap-highlight" data-demo="菜单">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div class="flex items-center gap-2 flex-1">
            <div class="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">school</span>
            </div>
            <span class="text-title-md font-semibold text-text-main">学迹</span>
          </div>
          <a href="me.html" class="avatar-initial w-9 h-9 rounded-full text-body-sm">王</a>
        </div>
      </header>`;

    const bottomNav = `
      <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card-white border-t border-border-light pb-safe">
        <div class="grid grid-cols-5 h-16">
          ${bottomItem('home', 'home.html', '首页', 'home')}
          ${bottomItem('students', 'students.html', '学生', 'group')}
          <a href="record.html" class="relative flex items-start justify-center tap-highlight">
            <span class="absolute -top-4 w-[52px] h-[52px] rounded-full bg-primary shadow-fab border-4 border-surface-bg flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-[26px]">edit_note</span>
            </span>
            <span class="text-label-sm text-text-placeholder mt-9">记一笔</span>
          </a>
          ${bottomItem('stats', 'stats.html', '统计', 'monitoring')}
          ${bottomItem('me', 'me.html', '我的', 'person')}
        </div>
      </nav>`;

    slot.outerHTML = sideNav + topBar + mobileTop + bottomNav;
    return true;
  }

  // ---------- 全局初始化 ----------
  async function init() {
    const hasShell = initShell();
    // 登录态守卫：仅壳页面需要；index（登录页）与 report-share（家长报告页）是公开页，不守卫
    if (hasShell) {
      const API = window.XJ_API;
      if (!API || !API.getToken()) { location.href = 'index.html'; return; }
      const ok = await API.isLoggedIn();
      if (!ok) { location.href = 'index.html'; return; }
    }
    // 演示按钮
    document.querySelectorAll('[data-demo]').forEach(el =>
      el.addEventListener('click', () => XJ.toast(`「${el.dataset.demo}」为演示功能`)));
    // 首字母头像
    document.querySelectorAll('.avatar-initial[data-initial]').forEach(el => {
      el.textContent = (el.dataset.initial || '?').charAt(0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
