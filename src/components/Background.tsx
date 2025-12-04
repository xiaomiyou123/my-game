import React from 'react';
import { motion } from 'framer-motion';

export const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-black">
      {/* Base Gradient: Left (Green Mist) to Right (Yellow Light) */}
      <div className="absolute inset-0 bg-gradient-to-r from-mist-green/20 to-mist-yellow/20 z-10 mix-blend-overlay" />

      {/* Pastoral Real Scene Image */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }} // 15% requested, but 30% might look better on black, adjustable
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=3200&auto=format&fit=crop" 
          alt="Morning Mist Pastoral" 
          className="w-full h-full object-cover opacity-50 grayscale-[20%]"
        />
      </motion.div>

      {/* Dynamic Mist Effects (CSS Animations) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-30" />
        {/* Simulated Fog/Mist Layers */}
        <div className="absolute bottom-0 left-0 w-[200%] h-1/2 bg-gradient-to-t from-white/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Diagonal Soft Light (Morning 7 AM side light) */}
      <div className="absolute inset-0 z-30 bg-gradient-to-br from-white/10 via-transparent to-black/20 mix-blend-soft-light pointer-events-none" />
    </div>
  );
};
