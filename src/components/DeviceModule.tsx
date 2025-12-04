import React, { useState } from 'react';
import { ModuleFrame } from './ModuleFrame';
import { Wifi, Battery, Zap, Bot, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Device {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'ai-controlled';
  icon: React.ElementType;
  statusText: string;
  aiControlled: boolean;
  aiRecommendation?: string;
}

export const DeviceModule: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: 'drone-01',
      name: 'Drone Patrol #01',
      status: 'ai-controlled',
      icon: Battery,
      statusText: 'Patroling Area B',
      aiControlled: true,
      aiRecommendation: 'AI optimizing patrol route based on crop density'
    },
    {
      id: 'irrigation-01',
      name: 'Smart Irrigation',
      status: 'ai-controlled',
      icon: Zap,
      statusText: 'Next cycle: 14:00 PM',
      aiControlled: true,
      aiRecommendation: 'AI adjusted schedule - rain forecast detected'
    },
  ]);

  const toggleAIControl = (deviceId: string) => {
    setDevices(prev => prev.map(device =>
      device.id === deviceId
        ? {
          ...device,
          aiControlled: !device.aiControlled,
          status: !device.aiControlled ? 'ai-controlled' : 'active'
        }
        : device
    ));
  };

  return (
    <ModuleFrame title="Equipment | 设备监控" className="bg-black/40" data-ai-module="device">
      <div className="space-y-4">
        {devices.map((device) => (
          <motion.div
            key={device.id}
            className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${device.aiControlled
              ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* AI Control Indicator */}
            {device.aiControlled && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}

            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${device.aiControlled ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                  }`} />
                <span className="text-sm text-white/90 font-cinematic">{device.name}</span>
                {device.aiControlled && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30"
                  >
                    <Bot className="w-3 h-3 text-green-400" />
                    <span className="text-[9px] text-green-300 uppercase tracking-wide">AI</span>
                  </motion.div>
                )}
              </div>
              <device.icon className={`w-4 h-4 ${device.aiControlled ? 'text-green-300' : 'text-yellow-300'
                }`} />
            </div>

            <div className="text-xs text-white/50 pl-4 mb-2">{device.statusText}</div>

            {/* AI Recommendation */}
            {device.aiControlled && device.aiRecommendation && (
              <div className="mt-2 p-2 rounded bg-black/20 border border-green-500/20">
                <p className="text-[10px] text-green-300/80 italic">{device.aiRecommendation}</p>
              </div>
            )}

            {/* AI Control Toggle */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-white/40 uppercase tracking-wide">
                {device.aiControlled ? 'AI Controlled' : 'Manual Mode'}
              </span>
              <button
                onClick={() => toggleAIControl(device.id)}
                className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
              >
                {device.aiControlled ? (
                  <ToggleRight className="w-5 h-5 text-green-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-white/40" />
                )}
              </button>
            </div>
          </motion.div>
        ))}

        {/* Connectivity */}
        <div className="flex items-center justify-between px-2 mt-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Network Strength</span>
          </div>
          <div className="text-sm text-green-300">Excellent</div>
        </div>
      </div>
    </ModuleFrame>
  );
};

