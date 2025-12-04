import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Key, CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2, Eye, EyeOff, Save, Sparkles } from 'lucide-react';
import axios from 'axios';

// LLM提供商配置
interface LLMProvider {
    id: string;
    name: string;
    baseUrl: string;
    keyPrefix: string;
    model: string;
    isFree: boolean;
    signupUrl: string;
    freeQuota?: string;
}

const LLM_PROVIDERS: LLMProvider[] = [
    {
        id: 'deepseek',
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com',
        keyPrefix: 'sk-',
        model: 'deepseek-chat',
        isFree: true,
        signupUrl: 'https://platform.deepseek.com/api_keys',
        freeQuota: '500万tokens/月'
    },
    {
        id: 'zhipu',
        name: '智谱GLM',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        keyPrefix: '',
        model: 'glm-4-flash',
        isFree: true,
        signupUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
        freeQuota: '免费额度：500万tokens/月'
    },
    {
        id: 'qwen',
        name: '通义千问',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        keyPrefix: 'sk-',
        model: 'qwen-turbo',
        isFree: true,
        signupUrl: 'https://dashscope.console.aliyun.com/apiKey',
        freeQuota: '新用户送免费额度'
    },
    {
        id: 'moonshot',
        name: 'Moonshot (Kimi)',
        baseUrl: 'https://api.moonshot.cn/v1',
        keyPrefix: 'sk-',
        model: 'moonshot-v1-8k',
        isFree: true,
        signupUrl: 'https://platform.moonshot.cn/console/api-keys',
        freeQuota: '每月免费额度'
    },
    {
        id: 'custom',
        name: '自定义URL',
        baseUrl: '',
        keyPrefix: '',
        model: '',
        isFree: false,
        signupUrl: ''
    }
];

