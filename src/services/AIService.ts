import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    message: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// 获取当前LLM配置
function getLLMConfig() {
    const savedConfig = localStorage.getItem('llm_config');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            return {
                baseUrl: config.baseUrl || 'https://api.deepseek.com',
                model: config.model || 'deepseek-chat',
                apiKey: config.apiKey || ''
            };
        } catch (e) {
            console.error('Failed to parse LLM config:', e);
        }
    }

    return {
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
        apiKey: ''
    };
}

export class AIService {
    /**
     * 直接调用配置的LLM API（不通过backend）
     */
    static async chat(
        messages: Message[],
        options?: {
            temperature?: number;
            max_tokens?: number;
        }
    ): Promise<ChatResponse> {
        const config = getLLMConfig();

        if (!config.apiKey) {
            throw new Error('请先在API配置面板中设置API Key');
        }

        try {
            const response = await axios.post(
                `${config.baseUrl}/chat/completions`,
                {
                    model: config.model,
                    messages: messages,
                    temperature: options?.temperature || 0.7,
                    max_tokens: options?.max_tokens || 2000,
                    stream: false
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.apiKey}`
                    },
                    timeout: 90000 // 90秒，支持thinking模型的推理时间
                }
            );

            // 兼容不同的响应格式
            let messageContent = '';
            let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

            console.log('AI响应:', response.data); // 调试

            if (response.data?.choices && Array.isArray(response.data.choices) && response.data.choices.length > 0) {
                messageContent = response.data.choices[0].message?.content || response.data.choices[0].text || '';
                usage = response.data.usage || usage;
            } else if (response.data?.data) {
                messageContent = response.data.data.content || response.data.data.text || '';
                usage = response.data.data.usage || usage;
            } else if (response.data?.message) {
                messageContent = typeof response.data.message === 'string'
                    ? response.data.message
                    : response.data.message.content || '';
            } else if (response.data?.output) {
                messageContent = response.data.output.text || response.data.output.content || '';
            } else if (response.data?.result) {
                messageContent = response.data.result.response || response.data.result.content || '';
            }

            if (!messageContent) {
                throw new Error('AI返回的响应格式不正确，请查看Console日志');
            }

            return {
                message: messageContent,
                usage: usage
            };
        } catch (error: any) {
            console.error('AI服务错误:', error);

            // 超时错误
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                throw new Error('API响应超时（30秒），建议切换到智谱GLM等更稳定的提供商');
            }

            if (error.response?.status === 429) {
                throw new Error('API调用次数超限，请检查免费额度或更换LLM提供商');
            } else if (error.response?.status === 401) {
                throw new Error('API Key无效，请在配置面板中更新');
            } else if (error.response?.status === 500) {
                throw new Error('API服务器错误，建议切换提供商');
            }

            throw new Error(error.response?.data?.error?.message || error.message || 'AI服务暂时不可用');
        }
    }

    static async chatWithContext(
        userMessage: string,
        farmContext?: Record<string, any>
    ): Promise<string> {
        const systemPrompt = this.buildSystemPrompt(farmContext);

        const messages: Message[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];

        const response = await this.chat(messages);
        return response.message;
    }

    private static buildSystemPrompt(farmContext?: Record<string, any>): string {
        const basePrompt = `你是智慧农业AI助手，负责协助管理现代化智慧农场。

职责：
1. 监控环境数据（温度、湿度、土壤）
2. 分析作物健康并给建议
3. 管理设备（无人机、巡逻车、传感器）
4. 提供智慧巡检建议
5. 回答农场相关问题

当前农场：
- 位置：24°30'N, 118°05'E
- 区域：温室大棚A/B区，露天农田
- 设备：5台无人机，3辆巡逻车，124个传感器`;

        if (farmContext) {
            const contextStr = Object.entries(farmContext)
                .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
                .join('\n');
            return `${basePrompt}\n\n实时数据：\n${contextStr}`;
        }

        return basePrompt;
    }

    static async healthCheck(): Promise<boolean> {
        const config = getLLMConfig();
        return !!config.apiKey; // 只检查是否配置了API key
    }
}
