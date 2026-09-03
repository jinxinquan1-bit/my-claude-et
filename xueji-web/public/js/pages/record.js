// 记一笔（核心，30 秒原则）：
// - 默认值友好：日期=今天、科目=默认科目、专注度=3 星
// - 全部字段选填，可直接保存；"按上次记录填充"；草稿自动暂存
// - 编辑模式：recordId 非空
import { api } from '../api.js';
import { currentQuery } from '../router.js';
import {
  toast, esc, icon, dialog, starsHTML, bindStars,
  HOMEWORK_SEG, MASTERY_SEG, DEFAULT_TAGS, todayStr,
} from '../components.js';

const DRAFT_KEY = 'xueji_draft';

export function render(recordId) {
  const wrap = document.createElement('div');
  wrap.className = 'record-page';
  const isEdit = recordId != null;

  // 状态
  const st = {
    studentId: Number(currentQuery().student) || null,
    focus: 3,
    tags: [],
    homework: '',
    mastery: '',
    students: [],
    subjects: [],
  };

  const q = currentQuery().student;
  if (!isEdit && !q) {
    // 无预选学生：先选学生
    wrap.innerHTML = `
      <div class="page-header"><button class="back">${icon('back', 18)}</button><div class="h1">记一笔 · 选择学生</div></div>
      <div id="picker"><div class="muted" style="padding:12px 0">加载中…</div></div>`;
    wrap.querySelector('.back').addEventListener('click', () => history.back());
    api('/students?status=active').then(d => {
      const picker = wrap.querySelector('#picker');
      const list = d.students;
      if (!list.length) {
        picker.innerHTML = `<div class="empty">${icon('students', 40)}<p>还没有在读学生<br><a href="#/students/new">去添加第一位学生 →</a></p></div>`;
        return;
      }
      picker.innerHTML = list.map(s => `
        <div class="list-row" data-id="${s.id}">
          <div class="avatar">${esc(s.name[0] || '?')}</div>
          <div class="main"><div class="name">${esc(s.name)}</div>
            <div class="meta">${[s.grade, s.default_subject && s.default_subject + '课'].filter(Boolean).join(' · ') || '点击开始记录'}</div></div>
          <span class="muted">${icon('edit', 16)}</span>
        </div>`).join('');
      picker.querySelectorAll('.list-row').forEach(row =>
        row.addEventListener('click', () => {
          st.studentId = Number(row.dataset.id);
          renderForm(wrap, st, isEdit, recordId);
        }));
    }).catch(e => toast(e.message, 'error'));
    return wrap;
  }

  renderForm(wrap, st, isEdit, recordId);
  return wrap;
}

