"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Trophy, RotateCcw } from "lucide-react";

const icons = ["⏱️", "📊", "🎯", "☕", "🔥", "💪"];

interface FallingIcon {
    id: number;
    icon: string;
    x: number;
    y: number;
    speed: number;
}

export default function NotFound() {
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [fallingIcons, setFallingIcons] = useState<FallingIcon[]>([]);
    const [basketX, setBasketX] = useState(50);
    const [won, setWon] = useState(false);

    const startGame = () => {
        setScore(0);
        setWon(false);
        setGameActive(true);
        setFallingIcons([]);
    };

    const spawnIcon = useCallback(() => {
        const newIcon: FallingIcon = {
            id: Date.now(),
            icon: icons[Math.floor(Math.random() * icons.length)],
            x: Math.random() * 80 + 10,
            y: 0,
            speed: 2 + Math.random() * 2,
        };
        setFallingIcons((prev) => [...prev, newIcon]);
    }, []);

    useEffect(() => {
        if (!gameActive) return;

        const spawnInterval = setInterval(spawnIcon, 1000);
        const moveInterval = setInterval(() => {
            setFallingIcons((prev) =>
                prev
                    .map((icon) => ({ ...icon, y: icon.y + icon.speed }))
                    .filter((icon) => {
                        // Check if caught
                        if (icon.y > 85 && Math.abs(icon.x - basketX) < 12) {
                            setScore((s) => {
                                const newScore = s + 1;
                                if (newScore >= 10) {
                                    setWon(true);
                                    setGameActive(false);
                                }
                                return newScore;
                            });
                            return false;
                        }
                        return icon.y < 100;
                    })
            );
        }, 50);

        return () => {
            clearInterval(spawnInterval);
            clearInterval(moveInterval);
        };
    }, [gameActive, basketX, spawnIcon]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 100;
            setBasketX(Math.max(10, Math.min(90, x)));
        };

        const handleTouchMove = (e: TouchEvent) => {
            const x = (e.touches[0].clientX / window.innerWidth) * 100;
            setBasketX(Math.max(10, Math.min(90, x)));
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center z-10"
            >
                <h1
                    className="text-6xl font-bold mb-4"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    <span style={{ color: "var(--dark-50)" }}>4</span>
                    <span style={{ color: "#14b8a6" }}>0</span>
                    <span style={{ color: "#8b5cf6" }}>4</span>
                </h1>
                <p className="text-2xl mb-8" style={{ color: "var(--dark-300)" }}>
                    This page is on a focus break 🍅
                </p>

                {!gameActive && !won && (
                    <div className="space-y-4">
                        <p style={{ color: "var(--dark-400)" }}>Want to play a quick game?</p>
                        <button onClick={startGame} className="btn-primary" data-cursor-hover>
                            🎮 Catch the Icons
                        </button>
                        <p className="text-sm" style={{ color: "var(--dark-600)" }}>
                            Score 10 to win a discount!
                        </p>
                    </div>
                )}

                {won && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-4"
                    >
                        <Trophy className="w-16 h-16 mx-auto" style={{ color: "#facc15" }} />
                        <p className="text-xl" style={{ color: "var(--dark-200)" }}>
                            You won! 🎉
                        </p>
                        <p className="font-mono text-lg" style={{ color: "#14b8a6" }}>
                            Use code: WAKEY404 for 10% off!
                        </p>
                        <button
                            onClick={startGame}
                            className="btn-secondary flex items-center gap-2 mx-auto"
                        >
                            <RotateCcw size={16} /> Play Again
                        </button>
                    </motion.div>
                )}

                {gameActive && (
                    <div className="mb-4">
                        <p className="text-2xl font-bold" style={{ color: "#14b8a6" }}>
                            Score: {score}/10
                        </p>
                    </div>
                )}

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mt-8 transition-colors hover:text-[#14b8a6]"
                    style={{ color: "var(--dark-400)" }}
                >
                    <Home size={16} /> Back to Home
                </Link>
            </motion.div>

            {/* Game Area */}
            {gameActive && (
                <div className="absolute inset-0 pointer-events-none">
                    {fallingIcons.map((icon) => (
                        <div
                            key={icon.id}
                            className="absolute text-3xl"
                            style={{
                                left: `${icon.x}%`,
                                top: `${icon.y}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {icon.icon}
                        </div>
                    ))}

                    {/* Basket */}
                    <div
                        className="absolute bottom-4 text-4xl"
                        style={{ left: `${basketX}%`, transform: "translateX(-50%)" }}
                    >
                        🧺
                    </div>
                </div>
            )}
        </div>
    );
}
