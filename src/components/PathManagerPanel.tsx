import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Route, 
  RefreshCw, 
  Play,
  Settings,
  MoreVertical
} from 'lucide-react';
import { PathManager } from '../services/PathManager';
import { dronePatrolPaths, vehiclePatrolPaths } from '../data/panoramaScenes';
import type { CameraPath } from '../data/panoramaScenes';

interface PathManagerPanelProps {
  onPathSelect?: (path: CameraPath) => void;
  className?: string;
}

export const PathManagerPanel: React.FC<PathManagerPanelProps> = ({
  onPathSelect,
  className = ''
}) => {
  const [customPaths, setCustomPaths] = useState<CameraPath[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  // 加载自定义路径
  const loadCustomPaths = () => {
    setIsRefreshing(true);
    const paths = PathManager.loadPaths();
    setCustomPaths(paths);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 组件挂载时加载路径
  useEffect(() => {
    loadCustomPaths();
  }, []);

  // 删除路径
  const deletePath = (pathId: string) => {
    if (confirm('确定要删除这个路径吗？')) {
      PathManager.deletePath(pathId);
      loadCustomPaths();
    }
  };

  // 导出单个路径
  const exportPath = (path: CameraPath) => {
    PathManager.exportPath(path);
  };

  // 导出所有路径
  const exportAllPaths = () => {
    PathManager.exportAllPaths();
  };

  // 导入路径
  const importPaths = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedPaths = await PathManager.importPaths(file);
      if (importedPaths.length > 0) {
        PathManager.savePaths([...customPaths, ...importedPaths]);
        loadCustomPaths();
      }
    } catch (error) {
      alert('导入路径失败: ' + (error as Error).message);
    }
  };

  // 刷新路径列表
  const refreshPaths = () => {
    loadCustomPaths();
  };

  // 选择/取消选择路径
  const togglePathSelection = (pathId: string) => {
    setSelectedPaths(prev => 
      prev.includes(pathId) 
        ? prev.filter(id => id !== pathId)
        : [...prev, pathId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedPaths.length === customPaths.length) {
      setSelectedPaths([]);
    } else {
      setSelectedPaths(customPaths.map(path => path.id));
    }
  };

  // 批量删除
  const deleteSelectedPaths = () => {
    if (selectedPaths.length === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedPaths.length} 个路径吗？`)) {
      let success = true;
      selectedPaths.forEach(pathId => {
        if (!PathManager.deletePath(pathId)) {
          success = false;
        }
      });
      
      if (success) {
        setSelectedPaths([]);
        loadCustomPaths();
      }
    }
  };

  // 格式化时长
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}秒`;
  };

  // 获取设备类型图标
  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'drone': return '🚁';
      case 'vehicle': return '🚗';
      default: return '👤';
    }
  };

  // 合并演示路径和自定义路径
  const allPaths = [...customPaths];

  return (
    <div className={`bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinematic text-blue-400 uppercase tracking-wide flex items-center gap-2">
          <Route className="w-4 h-4" />
          路径管理
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPaths}
            disabled={isRefreshing}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importPaths}
              className="hidden"
              id="path-import-input"
            />
            <button
              onClick={() => document.getElementById('path-import-input')?.click()}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
              title="导入路径"
            >
              <Upload className="w-4 h-4 text-blue-300" />
            </button>
          </div>
          
          <button
            onClick={exportAllPaths}
            disabled={customPaths.length === 0}
            className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50"
            title="导出所有路径"
          >
            <Download className="w-4 h-4 text-green-300" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 p-2 bg-white/5 border border-white/10 rounded text-xs text-white/60 flex items-center justify-between">
        <span>自定义路径: {customPaths.length}</span>
        <span>演示路径: {Object.keys(dronePatrolPaths).length + Object.keys(vehiclePatrolPaths).length}</span>
      </div>

      {/* Actions */}
      {selectedPaths.length > 0 && (
        <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-center justify-between">
          <span className="text-xs text-yellow-300">
            已选择 {selectedPaths.length} 个路径
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded text-xs text-yellow-300 transition-colors"
            >
              {selectedPaths.length === customPaths.length ? '取消全选' : '全选'}
            </button>
            
            <button
              onClick={deleteSelectedPaths}
              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs text-red-300 transition-colors"
            >
              批量删除
            </button>
          </div>
        </div>
      )}

      {/* Path List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {allPaths.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <Route className="w-12 h-12 mb-3" />
            <p className="text-sm">暂无自定义路径</p>
            <p className="text-xs mt-1">创建新路径并保存</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allPaths.map((path) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedPaths.includes(path.id)}
                        onChange={() => togglePathSelection(path.id)}
                        className="mr-1"
                      />
                      <h4 
                        className="text-sm font-medium text-white truncate cursor-pointer flex items-center gap-2"
                        onClick={() => onPathSelect?.(path)}
                      >
                        <span>{getDeviceIcon(path.deviceType)}</span>
                        {path.name}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-white/60 truncate mb-1">
                      {path.description || '无描述'}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{path.waypoints?.length || 0} 个路径点</span>
                      <span>{formatDuration(path.duration)}</span>
                      <span>{path.isLoop ? '循环' : '单向'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => onPathSelect?.(path)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="选择路径"
                    >
                      <Play className="w-3 h-3 text-white/60" />
                    </button>
                    
                    <button
                      onClick={() => exportPath(path)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="导出路径"
                    >
                      <Download className="w-3 h-3 text-white/60" />
                    </button>
                    
                    <button
                      onClick={() => deletePath(path.id)}
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

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <button
          onClick={() => {
            if (onPathSelect) {
              onPathSelect({
                id: `path-${Date.now()}`,
                name: '新路径',
                description: '',
                waypoints: [],
                duration: 5000,
                easing: 'easeInOut',
                isLoop: false,
                deviceType: 'manual',
                created: new Date()
              });
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-xs text-blue-300 transition-colors"
        >
          <Route className="w-3 h-3" />
          创建路径
        </button>
        
        <div className="text-xs text-white/40">
          路径存储在浏览器本地
        </div>
      </div>
    </div>
  );
};