"use client";

import { motion } from "framer-motion";
import { ChevronDown, Star, Download, Play } from "lucide-react";
import Link from "next/link";
import { useSound } from "@/components/providers/SoundProvider";

const pressLogos = ["TechCrunch", "Product Hunt", "The Verge"];

export default function Hero() {
    const { play } = useSound();

    return (
        <section className="relative min-h-screen flex items-center pt-24 pb-16">
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm"
                    >
                        <Star className="w-4 h-4" style={{ color: "#facc15", fill: "#facc15" }} />
                        <span style={{ color: "var(--dark-300)" }}>4.9 from 2,000+ reviews</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        className="text-5xl lg:text-7xl font-bold leading-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span style={{ color: "var(--dark-50)" }}>Wake Up Your</span>
                        <br />
                        <span
                            style={{
                                background: "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Productivity
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        className="text-xl max-w-lg"
                        style={{ color: "var(--dark-400)" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        77 features. Zero distractions. 100% local.
                        <br />
                        The last productivity app you&apos;ll ever need.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link
                            href="/pricing"
                            className="btn-primary animate-pulse-glow"
                            onClick={() => play("click")}
                            data-cursor-hover
                        >
                            <Download size={20} />
                            Download Free
                        </Link>
                        <button
                            className="btn-secondary"
                            onClick={() => play("click")}
                            data-cursor-hover
                        >
                            <Play size={20} />
                            Watch Demo
                        </button>
                    </motion.div>

                    {/* Press Logos */}
                    <motion.div
                        className="flex items-center gap-8 pt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <span className="text-sm" style={{ color: "var(--dark-600)" }}>
                            As featured in
                        </span>
                        {pressLogos.map((logo) => (
                            <span key={logo} className="font-medium" style={{ color: "var(--dark-500)" }}>
                                {logo}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* Right - 3D App Mockup */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    <div className="relative animate-float">
                        {/* Glow behind */}
                        <div
                            className="absolute inset-0 blur-3xl rounded-3xl"
                            style={{
                                background: "linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)",
                            }}
                        />

                        {/* App Window */}
                        <div className="relative glass p-2 rounded-2xl">
                            <div className="rounded-xl overflow-hidden" style={{ background: "var(--dark-900)" }}>
                                {/* Title bar */}
                                <div
                                    className="flex items-center gap-2 px-4 py-3 border-b"
                                    style={{ borderColor: "var(--dark-800)" }}
                                >
                                    <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                                    <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
                                    <div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
                                    <span className="ml-4 text-sm" style={{ color: "var(--dark-500)" }}>
                                        Wakey
                                    </span>
                                </div>

                                {/* Dashboard Preview */}
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3
                                            className="text-lg font-semibold"
                                            style={{ color: "var(--dark-100)" }}
                                        >
                                            Dashboard
                                        </h3>
                                        <span className="text-sm" style={{ color: "#14b8a6" }}>
                                            Today
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: "Focus Time", value: "4h 32m" },
                                            { label: "Productivity", value: "87%" },
                                            { label: "Sessions", value: "12" },
                                        ].map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="rounded-lg p-3"
                                                style={{ background: "var(--dark-800)" }}
                                            >
                                                <p className="text-xs" style={{ color: "var(--dark-500)" }}>
                                                    {stat.label}
                                                </p>
                                                <p className="text-xl font-bold" style={{ color: "#14b8a6" }}>
                                                    {stat.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Activity Chart */}
                                    <div
                                        className="h-24 rounded-lg flex items-end justify-between p-4 gap-2"
                                        style={{ background: "var(--dark-800)" }}
                                    >
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-t opacity-80"
                                                style={{
                                                    height: `${h}%`,
                                                    background: "linear-gradient(to top, #14b8a6, #8b5cf6)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <div className="flex flex-col items-center gap-2" style={{ color: "var(--dark-500)" }}>
                    <span className="text-sm">Scroll to explore</span>
                    <ChevronDown className="w-5 h-5 animate-bounce-subtle" />
                </div>
            </motion.div>
        </section>
    );
}
