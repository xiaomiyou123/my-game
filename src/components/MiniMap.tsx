import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Maximize2, Minimize2 } from 'lucide-react';
import { demoScenes } from '../data/panoramaScenes';
import type { PanoramaScene } from '../data/panoramaScenes';

interface MiniMapProps {
  currentScene: PanoramaScene;
  scenes?: PanoramaScene[];
  onSceneSelect?: (scene: PanoramaScene) => void;
  showPath?: boolean;
  path?: PanoramaScene[];
  className?: string;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  currentScene,
  scenes = demoScenes,
  onSceneSelect,
  showPath = false,
  path = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredScene, setHoveredScene] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // 计算场景在小地图上的位置
  const calculateScenePosition = (scene: PanoramaScene) => {
    // 将地理坐标映射到2D平面坐标
    // 这里简化处理，实际项目中应该根据实际地图范围进行比例换算
    const lat = scene.position.lat;
    const lng = scene.position.lng;
    
    // 基准点 (24.5000, 118.0833)
    const baseLat = 24.5000;
    const baseLng = 118.0833;
    
    // 简单的线性映射（每度大约111km，我们将其缩放到像素）
    const scale = 5000; // 调整这个值来改变地图的缩放级别
    const x = ((lng - baseLng) * scale) + 100; // 100是偏移量，使地图居中
    const y = ((baseLat - lat) * scale) + 100; // 纬度是反向的
    
    return { x, y };
  };

  // 获取场景的图标
  const getSceneIcon = (scene: PanoramaScene) => {
    if (scene.metadata?.area === 'greenhouse-a') return '🏠';
    if (scene.metadata?.area === 'greenhouse-b') return '🏡';
    if (scene.metadata?.area === 'field') return '🌾';
    return '📍';
  };

  // 处理场景点击
  const handleSceneClick = (scene: PanoramaScene) => {
    if (onSceneSelect) {
      onSceneSelect(scene);
    }
  };

  // 获取路径点的连接线
  const getPathConnections = () => {
    if (!showPath || path.length < 2) return [];
    
    const connections = [];
    for (let i = 0; i < path.length - 1; i++) {
      const from = calculateScenePosition(path[i]);
      const to = calculateScenePosition(path[i + 1]);
      connections.push({ from, to });
    }
    
    return connections;
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-black/80 backdrop-blur-md border border-white/20 rounded-lg ${
          isExpanded ? 'w-80 h-80' : 'w-40 h-40'
        } overflow-hidden transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-xs font-cinematic text-white/80 uppercase tracking-wider">
              导航地图
            </span>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="w-3 h-3 text-white/60" />
            ) : (
              <Maximize2 className="w-3 h-3 text-white/60" />
            )}
          </button>
        </div>

        {/* Map Content */}
        <div 
          ref={mapRef}
          className="relative w-full h-full overflow-hidden bg-green-950/20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
              linear-gradient(45deg, rgba(34, 197, 94, 0.02) 25%, transparent 25%, transparent 50%, rgba(34, 197, 94, 0.02) 50%, rgba(34, 197, 94, 0.02) 75%, transparent 75%, transparent)
            `,
            backgroundSize: '20px 20px, 20px 20px, 20px 20px'
          }}
        >
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Path Lines */}
          {showPath && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {getPathConnections().map((conn, index) => (
                <line
                  key={index}
                  x1={`${(conn.from.x / 200) * 100}%`}
                  y1={`${(conn.from.y / 200) * 100}%`}
                  x2={`${(conn.to.x / 200) * 100}%`}
                  y2={`${(conn.to.y / 200) * 100}%`}
                  stroke="rgba(34, 197, 94, 0.6)"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  className="animate-pulse"
                />
              ))}
            </svg>
          )}

          {/* Scene Points */}
          {scenes.map((scene) => {
            const position = calculateScenePosition(scene);
            const isCurrentScene = scene.id === currentScene.id;
            const isInPath = showPath && path.some(p => p.id === scene.id);
            const isHovered = hoveredScene === scene.id;
            
            return (
              <motion.div
                key={scene.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                  isCurrentScene ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${(position.x / 200) * 100}%`,
                  top: `${(position.y / 200) * 100}%`,
                }}
                whileHover={{ scale: 1.2 }}
                onMouseEnter={() => setHoveredScene(scene.id)}
                onMouseLeave={() => setHoveredScene(null)}
                onClick={() => handleSceneClick(scene)}
              >
                {/* Scene Marker */}
                <div
                  className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                    isCurrentScene
                      ? 'bg-green-500 border-green-300 shadow-[0_0_20px_rgba(34,197,94,0.8)]'
                      : isInPath
                      ? 'bg-blue-500/70 border-blue-300'
                      : 'bg-white/10 border-white/30 hover:bg-white/20'
                  }`}
                >
                  {/* Inner Pulse for Current Scene */}
                  {isCurrentScene && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ opacity: 0.3 }}
                    />
                  )}
                  
                  {/* Scene Icon */}
                  <span className="text-xs">{getSceneIcon(scene)}</span>
                </div>

                {/* Scene Tooltip */}
                <AnimatePresence>
                  {(isHovered || isExpanded) && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className={`absolute ${
                        isExpanded ? 'bottom-8 left-1/2 -translate-x-1/2' : 'top-8 left-1/2 -translate-x-1/2'
                      } bg-black/80 backdrop-blur-sm border border-white/20 rounded px-2 py-1 whitespace-nowrap z-30`}
                    >
                      <p className="text-xs text-white font-medium">{scene.name}</p>
                      {scene.metadata?.description && isExpanded && (
                        <p className="text-xs text-white/60">{scene.metadata.description}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Current Position Indicator */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none"
            style={{
              left: `${(calculateScenePosition(currentScene).x / 200) * 100}%`,
              top: `${(calculateScenePosition(currentScene).y / 200) * 100}%`,
            }}
          >
            <motion.div
              className="relative flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <Navigation className="w-4 h-4 text-green-400" />
            </motion.div>
          </div>
        </div>

        {/* Expand Mode: Scene List */}
        {isExpanded && (
          <div className="p-3 border-t border-white/10 max-h-32 overflow-y-auto">
            <p className="text-xs font-cinematic text-white/60 uppercase tracking-wider mb-2">场景列表</p>
            <div className="space-y-1">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneClick(scene)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    scene.id === currentScene.id
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{getSceneIcon(scene)}</span>
                    <span>{scene.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};