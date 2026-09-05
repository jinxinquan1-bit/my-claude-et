// 登录/注册页交互（已对接后端）：密码显隐、登录/注册模式切换、真实接口调用
// 后端接口：POST /api/auth/login、POST /api/auth/register（见 backend/README.md）
(function () {
  'use strict';

  const USERNAME_RE = /^[a-zA-Z0-9_一-龥]{2,20}$/;
  let isLogin = true;

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const password2 = document.getElementById('password2');
    const registerOnly = document.getElementById('register-only');
    const submit = document.getElementById('submit');
    const switchMode = document.getElementById('switch-mode');
    const switchTip = document.getElementById('switch-tip');
    const forgot = document.getElementById('forgot');

    // 已登录则直接进首页
    if (XJ_API.getToken()) { location.href = 'home.html'; return; }

    // 密码显隐切换
    document.getElementById('toggle-pwd').addEventListener('click', function () {
      const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
      password.setAttribute('type', type);
      this.querySelector('span').textContent = type === 'password' ? 'visibility_off' : 'visibility';
    });

    // 登录/注册模式切换
    switchMode.addEventListener('click', () => {
      isLogin = !isLogin;
      registerOnly.classList.toggle('hidden', isLogin);
      submit.textContent = isLogin ? '登录' : '注册并登录';
      switchTip.textContent = isLogin ? '还没有账号？' : '已有账号？';
      switchMode.textContent = isLogin ? '立即注册' : '去登录';
      password2.value = '';
    });

    // 忘记密码（V1.1 规划）
    forgot.addEventListener('click', () => XJ.toast('「找回密码」V1.1 规划中，敬请期待'));

    // 提交：真实接口调用
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = username.value.trim();
      const pwd = password.value;
      // 前端基础校验（后端还有二次校验）
      if (!USERNAME_RE.test(name)) {
        return XJ.toast('用户名需为 2~20 位中文、英文、数字或下划线', 'error');
      }
      if (pwd.length < 6) return XJ.toast('密码至少 6 位', 'error');
      if (!isLogin && password2.value !== pwd) return XJ.toast('两次输入的密码不一致', 'error');

      submit.disabled = true;
      const originalText = submit.textContent;
      submit.textContent = isLogin ? '登录中...' : '注册中...';
      try {
        const data = await XJ_API.api(isLogin ? '/api/auth/login' : '/api/auth/register', {
          method: 'POST',
          body: { username: name, password: pwd },
        });
        XJ_API.setToken(data.token);
        XJ_API.setUser(data.user.username);
        XJ.toast(isLogin ? '欢迎回来，' + name : '注册成功，欢迎使用学迹', 'success');
        setTimeout(() => { location.href = 'home.html'; }, 500);
      } catch (err) {
        XJ.toast(err.message, 'error'); // 后端返回的错误信息（如"该用户名已被注册"）直接展示
        submit.disabled = false;
        submit.textContent = originalText;
      }
    });
  });
})();
