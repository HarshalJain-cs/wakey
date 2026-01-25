"use client";

import { useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Calculator, Coffee, Tv } from "lucide-react";
import Link from "next/link";

export default function ROICalculator() {
    const [hoursPerDay, setHoursPerDay] = useState(8);
    const [hourlyRate, setHourlyRate] = useState(50);
    const [distractionPercent, setDistractionPercent] = useState(25);

    // Calculations
    const hoursLostPerDay = (hoursPerDay * distractionPercent) / 100;
    const hoursSavedPerDay = hoursLostPerDay * 0.7; // Wakey helps recover 70%
    const yearlyHoursSaved = hoursSavedPerDay * 260; // Working days
    const yearlySavings = yearlyHoursSaved * hourlyRate;
    const coffees = Math.round(yearlySavings / 5);
    const netflixEpisodes = Math.round(yearlyHoursSaved / 0.75);

    // Animated spring value
    const springValue = useSpring(yearlySavings, { stiffness: 100, damping: 30 });

    useEffect(() => {
        springValue.set(yearlySavings);
    }, [yearlySavings, springValue]);

    const displayValue = useTransform(springValue, (v) => Math.round(v).toLocaleString());

    return (
        <section className="py-24 relative" id="calculator">
            <div className="container mx-auto px-6">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm mb-4">
                            <Calculator className="w-4 h-4" style={{ color: "#14b8a6" }} />
                            <span style={{ color: "var(--dark-300)" }}>ROI Calculator</span>
                        </div>
                        <h2
                            className="text-4xl lg:text-5xl font-bold mb-4"
                            style={{ fontFamily: "var(--font-display)", color: "var(--dark-50)" }}
                        >
                            How Much Could You Save?
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Inputs */}
                        <div className="glass p-8 space-y-8">
                            <div>
                                <label
                                    className="flex justify-between mb-2"
                                    style={{ color: "var(--dark-300)" }}
                                >
                                    <span>Hours worked per day</span>
                                    <span className="font-mono" style={{ color: "#14b8a6" }}>
                                        {hoursPerDay}h
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="4"
                                    max="12"
                                    value={hoursPerDay}
                                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                                    className="w-full accent-teal-500"
                                    style={{ accentColor: "#14b8a6" }}
                                />
                            </div>

                            <div>
                                <label
                                    className="flex justify-between mb-2"
                                    style={{ color: "var(--dark-300)" }}
                                >
                                    <span>Your hourly rate</span>
                                    <span className="font-mono" style={{ color: "#14b8a6" }}>
                                        ${hourlyRate}
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    step="5"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                                    className="w-full"
                                    style={{ accentColor: "#14b8a6" }}
                                />
                            </div>

                            <div>
                                <label
                                    className="flex justify-between mb-2"
                                    style={{ color: "var(--dark-300)" }}
                                >
                                    <span>Time lost to distractions</span>
                                    <span className="font-mono" style={{ color: "#14b8a6" }}>
                                        {distractionPercent}%
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="50"
                                    step="5"
                                    value={distractionPercent}
                                    onChange={(e) => setDistractionPercent(Number(e.target.value))}
                                    className="w-full"
                                    style={{ accentColor: "#14b8a6" }}
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div className="glass p-8 text-center flex flex-col justify-center">
                            <p className="mb-2" style={{ color: "var(--dark-400)" }}>
                                With Wakey, you could save:
                            </p>

                            <div className="my-6">
                                <p className="text-2xl font-mono" style={{ color: "#14b8a6" }}>
                                    {hoursSavedPerDay.toFixed(1)} hours/day
                                </p>
                                <motion.p
                                    className="text-5xl font-bold my-4"
                                    style={{ color: "var(--dark-50)" }}
                                >
                                    ${yearlySavings.toLocaleString()}/year
                                </motion.p>
                            </div>

                            <div
                                className="flex justify-center gap-8"
                                style={{ color: "var(--dark-400)" }}
                            >
                                <div className="flex items-center gap-2">
                                    <Coffee style={{ color: "#14b8a6" }} />
                                    <span>{coffees.toLocaleString()} coffees</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tv style={{ color: "#8b5cf6" }} />
                                    <span>{netflixEpisodes.toLocaleString()} episodes</span>
                                </div>
                            </div>

                            <Link
                                href="/pricing"
                                className="btn-primary mt-8 animate-pulse-glow mx-auto"
                                data-cursor-hover
                            >
                                Start Saving Time →
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
