#!/bin/bash
# =============================================
# AI Painter - Supabase 部署脚本
# =============================================
# 使用方法：
#   1. 在 https://supabase.com 创建项目
#   2. 在 Supabase Dashboard → Edge Functions → Secrets 中添加:
#      DEEPSEEK_API_KEY=your-deepseek-api-key
#   3. 安装 Supabase CLI: npm install -g supabase
#   4. 运行: ./deploy.sh
# =============================================

set -e

echo "=============================================="
echo "  AI Painter - Supabase Edge Functions 部署"
echo "=============================================="

# 1. 检查 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ 未找到 supabase 命令"
    echo "请先安装: npm install -g supabase"
    exit 1
fi
echo "✓ Supabase CLI 已安装"

# 2. 登录
echo ""
echo "检查登录状态..."
if ! supabase status &> /dev/null; then
    echo "请登录 Supabase..."
    supabase login
fi
echo "✓ 已登录"

# 3. 询问项目信息
echo ""
echo "请输入你的 Supabase 项目 ID (在 Project Settings → General 中获取):"
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

# 5. 部署 chat 函数
echo ""
echo "部署 chat 函数..."
supabase functions deploy chat --no-verify-jwt
echo "✓ chat 函数已部署"

# 6. 部署 generate-image 函数
echo ""
echo "部署 generate-image 函数..."
supabase functions deploy generate-image --no-verify-jwt
echo "✓ generate-image 函数已部署"

echo ""
echo "=============================================="
echo "  ✅ 部署完成!"
echo "=============================================="
echo ""
echo "函数 URL:"
echo "  聊天:  https://$PROJECT_ID.supabase.co/functions/v1/chat"
echo "  图像:  https://$PROJECT_ID.supabase.co/functions/v1/generate-image"
echo ""
echo "重要提示:"
echo "  1. 在 Supabase Dashboard → Edge Functions → Secrets 中设置 DEEPSEEK_API_KEY"
echo "  2. 在网页应用的设置中配置 Supabase URL 和 Anon Key"
echo "  3. 前端部署: 直接上传 index.html 到 GitHub Pages 或任何静态网站托管"
echo ""
