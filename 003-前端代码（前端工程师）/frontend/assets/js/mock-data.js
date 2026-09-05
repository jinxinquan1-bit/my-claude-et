// 演示数据（纯前端原型，后续对接 xueji-web 后端时替换为真实接口）
window.MOCK = {
  teacher: { name: '王老师' },

  students: [
    { id: 1, name: '陈小明', grade: '初二', school: '北京四中', subject: '数学', status: 'active', lastRecord: '2026-09-03', totalRecords: 24, tags: ['冲刺中考'] },
    { id: 2, name: '李伟', grade: '初二', school: '北京四中', subject: '数学', status: 'active', lastRecord: '2026-09-02', totalRecords: 18, tags: [] },
    { id: 3, name: '王小雨', grade: '初一', school: '实验中学', subject: '英语', status: 'active', lastRecord: '2026-09-03', totalRecords: 11, tags: ['基础薄弱'] },
    { id: 4, name: '张立', grade: '初三', school: '实验中学', subject: '物理', status: 'paused', lastRecord: '2026-08-28', totalRecords: 15, tags: [] },
  ],

  // 学生详情时间线
  records: [
    { date: '2026-09-03', subject: '数学', content: '二次函数：图像与性质、顶点式', homework: 'done', focus: 4, tags: ['状态很好'], point: '二次函数图像', mastery: 'basic', comment: '课堂互动积极，作业正确率高' },
    { date: '2026-09-01', subject: '数学', content: '一元二次方程应用题训练', homework: 'partial', focus: 3, tags: ['需要鼓励'], point: '应用题建模', mastery: 'initial', comment: '建模思路还需多练习' },
    { date: '2026-08-29', subject: '数学', content: '一元二次方程：配方法与公式法', homework: 'done', focus: 4, tags: ['进步明显'], point: '配方法', mastery: 'basic', comment: '' },
    { date: '2026-08-27', subject: '数学', content: '一元一次方程复习', homework: 'done', focus: 3, tags: ['状态一般'], point: '解方程', mastery: 'proficient', comment: '' },
    { date: '2026-08-25', subject: '数学', content: '暑期作业讲解', homework: 'none', focus: 3, tags: [], point: '', mastery: '', comment: '' },
  ],

  // 统计页数据
  stats: {
    overview: { totalStudents: 14, activeStudents: 12, todayCount: 3, pendingCount: 5, weekCount: 24 },
    focusTrend: [
      { date: '08-29', value: 3.2 }, { date: '08-30', value: 3.5 }, { date: '08-31', value: 4.0 },
      { date: '09-01', value: 3.4 }, { date: '09-02', value: 3.8 }, { date: '09-03', value: 4.2 }, { date: '09-04', value: 4.5 },
    ],
    homework: { done: 6, partial: 2, undone: 1, none: 1 },
    mastery: { none: 1, initial: 2, basic: 5, proficient: 2 },
    count: 10,
    hwRate: 67,
    focusAvg: 3.8,
  },

  // 报告管理
  reports: [
    { id: 1, student: '陈小明', grade: '初二', period: '2026-08-25 ~ 2026-08-31', created: '2026-08-31 20:12', status: 'active', url: 'report-share.html' },
    { id: 2, student: '李伟', grade: '初二', period: '2026-08-18 ~ 2026-08-24', created: '2026-08-24 19:40', status: 'revoked', url: '' },
    { id: 3, student: '王小雨', grade: '初一', period: '2026-08-11 ~ 2026-08-17', created: '2026-08-17 21:05', status: 'expired', url: '' },
  ],

  // 家长报告页（快照演示数据）
  share: {
    student: { name: '陈小明', grade: '初二', school: '北京四中' },
    period: { from: '2026-08-25', to: '2026-08-31' },
    count: 8,
    hwRate: 75,
    focusAvg: 3.9,
    homework: { done: 6, partial: 1, undone: 1, none: 0 },
    focusTrend: [
      { date: '08-25', value: 3.5 }, { date: '08-26', value: 3.0 }, { date: '08-27', value: 3.8 },
      { date: '08-28', value: 4.0 }, { date: '08-29', value: 3.5 }, { date: '08-30', value: 4.2 }, { date: '08-31', value: 4.5 },
    ],
    mastery: { none: 1, initial: 2, basic: 4, proficient: 1 },
    teacher: '王老师',
    message: '本周孩子状态不错，课堂参与积极，一元二次方程的掌握明显进步。应用题建模还需加强练习，建议每天坚持 10 道计算题。',
  },
};
