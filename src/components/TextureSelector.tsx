import React, { useState } from 'react';
import { X } from 'lucide-react';
import { textureLibrary, type Texture } from '../utils/TextureLibrary';

interface TextureSelectorProps {
    selectedTextureId?: string;
    onSelect: (textureId: string) => void;
    onClose: () => void;
}

export const TextureSelector: React.FC<TextureSelectorProps> = ({
    selectedTextureId,
    onSelect,
    onClose
}) => {
    const [activeCategory, setActiveCategory] = useState<Texture['category']>('grass');

    const categories: Array<{ id: Texture['category'], name: string, icon: string }> = [
        { id: 'grass', name: '草地', icon: '🌿' },
        { id: 'soil', name: '土壤', icon: '🟫' },
        { id: 'greenhouse', name: '温室', icon: '🏠' },
        { id: 'water', name: '水体', icon: '💧' },
        { id: 'road', name: '道路', icon: '🛣️' },
    ];

    const textures = textureLibrary.getTexturesByCategory(activeCategory);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-gray-900 border border-white/20 rounded-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-bold">选择纹理</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeCategory === cat.id
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span className="text-sm">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Texture Grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4">
                        {textures.map(texture => (
                            <button
                                key={texture.id}
                                onClick={() => {
                                    onSelect(texture.id);
                                    onClose();
                                }}
                                className={`group relative p-3 border rounded-lg transition-all ${selectedTextureId === texture.id
                                    ? 'bg-green-500/20 border-green-500 ring-2 ring-green-500/50'
                                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                                    }`}
                            >
                                {/* Preview */}
                                <div className="aspect-square rounded-lg overflow-hidden mb-2 border border-white/10">
                                    <img
                                        src={texture.preview}
                                        alt={texture.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Name */}
                                <div className="text-white text-sm text-center">{texture.name}</div>

                                {/* Selected Indicator */}
                                {selectedTextureId === texture.id && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {textures.length === 0 && (
                        <div className="text-center py-8 text-white/40">
                            该类别暂无纹理
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="text-xs text-white/60">
                        💡 纹理将应用到地块边界内，提供真实感视觉效果
                    </div>
                </div>
            </div>
        </div>
    );
};
