// Supabase Edge Function: generate-image
// 图像生成代理（调用图像生成 API）

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { prompt } = await req.json()
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: '缺少 prompt 参数' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 使用 Pollinations.ai 免费图像生成服务（无需 API Key）
    // 这是一个可靠的开源图像生成服务
    const imageUrl = 'https://image.pollinations.ai/prompt/' +
      encodeURIComponent(prompt) +
      '?width=1024&height=1024&nologo=true&enhance=true'

    return new Response(
      JSON.stringify({ success: true, url: imageUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: '服务器内部错误: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
