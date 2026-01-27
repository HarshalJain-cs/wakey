"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSound } from "@/components/providers/SoundProvider";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
    const { play } = useSound();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setStatus("success");
        play("success");
    };

    return (
        <div className="pt-24 pb-16">
            <div className="container mx-auto px-6">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1
                        className="text-5xl font-bold mb-4"
                        style={{ fontFamily: "var(--font-display)", color: "var(--dark-50)" }}
                    >
                        Get in Touch
                    </h1>
                    <p style={{ color: "var(--dark-400)" }}>
                        Have a question? We&apos;d love to hear from you.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8"
                    >
                        {status === "success" ? (
                            <div className="text-center py-12">
                                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#22c55e" }} />
                                <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--dark-50)" }}>
                                    Message Sent!
                                </h3>
                                <p style={{ color: "var(--dark-400)" }}>
                                    We&apos;ll get back to you within 24 hours.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm mb-2" style={{ color: "var(--dark-300)" }}>
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl transition-colors focus:outline-none"
                                        style={{
                                            backgroundColor: "var(--dark-800)",
                                            border: "1px solid var(--dark-700)",
                                            color: "var(--dark-100)",
                                        }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2" style={{ color: "var(--dark-300)" }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl transition-colors focus:outline-none"
                                        style={{
                                            backgroundColor: "var(--dark-800)",
                                            border: "1px solid var(--dark-700)",
                                            color: "var(--dark-100)",
                                        }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2" style={{ color: "var(--dark-300)" }}>
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl transition-colors focus:outline-none"
                                        style={{
                                            backgroundColor: "var(--dark-800)",
                                            border: "1px solid var(--dark-700)",
                                            color: "var(--dark-100)",
                                        }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2" style={{ color: "var(--dark-300)" }}>
                                        Message
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl transition-colors focus:outline-none resize-none"
                                        style={{
                                            backgroundColor: "var(--dark-800)",
                                            border: "1px solid var(--dark-700)",
                                            color: "var(--dark-100)",
                                        }}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="btn-primary w-full"
                                    data-cursor-hover
                                >
                                    {status === "loading" ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="glass p-6">
                            <Mail className="w-8 h-8 mb-3" style={{ color: "#14b8a6" }} />
                            <h3 className="font-semibold mb-1" style={{ color: "var(--dark-100)" }}>
                                Email Us
                            </h3>
                            <p style={{ color: "var(--dark-400)" }}>support@wakey.app</p>
                        </div>

                        <div className="glass p-6">
                            <MessageSquare className="w-8 h-8 mb-3" style={{ color: "#8b5cf6" }} />
                            <h3 className="font-semibold mb-1" style={{ color: "var(--dark-100)" }}>
                                Join Discord
                            </h3>
                            <p className="mb-3" style={{ color: "var(--dark-400)" }}>
                                Connect with the community
                            </p>
                            <Link
                                href="https://discord.gg/wakey"
                                className="btn-secondary inline-block"
                                data-cursor-hover
                            >
                                Join Server
                            </Link>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-semibold mb-1" style={{ color: "var(--dark-100)" }}>
                                Response Time
                            </h3>
                            <p style={{ color: "var(--dark-400)" }}>
                                We typically respond within 24 hours during business days.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
