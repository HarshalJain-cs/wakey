"use client";

import { useEffect, useRef } from "react";

// CSS-based cosmic background that's compatible with React 19
// Replaces Three.js implementation to avoid version conflicts

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
    color: string;
}

function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export default function CosmicBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const starsRef = useRef<Star[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Generate stars deterministically
        const generateStars = () => {
            const stars: Star[] = [];
            const tealStars = 150;
            const purpleStars = 80;

            // Teal stars
            for (let i = 0; i < tealStars; i++) {
                stars.push({
                    x: seededRandom(i * 3) * canvas.width,
                    y: seededRandom(i * 3 + 1) * canvas.height,
                    size: seededRandom(i * 3 + 2) * 2 + 0.5,
                    opacity: seededRandom(i * 3 + 3) * 0.5 + 0.3,
                    speed: seededRandom(i * 3 + 4) * 0.0003 + 0.0001,
                    color: "#14b8a6",
                });
            }

            // Purple stars
            for (let i = 0; i < purpleStars; i++) {
                const offset = 10000;
                stars.push({
                    x: seededRandom(i * 3 + offset) * canvas.width,
                    y: seededRandom(i * 3 + 1 + offset) * canvas.height,
                    size: seededRandom(i * 3 + 2 + offset) * 2.5 + 0.8,
                    opacity: seededRandom(i * 3 + 3 + offset) * 0.4 + 0.2,
                    speed: seededRandom(i * 3 + 4 + offset) * 0.0004 + 0.0001,
                    color: "#8b5cf6",
                });
            }

            return stars;
        };

        starsRef.current = generateStars();

        let time = 0;
        const animate = () => {
            time += 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw stars with subtle movement
            starsRef.current.forEach((star, i) => {
                const offsetX = Math.sin(time * star.speed + i) * 20;
                const offsetY = Math.cos(time * star.speed * 0.7 + i) * 15;
                const twinkle = 0.7 + Math.sin(time * 0.02 + i) * 0.3;

                ctx.beginPath();
                ctx.arc(
                    star.x + offsetX,
                    star.y + offsetY,
                    star.size,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = star.color;
                ctx.globalAlpha = star.opacity * twinkle;
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-10">
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                style={{ background: "transparent" }}
            />

            {/* Gradient overlay for depth */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse at 30% 70%, rgba(20, 184, 166, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
                    `,
                }}
            />
        </div>
    );
}
