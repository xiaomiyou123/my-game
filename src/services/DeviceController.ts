import type { Device, Position } from '../types/mapTypes';

export class DeviceController {
    private animationFrameId: number | null = null;
    private devices: Map<string, Device> = new Map();
    private movementSpeed = 0.5; // 像素/帧

    constructor() { }

    // 注册设备
    registerDevice(device: Device) {
        this.devices.set(device.id, device);
    }

    // 设置设备路径并开始移动
    moveDeviceToPosition(
        deviceId: string,
        targetPosition: Position,
        onUpdate?: (device: Device) => void,
        onComplete?: () => void
    ) {
        const device = this.devices.get(deviceId);
        if (!device) return;

        // 生成直线路径
        const path = this.generateStraightPath(device.position, targetPosition);
        this.moveDeviceAlongPath(deviceId, path, onUpdate, onComplete);
    }

    // 沿路径移动设备
    moveDeviceAlongPath(
        deviceId: string,
        path: Position[],
        onUpdate?: (device: Device) => void,
        onComplete?: () => void
    ) {
        const device = this.devices.get(deviceId);
        if (!device || path.length === 0) return;

        device.currentPath = path;
        device.isMoving = true;

        let currentPathIndex = 0;

        const animate = () => {
            const device = this.devices.get(deviceId);
            if (!device || !device.isMoving) {
                if (onComplete) onComplete();
                return;
            }

            if (currentPathIndex >= path.length) {
                device.isMoving = false;
                device.currentPath = undefined;
                if (onComplete) onComplete();
                return;
            }

            const targetPoint = path[currentPathIndex];
            const dx = targetPoint.x - device.position.x;
            const dy = targetPoint.y - device.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.movementSpeed) {
                // 到达当前路径点
                device.position = targetPoint;
                currentPathIndex++;
            } else {
                // 向目标移动
                const ratio = this.movementSpeed / distance;
                device.position = {
                    x: device.position.x + dx * ratio,
                    y: device.position.y + dy * ratio
                };

                // 更新朝向（角度）
                device.heading = Math.atan2(dy, dx) * (180 / Math.PI);
            }

            if (onUpdate) onUpdate(device);

            this.animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    // 停止设备移动
    stopDevice(deviceId: string) {
        const device = this.devices.get(deviceId);
        if (device) {
            device.isMoving = false;
            device.currentPath = undefined;
        }
    }

    // 停止所有动画
    stopAll() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.devices.forEach(device => {
            device.isMoving = false;
            device.currentPath = undefined;
        });
    }

    // 生成两点之间的直线路径
    private generateStraightPath(start: Position, end: Position): Position[] {
        const path: Position[] = [];
        const steps = 50; // 路径分段数

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            path.push({
                x: start.x + (end.x - start.x) * t,
                y: start.y + (end.y - start.y) * t
            });
        }

        return path;
    }

    // 生成巡逻路径（围绕区域）
    generatePatrolPath(center: Position, radius: number, points: number = 8): Position[] {
        const path: Position[] = [];

        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            path.push({
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius
            });
        }

        // 回到起点形成闭环
        path.push(path[0]);

        return path;
    }

    // AI自动寻路（简化版A*）
    generateAIPath(start: Position, end: Position, obstacles: Position[] = []): Position[] {
        // 简化实现：暂时返回直线路径
        // TODO: 实现避障算法
        return this.generateStraightPath(start, end);
    }

    // 设置移动速度
    setSpeed(speed: number) {
        this.movementSpeed = Math.max(0.1, Math.min(5, speed));
    }

    // 获取设备当前状态
    getDevice(deviceId: string): Device | undefined {
        return this.devices.get(deviceId);
    }

    // 更新设备
    updateDevice(device: Device) {
        this.devices.set(device.id, device);
    }
}

// 单例实例
export const deviceController = new DeviceController();
