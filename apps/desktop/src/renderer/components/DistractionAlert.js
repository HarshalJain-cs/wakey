import { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, Shield } from 'lucide-react';
export default function DistractionAlert({ app, title, onDismiss, onBlock }) {
    const [countdown, setCountdown] = useState(5);
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);
    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };
    if (!isVisible)
        return null;
    return (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-scaleIn">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/20 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-400"/>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            Distraction Detected!
                        </h3>
                        <p className="text-dark-300 text-sm mb-3">
                            You're in a focus session and switched to:
                        </p>

                        <div className="bg-dark-900 rounded-lg p-3 mb-4">
                            <div className="font-medium text-white">{app}</div>
                            <div className="text-sm text-dark-400 truncate">{title}</div>
                        </div>

                        <p className="text-dark-400 text-sm mb-4">
                            This app is on your distraction list. Stay focused on your goal!
                        </p>

                        <div className="flex gap-3">
                            <button onClick={handleDismiss} disabled={countdown > 0} className="flex-1 py-2 px-4 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {countdown > 0 ? (<>
                                        <Clock className="w-4 h-4"/>
                                        Wait {countdown}s
                                    </>) : ('Continue Anyway')}
                            </button>

                            <button onClick={onBlock} className="flex-1 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4"/>
                                Back to Work
                            </button>
                        </div>
                    </div>

                    <button onClick={handleDismiss} className="p-1 text-dark-400 hover:text-white transition-colors">
                        <X className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>);
}
// Hook to use distraction alerts
export function useDistractionAlert() {
    const [alert, setAlert] = useState(null);
    useEffect(() => {
        window.wakey.onDistractionDetected((data) => {
            setAlert(data);
        });
        return () => {
            window.wakey.removeAllListeners('distraction-detected');
        };
    }, []);
    const dismiss = () => setAlert(null);
    const block = () => {
        // Could implement actual blocking here
        setAlert(null);
    };
    return { alert, dismiss, block };
}
//# sourceMappingURL=DistractionAlert.js.map