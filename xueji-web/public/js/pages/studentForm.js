// 添加 / 编辑学生：仅姓名必填，其余选填（10 秒可完成添加）
import { api } from '../api.js';
import { toast, esc, icon } from '../components.js';

export function render(id) {
  const isEdit = id != null;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="page-header">
      <button class="back">${icon('back', 18)}</button>
      <div class="h1">${isEdit ? '编辑学生' : '添加学生'}</div>
    </div>
    <div class="card">
      <div class="form-group">
        <label>姓名 *</label>
        <input class="input" id="f-name" maxlength="30" placeholder="学生姓名">
      </div>
      <div class="form-group">
        <label>称呼 / 昵称</label>
        <input class="input" id="f-nickname" maxlength="30" placeholder="选填">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>年级</label>
          <input class="input" id="f-grade" maxlength="20" placeholder="如：初二">
        </div>
        <div class="form-group">
          <label>默认科目</label>
          <input class="input" id="f-subject" maxlength="20" placeholder="如：数学">
        </div>
      </div>
      <div class="form-group">
        <label>学校</label>
        <input class="input" id="f-school" maxlength="50" placeholder="选填">
      </div>
      <div class="form-group">
        <label>课程安排</label>
        <input class="input" id="f-schedule" maxlength="100" placeholder="如：每周二、四 19:00（选填）">
      </div>
      <div class="form-group">
        <label>备注</label>
        <textarea class="input" id="f-remark" maxlength="500" placeholder="选填"></textarea>
      </div>
      ${isEdit ? `
      <div class="form-group">
        <label>状态</label>
        <div class="seg" id="f-status">
          <button class="seg-btn" data-status="active">在读</button>
          <button class="seg-btn" data-status="paused">停课</button>
          <button class="seg-btn" data-status="finished">结课</button>
        </div>
      </div>` : ''}
    </div>
    <div class="fixed-actions">
      <button class="btn btn-primary btn-block btn-lg" id="save">保存</button>
    </div>`;

  wrap.querySelector('.back').addEventListener('click', () => history.back());

  let status = 'active';
  if (isEdit) {
    wrap.querySelectorAll('#f-status .seg-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('#f-status .seg-btn').forEach(b => b.classList.toggle('on', b === btn));
        status = btn.dataset.status;
      }));
    // 加载现有数据
    api('/students/' + id).then(({ student }) => {
      wrap.querySelector('#f-name').value = student.name;
      wrap.querySelector('#f-nickname').value = student.nickname || '';
      wrap.querySelector('#f-grade').value = student.grade || '';
      wrap.querySelector('#f-subject').value = student.default_subject || '';
      wrap.querySelector('#f-school').value = student.school || '';
      wrap.querySelector('#f-schedule').value = student.schedule || '';
      wrap.querySelector('#f-remark').value = student.remark || '';
      status = student.status;
      wrap.querySelectorAll('#f-status .seg-btn').forEach(b => b.classList.toggle('on', b.dataset.status === status));
    }).catch(e => toast(e.message, 'error'));
  }

  wrap.querySelector('#save').addEventListener('click', async () => {
    const name = wrap.querySelector('#f-name').value.trim();
    if (!name) return toast('请填写学生姓名', 'error');
    const body = {
      name,
      nickname: wrap.querySelector('#f-nickname').value.trim(),
      grade: wrap.querySelector('#f-grade').value.trim(),
      default_subject: wrap.querySelector('#f-subject').value.trim(),
      school: wrap.querySelector('#f-school').value.trim(),
      schedule: wrap.querySelector('#f-schedule').value.trim(),
      remark: wrap.querySelector('#f-remark').value.trim(),
      status,
    };
    const btn = wrap.querySelector('#save');
    btn.disabled = true;
    try {
      if (isEdit) {
        await api('/students/' + id, { method: 'PUT', body });
        toast('已保存', 'success');
        location.hash = '#/students/' + id;
      } else {
        const d = await api('/students', { method: 'POST', body });
        toast('添加成功', 'success');
        location.hash = '#/students/' + d.id;
      }
    } catch (e) {
      toast(e.message, 'error');
      btn.disabled = false;
    }
  });

  return wrap;
}
