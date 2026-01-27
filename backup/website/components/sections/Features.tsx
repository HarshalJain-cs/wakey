"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Activity, Target, Link2, Sparkles, BarChart3, Timer, Shield, Music, Mail, Calendar, MessageSquare } from "lucide-react";
import { useSound } from "@/components/providers/SoundProvider";

const tabs = [
    { id: "ai", label: "AI & Intelligence", icon: Brain },
    { id: "tracking", label: "Tracking", icon: Activity },
    { id: "focus", label: "Focus", icon: Target },
    { id: "integrations", label: "Integrations", icon: Link2 },
];

const features: Record<string, Array<{ icon: React.ElementType; title: string; desc: string; badge?: string }>> = {
    ai: [
        { icon: Sparkles, title: "AI Insights", desc: "Get personalized productivity recommendations powered by local AI", badge: "Pro" },
        { icon: Brain, title: "JARVIS Assistant", desc: "Your personal AI companion that understands your work patterns", badge: "Pro" },
        { icon: BarChart3, title: "Smart Predictions", desc: "Predict your most productive hours based on historical data" },
        { icon: Target, title: "Goal Suggestions", desc: "AI-suggested daily goals based on your capacity" },
    ],
    tracking: [
        { icon: Activity, title: "Activity Monitor", desc: "Real-time tracking of apps and windows you use" },
        { icon: Timer, title: "Time Tracking", desc: "Automatic time logging without manual entries" },
        { icon: Shield, title: "100% Local", desc: "All data stays on your device. Zero cloud uploads.", badge: "Privacy" },
        { icon: Link2, title: "Browser Extension", desc: "Track web activity across Chrome, Edge, Firefox" },
    ],
    focus: [
        { icon: Timer, title: "Pomodoro Timer", desc: "Built-in focus timer with customizable intervals" },
        { icon: Target, title: "Focus Sessions", desc: "Deep work sessions with distraction blocking" },
        { icon: Shield, title: "Distraction Alerts", desc: "Get notified when you drift to unproductive apps" },
        { icon: Music, title: "Lo-fi Music", desc: "Integrated ambient music for concentration" },
    ],
    integrations: [
        { icon: Calendar, title: "Google Calendar", desc: "Sync your schedule and plan focus blocks" },
        { icon: Link2, title: "Notion", desc: "Connect your workspace for seamless workflows" },
        { icon: MessageSquare, title: "Discord", desc: "Share your focus status with your community" },
        { icon: Mail, title: "Email Reports", desc: "Daily and weekly productivity summaries" },
    ],
};

export default function Features() {
    const [activeTab, setActiveTab] = useState("ai");
    const { play } = useSound();

    return (
        <section className="py-24 relative" id="features">
            <div className="container mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2
                        className="text-4xl lg:text-5xl font-bold mb-4"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        <span style={{ color: "var(--dark-50)" }}>77 Features,</span>{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Infinite Possibilities
                        </span>
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--dark-400)" }}>
                        Everything you need to master your productivity, all in one app.
                    </p>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                play("click");
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${activeTab === tab.id
                                    ? "border"
                                    : "glass"
                                }`}
                            style={{
                                backgroundColor: activeTab === tab.id ? "rgba(20, 184, 166, 0.2)" : undefined,
                                borderColor: activeTab === tab.id ? "#14b8a6" : undefined,
                                color: activeTab === tab.id ? "#14b8a6" : "var(--dark-400)",
                            }}
                            data-cursor-hover
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Feature Cards */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {features[activeTab].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass p-6 group"
                                data-cursor-hover
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-opacity-30"
                                        style={{ backgroundColor: "rgba(20, 184, 166, 0.1)" }}
                                    >
                                        <feature.icon size={24} style={{ color: "#14b8a6" }} />
                                    </div>
                                    {feature.badge && (
                                        <span
                                            className="text-xs px-2 py-1 rounded-full"
                                            style={{
                                                backgroundColor: "rgba(139, 92, 246, 0.2)",
                                                color: "#a78bfa",
                                            }}
                                        >
                                            {feature.badge}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-100)" }}>
                                    {feature.title}
                                </h3>
                                <p className="text-sm" style={{ color: "var(--dark-400)" }}>
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
