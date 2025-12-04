import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Target, Droplets, Sun, Sprout } from 'lucide-react';

const ARTag: React.FC<{ 
  x: string; 
  y: string; 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  delay?: number 
}> = ({ x, y, label, value, icon, delay = 0 }) => {
  return (
    <motion.div 
      className="absolute z-30 group cursor-pointer"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.8, type: "spring" }}
    >
      {/* Pin Point */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full flex flex-col items-center">
         <div className="w-0.5 h-12 bg-gradient-to-b from-white/80 to-transparent" />
         <div className="w-2 h-2 rounded-full bg-white/80 blur-[1px]" />
         <div className="w-8 h-8 border border-white/20 rounded-full absolute top-full -translate-y-1/2 animate-ping opacity-20" />
      </div>

      {/* Tag Content */}
      <div className="relative -translate-x-1/2 -translate-y-full bg-black/60 backdrop-blur-md border border-green-400/30 rounded-lg p-3 flex items-center gap-3 shadow-xl hover:bg-black/70 transition-colors">
        <div className="p-2 rounded-md bg-green-500/20 text-green-300">
          {icon}
        </div>
        <div>
          <div className="text-[10px] text-white/60 uppercase tracking-wider">{label}</div>
          <div className="text-lg font-cinematic text-white">{value}</div>
        </div>
        
        {/* Decoration */}
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-green-400/50" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-green-400/50" />
      </div>
    </motion.div>
  );
};

export const MainVisual: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg border border-white/10 shadow-2xl group bg-black/40">
        {/* Perspective Grid Overlay */}
        <div className="absolute inset-0 perspective-grid z-10 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
               backgroundSize: '50px 50px',
               transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
               transformOrigin: 'center bottom'
             }} 
        />

        {/* Live Feed / Digital Twin Placeholder - Reusing the image but clearer */}
        <div className="absolute inset-0 z-0">
           {/* We use the background component for the main image, but here we can add a specific focus layer if needed. 
               For now, let's keep it transparent to show the main background, 
               OR add a specific "Close up" view if the design demands it. 
               Let's add a subtle overlay to differentiate it.
           */}
        </div>
        
        {/* Central Focus UI */}
        <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Center Scanning Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] border border-white/10 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/40" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/40" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/40" />
                
                {/* Scanning Line */}
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-green-400/30 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                />
            </div>
        </div>

        {/* AR Tags Layer */}
        <div className="absolute inset-0 z-30">
          <ARTag 
            x="30%" y="40%" 
            label="Tomatoes (Zone A)" 
            value="Ripe: 78%" 
            icon={<Sun className="w-4 h-4" />} 
            delay={0.5} 
          />
          <ARTag 
            x="70%" y="60%" 
            label="Soil Moisture" 
            value="32.2%" 
            icon={<Droplets className="w-4 h-4" />} 
            delay={1.2} 
          />
           <ARTag 
            x="45%" y="75%" 
            label="Growth Rate" 
            value="+12% / Wk" 
            icon={<Sprout className="w-4 h-4" />} 
            delay={1.8} 
          />
        </div>

        {/* Floating Stats Panel (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-30 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-lg w-64">
           <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-white/60 uppercase">Yield Prediction</span>
              <Scan className="w-4 h-4 text-green-400" />
           </div>
           <div className="h-24 flex items-end justify-between gap-1">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <motion.div 
                  key={i}
                  className="w-full bg-green-500/20 rounded-sm relative group"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 2 + i * 0.1, duration: 1 }}
                >
                  <div className="absolute bottom-0 left-0 w-full bg-green-400/50 h-full group-hover:bg-green-400 transition-colors" />
                </motion.div>
              ))}
           </div>
        </div>
    </div>
  );
};
