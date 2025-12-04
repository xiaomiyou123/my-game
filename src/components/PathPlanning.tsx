import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  Navigation, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  Play, 
  Edit3,
  Check,
  X,
  Settings,
  RotateCcw,
  Eye,
  Zap
} from 'lucide-react';
import { demoScenes } from '../data/panoramaScenes';
import { PathManager } from '../services/PathManager';
import type { PanoramaScene, Waypoint } from '../data/panoramaScenes';

interface PathPlanningProps {
  scenes?: PanoramaScene[];
  onPathCreate?: (path: Waypoint[]) => void;
  onPathSelect?: (pathId: string) => void;
  className?: string;
}

export const PathPlanning: React.FC<PathPlanningProps> = ({
  scenes = demoScenes,
  onPathCreate,
  onPathSelect,
  className = ''
}) => {
  const [paths, setPaths] = useState<Array<{ id: string; name: string; waypoints: Waypoint[] }>>([]);
  const [currentPath, setCurrentPath] = useState<Waypoint[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [pathName, setPathName] = useState('新巡检路径');
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 加载已保存的路径
  useEffect(() => {
    const savedPaths = PathManager.loadPaths();
    setPaths(savedPaths);
  }, []);

  // 添加路径点
  const addWaypoint = (scene: PanoramaScene) => {
    const newWaypoint: Waypoint = {
      id: `waypoint-${Date.now()}`,
      sceneId: scene.id,
      sceneName: scene.name,
      position: {
        lat: scene.position?.lat || 24.5000,
        lng: scene.position?.lng || 118.0833,
        alt: scene.position?.alt || 0
      },
      viewpoint: {
        yaw: 0,
        pitch: 0,
        fov: 90
      },
      duration: 5000,
      type: 'inspection',
      description: `检查${scene.name}`
    };
    
    setCurrentPath([...currentPath, newWaypoint]);
  };

  // 删除路径点
  const removeWaypoint = (index: number) => {
    const updatedPath = currentPath.filter((_, i) => i !== index);
    setCurrentPath(updatedPath);
  };

  // 更新路径点
  const updateWaypoint = (index: number, updates: Partial<Waypoint>) => {
    const updatedPath = [...currentPath];
    updatedPath[index] = { ...updatedPath[index], ...updates };
    setCurrentPath(updatedPath);
  };

  // 保存路径
  const savePath = () => {
    if (currentPath.length === 0) {
      alert('路径不能为空');
      return;
    }

    const newPath = {
      id: `path-${Date.now()}`,
      name: pathName,
      waypoints: currentPath
    };

    const success = PathManager.savePath(newPath);
    if (success) {
      setPaths([...paths, newPath]);
      setCurrentPath([]);
      setPathName('新巡检路径');
      setIsEditing(false);
      onPathCreate?.(currentPath);
    } else {
      alert('保存路径失败');
    }
  };

  // 删除路径
  const deletePath = (pathId: string) => {
    if (confirm('确定要删除这条路径吗？')) {
      PathManager.deletePath(pathId);
      setPaths(paths.filter(p => p.id !== pathId));
      if (selectedPathId === pathId) {
        setSelectedPathId(null);
      }
    }
  };

  // 加载路径
  const loadPath = (path: typeof paths[0]) => {
    setCurrentPath(path.waypoints);
    setPathName(path.name);
    setSelectedPathId(path.id);
    setIsEditing(true);
    onPathSelect?.(path.id);
  };

  // 导出路径
  const exportPath = (path: typeof paths[0]) => {
    PathManager.exportPath(path);
  };

  // 导入路径
  const importPath = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedPath = await PathManager.importPath(file);
      if (importedPath) {
        PathManager.savePath(importedPath);
        setPaths([...paths, importedPath]);
      }
    } catch (error) {
      alert('导入路径失败: ' + (error as Error).message);
    }
  };

  // 播放路径预览
  const playPathPreview = () => {
    if (currentPath.length === 0) return;
    
    setIsPlaying(true);
    setCurrentWaypointIndex(0);
    
    const playNextWaypoint = (index: number) => {
      if (index >= currentPath.length) {
        setIsPlaying(false);
        return;
      }
      
      setCurrentWaypointIndex(index);
      
      // 模拟移动到路径点
      setTimeout(() => {
        playNextWaypoint(index + 1);
      }, currentPath[index].duration || 3000);
    };
    
    playNextWaypoint(0);
  };

  // 停止路径预览
  const stopPathPreview = () => {
    setIsPlaying(false);
    setCurrentWaypointIndex(0);
  };

  // 重新开始路径预览
  const restartPathPreview = () => {
    setCurrentWaypointIndex(0);
  };

  return (
    <div className={`bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinematic text-blue-400 uppercase tracking-wide flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          路径规划
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            title="高级选项"
          >
            <Settings className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* 路径列表 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {paths.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <MapIcon className="w-12 h-12 mb-3" />
            <p className="text-sm">暂无保存的路径</p>
            <p className="text-xs mt-1">创建新的巡检路径</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paths.map((path) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white/5 border border-white/10 rounded-lg p-3 transition-colors cursor-pointer ${
                  selectedPathId === path.id ? 'border-blue-500/50 bg-blue-500/10' : 'hover:bg-white/10'
                }`}
                onClick={() => loadPath(path)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{path.name}</h4>
                    <p className="text-xs text-white/60">{path.waypoints.length} 个路径点</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportPath(path);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="导出路径"
                    >
                      <Download className="w-3 h-3 text-white/60" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePath(path.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      title="删除路径"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 编辑器 */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            {/* 路径名称 */}
            <div className="mb-4">
              <input
                type="text"
                value={pathName}
                onChange={(e) => setPathName(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-blue-500/50 focus:outline-none"
                placeholder="路径名称"
              />
            </div>

            {/* 路径点列表 */}
            <div className="mb-4 max-h-40 overflow-y-auto">
              {currentPath.length === 0 ? (
                <div className="text-center py-4 text-white/40">
                  <p className="text-sm">点击下方场景添加路径点</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentPath.map((waypoint, index) => (
                    <div key={waypoint.id} className="bg-white/5 border border-white/10 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            currentWaypointIndex === index && isPlaying
                              ? 'bg-blue-500 text-white animate-pulse'
                              : 'bg-white/10 text-white/60'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-xs text-white/80">{waypoint.sceneName}</span>
                        </div>
                        
                        <button
                          onClick={() => removeWaypoint(index)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          title="删除路径点"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                      
                      {showAdvanced && (
                        <div className="text-xs text-white/60 grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block mb-1">停留时间(毫秒)</label>
                            <input
                              type="number"
                              value={waypoint.duration}
                              onChange={(e) => updateWaypoint(index, { duration: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block mb-1">类型</label>
                            <select
                              value={waypoint.type}
                              onChange={(e) => updateWaypoint(index, { type: e.target.value as any })}
                              className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded text-white focus:outline-none"
                            >
                              <option value="inspection">巡检</option>
                              <option value="transition">过渡</option>
                              <option value="action">动作</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 播放控制 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {!isPlaying ? (
                  <button
                    onClick={playPathPreview}
                    disabled={currentPath.length === 0}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="预览路径"
                  >
                    <Play className="w-4 h-4 text-blue-300" />
                  </button>
                ) : (
                  <button
                    onClick={stopPathPreview}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
                    title="停止预览"
                  >
                    <X className="w-4 h-4 text-red-300" />
                  </button>
                )}
                
                <button
                  onClick={restartPathPreview}
                  disabled={!isPlaying}
                  className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors disabled:opacity-50"
                  title="重新开始"
                >
                  <RotateCcw className="w-4 h-4 text-white/60" />
                </button>
              </div>
              
              {currentPath.length > 0 && (
                <div className="text-xs text-white/60">
                  {isPlaying ? `${currentWaypointIndex + 1} / ${currentPath.length}` : `${currentPath.length} 个路径点`}
                </div>
              )}
            </div>

            {/* 场景选择 */}
            <div className="grid grid-cols-2 gap-2 mb-4 max-h-32 overflow-y-auto">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => addWaypoint(scene)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white/80 transition-colors text-left"
                >
                  {scene.name}
                </button>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPath([]);
                  setPathName('新巡检路径');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
              >
                取消
              </button>
              
              <button
                onClick={savePath}
                disabled={currentPath.length === 0}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存路径
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部操作 */}
      {!isEditing && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-xs text-blue-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            创建路径
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={importPath}
              className="hidden"
              id="path-import-input"
            />
            <button
              onClick={() => document.getElementById('path-import-input')?.click()}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
              title="导入路径"
            >
              <Upload className="w-3 h-3 text-white/60" />
            </button>
            
            <button
              onClick={() => PathManager.exportAllPaths()}
              disabled={paths.length === 0}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors disabled:opacity-50"
              title="导出所有路径"
            >
              <Download className="w-3 h-3 text-white/60" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};