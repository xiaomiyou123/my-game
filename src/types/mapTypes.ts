// 地图系统的数据类型定义

export interface Position {
    x: number;
    y: number;
}

export interface Polygon {
    points: Position[];
}

export interface Region {
    id: string;
    name: string;
    type: 'farm' | 'greenhouse' | 'orchard' | 'vegetable' | 'custom';
    color: string;
    boundary: Polygon | { x: number; y: number; width: number; height: number }; // 支持多边形或矩形
    position: Position; // 中心位置

    // 展示信息
    icon: string;
    thumbnail?: string;
    description: string;
    textureId?: string;  // 纹理ID

    // 状态
    status: 'normal' | 'warning' | 'critical' | 'idle';
    cropType?: string;
    currentDevices: string[];
    recentEvents: string[];

    // AI数据
    aiRecommendation?: string;
    
    // 样式设置
    opacity?: number; // 透明度 0-1
    showBorder?: boolean; // 是否显示边框
    borderStyle?: 'solid' | 'dashed' | 'dotted'; // 边框样式
    borderWidth?: number; // 边框宽度
    labelPosition?: Position; // 标签位置
}

export interface Device {
    id: string;
    name: string;
    type: 'drone' | 'vehicle' | 'robot' | 'sensor';
    icon: string;

    // 位置与移动
    position: Position;
    heading: number; // 朝向角度 0-360
    isMoving: boolean;
    currentPath?: Position[];
    targetPosition?: Position; // 目标位置

    // 状态
    status: 'active' | 'idle' | 'charging' | 'maintenance' | 'error';
    battery: number; // 0-100
    currentTask?: string;

    // AI控制
    autonomousMode: boolean;
    controlMode: 'auto' | 'manual';
}

export interface DecisionStep {
    id: string;
    order: number;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'done' | 'failed';
    deviceId?: string;
    estimatedTime?: number; // 秒
}

export interface AIDecisionFlow {
    thinking: {
        status: 'idle' | 'analyzing' | 'complete';
        progress: number; // 0-100
        currentStep?: string;
    };
    decision: {
        steps: DecisionStep[];
        currentStepIndex: number;
    };
    execution: {
        status: 'pending' | 'executing' | 'complete' | 'failed';
        progress: number; // 0-100
        startTime?: number;
        endTime?: number;
    };
}

export interface GameEvent {
    id: string;
    type: 'pest' | 'disease' | 'weather' | 'irrigation' | 'harvest' | 'maintenance' | 'custom';
    severity: 'info' | 'warning' | 'critical';
    position: Position;
    regionId?: string;

    title: string;
    description: string;
    icon: string;
    timestamp: number;

    // AI响应
    aiAnalysis?: string;
    aiSolution?: string;
    assignedDevices?: string[];
    status: 'pending' | 'processing' | 'resolved' | 'ignored';

    // AI决策流程
    aiDecisionFlow?: AIDecisionFlow;
}

export interface MapConfig {
    bounds: {
        width: number;
        height: number;
    };
    gridSize: number; // 网格大小
    showGrid: boolean;
    backgroundColor: string;
}

// 地图背景图片数据
export interface MapImageData {
    id: string;
    dataUrl: string;  // base64编码的图片
    originalWidth: number;
    originalHeight: number;
    displayWidth: number;
    displayHeight: number;
    offsetX: number;
    offsetY: number;
    opacity: number;  // 0-1
    timestamp: number;
}
