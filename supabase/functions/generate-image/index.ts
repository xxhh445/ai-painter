// generate-image - 图像生成 API 中转
// 接收前端传来的 prompt，调用免费图像生成服务
// 支持：Pollinations.ai（无需 API Key）或自定义图像 API

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, imageApiKey, imageApiEndpoint, userId, width, height } = await req.json();

    if (!prompt || prompt.trim() === '') {
      return new Response(
        JSON.stringify({ error: '缺少图像描述 (prompt)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const w = width || 1024;
    const h = height || 1024;

    let imageUrl = '';

    // 方式 1：使用自定义图像 API
    if (imageApiEndpoint && imageApiKey) {
      const apiResponse = await fetch(imageApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + imageApiKey
        },
        body: JSON.stringify({
          prompt: prompt,
          width: w,
          height: h
        })
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        return new Response(
          JSON.stringify({ error: data?.error?.message || '图像生成失败', raw: data }),
          { status: apiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      imageUrl = data.image_url || data.url || (data.data && data.data.url) || '';

      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: '无法从响应中获取图像 URL' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // 方式 2：默认使用 Pollinations.ai（免费，无需 API Key）
      imageUrl = 'https://image.pollinations.ai/prompt/' +
        encodeURIComponent(prompt) +
        '?width=' + w + '&height=' + h + '&nologo=true&enhance=true';
    }

    // 可选：存储到数据库
    if (userId && userId.trim() !== '') {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseServiceRole) {
          await fetch(supabaseUrl + '/rest/v1/image_records', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceRole,
              'Authorization': 'Bearer ' + supabaseServiceRole,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: userId,
              prompt: prompt,
              image_url: imageUrl,
              width: w,
              height: h,
              created_at: new Date().toISOString()
            })
          });
        }
      } catch (e) {
        console.error('存储失败:', e.message);
      }
    }

    return new Response(
      JSON.stringify({ success: true, url: imageUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: '服务器内部错误: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
