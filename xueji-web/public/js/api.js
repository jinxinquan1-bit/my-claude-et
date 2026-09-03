// fetch 封装：token 注入 + 401 自动跳登录 + 统一错误提示
const TOKEN_KEY = 'xueji_token';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('网络异常，请检查网络后重试');
  }
  let data = null;
  try { data = await res.json(); } catch {}
  if (res.status === 401) {
    clearToken();
    location.hash = '#/login';
    throw new Error(data?.error || '登录已过期，请重新登录');
  }
  if (!res.ok) throw new Error(data?.error || '请求失败，请稍后重试');
  return data;
}
