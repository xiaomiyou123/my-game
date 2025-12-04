import type { Region, Device, GameEvent } from '../types/mapTypes';

// 默认模块化地块配置
export const defaultRegions: Region[] = [
    {
        id: 'farm-a',
        name: '农田A区',
        type: 'farm',
        color: '#22c55e',
        boundary: { x: 50, y: 50, width: 200, height: 150 },
        position: { x: 150, y: 125 },
        icon: '🌾',
        description: '主要农田区域，种植小麦和玉米',
        status: 'normal',
        cropType: '小麦',
        currentDevices: [],
        recentEvents: []
    },
    {
        id: 'greenhouse-b',
        name: '温室B区',
        type: 'greenhouse',
        color: '#3b82f6',
        boundary: { x: 300, y: 50, width: 180, height: 120 },
        position: { x: 390, y: 110 },
        icon: '🏠',
        description: '智能温室，环境可控',
        status: 'normal',
        cropType: '蔬菜',
        currentDevices: [],
        recentEvents: []
    },
    {
        id: 'orchard-c',
        name: '果园C区',
        type: 'orchard',
        color: '#f59e0b',
        boundary: { x: 50, y: 230, width: 220, height: 140 },
        position: { x: 160, y: 300 },
        icon: '🍎',
        description: '苹果和梨树果园',
        status: 'normal',
        cropType: '苹果',
        currentDevices: [],
        recentEvents: []
    },
    {
        id: 'vegetable-d',
        name: '菜地D区',
        type: 'vegetable',
        color: '#a855f7',
        boundary: { x: 320, y: 200, width: 160, height: 160 },
        position: { x: 400, y: 280 },
        icon: '🥬',
        description: '有机蔬菜种植区',
        status: 'normal',
        cropType: '生菜',
        currentDevices: [],
        recentEvents: []
    }
];

// 默认设备配置
export const defaultDevices: Device[] = [
    {
        id: 'drone-01',
        name: '巡航无人机-01',
        type: 'drone',
        icon: '🚁',
        position: { x: 150, y: 125 },
        heading: 0,
        isMoving: false,
        status: 'active',
        battery: 85,
        autonomousMode: true,
        controlMode: 'auto'
    },
    {
        id: 'vehicle-01',
        name: '农用车-01',
        type: 'vehicle',
        icon: '🚜',
        position: { x: 390, y: 110 },
        heading: 90,
        isMoving: false,
        status: 'idle',
        battery: 100,
        autonomousMode: false,
        controlMode: 'manual'
    },
    {
        id: 'robot-01',
        name: '采摘机器人-01',
        type: 'robot',
        icon: '🤖',
        position: { x: 160, y: 300 },
        heading: 180,
        isMoving: false,
        status: 'active',
        battery: 92,
        autonomousMode: true,
        controlMode: 'auto'
    }
];

// 示例事件（带AI决策流程）
export const sampleEvents: GameEvent[] = [
    {
        id: 'event-1',
        type: 'pest',
        severity: 'warning',
        position: { x: 150, y: 125 },
        regionId: 'farm-a',
        title: '发现病虫害',
        description: '农田A区发现少量蚜虫',
        icon: '⚠️',
        timestamp: Date.now() - 3600000,
        status: 'processing',
        aiAnalysis: '根据图像识别，检测到蚜虫数量约50只/㎡，建议立即喷洒生物农药。',
        aiSolution: '派遣无人机-01携带生物农药进行精准喷洒，预计30分钟完成。',
        aiDecisionFlow: {
            thinking: {
                status: 'complete',
                progress: 100,
                currentStep: '分析完成'
            },
            decision: {
                steps: [
                    {
                        id: 'step-1',
                        order: 1,
                        title: '图像识别分析',
                        description: '使用AI视觉模型识别病虫害类型和密度',
                        status: 'done',
                        estimatedTime: 5
                    },
                    {
                        id: 'step-2',
                        order: 2,
                        title: '方案生成',
                        description: '基于病虫害类型选择最优处理方案',
                        status: 'done',
                        estimatedTime: 3
                    },
                    {
                        id: 'step-3',
                        order: 3,
                        title: '设备派遣',
                        description: '调度无人机-01前往目标区域',
                        status: 'active',
                        deviceId: 'drone-01',
                        estimatedTime: 120
                    },
                    {
                        id: 'step-4',
                        order: 4,
                        title: '执行喷洒',
                        description: '精准喷洒生物农药',
                        status: 'pending',
                        deviceId: 'drone-01',
                        estimatedTime: 300
                    },
                    {
                        id: 'step-5',
                        order: 5,
                        title: '效果监测',
                        description: '24小时后复查处理效果',
                        status: 'pending',
                        estimatedTime: 600
                    }
                ],
                currentStepIndex: 2
            },
            execution: {
                status: 'executing',
                progress: 45,
                startTime: Date.now() - 180000
            }
        }
    },
    {
        id: 'event-2',
        type: 'irrigation',
        severity: 'info',
        position: { x: 400, y: 280 },
        regionId: 'vegetable-d',
        title: '灌溉提醒',
        description: '菜地D区土壤湿度偏低',
        icon: 'ℹ️',
        timestamp: Date.now() - 1800000,
        status: 'pending',
        assignedDevices: ['vehicle-01'],
        aiAnalysis: '土壤湿度检测为35%，低于最优范围（60-80%），建议灌溉。',
        aiSolution: '启动智能灌溉系统，预计灌溉20分钟，用水量约500L。',
        aiDecisionFlow: {
            thinking: {
                status: 'analyzing',
                progress: 75,
                currentStep: '计算最优灌溉策略...'
            },
            decision: {
                steps: [],
                currentStepIndex: 0
            },
            execution: {
                status: 'pending',
                progress: 0
            }
        }
    }
];
