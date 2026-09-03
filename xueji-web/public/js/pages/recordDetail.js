// 记录详情：完整信息 + 编辑 / 删除
import { api } from '../api.js';
import {
  toast, esc, icon, starsHTML, homeworkBadge, masteryBadge, tagsHTML,
  confirmDlg, weekdayOf,
} from '../components.js';

export function render(id) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="page-header">
      <button class="back">${icon('back', 18)}</button>
      <div class="h1">记录详情</div>
    </div>
    <div id="body"><div class="muted" style="padding:16px 0">加载中…</div></div>`;

  wrap.querySelector('.back').addEventListener('click', () => history.back());

  async function load() {
    try {
      const { record: r } = await api('/records/' + id);
      const body = wrap.querySelector('#body');
      body.innerHTML = `
        <div class="card">
          <div class="tl-head" style="margin-bottom:12px">
            <span class="badge badge-blue">${esc(r.student_name)}</span>
            ${r.subject ? `<span class="badge badge-gray">${esc(r.subject)}</span>` : ''}
            ${homeworkBadge(r.homework_status)}
          </div>
          <dl class="record-view">
            <dt>日期</dt><dd>${r.record_date} ${weekdayOf(r.record_date)}</dd>
            ${r.content ? `<dt>学习内容</dt><dd>${esc(r.content)}</dd>` : ''}
            ${r.homework_desc ? `<dt>作业</dt><dd>${esc(r.homework_desc)}</dd>` : ''}
            <dt>课堂专注度</dt><dd>${starsHTML(r.focus)}</dd>
            ${r.tags && r.tags.length ? `<dt>状态标签</dt><dd>${tagsHTML(r.tags)}</dd>` : ''}
            ${r.knowledge_point ? `<dt>知识点</dt><dd>${esc(r.knowledge_point)} ${masteryBadge(r.mastery_level)}</dd>` : ''}
            ${r.comment ? `<dt>给家长的话</dt><dd>${esc(r.comment)}</dd>` : ''}
          </dl>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-outline" id="edit" style="flex:1">${icon('edit', 16)} 编辑</button>
          <button class="btn btn-danger-outline" id="del" style="flex:1">${icon('trash', 16)} 删除</button>
        </div>`;

      body.querySelector('#edit').addEventListener('click', () => { location.hash = '#/record/' + id + '/edit'; });
      body.querySelector('#del').addEventListener('click', async () => {
        const ok = await confirmDlg({ title: '删除这条记录？', message: '删除后不可恢复', okText: '删除', danger: true });
        if (!ok) return;
        try {
          await api('/records/' + id, { method: 'DELETE' });
          toast('已删除', 'success');
          location.hash = '#/students/' + r.student_id;
        } catch (e) {
          toast(e.message, 'error');
        }
      });
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  load();
  return wrap;
}
