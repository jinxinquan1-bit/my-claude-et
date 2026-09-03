// hash 路由：匹配页面模块渲染到 #app，控制底部 Tab 显隐与高亮，未登录跳登录页
import * as auth from './pages/auth.js';
import * as home from './pages/home.js';
import * as students from './pages/students.js';
import * as studentForm from './pages/studentForm.js';
import * as studentDetail from './pages/studentDetail.js';
import * as record from './pages/record.js';
import * as recordDetail from './pages/recordDetail.js';
import * as stats from './pages/stats.js';
import * as reports from './pages/reports.js';
import * as reportNew from './pages/reportNew.js';
import * as me from './pages/me.js';
import { getToken } from './api.js';

const ROUTES = [
  { re: /^#\/login$/, render: () => auth.render('login'), public: true },
  { re: /^#\/register$/, render: () => auth.render('register'), public: true },
  { re: /^#\/$/, render: home.render, tab: 'home' },
  { re: /^#\/students\/new$/, render: () => studentForm.render(null), tab: 'students' },
  { re: /^#\/students\/(\d+)\/edit$/, render: m => studentForm.render(Number(m[1])), tab: 'students' },
  { re: /^#\/students\/(\d+)$/, render: m => studentDetail.render(Number(m[1])), tab: 'students' },
  { re: /^#\/students$/, render: students.render, tab: 'students' },
  { re: /^#\/record$/, render: () => record.render(null), tab: 'record' },
  { re: /^#\/record\/(\d+)\/edit$/, render: m => record.render(Number(m[1])), tab: 'record' },
  { re: /^#\/records\/(\d+)$/, render: m => recordDetail.render(Number(m[1])), tab: 'record' },
  { re: /^#\/stats$/, render: stats.render, tab: 'stats' },
  { re: /^#\/reports\/new$/, render: reportNew.render, tab: 'me' },
  { re: /^#\/reports$/, render: reports.render, tab: 'me' },
  { re: /^#\/me$/, render: me.render, tab: 'me' },
];

// 取 hash 中的查询参数（如 #/record?student=3）
export function currentQuery() {
  const i = location.hash.indexOf('?');
  if (i < 0) return {};
  return Object.fromEntries(new URLSearchParams(location.hash.slice(i + 1)));
}

export function navigate() {
  const hash = location.hash || '#/';
  const cleanHash = hash.split('?')[0]; // 路由匹配忽略查询串（如 #/record?student=3）
  const app = document.getElementById('app');
  const tabbar = document.getElementById('tabbar');
  const route = ROUTES.find(r => r.re.test(cleanHash));

  if (!route) { location.hash = '#/'; return; }
  // 未登录 → 登录页；已登录访问登录/注册页 → 回首页
  if (!route.public && !getToken()) { location.hash = '#/login'; return; }
  if (route.public && getToken()) { location.hash = '#/'; return; }

  // 底部 Tab：公开页隐藏
  if (route.public) {
    tabbar.hidden = true;
    app.classList.add('no-tabbar');
  } else {
    tabbar.hidden = false;
    app.classList.remove('no-tabbar');
    tabbar.querySelectorAll('a').forEach(a =>
      a.classList.toggle('active', a.dataset.tab === route.tab));
  }

  app.innerHTML = '';
  window.scrollTo(0, 0);
  const el = route.render(cleanHash.match(route.re));
  if (el instanceof Node) app.appendChild(el);
}
