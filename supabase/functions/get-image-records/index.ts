// get-image-records - 获取用户图像生成记录
// 从 Supabase 数据库中查询指定用户的图像记录

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
    const { userId, limit } = await req.json();

    if (!userId || userId.trim() === '') {
      return new Response(
        JSON.stringify({ error: '缺少 userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return new Response(
        JSON.stringify({ success: true, data: [], message: '数据库未配置' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const queryLimit = limit || 50;

    const response = await fetch(
      supabaseUrl + '/rest/v1/image_records?user_id=eq.' + encodeURIComponent(userId) +
      '&order=created_at.desc&limit=' + queryLimit,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseServiceRole,
          'Authorization': 'Bearer ' + supabaseServiceRole
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: true, data: [], message: '查询失败' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ success: true, data: [], error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
