import { useState, useEffect } from 'react';
import { AlertTriangle, X, HelpCircle, ThumbsUp, CheckCircle, XCircle, Settings, Shield } from 'lucide-react';
import { audioService } from '../services/audio-service';

interface DistractionAlertProps {
    app: string;
    title: string;
    onDismiss: () => void;
    onNotDistraction: () => void;
    onEndSession: () => void;
    onDisableBlocker: () => void;
    onOpenSettings: () => void;
}

export default function DistractionAlert({
    app,
    title,
    onDismiss,
    onNotDistraction,
    onEndSession,
    onDisableBlocker,
    onOpenSettings
}: DistractionAlertProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [showWhyTooltip, setShowWhyTooltip] = useState(false);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    const handleNotDistraction = () => {
        setIsVisible(false);
        setTimeout(onNotDistraction, 300);
    };

    const handleEndSession = () => {
        setIsVisible(false);
        setTimeout(onEndSession, 300);
    };

    const handleDisableBlocker = () => {
        setIsVisible(false);
        setTimeout(onDisableBlocker, 300);
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            {/* Popup Card */}
            <div
                className="relative w-full max-w-md mx-4 animate-scaleIn"
                style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500/20 rounded-2xl">
                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Wakey Productivity Coach</h2>
                                <p className="text-slate-400 text-sm">Getting distracted?</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Why am I seeing this? */}
                    <div className="relative mt-4">
                        <button
                            onClick={() => setShowWhyTooltip(!showWhyTooltip)}
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-400 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Why am I seeing this?
                        </button>

                        {showWhyTooltip && (
                            <div className="absolute left-0 top-8 z-10 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-w-xs">
                                <p className="text-sm text-slate-300">
                                    <strong className="text-white">{app}</strong> is on your distraction list.
                                    You're currently tracking productivity, and this app was detected as potentially distracting.
                                </p>
                                <button
                                    onClick={() => setShowWhyTooltip(false)}
                                    className="mt-2 text-xs text-primary-400 hover:text-primary-300"
                                >
                                    Got it
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detected App Info */}
                <div className="mx-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Detected App</div>
                    <div className="font-semibold text-white truncate">{app}</div>
                    {title && <div className="text-sm text-slate-400 truncate mt-1">{title}</div>}
                </div>

                {/* Action Buttons */}
                <div className="p-6 space-y-3">
                    {/* Primary actions */}
                    <button
                        onClick={handleDismiss}
                        className="w-full flex items-center gap-3 p-4 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 rounded-2xl transition-all group"
                    >
                        <div className="p-2 bg-teal-500/30 rounded-xl group-hover:bg-teal-500/40 transition-colors">
                            <ThumbsUp className="w-5 h-5 text-teal-400" />
                        </div>
                        <span className="text-teal-300 font-medium">Thanks for the reminder!</span>
                    </button>

                    <button
                        onClick={handleNotDistraction}
                        className="w-full flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-2xl transition-all group"
                    >
                        <div className="p-2 bg-slate-700/50 rounded-xl group-hover:bg-slate-600/50 transition-colors">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-slate-300 font-medium">This is not a distraction.</span>
                    </button>

                    {/* Secondary actions */}
                    <div className="pt-2 border-t border-slate-700/50">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleEndSession}
                                className="flex items-center justify-center gap-2 p-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                                End session now
                            </button>
                            <button
                                onClick={handleDisableBlocker}
                                className="flex items-center justify-center gap-2 p-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                Disable blocker
                            </button>
                        </div>
                        <button
                            onClick={onOpenSettings}
                            className="w-full flex items-center justify-center gap-2 p-3 mt-2 text-sm text-slate-500 hover:text-primary-400 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Update blocker settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook to use distraction alerts
export function useDistractionAlert() {
    const [alert, setAlert] = useState<{ app: string; title: string } | null>(null);

    useEffect(() => {
        if (!window.wakey) return;

        window.wakey.onDistractionDetected((data) => {
            setAlert(data);
            // Play distraction alert sound
            audioService.playEffect('distraction-alert');
        });

        return () => {
            window.wakey?.removeAllListeners('distraction-detected');
        };
    }, []);

    const dismiss = () => setAlert(null);

    const notDistraction = async () => {
        if (alert && window.wakey) {
            // Add to whitelist
            const settings = await window.wakey.getSettings();
            const whitelist = (settings.appWhitelist as string[]) || [];
            if (!whitelist.includes(alert.app)) {
                whitelist.push(alert.app);
                await window.wakey.setSetting('appWhitelist', whitelist);
            }
        }
        setAlert(null);
    };

    const endSession = () => {
        // Stop tracking to end the session
        window.wakey?.setTrackingStatus(false);
        setAlert(null);
    };

    const disableBlocker = async () => {
        if (window.wakey) {
            await window.wakey.setSetting('blockerDisabledUntil', Date.now() + 30 * 60 * 1000); // 30 min
        }
        setAlert(null);
    };

    return { alert, dismiss, notDistraction, endSession, disableBlocker };
}
