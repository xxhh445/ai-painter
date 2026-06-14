const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('[BOOT] Starting AI Painter server...');
console.log('[BOOT] PORT =', process.env.PORT);
console.log('[BOOT] NODE_ENV =', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        port: PORT,
        hasDeepseekApiKey: !!process.env.DEEPSEEK_API_KEY
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, error: 'Invalid messages' });
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return res.status(400).json({ success: false, error: 'DEEPSEEK_API_KEY not configured' });
        }

        const fetch = require('node-fetch');
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'api-key ' + apiKey
            },
            body: JSON.stringify({ model: 'deepseek-chat', messages })
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(500).json({ success: false, error: data?.error?.message || 'API request failed' });
        }

        res.json({ success: true, response: data.choices?.[0]?.message?.content || '' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Missing prompt' });
        }

        const apiKey = process.env.IMAGE_API_KEY;
        const endpoint = process.env.IMAGE_API_ENDPOINT;
        if (!apiKey || !endpoint) {
            return res.status(400).json({ success: false, error: 'Image API not configured' });
        }

        const fetch = require('node-fetch');
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(500).json({ success: false, error: data?.error?.message || 'Image generation failed' });
        }

        res.json({ success: true, url: data.image_url || data.url || (data.data && data.data.url) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('[BOOT] Server listening on 0.0.0.0:' + PORT);
    console.log('[BOOT] Ready to serve requests!');
});
