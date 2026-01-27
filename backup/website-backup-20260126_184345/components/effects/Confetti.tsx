"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
    id: number;
    x: number;
    color: string;
    rotate: number;
    duration: number;
    delay: number;
}

export default function Confetti() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const colors = ["#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e"];
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotate: Math.random() * 360,
            duration: 2 + Math.random(),
            delay: Math.random() * 0.5,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-3 h-3 rounded-full"
                    style={{ left: `${p.x}%`, backgroundColor: p.color }}
                    initial={{ y: -20, opacity: 1, rotate: 0 }}
                    animate={{
                        y: typeof window !== "undefined" ? window.innerHeight + 20 : 1000,
                        opacity: 0,
                        rotate: p.rotate,
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    );
}
