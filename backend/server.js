const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DeepSeek AI聊天代理
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, temperature = 0.7, max_tokens = 2000 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: '无效的消息格式' });
        }

        const response = await axios.post(
            `${process.env.DEEPSEEK_BASE_URL}/v1/chat/completions`,
            {
                model: 'deepseek-chat',
                messages: messages,
                temperature: temperature,
                max_tokens: max_tokens,
                stream: false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                }
            }
        );

        res.json({
            message: response.data.choices[0].message.content,
            usage: response.data.usage
        });

    } catch (error) {
        console.error('DeepSeek API错误:', error.response?.data || error.message);
        res.status(500).json({
            error: 'AI服务暂时不可用',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// 未来扩展示例
app.get('/api/weather', async (req, res) => {
    res.json({ message: '天气API待集成' });
});

app.get('/api/agriculture', async (req, res) => {
    res.json({ message: '农业数据API待集成' });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend运行在 http://localhost:${PORT}`);
    console.log(`📡 DeepSeek Base: ${process.env.DEEPSEEK_BASE_URL}`);
    console.log(`🔑 密钥已加载: ${process.env.DEEPSEEK_API_KEY ? '是' : '否'}`);
});
