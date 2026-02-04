import { useState } from 'react';
import {
    Heart, Github, Coffee, Mail, ExternalLink,
    Sparkles, Shield, Globe, Check
} from 'lucide-react';

interface AppInfo {
    version: string;
    electronVersion: string;
    nodeVersion: string;
    chromeVersion: string;
    buildDate: string;
    platform: string;
}

export default function AboutPage() {
    const [appInfo] = useState<AppInfo>({
        version: '1.0.0',
        electronVersion: '28.0.0',
        nodeVersion: '20.10.0',
        chromeVersion: '120.0.0',
        buildDate: new Date().toISOString().split('T')[0],
        platform: navigator.platform.includes('Win') ? 'Windows' : navigator.platform.includes('Mac') ? 'macOS' : 'Linux'
    });

    const features = [
        { name: 'Focus Timer', desc: 'Pomodoro & deep work sessions' },
        { name: 'AI Insights', desc: 'Multi-model productivity coaching' },
        { name: 'Gamification', desc: 'Achievements, streaks & leaderboards' },
        { name: 'Health Tracking', desc: 'Burnout detection & wellness' },
        { name: '180+ Integrations', desc: 'Connect your favorite tools' },
        { name: 'Privacy First', desc: 'Local-first with optional sync' },
    ];

    const links = [
        { label: 'Website', url: 'https://wakey.app', icon: Globe },
        { label: 'GitHub', url: 'https://github.com/wakey-app/wakey', icon: Github },
        { label: 'Support', url: 'mailto:support@wakey.app', icon: Mail },
        { label: 'Buy us coffee', url: 'https://buymeacoffee.com/wakey', icon: Coffee },
    ];

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Logo & Title */}
            <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Wakey</h1>
                <p className="text-dark-400">AI-Powered Productivity Platform</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-full">
                    <span className="text-sm text-dark-300">Version</span>
                    <span className="text-sm text-white font-mono">{appInfo.version}</span>
                </div>
            </div>

            {/* Features */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
                <div className="grid grid-cols-2 gap-3">
                    {features.map((f, i) => (
                        <div key={i} className="p-3 bg-dark-800 rounded-xl border border-dark-700">
                            <div className="flex items-center gap-2 mb-1">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium text-white">{f.name}</span>
                            </div>
                            <p className="text-xs text-dark-400 ml-6">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Info */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">System Information</h2>
                <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <span className="text-dark-400">Platform</span>
                        <span className="text-white font-mono">{appInfo.platform}</span>

                        <span className="text-dark-400">Electron</span>
                        <span className="text-white font-mono">v{appInfo.electronVersion}</span>

                        <span className="text-dark-400">Node.js</span>
                        <span className="text-white font-mono">v{appInfo.nodeVersion}</span>

                        <span className="text-dark-400">Chromium</span>
                        <span className="text-white font-mono">v{appInfo.chromeVersion}</span>

                        <span className="text-dark-400">Build Date</span>
                        <span className="text-white font-mono">{appInfo.buildDate}</span>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">Links</h2>
                <div className="flex flex-wrap gap-2">
                    {links.map((link, i) => (
                        <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg border border-dark-700 text-dark-300 hover:text-white hover:border-dark-600 transition-colors"
                        >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm">{link.label}</span>
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                    ))}
                </div>
            </div>

            {/* License & Credits */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">License & Credits</h2>
                <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-primary-400" />
                            <span className="text-sm font-medium text-white">License</span>
                        </div>
                        <p className="text-xs text-dark-400">
                            MIT License - Copyright © 2024-2026 Wakey App
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium text-white">Made with love by</span>
                        </div>
                        <p className="text-xs text-dark-400">
                            The Wakey Team - Building tools for focused, healthy productivity
                        </p>
                    </div>
                </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="text-center">
                <p className="text-xs text-dark-500">
                    Press <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-dark-300">?</kbd> anywhere to see keyboard shortcuts
                </p>
            </div>
        </div>
    );
}
