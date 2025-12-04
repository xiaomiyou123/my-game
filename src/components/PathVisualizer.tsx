import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, MapPin, Route } from 'lucide-react';
import type { PanoramaScene, CameraPosition } from '../data/panoramaScenes';

interface PathVisualizerProps {
  scenes: PanoramaScene[];
  currentScene: PanoramaScene;
  onSceneSelect?: (scene: PanoramaScene) => void;
  onPathChange?: (path: PanoramaScene[]) => void;
  className?: string;
}

interface Waypoint {
  id: string;
  scene: PanoramaScene;
  position: CameraPosition;
  order: number;
}

export const PathVisualizer: React.FC<PathVisualizerProps> = ({
  scenes,
  currentScene,
  onSceneSelect,
  onPathChange,
  className = ''
}) => {
  const [path, setPath] = useState<Waypoint[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [isCreatingPath, setIsCreatingPath] = useState(false);
  const animationRef = useRef<number | null>(null);

  // 添加场景到路径
  const addSceneToPath = (scene: PanoramaScene) => {
    if (!isCreatingPath) return;
    
    const newWaypoint: Waypoint = {
      id: `wp-${Date.now()}`,
      scene,
      position: {
        sceneId: scene.id,
        yaw: 0,
        pitch: 0,
        fov: 90
      },
      order: path.length
    };
    
    const newPath = [...path, newWaypoint];
    setPath(newPath);
    onPathChange?.(newPath.map(wp => wp.scene));
  };

  // 从路径中移除场景
  const removeSceneFromPath = (waypointId: string) => {
    const newPath = path.filter(wp => wp.id !== waypointId).map((wp, index) => ({
      ...wp,
      order: index
    }));
    setPath(newPath);
    onPathChange?.(newPath.map(wp => wp.scene));
  };

  // 播放路径动画
  const startPathAnimation = () => {
    if (path.length === 0) return;
    
    setIsPlaying(true);
    setCurrentWaypointIndex(0);
    
    // 播放第一个场景
    if (path[0]) {
      onSceneSelect?.(path[0].scene);
    }
    
    // 设置定时器播放后续场景
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index >= path.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      
      setCurrentWaypointIndex(index);
      if (path[index]) {
        onSceneSelect?.(path[index].scene);
      }
    }, 3000); // 每3秒切换一个场景
    
    animationRef.current = interval as unknown as number;
  };

  // 停止路径动画
  const stopPathAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  };

  // 重置路径
  const resetPath = () => {
    stopPathAnimation();
    setPath([]);
    setCurrentWaypointIndex(0);
    onPathChange?.([]);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinematic text-green-400 uppercase tracking-wide flex items-center gap-2">
          <Route className="w-4 h-4" />
          路径规划
        </h3>
        
        <div className="flex items-center gap-2">
          {/* 路径创建切换 */}
          <button
            onClick={() => setIsCreatingPath(!isCreatingPath)}
            className={`px-3 py-1.5 rounded-lg text-xs font-cinematic transition-all ${
              isCreatingPath 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-white/10 text-white/70 border border-white/20'
            }`}
          >
            {isCreatingPath ? '完成路径' : '创建路径'}
          </button>
          
          {/* 路径控制 */}
          {path.length > 0 && (
            <>
              {!isPlaying ? (
                <button
                  onClick={startPathAnimation}
                  className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors"
                  title="播放路径"
                >
                  <Play className="w-4 h-4 text-green-300" />
                </button>
              ) : (
                <button
                  onClick={stopPathAnimation}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
                  title="停止播放"
                >
                  <Pause className="w-4 h-4 text-red-300" />
                </button>
              )}
              
              <button
                onClick={resetPath}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                title="重置路径"
              >
                <RotateCcw className="w-4 h-4 text-white/70" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 创建路径提示 */}
      <AnimatePresence>
        {isCreatingPath && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <p className="text-xs text-green-300">
              点击下方场景列表中的场景，按顺序添加到路径中。完成后点击"完成路径"按钮。
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 场景列表 */}
      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        <h4 className="text-xs font-cinematic text-white/60 uppercase tracking-wide">可用场景</h4>
        {scenes.map((scene, index) => (
          <motion.button
            key={scene.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              if (isCreatingPath) {
                addSceneToPath(scene);
              } else {
                onSceneSelect?.(scene);
              }
            }}
            className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
              scene.id === currentScene.id
                ? 'bg-green-500/20 border-green-500/50 text-green-300'
                : isCreatingPath
                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span className="text-xs font-cinematic">{scene.name}</span>
              </div>
              {isCreatingPath && (
                <span className="text-xs text-white/50">点击添加</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* 路径预览 */}
      {path.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-cinematic text-white/60 uppercase tracking-wide">当前路径</h4>
          <div className="flex flex-wrap gap-2">
            {path.map((waypoint, index) => (
              <motion.div
                key={waypoint.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative px-3 py-2 rounded-lg border text-xs font-cinematic transition-all ${
                  isPlaying && index === currentWaypointIndex
                    ? 'bg-green-500/30 border-green-500/50 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : 'bg-white/10 border-white/20 text-white/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span>{waypoint.scene.name}</span>
                </div>
                
                {/* 路径连接线 */}
                {index < path.length - 1 && (
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-green-500">
                    →
                  </div>
                )}
                
                {/* 删除按钮 */}
                {!isPlaying && (
                  <button
                    onClick={() => removeSceneFromPath(waypoint.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* 路径统计信息 */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
            <span>共 {path.length} 个场景</span>
            <span>预计时长: {path.length * 3} 秒</span>
          </div>
        </div>
      )}
    </div>
  );
};