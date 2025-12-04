import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Play, Pause, Square, Maximize2, ChevronLeft, ChevronRight, Upload as UploadIcon } from 'lucide-react';
import { PanoramaCameraController } from '../services/PanoramaCameraController';
import { demoScenes, dronePatrolPaths, vehiclePatrolPaths } from '../data/panoramaScenes';
import type { PanoramaScene, Hotspot } from '../data/panoramaScenes';
import { PanoramaUploader } from './PanoramaUploader';

interface PanoramaViewerProps {
    currentScene?: PanoramaScene;
    onSceneChange?: (scene: PanoramaScene) => void;
    className?: string;
    customScenes?: PanoramaScene[];
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
    currentScene: initialScene,
    onSceneChange,
    className = '',
    customScenes = []
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<any>(null);
    const controllerRef = useRef<PanoramaCameraController | null>(null);

    const [currentScene, setCurrentScene] = useState<PanoramaScene>(initialScene || demoScenes[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'manual' | 'drone' | 'vehicle'>('manual');
    const [isPlaying, setIsPlaying] = useState(false);
    const [availableScenes, setAvailableScenes] = useState<PanoramaScene[]>([...demoScenes, ...customScenes]);
    const [showUploadPanel, setShowUploadPanel] = useState(false);
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [localCustomScenes, setLocalCustomScenes] = useState<PanoramaScene[]>(customScenes);
    
    // 当customScenes变化时更新availableScenes
    useEffect(() => {
        setAvailableScenes([...demoScenes, ...customScenes]);
        setLocalCustomScenes(customScenes);
    }, [customScenes]);

    // 初始化Pannellum查看器
    useEffect(() => {
        if (!containerRef.current || viewerRef.current) return;

        // 动态加载pannellum CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        document.head.appendChild(link);

        // 动态加载pannellum JS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        script.onload = () => {
            initViewer();
        };
        document.head.appendChild(script);

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
            }
            link.remove();
            script.remove();
        };
    }, []);

    const initViewer = () => {
        if (!containerRef.current || !(window as any).pannellum) return;

        const pannellum = (window as any).pannellum;

        // 创建查看器配置
        const config = {
            type: 'equirectangular',
            panorama: currentScene.imageUrl,
            autoLoad: true,
            showControls: false,
            mouseZoom: true,
            showFullscreenCtrl: false,
            showZoomCtrl: false,
            hfov: 90,
            minHfov: 30,
            maxHfov: 120,
            pitch: 0,
            yaw: 0,
            hotSpots: currentScene.hotspots.map((hotspot: Hotspot) => ({
                pitch: hotspot.pitch,
                yaw: hotspot.yaw,
                type: 'custom',
                cssClass: 'custom-hotspot',
                createTooltipFunc: (div: HTMLElement) => {
                    div.innerHTML = `
            <div class="hotspot-tooltip">
              <span class="hotspot-icon">${hotspot.icon || '📍'}</span>
              <span class="hotspot-label">${hotspot.label}</span>
            </div>
          `;
                },
                clickHandlerFunc: () => handleHotspotClick(hotspot)
            }))
        };

        viewerRef.current = pannellum.viewer(containerRef.current, config);

        // 初始化相机控制器
        controllerRef.current = new PanoramaCameraController(
            viewerRef.current,
            {
                sceneId: currentScene.id,
                yaw: 0,
                pitch: 0,
                fov: 90
            }
        );

        viewerRef.current.on('load', () => {
            setIsLoading(false);
        });

        viewerRef.current.on('error', (err: any) => {
            console.error('Panorama load error:', err);
            setIsLoading(false);
        });
    };

    // 处理热点点击
    const handleHotspotClick = (hotspot: Hotspot) => {
        // 添加点击反馈动画
        const hotspotElement = document.querySelector(`.custom-hotspot`) as HTMLElement;
        if (hotspotElement) {
            hotspotElement.style.transform = 'scale(1.5)';
            hotspotElement.style.transition = 'transform 0.3s ease-out';
            
            setTimeout(() => {
                hotspotElement.style.transform = 'scale(1)';
            }, 300);
        }

        if (hotspot.type === 'scene' && hotspot.targetSceneId) {
            const targetScene = availableScenes.find(s => s.id === hotspot.targetSceneId);
            if (targetScene) {
                navigateToScene(targetScene, hotspot);
            }
        } else if (hotspot.onClick) {
            hotspot.onClick();
        }
    };

    // 导航到新场景
    const navigateToScene = async (scene: PanoramaScene, fromHotspot?: Hotspot) => {
        if (!controllerRef.current || scene.id === currentScene.id) return;

        setIsLoading(true);

        // 添加场景切换动画效果
        const transitionDuration = 1500;
        
        // 如果是从热点点击导航，计算目标视角
        let targetYaw = 0;
        let targetPitch = 0;
        
        if (fromHotspot) {
            // 热点导航：保持视角方向，稍微调整以适应新场景
            const currentView = controllerRef.current.getCurrentView();
            targetYaw = currentView.yaw;
            targetPitch = currentView.pitch;
        }

        // 场景切换动画 - 增强版
        if (viewerRef.current) {
            // 添加过渡效果
            const container = containerRef.current;
            
            // 创建场景切换动画
            const animateSceneTransition = async () => {
                // 淡出当前场景并添加缩放效果
                if (container) {
                    container.style.transition = `opacity ${transitionDuration/2}ms ease-in-out, transform ${transitionDuration/2}ms ease-in-out`;
                    container.style.opacity = '0';
                    container.style.transform = 'scale(0.9) rotate(5deg)';
                }
                
                // 等待淡出完成
                await new Promise(resolve => setTimeout(resolve, transitionDuration/2));
                
                // 加载新场景
                if (viewerRef.current) {
                    // 先销毁旧场景
                    viewerRef.current.destroy();
                    viewerRef.current = null;
                    
                    // 创建新查看器
                    const pannellum = (window as any).pannellum;
                    viewerRef.current = pannellum.viewer(containerRef.current, {
                        type: 'equirectangular',
                        panorama: scene.imageUrl,
                        autoLoad: true,
                        showControls: false,
                        mouseZoom: true,
                        showFullscreenCtrl: false,
                        showZoomCtrl: false,
                        hfov: 90,
                        minHfov: 30,
                        maxHfov: 120,
                        pitch: targetPitch,
                        yaw: targetYaw,
                        hotSpots: scene.hotspots.map((hotspot: Hotspot) => ({
                            pitch: hotspot.pitch,
                            yaw: hotspot.yaw,
                            type: 'custom',
                            cssClass: 'custom-hotspot',
                            createTooltipFunc: (div: HTMLElement) => {
                                div.innerHTML = `
                        <div class="hotspot-tooltip">
                          <span class="hotspot-icon">${hotspot.icon || '📍'}</span>
                          <span class="hotspot-label">${hotspot.label}</span>
                        </div>
                      `;
                            },
                            clickHandlerFunc: () => handleHotspotClick(hotspot)
                        }))
                    });
                    
                    // 重新创建控制器
                    controllerRef.current = new PanoramaCameraController(
                        viewerRef.current,
                        {
                            sceneId: scene.id,
                            yaw: targetYaw,
                            pitch: targetPitch,
                            fov: 90
                        }
                    );
                    
                    // 等待场景加载
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                // 淡入新场景，带有旋转和缩放效果
                if (container) {
                    container.style.transition = `opacity ${transitionDuration/2}ms ease-in-out, transform ${transitionDuration/2}ms ease-in-out`;
                    container.style.opacity = '1';
                    container.style.transform = 'scale(1) rotate(0deg)';
                }
                
                setCurrentScene(scene);
                setIsLoading(false);
                onSceneChange?.(scene);
            };
            
            // 执行动画
            animateSceneTransition();
        }
    };

    // 无人机视角巡航
    const startDronePatrol = async () => {
        if (!controllerRef.current || isPlaying) return;

        setViewMode('drone');
        setIsPlaying(true);

        const path = dronePatrolPaths['greenhouse-a-full'];

        try {
            await controllerRef.current.flyAlongPath(path);
        } catch (error) {
            console.error('Drone patrol error:', error);
        }

        setIsPlaying(false);
    };

    // 巡逻车视角
    const startVehiclePatrol = async () => {
        if (!controllerRef.current || isPlaying) return;

        setViewMode('vehicle');
        setIsPlaying(true);

        const path = vehiclePatrolPaths['perimeter'];

        try {
            await controllerRef.current.driveAlongPath(path);
        } catch (error) {
            console.error('Vehicle patrol error:', error);
        }

        setIsPlaying(false);
    };

    // 停止自动巡航
    const stopPatrol = () => {
        if (controllerRef.current) {
            controllerRef.current.stop();
        }
        setIsPlaying(false);
        setViewMode('manual');
    };

    // 场景快速切换
    const nextScene = () => {
        const currentIndex = availableScenes.findIndex(s => s.id === currentScene.id);
        const nextIndex = (currentIndex + 1) % availableScenes.length;
        navigateToScene(availableScenes[nextIndex]);
    };

    const prevScene = () => {
        const currentIndex = availableScenes.findIndex(s => s.id === currentScene.id);
        const prevIndex = (currentIndex - 1 + availableScenes.length) % availableScenes.length;
        navigateToScene(availableScenes[prevIndex]);
    };

    // 处理自定义图片上传
    const handleCustomImageUpload = (imageUrl: string) => {
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
        navigateToScene(tempScene);
        setShowUploadPanel(false);
    };

    // 处理场景创建
    const handleSceneCreate = (scene: PanoramaScene) => {
        // 添加到自定义场景列表
        const updatedCustomScenes = [...localCustomScenes, scene];
        setLocalCustomScenes(updatedCustomScenes);
        // 更新可用场景列表
        setAvailableScenes([...demoScenes, ...updatedCustomScenes]);
        // 切换到新创建的场景
        navigateToScene(scene);
        setShowUploadPanel(false);
    };

    return (
        <div className={`relative w-full h-full ${className}`}>
            {/* Pannellum容器 */}
            <div
                ref={containerRef}
                className="w-full h-full"

            />

            {/* 加载指示器 */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"
                    >
                        <div className="text-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-500 rounded-full animate-spin mx-auto mb-4" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                            </div>
                            <p className="text-white/60 font-cinematic">
                                <motion.span
                                    initial={{ opacity: 0.5 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    Loading Panorama...
                                </motion.span>
                            </p>
                            <div className="mt-4 flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 顶部信息栏 */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 pointer-events-auto">
                    <p className="text-xs text-white/50 uppercase tracking-wide font-cinematic mb-1">当前位置</p>
                    <p className="text-base text-white font-bold">{currentScene.name}</p>
                    {currentScene.metadata && (
                        <p className="text-xs text-white/60 mt-1">{currentScene.metadata.description}</p>
                    )}
                </div>

                {/* 视角模式指示 */}
                {viewMode !== 'manual' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-purple-500/20 backdrop-blur-md border border-purple-500/50 rounded-lg px-4 py-2 pointer-events-auto"
                    >
                        <p className="text-xs text-purple-300 font-cinematic flex items-center gap-2">
                            {viewMode === 'drone' ? '🚁 无人机视角' : '🚗 巡逻车视角'}
                            {isPlaying && <span className="animate-pulse">• 巡航中</span>}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* 底部控制栏 */}
            <div className="absolute bottom-4 left-4 right-4 z-40 pointer-events-none">
                <div className="flex items-center justify-between">
                    {/* 场景切换 */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={prevScene}
                            className="p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                            title="上一个场景"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={nextScene}
                            className="p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                            title="下一个场景"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* 视角控制 */}
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-2 pointer-events-auto">
                        <button
                            onClick={() => {
                                stopPatrol();
                                setViewMode('manual');
                            }}
                            className={`px-4 py-2 rounded-lg transition-all font-cinematic text-sm ${viewMode === 'manual'
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            👤 手动
                        </button>
                        <button
                            onClick={startDronePatrol}
                            disabled={isPlaying}
                            className={`px-4 py-2 rounded-lg transition-all font-cinematic text-sm disabled:opacity-50 ${viewMode === 'drone'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            🚁 无人机
                        </button>
                        <button
                            onClick={startVehiclePatrol}
                            disabled={isPlaying}
                            className={`px-4 py-2 rounded-lg transition-all font-cinematic text-sm disabled:opacity-50 ${viewMode === 'vehicle'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            🚗 巡逻车
                        </button>

                        {isPlaying && (
                            <button
                                onClick={stopPatrol}
                                className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all font-cinematic text-sm"
                            >
                                <Square className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* 提示信息 */}
                    <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 pointer-events-auto">
                        <p className="text-xs text-white/60 font-cinematic">
                            🖱️ 拖拽查看 • 滚轮缩放
                        </p>
                    </div>

                    {/* 上传按钮 - 备用 */}
                    <button
                        onClick={() => setShowUploadPanel(true)}
                        className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 hover:bg-white/10 transition-colors text-white text-sm font-cinematic pointer-events-auto flex items-center gap-2"
                    >
                        <UploadIcon className="w-4 h-4" />
                        上传全景图
                    </button>
                </div>
            </div>


            {/* 图片上传面板 */}
            <AnimatePresence>
                {showUploadPanel && (
                    <PanoramaUploader
                        onImageUpload={handleCustomImageUpload}
                        onSceneCreate={handleSceneCreate}
                        onClose={() => setShowUploadPanel(false)}
                    />
                )}
            </AnimatePresence>

            {/* 自定义热点样式 */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-hotspot {
          width: 40px;
          height: 40px;
          background: rgba(34, 197, 94, 0.2);
          border: 2px solid rgba(34, 197, 94, 0.5);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: pulse 2s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .custom-hotspot:hover {
          background: rgba(34, 197, 94, 0.4);
          border-color: rgba(34, 197, 94, 0.8);
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
        }
        
        .custom-hotspot::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.3);
          animation: ripple 1.5s ease-out infinite;
        }
        
        .hotspot-tooltip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          white-space: nowrap;
          font-family: 'Cinematic', sans-serif;
          font-size: 14px;
          color: white;
          pointer-events: none;
        }
        
        .hotspot-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.8);
        }
        
        .hotspot-icon {
          font-size: 18px;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}} />
        </div >
    );
};
