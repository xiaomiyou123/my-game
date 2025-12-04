import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { textureLibrary } from '../utils/TextureLibrary';
import type { Region, Device, GameEvent, MapConfig, MapImageData } from '../types/mapTypes';

interface MapCanvasProps {
    regions: Region[];
    devices: Device[];
    events: GameEvent[];
    config: MapConfig;
    onRegionClick?: (region: Region) => void;
    onDeviceClick?: (device: Device) => void;
    onEventClick?: (event: GameEvent) => void;
    selectedRegion?: string | null;
    backgroundImage?: MapImageData | null;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
    regions,
    devices,
    events,
    config,
    backgroundImage,
    selectedRegion,
    onRegionClick,
    onDeviceClick,
    onEventClick
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
    const [hoveredDevice, setHoveredDevice] = useState<Device | null>(null);
    const [hoveredEvent, setHoveredEvent] = useState<GameEvent | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const [showLabels, setShowLabels] = useState(true);
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    
    // 缓存计算结果以提高性能
    const renderCache = useRef<{
        regions: Map<string, any>;
        devices: Map<string, any>;
        events: Map<string, any>;
        frameCount: number;
    }>({
        regions: new Map(),
        devices: new Map(),
        events: new Map(),
        frameCount: 0
    });

    // 预加载底图
    useEffect(() => {
        if (backgroundImage) {
            const img = new Image();
            img.onload = () => {
                bgImageRef.current = img;
                setLastUpdateTime(Date.now());
            };
            img.src = backgroundImage.dataUrl;
        } else {
            bgImageRef.current = null;
        }
    }, [backgroundImage]);