function renderForm(wrap, st, isEdit, recordId) {
  wrap.innerHTML = `
    <div class="page-header">
      <button class="back">${icon('back', 18)}</button>
      <div class="h1">${isEdit ? '编辑记录' : '记一笔'}</div>
    </div>
    <div class="card">
      <div class="form-group" id="student-group"></div>
      <div class="form-group">
        <label>日期</label>
        <input class="input" id="f-date" type="date" value="${todayStr()}">
      </div>
      <div class="copy-last" id="copy-last-wrap" ${isEdit ? 'hidden' : ''}>
        <button class="btn btn-text" id="copy-last" style="font-size:13px">${icon('copy', 14)} 按上次记录填充</button>
      </div>
      <div class="form-group">
        <label>科目</label>
        <input class="input" id="f-subject" maxlength="50" list="subject-list" placeholder="选填">
        <datalist id="subject-list"></datalist>
      </div>
      <div class="form-group">
        <label>学习内容</label>
        <textarea class="input" id="f-content" maxlength="2000" rows="2" placeholder="这节课学了什么？（选填）"></textarea>
      </div>
      <div class="form-group">
        <label>作业完成情况</label>
        <div class="seg" id="f-homework">
          ${HOMEWORK_SEG.map(h => `<button class="seg-btn ${h.seg}" data-v="${h.v}">${h.label}</button>`).join('')}
        </div>
        <input class="input" id="f-homework-desc" maxlength="500" placeholder="作业描述，如：练习册 P32~P35" style="margin-top:8px">
      </div>
      <div class="form-group">
        <label>课堂专注度</label>
        ${starsHTML(3)}
      </div>
      <div class="form-group">
        <label>状态标签</label>
        <div class="seg" id="f-tags">
          ${DEFAULT_TAGS.map(t => `<button class="seg-btn" data-t="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>知识点与掌握程度</label>
        <input class="input" id="f-point" maxlength="100" placeholder="如：一元二次方程（选填）" style="margin-bottom:8px">
        <div class="seg" id="f-mastery">
          ${MASTERY_SEG.map(m => `<button class="seg-btn ${m.seg}" data-v="${m.v}">${m.label}</button>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>给家长的话 / 老师评语</label>
        <textarea class="input" id="f-comment" maxlength="2000" rows="2" placeholder="一句话点评，会展示给家长（选填）"></textarea>
      </div>
    </div>
    <div class="fixed-actions">
      <button class="btn btn-primary btn-block btn-lg" id="save">${isEdit ? '保存修改' : '保存记录'}</button>
    </div>`;

  wrap.querySelector('.back').addEventListener('click', () => history.back());

  // ---------- 学生选择 ----------
  const studentGroup = wrap.querySelector('#student-group');
  function renderStudentSelect() {
    if (isEdit) {
      const s = st.students.find(x => x.id === st.studentId);
      studentGroup.innerHTML = `<label>学生</label>
        <div style="padding:11px 12px;border:1px solid var(--border);border-radius:10px;background:var(--card);color:var(--text-title)">${esc(s ? s.name : '')}</div>`;
    } else {
      studentGroup.innerHTML = `<label>学生 *</label>
        <select class="input" id="f-student"></select>`;
      const sel = studentGroup.querySelector('#f-student');
      sel.innerHTML = st.students.map(s =>
        `<option value="${s.id}" ${s.id === st.studentId ? 'selected' : ''}>${esc(s.name)}${s.default_subject ? '（' + esc(s.default_subject) + '）' : ''}</option>`).join('');
      sel.addEventListener('change', () => {
        st.studentId = Number(sel.value);
        applyStudentDefaults();
        restoreDraft();
      });
    }
  }

  // 默认科目 + 草稿
  function applyStudentDefaults() {
    const s = st.students.find(x => x.id === st.studentId);
    if (s && s.default_subject && !wrap.querySelector('#f-subject').value) {
      wrap.querySelector('#f-subject').value = s.default_subject;
    }
  }

  function restoreDraft() {
    if (isEdit) return;
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      if (d && d.student_id === st.studentId && d.ts > Date.now() - 86400000) {
        const f = d.fields;
        if (f) {
          wrap.querySelector('#f-date').value = f.record_date || todayStr();
          if (f.subject) wrap.querySelector('#f-subject').value = f.subject;
          if (f.content) wrap.querySelector('#f-content').value = f.content;
          if (f.homework_status) setHomework(f.homework_status);
          if (f.homework_desc) wrap.querySelector('#f-homework-desc').value = f.homework_desc;
          if (f.focus) setFocus(f.focus);
          if (f.knowledge_point) wrap.querySelector('#f-point').value = f.knowledge_point;
          if (f.mastery_level) setMastery(f.mastery_level);
          if (f.comment) wrap.querySelector('#f-comment').value = f.comment;
          if (f.tags && f.tags.length) {
            st.tags = f.tags;
            wrap.querySelectorAll('#f-tags .seg-btn').forEach(b => b.classList.toggle('on', st.tags.includes(b.dataset.t)));
          }
          toast('已恢复上次未保存的草稿', 'success');
        }
        sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch {}
  }

  // ---------- 交互组件 ----------
  function setHomework(v) {
    st.homework = v;
    wrap.querySelectorAll('#f-homework .seg-btn').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  }
  function setMastery(v) {
    st.mastery = v;
    wrap.querySelectorAll('#f-mastery .seg-btn').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  }
  function setFocus(v) {
    st.focus = v;
    const stars = wrap.querySelector('.stars');
    stars.dataset.value = v;
    stars.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', Number(b.dataset.star) <= v);
      b.classList.toggle('off', Number(b.dataset.star) > v);
    });
  }

  bindStars(wrap, v => { st.focus = v; });
  wrap.querySelectorAll('#f-homework .seg-btn').forEach(b =>
    b.addEventListener('click', () => setHomework(b.dataset.v === st.homework ? '' : b.dataset.v)));
  wrap.querySelectorAll('#f-mastery .seg-btn').forEach(b =>
    b.addEventListener('click', () => setMastery(b.dataset.v === st.mastery ? '' : b.dataset.v)));
  wrap.querySelectorAll('#f-tags .seg-btn').forEach(b =>
    b.addEventListener('click', () => {
      const t = b.dataset.t;
      const i = st.tags.indexOf(t);
      if (i >= 0) st.tags.splice(i, 1); else if (st.tags.length < 10) st.tags.push(t);
      b.classList.toggle('on', i < 0);
    }));

  // 按上次记录填充
  wrap.querySelector('#copy-last').addEventListener('click', async () => {
    if (!st.studentId) return toast('请先选择学生', 'error');
    try {
      const d = await api('/records/last?student_id=' + st.studentId);
      if (!d.record) return toast('该学生还没有历史记录', 'error');
      const r = d.record;
      if (r.subject) wrap.querySelector('#f-subject').value = r.subject;
      if (r.content) wrap.querySelector('#f-content').value = r.content;
      setHomework(r.homework_status);
      if (r.homework_desc) wrap.querySelector('#f-homework-desc').value = r.homework_desc;
      setFocus(r.focus);
      if (r.knowledge_point) wrap.querySelector('#f-point').value = r.knowledge_point;
      setMastery(r.mastery_level);
      st.tags = (r.tags || []).slice();
      wrap.querySelectorAll('#f-tags .seg-btn').forEach(b => b.classList.toggle('on', st.tags.includes(b.dataset.t)));
      toast('已按上次记录填充，可继续修改', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  });

  // 草稿自动暂存（弱网/误关不丢内容，PRD 可用性要求）
  function saveDraft() {
    if (isEdit) return;
    if (!st.studentId) return;
    const fields = {
      record_date: wrap.querySelector('#f-date').value,
      subject: wrap.querySelector('#f-subject').value.trim(),
      content: wrap.querySelector('#f-content').value.trim(),
      homework_status: st.homework,
      homework_desc: wrap.querySelector('#f-homework-desc').value.trim(),
      focus: st.focus,
      knowledge_point: wrap.querySelector('#f-point').value.trim(),
      mastery_level: st.mastery,
      comment: wrap.querySelector('#f-comment').value.trim(),
      tags: st.tags,
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ student_id: st.studentId, ts: Date.now(), fields }));
  }
  wrap.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', saveDraft);
    el.addEventListener('change', saveDraft);
  });

  // 保存
  wrap.querySelector('#save').addEventListener('click', async () => {
    if (!st.studentId) return toast('请选择学生', 'error');
    const date = wrap.querySelector('#f-date').value;
    if (!date) return toast('请选择日期', 'error');
    const body = {
      student_id: st.studentId,
      record_date: date,
      subject: wrap.querySelector('#f-subject').value.trim(),
      content: wrap.querySelector('#f-content').value.trim(),
      homework_status: st.homework,
      homework_desc: wrap.querySelector('#f-homework-desc').value.trim(),
      focus: st.focus,
      tags: st.tags,
      knowledge_point: wrap.querySelector('#f-point').value.trim(),
      mastery_level: st.mastery,
      comment: wrap.querySelector('#f-comment').value.trim(),
    };
    const btn = wrap.querySelector('#save');
    btn.disabled = true;
    try {
      if (isEdit) {
        await api('/records/' + recordId, { method: 'PUT', body });
        toast('已保存', 'success');
        location.hash = '#/records/' + recordId;
      } else {
        const d = await api('/records', { method: 'POST', body });
        sessionStorage.removeItem(DRAFT_KEY);
        const choice = await dialog({
          title: '保存成功 ✓',
          html: '这条学习记录已保存',
          buttons: [
            { text: '继续记录下一位', cls: 'btn-primary', value: 'next' },
            { text: '查看该学生', cls: 'btn-outline', value: 'view' },
            { text: '完成', cls: 'btn-text', value: 'done' },
          ],
        });
        if (choice === 'next') location.hash = '#/record';
        else if (choice === 'view') location.hash = '#/students/' + st.studentId;
        else if (choice === 'done') history.back();
        else btn.disabled = false; // 点遮罩关闭：留在本页可继续修改
      }
    } catch (e) {
      toast(e.message, 'error');
      btn.disabled = false;
    }
  });

  // ---------- 加载数据 ----------
  async function init() {
    try {
      const d = await api('/students?status='); // 全部学生（编辑时可能已停课）
      st.students = d.students;
      st.subjects = [...new Set(d.students.map(s => s.default_subject).filter(Boolean))];
      const dl = wrap.querySelector('#subject-list');
      dl.innerHTML = st.subjects.map(s => `<option value="${esc(s)}">`).join('');

      if (isEdit) {
        const rd = await api('/records/' + recordId);
        st.studentId = rd.record.student_id;
        const r = rd.record;
        wrap.querySelector('#f-date').value = r.record_date;
        if (r.subject) wrap.querySelector('#f-subject').value = r.subject;
        if (r.content) wrap.querySelector('#f-content').value = r.content;
        setHomework(r.homework_status);
        if (r.homework_desc) wrap.querySelector('#f-homework-desc').value = r.homework_desc;
        setFocus(r.focus);
        if (r.knowledge_point) wrap.querySelector('#f-point').value = r.knowledge_point;
        setMastery(r.mastery_level);
        if (r.comment) wrap.querySelector('#f-comment').value = r.comment;
        st.tags = (r.tags || []).slice();
        wrap.querySelectorAll('#f-tags .seg-btn').forEach(b => b.classList.toggle('on', st.tags.includes(b.dataset.t)));
      }
      renderStudentSelect();
      if (!isEdit) {
        applyStudentDefaults();
        restoreDraft();
      }
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  init();
}
