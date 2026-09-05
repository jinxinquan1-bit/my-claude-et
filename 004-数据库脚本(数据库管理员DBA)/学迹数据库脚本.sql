-- =====================================================================
-- 学迹（学生学习管理产品）数据库脚本 V1.0.1
--
-- 设计依据：
--   1. 001-产品PRD/学生学习管理产品PRD-V1.0.1.md 第 7 章《数据模型》
--   2. xueji-web/ 已验证的 V1.0.1 实现（server/db.js 表结构）
--   3. 003-前端代码（前端工程师）原型字段（assets/js/mock-data.js）
--
-- 目标数据库：MySQL 8.0+（本地 Docker 已装 mysql:8.4，宿主机端口 3307）
-- 字符集：utf8mb4 / utf8mb4_unicode_ci（全中文支持，已实测中文存取）
--
-- 使用方法（本地 Docker，命令行）：
--   docker exec -i mysql mysql -uroot -proot < 学迹数据库脚本.sql
-- 或使用图形客户端（如 Navicat/DBeaver）连接 localhost:3307（root/root）后执行本脚本。
--
-- 说明：
--   * 脚本可重复执行（按外键依赖倒序 DROP，先删子表再删父表）
--   * 所有表统一 InnoDB 引擎、utf8mb4 字符集、每列带中文注释
--   * 核心设计要点见文件末尾注释
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `xueji`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `xueji`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. users —— 老师账号（V1.0.1：用户名 + 密码注册登录）
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `share_tokens`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `learning_records`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username`      VARCHAR(20)     NOT NULL                COMMENT '用户名（2~20 位中文/英文/数字/下划线，全局唯一）',
  `password_hash` VARCHAR(100)    NOT NULL                COMMENT '密码哈希（bcrypt，勿存明文）',
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='老师账号表';

-- ---------------------------------------------------------------------
-- 2. sessions —— 登录会话（登录态 30 天）
-- ---------------------------------------------------------------------
CREATE TABLE `sessions` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id`    BIGINT UNSIGNED NOT NULL                COMMENT '所属老师 users.id',
  `token`      CHAR(64)        NOT NULL                COMMENT '会话 token（32 字节随机 hex，不可枚举）',
  `expires_at` DATETIME        NOT NULL                COMMENT '过期时间（登录后 30 天）',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sessions_token` (`token`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录会话表';

-- ---------------------------------------------------------------------
-- 3. students —— 学生档案（软删除，删除后 30 天内可恢复）
-- ---------------------------------------------------------------------
CREATE TABLE `students` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id`         BIGINT UNSIGNED NOT NULL                COMMENT '所属老师 users.id',
  `name`            VARCHAR(30)     NOT NULL                COMMENT '姓名（必填）',
  `nickname`        VARCHAR(30)     NOT NULL DEFAULT ''     COMMENT '称呼/昵称（选填）',
  `grade`           VARCHAR(20)     NOT NULL DEFAULT ''     COMMENT '年级（如：初二）',
  `school`          VARCHAR(50)     NOT NULL DEFAULT ''     COMMENT '学校（选填）',
  `default_subject` VARCHAR(20)     NOT NULL DEFAULT ''     COMMENT '默认科目（记一笔时自动带入）',
  `schedule`        VARCHAR(100)    NOT NULL DEFAULT ''     COMMENT '课程安排（如：每周二、四 19:00）',
  `avatar`          VARCHAR(255)    NOT NULL DEFAULT ''     COMMENT '头像地址（P1 照片功能预留）',
  `status`          ENUM('active','paused','finished') NOT NULL DEFAULT 'active'
                                                              COMMENT '状态：active 在读 / paused 停课 / finished 结课',
  `remark`          VARCHAR(500)    NOT NULL DEFAULT ''     COMMENT '备注',
  `deleted_at`      DATETIME        NULL DEFAULT NULL       COMMENT '软删除时间（NULL=未删除）',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_students_user_deleted` (`user_id`, `deleted_at`),
  KEY `idx_students_name` (`name`),
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生档案表';

-- ---------------------------------------------------------------------
-- 4. learning_records —— 每日学习记录（核心表，30 秒记录原则）
-- ---------------------------------------------------------------------
CREATE TABLE `learning_records` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `student_id`      BIGINT UNSIGNED NOT NULL                COMMENT '学生 students.id',
  `user_id`         BIGINT UNSIGNED NOT NULL                COMMENT '所属老师 users.id（冗余，便于按老师/学生双维度查询）',
  `record_date`     DATE            NOT NULL                COMMENT '记录日期（默认今天，支持历史补记）',
  `subject`         VARCHAR(50)     NOT NULL DEFAULT ''     COMMENT '科目（选填，默认取学生默认科目）',
  `content`         VARCHAR(2000)   NOT NULL DEFAULT ''     COMMENT '学习内容（选填）',
  `homework_status` ENUM('done','partial','undone','none') NULL DEFAULT NULL
                                                              COMMENT '作业：done 已完成 / partial 部分完成 / undone 未完成 / none 无作业（NULL=未记录）',
  `homework_desc`   VARCHAR(500)    NOT NULL DEFAULT ''     COMMENT '作业描述（如：练习册 P32~P35）',
  `focus`           TINYINT UNSIGNED NOT NULL DEFAULT 3     COMMENT '课堂专注度 1~5 星（默认 3 星）',
  `tags`            JSON            NULL DEFAULT NULL       COMMENT '状态标签数组，如 ["状态很好","进步明显"]（预设 6 个，支持自定义，最多 10 个）',
  `knowledge_point` VARCHAR(100)    NOT NULL DEFAULT ''     COMMENT '本次知识点（选填）',
  `mastery_level`   ENUM('none','initial','basic','proficient') NULL DEFAULT NULL
                                                              COMMENT '掌握程度：none 未掌握 / initial 初步 / basic 基本 / proficient 熟练（NULL=未记录）',
  `comment`         VARCHAR(2000)   NOT NULL DEFAULT ''     COMMENT '给家长的话/老师评语（会展示给家长）',
  `photos`          JSON            NULL DEFAULT NULL       COMMENT '照片地址数组（P1 功能预留，最多 4 张）',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_records_student_date` (`student_id`, `record_date` DESC),
  KEY `idx_records_user_date` (`user_id`, `record_date` DESC),
  CONSTRAINT `fk_records_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_records_focus` CHECK (`focus` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日学习记录表（核心）';

-- ---------------------------------------------------------------------
-- 5. reports —— 学习报告（快照机制：生成时固化数据，之后改记录不影响已发报告）
-- ---------------------------------------------------------------------
CREATE TABLE `reports` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `student_id`       BIGINT UNSIGNED NOT NULL                COMMENT '学生 students.id（不建外键：报告是历史快照，学生删除后报告仍保留可查）',
  `user_id`          BIGINT UNSIGNED NOT NULL                COMMENT '所属老师 users.id（不建外键：同上，快照独立于账号生命周期）',
  `period_start`     DATE            NOT NULL                COMMENT '统计范围起始日',
  `period_end`       DATE            NOT NULL                COMMENT '统计范围结束日',
  `content_snapshot` JSON            NOT NULL                COMMENT '报告内容快照：学生信息/统计(次数、作业、专注度趋势、掌握度)/记录明细/老师署名',
  `teacher_message`  VARCHAR(1000)   NOT NULL DEFAULT ''     COMMENT '老师寄语（可选，展示给家长）',
  `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  PRIMARY KEY (`id`),
  KEY `idx_reports_user` (`user_id`, `created_at` DESC),
  KEY `idx_reports_student` (`student_id`, `period_start`, `period_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习报告表（快照）';

-- ---------------------------------------------------------------------
-- 6. share_tokens —— 分享链接（默认 7 天有效、可撤销、可重新生成）
-- ---------------------------------------------------------------------
CREATE TABLE `share_tokens` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `report_id`  BIGINT UNSIGNED NOT NULL                COMMENT '关联报告 reports.id',
  `token`      CHAR(48)        NOT NULL                COMMENT '分享 token（24 字节随机 hex，192bit 不可枚举）',
  `expires_at` DATETIME        NOT NULL                COMMENT '过期时间（生成后 7 天）',
  `revoked`    TINYINT(1)      NOT NULL DEFAULT 0      COMMENT '是否已撤销：0 有效 / 1 已撤销（撤销后家长立即不可见）',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_share_token` (`token`),
  KEY `idx_share_report` (`report_id`),
  CONSTRAINT `fk_share_report` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告分享链接表';

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 设计要点说明
-- =====================================================================
-- 1. 主键统一 BIGINT UNSIGNED（学生/记录量级无上限，未来跨服务迁移友好）
-- 2. 时间统一 DATETIME（无 2038 问题、无时区隐式转换；应用侧写入本地时间字符串）
-- 3. 日期统一 DATE 类型（'YYYY-MM-DD'），与 PRD 口径一致，可直接范围比较
-- 4. 枚举字段用 MySQL ENUM（有约束力，防止脏数据），NULL 表示"未记录"
-- 5. learning_records 冗余 user_id：按老师/学生双维度查询都走索引
-- 6. 报告快照机制：content_snapshot 固化统计与明细 JSON，reports 不建外键，
--    保证"修改原始记录不影响已发报告"（PRD 4.5 P-5 与验收标准第 7 条）
-- 7. share_tokens.token 为高熵随机串（不可枚举），配 expires_at + revoked，
--    保证家长数据隐私（PRD 非功能需求-安全/隐私）
-- 8. 软删除：students.deleted_at 置时间戳，30 天内可恢复；唯一物理删除路径
--    是 users 级联（老师账号注销时清空其名下全部数据）
-- =====================================================================
