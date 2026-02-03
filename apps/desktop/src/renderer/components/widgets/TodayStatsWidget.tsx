import { Clock, CheckCircle, AlertTriangle, Zap, Battery, Activity, TrendingUp, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import { enhancedPomodoroService } from '../../services/enhanced-pomodoro-service';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
    highlight?: boolean;
}

function StatCard({ icon, label, value, change, positive, highlight }: StatCardProps) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${highlight
                ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30'
                : 'bg-dark-900/50'
            }`}>
            <div className={`p-2 rounded-lg ${highlight ? 'bg-primary-500/30 text-primary-300' : 'bg-primary-500/10 text-primary-400'}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="text-xs text-dark-400">{label}</div>
                <div className="text-lg font-semibold text-white">{value}</div>
            </div>
            {change && (
                <span className={`text-xs font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
                    {change}
                </span>
            )}
        </div>
    );
}

// Productivity Score Circle Component
function ProductivityScoreCircle({ score }: { score: number }) {
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference * (1 - score / 100);

    const getScoreColor = () => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#14b8a6'; // Teal
        if (score >= 40) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const getScoreLabel = () => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Focus';
    };

    return (
        <div className="flex items-center justify-center gap-4 p-4 bg-dark-900/50 rounded-lg">
            <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="40" cy="40" r="36"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="6"
                    />
                    <circle
                        cx="40" cy="40" r="36"
                        fill="none"
                        stroke={getScoreColor()}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{score}</span>
                </div>
            </div>
            <div className="flex-1">
                <div className="text-xs text-dark-400">Productivity Score</div>
                <div className="text-lg font-semibold" style={{ color: getScoreColor() }}>
                    {getScoreLabel()}
                </div>
                <div className="text-xs text-dark-500 mt-1">Based on focus & activity</div>
            </div>
        </div>
    );
}

// Energy/Fatigue Bar Component  
function EnergyBar({ fatigue, energyLevel }: { fatigue: number; energyLevel: 'high' | 'medium' | 'low' }) {
    const energy = 100 - fatigue;

    const getEnergyColor = () => {
        if (energy >= 70) return 'bg-green-500';
        if (energy >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getEnergyGradient = () => {
        if (energy >= 70) return 'from-green-500 to-emerald-400';
        if (energy >= 40) return 'from-yellow-500 to-amber-400';
        return 'from-red-500 to-orange-400';
    };

    const getEnergyIcon = () => {
        if (energyLevel === 'high') return <Zap className="w-4 h-4 text-green-400" />;
        if (energyLevel === 'medium') return <Battery className="w-4 h-4 text-yellow-400" />;
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
    };

    return (
        <div className="p-3 bg-dark-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {getEnergyIcon()}
                    <span className="text-sm text-dark-300">Energy Level</span>
                </div>
                <span className="text-sm font-medium text-white">{Math.round(energy)}%</span>
            </div>
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${getEnergyGradient()} transition-all duration-500`}
                    style={{ width: `${energy}%` }}
                />
            </div>
            {fatigue > 60 && (
                <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Consider taking a break soon
                </div>
            )}
        </div>
    );
}

// Streak Counter Component
function StreakCounter({ streak }: { streak: number }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
                <div className="text-xs text-dark-400">Daily Streak</div>
                <div className="text-lg font-bold text-orange-400">{streak} days</div>
            </div>
            {streak >= 7 && (
                <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                    🔥 On Fire!
                </span>
            )}
        </div>
    );
}

export default function TodayStatsWidget() {
    const [stats, setStats] = useState({
        focusTime: 0,
        sessions: 0,
        distractions: 0,
        topApps: [] as { app: string; minutes: number }[],
    });
    const [loading, setLoading] = useState(true);
    const [productivityScore, setProductivityScore] = useState(0);
    const [fatigue, setFatigue] = useState(0);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const loadStats = async () => {
            if (!window.wakey) {
                // Use mock data for preview
                setStats({
                    focusTime: 127,
                    sessions: 5,
                    distractions: 3,
                    topApps: [
                        { app: 'VS Code', minutes: 89 },
                        { app: 'Chrome', minutes: 45 },
                        { app: 'Terminal', minutes: 23 }
                    ]
                });
                setProductivityScore(78);
                setFatigue(35);
                setStreak(12);
                setLoading(false);
                return;
            }
            try {
                const data = await window.wakey.getTodayStats();
                setStats(data);

                // Calculate productivity score based on stats
                const focusScore = Math.min(data.focusTime / 4, 40); // Max 40 points for 4h+ focus
                const sessionScore = Math.min(data.sessions * 5, 30); // Max 30 points for 6+ sessions
                const distractionPenalty = Math.min(data.distractions * 5, 30); // Lose up to 30 points
                const score = Math.max(0, Math.min(100, Math.round(focusScore + sessionScore + 30 - distractionPenalty)));
                setProductivityScore(score);

                // Get fatigue from enhanced service
                const currentFatigue = await enhancedPomodoroService.calculateFatigueLevel();
                setFatigue(currentFatigue);

                // Streak would come from stored data
                setStreak(data.streak || 0);
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();

        // Refresh stats every minute
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    const getEnergyLevel = (): 'high' | 'medium' | 'low' => {
        if (fatigue < 40) return 'high';
        if (fatigue < 70) return 'medium';
        return 'low';
    };

    return (
        <div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary-400" />
                    Today's Overview
                </span>
                <span className="text-xs text-dark-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Productivity Score - Hero Section */}
                    <ProductivityScoreCircle score={productivityScore} />

                    {/* Energy Level Bar */}
                    <EnergyBar fatigue={fatigue} energyLevel={getEnergyLevel()} />

                    {/* Streak Counter */}
                    {streak > 0 && <StreakCounter streak={streak} />}

                    {/* Core Stats */}
                    <div className="grid grid-cols-2 gap-2">
                        <StatCard
                            icon={<Clock className="w-4 h-4" />}
                            label="Focus Time"
                            value={formatTime(stats.focusTime)}
                            highlight={stats.focusTime >= 120}
                        />

                        <StatCard
                            icon={<CheckCircle className="w-4 h-4" />}
                            label="Sessions"
                            value={String(stats.sessions)}
                        />
                    </div>

                    <StatCard
                        icon={<AlertTriangle className="w-4 h-4" />}
                        label="Distractions"
                        value={String(stats.distractions)}
                        change={stats.distractions <= 2 ? "Great focus!" : undefined}
                        positive={stats.distractions <= 2}
                    />

                    {stats.topApps.length > 0 && (
                        <div className="pt-2 border-t border-dark-700">
                            <div className="flex items-center gap-2 text-xs text-dark-400 mb-2">
                                <TrendingUp className="w-3 h-3" />
                                Top Apps
                            </div>
                            {stats.topApps.slice(0, 3).map((app, i) => (
                                <div key={i} className="flex justify-between text-sm py-1">
                                    <span className="text-dark-300 truncate flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary-400' : i === 1 ? 'bg-purple-400' : 'bg-blue-400'
                                            }`} />
                                        {app.app}
                                    </span>
                                    <span className="text-dark-400">{app.minutes}m</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
