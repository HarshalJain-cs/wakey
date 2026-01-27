"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const features = [
    { name: "100% Local/Private", wakey: true, toggl: false, clockify: false, rize: false },
    { name: "AI-Powered Insights", wakey: true, toggl: false, clockify: false, rize: true },
    { name: "JARVIS AI Assistant", wakey: true, toggl: false, clockify: false, rize: false },
    { name: "Total Features", wakey: "77", toggl: "~20", clockify: "~15", rize: "~25" },
    { name: "Offline Mode", wakey: true, toggl: false, clockify: false, rize: false },
    { name: "Focus Timer", wakey: true, toggl: false, clockify: false, rize: true },
    { name: "Distraction Blocker", wakey: true, toggl: false, clockify: false, rize: true },
    { name: "Free Tier", wakey: true, toggl: true, clockify: true, rize: false },
];

const Cell = ({ value }: { value: boolean | string }) => {
    if (typeof value === "boolean") {
        return value ? (
            <Check className="w-5 h-5 mx-auto" style={{ color: "#22c55e" }} />
        ) : (
            <X className="w-5 h-5 mx-auto" style={{ color: "rgba(239, 68, 68, 0.5)" }} />
        );
    }
    return <span style={{ color: "var(--dark-200)" }}>{value}</span>;
};

export default function Comparison() {
    return (
        <section className="py-24 relative" id="comparison">
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
                        How We Compare
                    </h2>
                    <p className="text-lg" style={{ color: "var(--dark-400)" }}>
                        See why Wakey is the best choice for productivity.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="overflow-x-auto"
                >
                    <table className="w-full min-w-[600px] glass overflow-hidden text-center">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--dark-700)" }}>
                                <th className="text-left p-4 font-medium" style={{ color: "var(--dark-400)" }}>
                                    Feature
                                </th>
                                <th className="p-4">
                                    <span className="font-bold" style={{ color: "#14b8a6" }}>
                                        Wakey
                                    </span>
                                </th>
                                <th className="p-4" style={{ color: "var(--dark-400)" }}>
                                    Toggl Track
                                </th>
                                <th className="p-4" style={{ color: "var(--dark-400)" }}>
                                    Clockify
                                </th>
                                <th className="p-4" style={{ color: "var(--dark-400)" }}>
                                    Rize
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((f, i) => (
                                <tr
                                    key={f.name}
                                    className="transition-colors hover:bg-opacity-50"
                                    style={{
                                        borderBottom: "1px solid var(--dark-800)",
                                        backgroundColor: i % 2 === 0 ? "rgba(15, 23, 42, 0.3)" : "transparent",
                                    }}
                                >
                                    <td className="p-4 text-left" style={{ color: "var(--dark-200)" }}>
                                        {f.name}
                                    </td>
                                    <td
                                        className="p-4"
                                        style={{
                                            backgroundColor: "rgba(20, 184, 166, 0.05)",
                                            borderLeft: "1px solid rgba(20, 184, 166, 0.2)",
                                            borderRight: "1px solid rgba(20, 184, 166, 0.2)",
                                        }}
                                    >
                                        <Cell value={f.wakey} />
                                    </td>
                                    <td className="p-4">
                                        <Cell value={f.toggl} />
                                    </td>
                                    <td className="p-4">
                                        <Cell value={f.clockify} />
                                    </td>
                                    <td className="p-4">
                                        <Cell value={f.rize} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </section>
    );
}
