// chat - DeepSeek 对话 API 中转
// 接收前端传来的 API Key 和对话，转发给 DeepSeek
// 返回 AI 回复，同时存储对话历史

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
    const { apiKey, messages, userId } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: '缺少 API Key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: '缺少对话内容' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 调用 DeepSeek API
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'api-key ' + apiKey
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('DeepSeek API error:', data);
      return new Response(
        JSON.stringify({ error: data?.error?.message || 'DeepSeek API 请求失败', raw: data }),
        { status: apiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = data.choices?.[0]?.message?.content || '';

    // 可选：存储到数据库（如果提供了 userId）
    if (userId && userId.trim() !== '') {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseServiceRole) {
          const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
          const userMsg = lastUserMsg?.content || messages[messages.length - 1]?.content || '';
          
          await fetch(supabaseUrl + '/rest/v1/chat_history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceRole,
              'Authorization': 'Bearer ' + supabaseServiceRole,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: userId,
              user_message: userMsg,
              ai_response: aiResponse,
              created_at: new Date().toISOString()
            })
          });
        }
      } catch (e) {
        console.error('存储失败:', e.message);
        // 存储失败不影响返回结果
      }
    }

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
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
