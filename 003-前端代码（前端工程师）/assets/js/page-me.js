// 我的：账号展示 + 关于弹窗 + 退出登录（演示）
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const demoUser = localStorage.getItem('xueji_demo_user');
    if (demoUser) {
      document.getElementById('user-name').textContent = demoUser;
      document.querySelector('.avatar-initial[data-initial]').dataset.initial = demoUser;
      document.querySelector('.avatar-initial[data-initial]').textContent = demoUser.charAt(0);
    }

    document.getElementById('about').addEventListener('click', () => {
      XJ.dialog({
        title: '关于学迹',
        html: '学迹 v1.0.1<br>记录每一步成长 —— 家教老师的每日学习记录与成长档案工具',
        buttons: [{ text: '知道了', cls: 'bg-primary text-white hover:bg-primary-hover', value: 0 }],
      });
    });

    document.getElementById('logout').addEventListener('click', () => {
      XJ.confirm({ title: '退出登录？', message: '退出后需重新登录', okText: '退出', danger: true }).then(ok => {
        if (!ok) return;
        localStorage.removeItem('xueji_demo_user');
        XJ.toast('已退出登录', 'success');
        setTimeout(() => { location.href = 'index.html'; }, 500);
      });
    });
  });
})();
