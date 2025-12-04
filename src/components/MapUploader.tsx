import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import type { MapImageData } from '../types/mapTypes';

interface MapUploaderProps {
    onImageUpload: (imageData: MapImageData) => void;
    onClose: () => void;
    canvasBounds: { width: number; height: number };
}

export const MapUploader: React.FC<MapUploaderProps> = ({
    onImageUpload,
    onClose,
    canvasBounds
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [imageData, setImageData] = useState<MapImageData | null>(null);
    const [opacity, setOpacity] = useState(0.8);
    const [scale, setScale] = useState(1);

    // 文件验证
    const validateFile = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('仅支持 JPG、PNG、WebP 格式的图片');
            return false;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('图片大小不能超过 5MB');
            return false;
        }

        return true;
    };

    // 处理文件上传
    const handleFileUpload = (file: File) => {
        if (!validateFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 计算适配canvas的尺寸和位置
                const aspectRatio = img.width / img.height;
                const canvasAspectRatio = canvasBounds.width / canvasBounds.height;
                
                let displayWidth, displayHeight, offsetX = 0, offsetY = 0;
                
                if (aspectRatio > canvasAspectRatio) {
                    // 图片更宽，按宽度适配
                    displayWidth = canvasBounds.width;
                    displayHeight = canvasBounds.width / aspectRatio;
                    offsetY = (canvasBounds.height - displayHeight) / 2;
                } else {
                    // 图片更高，按高度适配
                    displayHeight = canvasBounds.height;
                    displayWidth = canvasBounds.height * aspectRatio;
                    offsetX = (canvasBounds.width - displayWidth) / 2;
                }

                const newImageData: MapImageData = {
                    id: `map-${Date.now()}`,
                    dataUrl: e.target?.result as string,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    displayWidth,
                    displayHeight,
                    offsetX,
                    offsetY,
                    opacity: opacity,
                    timestamp: Date.now()
                };

                setImageData(newImageData);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // 拖拽事件
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    // 点击上传
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    // 应用设置
    const handleApply = () => {
        if (!imageData) return;

        // 计算适合地图的最佳尺寸和位置
        const aspectRatio = imageData.originalWidth / imageData.originalHeight;
        const canvasAspectRatio = canvasBounds.width / canvasBounds.height;
        
        let displayWidth, displayHeight, offsetX = 0, offsetY = 0;
        
        if (scale === 1) {
            // 自动适配：保持纵横比，确保图片完全显示在画布内
            if (aspectRatio > canvasAspectRatio) {
                // 图片更宽，按宽度适配
                displayWidth = canvasBounds.width;
                displayHeight = canvasBounds.width / aspectRatio;
                offsetY = (canvasBounds.height - displayHeight) / 2;
            } else {
                // 图片更高，按高度适配
                displayHeight = canvasBounds.height;
                displayWidth = canvasBounds.height * aspectRatio;
                offsetX = (canvasBounds.width - displayWidth) / 2;
            }
        } else {
            // 手动缩放：在适配基础上再应用用户设定的缩放比例
            const baseFitWidth = imageData.originalWidth * Math.min(
                canvasBounds.width / imageData.originalWidth,
                canvasBounds.height / imageData.originalHeight
            );
            const baseFitHeight = imageData.originalHeight * Math.min(
                canvasBounds.width / imageData.originalWidth,
                canvasBounds.height / imageData.originalHeight
            );
            
            displayWidth = baseFitWidth * scale;
            displayHeight = baseFitHeight * scale;
            
            // 居中显示
            offsetX = (canvasBounds.width - displayWidth) / 2;
            offsetY = (canvasBounds.height - displayHeight) / 2;
        }

        const updatedData: MapImageData = {
            ...imageData,
            opacity: opacity,
            displayWidth,
            displayHeight,
            offsetX,
            offsetY
        };

        onImageUpload(updatedData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-white/20 rounded-2xl w-[600px] max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-bold">上传地图底图</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {!imageData ? (
                        /* 上传区域 */
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleClick}
                            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragging
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                                }`}
                        >
                            <Upload className="w-16 h-16 mx-auto mb-4 text-white/40" />
                            <p className="text-white text-lg mb-2">拖拽图片到这里</p>
                            <p className="text-white/60 text-sm mb-4">或点击选择文件</p>
                            <p className="text-white/40 text-xs">支持 JPG、PNG、WebP (最大5MB)</p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        /* 预览和设置 */
                        <div className="space-y-4">
                            {/* 预览 */}
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-green-400" />
                                        <span className="text-white/80 text-sm">预览</span>
                                    </div>
                                    <div className="text-xs text-white/60">
                                        画布尺寸: {canvasBounds.width} x {canvasBounds.height}
                                    </div>
                                </div>
                                <div 
                                    className="relative bg-black/40 rounded-lg overflow-hidden flex items-center justify-center"
                                    style={{ 
                                        aspectRatio: `${canvasBounds.width} / ${canvasBounds.height}`,
                                        maxHeight: '400px'
                                    }}
                                >
                                    {/* 画布边界指示器 */}
                                    <div 
                                        className="absolute border border-white/20 border-dashed pointer-events-none"
                                        style={{
                                            width: `${Math.min(canvasBounds.width, 600)}px`,
                                            height: `${Math.min(canvasBounds.height, 400)}px`
                                        }}
                                    />
                                    
                                    {/* 图片预览 */}
                                    <img
                                        src={imageData.dataUrl}
                                        alt="Map preview"
                                        style={{ 
                                            opacity: opacity,
                                            maxWidth: `${imageData.displayWidth}px`,
                                            maxHeight: `${imageData.displayHeight}px`,
                                            transform: `translate(${imageData.offsetX}px, ${imageData.offsetY}px)`
                                        }}
                                        className="object-contain relative"
                                    />
                                </div>
                            </div>

                            {/* 信息 */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <div className="text-white/60 mb-1">原始尺寸</div>
                                    <div className="text-white">{imageData.originalWidth} × {imageData.originalHeight}</div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <div className="text-white/60 mb-1">显示尺寸</div>
                                    <div className="text-white">
                                        {Math.round(imageData.displayWidth * scale)} × {Math.round(imageData.displayHeight * scale)}
                                    </div>
                                </div>
                            </div>

                            {/* 控制 */}
                            <div className="space-y-4">
                                {/* 透明度 */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-white/80 text-sm">透明度</label>
                                        <span className="text-white/60 text-sm">{Math.round(opacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={opacity}
                                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                {/* 缩放 */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-white/80 text-sm">缩放</label>
                                        <span className="text-white/60 text-sm">{Math.round(scale * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={scale}
                                        onChange={(e) => setScale(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* 更换图片 */}
                            <button
                                onClick={() => setImageData(null)}
                                className="w-full px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
                            >
                                更换图片
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-xs text-white/40">
                        💡 底图将显示在地图最底层，方便您基于真实地形绘制地块
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={!imageData}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            应用
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
