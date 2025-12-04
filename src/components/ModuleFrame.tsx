import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface ModuleFrameProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  'data-ai-module'?: string;
}

export const ModuleFrame: React.FC<ModuleFrameProps> = ({ children, className, title, 'data-ai-module': dataAiModule }) => {
  return (
    <motion.div
      data-ai-module={dataAiModule}
      className={twMerge(
        "relative overflow-hidden",
        "bg-black/20 backdrop-blur-md border border-white/10",
        className
      )}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-400/50 rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-400/50 rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-400/50 rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-400/50 rounded-br-sm" />

      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-20 pointer-events-none bg-[length:100%_4px]" />

      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col">
        {title && (
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h3 className="text-sm font-cinematic text-green-100/90 tracking-widest uppercase flex items-center gap-2">
              <span className="w-1 h-3 bg-green-500 rounded-full" />
              {title}
            </h3>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-green-500/50 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-green-500/30 rounded-full" />
            </div>
          </div>
        )}
        <div className="flex-1 relative">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
