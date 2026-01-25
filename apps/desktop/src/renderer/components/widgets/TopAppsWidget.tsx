import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import { CHART_COLORS } from '../../constants/chart-colors';

interface AppData {
    name: string;
    minutes: number;
    isDistraction: boolean;
}

export default function TopAppsWidget() {
    const [apps, setApps] = useState<AppData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        if (!window.wakey?.getTopApps) {
            setLoading(false);
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await window.wakey.getTopApps(5, today, today);
            setApps(data);
        } catch (error) {
            console.error('Failed to load top apps:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const maxMinutes = apps.length > 0 ? apps[0].minutes : 1;

    return (
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Monitor className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Top Apps</h3>
                    <p className="text-xs text-dark-400">Today's usage</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                </div>
            ) : apps.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-dark-500 text-sm">
                    No activity yet
                </div>
            ) : (
                <div className="space-y-2">
                    {apps.map((app, index) => (
                        <div key={app.name} className="flex items-center gap-2">
                            <span className="text-xs text-dark-500 w-4">{index + 1}</span>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-white truncate max-w-[120px]" title={app.name}>
                                        {app.name}
                                    </span>
                                    <span className="text-xs text-dark-400">{formatTime(app.minutes)}</span>
                                </div>
                                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(app.minutes / maxMinutes) * 100}%`,
                                            backgroundColor: app.isDistraction
                                                ? CHART_COLORS.distracting
                                                : CHART_COLORS.primary,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
