// Panorama scene configuration and data types

export interface CameraPosition {
    sceneId: string;
    yaw: number;        // -180 to 180
    pitch: number;      // -90 to 90
    fov?: number;       // Field of view
}

export interface CameraPath {
    id: string;
    name: string;
    description?: string;
    waypoints: Waypoint[];
    duration: number;   // Total duration in ms
    easing?: 'linear' | 'easeInOut' | 'smooth';
    isLoop?: boolean;
    created?: Date;
    deviceType?: 'drone' | 'vehicle' | 'manual';
}

export interface Waypoint {
    id: string;
    sceneId: string;
    yaw: number;
    pitch: number;
    fov?: number;
    duration?: number; // Time spent at this waypoint
    name?: string;
    description?: string;
    action?: 'pause' | 'scan' | 'analyze' | 'capture'; // Action to perform at this waypoint
    metadata?: Record<string, any>;
}

export interface Hotspot {
    id: string;
    yaw: number;
    pitch: number;
    type: 'scene' | 'info' | 'device' | 'waypoint';
    targetSceneId?: string;
    label?: string;
    icon?: string;
    onClick?: () => void;
    waypointId?: string; // Reference to a waypoint if this is a waypoint hotspot
}

export interface PanoramaScene {
    id: string;
    name: string;
    imageUrl: string;
    position: {
        lat: number;
        lng: number;
        alt?: number;
    };
    hotspots: Hotspot[];
    metadata?: {
        area: 'greenhouse-a' | 'greenhouse-b' | 'field' | 'outdoor' | 'custom';
        type: 'indoor' | 'outdoor';
        description?: string;
    };
}

// Demo scenes - 温室大棚场景
export const demoScenes: PanoramaScene[] = [
    {
        id: 'greenhouse-a-entry',
        name: '温室A区入口',
        imageUrl: 'https://picsum.photos/seed/greenhouse-a-entry/2000/1000.jpg',
        position: { lat: 24.5000, lng: 118.0833, alt: 0 },
        hotspots: [
            {
                id: 'to-center',
                yaw: 0,
                pitch: 0,
                type: 'scene',
                targetSceneId: 'greenhouse-a-center',
                label: '前往中心区',
                icon: '→'
            },
            {
                id: 'info-1',
                yaw: 90,
                pitch: -10,
                type: 'info',
                label: '温度传感器 #124',
                icon: '🌡️'
            }
        ],
        metadata: {
            area: 'greenhouse-a',
            type: 'indoor',
            description: '温室A区主入口，配备自动门和环境监控系统'
        }
    },
    {
        id: 'greenhouse-a-center',
        name: '温室A区中心',
        imageUrl: 'https://picsum.photos/seed/greenhouse-a-center/2000/1000.jpg',
        position: { lat: 24.5001, lng: 118.0834, alt: 0 },
        hotspots: [
            {
                id: 'to-entry',
                yaw: 180,
                pitch: 0,
                type: 'scene',
                targetSceneId: 'greenhouse-a-entry',
                label: '返回入口',
                icon: '←'
            },
            {
                id: 'to-crops',
                yaw: 90,
                pitch: 0,
                type: 'scene',
                targetSceneId: 'greenhouse-a-crops',
                label: '作物种植区',
                icon: '→'
            },
            {
                id: 'device-drone',
                yaw: 0,
                pitch: -45,
                type: 'device',
                label: '无人机 Drone-001',
                icon: '🚁'
            }
        ],
        metadata: {
            area: 'greenhouse-a',
            type: 'indoor',
            description: '温室中心区域，主要栽培区'
        }
    },
    {
        id: 'greenhouse-a-crops',
        name: '温室A区作物区',
        imageUrl: 'https://picsum.photos/seed/greenhouse-a-crops/2000/1000.jpg',
        position: { lat: 24.5002, lng: 118.0835, alt: 0 },
        hotspots: [
            {
                id: 'to-center',
                yaw: 270,
                pitch: 0,
                type: 'scene',
                targetSceneId: 'greenhouse-a-center',
                label: '返回中心',
                icon: '←'
            },
            {
                id: 'crop-info',
                yaw: 0,
                pitch: -20,
                type: 'info',
                label: '番茄生长监测点',
                icon: '🍅'
            }
        ],
        metadata: {
            area: 'greenhouse-a',
            type: 'indoor',
            description: '主要作物种植区，智能灌溉系统覆盖'
        }
    },
    {
        id: 'outdoor-farm',
        name: '露天农田',
        imageUrl: 'https://picsum.photos/seed/outdoor-farm/2000/1000.jpg',
        position: { lat: 24.5010, lng: 118.0840, alt: 0 },
        hotspots: [
            {
                id: 'to-greenhouse',
                yaw: 90,
                pitch: 0,
                type: 'scene',
                targetSceneId: 'greenhouse-a-entry',
                label: '前往温室',
                icon: '🏠'
            },
            {
                id: 'vehicle',
                yaw: 180,
                pitch: -5,
                type: 'device',
                label: '巡逻车 Vehicle-001',
                icon: '🚗'
            }
        ],
        metadata: {
            area: 'field',
            type: 'outdoor',
            description: '露天种植区，适合耐候作物'
        }
    }
];

// 预定义无人机巡航路径
export const dronePatrolPaths = {
    'greenhouse-a-full': {
        name: '温室A区完整巡逻',
        waypoints: [
            { sceneId: 'greenhouse-a-entry', yaw: 0, pitch: -20 },
            { sceneId: 'greenhouse-a-center', yaw: 90, pitch: -15 },
            { sceneId: 'greenhouse-a-crops', yaw: 180, pitch: -25 },
            { sceneId: 'greenhouse-a-center', yaw: 270, pitch: -10 },
            { sceneId: 'greenhouse-a-entry', yaw: 0, pitch: 0 }
        ],
        duration: 20000
    },
    'quick-scan': {
        name: '快速扫描',
        waypoints: [
            { sceneId: 'greenhouse-a-entry', yaw: 0, pitch: 0 },
            { sceneId: 'greenhouse-a-center', yaw: 0, pitch: -30 },
            { sceneId: 'greenhouse-a-crops', yaw: 0, pitch: -20 }
        ],
        duration: 10000
    }
};

// 巡逻车路径（地面视角）
export const vehiclePatrolPaths = {
    'perimeter': {
        name: '外围巡逻',
        waypoints: [
            { sceneId: 'outdoor-farm', yaw: 0, pitch: 0 },
            { sceneId: 'outdoor-farm', yaw: 90, pitch: 0 },
            { sceneId: 'outdoor-farm', yaw: 180, pitch: 0 },
            { sceneId: 'outdoor-farm', yaw: 270, pitch: 0 }
        ],
        duration: 15000
    }
};
