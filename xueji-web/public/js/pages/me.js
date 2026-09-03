// 我的：账号信息 + 报告管理入口 + 退出登录
import { api, clearToken } from '../api.js';
import { toast, esc, icon, confirmDlg, dialog } from '../components.js';

export function render() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="h1" style="margin-bottom:12px">我的</div>
    <div class="card" style="display:flex;align-items:center;gap:12px">
      <div class="avatar" style="width:52px;height:52px;font-size:20px">${esc((localStorage.getItem('xueji_username') || '师')[0])}</div>
      <div>
        <div class="name" style="font-weight:700;color:var(--text-title)">${esc(localStorage.getItem('xueji_username') || '老师')}</div>
        <div class="muted">学迹 · 记录每一步成长</div>
      </div>
    </div>
    <div class="card" style="padding:6px 0">
      <div class="list-row" id="go-reports" style="margin:0;border-radius:0">
        <div class="main"><div class="name" style="font-size:14px">${icon('report', 16)} 报告管理</div></div>
        <span class="muted">›</span>
      </div>
      <div class="divider" style="margin:0 16px"></div>
      <div class="list-row" id="about" style="margin:0;border-radius:0">
        <div class="main"><div class="name" style="font-size:14px">关于学迹</div></div>
        <span class="muted">v1.0 ›</span>
      </div>
    </div>
    <button class="btn btn-danger-outline btn-block" id="logout" style="margin-top:8px">${icon('logout', 16)} 退出登录</button>`;

  wrap.querySelector('#go-reports').addEventListener('click', () => { location.hash = '#/reports'; });
  wrap.querySelector('#about').addEventListener('click', () => {
    dialog({
      title: '关于学迹',
      html: '学迹 v1.0<br>记录每一步成长 —— 家教老师的每日学习记录与成长档案工具',
      buttons: [{ text: '知道了', cls: 'btn-primary', value: 0 }],
    });
  });
  wrap.querySelector('#logout').addEventListener('click', async () => {
    const ok = await confirmDlg({ title: '退出登录？', message: '退出后需重新登录', okText: '退出', danger: true });
    if (!ok) return;
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    clearToken();
    toast('已退出登录', 'success');
    location.hash = '#/login';
  });

  return wrap;
}
