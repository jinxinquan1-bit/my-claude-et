// 报告生成：选学生/范围 → 生成 → 展示分享链接（演示）
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('sel-student');
    sel.innerHTML = window.MOCK.students.map(s =>
      `<option>${XJ.esc(s.name)}（${XJ.esc(s.grade)}）</option>`).join('');

    // 周期切换
    document.querySelectorAll('#period-seg .seg-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        document.querySelectorAll('#period-seg .seg-btn').forEach(b => b.classList.toggle('on', b === btn));
        document.getElementById('custom-range').classList.toggle('hidden', btn.dataset.v !== 'custom');
        document.getElementById('custom-range').classList.toggle('flex', btn.dataset.v === 'custom');
      }));

    // 生成报告（演示：短暂加载后展示链接）
    const btn = document.getElementById('btn-create');
    btn.addEventListener('click', () => {
      const msg = document.getElementById('message').value.trim();
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px"></span>正在生成报告...';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">description</span>再生成一份报告';
        document.getElementById('result').classList.remove('hidden');
        document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'center' });
        XJ.toast('报告生成成功（演示）', 'success');
      }, 900);
    });

    // 复制链接
    document.getElementById('btn-copy').addEventListener('click', async () => {
      const url = document.getElementById('share-link').textContent.trim();
      try {
        await navigator.clipboard.writeText(url);
        XJ.toast('链接已复制，去微信粘贴发送给家长', 'success');
      } catch {
        XJ.toast('复制失败，请长按链接手动复制', 'error');
      }
    });
  });
})();
