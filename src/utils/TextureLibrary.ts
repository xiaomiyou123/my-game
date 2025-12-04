// 纹理库 - 生成真实感Canvas纹理

export interface Texture {
    id: string;
    name: string;
    category: 'grass' | 'soil' | 'greenhouse' | 'water' | 'road' | 'building';
    pattern: CanvasPattern | null;
    color: string;
    preview: string; // base64预览图
    scale: number;
}

class TextureLibrary {
    private textures: Map<string, Texture> = new Map();
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 100;
        this.canvas.height = 100;
        this.ctx = this.canvas.getContext('2d')!;

        this.initializeTextures();
    }

    private initializeTextures() {
        // 草地纹理
        this.addTexture(this.createGrassTexture('grass-light', '浅绿草地', '#4ade80'));
        this.addTexture(this.createGrassTexture('grass-dark', '深绿草地', '#22c55e'));
        this.addTexture(this.createGrassTexture('grass-yellow', '黄绿草地', '#84cc16'));

        // 土壤纹理
        this.addTexture(this.createSoilTexture('soil-brown', '棕色耕地', '#92400e'));
        this.addTexture(this.createSoilTexture('soil-dark', '深棕土壤', '#78350f'));
        this.addTexture(this.createSoilTexture('soil-light', '浅棕土壤', '#a16207'));

        // 温室纹理
        this.addTexture(this.createGreenhouseTexture('greenhouse-glass', '玻璃温室', '#3b82f6'));
        this.addTexture(this.createGreenhouseTexture('greenhouse-plastic', '塑料大棚', '#e0e7ff'));

        // 水体纹理
        this.addTexture(this.createWaterTexture('water-blue', '水体', '#0ea5e9'));

        // 道路纹理
        this.addTexture(this.createRoadTexture('road-concrete', '水泥路', '#6b7280'));
    }

    // 创建草地纹理
    private createGrassTexture(id: string, name: string, baseColor: string): Texture {
        const size = 40;
        this.canvas.width = size;
        this.canvas.height = size;

        // 填充基色
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(0, 0, size, size);

        // 添加草丛细节（随机小线条）
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const length = 2 + Math.random() * 4;
            const angle = Math.random() * Math.PI;

            this.ctx.strokeStyle = this.adjustColor(baseColor, -20 + Math.random() * 10);
            this.ctx.lineWidth = 0.5 + Math.random();
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            this.ctx.stroke();
        }

        // 添加一些深色斑点
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 0.5 + Math.random() * 1.5;

            this.ctx.fillStyle = this.adjustColor(baseColor, -30);
            this.ctx.globalAlpha = 0.3 + Math.random() * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }

        const pattern = this.ctx.createPattern(this.canvas, 'repeat');
        const preview = this.canvas.toDataURL();

        return {
            id,
            name,
            category: 'grass',
            pattern,
            color: baseColor,
            preview,
            scale: 1
        };
    }

    // 创建土壤纹理
    private createSoilTexture(id: string, name: string, baseColor: string): Texture {
        const size = 50;
        this.canvas.width = size;
        this.canvas.height = size;

        // 填充基色
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(0, 0, size, size);

        // 添加土块纹理（不规则多边形）
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const numPoints = 4 + Math.floor(Math.random() * 3);

            this.ctx.fillStyle = this.adjustColor(baseColor, -10 + Math.random() * 20);
            this.ctx.globalAlpha = 0.4 + Math.random() * 0.3;
            this.ctx.beginPath();

            for (let j = 0; j < numPoints; j++) {
                const angle = (j / numPoints) * Math.PI * 2;
                const radius = 2 + Math.random() * 3;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;

                if (j === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }

            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }

        // 添加裂纹
        for (let i = 0; i < 10; i++) {
            const startX = Math.random() * size;
            const startY = Math.random() * size;
            const length = 5 + Math.random() * 15;
            const angle = Math.random() * Math.PI * 2;

            this.ctx.strokeStyle = this.adjustColor(baseColor, -25);
            this.ctx.lineWidth = 0.5;
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);

            // 绘制曲折的裂纹
            let currentX = startX;
            let currentY = startY;
            const segments = 3 + Math.floor(Math.random() * 3);

            for (let j = 0; j < segments; j++) {
                currentX += Math.cos(angle + (Math.random() - 0.5) * 0.5) * (length / segments);
                currentY += Math.sin(angle + (Math.random() - 0.5) * 0.5) * (length / segments);
                this.ctx.lineTo(currentX, currentY);
            }

            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }

        const pattern = this.ctx.createPattern(this.canvas, 'repeat');
        const preview = this.canvas.toDataURL();

        return {
            id,
            name,
            category: 'soil',
            pattern,
            color: baseColor,
            preview,
            scale: 1
        };
    }

    // 创建温室纹理
    private createGreenhouseTexture(id: string, name: string, baseColor: string): Texture {
        const size = 60;
        this.canvas.width = size;
        this.canvas.height = size;

        // 填充半透明基色
        this.ctx.fillStyle = baseColor + '40';
        this.ctx.fillRect(0, 0, size, size);

        // 绘制窗框/骨架网格
        const gridSize = 15;
        this.ctx.strokeStyle = baseColor;
        this.ctx.lineWidth = 2;

        // 垂直线
        for (let x = 0; x <= size; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, size);
            this.ctx.stroke();
        }

        // 水平线
        for (let y = 0; y <= size; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(size, y);
            this.ctx.stroke();
        }

        // 添加光反射效果（对角线高光）
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;

        for (let i = -size; i < size * 2; i += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i + size, size);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;

        const pattern = this.ctx.createPattern(this.canvas, 'repeat');
        const preview = this.canvas.toDataURL();

        return {
            id,
            name,
            category: 'greenhouse',
            pattern,
            color: baseColor,
            preview,
            scale: 1
        };
    }

    // 创建水体纹理
    private createWaterTexture(id: string, name: string, baseColor: string): Texture {
        const size = 80;
        this.canvas.width = size;
        this.canvas.height = size;

        // 渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, this.adjustColor(baseColor, -20));

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, size, size);

        // 添加水波纹（正弦波）
        this.ctx.strokeStyle = this.adjustColor(baseColor, 30);
        this.ctx.lineWidth = 1.5;
        this.ctx.globalAlpha = 0.3;

        for (let offsetY = 0; offsetY < size; offsetY += 15) {
            this.ctx.beginPath();
            for (let x = 0; x <= size; x++) {
                const y = offsetY + Math.sin(x * 0.1) * 3;
                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;

        // 添加光斑
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 2 + Math.random() * 4;

            const spotGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            spotGradient.addColorStop(0, '#ffffff');
            spotGradient.addColorStop(1, baseColor + '00');

            this.ctx.fillStyle = spotGradient;
            this.ctx.globalAlpha = 0.2 + Math.random() * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }

        const pattern = this.ctx.createPattern(this.canvas, 'repeat');
        const preview = this.canvas.toDataURL();

        return {
            id,
            name,
            category: 'water',
            pattern,
            color: baseColor,
            preview,
            scale: 1
        };
    }

    // 创建道路纹理
    private createRoadTexture(id: string, name: string, baseColor: string): Texture {
        const size = 50;
        this.canvas.width = size;
        this.canvas.height = size;

        // 填充基色
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(0, 0, size, size);

        // 添加水泥质感（随机矩形）
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const w = 1 + Math.random() * 3;
            const h = 1 + Math.random() * 3;

            this.ctx.fillStyle = this.adjustColor(baseColor, -10 + Math.random() * 20);
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(x, y, w, h);
            this.ctx.globalAlpha = 1;
        }

        // 添加裂缝
        for (let i = 0; i < 5; i++) {
            const startX = Math.random() * size;
            const startY = Math.random() * size;
            const endX = startX + (Math.random() - 0.5) * 20;
            const endY = startY + (Math.random() - 0.5) * 20;

            this.ctx.strokeStyle = this.adjustColor(baseColor, -40);
            this.ctx.lineWidth = 0.5 + Math.random() * 0.5;
            this.ctx.globalAlpha = 0.6;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }

        const pattern = this.ctx.createPattern(this.canvas, 'repeat');
        const preview = this.canvas.toDataURL();

        return {
            id,
            name,
            category: 'road',
            pattern,
            color: baseColor,
            preview,
            scale: 1
        };
    }

    // 颜色调整辅助函数
    private adjustColor(color: string, amount: number): string {
        // 简单的亮度调整
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);

        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    private addTexture(texture: Texture) {
        this.textures.set(texture.id, texture);
    }

    // 获取所有纹理
    getAllTextures(): Texture[] {
        return Array.from(this.textures.values());
    }

    // 按类别获取纹理
    getTexturesByCategory(category: Texture['category']): Texture[] {
        return this.getAllTextures().filter(t => t.category === category);
    }

    // 获取单个纹理
    getTexture(id: string): Texture | null {
        return this.textures.get(id) || null;
    }

    // 获取默认纹理（根据地块类型）
    getDefaultTexture(regionType: string): Texture | null {
        const defaults: Record<string, string> = {
            'farm': 'grass-dark',
            'greenhouse': 'greenhouse-glass',
            'orchard': 'grass-light',
            'vegetable': 'soil-brown',
            'custom': 'grass-light'
        };

        const textureId = defaults[regionType] || 'grass-light';
        return this.getTexture(textureId);
    }
}

// 单例导出
export const textureLibrary = new TextureLibrary();
