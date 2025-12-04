import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Position } from '../types/mapTypes';

interface TooltipProps {
  content: React.ReactNode;
  position: Position;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  offsetX?: number;
  offsetY?: number;
  width?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position,
  children,
  className = '',
  delay = 300,
  offsetX = 15,
  offsetY = 15,
  width = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<Position>({ x: 0, y: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 鼠标进入
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      
      // 计算工具提示位置
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let x = rect.left + rect.width / 2 - width / 2;
        let y = rect.top - offsetY;
        
        // 确保工具提示不超出视窗
        if (x < 10) x = 10;
        if (x + width > window.innerWidth - 10) x = window.innerWidth - width - 10;
        if (y < 10) y = rect.bottom + offsetY;
        
        setTooltipPosition({ x, y });
      }
    }, delay);
  };

  // 鼠标离开
  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`cursor-pointer ${className}`}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              width: `${width}px`,
            }}
          >
            {/* 工具提示主体 */}
            <div className="relative bg-black/90 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
              {/* 箭头指示器 */}
              <div 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/10"
                style={{
                  borderLeftWidth: '8px',
                  borderRightWidth: '8px',
                  borderTopWidth: '8px',
                }}
              />
              
              {/* 内容区域 */}
              <div className="p-3 text-white text-sm">
                {content}
              </div>
            </div>
            
            {/* 光晕效果 */}
            <div 
              className="absolute inset-0 rounded-lg border-2 border-white/20 opacity-50 -z-10 blur-sm"
              style={{ transform: 'scale(1.05)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};