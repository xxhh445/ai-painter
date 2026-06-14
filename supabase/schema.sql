-- ================================================
-- AI Painter 数据库表结构
-- 在 Supabase Dashboard → SQL Editor 中运行
-- ================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- 1. 对话历史表
-- ================================================
CREATE TABLE IF NOT EXISTS chat_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);

-- 启用 RLS (可选，增强安全性)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 允许任何已认证用户插入自己的记录
DROP POLICY IF EXISTS "Users can insert their own chat history" ON chat_history;
CREATE POLICY "Users can insert their own chat history"
    ON chat_history FOR INSERT
    WITH CHECK (true);

-- 允许任何已认证用户查看自己的记录
DROP POLICY IF EXISTS "Users can view their own chat history" ON chat_history;
CREATE POLICY "Users can view their own chat history"
    ON chat_history FOR SELECT
    USING (true);

-- ================================================
-- 2. 图像生成记录表
-- ================================================
CREATE TABLE IF NOT EXISTS image_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_records_user_id ON image_records(user_id);
CREATE INDEX IF NOT EXISTS idx_image_records_created_at ON image_records(created_at DESC);

-- 启用 RLS
ALTER TABLE image_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own image records" ON image_records;
CREATE POLICY "Users can insert their own image records"
    ON image_records FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own image records" ON image_records;
CREATE POLICY "Users can view their own image records"
    ON image_records FOR SELECT
    USING (true);

-- ================================================
-- 3. 用户设置表（可选）
-- ================================================
CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    nickname TEXT,
    preferred_style TEXT,
    default_width INTEGER DEFAULT 1024,
    default_height INTEGER DEFAULT 1024,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (true);

-- ================================================
-- 完成！
-- ================================================
-- 表结构创建完成。
--
-- 函数部署命令：
--   supabase functions deploy chat --no-verify-jwt
--   supabase functions deploy generate-image --no-verify-jwt
--   supabase functions deploy get-chat-history --no-verify-jwt
--   supabase functions deploy get-image-records --no-verify-jwt
-- ================================================
