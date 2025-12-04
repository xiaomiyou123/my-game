import React from 'react';
import { ModuleFrame } from './ModuleFrame';
import { Sprout, FlaskConical, Activity } from 'lucide-react';

const CircularProgress: React.FC<{ percentage: number, color: string, label: string }> = ({ percentage, color, label }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="50" height="50" className="-rotate-90">
        <circle cx="25" cy="25" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
        <circle
          cx="25" cy="25" r={radius}
          stroke={color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
        {percentage}%
      </div>
      <div className="text-[10px] text-white/50 mt-1">{label}</div>
    </div>
  );
};

export const CropHealthModule: React.FC = () => {
  return (
    <ModuleFrame title="Crop Health | 作物健康" className="bg-black/40" data-ai-module="crop">
      <div className="space-y-4">
        {/* AI Prediction */}
        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-[10px] text-green-300 italic flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
            AI Confidence: 94% - Growth rate optimal, no interventions needed
          </p>
        </div>
        {/* Health Score Overview */}
        <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
          <CircularProgress percentage={92} color="#4ade80" label="Zone A" />
          <CircularProgress percentage={78} color="#facc15" label="Zone B" />
          <CircularProgress percentage={85} color="#60a5fa" label="Zone C" />
        </div>

        {/* Growth Stage Timeline */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/60 uppercase tracking-wider">Growth Stage</span>
            <span className="text-xs text-green-400">Flowering</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            <div className="w-[20%] h-full bg-green-900/50 border-r border-black/20" />
            <div className="w-[30%] h-full bg-green-700/50 border-r border-black/20" />
            <div className="w-[25%] h-full bg-green-500/80 shadow-[0_0_10px_rgba(74,222,128,0.5)]" /> {/* Current */}
            <div className="flex-1 h-full bg-transparent" />
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>Seed</span>
            <span>Veg</span>
            <span className="text-green-400">Flower</span>
            <span>Harvest</span>
          </div>
        </div>

        {/* Soil PH & Disease Risk Compact Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase">
              <FlaskConical className="w-3 h-3" /> Soil pH
            </div>
            <div className="text-xl font-cinematic text-purple-200">6.5 <span className="text-[10px] text-white/30">Neutral</span></div>
            <div className="w-full h-1 bg-gradient-to-r from-red-400 via-green-400 to-blue-400 rounded-full opacity-50" />
          </div>

          <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase">
              <Activity className="w-3 h-3" /> Risk
            </div>
            <div className="text-xl font-cinematic text-green-300">Low</div>
            <div className="text-[10px] text-white/30">No pest detected</div>
          </div>
        </div>
      </div>
    </ModuleFrame>
  );
};
