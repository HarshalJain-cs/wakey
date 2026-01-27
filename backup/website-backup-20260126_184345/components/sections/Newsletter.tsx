"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, CheckCircle, Loader2 } from "lucide-react";
import { useSound } from "@/components/providers/SoundProvider";
import Confetti from "@/components/effects/Confetti";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [showConfetti, setShowConfetti] = useState(false);
    const { play } = useSound();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus("success");
                setShowConfetti(true);
                play("success");
                setTimeout(() => setShowConfetti(false), 3000);
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <section className="py-24 relative">
            {showConfetti && <Confetti />}

            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto text-center glass p-12"
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
                        style={{ backgroundColor: "rgba(139, 92, 246, 0.2)", color: "#a78bfa" }}
                    >
                        <Gift size={16} />
                        Get 50% Off at Launch
                    </div>

                    <h2
                        className="text-3xl lg:text-4xl font-bold mb-4"
                        style={{ fontFamily: "var(--font-display)", color: "var(--dark-50)" }}
                    >
                        Join the Waitlist
                    </h2>
                    <p className="mb-8" style={{ color: "var(--dark-400)" }}>
                        Plus early access to new features and productivity tips.
                    </p>

                    {status === "success" ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center justify-center gap-2"
                            style={{ color: "#22c55e" }}
                        >
                            <CheckCircle />
                            <span>You&apos;re in! Check your inbox 🎉</span>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email..."
                                className="flex-1 px-6 py-4 rounded-full transition-colors focus:outline-none"
                                style={{
                                    backgroundColor: "var(--dark-800)",
                                    border: "1px solid var(--dark-700)",
                                    color: "var(--dark-100)",
                                }}
                                required
                            />
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="btn-primary min-w-[160px]"
                                data-cursor-hover
                            >
                                {status === "loading" ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Join Waitlist"
                                )}
                            </button>
                        </form>
                    )}

                    {status === "error" && (
                        <p className="mt-4 text-sm" style={{ color: "#ef4444" }}>
                            Something went wrong. Please try again.
                        </p>
                    )}

                    <p className="text-sm mt-4" style={{ color: "var(--dark-600)" }}>
                        🔒 No spam. Unsubscribe anytime.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
