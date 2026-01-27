"use client";

import { motion } from "framer-motion";
import { Users, Target, Heart, Rocket } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Hero */}
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-5xl lg:text-6xl font-bold mb-6"
            style={{ fontFamily: "var(--font-display)", color: "var(--dark-50)" }}
          >
            We&apos;re Building the Future of{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Productivity
            </span>
          </h1>
          <p className="text-xl" style={{ color: "var(--dark-400)" }}>
            Wakey is part of the JARVIS Project – our mission to create AI tools
            that enhance human productivity without compromising privacy.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { value: "77", label: "Features", icon: Rocket },
            { value: "10K+", label: "Users", icon: Users },
            { value: "1M+", label: "Focus Sessions", icon: Target },
            { value: "100%", label: "Local & Private", icon: Heart },
          ].map((stat) => (
            <div key={stat.label} className="glass p-6 text-center">
              <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: "#14b8a6" }} />
              <p className="text-3xl font-bold" style={{ color: "var(--dark-50)" }}>
                {stat.value}
              </p>
              <p style={{ color: "var(--dark-400)" }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Mission */}
        <motion.div
          className="glass p-12 text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--dark-50)" }}
          >
            Our Mission
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "var(--dark-300)" }}>
            We believe productivity tools should work for you, not against you.
            That&apos;s why Wakey runs 100% locally on your device – your data never
            leaves your computer. No cloud processing, no data mining, no
            compromises.
          </p>
        </motion.div>

        {/* Robot Mascot */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-8xl mb-4">🤖</div>
          <p className="text-lg" style={{ color: "var(--dark-400)" }}>
            Meet our mascot – your friendly productivity companion!
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--dark-600)" }}>
            Part of the JARVIS Project 🤖
          </p>
        </motion.div>
      </div>
    </div>
  );
}
