// 临时端到端测试：模拟浏览器行为（UTF-8），覆盖核心链路
// 用法：node e2e-test.js（需服务已启动）
const BASE = 'http://localhost:3000';

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? '✅' : '❌'} ${name}`);
  if (!cond) failures++;
}

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, {
    method, headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

(async () => {
  // 1. 注册 + 中文用户名
  let r = await api('/api/auth/register', { method: 'POST', body: { username: '王老师', password: '123456' } });
  check('注册成功', r.status === 200 && r.data.token);
  const token = r.data.token;
  check('用户名中文正确', r.data.user.username === '王老师');

  // 1.1 重复用户名被拒绝 + 用户名登录
  r = await api('/api/auth/register', { method: 'POST', body: { username: '王老师', password: '123456' } });
  check('重复用户名被拒绝', r.status === 409);
  r = await api('/api/auth/login', { method: 'POST', body: { username: '王老师', password: '123456' } });
  check('用户名密码登录成功', r.status === 200 && r.data.token);

  // 2. 添加学生（中文）
  r = await api('/api/students', { method: 'POST', token, body: { name: '小明', grade: '初二', school: '实验中学', default_subject: '数学' } });
  check('添加学生成功', r.status === 200 && r.data.id === 1);
  const sid = r.data.id;

  // 3. 记一笔（中文 + 全字段）
  r = await api('/api/records', { method: 'POST', token, body: {
    student_id: sid, record_date: '2026-09-01', subject: '数学', content: '一元二次方程',
    homework_status: 'done', homework_desc: '练习册 P32', focus: 4,
    tags: ['状态很好'], knowledge_point: '一元二次方程', mastery_level: 'basic', comment: '应用题还需练习',
  } });
  check('记一笔成功', r.status === 200);
  r = await api('/api/records', { method: 'POST', token, body: {
    student_id: sid, record_date: '2026-09-02', subject: '数学', content: '二次函数',
    homework_status: 'partial', focus: 3, mastery_level: 'initial',
  } });
  check('第二条记录成功', r.status === 200);

  // 4. 按上次填充接口
  r = await api('/api/records/last?student_id=' + sid, { token });
  check('按上次填充返回记录', r.data.record && r.data.record.content === '二次函数');

  // 5. 学生详情含本月统计
  r = await api('/api/students/' + sid, { token });
  check('详情统计：2 次记录', r.data.stats.count === 2);
  check('详情统计：作业完成率 50%', r.data.stats.hwRate === 50);
  check('学生姓名中文正确', r.data.student.name === '小明');

  // 6. 今日待记录（今天已有一条，应为空；再建一个新学生应为待记录）
  r = await api('/api/students', { method: 'POST', token, body: { name: '小红', default_subject: '英语' } });
  r = await api('/api/stats/overview', { token });
  check('今日待记录含小红', r.data.pending.length === 1 && r.data.pending[0].name === '小红');
  check('近 7 天记录量正确', r.data.last7[6].count === 1);

  // 7. 生成报告（快照）+ 公开读取
  r = await api('/api/reports', { method: 'POST', token, body: {
    student_id: sid, period_start: '2026-09-01', period_end: '2026-09-30', teacher_message: '本周进步明显',
  } });
  check('生成报告成功', r.status === 200 && r.data.shareToken);
  const shareToken = r.data.shareToken;
  r = await api('/api/public/reports/' + shareToken);
  check('家长免登录可读', r.status === 200 && r.data.report.snapshot.student.name === '小明');
  check('寄语中文正确', r.data.report.teacher_message === '本周进步明显');

  // 8. 快照机制：修改原始记录后，已发报告不变
  await api('/api/records/1', { method: 'PUT', token, body: {
    student_id: sid, record_date: '2026-09-01', subject: '数学', content: '改过了', focus: 1,
  } });
  r = await api('/api/public/reports/' + shareToken);
  check('快照不受修改影响', r.data.report.snapshot.records[1].content === '一元二次方程');

  // 9. 撤销 + 重新生成
  r = await api('/api/reports/1/revoke', { method: 'POST', token });
  check('撤销成功', r.data.ok);
  r = await api('/api/public/reports/' + shareToken);
  check('撤销后链接失效', r.status === 404);
  r = await api('/api/reports/1/reissue', { method: 'POST', token });
  r = await api('/api/public/reports/' + r.data.shareToken);
  check('重新生成后新链接可用', r.status === 200);

  // 10. 越权校验：另一账号不能读该学生
  r = await api('/api/auth/register', { method: 'POST', body: { username: '李老师', password: '123456' } });
  r = await api('/api/students/1', { token: r.data.token });
  check('越权访问被拒绝', r.status === 404);

  console.log(failures ? `\n${failures} 项失败` : '\n全部通过 🎉');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
