// 通用 UI 组件与工具：转义 / toast / 弹窗 / 星级 / 徽章 / 标签 / 图标 / 日期

// ---------- 安全 ----------
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// ---------- Toast ----------
export function toast(msg, type = '') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

// ---------- 弹窗 ----------
// buttons: [{ text, cls, value }]，点击按钮 resolve(value)，点遮罩 resolve(null)
export function dialog({ title = '', html = '', buttons = [] }) {
  return new Promise(resolve => {
    const root = document.getElementById('dialog-root');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="dialog">
        ${title ? `<div class="title">${esc(title)}</div>` : ''}
        ${html ? `<div class="msg">${html}</div>` : ''}
        <div class="btns">${buttons.map((b, i) =>
          `<button class="btn ${b.cls || 'btn-primary'}" data-v="${i}">${esc(b.text)}</button>`).join('')}
        </div>
      </div>`;
    overlay.addEventListener('click', e => {
      if (e.target === overlay) { overlay.remove(); resolve(null); return; }
      const btn = e.target.closest('button[data-v]');
      if (btn) { overlay.remove(); resolve(buttons[Number(btn.dataset.v)].value); }
    });
    root.appendChild(overlay);
  });
}

export async function confirmDlg({ title = '确认操作', message = '', okText = '确定', danger = false } = {}) {
  const v = await dialog({
    title, html: esc(message),
    buttons: [
      { text: '取消', cls: 'btn-outline', value: false },
      { text: okText, cls: danger ? 'btn-danger' : 'btn-primary', value: true },
    ],
  });
  return v === true;
}

// ---------- 星级 ----------
export function starsHTML(n) {
  let html = '<span class="stars" data-value="' + (n || 0) + '">';
  for (let i = 1; i <= 5; i++) {
    html += `<button type="button" data-star="${i}" class="${i <= n ? 'on' : 'off'}">
      <svg viewBox="0 0 24 24"><path d="M12 3.6l2.5 5.1 5.6.8-4 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-4 5.6-.8z" stroke-linejoin="round"/></svg>
    </button>`;
  }
  return html + '</span>';
}

// 绑定星级点击（可交互），onPick(value) 回调
export function bindStars(root, onPick) {
  root.querySelectorAll('.stars').forEach(el => {
    el.addEventListener('click', e => {
      const btn = e.target.closest('button[data-star]');
      if (!btn) return;
      const v = Number(btn.dataset.star);
      el.dataset.value = v;
      el.querySelectorAll('button').forEach(b => {
        b.classList.toggle('on', Number(b.dataset.star) <= v);
        b.classList.toggle('off', Number(b.dataset.star) > v);
      });
      onPick && onPick(v);
    });
  });
}

// ---------- 枚举与徽章 ----------
export const HOMEWORK = {
  done: { label: '作业已完成', cls: 'badge-green' },
  partial: { label: '部分完成', cls: 'badge-orange' },
  undone: { label: '作业未完成', cls: 'badge-red' },
  none: { label: '本次无作业', cls: 'badge-gray' },
};
export const HOMEWORK_SEG = [
  { v: 'done', label: '已完成', seg: 'ok' },
  { v: 'partial', label: '部分完成', seg: 'warn' },
  { v: 'undone', label: '未完成', seg: 'bad' },
  { v: 'none', label: '无作业', seg: 'gray' },
];
export const MASTERY = {
  none: { label: '未掌握', cls: 'badge-m1' },
  initial: { label: '初步掌握', cls: 'badge-m2' },
  basic: { label: '基本掌握', cls: 'badge-m3' },
  proficient: { label: '熟练掌握', cls: 'badge-m4' },
};
export const MASTERY_SEG = [
  { v: 'none', label: '未掌握', seg: 'm-none' },
  { v: 'initial', label: '初步掌握', seg: 'm-init' },
  { v: 'basic', label: '基本掌握', seg: 'm-basic' },
  { v: 'proficient', label: '熟练掌握', seg: 'm-pro' },
];
export const STUDENT_STATUS = { active: '在读', paused: '停课', finished: '结课' };
export const DEFAULT_TAGS = ['状态很好', '状态一般', '注意力不集中', '情绪低落', '进步明显', '需要鼓励'];

// 状态标签配色（PRD 6.4 语义色映射）
export function tagCls(name) {
  const map = {
    '状态很好': 'badge-green', '进步明显': 'badge-green',
    '状态一般': 'badge-blue',
    '注意力不集中': 'badge-orange', '需要鼓励': 'badge-orange',
    '情绪低落': 'badge-gray',
  };
  return map[name] || 'badge-blue';
}

export function homeworkBadge(status) {
  const h = HOMEWORK[status];
  return h ? `<span class="badge ${h.cls}">${h.label}</span>` : '';
}
export function masteryBadge(level) {
  const m = MASTERY[level];
  return m ? `<span class="badge ${m.cls}">${m.label}</span>` : '';
}
export function tagsHTML(tags) {
  return (tags || []).map(t => `<span class="badge ${tagCls(t)}">${esc(t)}</span>`).join('');
}

// ---------- 图标（线性 stroke 风格，跟随文字颜色） ----------
const ICONS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',
  chart: '<path d="M4 20h16M7 20v-6M12 20V8M17 20v-9"/>',
  report: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h6"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1.5-1.5"/>',
  check: '<path d="M5 12l5 5L19 7"/>',
  logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
  students: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.4 2.8-5 5.5-5s4.9 1.6 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.4 14.4c2.3.2 3.8 1.6 4.3 4.1"/>',
  empty: '<path d="M4 6h16v12H4z"/><path d="M4 10h16"/>',
};

export function icon(name, size = 18) {
  return `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;flex:none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

// ---------- 复制到剪贴板（含降级方案，微信内置浏览器兼容）----------
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    return ok;
  }
}

// ---------- 日期工具 ----------
const pad = n => String(n).padStart(2, '0');

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function weekStartStr() {
  const d = new Date();
  const day = d.getDay() || 7; // 周一为一周开始
  return daysAgoStr(day - 1);
}

export function monthStartStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

export function daysAgoStr(n) {
  const d = new Date(Date.now() - n * 86400000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
export function weekdayOf(s) {
  return WEEK[new Date(s + 'T00:00:00').getDay()];
}

// 短日期（去掉年份，用于时间线紧凑展示）
export function shortDate(s) {
  const [, m, d] = s.split('-');
  return `${Number(m)}月${Number(d)}日`;
}
