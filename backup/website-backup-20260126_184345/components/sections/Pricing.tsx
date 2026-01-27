"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSound } from "@/components/providers/SoundProvider";

const plans = [
    {
        name: "Free",
        price: { weekly: 0, yearly: 0 },
        description: "Perfect for getting started",
        features: [
            "Basic activity tracking",
            "3 focus sessions per day",
            "Dashboard with 7-day history",
            "Basic reports",
        ],
        cta: "Get Started",
        href: "/download",
        popular: false,
    },
    {
        name: "Pro",
        price: { weekly: 2.5, yearly: 100 },
        originalYearly: 130,
        description: "For serious productivity seekers",
        features: [
            "Everything in Free",
            "Unlimited focus sessions",
            "AI-powered insights",
            "JARVIS AI assistant",
            "All 77 features",
            "Priority support",
            "Lifetime updates",
        ],
        cta: "Start Free Trial",
        href: "/checkout?plan=pro",
        popular: true,
    },
    {
        name: "Enterprise",
        price: { weekly: 0, yearly: 0 },
        description: "For teams and organizations",
        features: [
            "Everything in Pro",
            "Custom deployment",
            "API access",
            "Dedicated support",
            "Team analytics",
            "SSO integration",
        ],
        cta: "Contact Us",
        href: "/contact",
        popular: false,
    },
];

export default function Pricing() {
    const [isYearly, setIsYearly] = useState(true);
    const { play } = useSound();

    return (
        <section className="py-24 relative" id="pricing">
            <div className="container mx-auto px-6">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2
                        className="text-4xl lg:text-5xl font-bold mb-4"
                        style={{ fontFamily: "var(--font-display)", color: "var(--dark-50)" }}
                    >
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg mb-8" style={{ color: "var(--dark-400)" }}>
                        Start free, upgrade when you&apos;re ready.
                    </p>

                    {/* Toggle */}
                    <div className="inline-flex items-center gap-1 glass px-2 py-2 rounded-full">
                        <button
                            onClick={() => {
                                setIsYearly(false);
                                play("toggle");
                            }}
                            className="px-4 py-2 rounded-full transition-all"
                            style={{
                                backgroundColor: !isYearly ? "#14b8a6" : "transparent",
                                color: !isYearly ? "white" : "var(--dark-400)",
                            }}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => {
                                setIsYearly(true);
                                play("toggle");
                            }}
                            className="px-4 py-2 rounded-full transition-all flex items-center gap-2"
                            style={{
                                backgroundColor: isYearly ? "#14b8a6" : "transparent",
                                color: isYearly ? "white" : "var(--dark-400)",
                            }}
                        >
                            Yearly
                            <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: "#8b5cf6", color: "white" }}
                            >
                                Save 23%
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative glass p-8 ${plan.popular ? "scale-105" : ""
                                }`}
                            style={{
                                borderColor: plan.popular ? "#14b8a6" : undefined,
                                boxShadow: plan.popular ? "0 20px 40px rgba(20, 184, 166, 0.2)" : undefined,
                            }}
                        >
                            {plan.popular && (
                                <div
                                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-medium flex items-center gap-1"
                                    style={{
                                        background: "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)",
                                    }}
                                >
                                    <Sparkles size={14} /> Most Popular
                                </div>
                            )}

                            <h3
                                className="text-2xl font-bold mb-2"
                                style={{ color: "var(--dark-50)" }}
                            >
                                {plan.name}
                            </h3>
                            <p className="text-sm mb-6" style={{ color: "var(--dark-400)" }}>
                                {plan.description}
                            </p>

                            {/* Price */}
                            <div className="mb-6">
                                {plan.name === "Enterprise" ? (
                                    <p className="text-3xl font-bold" style={{ color: "var(--dark-50)" }}>
                                        Custom
                                    </p>
                                ) : (
                                    <>
                                        <div className="flex items-baseline gap-1">
                                            <span
                                                className="text-4xl font-bold"
                                                style={{ color: "var(--dark-50)" }}
                                            >
                                                ${isYearly ? plan.price.yearly : plan.price.weekly}
                                            </span>
                                            <span style={{ color: "var(--dark-500)" }}>
                                                /{isYearly ? "year" : "week"}
                                            </span>
                                        </div>
                                        {isYearly && plan.originalYearly && (
                                            <p
                                                className="text-sm line-through"
                                                style={{ color: "var(--dark-500)" }}
                                            >
                                                Was ${plan.originalYearly}/year
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-2"
                                        style={{ color: "var(--dark-300)" }}
                                    >
                                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#14b8a6" }} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`block w-full py-3 rounded-full font-medium text-center transition-all ${plan.popular ? "text-white" : ""
                                    }`}
                                style={{
                                    background: plan.popular
                                        ? "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)"
                                        : "transparent",
                                    border: plan.popular ? "none" : "1px solid var(--dark-600)",
                                    color: plan.popular ? "white" : "var(--dark-200)",
                                }}
                                onClick={() => play("click")}
                                data-cursor-hover
                            >
                                {plan.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
