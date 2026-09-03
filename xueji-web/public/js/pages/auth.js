// 登录 / 注册页（V1.0.1：用户名 + 密码）
import { api, setToken } from '../api.js';
import { toast, esc } from '../components.js';

export function render(mode) {
  const isLogin = mode === 'login';
  const wrap = document.createElement('div');
  wrap.className = 'auth-wrap';
  wrap.innerHTML = `
    <div class="auth-logo">
      <div class="logo-mark">迹</div>
      <h1>学迹</h1>
      <p>记录每一步成长</p>
    </div>
    <div class="card">
      <div class="form-group">
        <label>用户名</label>
        <input class="input" id="username" maxlength="20" autocapitalize="off"
          placeholder="2~20 位中文、英文、数字或下划线" value="${esc(localStorage.getItem('xueji_username') || '')}">
      </div>
      <div class="form-group">
        <label>密码</label>
        <input class="input" id="password" type="password" placeholder="至少 6 位">
      </div>
      ${isLogin ? '' : `
      <div class="form-group">
        <label>确认密码</label>
        <input class="input" id="password2" type="password" placeholder="再次输入密码">
      </div>`}
      <button class="btn btn-primary btn-block btn-lg" id="submit">${isLogin ? '登录' : '注册并登录'}</button>
    </div>
    <div class="auth-foot">
      ${isLogin ? `还没有账号？<a href="#/register">立即注册</a>` : `已有账号？<a href="#/login">去登录</a>`}
    </div>`;

  wrap.querySelector('#submit').addEventListener('click', async () => {
    const username = wrap.querySelector('#username').value.trim();
    const password = wrap.querySelector('#password').value;
    if (!/^[a-zA-Z0-9_一-龥]{2,20}$/.test(username)) {
      return toast('用户名需为 2~20 位中文、英文、数字或下划线', 'error');
    }
    if (password.length < 6) return toast('密码至少 6 位', 'error');
    if (!isLogin && wrap.querySelector('#password2').value !== password) {
      return toast('两次输入的密码不一致', 'error');
    }
    const btn = wrap.querySelector('#submit');
    btn.disabled = true;
    try {
      const data = await api(isLogin ? '/auth/login' : '/auth/register', {
        method: 'POST', body: { username, password },
      });
      setToken(data.token);
      localStorage.setItem('xueji_username', data.user.username);
      toast(isLogin ? '欢迎回来' : '注册成功，欢迎使用学迹', 'success');
      location.hash = '#/';
    } catch (e) {
      toast(e.message, 'error');
      btn.disabled = false;
    }
  });

  return wrap;
}
