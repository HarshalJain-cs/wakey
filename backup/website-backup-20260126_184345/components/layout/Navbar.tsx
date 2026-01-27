"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Volume2, VolumeX, Sun, Moon, Download } from "lucide-react";
import { useSound } from "@/components/providers/SoundProvider";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/docs", label: "Docs" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const { enabled, toggle, play } = useSound();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = () => {
        play("whoosh");
        setMobileOpen(false);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        play("toggle");
        document.documentElement.setAttribute("data-theme", darkMode ? "light" : "dark");
    };

    return (
        <>
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 px-6 flex items-center justify-between transition-all duration-500 ${scrolled
                        ? "h-16 glass"
                        : "h-20 bg-transparent"
                    }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2"
                    data-cursor-hover
                    onClick={() => play("click")}
                >
                    <span
                        className="text-2xl font-bold"
                        style={{
                            fontFamily: "var(--font-display)",
                            background: "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        WAKEY
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative group"
                            style={{ color: "var(--dark-300)" }}
                            onClick={handleLinkClick}
                            data-cursor-hover
                        >
                            <span className="transition-colors group-hover:text-[#2dd4bf]">{link.label}</span>
                            <span
                                className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                                style={{ backgroundColor: "#14b8a6" }}
                            />
                        </Link>
                    ))}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/* Sound Toggle */}
                    <button
                        onClick={() => {
                            toggle();
                            play("click");
                        }}
                        className="p-2 transition-colors"
                        style={{ color: "var(--dark-400)" }}
                        data-cursor-hover
                        aria-label="Toggle sound"
                    >
                        {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 transition-colors"
                        style={{ color: "var(--dark-400)" }}
                        data-cursor-hover
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* CTA */}
                    <Link
                        href="/pricing"
                        className="hidden md:flex btn-primary"
                        onClick={handleLinkClick}
                        data-cursor-hover
                    >
                        <Download size={18} />
                        Download Free
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        style={{ color: "var(--dark-300)" }}
                        onClick={() => setMobileOpen(!mobileOpen)}
                        data-cursor-hover
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 md:hidden"
                        style={{ background: "rgba(2, 6, 23, 0.95)", backdropFilter: "blur(20px)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <nav className="flex flex-col items-center justify-center h-full gap-8">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        className="text-3xl transition-colors"
                                        style={{ fontFamily: "var(--font-display)", color: "var(--dark-100)" }}
                                        onClick={handleLinkClick}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Link href="/pricing" className="btn-primary text-xl" onClick={handleLinkClick}>
                                    <Download size={20} />
                                    Download Free
                                </Link>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
