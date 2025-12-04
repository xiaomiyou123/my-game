import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ScanSearch, Smartphone, LineChart, Map as MapIcon } from 'lucide-react';

interface AppItem {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    route: string;
}

const apps: AppItem[] = [
    {
        id: 'dashboard',
        name: '仪表板',
        icon: LayoutGrid,
        color: 'from-green-600 to-green-700',
        route: '/'
    },
    {
        id: 'map',
        name: '农业地图',
        icon: MapIcon,
        color: 'from-emerald-600 to-emerald-700',
        route: '/map'
    },
    {
        id: 'inspection',
        name: '智慧巡检',
        icon: ScanSearch,
        color: 'from-blue-600 to-blue-700',
        route: '/inspection'
    },
    {
        id: 'devices',
        name: '设备控制',
        icon: Smartphone,
        color: 'from-purple-600 to-purple-700',
        route: '/devices'
    },
    {
        id: 'analytics',
        name: '数据分析',
        icon: LineChart,
        color: 'from-orange-600 to-orange-700',
        route: '/analytics'
    }
];

export const AppNavigator: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    const handleAppClick = (route: string) => {
        navigate(route);
    };

    return (
        <>
            {/* Hover trigger area - macOS style */}
            <div
                className="fixed bottom-0 left-0 right-0 h-4 z-[99]"
                onMouseEnter={() => setIsVisible(true)}
            />

            {/* Navigation Dock - 确保完全居中 */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-6 inset-x-0 z-[100] flex items-center justify-center"
                        onMouseLeave={() => setIsVisible(false)}
                    >
                        {/* macOS-style Control Center Container */}
                        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-4">
                            <div className="flex items-center gap-3">
                                {apps.map((app) => {
                                    const Icon = app.icon;
                                    const isActive = location.pathname === app.route;

                                    return (
                                        <motion.button
                                            key={app.id}
                                            onClick={() => handleAppClick(app.route)}
                                            whileHover={{ scale: 1.1, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative group"
                                        >
                                            {/* Icon Container */}
                                            <div
                                                className={`
                          w-16 h-16 rounded-2xl
                          bg-gradient-to-br ${app.color}
                          flex items-center justify-center
                          transition-all duration-300
                          shadow-lg
                          ${isActive ? 'ring-4 ring-white/50 shadow-2xl' : 'hover:shadow-xl'}
                        `}
                                            >
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>

                                            {/* Active Indicator Dot */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full"
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}

                                            {/* Tooltip */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                                                    {app.name}
                                                </div>
                                                {/* Tooltip Arrow */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                                    <div className="w-2 h-2 bg-gray-900/90 rotate-45" />
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle indicator when navigation is hidden */}
            {!isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-t-full z-[99]"
                />
            )}
        </>
    );
};
