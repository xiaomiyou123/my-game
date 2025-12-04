import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanoramaViewer } from './PanoramaViewer';
import { MiniMap } from './MiniMap';
import { PathVisualizer } from './PathVisualizer';
import { WaypointEditor } from './WaypointEditor';
import { SceneManagerPanel } from './SceneManagerPanel';
import { PathManagerPanel } from './PathManagerPanel';
import { DeviceMonitorPanel } from './DeviceMonitorPanel';
import { PanoramaUploader } from './PanoramaUploader';
import { PathPlanning } from './PathPlanning';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Map as MapIcon, Camera, Settings, ArrowLeft, Globe, Route, Edit3, Upload, FolderOpen, Activity, Plus } from 'lucide-react';
import { demoScenes } from '../data/panoramaScenes';
import { SceneManager } from '../services/SceneManager';
import type { PanoramaScene, Waypoint } from '../data/panoramaScenes';

export const InspectionCenter: React.FC = () => {
    const navigate = useNavigate();
    const [currentScene, setCurrentScene] = useState<PanoramaScene>(demoScenes[0]);
    const [showStats, setShowStats] = useState(true);
    const [viewMode, setViewMode] = useState<'panorama' | 'satellite'>('panorama');
    const [showMiniMap, setShowMiniMap] = useState(true);
    const [patrolPath, setPatrolPath] = useState<PanoramaScene[]>([]);
    const [showPathVisualizer, setShowPathVisualizer] = useState(false);
    const [showWaypointEditor, setShowWaypointEditor] = useState(false);
    const [showSceneManager, setShowSceneManager] = useState(false);
    const [showPathManager, setShowPathManager] = useState(false);
    const [showDeviceMonitor, setShowDeviceMonitor] = useState(false);
    const [showUploadPanel, setShowUploadPanel] = useState(false);
    const [showPathPlanning, setShowPathPlanning] = useState(false);
    const [customScenes, setCustomScenes] = useState<PanoramaScene[]>([]);

    // 组件挂载时加载自定义场景
    React.useEffect(() => {
        const scenes = SceneManager.loadScenes();
        setCustomScenes(scenes);
    }, []);

    const handleSceneChange = (scene: PanoramaScene) => {
        setCurrentScene(scene);
    };

    const handlePathChange = (path: PanoramaScene[]) => {
        setPatrolPath(path);
    };

    const handleWaypointPreview = (waypoint: Waypoint) => {
        const targetScene = demoScenes.find(s => s.id === waypoint.sceneId);
        if (targetScene) {
            handleSceneChange(targetScene);
            // 这里可以添加更复杂的相机视角控制
        }
    };

    const handleSceneCreate = (scene: PanoramaScene) => {
        // 保存场景到本地存储
        const success = SceneManager.saveScene(scene);
        if (success) {
            // 更新自定义场景列表
            const updatedCustomScenes = [...customScenes, scene];
            setCustomScenes(updatedCustomScenes);
            
            // 切换到新创建的场景
            setCurrentScene(scene);
            
            // 关闭上传面板
            setShowUploadPanel(false);
        } else {
            alert('保存场景失败，请重试');
        }
    };

    const handleImageUpload = (imageUrl: string) => {
        // 创建临时场景用于预览
        const tempScene: PanoramaScene = {
            id: `temp-${Date.now()}`,
            name: '新上传的全景图',
            imageUrl,
            position: {
                lat: 24.5000 + Math.random() * 0.01,
                lng: 118.0833 + Math.random() * 0.01
            },
            hotspots: []
        };
        setCurrentScene(tempScene);
    };

    return (
        <div className="relative w-full h-full bg-black">
            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Left: Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-cinematic text-sm">返回主界面</span>
                    </button>

                    {/* Center: Title */}
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-8 bg-green-500 rounded-full" />
                        <div>
                            <h1 className="text-xl font-cinematic font-bold text-white tracking-wider">
                                智慧巡检中心
                            </h1>
                            <p className="text-xs text-white/50 uppercase tracking-wide">Smart Inspection Center</p>
                        </div>
                    </div>

                    {/* Right: View Controls */}
                    <div className="flex items-center gap-2">
                        {/* View Mode Switch */}
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => setViewMode('panorama')}
                                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${viewMode === 'panorama'
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    : 'text-white/60 hover:text-white/80'
                                    }`}
                            >
                                <Camera className="w-4 h-4" />
                                <span className="text-xs font-cinematic">全景</span>
                            </button>
                            <button
                                onClick={() => setViewMode('satellite')}
                                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${viewMode === 'satellite'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'text-white/60 hover:text-white/80'
                                    }`}
                            >
                                <Globe className="w-4 h-4" />
                                <span className="text-xs font-cinematic">卫星</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowSceneManager(!showSceneManager)}
                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                            title="Toggle Scene Manager"
                        >
                            <FolderOpen className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => setShowWaypointEditor(!showWaypointEditor)}
                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                            title="Toggle Waypoint Editor"
                        >
                            <Edit3 className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => setShowPathManager(!showPathManager)}
                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                            title="Toggle Path Manager"
                        >
                            <Route className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => setShowDeviceMonitor(!showDeviceMonitor)}
                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                            title="Toggle Device Monitor"
                        >
                            <Activity className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => setShowPathPlanning(!showPathPlanning)}
                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                            title="Toggle Path Planning"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => setShowMiniMap(!showMiniMap)}
                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                            title="Toggle MiniMap"
                        >
                            <MapIcon className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                            title="Toggle Stats"
                        >
                            <Settings className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>

                {/* Main Content Area with Top Padding */}
                <div className="w-full h-full pt-16">
                    {viewMode === 'panorama' ? (
                        <PanoramaViewer
                            currentScene={currentScene}
                            onSceneChange={handleSceneChange}
                            customScenes={customScenes}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-black">
                            <div className="text-center">
                                <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-xl font-cinematic text-white mb-2">卫星地图视图</h3>
                                <p className="text-white/60 text-sm">即将推出...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 上传按钮 - 明显可见 */}
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadPanel(true)}
                    className="fixed top-20 right-6 z-30 px-4 py-2 bg-gradient-to-r from-green-500/80 to-blue-500/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm font-cinematic flex items-center gap-2 shadow-lg"
                >
                    <Upload className="w-4 h-4" />
                    上传全景图
                </motion.button>

            {/* Left Stats Panel */}
            <AnimatePresence>
                {showStats && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="absolute left-4 top-24 bottom-36 overflow-y-auto w-64 space-y-4 z-20"
                    >
                        {/* Device Statistics */}
                        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4">
                            <h3 className="text-sm font-cinematic text-green-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                设备统计
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/60">无人机</span>
                                    <span className="text-sm text-white font-bold">3 / 5</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/60">巡逻车</span>
                                    <span className="text-sm text-white font-bold">2 / 3</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/60">传感器</span>
                                    <span className="text-sm text-green-400 font-bold">124 在线</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Navigation */}
                        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4">
                            <h3 className="text-sm font-cinematic text-blue-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                <Navigation className="w-4 h-4" />
                                快速导航
                            </h3>
                            <div className="space-y-2">
                                {demoScenes.map((scene) => (
                                    <button
                                        key={scene.id}
                                        onClick={() => handleSceneChange(scene)}
                                        className={`w-full text-left px-3 py-2 rounded transition-colors ${currentScene.id === scene.id
                                            ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                                            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/70'
                                            }`}
                                    >
                                        <p className="text-xs font-cinematic">{scene.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scene Info */}
                        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4">
                            <h3 className="text-sm font-cinematic text-yellow-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                <MapIcon className="w-4 h-4" />
                                场景信息
                            </h3>
                            <div className="space-y-2 text-xs text-white/60">
                                <p>坐标: 24°30'N, 118°05'E</p>
                                <p>视角: 360° 全景</p>
                                <p>更新时间: {new Date().toLocaleString('zh-CN')}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Path Visualizer Panel */}
            <AnimatePresence>
                {showPathVisualizer && viewMode === 'panorama' && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute bottom-4 left-4 right-80 z-20"
                    >
                        <PathVisualizer
                            scenes={demoScenes}
                            currentScene={currentScene}
                            onSceneSelect={handleSceneChange}
                            onPathChange={handlePathChange}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Waypoint Editor Panel */}
            <AnimatePresence>
                {showWaypointEditor && viewMode === 'panorama' && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute top-20 bottom-36 right-4 w-80 z-20 overflow-hidden"
                    >
                        <WaypointEditor
                            scenes={demoScenes}
                            onPreview={handleWaypointPreview}
                            onSave={(path) => {
                                console.log('Saved path:', path);
                                // 可以将路径保存到本地存储或后端
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scene Manager Panel */}
            <AnimatePresence>
                {showSceneManager && viewMode === 'panorama' && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute top-20 bottom-36 left-4 w-80 z-20 overflow-hidden"
                    >
                        <SceneManagerPanel
                            onSceneSelect={handleSceneChange}
                            onSceneCreate={handleSceneCreate}
                            customScenes={customScenes}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Path Manager Panel */}
            <AnimatePresence>
                {showPathManager && viewMode === 'panorama' && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute top-20 bottom-36 right-4 w-80 z-20 overflow-hidden"
                    >
                        <PathManagerPanel
                            onPathSelect={(path) => {
                                // 这里可以添加路径选择后的处理逻辑
                                console.log('Selected path:', path);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Device Monitor Panel */}
            <AnimatePresence>
                {showDeviceMonitor && viewMode === 'panorama' && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute top-20 bottom-36 right-96 w-96 z-20 overflow-hidden"
                    >
                        <DeviceMonitorPanel />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MiniMap - Bottom Right */}
            <AnimatePresence>
                {showMiniMap && viewMode === 'panorama' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 50 }}
                        className="absolute bottom-4 right-4 z-20"
                    >
                        <MiniMap
                            currentScene={currentScene}
                            scenes={demoScenes}
                            onSceneSelect={handleSceneChange}
                            showPath={patrolPath.length > 0}
                            path={patrolPath}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Path Planning Panel */}
            <AnimatePresence>
                {showPathPlanning && viewMode === 'panorama' && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="absolute top-20 bottom-36 left-4 w-80 z-20 overflow-hidden"
                    >
                        <PathPlanning
                            scenes={[...demoScenes, ...customScenes]}
                            onPathCreate={(path) => {
                                console.log('Created path:', path);
                                setShowPathPlanning(false);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Panel Modal */}
            <AnimatePresence>
                {showUploadPanel && (
                    <PanoramaUploader
                        onImageUpload={handleImageUpload}
                        onSceneCreate={handleSceneCreate}
                        onClose={() => setShowUploadPanel(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
