// 记一笔：星级/分段/标签交互 + 保存三态演示（保存中 → 成功或错误）
// 原 stitch 的 _1/_3/_4/_6 四个状态变体在此收敛为单页交互
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('f-content');
    const comment = document.getElementById('f-comment');
    const errorBanner = document.getElementById('error-banner');
    const draftBadge = document.getElementById('draft-badge');

    // 专注度星级（默认 3 星）
    const starsBox = document.getElementById('focus-stars');
    starsBox.innerHTML = XJ.starsHTML(3);
    XJ.bindStars(starsBox, () => {});

    // 作业完成情况：分段控件（再点一次取消）
    document.querySelectorAll('#homework-seg .seg-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        const wasOn = btn.classList.contains('on');
        document.querySelectorAll('#homework-seg .seg-btn').forEach(b => b.classList.remove('on'));
        if (!wasOn) btn.classList.add('on');
      }));

    // 课堂表现：标签 chips 多选
    document.querySelectorAll('#tag-chips .chip-btn').forEach(btn =>
      btn.addEventListener('click', () => btn.classList.toggle('on')));

    // 存为草稿（演示：显示徽章 + 提示）
    document.getElementById('btn-draft').addEventListener('click', () => {
      draftBadge.classList.remove('hidden');
      XJ.toast('草稿已保存（本地演示）', 'success');
    });

    // 保存记录：三态演示
    document.getElementById('btn-save').addEventListener('click', () => {
      errorBanner.classList.add('hidden');
      content.classList.remove('form-error');

      // 1. 保存中：spinner 遮罩
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div>正在保存记录...';
      document.body.appendChild(overlay);

      setTimeout(() => {
        overlay.remove();
        // 2. 校验：学习内容为空 → 错误态（对应原 _3）
        if (!content.value.trim()) {
          errorBanner.classList.remove('hidden');
          content.classList.add('form-error');
          XJ.toast('保存失败：请填写学习内容', 'error');
          content.focus();
          return;
        }
        // 3. 成功态（对应原 _4）：toast + 后续操作弹窗
        XJ.toast('学习记录保存成功！', 'success');
        XJ.dialog({
          title: '保存成功 ✓',
          html: '这条学习记录已保存',
          buttons: [
            { text: '继续记录下一节', cls: 'bg-primary text-white hover:bg-primary-hover', value: 'next' },
            { text: '查看该学生', cls: 'border border-primary text-primary hover:bg-primary-light', value: 'view' },
            { text: '完成', cls: 'text-text-muted', value: 'done' },
          ],
        }).then(choice => {
          if (choice === 'next') location.href = 'record.html';
          else if (choice === 'view') location.href = 'student-detail.html';
        });
      }, 1200);
    });
  });
})();
