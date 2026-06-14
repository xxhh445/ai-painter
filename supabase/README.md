# Supabase 部署说明

## 重要：这是一个 API 中转 + 数据存储服务

### 架构
```
前端 (你的网站)
    ↓ (调用 Edge Functions)
Supabase Edge Functions
    ↓ (中转请求到第三方 API)
DeepSeek / 图像 API
    ↓ (返回结果，同时写入数据库)
Supabase PostgreSQL
```

### 你需要做的事情

#### 1. 创建 Supabase 项目
访问 https://supabase.com/dashboard 并创建一个新项目。

#### 2. 创建数据库表（重要！）
在 Supabase Dashboard → SQL Editor 中运行 `supabase/schema.sql` 文件中的 SQL 代码。

或者复制以下 SQL 直接运行：
```sql
CREATE TABLE IF NOT EXISTS chat_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS image_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    width INTEGER, height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_image_records_user_id ON image_records(user_id);
ALTER TABLE image_records ENABLE ROW LEVEL SECURITY;
```

#### 3. 部署 Edge Functions
```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目（替换为你的 Project ID）
supabase link --project-ref YOUR_PROJECT_ID

# 部署所有函数（重要：--no-verify-jwt 允许匿名访问）
supabase functions deploy chat --no-verify-jwt
supabase functions deploy generate-image --no-verify-jwt
supabase functions deploy get-chat-history --no-verify-jwt
supabase functions deploy get-image-records --no-verify-jwt
```

#### 4. 获取 API 配置
在 Supabase Dashboard → Settings → API 中复制：
- Project URL（形如 https://xxxx.supabase.co）
- anon public key（**注意：不是 service_role！**）

在你的网页应用中填入这两个配置即可。

#### 5. 使用你的 API Key
你只需在网页应用中输入你自己的 DeepSeek API Key。
**永远不需要在 Supabase 后台配置任何东西！**

### 函数说明

| 函数 | 路径 | 用途 |
|------|------|------|
| chat | /functions/v1/chat | 中转 DeepSeek 对话请求，可选存储历史 |
| generate-image | /functions/v1/generate-image | 中转图像生成请求，可选存储记录 |
| get-chat-history | /functions/v1/get-chat-history | 查询指定用户的对话历史 |
| get-image-records | /functions/v1/get-image-records | 查询指定用户的图像记录 |

### 为什么选择 Supabase？

- ✅ **无需配置 API Key**：你自己在前端输入
- ✅ **免费 PostgreSQL 数据库**：存储你的对话和图像记录
- ✅ **边缘函数**：全球分布，响应快速
- ✅ **无需管理服务器**：你只需要写前端页面
