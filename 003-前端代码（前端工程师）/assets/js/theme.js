// 学迹统一主题（设计 Token 单源）
// 颜色遵循 PRD V1.0.1 第 6 章《视觉设计规范》：
//   品牌蓝 #3B82F6 唯一主色；功能色仅表达状态；掌握度蓝阶单调渐深（经 CVD 色盲/对比度校验）
// 桌面/移动两套历史命名（primary/border-light 与 surface-bg/border-standard 等）
// 在此收敛为同一组值——页面沿用原类名即可，无需逐个修改。
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        // ---- 主色（品牌蓝，PRD 6.2）----
        primary: '#3B82F6',            // 主操作、选中态、链接、关键数据
        'primary-hover': '#2563EB',    // 按压/悬停
        'primary-deep': '#1E40AF',     // 大数字、图表强调
        'primary-light': '#EFF6FF',    // 选中背景、标签底
        'primary-border': '#BFDBFE',   // 浅蓝描边
        'surface-tint': '#2563EB',     // 历史别名（hover 态）
        'primary-container': '#EFF6FF',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#1E40AF',
        // ---- 中性色（PRD 6.3，桌面/移动两套命名）----
        'text-main': '#111827',        // 标题、学生姓名
        'text-heading': '#111827',
        'text-body': '#374151',        // 正文
        'text-muted': '#6B7280',       // 次要
        'text-secondary': '#6B7280',
        'text-placeholder': '#9CA3AF',
        'text-on-surface-variant': '#6B7280',
        'border-light': '#E5E7EB',
        'border-standard': '#E5E7EB',
        'border-active': '#BFDBFE',
        'app-bg': '#F5F7FA',           // 页面背景（微带蓝调的浅灰）
        'surface-bg': '#F5F7FA',
        'card-white': '#FFFFFF',
        'surface-card': '#FFFFFF',
        surface: '#FFFFFF',
        'periwinkle-subtle': '#EEF2F6',
        secondary: '#6B7280',
        'secondary-container': '#F1F5F9',
        // ---- 功能色（PRD 6.4，仅用于状态表达）----
        success: '#22C55E',
        'success-deep': '#15803D',     // 图表标记色（校验加深）
        'success-light': '#F0FDF4',
        warning: '#F59E0B',
        'warning-text': '#B45309',
        'warning-light': '#FFFBEB',
        danger: '#EF4444',
        'danger-deep': '#DC2626',
        'danger-light': '#FEF2F2',
        error: '#EF4444',
        'error-container': '#FEF2F2',
        'neutral-tag': '#64748B',
        'neutral-light': '#F1F5F9',
        // ---- 掌握度蓝阶（PRD 6.5：未掌握→熟练掌握）----
        'mastery-1': '#60A5FA',
        'mastery-2': '#3B82F6',
        'mastery-3': '#2563EB',
        'mastery-4': '#1E40AF',
        'mastery-1-container': '#EFF6FF',
        'mastery-2-container': '#DBEAFE',
        'mastery-3-container': '#BFDBFE',
        'mastery-4-container': '#E0E7FF',
        tertiary: '#1E40AF',
        'tertiary-container': '#E0E7FF',
        // ---- 历史 Material 命名兼容（原设计稿引用，映射到 PRD 同义色）----
        'on-surface': '#111827',
        'on-background': '#111827',
        background: '#F5F7FA',
        'surface-bright': '#FFFFFF',
        'surface-variant': '#DBEAFE',
        'surface-dim': '#E5E7EB',
        'surface-container': '#EFF6FF',
        'surface-container-low': '#EFF6FF',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-high': '#DBEAFE',
        'surface-container-highest': '#BFDBFE',
        outline: '#6B7280',
        'outline-variant': '#E5E7EB',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#111827',
        'secondary-fixed': '#EFF6FF',
        'secondary-fixed-dim': '#BFDBFE',
        'on-secondary-fixed': '#1E3A8A',
        'on-secondary-fixed-variant': '#1D4ED8',
        'primary-fixed': '#DBEAFE',
        'primary-fixed-dim': '#BFDBFE',
        'on-primary-fixed': '#1E3A8A',
        'on-primary-fixed-variant': '#1D4ED8',
        'on-primary-container': '#1E40AF',
        'tertiary-fixed': '#E0E7FF',
        'tertiary-fixed-dim': '#C7D2FE',
        'on-tertiary': '#FFFFFF',
        'on-tertiary-container': '#1E3A8A',
        'on-tertiary-fixed': '#1E3A8A',
        'on-tertiary-fixed-variant': '#3730A3',
        'inverse-surface': '#111827',
        'inverse-on-surface': '#F5F7FA',
        'inverse-primary': '#93C5FD',
        'on-error': '#FFFFFF',
        'on-error-container': '#991B1B',
        'warning-bg': '#FFFBEB',
        'danger-bg': '#FEF2F2',
        'success-bg': '#F0FDF4',
        'mastery-unmastered': '#60A5FA',
      },
      spacing: {
        base: '16px',
        'margin-mobile': '16px',
        'margin-desktop': '32px',
        xtight: '4px',
        tight: '8px',
        loose: '24px',
        gutter: '16px',
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px' }],
        'headline-xl': ['32px', { lineHeight: '40px' }],
        'headline-md': ['24px', { lineHeight: '32px' }],
        'title-lg': ['20px', { lineHeight: '28px' }],
        'title-md': ['16px', { lineHeight: '24px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        'body-md': ['15px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        'label-md': ['13px', { lineHeight: '20px' }],
        'label-sm': ['12px', { lineHeight: '16px' }],
        'input-text': ['16px', { lineHeight: '24px' }], // ≥16px 防 iOS 聚焦缩放
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        display: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        // 历史写法 font-{token}（字族）+ text-{token}（字号）共用同一 token 名，全部指向同一字栈
        'display-lg': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'headline-xl': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'headline-md': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'title-lg': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'title-md': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'body-lg': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'body-md': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'body-sm': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'label-md': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        'label-sm': ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
      boxShadow: {
        'level-1': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'level-2': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        fab: '0 4px 12px rgba(59, 130, 246, .35)',
      },
      maxWidth: {
        'max-content-width': '1440px',
      },
    },
  },
};