    // 动画循环 - 只在有动画元素时激活
    useEffect(() => {
        let animationId: number;
        
        // 检查是否有需要动画的元素
        const hasAnimatedElements = devices.some(d => d.isMoving) || 
                                  events.some(e => e.status !== 'resolved') ||
                                  regions.some(r => r.status !== 'normal');
        
        if (hasAnimatedElements) {
            const animate = () => {
                setLastUpdateTime(Date.now());
                animationId = requestAnimationFrame(animate);
            };
            animationId = requestAnimationFrame(animate);
        }
        
        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [devices, events, regions]);

    // 绘制
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        // 1. 背景色
        ctx.fillStyle = config.backgroundColor || '#0a0f1a';
        ctx.fillRect(0, 0, config.bounds.width, config.bounds.height);

        // 2. 底图
        if (bgImageRef.current && backgroundImage) {
            ctx.save();
            ctx.globalAlpha = backgroundImage.opacity;
            ctx.drawImage(bgImageRef.current, backgroundImage.offsetX, backgroundImage.offsetY, backgroundImage.displayWidth, backgroundImage.displayHeight);
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // 3. 网格
        if (config.showGrid) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= config.bounds.width; x += config.gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, config.bounds.height);
                ctx.stroke();
            }
            for (let y = 0; y <= config.bounds.height; y += config.gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(config.bounds.width, y);
                ctx.stroke();
            }
        }

        // 4. 地块 - MC风格优化
        // 对区域进行排序，确保重叠时正确的层级显示
        const sortedRegions = [...regions].sort((a, b) => {
            // 优先级：选中的区域 > 悬停的区域 > 正常区域
            const aPriority = (a.id === selectedRegion ? 1000 : 0) + (hoveredRegion?.id === a.id ? 500 : 0);
            const bPriority = (b.id === selectedRegion ? 1000 : 0) + (hoveredRegion?.id === b.id ? 500 : 0);
            
            if (aPriority !== bPriority) return bPriority - aPriority;
            
            // 如果优先级相同，按照Y坐标排序（Y值大的先画，这样看起来在后面）
            return a.position.y - b.position.y;
        });
        
        sortedRegions.forEach(r => {
            // 使用缓存来避免重复计算
            const cacheKey = `${r.id}-${lastUpdateTime}-${viewMode}`;
            let regionData = renderCache.current.regions.get(cacheKey);
            
            if (!regionData) {
                const isHovered = hoveredRegion?.id === r.id;
                const isSelected = r.id === selectedRegion;
                const regionDepth = isSelected ? 8 : isHovered ? 6 : 4;
                const regionGlow = isSelected ? 15 : isHovered ? 10 : 5;
                
                regionData = {
                    isHovered,
                    isSelected,
                    regionDepth,
                    regionGlow,
                    baseOpacity: r.opacity !== undefined ? r.opacity : 0.6,
                    hoverMultiplier: isHovered ? 1.2 : isSelected ? 1.3 : 1.0,
                    finalOpacity: Math.min((r.opacity !== undefined ? r.opacity : 0.6) * (isHovered ? 1.2 : isSelected ? 1.3 : 1.0), 0.8)
                };
                
                // 缓存结果
                renderCache.current.regions.set(cacheKey, regionData);
            }
            
            // 3D效果阴影
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = regionData.regionGlow;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // 绘制地块主体
            if ('points' in r.boundary) {
                ctx.beginPath();
                r.boundary.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.rect(r.boundary.x, r.boundary.y, r.boundary.width, r.boundary.height);
                ctx.closePath();
            }
            
            // 应用纹理或颜色
            // 使用缓存中的透明度设置
            if (r.textureId) {
                const tex = textureLibrary.getTexture(r.textureId);
                if (tex?.pattern) {
                    // 先填充纹理
                    ctx.fillStyle = tex.pattern;
                    ctx.fill();
                    
                    // 再应用颜色覆盖
                    ctx.fillStyle = r.color + Math.floor(regionData.finalOpacity * 255).toString(16).padStart(2, '0');
                    ctx.fill();
                } else {
                    ctx.fillStyle = r.color + Math.floor(regionData.finalOpacity * 255).toString(16).padStart(2, '0');
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = r.color + Math.floor(regionData.finalOpacity * 255).toString(16).padStart(2, '0');
                ctx.fill();
            }
            
            // MC风格边框
            ctx.strokeStyle = regionData.isSelected ? '#4ade80' : regionData.isHovered ? '#fbbf24' : '#ffffff';
            ctx.lineWidth = regionData.isSelected ? 3 : regionData.isHovered ? 2 : 1.5;
            ctx.setLineDash([]);
            
            // 根据地块状态应用不同效果
            if (r.status === 'warning') {
                ctx.setLineDash([5, 3]);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2.5;
            }
            if (r.status === 'critical') { 
                ctx.setLineDash([10, 5]); 
                ctx.strokeStyle = '#ef4444'; 
                ctx.lineWidth = 3; 
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
            
            // 3D顶部效果
            if (viewMode === '3d') {
                ctx.beginPath();
                if ('points' in r.boundary) {
                    r.boundary.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x - regionData.regionDepth/2, p.y - regionData.regionDepth/2) : ctx.lineTo(p.x - regionData.regionDepth/2, p.y - regionData.regionDepth/2));
                    ctx.closePath();
                } else {
                    ctx.rect(r.boundary.x - regionData.regionDepth/2, r.boundary.y - regionData.regionDepth/2, r.boundary.width, r.boundary.height);
                }
                
                const topFaceColor = r.color + Math.floor((regionData.isHovered ? 0.4 : regionData.isSelected ? 0.35 : 0.25) * 255).toString(16).padStart(2, '0');
                ctx.fillStyle = topFaceColor;
                ctx.fill();
                ctx.strokeStyle = '#ffffff60';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // 地块标签
            if (showLabels) {
                // 标签背景
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(r.position.x - 30, r.position.y - 35, 60, 25);
                
                // 标签边框
                ctx.strokeStyle = regionData.isSelected ? '#4ade80' : '#ffffff40';
                ctx.lineWidth = 1;
                ctx.strokeRect(r.position.x - 30, r.position.y - 35, 60, 25);
                
                // 标签文字
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(r.name, r.position.x, r.position.y - 20);
                ctx.font = '16px Arial';
                ctx.fillText(r.icon, r.position.x, r.position.y + 10);
            }
            
            // 状态指示器
            if (r.status === 'warning' || r.status === 'critical') {
                const ps = 8 + Math.sin(Date.now() / 300) * 2;
                ctx.fillStyle = r.status === 'critical' ? '#ef4444' : '#f59e0b';
                ctx.beginPath();
                ctx.arc(r.position.x + 30, r.position.y - 20, ps, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });

        // 5. 事件 - MC风格优化
        events.forEach(e => {
            // 使用缓存来避免重复计算
            const cacheKey = `${e.id}-${lastUpdateTime}`;
            let eventData = renderCache.current.events.get(cacheKey);
            
            if (!eventData) {
                const isHovered = hoveredEvent?.id === e.id;
                const isSelected = selectedEvent?.id === e.id;
                const eventSize = isHovered || isSelected ? 18 : 14;
                const sc = { info: '#3b82f6', warning: '#f59e0b', critical: '#ef4444' }[e.severity];
                
                // 只有在需要动画时才计算脉冲效果
                const pulse = e.status !== 'resolved' ? Math.sin(Date.now() / 400) * 0.3 + 0.7 : 1;
                
                eventData = {
                    isHovered,
                    isSelected,
                    eventSize,
                    severityColor: sc,
                    pulse,
                    hasAnimation: e.status !== 'resolved'
                };
                
                // 缓存结果
                renderCache.current.events.set(cacheKey, eventData);
            }
            
            ctx.save();
            ctx.globalAlpha = eventData.pulse;
            
            // 外圈光晕
            const gradient = ctx.createRadialGradient(e.position.x, e.position.y, 0, e.position.x, e.position.y, eventData.eventSize * 1.5);
            gradient.addColorStop(0, eventData.severityColor);
            gradient.addColorStop(0.5, eventData.severityColor + '80');
            gradient.addColorStop(1, eventData.severityColor + '00');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(e.position.x, e.position.y, eventData.eventSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // 内圈
            ctx.globalAlpha = 1;
            ctx.fillStyle = eventData.severityColor;
            ctx.beginPath();
            ctx.arc(e.position.x, e.position.y, eventData.eventSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 边框
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = eventData.isSelected ? 3 : eventData.isHovered ? 2 : 1;
            ctx.stroke();
            
            // 图标
            ctx.fillStyle = '#fff';
            ctx.font = `${eventData.eventSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(e.icon, e.position.x, e.position.y);
            
            // 悬浮时显示事件描述
            if (eventData.isHovered && showLabels) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(e.position.x + 25, e.position.y - 15, 120, 25);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(e.description, e.position.x + 30, e.position.y);
            }
            
            ctx.restore();
        });

        // 6. 设备 - MC风格优化
        devices.forEach(d => {
            // 使用缓存来避免重复计算
            const cacheKey = `${d.id}-${lastUpdateTime}-${viewMode}`;
            let deviceData = renderCache.current.devices.get(cacheKey);
            
            if (!deviceData) {
                const isHovered = hoveredDevice?.id === d.id;
                const isSelected = selectedDevice?.id === d.id;
                const deviceSize = isHovered || isSelected ? 20 : 16;
                const sc = { active: '#10b981', idle: '#6b7280', charging: '#3b82f6', maintenance: '#f59e0b', error: '#ef4444' }[d.status];
                
                // 只在设备移动时计算动画
                const hasAnimation = d.isMoving;
                const pulseRadius = hasAnimation ? deviceSize * 1.3 + Math.sin(Date.now() / 200) * 3 : deviceSize * 1.3;
                
                deviceData = {
                    isHovered,
                    isSelected,
                    deviceSize,
                    statusColor: sc,
                    hasAnimation,
                    pulseRadius,
                    batteryColor: d.battery < 20 ? '#ef4444' : d.battery < 50 ? '#f59e0b' : '#10b981'
                };
                
                // 缓存结果
                renderCache.current.devices.set(cacheKey, deviceData);
            }
            
            ctx.save();
            
            // 设备阴影
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(d.position.x, d.position.y + 18, deviceData.deviceSize * 1.2, deviceData.deviceSize * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 设备主体 - 3D效果
            if (viewMode === '3d') {
                // 底部阴影
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.ellipse(d.position.x, d.position.y + deviceData.deviceSize * 0.8, deviceData.deviceSize * 1.1, deviceData.deviceSize * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // 侧面
                ctx.fillStyle = deviceData.statusColor + 'aa';
                ctx.beginPath();
                ctx.moveTo(d.position.x - deviceData.deviceSize, d.position.y - deviceData.deviceSize * 0.5);
                ctx.lineTo(d.position.x - deviceData.deviceSize * 0.8, d.position.y - deviceData.deviceSize * 0.3);
                ctx.lineTo(d.position.x - deviceData.deviceSize * 0.8, d.position.y + deviceData.deviceSize * 0.3);
                ctx.lineTo(d.position.x - deviceData.deviceSize, d.position.y + deviceData.deviceSize * 0.5);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(d.position.x + deviceData.deviceSize, d.position.y - deviceData.deviceSize * 0.5);
                ctx.lineTo(d.position.x + deviceData.deviceSize * 0.8, d.position.y - deviceData.deviceSize * 0.3);
                ctx.lineTo(d.position.x + deviceData.deviceSize * 0.8, d.position.y + deviceData.deviceSize * 0.3);
                ctx.lineTo(d.position.x + deviceData.deviceSize, d.position.y + deviceData.deviceSize * 0.5);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(d.position.x - deviceData.deviceSize, d.position.y - deviceData.deviceSize * 0.5);
                ctx.lineTo(d.position.x + deviceData.deviceSize, d.position.y - deviceData.deviceSize * 0.5);
                ctx.lineTo(d.position.x + deviceData.deviceSize, d.position.y);
                ctx.lineTo(d.position.x - deviceData.deviceSize, d.position.y);
                ctx.closePath();
                ctx.fill();
            }
            
            // 设备主体
            ctx.fillStyle = deviceData.statusColor;
            ctx.beginPath();
            ctx.arc(d.position.x, d.position.y, deviceData.deviceSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 设备边框
            ctx.strokeStyle = deviceData.isSelected ? '#ffffff' : '#cccccc';
            ctx.lineWidth = deviceData.isSelected ? 3 : deviceData.isHovered ? 2 : 1;
            ctx.stroke();
            
            // 设备图标
            ctx.fillStyle = '#fff';
            ctx.font = `${deviceData.deviceSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(d.icon, d.position.x, d.position.y);
            
            // 移动动画
            if (deviceData.hasAnimation) {
                ctx.strokeStyle = deviceData.statusColor;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(d.position.x, d.position.y, deviceData.pulseRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
                
                // 方向指示器
                if (d.currentTask && d.targetPosition) {
                    const angle = Math.atan2(
                        d.targetPosition.y - d.position.y,
                        d.targetPosition.x - d.position.x
                    );
                    
                    ctx.save();
                    ctx.translate(d.position.x, d.position.y);
                    ctx.rotate(angle);
                    
                    ctx.fillStyle = deviceData.statusColor;
                    ctx.beginPath();
                    ctx.moveTo(deviceData.deviceSize + 5, 0);
                    ctx.lineTo(deviceData.deviceSize + 10, -5);
                    ctx.lineTo(deviceData.deviceSize + 10, 5);
                    ctx.closePath();
                    ctx.fill();
                    
                    ctx.restore();
                }
            }
            
            // 电池指示器
            if (showLabels) {
                ctx.fillStyle = deviceData.batteryColor;
                ctx.fillRect(d.position.x - 15, d.position.y + deviceData.deviceSize + 10, 30, 4);
                
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(d.position.x - 15, d.position.y + deviceData.deviceSize + 10, 30, 4);
                
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${d.battery}%`, d.position.x, d.position.y + deviceData.deviceSize + 25);
            }
            
            // 悬浮信息
            if (deviceData.isHovered) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(d.position.x + 25, d.position.y - 15, 150, 50);
                
                ctx.strokeStyle = deviceData.isSelected ? '#ffffff' : deviceData.statusColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(d.position.x + 25, d.position.y - 15, 150, 50);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(d.name, d.position.x + 30, d.position.y);
                ctx.font = '10px monospace';
                ctx.fillText(`状态: ${d.status}`, d.position.x + 30, d.position.y + 15);
                ctx.fillText(`任务: ${d.currentTask || '空闲'}`, d.position.x + 30, d.position.y + 30);
            }
            
            ctx.restore();
        });

        ctx.restore();
    }, [regions, devices, events, config, zoom, offset, hoveredRegion, selectedRegion, lastUpdateTime, backgroundImage]);

    // 鼠标事件 - MC风格优化
    const handleMouseDown = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - offset.x) / zoom;
        const y = (e.clientY - rect.top - offset.y) / zoom;
        
        // 检查点击的区域
        const clickedRegion = regions.find(r => {
            if ('points' in r.boundary) {
                return isPointInPolygon({ x, y }, r.boundary.points);
            } else {
                return x >= r.boundary.x && x <= r.boundary.x + r.boundary.width && 
                       y >= r.boundary.y && y <= r.boundary.y + r.boundary.height;
            }
        });
        
        // 检查点击的设备
        const clickedDevice = devices.find(d => {
            const dx = d.position.x - x;
            const dy = d.position.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 20;
        });
        
        // 检查点击的事件
        const clickedEvent = events.find(e => {
            const dx = e.position.x - x;
            const dy = e.position.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 18;
        });
        
        // 处理点击事件
        if (clickedRegion && onRegionClick) {
            onRegionClick(clickedRegion);
        } else if (clickedDevice && onDeviceClick) {
            onDeviceClick(clickedDevice);
            setSelectedDevice(clickedDevice);
        } else if (clickedEvent && onEventClick) {
            onEventClick(clickedEvent);
            setSelectedEvent(clickedEvent);
        } else {
            // 开始拖动
            setIsDragging(true);
            setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - offset.x) / zoom;
        const y = (e.clientY - rect.top - offset.y) / zoom;
        
        // 检查悬浮的区域
        const hoveredReg = regions.find(r => {
            if ('points' in r.boundary) {
                return isPointInPolygon({ x, y }, r.boundary.points);
            } else {
                return x >= r.boundary.x && x <= r.boundary.x + r.boundary.width && 
                       y >= r.boundary.y && y <= r.boundary.y + r.boundary.height;
            }
        });
        
        // 检查悬浮的设备
        const hoveredDev = devices.find(d => {
            const dx = d.position.x - x;
            const dy = d.position.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 20;
        });
        
        // 检查悬浮的事件
        const hoveredEv = events.find(e => {
            const dx = e.position.x - x;
            const dy = e.position.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 18;
        });
        
        setHoveredRegion(hoveredReg || null);
        setHoveredDevice(hoveredDev || null);
        setHoveredEvent(hoveredEv || null);
        
        // 更新鼠标样式
        if (hoveredDev || hoveredEv || hoveredReg) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'grab';
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = 'grab';
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        setZoom(prev => Math.max(0.5, Math.min(3, prev * (e.deltaY > 0 ? 0.9 : 1.1))));
    };

    return (
        <motion.div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* 控制面板 */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                {/* 视图切换 */}
                <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-2">
                    <button
                        onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white"
                        title={viewMode === '2d' ? '切换到3D视图' : '切换到2D视图'}
                    >
                        {viewMode === '2d' ? '2D' : '3D'}
                    </button>
                </div>
                
                {/* 标签开关 */}
                <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-2">
                    <button
                        onClick={() => setShowLabels(!showLabels)}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white"
                        title={showLabels ? '隐藏标签' : '显示标签'}
                    >
                        {showLabels ? '🏷️' : '🏷️‍♂️'}
                    </button>
                </div>
                
                {/* 缩放控制 */}
                <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-2 flex flex-col gap-1">
                    <button
                        onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white"
                        title="放大"
                    >
                        +
                    </button>
                    <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center text-white text-xs">
                        {Math.round(zoom * 100)}%
                    </div>
                    <button
                        onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white"
                        title="缩小"
                    >
                        -
                    </button>
                </div>
                
                {/* 重置视图 */}
                <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-2">
                    <button
                        onClick={() => {
                            setZoom(1);
                            setOffset({ x: 0, y: 0 });
                        }}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white"
                        title="重置视图"
                    >
                        🔄
                    </button>
                </div>
            </div>
            
            <canvas
                ref={canvasRef}
                width={config.bounds.width}
                height={config.bounds.height}
                className="w-full h-full cursor-grab"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            />
        </motion.div>
    );
};

function isPointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
