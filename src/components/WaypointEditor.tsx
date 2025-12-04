import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, Plus, Play, Camera, Navigation, MapPin } from 'lucide-react';
import type { Waypoint, CameraPath, PanoramaScene } from '../data/panoramaScenes';
import { demoScenes } from '../data/panoramaScenes';

interface WaypointEditorProps {
  path?: CameraPath;
  scenes: PanoramaScene[];
  onSave?: (path: CameraPath) => void;
  onPreview?: (waypoint: Waypoint) => void;
  className?: string;
}

export const WaypointEditor: React.FC<WaypointEditorProps> = ({
  path,
  scenes = demoScenes,
  onSave,
  onPreview,
  className = ''
}) => {
  const [editPath, setEditPath] = useState<CameraPath>(path || {
    id: `path-${Date.now()}`,
    name: '新建路径',
    description: '',
    waypoints: [],
    duration: 5000,
    easing: 'easeInOut',
    isLoop: false,
    deviceType: 'manual',
    created: new Date()
  });
  
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  // 添加新的路径点
  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: `wp-${Date.now()}`,
      sceneId: scenes[0]?.id || '',
      yaw: 0,
      pitch: 0,
      fov: 90,
      duration: 2000,
      name: `路径点 ${editPath.waypoints.length + 1}`,
      action: 'pause'
    };
    
    setEditPath({
      ...editPath,
      waypoints: [...editPath.waypoints, newWaypoint]
    });
  };

  // 删除路径点
  const removeWaypoint = (waypointId: string) => {
    setEditPath({
      ...editPath,
      waypoints: editPath.waypoints.filter(wp => wp.id !== waypointId)
    });
  };

  // 更新路径点
  const updateWaypoint = (waypointId: string, updates: Partial<Waypoint>) => {
    setEditPath({
      ...editPath,
      waypoints: editPath.waypoints.map(wp => 
        wp.id === waypointId ? { ...wp, ...updates } : wp
      )
    });
  };

  // 预览路径点
  const previewWaypoint = (waypoint: Waypoint) => {
    onPreview?.(waypoint);
  };

  // 播放路径
  const playPath = () => {
    if (editPath.waypoints.length === 0) return;
    
    setIsPlaying(true);
    setPlaybackIndex(0);
    
    // 播放第一个路径点
    if (editPath.waypoints[0]) {
      previewWaypoint(editPath.waypoints[0]);
    }
    
    // 设置定时器播放后续路径点
    let index = 0;
    const playNext = () => {
      index++;
      if (index >= editPath.waypoints.length) {
        if (editPath.isLoop) {
          index = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
      
      setPlaybackIndex(index);
      const waypoint = editPath.waypoints[index];
      if (waypoint) {
        const timeout = setTimeout(() => {
          previewWaypoint(waypoint);
          playNext();
        }, waypoint.duration || 2000);
        
        return () => clearTimeout(timeout);
      }
    };
    
    const firstTimeout = setTimeout(playNext, editPath.waypoints[0]?.duration || 2000);
    return () => clearTimeout(firstTimeout);
  };

  // 停止播放
  const stopPlayback = () => {
    setIsPlaying(false);
    setPlaybackIndex(0);
  };

  // 保存路径
  const savePath = () => {
    // 计算总时长
    const totalDuration = editPath.waypoints.reduce((sum, wp) => sum + (wp.duration || 2000), 0);
    
    const pathToSave: CameraPath = {
      ...editPath,
      duration: totalDuration
    };
    
    onSave?.(pathToSave);
  };

  return (
    <div className={`bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinematic text-green-400 uppercase tracking-wide flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          路径编辑器
        </h3>
        
        <div className="flex items-center gap-2">
          {editPath.waypoints.length > 0 && (
            <>
              {!isPlaying ? (
                <button
                  onClick={playPath}
                  className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors"
                  title="播放路径"
                >
                  <Play className="w-4 h-4 text-green-300" />
                </button>
              ) : (
                <button
                  onClick={stopPlayback}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
                  title="停止播放"
                >
                  <Trash2 className="w-4 h-4 text-red-300" />
                </button>
              )}
            </>
          )}
          
          <button
            onClick={savePath}
            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
            title="保存路径"
          >
            <Save className="w-4 h-4 text-blue-300" />
          </button>
        </div>
      </div>

      {/* Path Properties */}
      <div className="mb-4 space-y-3 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div>
          <label className="text-xs text-white/60 uppercase tracking-wide block mb-1">路径名称</label>
          <input
            type="text"
            value={editPath.name}
            onChange={(e) => setEditPath({ ...editPath, name: e.target.value })}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-green-500/50 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="text-xs text-white/60 uppercase tracking-wide block mb-1">描述</label>
          <input
            type="text"
            value={editPath.description || ''}
            onChange={(e) => setEditPath({ ...editPath, description: e.target.value })}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-green-500/50 focus:outline-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide block mb-1">设备类型</label>
            <select
              value={editPath.deviceType || 'manual'}
              onChange={(e) => setEditPath({ ...editPath, deviceType: e.target.value as any })}
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-green-500/50 focus:outline-none"
            >
              <option value="manual">手动</option>
              <option value="drone">无人机</option>
              <option value="vehicle">巡逻车</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isLoop"
              checked={editPath.isLoop || false}
              onChange={(e) => setEditPath({ ...editPath, isLoop: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isLoop" className="text-xs text-white/60 uppercase tracking-wide">
              循环播放
            </label>
          </div>
        </div>
      </div>

      {/* Waypoints List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-cinematic text-white/60 uppercase tracking-wide">
            路径点 ({editPath.waypoints.length})
          </h4>
          
          <button
            onClick={addWaypoint}
            className="p-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded transition-colors"
            title="添加路径点"
          >
            <Plus className="w-3 h-3 text-green-300" />
          </button>
        </div>

        {editPath.waypoints.length === 0 ? (
          <div className="text-center py-8 text-white/30">
            <Navigation className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs">暂无路径点，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {editPath.waypoints.map((waypoint, index) => (
              <motion.div
                key={waypoint.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 border rounded-lg transition-all ${
                  selectedWaypoint === waypoint.id
                    ? 'bg-green-500/10 border-green-500/30'
                    : isPlaying && index === playbackIndex
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
                onClick={() => setSelectedWaypoint(waypoint.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xs text-green-300">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={waypoint.name || ''}
                      onChange={(e) => updateWaypoint(waypoint.id, { name: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none text-white text-sm focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previewWaypoint(waypoint);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="预览"
                    >
                      <Camera className="w-3 h-3 text-white/60" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWaypoint(waypoint.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3 text-red-300" />
                    </button>
                  </div>
                </div>

                {/* Waypoint Details */}
                {selectedWaypoint === waypoint.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3"
                  >
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wide block mb-1">场景</label>
                      <select
                        value={waypoint.sceneId}
                        onChange={(e) => updateWaypoint(waypoint.id, { sceneId: e.target.value })}
                        className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded text-white text-xs focus:border-green-500/50 focus:outline-none"
                      >
                        {scenes.map(scene => (
                          <option key={scene.id} value={scene.id}>{scene.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wide block mb-1">动作</label>
                      <select
                        value={waypoint.action || 'pause'}
                        onChange={(e) => updateWaypoint(waypoint.id, { action: e.target.value as any })}
                        className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded text-white text-xs focus:border-green-500/50 focus:outline-none"
                      >
                        <option value="pause">暂停</option>
                        <option value="scan">扫描</option>
                        <option value="analyze">分析</option>
                        <option value="capture">拍照</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wide block mb-1">水平角度 (Yaw)</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={waypoint.yaw}
                        onChange={(e) => updateWaypoint(waypoint.id, { yaw: Number(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-xs text-white/50 text-center">{waypoint.yaw}°</div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wide block mb-1">垂直角度 (Pitch)</label>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        value={waypoint.pitch}
                        onChange={(e) => updateWaypoint(waypoint.id, { pitch: Number(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-xs text-white/50 text-center">{waypoint.pitch}°</div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wide block mb-1">停留时间</label>
                      <input
                        type="range"
                        min="1000"
                        max="10000"
                        step="500"
                        value={waypoint.duration || 2000}
                        onChange={(e) => updateWaypoint(waypoint.id, { duration: Number(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-xs text-white/50 text-center">{(waypoint.duration || 2000) / 1000}秒</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};