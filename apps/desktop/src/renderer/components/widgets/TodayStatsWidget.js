import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
function StatCard({ icon, label, value, change, positive }) {
    return (<div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg">
            <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                {icon}
            </div>
            <div className="flex-1">
                <div className="text-xs text-dark-400">{label}</div>
                <div className="text-lg font-semibold text-white">{value}</div>
            </div>
            {change && (<span className={`text-xs font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
                    {change}
                </span>)}
        </div>);
}
export default function TodayStatsWidget() {
    const [stats, setStats] = useState({
        focusTime: 0,
        sessions: 0,
        distractions: 0,
        topApps: [],
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await window.wakey.getTodayStats();
                setStats(data);
            }
            catch (error) {
                console.error('Failed to load stats:', error);
            }
            finally {
                setLoading(false);
            }
        };
        loadStats();
        // Refresh stats every minute
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);
    const formatTime = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0)
            return `${m}m`;
        return `${h}h ${m}m`;
    };
    return (<div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title">📊 Today's Stats</span>
                <span className="text-xs text-dark-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
            </div>

            {loading ? (<div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"/>
                </div>) : (<div className="space-y-3">
                    <StatCard icon={<Clock className="w-4 h-4"/>} label="Focus Time" value={formatTime(stats.focusTime)}/>

                    <StatCard icon={<CheckCircle className="w-4 h-4"/>} label="Sessions" value={String(stats.sessions)}/>

                    <StatCard icon={<AlertTriangle className="w-4 h-4"/>} label="Distractions" value={String(stats.distractions)}/>

                    {stats.topApps.length > 0 && (<div className="pt-2 border-t border-dark-700">
                            <div className="text-xs text-dark-400 mb-2">Top Apps</div>
                            {stats.topApps.slice(0, 3).map((app, i) => (<div key={i} className="flex justify-between text-sm py-1">
                                    <span className="text-dark-300 truncate">{app.app}</span>
                                    <span className="text-dark-400">{app.minutes}m</span>
                                </div>))}
                        </div>)}
                </div>)}
        </div>);
}
//# sourceMappingURL=TodayStatsWidget.js.map