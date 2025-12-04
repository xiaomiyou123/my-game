// Panorama Camera Controller Service
// Controls camera movement, scene transitions, and device perspective simulation

import type { CameraPosition, CameraPath } from '../data/panoramaScenes';

type EasingFunction = (t: number) => number;

interface DevicePosition {
    deviceId: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    heading: number;
    timestamp: number;
}

export class PanoramaCameraController {
    private viewer: any; // Pannellum viewer instance
    private currentPosition: CameraPosition;
    private isAnimating: boolean = false;
    private animationFrameId?: number;

    constructor(viewer: any, initialPosition: CameraPosition) {
        this.viewer = viewer;
        this.currentPosition = initialPosition;
    }

    /**
     * 立即跳转到指定位置（无动画）
     */
    jumpTo(position: CameraPosition): void {
        if (position.sceneId !== this.currentPosition.sceneId) {
            this.viewer.loadScene(position.sceneId);
        }

        this.viewer.setYaw(position.yaw);
        this.viewer.setPitch(position.pitch);

        if (position.fov) {
            this.viewer.setHfov(position.fov);
        }

        this.currentPosition = { ...position };
    }

    /**
     * 平滑移动到指定位置（带动画）
     */
    async moveTo(
        position: CameraPosition,
        duration: number = 1000
    ): Promise<void> {
        if (this.isAnimating) {
            this.stop();
        }

        this.isAnimating = true;

        // 场景切换
        if (position.sceneId !== this.currentPosition.sceneId) {
            await this.transitionToScene(position.sceneId, duration / 2);
        }

        // 相机旋转动画
        await this.animateCamera(
            this.currentPosition,
            position,
            duration
        );

        this.currentPosition = { ...position };
        this.isAnimating = false;
    }

    /**
     * 🚁 无人机视角：沿路径飞行
     */
    async flyAlongPath(path: CameraPath): Promise<void> {
        const segmentDuration = path.duration / path.waypoints.length;

        for (let i = 0; i < path.waypoints.length; i++) {
            if (!this.isAnimating) break;

            const waypoint = path.waypoints[i];
            await this.moveTo(waypoint, segmentDuration);

            // 在每个点短暂停留
            if (i < path.waypoints.length - 1) {
                await this.delay(200);
            }
        }
    }

    /**
     * 🚗 巡逻车视角：地面移动（限制pitch角度）
     */
    async driveAlongPath(path: CameraPath): Promise<void> {
        const groundPath: CameraPath = {
            ...path,
            waypoints: path.waypoints.map(wp => ({
                ...wp,
                pitch: Math.max(-10, Math.min(10, wp.pitch)), // 限制仰俯角
                fov: 90 // 地面视角
            }))
        };

        await this.flyAlongPath(groundPath);
    }

    /**
     * 停止所有动画
     */
    stop(): void {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = undefined;
        }
    }

    /**
     * 获取当前位置
     */
    getCurrentPosition(): CameraPosition {
        return { ...this.currentPosition };
    }

    /**
     * 获取当前视角信息（从viewer读取）
     */
    getCurrentView(): { yaw: number; pitch: number; fov: number } {
        return {
            yaw: this.viewer.getYaw(),
            pitch: this.viewer.getPitch(),
            fov: this.viewer.getHfov()
        };
    }

    // Private methods

    private async transitionToScene(
        sceneId: string,
        duration: number
    ): Promise<void> {
        return new Promise((resolve) => {
            // 创建场景切换动画效果
            const container = this.viewer.getContainer();
            if (container) {
                // 淡出效果
                container.style.transition = `opacity ${duration/2}ms ease-in-out`;
                container.style.opacity = '0.5';
                
                setTimeout(() => {
                    // 加载新场景
                    this.viewer.loadScene(sceneId);
                    
                    // 短暂延迟后淡入
                    setTimeout(() => {
                        container.style.opacity = '1';
                        setTimeout(resolve, duration/2);
                    }, 100);
                }, duration/2);
            } else {
                // 如果没有容器，直接加载场景
                this.viewer.loadScene(sceneId);
                setTimeout(resolve, duration);
            }
        });
    }

    private async animateCamera(
        from: CameraPosition,
        to: CameraPosition,
        duration: number
    ): Promise<void> {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const easing = this.easeInOutCubic;

            const animate = () => {
                if (!this.isAnimating) {
                    resolve();
                    return;
                }

                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easing(progress);

                // 角度插值（考虑-180到180的循环）
                const yaw = this.interpolateAngle(from.yaw, to.yaw, eased);
                const pitch = this.interpolate(from.pitch, to.pitch, eased);

                this.viewer.setYaw(yaw);
                this.viewer.setPitch(pitch);

                if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            this.animationFrameId = requestAnimationFrame(animate);
        });
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    private interpolate(start: number, end: number, progress: number): number {
        return start + (end - start) * progress;
    }

    private interpolateAngle(start: number, end: number, progress: number): number {
        // 处理角度循环（-180到180）
        let diff = end - start;

        if (diff > 180) {
            diff -= 360;
        } else if (diff < -180) {
            diff += 360;
        }

        let result = start + diff * progress;

        // 归一化到-180到180
        while (result > 180) result -= 360;
        while (result < -180) result += 360;

        return result;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Device Tracker Service (for future real-time device following)
export class DeviceTracker {
    private static subscribers = new Map<string, Function[]>();
    private static positions = new Map<string, DevicePosition>();

    static subscribe(
        deviceId: string,
        callback: (position: DevicePosition) => void
    ): () => void {
        if (!this.subscribers.has(deviceId)) {
            this.subscribers.set(deviceId, []);
        }

        this.subscribers.get(deviceId)!.push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(deviceId);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) callbacks.splice(index, 1);
            }
        };
    }

    static updatePosition(position: DevicePosition): void {
        this.positions.set(position.deviceId, position);

        const callbacks = this.subscribers.get(position.deviceId);
        if (callbacks) {
            callbacks.forEach(cb => cb(position));
        }
    }

    static getPosition(deviceId: string): DevicePosition | null {
        return this.positions.get(deviceId) || null;
    }

    static simulateDeviceMovement(
        deviceId: string,
        path: { lat: number; lng: number; heading: number }[],
        intervalMs: number = 1000
    ): () => void {
        let index = 0;
        const interval = setInterval(() => {
            if (index >= path.length) {
                index = 0; // Loop
            }

            const point = path[index];
            this.updatePosition({
                deviceId,
                latitude: point.lat,
                longitude: point.lng,
                heading: point.heading,
                timestamp: Date.now()
            });

            index++;
        }, intervalMs);

        return () => clearInterval(interval);
    }
}
