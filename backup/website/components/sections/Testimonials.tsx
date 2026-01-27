"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useSound } from "@/components/providers/SoundProvider";

const testimonials = [
    {
        name: "Alex Chen",
        role: "Startup Founder",
        quote: "Wakey helped me reclaim 3 hours every day. The AI insights are scary accurate.",
        rating: 5,
    },
    {
        name: "Priya Sharma",
        role: "Software Developer",
        quote: "Finally, a productivity app that respects my privacy. 100% local = 100% peace of mind.",
        rating: 5,
    },
    {
        name: "Marcus Johnson",
        role: "Remote Worker",
        quote: "The focus timer with lofi beats is *chef's kiss*. My deep work sessions doubled.",
        rating: 5,
    },
    {
        name: "Sarah Williams",
        role: "Content Creator",
        quote: "77 features and I use at least 30 daily. Best investment for my workflow.",
        rating: 5,
    },
    {
        name: "David Kim",
        role: "Project Manager",
        quote: "JARVIS is like having a personal assistant. It just gets what I need.",
        rating: 5,
    },
    {
        name: "Emma Torres",
        role: "CS Student",
        quote: "Went from C's to A's after tracking my study habits. Data doesn't lie!",
        rating: 5,
    },
];

export default function Testimonials() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { play } = useSound();

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            play("whoosh");
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="py-24 relative overflow-hidden" id="testimonials">
            <div className="container mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm mb-4">
                        <Users className="w-4 h-4" style={{ color: "#14b8a6" }} />
                        <span style={{ color: "var(--dark-300)" }}>10,000+ productive users</span>
                    </div>
                    <h2
                        className="text-4xl lg:text-5xl font-bold mb-4"
                        style={{ fontFamily: "var(--font-display)", color: "var(--dark-50)" }}
                    >
                        Loved by Productive Humans
                    </h2>
                </motion.div>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 glass rounded-full flex items-center justify-center transition-colors"
                        style={{ color: "var(--dark-300)" }}
                        data-cursor-hover
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 glass rounded-full flex items-center justify-center transition-colors"
                        style={{ color: "var(--dark-300)" }}
                        data-cursor-hover
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Cards */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                    >
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex-shrink-0 w-[350px] glass p-6 snap-center"
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star
                                            key={j}
                                            className="w-4 h-4"
                                            style={{ color: "#facc15", fill: "#facc15" }}
                                        />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--dark-200)" }}>
                                    &ldquo;{t.quote}&rdquo;
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                        style={{
                                            background: "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)",
                                        }}
                                    >
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold" style={{ color: "var(--dark-100)" }}>
                                            {t.name}
                                        </p>
                                        <p className="text-sm" style={{ color: "var(--dark-500)" }}>
                                            {t.role}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
