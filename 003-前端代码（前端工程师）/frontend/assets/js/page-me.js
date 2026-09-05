// 我的：账号展示 + 关于弹窗 + 退出登录（已对接后端 /api/auth/logout）
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const username = XJ_API.getUser();
    if (username) {
      document.getElementById('user-name').textContent = username;
      document.querySelector('.avatar-initial[data-initial]').dataset.initial = username;
      document.querySelector('.avatar-initial[data-initial]').textContent = username.charAt(0);
    }

    document.getElementById('about').addEventListener('click', () => {
      XJ.dialog({
        title: '关于学迹',
        html: '学迹 v1.0.1<br>记录每一步成长 —— 家教老师的每日学习记录与成长档案工具',
        buttons: [{ text: '知道了', cls: 'bg-primary text-white hover:bg-primary-hover', value: 0 }],
      });
    });

    document.getElementById('logout').addEventListener('click', () => {
      XJ.confirm({ title: '退出登录？', message: '退出后需重新登录', okText: '退出', danger: true }).then(async ok => {
        if (!ok) return;
        try { await XJ_API.api('/api/auth/logout', { method: 'POST' }); } catch {}
        XJ_API.clearToken();
        XJ.toast('已退出登录', 'success');
        setTimeout(() => { location.href = 'index.html'; }, 500);
      });
    });
  });
})();
