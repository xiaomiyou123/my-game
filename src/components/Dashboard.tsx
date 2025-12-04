import React from 'react';
import { Background } from './Background';
import { WeatherModule } from './WeatherModule';
import { CropHealthModule } from './CropHealthModule';
import { MainVisual } from './MainVisual';
import { DeviceModule } from './DeviceModule';
import { AIAgent } from './AIAgent';
import { APIConfigPanel } from './APIConfigPanel';
import { motion } from 'framer-motion';

// Dashboard component - the main home screen
export const Dashboard: React.FC = () => {
    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans selection:bg-green-500/30">
            {/* Global Cinematic Background & Main Visual */}
            <div className="absolute inset-0 z-0">
                <Background />
                <MainVisual />
            </div>

            {/* UI Overlay Layer */}
            <div className="relative z-10 h-full flex flex-col p-6 pointer-events-none">
                {/* Header */}
                <header className="flex justify-between items-center h-16 shrink-0 pointer-events-auto">
                    <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md p-2 pr-6 rounded-full border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 opacity-80 blur-sm animate-pulse flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <div>
                            <h1 className="text-xl font-cinematic font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                AGRI-OS
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-cinematic tracking-widest text-white/60 bg-black/20 backdrop-blur-md py-2 px-6 rounded-full border border-white/10">
                        <span className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-400 rounded-full" /> 24° 30' N, 118° 05' E
                        </span>
                        <span className="w-px h-3 bg-white/20" />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </header>

                {/* Main Content Area - Floating Modules */}
                <div className="flex-1 flex justify-between items-center min-h-0 mt-4 mb-32">
                    {/* Left Column: Environmental Data */}
                    <motion.div
                        className="w-[320px] flex flex-col gap-4 pointer-events-auto"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <WeatherModule />
                        <CropHealthModule />
                    </motion.div>

                    {/* Center Area is Empty to show the Visuals */}
                    <div className="flex-1" />

                    {/* Right Column: Device Control */}
                    <motion.div
                        className="w-[300px] flex flex-col gap-4 pointer-events-auto"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <DeviceModule />

                        {/* Inspection Center Entry Card */}
                        <div className="bg-black/40 backdrop-blur-md border border-green-500/30 rounded-lg p-4 hover:border-green-500/50 transition-colors group cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-cinematic text-green-400 uppercase tracking-wide">智慧巡检</h3>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            </div>
                            <p className="text-xs text-white/60 mb-3">
                                360° 全景巡检系统
                            </p>
                            <div className="text-xs text-white/40">
                                点击底部导航栏进入全屏模式
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Legacy AI Chat Interface */}
            <AIAgent />

            {/* API Configuration Panel */}
            <APIConfigPanel />
        </div>
    );
};
