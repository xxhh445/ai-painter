require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

console.log('=== 启动前检查 ===');
console.log('Node.js 版本:', process.version);
console.log('PORT 环境变量:', process.env.PORT);
console.log('DEEPSEEK_API_KEY 已配置:', !!process.env.DEEPSEEK_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

const API_CONFIG = {
    deepseek: {
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat'
    }
};

async function proxyRequest(apiType, endpoint, body, apiKey) {
    const config = API_CONFIG[apiType];
    if (!config) {
        throw new Error('未知的 API 类型');
    }

    const url = `${config.baseUrl}/${endpoint}`;

    const headers = {
        'Content-Type': 'application/json'
    };

    if (apiType === 'deepseek') {
        headers['Authorization'] = `api-key ${apiKey}`;
    } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    if (apiType === 'deepseek' && body) {
        body.model = config.model;
    }

    console.log(`[${new Date().toISOString()}] ${apiType} API 请求:`, { url, model: body?.model || 'N/A' });

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(`[${new Date().toISOString()}] API 错误:`, data);
        throw new Error(data?.error?.message || data?.message || 'API 请求失败');
    }

    return data;
}

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        hasApiKey: !!(process.env.DEEPSEEK_API_KEY),
        port: PORT
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, apiKey, apiType = 'deepseek' } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: '无效的 messages 参数' });
        }

        const key = process.env.DEEPSEEK_API_KEY || apiKey;
        if (!key) {
            return res.status(400).json({ error: 'API Key 未配置' });
        }

        const result = await proxyRequest(apiType, 'chat/completions', { messages }, key);

        res.json({
            success: true,
            response: result.choices?.[0]?.message?.content || ''
        });

    } catch (error) {
        console.error('Chat API Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt, size, style, apiKey } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: '缺少 prompt 参数' });
        }

        const key = process.env.IMAGE_API_KEY || apiKey;
        if (!key) {
            return res.status(400).json({ error: '图像 API Key 未配置' });
        }

        const imageApiEndpoint = process.env.IMAGE_API_ENDPOINT;
        if (!imageApiEndpoint) {
            return res.status(400).json({
                success: false,
                error: '图像 API Endpoint 未配置，请联系管理员配置'
            });
        }

        const response = await fetch(imageApiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({ prompt, size, style })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error?.message || '图像生成失败');
        }

        const url = data.image_url || data.url || (data.data && data.data.url);

        res.json({
            success: true,
            url: url
        });

    } catch (error) {
        console.error('Image API Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🎨 AI Painter 后端服务已启动                      ║
║                                                       ║
║     监听地址: 0.0.0.0:${PORT}                           ║
║                                                       ║
║     配置说明:                                          ║
║     • DEEPSEEK_API_KEY - DeepSeek API 密钥           ║
║     • IMAGE_API_KEY - 图像 API 密钥                  ║
║     • IMAGE_API_ENDPOINT - 图像 API 地址             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    if (!process.env.DEEPSEEK_API_KEY) {
        console.log('⚠️  警告: DEEPSEEK_API_KEY 未设置');
    }
});

server.on('error', (err) => {
    console.error('服务器启动错误:', err.message);
    console.error('错误代码:', err.code);
    if (err.code === 'EADDRINUSE') {
        console.error('端口 ${PORT} 已被占用!');
    }
});
