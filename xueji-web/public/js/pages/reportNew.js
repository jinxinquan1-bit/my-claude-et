// 生成学习报告：选学生 + 时间范围 + 老师寄语 → 快照 + 分享链接
import { api } from '../api.js';
import { currentQuery } from '../router.js';
import { toast, esc, icon, copyText, todayStr, weekStartStr, monthStartStr } from '../components.js';

export function render() {
  const wrap = document.createElement('div');
  const preselect = Number(currentQuery().student) || null;
  wrap.innerHTML = `
    <div class="page-header">
      <button class="back">${icon('back', 18)}</button>
      <div class="h1">生成学习报告</div>
    </div>
    <div class="card">
      <div class="form-group">
        <label>选择学生 *</label>
        <select class="input" id="sel-student"></select>
      </div>
      <div class="form-group">
        <label>时间范围</label>
        <div class="seg" id="sel-period">
          <button class="seg-btn on" data-v="week">本周</button>
          <button class="seg-btn" data-v="month">本月</button>
          <button class="seg-btn" data-v="custom">自定义</button>
        </div>
      </div>
      <div id="custom-range" hidden style="display:flex;gap:8px">
        <input class="input" id="range-from" type="date" value="${weekStartStr()}">
        <input class="input" id="range-to" type="date" value="${todayStr()}">
      </div>
      <div class="form-group" style="margin-top:14px">
        <label>老师寄语（会展示给家长）</label>
        <textarea class="input" id="message" maxlength="1000" rows="3" placeholder="如：本周孩子状态不错，坚持完成作业，应用题还需加强练习"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="submit">${icon('report', 16)} 生成报告并获取分享链接</button>
    </div>
    <div id="result"></div>`;

  wrap.querySelector('.back').addEventListener('click', () => history.back());

  let period = 'week';
  let from = weekStartStr(), to = todayStr();

  // 学生列表
  api('/students?status=').then(d => {
    const sel = wrap.querySelector('#sel-student');
    sel.innerHTML = d.students.map(s =>
      `<option value="${s.id}" ${s.id === preselect ? 'selected' : ''}>${esc(s.name)}${s.grade ? '（' + esc(s.grade) + '）' : ''}</option>`).join('')
      || `<option value="">暂无学生</option>`;
  }).catch(e => toast(e.message, 'error'));

  // 周期
  wrap.querySelectorAll('#sel-period .seg-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('#sel-period .seg-btn').forEach(b => b.classList.toggle('on', b === btn));
      period = btn.dataset.v;
      const custom = wrap.querySelector('#custom-range');
      if (period === 'custom') { custom.hidden = false; custom.style.display = 'flex'; }
      else {
        custom.hidden = true; custom.style.display = 'none';
        from = period === 'week' ? weekStartStr() : monthStartStr();
        to = todayStr();
      }
    }));
  wrap.querySelectorAll('#custom-range input').forEach(inp =>
    inp.addEventListener('change', () => {
      from = wrap.querySelector('#range-from').value;
      to = wrap.querySelector('#range-to').value;
    }));

  wrap.querySelector('#submit').addEventListener('click', async () => {
    const sid = Number(wrap.querySelector('#sel-student').value);
    if (!sid) return toast('请选择学生', 'error');
    if (period === 'custom') {
      from = wrap.querySelector('#range-from').value;
      to = wrap.querySelector('#range-to').value;
      if (!from || !to || from > to) return toast('请选择正确的时间范围', 'error');
    }
    const btn = wrap.querySelector('#submit');
    btn.disabled = true;
    try {
      const d = await api('/reports', {
        method: 'POST',
        body: { student_id: sid, period_start: from, period_end: to, teacher_message: wrap.querySelector('#message').value.trim() },
      });
      const url = `${location.origin}${d.shareUrl}`;
      wrap.querySelector('#result').innerHTML = `
        <div class="card" style="border:1px solid var(--primary-border);background:var(--primary-light)">
          <div class="flex-between">
            <div class="h2">报告已生成 ✓</div>
            <span class="muted">7 天内有效</span>
          </div>
          <div class="share-link-box" style="background:#fff">${esc(url)}</div>
          <div style="display:flex;gap:10px;margin-top:12px">
            <button class="btn btn-primary" id="copy" style="flex:1">${icon('copy', 15)} 复制链接</button>
            <button class="btn btn-outline" id="open" style="flex:1">预览报告</button>
          </div>
          <div class="muted" style="margin-top:10px">💡 把链接粘贴到微信发给家长，家长点开即可查看，无需注册登录</div>
        </div>`;
      wrap.querySelector('#copy').addEventListener('click', async () => {
        const ok = await copyText(url);
        toast(ok ? '链接已复制，去微信粘贴发送给家长' : '复制失败，请长按链接手动复制', ok ? 'success' : 'error');
      });
      wrap.querySelector('#open').addEventListener('click', () => window.open(d.shareUrl, '_blank'));
      btn.disabled = false;
      btn.textContent = '再生成一份报告';
    } catch (e) {
      toast(e.message, 'error');
      btn.disabled = false;
    }
  });

  return wrap;
}
