import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  FolderOpen, 
  FolderPlus, 
  RefreshCw, 
  Settings,
  Image as ImageIcon,
  MoreVertical
} from 'lucide-react';
import { SceneManager } from '../services/SceneManager';
import { demoScenes } from '../data/panoramaScenes';
import type { PanoramaScene } from '../data/panoramaScenes';

interface SceneManagerPanelProps {
  onSceneSelect?: (scene: PanoramaScene) => void;
  onSceneCreate?: (scene: PanoramaScene) => void;
  className?: string;
}

export const SceneManagerPanel: React.FC<SceneManagerPanelProps> = ({
  onSceneSelect,
  onSceneCreate,
  className = ''
}) => {
  const [customScenes, setCustomScenes] = useState<PanoramaScene[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);

  // 加载自定义场景
  const loadCustomScenes = () => {
    setIsRefreshing(true);
    const scenes = SceneManager.loadScenes();
    setCustomScenes(scenes);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 组件挂载时加载场景
  useEffect(() => {
    loadCustomScenes();
  }, []);

  // 删除场景
  const deleteScene = (sceneId: string) => {
    if (confirm('确定要删除这个场景吗？')) {
      SceneManager.deleteScene(sceneId);
      loadCustomScenes();
    }
  };

  // 导出单个场景
  const exportScene = (scene: PanoramaScene) => {
    SceneManager.exportScene(scene);
  };

  // 导出所有场景
  const exportAllScenes = () => {
    SceneManager.exportAllScenes();
  };

  // 导入场景
  const importScenes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedScenes = await SceneManager.importScenes(file);
      if (importedScenes.length > 0) {
        SceneManager.saveScenes([...customScenes, ...importedScenes]);
        loadCustomScenes();
      }
    } catch (error) {
      alert('导入场景失败: ' + (error as Error).message);
    }
  };

  // 刷新场景列表
  const refreshScenes = () => {
    loadCustomScenes();
  };

  // 选择/取消选择场景
  const toggleSceneSelection = (sceneId: string) => {
    setSelectedScenes(prev => 
      prev.includes(sceneId) 
        ? prev.filter(id => id !== sceneId)
        : [...prev, sceneId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedScenes.length === customScenes.length) {
      setSelectedScenes([]);
    } else {
      setSelectedScenes(customScenes.map(scene => scene.id));
    }
  };

  // 批量删除
  const deleteSelectedScenes = () => {
    if (selectedScenes.length === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedScenes.length} 个场景吗？`)) {
      let success = true;
      selectedScenes.forEach(sceneId => {
        if (!SceneManager.deleteScene(sceneId)) {
          success = false;
        }
      });
      
      if (success) {
        setSelectedScenes([]);
        loadCustomScenes();
      }
    }
  };

  // 合并演示场景和自定义场景
  const allScenes = [...customScenes];

  return (
    <div className={`bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinematic text-green-400 uppercase tracking-wide flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          场景管理
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={refreshScenes}
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
              onChange={importScenes}
              className="hidden"
              id="scene-import-input"
            />
            <button
              onClick={() => document.getElementById('scene-import-input')?.click()}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
              title="导入场景"
            >
              <Upload className="w-4 h-4 text-blue-300" />
            </button>
          </div>
          
          <button
            onClick={exportAllScenes}
            disabled={customScenes.length === 0}
            className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50"
            title="导出所有场景"
          >
            <Download className="w-4 h-4 text-green-300" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 p-2 bg-white/5 border border-white/10 rounded text-xs text-white/60 flex items-center justify-between">
        <span>自定义场景: {customScenes.length}</span>
        <span>演示场景: {demoScenes.length}</span>
      </div>

      {/* Actions */}
      {selectedScenes.length > 0 && (
        <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-center justify-between">
          <span className="text-xs text-yellow-300">
            已选择 {selectedScenes.length} 个场景
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded text-xs text-yellow-300 transition-colors"
            >
              {selectedScenes.length === customScenes.length ? '取消全选' : '全选'}
            </button>
            
            <button
              onClick={deleteSelectedScenes}
              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs text-red-300 transition-colors"
            >
              批量删除
            </button>
          </div>
        </div>
      )}

      {/* Scene List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {allScenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <ImageIcon className="w-12 h-12 mb-3" />
            <p className="text-sm">暂无自定义场景</p>
            <p className="text-xs mt-1">上传全景图创建新场景</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allScenes.map((scene) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedScenes.includes(scene.id)}
                        onChange={() => toggleSceneSelection(scene.id)}
                        className="mr-1"
                      />
                      <h4 
                        className="text-sm font-medium text-white truncate cursor-pointer"
                        onClick={() => onSceneSelect?.(scene)}
                      >
                        {scene.name}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-white/60 truncate mb-1">
                      {scene.metadata?.description || '无描述'}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{scene.hotspots?.length || 0} 个热点</span>
                      <span>{scene.metadata?.area || '未知区域'}</span>
                      <span>{scene.metadata?.type || 'outdoor'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => onSceneSelect?.(scene)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="选择场景"
                    >
                      <FolderOpen className="w-3 h-3 text-white/60" />
                    </button>
                    
                    <button
                      onClick={() => exportScene(scene)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="导出场景"
                    >
                      <Download className="w-3 h-3 text-white/60" />
                    </button>
                    
                    <button
                      onClick={() => deleteScene(scene.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      title="删除场景"
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
            if (onSceneCreate) {
              onSceneCreate({
                id: `scene-${Date.now()}`,
                name: '新场景',
                imageUrl: '',
                position: { lat: 24.5000, lng: 118.0833 },
                hotspots: [],
                metadata: {
                  area: 'custom',
                  type: 'outdoor',
                  description: ''
                }
              });
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-xs text-green-300 transition-colors"
        >
          <FolderPlus className="w-3 h-3" />
          创建场景
        </button>
        
        <div className="text-xs text-white/40">
          场景存储在浏览器本地
        </div>
      </div>
    </div>
  );
};