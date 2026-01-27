"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Book, Video, HelpCircle, Keyboard } from "lucide-react";

const sections = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: Book,
        content: `
## Installation

1. Download Wakey from the [Pricing](/pricing) page
2. Run the installer (Windows .exe)
3. Launch Wakey from your Start menu
4. Complete the quick onboarding

## First Steps

- **Start a Focus Session**: Click the timer icon or press \`Ctrl+Shift+F\`
- **View Dashboard**: See your productivity stats at a glance
- **Enable Tracking**: Toggle activity tracking in Settings

## System Requirements

- Windows 10 or later
- 4GB RAM minimum
- 500MB available disk space
    `,
    },
    {
        id: "tutorials",
        title: "Video Tutorials",
        icon: Video,
        content: `
## Coming Soon! 🎬

We're working on a comprehensive video tutorial series covering:

- **Quick Start Guide** (5 min)
- **Focus Timer Deep Dive** (10 min)
- **AI Insights Explained** (8 min)
- **JARVIS Assistant Tutorial** (12 min)
- **Advanced Features** (15 min)

Subscribe to our [newsletter](/blog) to be notified when they launch!
    `,
    },
    {
        id: "faq",
        title: "FAQ",
        icon: HelpCircle,
        content: `
## Frequently Asked Questions

**Is my data stored in the cloud?**
No! Wakey runs 100% locally on your device. Your data never leaves your computer.

**Can I use Wakey offline?**
Yes! All features work offline. Cloud sync is optional.

**How does the AI work locally?**
We use Ollama for local AI processing. Your data stays private.

**Is there a mobile app?**
Not yet, but it's on our roadmap for 2026.

**Can I export my data?**
Yes! Export to JSON or CSV from Settings > Data > Export.
    `,
    },
    {
        id: "shortcuts",
        title: "Keyboard Shortcuts",
        icon: Keyboard,
        content: `
## Global Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+Shift+F\` | Start/Stop Focus Session |
| \`Ctrl+Shift+T\` | Toggle Tracking |
| \`Ctrl+Shift+D\` | Open Dashboard |
| \`Ctrl+Shift+S\` | Open Settings |
| \`Ctrl+Shift+Q\` | Quick Note |

## In-App Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Space\` | Pause/Resume Timer |
| \`Esc\` | Close Modal |
| \`Tab\` | Navigate Widgets |
    `,
    },
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("getting-started");

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
                        Documentation
                    </h1>
                    <p style={{ color: "var(--dark-400)" }}>
                        Everything you need to get the most out of Wakey.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <motion.aside
                        className="lg:w-64 flex-shrink-0"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <nav className="glass p-4 sticky top-24 space-y-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeSection === section.id ? "border" : ""
                                        }`}
                                    style={{
                                        backgroundColor:
                                            activeSection === section.id ? "rgba(20, 184, 166, 0.1)" : "transparent",
                                        borderColor: activeSection === section.id ? "#14b8a6" : "transparent",
                                        color: activeSection === section.id ? "#14b8a6" : "var(--dark-300)",
                                    }}
                                >
                                    <section.icon size={18} />
                                    {section.title}
                                </button>
                            ))}
                        </nav>
                    </motion.aside>

                    {/* Content */}
                    <motion.main
                        className="flex-1 glass p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {sections.map(
                            (section) =>
                                activeSection === section.id && (
                                    <div key={section.id}>
                                        <h2
                                            className="text-3xl font-bold mb-6 flex items-center gap-3"
                                            style={{ color: "var(--dark-50)" }}
                                        >
                                            <section.icon style={{ color: "#14b8a6" }} />
                                            {section.title}
                                        </h2>
                                        <div
                                            className="prose prose-invert max-w-none"
                                            style={{ color: "var(--dark-300)" }}
                                            dangerouslySetInnerHTML={{
                                                __html: section.content
                                                    .replace(/^## (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-4" style="color: var(--dark-100)">$1</h3>')
                                                    .replace(/^### (.+)$/gm, '<h4 class="text-lg font-semibold mt-6 mb-3" style="color: var(--dark-200)">$1</h4>')
                                                    .replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--dark-100)">$1</strong>')
                                                    .replace(/`(.+?)`/g, '<code class="px-2 py-1 rounded" style="background: var(--dark-800); color: #14b8a6">$1</code>')
                                                    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline" style="color: #14b8a6">$1</a>')
                                                    .replace(/\n\n/g, '</p><p class="mb-4">')
                                                    .replace(/\n- /g, '</p><li class="ml-4 mb-2">• ')
                                                    .replace(/\n\d\. /g, '</p><li class="ml-4 mb-2">')
                                            }}
                                        />
                                    </div>
                                )
                        )}
                    </motion.main>
                </div>
            </div>
        </div>
    );
}
