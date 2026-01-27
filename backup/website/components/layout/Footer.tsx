import Link from "next/link";
import { Heart } from "lucide-react";

const footerLinks = {
    Product: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Download", href: "/pricing" },
        { label: "Changelog", href: "/blog" },
    ],
    Resources: [
        { label: "Documentation", href: "/docs" },
        { label: "Blog", href: "/blog" },
        { label: "Tutorials", href: "/docs#tutorials" },
        { label: "FAQ", href: "/docs#faq" },
    ],
    Company: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Discord", href: "https://discord.gg/wakey" },
        { label: "Twitter", href: "https://twitter.com/wakeyapp" },
    ],
    Legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t py-16" style={{ borderColor: "var(--dark-800)" }}>
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link
                            href="/"
                            className="text-2xl font-bold"
                            style={{
                                fontFamily: "var(--font-display)",
                                background: "linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            WAKEY
                        </Link>
                        <p className="text-sm mt-4" style={{ color: "var(--dark-500)" }}>
                            AI-powered productivity for humans who get things done.
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="font-semibold mb-4" style={{ color: "var(--dark-200)" }}>
                                {category}
                            </h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm transition-colors hover:text-[#14b8a6]"
                                            style={{ color: "var(--dark-500)" }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div
                    className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
                    style={{ borderColor: "var(--dark-800)" }}
                >
                    <p className="text-sm flex items-center gap-1" style={{ color: "var(--dark-500)" }}>
                        © 2026 Wakey • Made with{" "}
                        <Heart className="w-4 h-4" style={{ color: "#ef4444", fill: "#ef4444" }} /> for
                        productive humans
                    </p>
                    <p className="text-sm" style={{ color: "var(--dark-600)" }}>
                        Part of the JARVIS Project 🤖
                    </p>
                </div>
            </div>
        </footer>
    );
}
