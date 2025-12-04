import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, Send, X, Globe } from 'lucide-react';
import { AIService, type Message as AIMessage } from '../services/AIService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    language?: 'zh' | 'en';
}

// 语言检测函数
const detectLanguage = (text: string): 'zh' | 'en' => {
    // 检测中文字符（CJK统一表意文字）
    const chineseRegex = /[\u4e00-\u9fa5]/;
    return chineseRegex.test(text) ? 'zh' : 'en';
};

// 翻译函数（简单映射，可用API增强）
const translations = {
    zh: {
        goodMorning: '早安！今天露点温度较高，要调整通风吗？',
        placeholder: '向Agri-Agent提问...',
        thinking: 'AI思考中...',
        error: 'AI服务暂时不可用，请稍后重试',
        backendOffline: '后端服务离线，请启动backend服务器',
    },
    en: {
        goodMorning: 'Good morning! The dew point is high today, shall we adjust the ventilation?',
        placeholder: 'Ask Agri-Agent...',
        thinking: 'AI is thinking...',
        error: 'AI service temporarily unavailable, please try again later',
        backendOffline: 'Backend offline, please start the backend server',
    }
};

export const AIAgent: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState<'zh' | 'en'>('en');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: translations[currentLang].goodMorning,
            sender: 'ai',
            timestamp: new Date(),
            language: currentLang
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 检查后端健康状态
    useEffect(() => {
        const checkBackend = async () => {
            const healthy = await AIService.healthCheck();
            setBackendStatus(healthy);
        };
        checkBackend();
        const interval = setInterval(checkBackend, 10000); // 每10秒检查
        return () => clearInterval(interval);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // 切换语言
    const toggleLanguage = () => {
        const newLang = currentLang === 'zh' ? 'en' : 'zh';
        setCurrentLang(newLang);

        // 更新欢迎消息语言
        setMessages(prev => prev.map(msg =>
            msg.id === '1'
                ? { ...msg, text: translations[newLang].goodMorning, language: newLang }
                : msg
        ));
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // 检测用户输入的语言
        const detectedLang = detectLanguage(inputValue);

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
            language: detectedLang
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // 检查后端状态
            if (!backendStatus) {
                throw new Error('Backend offline');
            }

            // 获取农场上下文数据
            const farmContext = {
                location: '24°30\'N, 118°05\'E',
                currentTime: new Date().toLocaleString(detectedLang === 'zh' ? 'zh-CN' : 'en-US'),
                weather: { temp: 28, humidity: 65, condition: '晴朗' },
                devices: {
                    drones: { active: 3, total: 5 },
                    vehicles: { active: 2, total: 3 },
                    sensors: { online: 124, total: 130 }
                },
                crops: {
                    greenhouse_A: '生长良好',
                    greenhouse_B: '需要调整灌溉',
                    field: '即将收获'
                }
            };

            // 调用真实的DeepSeek API
            const aiResponse = await AIService.chatWithContext(inputValue, farmContext);

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'ai',
                timestamp: new Date(),
                language: detectedLang
            }]);

        } catch (error: any) {
            console.error('AI Error:', error);

            const errorMessage = error.message.includes('Backend offline')
                ? translations[detectedLang].backendOffline
                : translations[detectedLang].error;

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: errorMessage,
                sender: 'ai',
                timestamp: new Date(),
                language: detectedLang
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Trigger - 左下角避开右侧模块 */}
            <motion.div
                className="fixed bottom-8 left-8 z-50 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-400/30 to-blue-400/30 animate-spin-slow" />
                    <div className="absolute w-10 h-10 bg-white rounded-full blur-xl opacity-50 animate-pulse" />
                    <MessageSquare className="w-6 h-6 text-white relative z-10" />

                    {/* Backend状态指示器 */}
                    <span className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-black/50 ${backendStatus ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                </div>
            </motion.div>

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-28 left-8 z-50 w-96 h-[600px] bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-green-500/10 to-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <div>
                                    <h3 className="text-white font-cinematic font-bold tracking-wider">Agri-Agent</h3>
                                    <p className="text-xs text-white/50">
                                        {backendStatus ? 'DeepSeek AI • Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* 语言切换按钮 */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLanguage();
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title={currentLang === 'zh' ? 'Switch to English' : '切换到中文'}
                                >
                                    <Globe className="w-4 h-4 text-white/70" />
                                    <span className="ml-1 text-xs text-white/70">
                                        {currentLang.toUpperCase()}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/70" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'user'
                                        ? 'bg-green-500/20 border border-green-500/30 text-white'
                                        : 'bg-white/10 border border-white/20 text-white/90'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <p className="text-[10px] text-white/40 mt-1">
                                            {msg.timestamp.toLocaleTimeString(msg.language === 'zh' ? 'zh-CN' : 'en-US')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            <span className="ml-2 text-xs text-white/60">
                                                {translations[currentLang].thinking}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={translations[currentLang].placeholder}
                                    disabled={isLoading}
                                    className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-colors disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !inputValue.trim()}
                                    className="p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5 text-green-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
