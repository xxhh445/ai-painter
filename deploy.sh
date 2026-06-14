#!/bin/bash
# ================================================
# AI Painter - Supabase 部署脚本
# ================================================
# 架构说明：
#   前端 (你的网站)
#        └──> Supabase Edge Functions (API中转)
#               └──> DeepSeek / 图像API (你的 API Key)
#               └──> PostgreSQL (存储数据)
#
# 使用方法：
#   1. 在 https://supabase.com 创建项目
#   2. 在 Supabase Dashboard → SQL Editor 中运行 supabase/schema.sql
#   3. 安装 Supabase CLI: npm install -g supabase
#   4. 运行: bash deploy.sh
# ================================================

set -e

echo "================================================"
echo "  AI Painter - Supabase 部署"
echo "================================================"
echo ""

# 1. 检查 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ 未找到 supabase 命令"
    echo "请先安装: npm install -g supabase"
    exit 1
fi
echo "✓ Supabase CLI 已安装"

# 2. 登录检查
echo ""
echo "检查登录状态..."
if ! supabase status &> /dev/null; then
    echo "请登录 Supabase..."
    supabase login
fi
echo "✓ 已登录"

# 3. 输入项目 ID
echo ""
echo "请输入你的 Supabase Project ID (在 Project Settings → General 获取):"
read -p "Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ 项目 ID 不能为空"
    exit 1
fi

# 4. 链接项目
echo ""
echo "链接项目..."
supabase link --project-ref "$PROJECT_ID"
echo "✓ 项目已链接"

# 5. 部署所有 Edge Functions
echo ""
echo "================================================"
echo "  部署 Edge Functions"
echo "================================================"

echo ""
echo "📞 部署 chat 函数 (对话 API 中转)..."
supabase functions deploy chat --no-verify-jwt
echo "✓ chat 函数已部署"

echo ""
echo "🖼️  部署 generate-image 函数 (图像生成中转)..."
supabase functions deploy generate-image --no-verify-jwt
echo "✓ generate-image 函数已部署"

echo ""
echo "📚 部署 get-chat-history 函数 (加载对话历史)..."
supabase functions deploy get-chat-history --no-verify-jwt
echo "✓ get-chat-history 函数已部署"

echo ""
echo "🖼️  部署 get-image-records 函数 (加载图像记录)..."
supabase functions deploy get-image-records --no-verify-jwt
echo "✓ get-image-records 函数已部署"

echo ""
echo "================================================"
echo "  ✅ 部署完成!"
echo "================================================"
echo ""
echo "📌 你的函数 URL:"
echo "  聊天:        https://$PROJECT_ID.supabase.co/functions/v1/chat"
echo "  图像生成:    https://$PROJECT_ID.supabase.co/functions/v1/generate-image"
echo "  对话历史:    https://$PROJECT_ID.supabase.co/functions/v1/get-chat-history"
echo "  图像记录:    https://$PROJECT_ID.supabase.co/functions/v1/get-image-records"
echo ""
echo "📝 配置步骤 (在你的网页设置中):"
echo "  1. Supabase URL: https://$PROJECT_ID.supabase.co"
echo "  2. Supabase Anon Key: 在 Supabase Dashboard → Settings → API 获取"
echo "  3. DeepSeek API Key: 你自己的 API Key (仅存储在浏览器中)"
echo ""
echo "💡 重要提示:"
echo "  - API Key 存储在你的浏览器本地，不会上传到任何平台"
echo "  - 数据存储功能需要在 Supabase 中运行 schema.sql 创建表"
echo "  - 如需创建数据库表，请运行: cat supabase/schema.sql"
echo ""
