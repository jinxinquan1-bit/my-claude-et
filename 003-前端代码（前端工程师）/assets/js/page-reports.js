// 报告管理：卡片列表 + 复制/撤销/重新生成（演示交互，状态徽章实时变化）
(function () {
  'use strict';

  const STATUS = {
    active: { label: '分享中', cls: 'bg-success-light text-success-deep' },
    revoked: { label: '已撤销', cls: 'bg-neutral-light text-neutral-tag' },
    expired: { label: '已过期', cls: 'bg-warning-light text-warning-text' },
  };

  function render() {
    const list = document.getElementById('report-list');
    list.innerHTML = window.MOCK.reports.map((r, i) => {
      const st = STATUS[r.status];
      const active = r.status === 'active';
      return `
      <div class="bg-card-white rounded-2xl shadow-level-1 border border-border-light p-5 md:p-6" data-idx="${i}">
        <div class="flex flex-wrap items-center gap-3">
          <span class="avatar-initial w-10 h-10 rounded-full text-body-md" data-initial="${XJ.esc(r.student)}"></span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-title-md font-semibold text-text-main">${XJ.esc(r.student)}</span>
              <span class="text-label-sm text-text-muted">${XJ.esc(r.grade)}</span>
              <span class="text-label-sm px-2 py-0.5 rounded-full ${st.cls}" data-role="status">${st.label}</span>
            </div>
            <div class="text-label-md text-text-muted mt-1">${XJ.esc(r.period)} · 生成于 ${XJ.esc(r.created)}</div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2.5 mt-4">
          ${active ? `
          <button class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary text-primary hover:bg-primary-light text-body-sm transition-colors tap-highlight" data-act="copy">
            <span class="material-symbols-outlined text-[16px]">content_copy</span>复制链接
          </button>
          <button class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-danger text-danger hover:bg-danger-light text-body-sm transition-colors tap-highlight" data-act="revoke">
            <span class="material-symbols-outlined text-[16px]">link_off</span>撤销
          </button>` : ''}
          <button class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-light text-text-body hover:bg-app-bg text-body-sm transition-colors tap-highlight" data-act="reissue">
            <span class="material-symbols-outlined text-[16px]">refresh</span>重新生成
          </button>
          <a href="report-share.html" class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-light text-text-body hover:bg-app-bg text-body-sm transition-colors">
            <span class="material-symbols-outlined text-[16px]">visibility</span>预览
          </a>
        </div>
      </div>`;
    }).join('');

    document.querySelectorAll('.avatar-initial[data-initial]').forEach(el => {
      el.textContent = (el.dataset.initial || '?').charAt(0);
    });

    list.querySelectorAll('[data-act]').forEach(btn =>
      btn.addEventListener('click', () => {
        const card = btn.closest('[data-idx]');
        const r = window.MOCK.reports[Number(card.dataset.idx)];
        const act = btn.dataset.act;
        if (act === 'copy') {
          XJ.toast('链接已复制，去微信粘贴发送给家长', 'success');
        } else if (act === 'revoke') {
          XJ.confirm({ title: '撤销分享链接？', message: '撤销后家长将无法再打开该报告', okText: '撤销', danger: true }).then(ok => {
            if (!ok) return;
            r.status = 'revoked';
            XJ.toast('已撤销（演示）', 'success');
            render();
          });
        } else if (act === 'reissue') {
          r.status = 'active';
          XJ.toast('已生成新链接（旧链接已失效，演示）', 'success');
          render();
        }
      }));
  }

  document.addEventListener('DOMContentLoaded', render);
})();
