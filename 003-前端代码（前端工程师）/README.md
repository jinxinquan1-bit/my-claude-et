# 学迹 · 前端原型（纯前端，多页静态站）

基于 [PRD V1.0.1](../../001-产品PRD/学生学习管理产品PRD-V1.0.1.md) 整理的原型项目。原始 stitch 设计稿位于 `../002-UI界面（美术设计）/UI原型/`，本项目已做结构整理、主题统一、页面去重与跳转打通。

## 快速预览

无构建、无后端：**双击任意 HTML 即可在浏览器打开**（推荐从 [index.html](index.html) 登录页开始）。

也可以起一个本地静态服务：

```bash
# 在本目录下
npx serve .        # 或 python -m http.server 8080
```

## 页面清单（11 页，对应 PRD 5.1）

| 页面 | 文件 | 说明 |
| --- | --- | --- |
| 登录/注册 | [index.html](index.html) | 用户名+密码（V1.0.1），登录/注册模式切换，密码显隐 |
| 首页 | [home.html](home.html) | 问候 + 统计卡 + 待记录名单 + 本周活跃图表 + 快捷入口 |
| 学生列表 | [students.html](students.html) | 卡片网格 + 搜索过滤 + 状态徽章 |
| 学生详情 | [student-detail.html](student-detail.html) | 档案卡 + 统计卡 + 趋势图 + 记录时间线 + 跟进清单 |
| 记一笔 | [record.html](record.html) | 核心录入表单：星级/分段/标签交互 + 保存三态演示（成功/错误/保存中） |
| 统计 | [stats.html](stats.html) | 全局概览 + 学生维度三图表（折线/环图/掌握度条形） |
| 报告生成 | [report-create.html](report-create.html) | 选学生 + 时间范围 + 寄语 → 分享链接 |
| 报告管理 | [reports.html](reports.html) | 状态徽章 + 复制/撤销/重新生成（演示交互） |
| 我的 | [me.html](me.html) | 账号卡 + 菜单 + 退出登录 |
| 家长报告页 | [report-share.html](report-share.html) | 免登录只读 H5（无导航壳） |

## 跳转关系

```
index ──登录──▶ home ◀──侧栏/底栏互通──▶ students ──▶ student-detail
                    │                        │             │
                    ├──记一笔──▶ record ◀─────┘             ├──记一笔──▶ record
                    │    └─保存成功弹窗─▶ student-detail     └──生成报告──▶ report-create
                    └──报告管理──▶ reports ◀──生成新报告──────┘        └─预览─▶ report-share
                          ▲         │
me ──报告管理──────────────┘         └──预览──▶ report-share
me ──退出登录──▶ index
```

导航壳（桌面 260px 侧栏 + 顶栏 / 移动顶栏 + 底部 TabBar + 中央「记一笔」FAB）由 `assets/js/common.js` 按 `data-shell` 占位符统一注入，跳转链接只在此维护一份。

## 项目结构

```
003-前端代码（前端工程师）/
├── *.html                      # 11 个页面（每页一个文件，双击可预览）
└── assets/
    ├── vendor/tailwind.js      # Tailwind Play CDN 本地化（离线可用）
    ├── css/
    │   ├── fonts.css           # Material Symbols 本地化 + 中文字体栈
    │   └── common.css          # 自定义公共样式（玻璃卡/毛玻璃/星级/弹窗/toast）
    ├── fonts/material-symbols.woff2
    └── js/
        ├── theme.js            # ★ 唯一主题配置：PRD 第 6 章配色（设计 Token 单源）
        ├── common.js           # 共享壳注入 + toast/弹窗/星级 + SVG 图表（折线/环图/条形）
        ├── mock-data.js        # 演示数据（后续对接后端时替换为接口）
        └── page-*.js           # 每页专属交互（登录/首页/学生/详情/记录/统计/报告/我的/家长页）
```

**页面统一模板**（新增页面照此写）：

```html
<head>
  <link href="assets/css/fonts.css" rel="stylesheet"/>
  <link href="assets/css/common.css" rel="stylesheet"/>
  <script src="assets/js/theme.js"></script>        <!-- 必须先于 tailwind -->
  <script src="assets/vendor/tailwind.js"></script>
</head>
<body>
  <div data-shell="app" data-active="home|students|stats|me"></div>  <!-- index/report-share 不注入 -->
  <main class="md:ml-[260px] md:pt-16 pt-14 pb-24 md:pb-8 px-margin-mobile md:px-margin-desktop max-w-max-content-width mx-auto">
    ...
  </main>
  <script src="assets/js/mock-data.js"></script>
  <script src="assets/js/common.js"></script>
  <script src="assets/js/page-xxx.js"></script>
</body>
```

## 设计规范

- 配色：PRD 第 6 章（品牌蓝 `#3B82F6` 体系），统一收敛于 `assets/js/theme.js`，含桌面/移动两套历史命名兼容
- 掌握度蓝阶 `#60A5FA → #3B82F6 → #2563EB → #1E40AF`（经色盲/对比度校验）
- 图表标记色：已完成 `#15803D` / 部分完成 `#F59E0B` / 未完成 `#EF4444`
- 原 stitch 设计规范见 `../002-UI界面（美术设计）/UI原型/reliable_utility/DESIGN.md`（移动）与 `reliable_utility_desktop/DESIGN.md`（桌面）

## 后续对接说明

当前为**纯前端原型**：数据来自 `mock-data.js`，表单提交为演示交互。对接 xueji-web 后端时：替换 mock 数据为 `fetch('/api/...')` 调用、登录页接真实鉴权即可（API 规范见 `../../xueji-web/README.md`）。
