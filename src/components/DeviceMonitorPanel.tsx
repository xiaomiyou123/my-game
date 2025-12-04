import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Battery, 
  Thermometer, 
  Wifi, 
  WifiOff,
  Camera, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Zap,
  Wind,
  Droplets
} from 'lucide-react';

interface DeviceStatus {
  id: string;
  name: string;
  type: 'drone' | 'vehicle' | 'sensor';
  status: 'online' | 'offline' | 'warning' | 'error';
  battery?: number;
  signal?: number;
  temperature?: number;
  humidity?: number;
  lastSeen: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

interface DeviceMonitorPanelProps {
  className?: string;
}

export const DeviceMonitorPanel: React.FC<DeviceMonitorPanelProps> = ({
  className = ''
}) => {
  const [devices, setDevices] = useState<DeviceStatus[]>([
    {
      id: 'drone-001',
      name: '无人机 Drone-001',
      type: 'drone',
      status: 'online',
      battery: 85,
      signal: 92,
      temperature: 25,
      lastSeen: new Date(),
      location: { lat: 24.5001, lng: 118.0834 }
    },
    {
      id: 'drone-002',
      name: '无人机 Drone-002',
      type: 'drone',
      status: 'warning',
      battery: 35,
      signal: 87,
      temperature: 28,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      location: { lat: 24.5005, lng: 118.0838 }
    },
    {
      id: 'vehicle-001',
      name: '巡逻车 Vehicle-001',
      type: 'vehicle',
      status: 'online',
      battery: 62,
      signal: 78,
      temperature: 22,
      lastSeen: new Date(),
      location: { lat: 24.5002, lng: 118.0835 }
    },
    {
      id: 'sensor-001',
      name: '温度传感器 #001',
      type: 'sensor',
      status: 'online',
      temperature: 24.5,
      humidity: 65,
      lastSeen: new Date(),
      location: { lat: 24.5003, lng: 118.0836 }
    },
    {
      id: 'sensor-002',
      name: '温度传感器 #002',
      type: 'sensor',
      status: 'offline',
      temperature: 0,
      humidity: 0,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      location: { lat: 24.5004, lng: 118.0837 }
    }
  ]);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('all');

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices => 
        prevDevices.map(device => {
          // 随机更新一些数据来模拟实时效果
          if (device.status === 'online') {
            // 电池消耗
            if (device.battery) {
              const batteryChange = Math.random() > 0.7 ? -1 : 0;
              const newBattery = Math.max(0, Math.min(100, device.battery + batteryChange));
              
              // 如果电量低，切换为警告状态
              const newStatus = newBattery < 20 ? 'warning' : device.status;
              
              return { 
                ...device, 
                battery: newBattery,
                status: newStatus,
                lastSeen: new Date()
              };
            }
            
            // 传感器数据波动
            if (device.type === 'sensor') {
              const tempChange = (Math.random() - 0.5) * 0.5;
              const humidityChange = (Math.random() - 0.5) * 2;
              
              return { 
                ...device, 
                temperature: (device.temperature || 20) + tempChange,
                humidity: Math.max(0, Math.min(100, (device.humidity || 50) + humidityChange)),
                lastSeen: new Date()
              };
            }
            
            // 信号强度波动
            if (device.signal) {
              const signalChange = Math.random() > 0.8 ? Math.floor(Math.random() * 10) - 5 : 0;
              const newSignal = Math.max(0, Math.min(100, device.signal + signalChange));
              
              // 如果信号差，切换为错误状态
              const newStatus = newSignal < 30 ? 'error' : device.status;
              
              return { 
                ...device, 
                signal: newSignal,
                status: newStatus,
                lastSeen: new Date()
              };
            }
          }
          
          // 随机状态变化
          if (Math.random() > 0.95) {
            const statuses: Array<DeviceStatus['status']> = ['online', 'offline', 'warning', 'error'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            return {
              ...device,
              status: randomStatus,
              lastSeen: new Date()
            };
          }
          
          return device;
        })
      );
    }, 3000); // 更频繁的更新
    
    return () => clearInterval(interval);
  }, []);

  // 刷新设备状态
  const refreshDeviceStatus = () => {
    setIsRefreshing(true);
    
    // 模拟API调用
    setTimeout(() => {
      setIsRefreshing(false);
      
      // 随机更改一些设备状态
      setDevices(prevDevices => 
        prevDevices.map(device => {
          if (Math.random() > 0.8) {
            const statuses: Array<DeviceStatus['status']> = ['online', 'offline', 'warning', 'error'];
            return {
              ...device,
              status: statuses[Math.floor(Math.random() * statuses.length)],
              lastSeen: new Date()
            };
          }
          return device;
        })
      );
    }, 1000);
  };

  // 获取设备图标
  const getDeviceIcon = (type: DeviceStatus['type']) => {
    switch (type) {
      case 'drone': return Camera;
      case 'vehicle': return MapPin;
      case 'sensor': return Thermometer;
      default: return Activity;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: DeviceStatus['status']) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // 格式化最后在线时间
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`;
    return `${Math.floor(diffMins / 1440)}天前`;
  };

  // 过滤设备
  const filteredDevices = selectedDeviceType === 'all' 
    ? devices 
    : devices.filter(device => device.type === selectedDeviceType);

  // 计算统计信息
  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    warning: devices.filter(d => d.status === 'warning').length,
    error: devices.filter(d => d.status === 'error').length,
    offline: devices.filter(d => d.status === 'offline').length,
    avgBattery: devices.filter(d => d.battery !== undefined).reduce((sum, d) => sum + (d.battery || 0), 0) / devices.filter(d => d.battery !== undefined).length || 0,
    avgSignal: devices.filter(d => d.signal !== undefined).reduce((sum, d) => sum + (d.signal || 0), 0) / devices.filter(d => d.signal !== undefined).length || 0
  };

  return (
    <div className={`bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-4 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinematic text-orange-400 uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-4 h-4" />
          设备监控
        </h3>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedDeviceType}
            onChange={(e) => setSelectedDeviceType(e.target.value)}
            className="bg-black/30 border border-white/10 rounded text-white text-xs px-2 py-1 focus:border-green-500/50 focus:outline-none"
          >
            <option value="all">全部设备</option>
            <option value="drone">无人机</option>
            <option value="vehicle">巡逻车</option>
            <option value="sensor">传感器</option>
          </select>
          
          <button
            onClick={refreshDeviceStatus}
            disabled={isRefreshing}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="刷新状态"
          >
            <RefreshCw className={`w-4 h-4 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
          <div className="text-lg font-bold text-green-400">
            {stats.online}
          </div>
          <div className="text-xs text-green-300">在线</div>
          <div className="text-xs text-green-200 mt-1">
            {((stats.online / stats.total) * 100).toFixed(0)}%
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-center">
          <div className="text-lg font-bold text-yellow-400">
            {stats.warning}
          </div>
          <div className="text-xs text-yellow-300">警告</div>
          <div className="text-xs text-yellow-200 mt-1">
            {stats.avgBattery > 0 ? `${stats.avgBattery.toFixed(0)}%` : 'N/A'}
          </div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-center">
          <div className="text-lg font-bold text-red-400">
            {stats.error}
          </div>
          <div className="text-xs text-red-300">错误</div>
          <div className="text-xs text-red-200 mt-1">
            {stats.avgSignal > 0 ? `${stats.avgSignal.toFixed(0)}%` : 'N/A'}
          </div>
        </div>
        
        <div className="bg-gray-500/10 border border-gray-500/30 rounded p-2 text-center">
          <div className="text-lg font-bold text-gray-400">
            {stats.offline}
          </div>
          <div className="text-xs text-gray-300">离线</div>
          <div className="text-xs text-gray-200 mt-1">
            总计: {stats.total}
          </div>
        </div>
      </div>

      {/* Device List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {filteredDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <Activity className="w-12 h-12 mb-3" />
            <p className="text-sm">暂无该类型设备</p>
          </div>
        ) : (
          filteredDevices.map((device) => {
            const Icon = getDeviceIcon(device.type);
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* 设备图标和状态 */}
                    <div className="relative">
                      <Icon className={`w-8 h-8 ${getStatusColor(device.status)}`} />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                        device.status === 'online' ? 'bg-green-400' :
                        device.status === 'warning' ? 'bg-yellow-400' :
                        device.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                      } animate-pulse`} />
                    </div>
                    
                    {/* 设备信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white">{device.name}</h4>
                        <span className={`text-xs ${getStatusColor(device.status)}`}>
                          {device.status === 'online' ? '在线' :
                           device.status === 'warning' ? '警告' :
                           device.status === 'error' ? '错误' : '离线'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-white/60">
                        最后在线: {formatLastSeen(device.lastSeen)}
                      </div>
                      
                        {/* 设备特定状态 */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                        {device.battery !== undefined && (
                          <div className="flex items-center gap-1">
                            <Battery className={`w-3 h-3 ${
                              device.battery > 60 ? 'text-green-400' :
                              device.battery > 30 ? 'text-yellow-400' : 'text-red-400'
                            }`} />
                            <span className={`${
                              device.battery > 60 ? 'text-green-300' :
                              device.battery > 30 ? 'text-yellow-300' : 'text-red-300'
                            }`}>{device.battery}%</span>
                          </div>
                        )}
                        
                        {device.signal !== undefined && (
                          <div className="flex items-center gap-1">
                            {device.signal > 70 ? (
                              <Wifi className="w-3 h-3 text-green-400" />
                            ) : device.signal > 40 ? (
                              <Wifi className="w-3 h-3 text-yellow-400" />
                            ) : (
                              <WifiOff className="w-3 h-3 text-red-400" />
                            )}
                            <span className={`${
                              device.signal > 70 ? 'text-green-300' :
                              device.signal > 40 ? 'text-yellow-300' : 'text-red-300'
                            }`}>{device.signal}%</span>
                          </div>
                        )}
                        
                        {device.temperature !== undefined && (
                          <div className="flex items-center gap-1">
                            <Thermometer className={`w-3 h-3 ${
                              device.temperature < 20 ? 'text-blue-400' :
                              device.temperature < 30 ? 'text-green-400' : 'text-orange-400'
                            }`} />
                            <span className={`${
                              device.temperature < 20 ? 'text-blue-300' :
                              device.temperature < 30 ? 'text-green-300' : 'text-orange-300'
                            }`}>{device.temperature.toFixed(1)}°C</span>
                          </div>
                        )}
                        
                        {device.humidity !== undefined && (
                          <div className="flex items-center gap-1">
                            <Droplets className={`w-3 h-3 ${
                              device.humidity < 40 ? 'text-orange-400' :
                              device.humidity < 70 ? 'text-green-400' : 'text-blue-400'
                            }`} />
                            <span className={`${
                              device.humidity < 40 ? 'text-orange-300' :
                              device.humidity < 70 ? 'text-green-300' : 'text-blue-300'
                            }`}>{device.humidity}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-1">
                    <button
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="设备设置"
                    >
                      <Settings className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Zap className="w-3 h-3" />
          <span>实时监控中</span>
        </div>
        
        <div className="text-xs text-white/40">
          自动刷新间隔: 5秒
        </div>
      </div>
    </div>
  );
};