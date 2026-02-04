/**
 * Version Info Component
 * Display app version, changelog, and update status
 */

import { useState } from 'react';
import {
    Info,
    Download,
    CheckCircle,
    RefreshCw,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Clock,
    Bug
} from 'lucide-react';

interface Version {
    version: string;
    releaseDate: string;
    type: 'major' | 'minor' | 'patch';
    highlights: string[];
    fullChangelog: { type: 'feature' | 'fix' | 'improvement'; text: string }[];
}

const CURRENT_VERSION: Version = {
    version: '2.4.0',
    releaseDate: '2024-02-01',
    type: 'minor',
    highlights: [
        'Visual Workflow Builder',
        'Team Collaboration Features',
        'Enhanced Flow State Detection',
    ],
    fullChangelog: [
        { type: 'feature', text: 'Added visual workflow builder with drag-and-drop nodes' },
        { type: 'feature', text: 'Team workspaces with member management' },
        { type: 'feature', text: 'API documentation and key management page' },
        { type: 'feature', text: 'Flow state indicator with real-time detection' },
        { type: 'improvement', text: 'Enhanced productivity digest with AI insights' },
        { type: 'improvement', text: 'Sidebar navigation now includes Workflows, Team, API Docs' },
        { type: 'fix', text: 'Fixed sync status indicator positioning' },
        { type: 'fix', text: 'Resolved offline mode detection issues' },
    ],
};

export default function VersionInfo() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<'none' | 'available' | 'downloading' | 'ready'>('none');
    const [downloadProgress, setDownloadProgress] = useState(0);

    const checkForUpdates = async () => {
        setIsCheckingUpdate(true);
        // Simulate update check
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsCheckingUpdate(false);
        // Randomly show update available for demo
        setUpdateStatus(Math.random() > 0.5 ? 'available' : 'none');
    };

    const downloadUpdate = async () => {
        setUpdateStatus('downloading');
        // Simulate download progress
        for (let i = 0; i <= 100; i += 10) {
            setDownloadProgress(i);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        setUpdateStatus('ready');
    };

    const getTypeIcon = (type: 'feature' | 'fix' | 'improvement') => {
        switch (type) {
            case 'feature':
                return <Sparkles className="w-4 h-4 text-purple-400" />;
            case 'fix':
                return <Bug className="w-4 h-4 text-red-400" />;
            case 'improvement':
                return <RefreshCw className="w-4 h-4 text-blue-400" />;
        }
    };

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-dark-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500">
                            <Info className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                Wakey
                                <span className="px-2 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
                                    v{CURRENT_VERSION.version}
                                </span>
                            </h3>
                            <p className="text-xs text-dark-400">
                                Released {CURRENT_VERSION.releaseDate}
                            </p>
                        </div>
                    </div>

                    {/* Update Status */}
                    {updateStatus === 'none' && (
                        <button
                            onClick={checkForUpdates}
                            disabled={isCheckingUpdate}
                            className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-600 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                            {isCheckingUpdate ? 'Checking...' : 'Check Updates'}
                        </button>
                    )}
                    {updateStatus === 'available' && (
                        <button
                            onClick={downloadUpdate}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 rounded-lg text-sm text-white hover:bg-primary-600 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Update Available
                        </button>
                    )}
                    {updateStatus === 'downloading' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-lg">
                            <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 transition-all"
                                    style={{ width: `${downloadProgress}%` }}
                                />
                            </div>
                            <span className="text-xs text-dark-400">{downloadProgress}%</span>
                        </div>
                    )}
                    {updateStatus === 'ready' && (
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-500 rounded-lg text-sm text-white hover:bg-green-600 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                            Restart to Update
                        </button>
                    )}
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                    {CURRENT_VERSION.highlights.map((highlight, i) => (
                        <span
                            key={i}
                            className="px-2.5 py-1 bg-dark-700 rounded-lg text-xs text-dark-300"
                        >
                            ✨ {highlight}
                        </span>
                    ))}
                </div>
            </div>

            {/* Toggle Changelog */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 flex items-center justify-between text-dark-400 hover:text-white hover:bg-dark-700/50 transition-colors"
            >
                <span className="text-sm">View Full Changelog</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Changelog */}
            {isExpanded && (
                <div className="p-4 border-t border-dark-700 space-y-2 max-h-64 overflow-y-auto">
                    {CURRENT_VERSION.fullChangelog.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                            {getTypeIcon(item.type)}
                            <span className="text-dark-300">{item.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
