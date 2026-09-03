// 手写轻量 SVG 图表（无第三方依赖）
// 色板经 dataviz skill 校验器验证：
// - 作业环图：已完成 #15803D / 部分完成 #F59E0B / 未完成 #EF4444（CVD ΔE 13.9 ✓）
// - 掌握度蓝阶（单色相、明度单调渐深）：#60A5FA → #3B82F6 → #2563EB → #1E40AF
// - 专注度趋势：主蓝 #3B82F6 单序列（标题即图例，无需图例框）
// 标记规格：2px 线、8px 直径标记 + 2px 表面白环、4px 圆角数据端、2px 段间缝隙、
//           悬停十字线 + 提示层、文字统一中性色（不用系列色）

export const PALETTE = {
  primary: '#3B82F6',
  homework: { done: '#15803D', partial: '#F59E0B', undone: '#EF4444' },
  mastery: ['#60A5FA', '#3B82F6', '#2563EB', '#1E40AF'], // 未掌握→熟练掌握
  ink: '#111827', inkSec: '#6B7280', inkMuted: '#9CA3AF',
  grid: '#E5E7EB', track: '#F1F5F9',
};

function emptyHTML(msg) {
  return `<div class="empty" style="padding:24px 8px"><p>${msg}</p></div>`;
}

// ---------- 折线图（单序列，如专注度趋势）----------
// points: [{ date: 'YYYY-MM-DD', value: number }]
export function lineChart(el, points, { min = 1, max = 5, ticks = [1, 2, 3, 4, 5] } = {}) {
  if (!points || !points.length) { el.innerHTML = emptyHTML('该时间段暂无数据'); return; }
  const W = 320, H = 190;
  const padL = 26, padR = 10, padT = 14, padB = 26;
  const iw = W - padL - padR, ih = H - padT - padB;
  const x = i => padL + (points.length === 1 ? iw / 2 : iw * i / (points.length - 1));
  const y = v => padT + ih * (1 - (v - min) / (max - min));

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="专注度趋势">`;
  // 隐性网格 + y 轴刻度
  ticks.forEach(t => {
    svg += `<line x1="${padL}" y1="${y(t).toFixed(1)}" x2="${W - padR}" y2="${y(t).toFixed(1)}" stroke="${PALETTE.grid}" stroke-width="1"/>`;
    svg += `<text x="${padL - 6}" y="${(y(t) + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="${PALETTE.inkMuted}">${t}</text>`;
  });
  // x 轴日期（稀疏显示）
  const step = Math.max(1, Math.ceil(points.length / 5));
  points.forEach((p, i) => {
    if (i % step === 0 || i === points.length - 1) {
      svg += `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="${PALETTE.inkMuted}">${p.date.slice(5)}</text>`;
    }
  });
  // 2px 折线（圆头连接）
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join('');
  svg += `<path d="${d}" fill="none" stroke="${PALETTE.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  // 8px 直径标记 + 2px 表面白环
  points.forEach((p, i) => {
    svg += `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4" fill="${PALETTE.primary}" stroke="#FFFFFF" stroke-width="2" data-i="${i}"/>`;
  });
  // 悬停层：十字线 + 提示
  svg += `<line id="cross" x1="0" y1="${padT}" x2="0" y2="${H - padB}" stroke="${PALETTE.inkMuted}" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>`;
  svg += `<g id="tip" visibility="hidden">
    <rect rx="6" width="118" height="34" fill="rgba(17,24,39,.92)"/>
    <text id="tip-d" x="8" y="14" font-size="11" fill="#fff"></text>
    <text id="tip-v" x="8" y="27" font-size="11" fill="#fff"></text>
  </g></svg>`;
  el.innerHTML = svg;

  const svgEl = el.querySelector('svg');
  const cross = svgEl.querySelector('#cross');
  const tip = svgEl.querySelector('#tip');
  const show = i => {
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
    cross.setAttribute('visibility', 'visible');
    let tx = x(i) + 10;
    if (tx + 118 > W) tx = x(i) - 128;
    let ty = y(points[i].value) - 44;
    if (ty < 4) ty = y(points[i].value) + 12;
    tip.setAttribute('transform', `translate(${tx},${ty})`);
    tip.setAttribute('visibility', 'visible');
    svgEl.querySelector('#tip-d').textContent = points[i].date;
    svgEl.querySelector('#tip-v').textContent = `专注度 ${points[i].value}`;
  };
  svgEl.addEventListener('mousemove', e => {
    const rect = svgEl.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width * W;
    let best = 0, bd = Infinity;
    points.forEach((p, i) => { const d = Math.abs(x(i) - px); if (d < bd) { bd = d; best = i; } });
    show(best);
  });
  svgEl.addEventListener('touchmove', e => {
    const rect = svgEl.getBoundingClientRect();
    const t = e.touches[0];
    const px = (t.clientX - rect.left) / rect.width * W;
    let best = 0, bd = Infinity;
    points.forEach((p, i) => { const d = Math.abs(x(i) - px); if (d < bd) { bd = d; best = i; } });
    show(best);
  }, { passive: true });
  svgEl.addEventListener('mouseleave', () => { cross.setAttribute('visibility', 'hidden'); tip.setAttribute('visibility', 'hidden'); });
}

// ---------- 环图（部分与整体，如作业完成分布）----------
// segments: [{ value, color, label }]，2px 表面缝隙；中心显示完成率；图例带计数（可见标签）
export function donutChart(el, segments, { centerValue = '—', centerNote = '' } = {}) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0);
  if (!total) { el.innerHTML = emptyHTML('该时间段暂无作业记录'); return; }
  const W = 320, H = 176, cx = 84, cy = 86, R = 58, ring = 24;
  const circ = 2 * Math.PI * R;
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="作业完成分布">`;
  let acc = 0;
  segments.forEach(s => {
    if (!s.value) return;
    const frac = s.value / total;
    const len = Math.max(frac * circ - 2, 2); // 2px 段间缝隙
    svg += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${s.color}" stroke-width="${ring}"
      stroke-dasharray="${len.toFixed(1)} ${(circ - len).toFixed(1)}" stroke-dashoffset="${-(acc * circ + 1).toFixed(1)}"/>`;
    acc += frac;
  });
  svg += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="26" font-weight="700" fill="${PALETTE.ink}">${centerValue}</text>`;
  svg += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="${PALETTE.inkSec}">${centerNote}</text></svg>`;
  const legend = `<div class="legend">${segments.map(s =>
    `<span><i style="background:${s.color}"></i>${s.label} ${s.value} 次</span>`).join('')}</div>`;
  el.innerHTML = svg + legend;
}

// ---------- 横向条形图（有序量级，如知识点掌握度分布）----------
// rows: [{ label, value, color }]，轨道浅底 + 4px 圆角数据端 + 末端直接标签
export function masteryBars(el, rows) {
  const total = rows.reduce((s, r) => s + (r.value || 0), 0);
  if (!total) { el.innerHTML = emptyHTML('该时间段暂无知识点记录'); return; }
  const max = Math.max(...rows.map(r => r.value));
  el.innerHTML = `<div class="mastery-bars">${rows.map(r => `
    <div class="mb-row">
      <span class="mb-label">${r.label}</span>
      <span class="mb-track"><span class="mb-fill" style="width:${Math.max(8, (r.value / max) * 100).toFixed(0)}%;background:${r.color}"></span></span>
      <span class="mb-count">${r.value} 次</span>
    </div>`).join('')}</div>`;
}
