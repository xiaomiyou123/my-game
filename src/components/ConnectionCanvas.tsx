import React, { useEffect, useRef } from 'react';

interface Connection {
    fromId: string;
    toId: string;
    isActive: boolean;
    color: string;
}

interface ConnectionCanvasProps {
    connections: Connection[];
}

export const ConnectionCanvas: React.FC<ConnectionCanvasProps> = ({ connections }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Map<string, ParticleSystem>>(new Map());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            connections.forEach(conn => {
                if (!conn.isActive) {
                    particlesRef.current.delete(`${conn.fromId}-${conn.toId}`);
                    return;
                }

                const fromEl = document.querySelector(`[data-ai-module="${conn.fromId}"]`);
                const toEl = document.querySelector(`[data-ai-module="${conn.toId}"]`);

                if (!fromEl || !toEl) return;

                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();

                const fromX = fromRect.left + fromRect.width / 2;
                const fromY = fromRect.top + fromRect.height / 2;
                const toX = toRect.left + toRect.width / 2;
                const toY = toRect.top + toRect.height / 2;

                // Draw connection line
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);

                // Create curved path
                const controlX = fromX + (toX - fromX) / 2;
                const controlY = Math.min(fromY, toY) - 50;
                ctx.quadraticCurveTo(controlX, controlY, toX, toY);

                ctx.strokeStyle = conn.color + '40'; // Semi-transparent
                ctx.lineWidth = 2;
                ctx.stroke();

                // Manage particles
                const key = `${conn.fromId}-${conn.toId}`;
                if (!particlesRef.current.has(key)) {
                    particlesRef.current.set(key, new ParticleSystem(fromX, fromY, toX, toY, controlX, controlY, conn.color));
                }

                const particleSystem = particlesRef.current.get(key);
                if (particleSystem) {
                    particleSystem.update();
                    particleSystem.draw(ctx);
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [connections]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-5"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

class ParticleSystem {
    particles: Particle[] = [];
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    controlX: number;
    controlY: number;
    color: string;
    maxParticles = 5;

    constructor(fromX: number, fromY: number, toX: number, toY: number, controlX: number, controlY: number, color: string) {
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.controlX = controlX;
        this.controlY = controlY;
        this.color = color;
    }

    update() {
        // Add new particles
        if (this.particles.length < this.maxParticles && Math.random() > 0.7) {
            this.particles.push(new Particle(this.fromX, this.fromY, this.toX, this.toY, this.controlX, this.controlY, this.color));
        }

        // Update existing particles
        this.particles = this.particles.filter(p => {
            p.update();
            return p.progress < 1;
        });
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

class Particle {
    progress = 0;
    speed = 0.01 + Math.random() * 0.01;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    controlX: number;
    controlY: number;
    color: string;
    x = 0;
    y = 0;

    constructor(fromX: number, fromY: number, toX: number, toY: number, controlX: number, controlY: number, color: string) {
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.controlX = controlX;
        this.controlY = controlY;
        this.color = color;
    }

    update() {
        this.progress += this.speed;

        // Quadratic bezier curve calculation
        const t = this.progress;
        const inverseT = 1 - t;

        this.x = inverseT * inverseT * this.fromX +
            2 * inverseT * t * this.controlX +
            t * t * this.toX;

        this.y = inverseT * inverseT * this.fromY +
            2 * inverseT * t * this.controlY +
            t * t * this.toY;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
