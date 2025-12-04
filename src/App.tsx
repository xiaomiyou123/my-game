import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { InspectionCenter } from './components/InspectionCenter';
import { GameMapView } from './components/GameMapView';
import { AppNavigator } from './components/AppNavigator';

// 创建一个布局组件，包含导航栏
const AppLayout: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Route Pages */}
      <Outlet />
      
      {/* Global macOS-style Navigation */}
      <AppNavigator />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inspection" element={<InspectionCenter />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder pages for未来开发
const DevicesPage: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">设备控制中心</h1>
      <p className="text-white/60">即将上线...</p>
    </div>
  </div>
);

const AnalyticsPage: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br from-orange-900 via-black to-orange-900 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">数据分析</h1>
      <p className="text-white/60">即将上线...</p>
    </div>
  </div>
);

export default App;