export const APIConfigPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(LLM_PROVIDERS[0]);
    const [apiKey, setApiKey] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [customModel, setCustomModel] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
        details?: any;
    } | null>(null);

    // 从localStorage加载配置
    useEffect(() => {
        const savedConfig = localStorage.getItem('llm_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                setApiKey(config.apiKey || '');
                setCustomUrl(config.customUrl || '');
                setCustomModel(config.customModel || '');

                const provider = LLM_PROVIDERS.find(p => p.id === config.providerId);
                if (provider) {
                    setSelectedProvider(provider);
                }
            } catch (e) {
                console.error('Failed to load config:', e);
            }
        }
    }, []);

    // 保存配置
    const saveConfig = () => {
        const config = {
            providerId: selectedProvider.id,
            apiKey: apiKey.trim(),
            customUrl: customUrl.trim(),
            customModel: customModel.trim(),
            baseUrl: selectedProvider.id === 'custom' ? customUrl : selectedProvider.baseUrl,
            model: selectedProvider.id === 'custom' ? customModel : selectedProvider.model
        };

        localStorage.setItem('llm_config', JSON.stringify(config));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // 测试API连接
    const testAPI = async () => {
        if (!apiKey.trim()) {
            setTestResult({
                success: false,
                message: '请先输入API Key',
                details: null
            });
            return;
        }

        const baseUrl = selectedProvider.id === 'custom' && customUrl
            ? customUrl
            : selectedProvider.baseUrl;

        const model = selectedProvider.id === 'custom' && customModel
            ? customModel
            : selectedProvider.model;

        if (!baseUrl || !model) {
            setTestResult({
                success: false,
                message: '自定义模式需要填写Base URL和模型名称',
                details: null
            });
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            // 构建请求URL
            const apiUrl = `${baseUrl}/chat/completions`;

            const response = await axios.post(
                apiUrl,
                {
                    model: model,
                    messages: [{ role: 'user', content: '测试连接，请简短回复OK' }],
                    temperature: 0.7,
                    max_tokens: 50
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey.trim()}`
                    },
                    timeout: 90000 // 90秒，支持thinking模型推理
                }
            );

            // 兼容不同的响应格式
            let replyContent = '';
            let usageInfo = null;

            console.log('API响应:', response.data); // 调试用

            // 尝试解析OpenAI标准格式
            if (response.data?.choices && Array.isArray(response.data.choices) && response.data.choices.length > 0) {
                const choice = response.data.choices[0];
                replyContent = choice.message?.content || choice.text || '';
                usageInfo = response.data.usage;
            }
            // 尝试解析智谱GLM格式
            else if (response.data?.data) {
                replyContent = response.data.data.content || response.data.data.text || '';
                usageInfo = response.data.data.usage;
            }
            // 直接message字段
            else if (response.data?.message) {
                replyContent = typeof response.data.message === 'string'
                    ? response.data.message
                    : response.data.message.content || '';
            }
            // 其他可能的格式
            else if (response.data?.output) {
                replyContent = response.data.output.text || response.data.output.content || '';
            }
            // result字段（某些国产模型）
            else if (response.data?.result) {
                replyContent = response.data.result.response || response.data.result.content || '';
            }

            // 如果还是没找到内容
            if (!replyContent) {
                replyContent = '连接成功（但响应格式未知，请查看详情）';
            }

            setTestResult({
                success: true,
                message: `✓ ${selectedProvider.name} API连接成功！`,
                details: {
                    提供商: selectedProvider.name,
                    模型: model,
                    回复: replyContent,
                    tokens: usageInfo || '未返回',
                    响应结构: Object.keys(response.data).join(', ')
                }
            });

            // 自动保存成功的配置
            saveConfig();

        } catch (error: any) {
            let errorMessage = 'API连接失败';
            let errorDetails: any = {};

            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                if (status === 401) {
                    errorMessage = '❌ API Key无效或已过期';
                    errorDetails = {
                        HTTP状态: '401 Unauthorized',
                        提示: `访问 ${selectedProvider.signupUrl} 获取新key`
                    };
                } else if (status === 429) {
                    errorMessage = '❌ API调用次数超限';
                    errorDetails = {
                        HTTP状态: '429 Too Many Requests',
                        提示: '免费额度已用完'
                    };
                } else if (status === 400) {
                    errorMessage = '❌ 请求参数错误';
                    errorDetails = {
                        HTTP状态: '400 Bad Request',
                        错误: data.error?.message || '检查模型名称是否正确'
                    };
                } else {
                    errorMessage = `❌ HTTP ${status} 错误`;
                    errorDetails = {
                        错误: data.error?.message || data.message || '未知错误'
                    };
                }
            } else if (error.request) {
                errorMessage = '❌ 网络连接失败';
                errorDetails = {
                    问题: `无法连接到 ${baseUrl}`,
                    提示: '检查URL是否正确，网络是否正常'
                };
            } else {
                errorMessage = '❌ 请求失败';
                errorDetails = { 错误: error.message };
            }

            setTestResult({
                success: false,
                message: errorMessage,
                details: errorDetails
            });
        }

        setTesting(false);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed top-24 right-8 z-50 p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg transition-colors backdrop-blur-md pointer-events-auto"
                title="LLM配置"
            >
                <Settings className="w-5 h-5 text-purple-300" />
            </motion.button>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        className="fixed top-24 right-8 z-50 w-[560px] max-h-[calc(100vh-150px)] bg-black/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-white/10 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-purple-400" />
                                    <div>
                                        <h3 className="text-lg font-cinematic font-bold text-white">LLM配置</h3>
                                        <p className="text-xs text-white/50">选择AI提供商</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/50 hover:text-white transition-colors text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Provider Selection */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-cinematic text-white/70 uppercase">选择提供商</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {LLM_PROVIDERS.map((provider) => (
                                        <button
                                            key={provider.id}
                                            onClick={() => setSelectedProvider(provider)}
                                            className={`p-3 rounded-lg border transition-all text-left ${selectedProvider.id === provider.id
                                                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="font-bold text-sm">{provider.name}</div>
                                            {provider.isFree && (
                                                <div className="text-xs text-green-400 mt-1">🎁 {provider.freeQuota}</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom URL (if custom selected) */}
                            {selectedProvider.id === 'custom' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/70">Base URL</label>
                                        <input
                                            type="text"
                                            value={customUrl}
                                            onChange={(e) => setCustomUrl(e.target.value)}
                                            placeholder="https://api.example.com/v1"
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/70">模型名称</label>
                                        <input
                                            type="text"
                                            value={customModel}
                                            onChange={(e) => setCustomModel(e.target.value)}
                                            placeholder="gpt-3.5-turbo"
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {/* API Key Input */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-cinematic text-white/70 uppercase">API Key</h4>
                                    {saved && (
                                        <span className="text-xs text-green-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            已保存
                                        </span>
                                    )}
                                </div>

                                <div className="relative">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder={selectedProvider.keyPrefix ? `${selectedProvider.keyPrefix}xxxxxxxx...` : '输入API Key'}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pr-24 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 font-mono text-sm"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                        <button
                                            onClick={() => setShowKey(!showKey)}
                                            className="p-2 hover:bg-white/10 rounded"
                                        >
                                            {showKey ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
                                        </button>
                                        <button
                                            onClick={saveConfig}
                                            disabled={!apiKey.trim()}
                                            className="p-2 hover:bg-white/10 rounded disabled:opacity-30"
                                        >
                                            <Save className="w-4 h-4 text-white/50" />
                                        </button>
                                    </div>
                                </div>

                                {selectedProvider.isFree && (
                                    <div className="flex items-start gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-300">
                                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                        <span>{selectedProvider.freeQuota}</span>
                                    </div>
                                )}
                            </div>

                            {/* Test Button */}
                            <button
                                onClick={testAPI}
                                disabled={testing || !apiKey.trim()}
                                className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/50 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 text-white"
                            >
                                {testing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>测试中...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>测试API连接</span>
                                    </>
                                )}
                            </button>

                            {/* Result */}
                            {testResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {testResult.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <p className={`font-bold text-sm ${testResult.success ? 'text-green-300' : 'text-red-300'}`}>
                                                {testResult.message}
                                            </p>
                                            {testResult.details && (
                                                <pre className="text-xs text-white/70 bg-black/40 p-2 rounded overflow-auto max-h-32">
                                                    {JSON.stringify(testResult.details, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Get API Key Link */}
                            {selectedProvider.signupUrl && (
                                <a
                                    href={selectedProvider.signupUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white group"
                                >
                                    <span className="text-sm">获取 {selectedProvider.name} API Key</span>
                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}

                            {/* Info */}
                            <div className="flex gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-300 leading-relaxed">
                                    配置会保存在浏览器本地。推荐使用有免费额度的提供商。
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
