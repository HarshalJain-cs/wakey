"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Pre-generate deterministic particle positions
function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

export default function LoadingScreen() {
    const [phase, setPhase] = useState(0);
    const [show, setShow] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Generate particle positions once, deterministically
    const particlePositions = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            x: seededRandom(i) * 1000,
            y: seededRandom(i + 100) * 800,
        }));
    }, []);

    useEffect(() => {
        setMounted(true);

        const timeline = [
            { delay: 0 },      // Phase 0: Initial
            { delay: 500 },    // Phase 1: Particles
            { delay: 1500 },   // Phase 2: Wordmark
            { delay: 2500 },   // Phase 3: Tagline
            { delay: 4500 },   // Phase 4: Fade out
        ];

        timeline.forEach((step, index) => {
            setTimeout(() => setPhase(index), step.delay);
        });

        setTimeout(() => {
            setShow(false);
        }, 5000);

        // Skip on keypress
        const handleKeyPress = () => setShow(false);
        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
                    style={{ background: "#020617" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Particles */}
                    {phase >= 1 && (
                        <div className="absolute inset-0">
                            {particlePositions.map((pos, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 rounded-full"
                                    style={{ backgroundColor: "#14b8a6" }}
                                    initial={{
                                        x: pos.x,
                                        y: pos.y,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        x: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
                                        y: typeof window !== "undefined" ? window.innerHeight / 2 : 400,
                                        opacity: [0, 1, 1, 0],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        delay: i * 0.02,
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Wordmark */}
                    {phase >= 2 && (
                        <motion.div
                            className="text-center z-10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h1 className="text-7xl md:text-8xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                                {"WAKEY".split("").map((letter, i) => (
                                    <motion.span
                                        key={i}
                                        className="inline-block"
                                        style={{
                                            background: "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </h1>

                            {/* Tagline */}
                            {phase >= 3 && (
                                <motion.p
                                    className="text-xl mt-4"
                                    style={{ color: "#94a3b8" }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    Wake up your productivity
                                </motion.p>
                            )}
                        </motion.div>
                    )}

                    {/* Skip hint */}
                    <motion.p
                        className="absolute bottom-8 text-sm"
                        style={{ color: "#475569" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        Press any key to skip
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
