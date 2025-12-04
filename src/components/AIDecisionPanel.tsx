import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, CheckCircle, Circle, Loader, AlertCircle } from 'lucide-react';
import type { GameEvent, DecisionStep } from '../types/mapTypes';

interface AIDecisionPanelProps {
    event: GameEvent;
    onClose: () => void;
}

export const AIDecisionPanel: React.FC<AIDecisionPanelProps> = ({ event, onClose }) => {
    const [showThinking, setShowThinking] = useState(true);
    const decisionFlow = event.aiDecisionFlow;

    // 模拟AI思考过程
    useEffect(() => {
        if (decisionFlow?.thinking.status === 'analyzing') {
            const timer = setTimeout(() => {
                setShowThinking(false);
            }, 2000); // 2秒思考动画
            return () => clearTimeout(timer);
        }
    }, [decisionFlow]);

    if (!decisionFlow) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-900/90 to-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl w-[800px] max-h-[80vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-cinematic text-white">AI决策流程</h3>
                            <p className="text-sm text-purple-300">{event.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                    {/* AI思考阶段 */}
                    <AnimatePresence mode="wait">
                        {showThinking && decisionFlow.thinking.status === 'analyzing' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-black/40 border border-purple-500/30 rounded-lg p-6"
                            >
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"
                                    >
                                        <Brain className="w-8 h-8 text-purple-400" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                            <Loader className="w-4 h-4 animate-spin" />
                                            AI正在分析问题...
                                        </h4>
                                        <p className="text-sm text-white/60 mb-3">{decisionFlow.thinking.currentStep}</p>

                                        {/* 思考进度条 */}
                                        <div className="w-full bg-purple-900/30 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${decisionFlow.thinking.progress}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 思考气泡动画 */}
                                <div className="mt-4 flex gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-3 h-3 rounded-full bg-purple-400"
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.3, 1, 0.3]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 决策步骤 */}
                    {!showThinking && decisionFlow.decision.steps.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-white font-bold flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                决策方案
                            </h4>

                            {decisionFlow.decision.steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-black/40 border rounded-lg p-4 ${step.status === 'active' ? 'border-yellow-500/50' :
                                        step.status === 'done' ? 'border-green-500/50' :
                                            step.status === 'failed' ? 'border-red-500/50' :
                                                'border-white/10'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* 步骤图标 */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'done' ? 'bg-green-500/20' :
                                            step.status === 'active' ? 'bg-yellow-500/20' :
                                                step.status === 'failed' ? 'bg-red-500/20' :
                                                    'bg-white/10'
                                            }`}>
                                            {step.status === 'done' ? (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : step.status === 'active' ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <Loader className="w-4 h-4 text-yellow-400" />
                                                </motion.div>
                                            ) : step.status === 'failed' ? (
                                                <AlertCircle className="w-4 h-4 text-red-400" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-white/40" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h5 className="text-white font-bold text-sm">
                                                    步骤 {step.order}: {step.title}
                                                </h5>
                                                {step.estimatedTime && (
                                                    <span className="text-xs text-white/40">
                                                        预计 {step.estimatedTime}秒
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-white/60">{step.description}</p>

                                            {step.deviceId && (
                                                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                                                    🤖 设备: {step.deviceId}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* 执行进度 */}
                    {decisionFlow.execution.status !== 'pending' && (
                        <div className="bg-black/40 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-bold flex items-center gap-2">
                                    {decisionFlow.execution.status === 'complete' ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            执行完成
                                        </>
                                    ) : (
                                        <>
                                            <Loader className="w-4 h-4 text-green-400 animate-spin" />
                                            正在执行...
                                        </>
                                    )}
                                </h4>
                                <span className="text-sm text-white/60">
                                    {decisionFlow.execution.progress}%
                                </span>
                            </div>

                            <div className="w-full bg-green-900/30 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${decisionFlow.execution.progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            {decisionFlow.execution.status === 'complete' && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-3 text-sm text-green-400"
                                >
                                    ✓ 所有步骤已完成，问题已解决
                                </motion.p>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
