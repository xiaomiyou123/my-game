import React from 'react';
import { ModuleFrame } from './ModuleFrame';
import { CloudRain, Wind, Droplets, ThermometerSun, ArrowUpRight } from 'lucide-react';

const Sparkline: React.FC<{ color: string, data: number[] }> = ({ color, data }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((d - min) / (max - min)) * 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="20" className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={60} cy={20 - ((data[data.length - 1] - min) / (max - min)) * 20} r="2" fill={color} />
    </svg>
  );
};

export const WeatherModule: React.FC = () => {
  return (
    <ModuleFrame title="Weather | 天气监测" className="bg-black/40" data-ai-module="weather">
      <div className="space-y-4">
        {/* AI Weather Analysis */}
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-[10px] text-blue-300 italic flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
            AI: Rain expected in 6hrs - irrigation schedule adjusted
          </p>
        </div>
        {/* Temperature */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <ThermometerSun className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-white/40 font-light uppercase tracking-wider">Temp</div>
              <div className="text-2xl font-cinematic text-emerald-50">24°C</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Sparkline color="#34d399" data={[20, 22, 21, 23, 24, 24, 25]} />
            <div className="text-[10px] text-emerald-400/60 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +1.2°
            </div>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Wind className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-white/40 font-light uppercase tracking-wider">Wind</div>
              <div className="text-2xl font-cinematic text-amber-50">3.2 <span className="text-xs text-white/30">m/s</span></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-amber-200/60">NE</div>
            <div className="w-12 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div className="w-[40%] h-full bg-amber-400/60" />
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-white/40 font-light uppercase tracking-wider">Humidity</div>
              <div className="text-2xl font-cinematic text-blue-50">68%</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Sparkline color="#60a5fa" data={[65, 66, 68, 67, 69, 68]} />
            <div className="text-[10px] text-blue-400/60">Stable</div>
          </div>
        </div>
      </div>
    </ModuleFrame>
  );
};
