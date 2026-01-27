"use client";

import { motion } from "framer-motion";
import { Clock, Bell, ArrowRight } from "lucide-react";
import Newsletter from "@/components/sections/Newsletter";

const changelog = [
    {
        date: "Coming Soon",
        title: "Version 2.0 Launch",
        description: "Major update with enhanced AI features and new integrations.",
    },
    {
        date: "Jan 2026",
        title: "Browser Extension",
        description: "Track your web activity across all major browsers.",
    },
    {
        date: "Dec 2025",
        title: "JARVIS AI Assistant",
        description: "Introduced intelligent AI assistant for productivity insights.",
    },
];

export default function BlogPage() {
    return (
        <div className="pt-24 pb-16">
            <div className="container mx-auto px-6">
                {/* Coming Soon Hero */}
                <motion.div
                    className="text-center mb-16 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
                        style={{ backgroundColor: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}
                    >
                        <Clock size={16} />
                        Coming Soon
                    </div>
                    <h1
                        className="text-5xl font-bold mb-4"
                        style={{ fontFamily: "var(--font-display)", color: "var(--dark-50)" }}
                    >
                        Blog & Updates
                    </h1>
                    <p className="text-lg" style={{ color: "var(--dark-400)" }}>
                        Productivity tips, feature announcements, and behind-the-scenes content.
                        Subscribe to get notified when we launch!
                    </p>
                </motion.div>

                {/* Changelog */}
                <motion.div
                    className="max-w-2xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2
                        className="text-2xl font-bold mb-6 flex items-center gap-2"
                        style={{ color: "var(--dark-50)" }}
                    >
                        <Bell size={24} style={{ color: "#14b8a6" }} />
                        Changelog
                    </h2>
                    <div className="space-y-6">
                        {changelog.map((item, i) => (
                            <div key={i} className="glass p-6">
                                <p className="text-sm font-mono mb-2" style={{ color: "#14b8a6" }}>
                                    {item.date}
                                </p>
                                <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--dark-100)" }}>
                                    {item.title}
                                </h3>
                                <p style={{ color: "var(--dark-400)" }}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Social Links */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="mb-4" style={{ color: "var(--dark-400)" }}>
                        Follow us for updates
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            href="https://twitter.com/wakeyapp"
                            className="glass px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors hover:border-[#14b8a6]"
                            style={{ color: "var(--dark-300)" }}
                        >
                            Twitter <ArrowRight size={16} />
                        </a>
                        <a
                            href="https://discord.gg/wakey"
                            className="glass px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors hover:border-[#14b8a6]"
                            style={{ color: "var(--dark-300)" }}
                        >
                            Discord <ArrowRight size={16} />
                        </a>
                    </div>
                </motion.div>

                <Newsletter />
            </div>
        </div>
    );
}
