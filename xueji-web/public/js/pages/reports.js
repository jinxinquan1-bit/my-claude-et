// 报告管理：已生成报告列表 + 复制 / 撤销 / 重新生成链接
import { api } from '../api.js';
import { toast, esc, icon, confirmDlg, copyText } from '../components.js';

function nowStr() {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function render() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="page-header">
      <button class="back">${icon('back', 18)}</button>
      <div class="h1">报告管理</div>
    </div>
    <button class="btn btn-primary btn-block" id="new" style="margin-bottom:14px">${icon('plus', 16)} 生成新报告</button>
    <div id="list"><div class="muted" style="padding:12px 0">加载中…</div></div>`;

  wrap.querySelector('.back').addEventListener('click', () => history.back());
  wrap.querySelector('#new').addEventListener('click', () => { location.hash = '#/reports/new'; });

  async function load() {
    try {
      const d = await api('/reports');
      const list = wrap.querySelector('#list');
      if (!d.reports.length) {
        list.innerHTML = `<div class="empty">${icon('report', 40)}<p>还没有生成过报告<br>点上方按钮为家长生成第一份学习报告</p></div>`;
        return;
      }
      const now = nowStr();
      list.innerHTML = d.reports.map(r => {
        let status, cls = 'badge-gray';
        const url = r.share_token ? `${location.origin}/r/${r.share_token}` : '';
        if (!r.share_token) { status = '无链接'; }
        else if (r.revoked) { status = '已撤销'; }
        else if (r.expires_at < now) { status = '已过期'; }
        else { status = '分享中'; cls = 'badge-green'; }
        const valid = status === '分享中';
        return `
        <div class="card" data-id="${r.id}">
          <div class="flex-between">
            <div>
              <div class="name" style="font-weight:600;color:var(--text-title)">${esc(r.student_name)} ${r.grade ? '· ' + esc(r.grade) : ''}</div>
              <div class="muted" style="margin-top:2px">${r.period_start} ~ ${r.period_end} · ${r.created_at.slice(0, 16)}</div>
            </div>
            <span class="badge ${cls}">${status}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            ${valid ? `<button class="btn btn-outline" data-act="copy" style="flex:1;font-size:13px;padding:9px 10px">${icon('copy', 14)} 复制链接</button>` : ''}
            ${valid ? `<button class="btn btn-danger-outline" data-act="revoke" style="flex:1;font-size:13px;padding:9px 10px">${icon('trash', 14)} 撤销</button>` : ''}
            <button class="btn btn-text" data-act="reissue" style="flex:1;font-size:13px;padding:9px 10px">重新生成</button>
          </div>
          ${url ? `<div class="share-link-box">${esc(url)}</div>` : ''}
        </div>`;
      }).join('');

      list.querySelectorAll('[data-act]').forEach(btn =>
        btn.addEventListener('click', async () => {
          const card = btn.closest('.card');
          const id = Number(card.dataset.id);
          const act = btn.dataset.act;
          try {
            if (act === 'copy') {
              const token = card.querySelector('.share-link-box').textContent.trim();
              const ok = await copyText(token);
              toast(ok ? '链接已复制，去微信粘贴发送给家长' : '复制失败，请长按链接手动复制', ok ? 'success' : 'error');
            } else if (act === 'revoke') {
              const ok = await confirmDlg({ title: '撤销分享链接？', message: '撤销后家长将无法再打开该报告', okText: '撤销', danger: true });
              if (!ok) return;
              await api(`/reports/${id}/revoke`, { method: 'POST' });
              toast('已撤销', 'success');
              load();
            } else if (act === 'reissue') {
              const d2 = await api(`/reports/${id}/reissue`, { method: 'POST' });
              await copyText(`${location.origin}${d2.shareUrl}`);
              toast('已生成新链接并复制（旧链接已失效）', 'success');
              load();
            }
          } catch (e) {
            toast(e.message, 'error');
          }
        }));
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  load();
  return wrap;
}
