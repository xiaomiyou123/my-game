import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadPanelProps {
    onImageUpload: (imageUrl: string) => void;
    onClose: () => void;
}

export const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({ onImageUpload, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            onImageUpload(imageUrl);
            onClose();
        };
        reader.readAsDataURL(file);
    };

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-[500px]"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-cinematic text-white">上传全景图片</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Drag and Drop Area */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all
            ${isDragging
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                        }
          `}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                            {isDragging ? (
                                <Upload className="w-8 h-8 text-green-400 animate-bounce" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-green-400" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-white font-cinematic mb-2">
                                {isDragging ? '松开鼠标上传' : '拖拽图片到此处'}
                            </p>
                            <p className="text-sm text-white/60">
                                或点击选择文件
                            </p>
                        </div>
                        <p className="text-xs text-white/40">
                            支持 JPG, PNG, WEBP 等格式
                        </p>
                    </div>
                </div>

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

                <div className="mt-6 text-center">
                    <p className="text-xs text-white/40">
                        提示：推荐使用360°全景图片获得最佳效果
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
