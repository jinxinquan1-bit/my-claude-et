// 临时验证脚本：登录/注册接口全链路测试（node e2e-auth-test.js，需服务已启动）
const BASE = 'http://localhost:3001';
let failures = 0;
const check = (name, cond) => { console.log(`${cond ? '✅' : '❌'} ${name}`); if (!cond) failures++; };

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

(async () => {
  // 1. 注册（中文用户名）
  let r = await api('/api/auth/register', { method: 'POST', body: { username: '测试老师', password: '123456' } });
  check('注册成功返回 token', r.status === 200 && r.data.token && r.data.token.length === 64);
  check('注册返回用户名', r.data.user && r.data.user.username === '测试老师');

  // 2. 重复用户名
  r = await api('/api/auth/register', { method: 'POST', body: { username: '测试老师', password: '123456' } });
  check('重复用户名被拒绝(409)', r.status === 409);

  // 3. 非法用户名 / 短密码
  r = await api('/api/auth/register', { method: 'POST', body: { username: 'a', password: '123456' } });
  check('非法用户名被拒绝(400)', r.status === 400);
  r = await api('/api/auth/register', { method: 'POST', body: { username: '合法名字', password: '123' } });
  check('短密码被拒绝(400)', r.status === 400);

  // 4. 密码错误登录
  r = await api('/api/auth/login', { method: 'POST', body: { username: '测试老师', password: 'wrong123' } });
  check('密码错误被拒绝(401)', r.status === 401);

  // 5. 正确登录
  r = await api('/api/auth/login', { method: 'POST', body: { username: '测试老师', password: '123456' } });
  check('登录成功返回 token', r.status === 200 && r.data.token);
  const token = r.data.token;

  // 6. me（带 token）
  r = await api('/api/auth/me', { token });
  check('me 返回当前用户', r.status === 200 && r.data.user.username === '测试老师');

  // 7. me（无 token）
  r = await api('/api/auth/me');
  check('未登录访问 me 被拒绝(401)', r.status === 401);

  // 8. 登出后 token 失效
  r = await api('/api/auth/logout', { method: 'POST', token });
  check('登出成功', r.data.ok);
  r = await api('/api/auth/me', { token });
  check('登出后 token 失效(401)', r.status === 401);

  console.log(failures ? `\n${failures} 项失败` : '\n全部通过 🎉');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
