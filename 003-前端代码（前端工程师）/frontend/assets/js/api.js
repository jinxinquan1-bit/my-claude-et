// 后端 API 封装层：token 存取 + fetch 封装 + 401 自动跳登录
// 后端地址：003/backend（Express，端口 3001，已开启 CORS）
const API_BASE = 'http://localhost:3001';

const TOKEN_KEY = 'xueji_token';
const USER_KEY = 'xueji_username';

window.XJ_API = (function () {
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }

  function getUser() { return localStorage.getItem(USER_KEY) || ''; }
  function setUser(name) { localStorage.setItem(USER_KEY, name); }

  async function api(path, { method = 'GET', body } = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let res;
    try {
      res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error('无法连接后端服务（请先 npm start 启动 backend）');
    }
    let data = null;
    try { data = await res.json(); } catch {}
    if (res.status === 401) {
      clearToken();
      throw new Error(data?.error || '登录已过期，请重新登录');
    }
    if (!res.ok) throw new Error(data?.error || '请求失败，请稍后重试');
    return data;
  }

  // 校验登录态（token 是否仍有效），无效返回 false
  async function isLoggedIn() {
    if (!getToken()) return false;
    try {
      const d = await api('/api/auth/me');
      setUser(d.user.username);
      return true;
    } catch {
      clearToken();
      return false;
    }
  }

  return { api, getToken, setToken, clearToken, getUser, setUser, isLoggedIn };
})();
