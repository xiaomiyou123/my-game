import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapCanvas } from './MapCanvas';
import { AIDecisionPanel } from './AIDecisionPanel';
import { RegionEditor } from './RegionEditor';
import { MapUploader } from './MapUploader';
import { Tooltip } from './Tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Layers, Zap, Play, Pause, Plus, MapPin, Square, Upload } from 'lucide-react';
import { defaultRegions, defaultDevices, sampleEvents } from '../data/mapData';
import { deviceController } from '../services/DeviceController';
import { mapImageStorage } from '../services/MapImageStorage';
import type { Region, Device, GameEvent, MapConfig, Position, MapImageData } from '../types/mapTypes';

export const GameMapView: React.FC = () => {
    const navigate = useNavigate();

    const [regions, setRegions] = useState<Region[]>(defaultRegions);
    const [devices, setDevices] = useState<Device[]>(defaultDevices);
    const [events, setEvents] = useState<GameEvent[]>(sampleEvents);
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
    const [showLayerControls, setShowLayerControls] = useState(false);
    const [showRegionEditor, setShowRegionEditor] = useState(false);
    const [showMapUploader, setShowMapUploader] = useState(false);
    const [mapBackground, setMapBackground] = useState<MapImageData | null>(null);
    const [mapConfig, setMapConfig] = useState<MapConfig>({
        bounds: { width: 600, height: 500 },
        gridSize: 50,
        showGrid: true,
        backgroundColor: '#0a0f1a'
    });

    // 加载底图
    useEffect(() => {
        const loadBackgroundImage = async () => {
            const image = await mapImageStorage.getLatestImage();
            if (image) {
                setMapBackground(image);
            }
        };
        loadBackgroundImage();
    }, []);

    // 初始化设备控制器
    React.useEffect(() => {
        devices.forEach(device => {
            deviceController.registerDevice(device);
        });
    }, []);

    // 手动移动设备到指定位置
    const moveDeviceTo = (deviceId: string, position: Position) => {
        deviceController.moveDeviceToPosition(
            deviceId,
            position,
            (updatedDevice) => {
                setDevices(prev => prev.map(d =>
                    d.id === deviceId ? updatedDevice : d
                ));
            }
        );
    };

    // AI自动巡逻
    const startAIPatrol = (deviceId: string, regionId: string) => {
        const region = regions.find(r => r.id === regionId);
        const device = devices.find(d => d.id === deviceId);

        if (!region || !device) return;

        // 生成巡逻路径（围绕区域中心）
        const patrolPath = deviceController.generatePatrolPath(
            region.position,
            80, // 半径
            8   // 8个点
        );

        deviceController.moveDeviceAlongPath(
            deviceId,
            patrolPath,
            (updatedDevice) => {
                setDevices(prev => prev.map(d =>
                    d.id === deviceId ? { ...updatedDevice, currentTask: `巡逻${region.name}` } : d
                ));
            },
            () => {
                // 巡逻完成
                console.log(`${device.name} 完成巡逻`);
            }
        );
    };

    // 停止设备移动
    const stopDevice = (deviceId: string) => {
        deviceController.stopDevice(deviceId);
        setDevices(prev => prev.map(d =>
            d.id === deviceId ? { ...d, isMoving: false, currentTask: undefined } : d
        ));
    };

    // 切换设备控制模式
    const toggleDeviceMode = (deviceId: string) => {
        setDevices(prev => prev.map(d => {
            if (d.id === deviceId) {
                const newMode = d.controlMode === 'auto' ? 'manual' : 'auto';
                return { ...d, controlMode: newMode, autonomousMode: newMode === 'auto' };
            }
            return d;
        }));
    };

    const handleRegionClick = (region: Region) => {
        setSelectedRegion(region);
    };

    return (
        <div className="relative w-full h-full bg-black">
            {/* 顶部导航栏 */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-cinematic text-sm">返回主界面</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-1 h-8 bg-green-500 rounded-full" />
                        <div>
                            <h1 className="text-xl font-cinematic font-bold text-white tracking-wider">智能农业地图</h1>
                            <p className="text-xs text-white/50 uppercase tracking-wide">Smart Agriculture Map</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowLayerControls(!showLayerControls)}
                            className={`p-2 border rounded-lg transition-colors ${showLayerControls ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                }`}
                            title="图层控制">
                            <Layers className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-white" title="设置">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowMapUploader(true)}
                            className={`p-2 border rounded-lg transition-colors ${mapBackground
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                }`}
                            title={mapBackground ? '底图已上传' : '上传地图底图'}>
                            <Upload className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 主地图区域 */}
            <div className="w-full h-full pt-20 pb-4">
                <MapCanvas
                    regions={regions}
                    devices={devices}
                    events={events}
                    config={mapConfig}
                    selectedRegion={selectedRegion?.id || null}
                    backgroundImage={mapBackground}
                    onRegionClick={(region: Region) => setSelectedRegion(region)}
                />
            </div>

            {/* 左侧：地块列表 */}
            <div className="absolute left-4 top-24 w-64 max-h-[calc(100vh-200px)] overflow-y-auto space-y-2 z-20">
                <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-cinematic text-white/80">地块列表</h3>
                        <button
                            onClick={() => setShowRegionEditor(true)}
                            className="p-1 hover:bg-green-500/20 rounded transition-colors group"
                            title="添加地块">
                            <Plus className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {regions.map(region => (
                            <Tooltip
                                content={
                                    <div className="space-y-2">
                                        <p className="text-xs text-white/80 font-medium mb-1">{region.name}</p>
                                        <p className="text-xs text-white/60">{region.description || '暂无描述'}</p>
                                        <p className="text-xs text-white/60">
                                            类型: <span className="font-medium">{region.type}</span>
                                        </p>
                                        {region.cropType && (
                                            <p className="text-xs text-white/60">
                                                作物: <span className="font-medium">{region.cropType}</span>
                                            </p>
                                        )}
                                        {region.currentDevices && region.currentDevices.length > 0 && (
                                            <p className="text-xs text-white/60">
                                                当前设备: <span className="font-medium">{region.currentDevices.join(', ')}</span>
                                            </p>
                                        )}
                                    </div>
                                }
                                position={region.position}
                            >
                                <button
                                    key={region.id}
                                    onClick={() => handleRegionClick(region)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${selectedRegion?.id === region.id
                                        ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/70'
                                        }`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{region.icon}</span>
                                            <span className="text-xs font-cinematic">{region.name}</span>
                                        </div>
                                        {region.status !== 'normal' && (
                                            <div className={`text-xs ${region.status === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                ⚠️ {region.status === 'critical' ? '严重' : '警告'}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* 设备列表 */}
                <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4">
                    <h3 className="text-sm font-cinematic text-white/80 mb-3">设备控制</h3>
                    <div className="space-y-3">
                        {devices.map(device => (
                            <Tooltip
                                key={device.id}
                                content={
                                    <div className="space-y-2">
                                        <p className="text-xs text-white/80 mb-1">
                                            状态: <span className={`font-medium ${
                                                device.status === 'active' ? 'text-green-400' :
                                                device.status === 'idle' ? 'text-gray-400' :
                                                device.status === 'charging' ? 'text-blue-400' :
                                                device.status === 'maintenance' ? 'text-yellow-400' :
                                                'text-red-400'
                                            }`}>
                                                {device.status === 'active' ? '运行中' :
                                                 device.status === 'idle' ? '空闲' :
                                                 device.status === 'charging' ? '充电中' :
                                                 device.status === 'maintenance' ? '维护中' : '故障'}
                                            </span>
                                        </p>
                                        <p className="text-xs text-white/80 mb-1">
                                            电池: <span className={`font-medium ${
                                                device.battery < 20 ? 'text-red-400' :
                                                device.battery < 50 ? 'text-yellow-400' : 'text-green-400'
                                            }`}>{device.battery}%</span>
                                        </p>
                                        <p className="text-xs text-white/80">
                                            类型: <span className="font-medium text-white/60">{device.type}</span>
                                        </p>
                                    </div>
                                }
                                position={device.position}
                            >
                                <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span>{device.icon}</span>
                                            <span className="text-xs text-white">{device.name}</span>
                                        </div>
                                        <button
                                            onClick={() => toggleDeviceMode(device.id)}
                                            className={`text-xs px-2 py-1 rounded ${device.controlMode === 'auto'
                                                ? 'bg-purple-500/20 text-purple-300'
                                                : 'bg-blue-500/20 text-blue-300'
                                                }`}
                                            title="切换控制模式">
                                            {device.controlMode === 'auto' ? '🤖 AI' : '👤 手动'}
                                        </button>
                                    </div>

                                <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                                    <span>🔋 {device.battery}%</span>
                                    {device.isMoving && <span className="text-green-400">• 移动中</span>}
                                    {device.currentTask && <span>• {device.currentTask}</span>}
                                </div>

                                {/* 设备控制按钮 */}
                                <div className="flex gap-1">
                                    {!device.isMoving ? (
                                        <>
                                            <button
                                                onClick={() => startAIPatrol(device.id, selectedRegion?.id || regions[0].id)}
                                                className="flex-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-xs text-green-300 transition-colors">
                                                <Play className="w-3 h-3 inline mr-1" />
                                                巡逻
                                            </button>
                                            <button
                                                onClick={() => moveDeviceTo(device.id, selectedRegion?.position || { x: 300, y: 300 })}
                                                className="flex-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-xs text-blue-300 transition-colors">
                                                <MapPin className="w-3 h-3 inline mr-1" />
                                                移动
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => stopDevice(device.id)}
                                            className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs text-red-300 transition-colors">
                                            <Square className="w-3 h-3 inline mr-1" />
                                            停止
                                        </button>
                                    )}
                                </div>
                            </div>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>

            {/* 右侧和底部面板保持不变 */}
            <div className="absolute right-4 top-24 w-80 max-h-[calc(100vh-200px)] overflow-y-auto z-20">
                <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-cinematic text-white/80">实时事件</h3>
                        <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300">
                            {events.filter(e => e.status === 'pending').length} 待处理
                        </span>
                    </div>

                    <div className="space-y-3">
                        {events.map(event => (
                            <Tooltip
                                key={event.id}
                                content={
                                    <div className="space-y-2">
                                        <p className="text-xs text-white/80 font-medium mb-1">{event.title}</p>
                                        <p className="text-xs text-white/60">{event.description}</p>
                                        <p className="text-xs text-white/60">
                                            严重程度: <span className={`font-medium ${
                                                event.severity === 'critical' ? 'text-red-400' :
                                                event.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                                            }`}>
                                                {event.severity === 'critical' ? '严重' :
                                                 event.severity === 'warning' ? '警告' : '信息'}
                                            </span>
                                        </p>
                                        <p className="text-xs text-white/50">
                                            发生时间: {new Date(event.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                }
                                position={event.position}
                                width={240}
                            >
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-3 rounded-lg border ${event.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                                        event.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                            'bg-blue-500/10 border-blue-500/30'
                                        }`}
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        <span className="text-xl">{event.icon}</span>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white">{event.title}</h4>
                                        </div>
                                </div>

                                {event.aiAnalysis && (
                                    <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs">
                                        <div className="flex items-center gap-1 text-purple-300 mb-1">
                                            <Zap className="w-3 h-3" />
                                            <span className="font-bold">AI分析</span>
                                        </div>
                                        <p className="text-white/70">{event.aiAnalysis}</p>
                                    </div>
                                )}

                                {event.aiSolution && (
                                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
                                        <div className="flex items-center gap-1 text-green-300 mb-1">
                                            <span className="font-bold">🎯 解决方案</span>
                                        </div>
                                        <p className="text-white/70">{event.aiSolution}</p>
                                    </div>
                                )}

                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-white/40">
                                        {new Date(event.timestamp).toLocaleTimeString('zh-CN')}
                                    </span>
                                    <div className="flex gap-2">
                                        {event.status === 'processing' && (
                                            <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300">
                                                处理中...
                                            </span>
                                        )}
                                        {event.aiDecisionFlow && (
                                            <button
                                                onClick={() => setSelectedEvent(event)}
                                                className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded text-purple-300 transition-colors flex items-center gap-1">
                                                <Zap className="w-3 h-3" />
                                                AI决策
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedEvent && selectedEvent.aiDecisionFlow && (
                    <AIDecisionPanel
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                    />
                )}
            </AnimatePresence>




            {/* 底部：选中地块详情 */}
            <AnimatePresence>
                {selectedRegion && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[600px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-6 z-20">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{selectedRegion.icon}</span>
                                <div>
                                    <h3 className="text-lg font-cinematic text-white">{selectedRegion.name}</h3>
                                    <p className="text-sm text-white/60">{selectedRegion.description}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRegion(null)} className="text-white/60 hover:text-white">✕</button>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-white/40">状态</p>
                                <p className={`font-bold ${selectedRegion.status === 'normal' ? 'text-green-400' :
                                    selectedRegion.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {selectedRegion.status === 'normal' ? '正常' :
                                        selectedRegion.status === 'warning' ? '警告' : '严重'}
                                </p>
                            </div>
                            <div>
                                <p className="text-white/40">作物</p>
                                <p className="text-white">{selectedRegion.cropType || '-'}</p>
                            </div>
                            <div>
                                <p className="text-white/40">设备</p>
                                <p className="text-white">{selectedRegion.currentDevices.length} 台</p>
                            </div>
                            <div>
                                <p className="text-white/40">事件</p>
                                <p className="text-white">{selectedRegion.recentEvents.length} 个</p>
                            </div>
                        </div>

                        {selectedRegion.aiRecommendation && (
                            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-purple-300 mb-2">
                                    <Zap className="w-4 h-4" />
                                    <span className="font-bold text-sm">AI建议</span>
                                </div>
                                <p className="text-sm text-white/70">{selectedRegion.aiRecommendation}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 地块编辑器 */}
            {
                showRegionEditor && (
                    <RegionEditor
                        onSave={(newRegion) => {
                            setRegions(prev => [...prev, newRegion]);
                            setShowRegionEditor(false);
                        }}
                        onCancel={() => setShowRegionEditor(false)}
                        existingRegions={regions}
                        canvasBounds={mapConfig.bounds}
                    />
                )
            }

            {/* 地图上传器 */}
            {showMapUploader && (
                <MapUploader
                    onImageUpload={async (imageData) => {
                        await mapImageStorage.saveImage(imageData);
                        setMapBackground(imageData);
                        setShowMapUploader(false);
                    }}
                    onClose={() => setShowMapUploader(false)}
                    canvasBounds={mapConfig.bounds}
                />
            )}
        </div >
    );
};
