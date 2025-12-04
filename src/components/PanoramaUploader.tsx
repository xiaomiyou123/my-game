import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Settings, Check, AlertCircle, Grid3x3, Camera } from 'lucide-react';
import { MiniMap } from './MiniMap';
import type { PanoramaScene, Hotspot } from '../data/panoramaScenes';

interface PanoramaUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  onSceneCreate?: (scene: PanoramaScene) => void;
  onClose: () => void;
}

export const PanoramaUploader: React.FC<PanoramaUploaderProps> = ({
  onImageUpload,
  onSceneCreate,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [sceneName, setSceneName] = useState('新全景场景');
  const [selectedArea, setSelectedArea] = useState<string>('custom');
  const [sceneDescription, setSceneDescription] = useState('');

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 模拟上传进度
    setIsProcessing(true);
    setUploadProgress(0);

    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImage(imageUrl);
      
      // 模拟处理时间
      setTimeout(() => {
        setIsProcessing(false);
        setUploadProgress(100);
        clearInterval(uploadInterval);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  // 处理拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // 添加热点
  const addHotspot = () => {
    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      yaw: Math.random() * 360 - 180, // -180 to 180
      pitch: Math.random() * 180 - 90, // -90 to 90
      type: 'info',
      label: '新热点',
      icon: '📍',
      targetSceneId: ''
    };
    
    setHotspots([...hotspots, newHotspot]);
  };

  // 更新热点
  const updateHotspot = (id: string, updates: Partial<Hotspot>) => {
    setHotspots(hotspots.map(h => 
      h.id === id ? { ...h, ...updates } : h
    ));
  };

  // 删除热点
  const removeHotspot = (id: string) => {
    setHotspots(hotspots.filter(h => h.id !== id));
  };

  // 保存为新场景
  const saveAsScene = () => {
    if (!uploadedImage || !onSceneCreate) return;

    const newScene: PanoramaScene = {
      id: `scene-${Date.now()}`,
      name: sceneName,
      imageUrl: uploadedImage,
      position: {
        lat: 24.5000 + Math.random() * 0.01, // 随机位置
        lng: 118.0833 + Math.random() * 0.01
      },
      hotspots,
      metadata: {
        area: selectedArea as any,
        type: 'outdoor',
        description: sceneDescription
      }
    };

    onSceneCreate(newScene);
    onImageUpload(uploadedImage);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl w-[90%] max-w-6xl h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-cinematic text-white">全景图上传与编辑</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Upload and Settings */}
          <div className="w-1/3 p-6 border-r border-white/10 space-y-6 overflow-y-auto">
            {/* Upload Area */}
            {!uploadedImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all h-64 flex flex-col items-center justify-center
                  ${isDragging
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    {isDragging ? (
                      <Upload className="w-8 h-8 text-green-400 animate-bounce" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-cinematic mb-1">
                      {isProcessing ? '处理中...' : isDragging ? '松开鼠标上传' : '拖拽图片到此处'}
                    </p>
                    <p className="text-sm text-white/60">
                      或点击选择文件
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="w-full mt-4">
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-green-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-white/50 mt-1 text-center">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden h-48">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded panorama" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-white/80">图片上传成功</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setUploadProgress(0);
                  }}
                  className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
                >
                  重新上传
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />

            {/* Scene Properties */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wide block mb-2">场景名称</label>
                <input
                  type="text"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-green-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 uppercase tracking-wide block mb-2">场景描述</label>
                <textarea
                  value={sceneDescription}
                  onChange={(e) => setSceneDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-green-500/50 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 uppercase tracking-wide block mb-2">场景区域</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-green-500/50 focus:outline-none"
                >
                  <option value="greenhouse-a">温室A区</option>
                  <option value="greenhouse-b">温室B区</option>
                  <option value="field">露天农田</option>
                  <option value="outdoor">户外区域</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
            </div>
          </div>

          {/* Middle Panel - Preview and Hotspots */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-cinematic text-white/80">热点编辑</h4>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="高级选项"
              >
                <Settings className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="flex-1 relative rounded-lg overflow-hidden bg-black/30 border border-white/10">
              {uploadedImage ? (
                <div className="relative w-full h-full">
                  <img 
                    src={uploadedImage} 
                    alt="Panorama preview" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Hotspot overlays */}
                  {hotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="absolute w-10 h-10 bg-green-500/30 border border-green-500/60 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-500/50 transition-all hover:scale-110 group"
                      style={{
                        left: `${50 + (hotspot.yaw / 180) * 30}%`,
                        top: `${50 + (hotspot.pitch / 90) * 30}%`
                      }}
                      onClick={() => {
                        // 选中热点进行编辑
                        const element = document.getElementById(`hotspot-editor-${hotspot.id}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <span className="text-sm">{hotspot.icon || '📍'}</span>
                      <div className="absolute bottom-full mb-1 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {hotspot.label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm">上传图片后在此预览和添加热点</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={addHotspot}
                disabled={!uploadedImage}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  添加热点
                </span>
              </button>

              <div className="text-xs text-white/40">
                {uploadedImage ? `${hotspots.length} 个热点` : '等待上传图片'}
              </div>
            </div>
          </div>

          {/* Right Panel - Hotspot List */}
          <div className="w-1/3 p-6 border-l border-white/10 overflow-y-auto">
            <h4 className="text-sm font-cinematic text-white/80 mb-4">热点列表</h4>

            {hotspots.length === 0 ? (
              <div className="text-center py-8 text-white/30">
                <Grid3x3 className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">暂无热点，点击"添加热点"创建</p>
              </div>
            ) : (
                  <div className="space-y-3">
                    {hotspots.map((hotspot, index) => (
                      <div key={hotspot.id} id={`hotspot-editor-${hotspot.id}`} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={hotspot.icon || '📍'}
                              onChange={(e) => updateHotspot(hotspot.id, { icon: e.target.value })}
                              className="bg-black/30 border border-white/10 rounded text-white text-xs px-1 py-0.5 focus:outline-none"
                            >
                              <option value="📍">📍 位置</option>
                              <option value="🚁">🚁 无人机</option>
                              <option value="🚗">🚗 车辆</option>
                              <option value="🌱">🌱 作物</option>
                              <option value="⚠️">⚠️ 警告</option>
                              <option value="ℹ️">ℹ️ 信息</option>
                            </select>
                            <input
                              type="text"
                              value={hotspot.label || ''}
                              onChange={(e) => updateHotspot(hotspot.id, { label: e.target.value })}
                              placeholder="热点名称"
                              className="bg-black/30 border border-white/10 rounded text-white text-xs px-2 py-0.5 focus:outline-none focus:border-green-500/50"
                            />
                          </div>
                          
                          <button
                            onClick={() => removeHotspot(hotspot.id)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            title="删除热点"
                          >
                            <X className="w-3 h-3 text-red-300" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>
                            <label className="text-white/40 block mb-1">水平角度</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                value={hotspot.yaw}
                                onChange={(e) => updateHotspot(hotspot.id, { yaw: Number(e.target.value) })}
                                className="flex-1"
                              />
                              <span className="text-white/60 w-8 text-right">{hotspot.yaw.toFixed(0)}°</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-white/40 block mb-1">垂直角度</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="range"
                                min="-90"
                                max="90"
                                value={hotspot.pitch}
                                onChange={(e) => updateHotspot(hotspot.id, { pitch: Number(e.target.value) })}
                                className="flex-1"
                              />
                              <span className="text-white/60 w-8 text-right">{hotspot.pitch.toFixed(0)}°</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs">
                          <label className="text-white/40 block mb-1">热点类型</label>
                          <select
                            value={hotspot.type || 'info'}
                            onChange={(e) => updateHotspot(hotspot.id, { type: e.target.value as any })}
                            className="bg-black/30 border border-white/10 rounded text-white text-xs px-2 py-1 w-full focus:outline-none focus:border-green-500/50"
                          >
                            <option value="info">信息点</option>
                            <option value="scene">场景链接</option>
                            <option value="action">动作触发</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            {uploadedImage && (
              <Check className="w-4 h-4 text-green-400" />
            )}
            <span className="text-xs text-white/60">
              {uploadedImage ? '图片已上传' : '等待图片上传'}
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
            >
              取消
            </button>
            
            <button
              onClick={saveAsScene}
              disabled={!uploadedImage}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存为新场景
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};