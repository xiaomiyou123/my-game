import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Battery, ChevronUp, ChevronDown, Zap, Monitor } from 'lucide-react';

interface AIControlHubProps {
    aiStatus?: {
        isOnline: boolean;
        currentMode: string;
        batteryLevel: number;
        activeTask: string;
    };
    isExpanded?: boolean;
    setIsExpanded?: (expanded: boolean) => void;
}

export const AIControlHub: React.FC<AIControlHubProps> = (props) => {
    const {
        aiStatus = {
            isOnline: true,
            currentMode: 'idle',
            batteryLevel: 85,
            activeTask: 'none'
        },
        isExpanded = false,
        setIsExpanded = () => {}
    } = props;
    const [currentActivity, setCurrentActivity] = useState('Monitoring Farm Systems');

    const statusLabels = {
        idle: 'Standby',
        analyzing: 'Analyzing Data',
        acting: 'Taking Action',
        monitoring: 'Active Monitoring',
    };

    return (
        <motion.div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
        >
            <div className="relative">
                {/* Expanded Activity Panel */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-full left-0 right-0 mb-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden"
                        >
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Brain className="w-5 h-5 text-green-400 animate-pulse" />
                                    <div>
                                        <div className="text-xs text-white/60">AI Status</div>
                                        <div className="text-sm text-white font-medium">
                                            {statusLabels[aiStatus.currentMode as keyof typeof statusLabels] || 'Unknown'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Monitor className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <div className="text-xs text-white/60">Current Activity</div>
                                        <div className="text-sm text-white">{currentActivity}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Battery className="w-5 h-5 text-yellow-400" />
                                    <div>
                                        <div className="text-xs text-white/60">Power Level</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-500 rounded-full transition-all duration-500" 
                                                    style={{ width: `${aiStatus.batteryLevel}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-white">{aiStatus.batteryLevel}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Control Bar */}
                <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Status Indicator */}
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${aiStatus.isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                <span className="text-xs text-white/60">AI</span>
                            </div>

                            {/* Activity Status */}
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-white">{aiStatus.currentMode === 'idle' ? 'Standby' : 'Active'}</span>
                            </div>

                            {/* Current Task */}
                            {aiStatus.activeTask !== 'none' && (
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                                    <span className="text-xs text-white truncate max-w-xs">
                                        {aiStatus.activeTask}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Expand/Collapse Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs text-white"
                        >
                            <span className="text-xs font-cinematic uppercase tracking-wider">
                                {isExpanded ? 'Collapse' : 'Show Activity'}
                            </span>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};