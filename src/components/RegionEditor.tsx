import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Square, Pentagon, Edit3, Trash2, Save, X, Palette } from 'lucide-react';
import { TextureSelector } from './TextureSelector';
import { textureLibrary } from '../utils/TextureLibrary';
import type { Region, Position } from '../types/mapTypes';

type DrawMode = 'polygon' | 'rectangle' | 'edit' | 'delete' | null;

interface RegionEditorProps {
    onSave: (region: Region) => void;
    onCancel: () => void;
    existingRegions: Region[];
    canvasBounds: { width: number; height: number };
}

export const RegionEditor: React.FC<RegionEditorProps> = ({
    onSave,
    onCancel,
    existingRegions,
    canvasBounds
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawMode, setDrawMode] = useState<DrawMode>('polygon');
    const [points, setPoints] = useState<Position[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentMousePos, setCurrentMousePos] = useState<Position | null>(null);

    // 矩形绘制状态
    const [rectStart, setRectStart] = useState<Position | null>(null);

    // 地块属性
    const [regionName, setRegionName] = useState('');
    const [regionType, setRegionType] = useState<Region['type']>('farm');
    const [regionColor, setRegionColor] = useState('#22c55e');
    const [regionDescription, setRegionDescription] = useState('');
    const [selectedTextureId, setSelectedTextureId] = useState<string | undefined>();
    const [showTextureSelector, setShowTextureSelector] = useState(false);
    const [labelPosition, setLabelPosition] = useState<'center' | 'top-left' | 'top-right'>('center');
    const [showBorder, setShowBorder] = useState(true);
    const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
    const [borderWidth, setBorderWidth] = useState(2);
    const [opacity, setOpacity] = useState(0.6);

    // 绘制Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制网格
        drawGrid(ctx);

        // 绘制已有区域（半透明）
        existingRegions.forEach(region => {
            drawExistingRegion(ctx, region);
        });

        // 绘制当前绘制中的图形
        if (drawMode === 'polygon' && points.length > 0) {
            drawPolygonPreview(ctx, points, currentMousePos);
        } else if (drawMode === 'rectangle' && rectStart && currentMousePos) {
            drawRectanglePreview(ctx, rectStart, currentMousePos);
        }
    }, [points, currentMousePos, drawMode, rectStart, existingRegions, regionColor]);

    // 绘制网格
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        const gridSize = 50;
        for (let x = 0; x <= canvasBounds.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasBounds.height);
            ctx.stroke();
        }

        for (let y = 0; y <= canvasBounds.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasBounds.width, y);
            ctx.stroke();
        }
    };

    // 绘制已有区域
    const drawExistingRegion = (ctx: CanvasRenderingContext2D, region: Region) => {
        const boundary = region.boundary;

        ctx.save();
        ctx.globalAlpha = 0.3;

        if ('points' in boundary) {
            ctx.beginPath();
            boundary.points.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.closePath();
        } else {
            ctx.beginPath();
            ctx.rect(boundary.x, boundary.y, boundary.width, boundary.height);
        }

        ctx.fillStyle = region.color + '40';
        ctx.fill();
        ctx.strokeStyle = region.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    };

    // 绘制多边形预览
    const drawPolygonPreview = (
        ctx: CanvasRenderingContext2D,
        pts: Position[],
        mousePos: Position | null
    ) => {
        if (pts.length === 0) return;

        ctx.save();

        // 绘制线条
        ctx.beginPath();
        pts.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });

        // 如果有鼠标位置，绘制到鼠标的线
        if (mousePos) {
            ctx.lineTo(mousePos.x, mousePos.y);
        }

        ctx.strokeStyle = regionColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制顶点
        pts.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = regionColor;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        ctx.restore();
    };

    // 绘制矩形预览
    const drawRectanglePreview = (
        ctx: CanvasRenderingContext2D,
        start: Position,
        end: Position
    ) => {
        ctx.save();

        const width = end.x - start.x;
        const height = end.y - start.y;

        ctx.strokeStyle = regionColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(start.x, start.y, width, height);

        ctx.fillStyle = regionColor + '20';
        ctx.fillRect(start.x, start.y, width, height);

        ctx.restore();
    };

    // 鼠标事件处理
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pos: Position = { x, y };

        if (drawMode === 'polygon') {
            setPoints(prev => [...prev, pos]);
            setIsDrawing(true);
        } else if (drawMode === 'rectangle') {
            setRectStart(pos);
            setIsDrawing(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCurrentMousePos({ x, y });
    };

    const handleMouseUp = () => {
        if (drawMode === 'rectangle' && rectStart && currentMousePos) {
            completeRectangle();
        }
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.stopPropagation();
        e.preventDefault();

        if (drawMode === 'polygon' && points.length >= 3) {
            completePolygon();
        }
    };

    // 完成多边形绘制
    const completePolygon = () => {
        if (points.length < 3) {
            alert('多边形至少需要3个顶点');
            return;
        }

        setIsDrawing(false);
    };

    // 完成矩形绘制
    const completeRectangle = () => {
        if (!rectStart || !currentMousePos) return;

        const width = currentMousePos.x - rectStart.x;
        const height = currentMousePos.y - rectStart.y;

        if (Math.abs(width) < 10 || Math.abs(height) < 10) {
            alert('矩形太小了');
            setRectStart(null);
            return;
        }

        const x = Math.min(rectStart.x, currentMousePos.x);
        const y = Math.min(rectStart.y, currentMousePos.y);

        setPoints([
            { x, y },
            { x: x + Math.abs(width), y },
            { x: x + Math.abs(width), y: y + Math.abs(height) },
            { x, y: y + Math.abs(height) }
        ]);

        setRectStart(null);
        setIsDrawing(false);
    };

    // 保存地块
    const handleSave = () => {
        if (!regionName.trim()) {
            alert('请输入地块名称');
            return;
        }

        if (points.length < 3) {
            alert('请先绘制地块');
            return;
        }

        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

        // 计算标签位置
        let labelPos: Position;
        if (labelPosition === 'center') {
            labelPos = { x: centerX, y: centerY };
        } else if (labelPosition === 'top-left') {
            labelPos = { x: Math.min(...points.map(p => p.x)) + 10, y: Math.min(...points.map(p => p.y)) + 10 };
        } else {
            labelPos = { x: Math.max(...points.map(p => p.x)) - 30, y: Math.min(...points.map(p => p.y)) + 10 };
        }

        const newRegion: Region = {
            id: `region-${Date.now()}`,
            name: regionName,
            type: regionType,
            color: regionColor,
            boundary: drawMode === 'rectangle'
                ? {
                    x: Math.min(...points.map(p => p.x)),
                    y: Math.min(...points.map(p => p.y)),
                    width: Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)),
                    height: Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y))
                }
                : { points: points },
            position: { x: centerX, y: centerY },
            icon: getIconForType(regionType),
            description: regionDescription,
            textureId: selectedTextureId,
            status: 'normal',
            opacity: opacity,
            showBorder: showBorder,
            borderStyle: borderStyle,
            borderWidth: borderWidth,
            labelPosition: labelPos,
            currentDevices: [],
            recentEvents: []
        };

        onSave(newRegion);
        resetDrawing();
    };

    const getIconForType = (type: Region['type']): string => {
        const icons = {
            farm: '🌾',
            greenhouse: '🏠',
            orchard: '🍎',
            vegetable: '🥬',
            custom: '📍'
        };
        return icons[type] || '📍';
    };

    const resetDrawing = () => {
        setPoints([]);
        setRectStart(null);
        setCurrentMousePos(null);
        setIsDrawing(false);
        setRegionName('');
        setRegionDescription('');
        setSelectedTextureId(undefined);
    };

    const handleCancel = () => {
        resetDrawing();
        onCancel();
    };

    // 获取选中纹理的预览
    const selectedTexture = selectedTextureId ? textureLibrary.getTexture(selectedTextureId) : null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-white/20 rounded-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden"
            >
                {/* 工具栏 */}
                <div className="bg-black/40 border-b border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setDrawMode('polygon')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${drawMode === 'polygon'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                    }`}
                            >
                                <Pentagon className="w-4 h-4" />
                                多边形
                            </button>

                            <button
                                onClick={() => setDrawMode('rectangle')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${drawMode === 'rectangle'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                    }`}
                            >
                                <Square className="w-4 h-4" />
                                矩形
                            </button>

                            <button
                                onClick={() => setDrawMode('edit')}
                                disabled
                                className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white/5 text-white/30 cursor-not-allowed"
                            >
                                <Edit3 className="w-4 h-4" />
                                编辑 (即将推出)
                            </button>

                            <button
                                onClick={() => setDrawMode('delete')}
                                disabled
                                className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white/5 text-white/30 cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                                删除 (即将推出)
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSave}
                                disabled={points.length < 3 || !regionName}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                保存地块
                            </button>

                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                取消
                            </button>
                        </div>
                    </div>

                    {/* 提示信息 */}
                    <div className="mt-3 text-sm text-white/60">
                        {drawMode === 'polygon' && '💡 点击添加顶点，双击完成绘制 (至少3个点)'}
                        {drawMode === 'rectangle' && '💡 按住鼠标拖拽绘制矩形'}
                        {!drawMode && '👆 请选择绘制工具开始'}
                    </div>
                </div>

                {/* 主内容区 */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Canvas绘制区 */}
                    <div className="flex-1 p-4 overflow-auto">
                        <canvas
                            ref={canvasRef}
                            width={canvasBounds.width}
                            height={canvasBounds.height}
                            className="border border-white/20 rounded-lg cursor-crosshair bg-gray-800"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onDoubleClick={handleDoubleClick}
                        />
                    </div>

                    {/* 属性面板 */}
                    <div className="w-80 bg-black/40 border-l border-white/10 p-4 overflow-y-auto">
                        <h3 className="text-white font-bold mb-4">地块属性</h3>

                        <div className="space-y-4">
                            {/* 名称 */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">名称 *</label>
                                <input
                                    type="text"
                                    value={regionName}
                                    onChange={(e) => setRegionName(e.target.value)}
                                    placeholder="例如：农田A区"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                                />
                            </div>

                            {/* 类型 */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">类型 *</label>
                                <select
                                    value={regionType}
                                    onChange={(e) => setRegionType(e.target.value as Region['type'])}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                                >
                                    <option value="farm">🌾 农田</option>
                                    <option value="greenhouse">🏠 温室</option>
                                    <option value="orchard">🍎 果园</option>
                                    <option value="vegetable">🥬 菜地</option>
                                    <option value="custom">📍 自定义</option>
                                </select>
                            </div>

                            {/* 颜色 */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">主题色 *</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={regionColor}
                                        onChange={(e) => setRegionColor(e.target.value)}
                                        className="w-12 h-10 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={regionColor}
                                        onChange={(e) => setRegionColor(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>

                            {/* 纹理选择 */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">纹理 (可选)</label>
                                <button
                                    onClick={() => setShowTextureSelector(true)}
                                    className="w-full px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white flex items-center justify-between transition-colors"
                                >
                                    <span>{selectedTexture ? selectedTexture.name : '选择纹理...'}</span>
                                    <Palette className="w-4 h-4" />
                                </button>
                                {selectedTexture && (
                                    <div className="mt-2 p-2 bg-white/5 border border-white/10 rounded-lg">
                                        <img
                                            src={selectedTexture.preview}
                                            alt={selectedTexture.name}
                                            className="w-full h-20 object-cover rounded border border-white/10"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 描述 */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">描述</label>
                                <textarea
                                    value={regionDescription}
                                    onChange={(e) => setRegionDescription(e.target.value)}
                                    placeholder="例如：主要种植小麦和玉米"
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 resize-none"
                                />
                            </div>
                            
                            {/* 分隔线 */}
                            <div className="pt-2 border-t border-white/10">
                                <h4 className="text-sm font-medium text-white/80 mb-3">高级设置</h4>
                            </div>
                            
                            {/* 标签位置 */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">标签位置</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setLabelPosition('center')}
                                        className={`px-2 py-1 rounded text-xs ${
                                            labelPosition === 'center' 
                                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                            : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/15'
                                        }`}
                                    >
                                        中心
                                    </button>
                                    <button
                                        onClick={() => setLabelPosition('top-left')}
                                        className={`px-2 py-1 rounded text-xs ${
                                            labelPosition === 'top-left' 
                                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                            : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/15'
                                        }`}
                                    >
                                        左上
                                    </button>
                                    <button
                                        onClick={() => setLabelPosition('top-right')}
                                        className={`px-2 py-1 rounded text-xs ${
                                            labelPosition === 'top-right' 
                                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                            : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/15'
                                        }`}
                                    >
                                        右上
                                    </button>
                                </div>
                            </div>
                            
                            {/* 边框设置 */}
                            <div>
                                <label className="flex items-center text-sm text-white/60 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={showBorder}
                                        onChange={(e) => setShowBorder(e.target.checked)}
                                        className="mr-2"
                                    />
                                    显示边框
                                </label>
                                
                                {showBorder && (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">边框样式</label>
                                            <select
                                                value={borderStyle}
                                                onChange={(e) => setBorderStyle(e.target.value as any)}
                                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-green-500"
                                            >
                                                <option value="solid">实线</option>
                                                <option value="dashed">虚线</option>
                                                <option value="dotted">点线</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">边框宽度 ({borderWidth}px)</label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                value={borderWidth}
                                                onChange={(e) => setBorderWidth(Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* 透明度 */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">透明度 ({Math.round(opacity * 100)}%)</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={opacity * 100}
                                    onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                                    className="w-full"
                                />
                                <div className="w-full h-2 bg-white/10 rounded-full mt-1">
                                    <div 
                                        className="h-full bg-green-500 rounded-full" 
                                        style={{ width: `${opacity * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* 预览 */}
                            <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-lg">
                                <div className="text-xs text-white/40 mb-2">预览</div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-lg"
                                        style={{ backgroundColor: regionColor + '40', border: `2px solid ${regionColor}` }}
                                    />
                                    <div>
                                        <div className="text-white font-medium">{regionName || '未命名'}</div>
                                        <div className="text-xs text-white/60">{getIconForType(regionType)} {regionType}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 统计信息 */}
                            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <div className="text-xs text-purple-300 mb-2">绘制信息</div>
                                <div className="text-xs text-white/60 space-y-1">
                                    <div>顶点数: {points.length}</div>
                                    <div>模式: {drawMode === 'polygon' ? '多边形' : drawMode === 'rectangle' ? '矩形' : '未选择'}</div>
                                    {selectedTexture && <div>纹理: {selectedTexture.name}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 纹理选择器模态框 */}
            {showTextureSelector && (
                <TextureSelector
                    selectedTextureId={selectedTextureId}
                    onSelect={(id) => {
                        setSelectedTextureId(id);
                        setShowTextureSelector(false);
                    }}
                    onClose={() => setShowTextureSelector(false)}
                />
            )}
        </div>
    );
};
