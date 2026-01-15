import { useState, useEffect } from 'react';
import { Clock, Sun, Sunset, Moon, TrendingUp, Target } from 'lucide-react';
import { timeOfDayService, HourlyStats } from '../services/time-of-day-service';

interface TimeOfDayWidgetProps {
    className?: string;
}

export default function TimeOfDayWidget({ className = '' }: TimeOfDayWidgetProps) {
    const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([]);
    const [profile, setProfile] = useState<ReturnType<typeof timeOfDayService.getProfile> | null>(null);

    useEffect(() => {
        // Generate sample data if needed
        const stats = timeOfDayService.getAllHourlyStats();
        if (stats.every(s => s.sampleCount === 0)) {
            timeOfDayService.generateSampleData();
        }

        setHourlyStats(timeOfDayService.getAllHourlyStats());
        setProfile(timeOfDayService.getProfile());
    }, []);

    const maxScore = Math.max(...hourlyStats.filter(h => h.sampleCount > 0).map(h => h.avgFocusScore), 100);

    const getPeriodIcon = (period: string) => {
        switch (period) {
            case 'morning': return <Sun className="w-4 h-4 text-amber-400" />;
            case 'afternoon': return <Sunset className="w-4 h-4 text-orange-400" />;
            case 'evening': return <Moon className="w-4 h-4 text-purple-400" />;
            default: return <Clock className="w-4 h-4 text-dark-400" />;
        }
    };

    return (
        <div className={`bg-dark-800 rounded-xl border border-dark-700 p-5 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-400" />
                    Productivity by Time of Day
                </h3>
            </div>

            {/* Period Scores */}
            {profile && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                        <Sun className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{profile.morningScore}</div>
                        <div className="text-xs text-dark-400">Morning</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                        <Sunset className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{profile.afternoonScore}</div>
                        <div className="text-xs text-dark-400">Afternoon</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                        <Moon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{profile.eveningScore}</div>
                        <div className="text-xs text-dark-400">Evening</div>
                    </div>
                </div>
            )}

            {/* Hourly Chart */}
            <div className="mb-4">
                <div className="flex items-end gap-0.5 h-20">
                    {hourlyStats.slice(6, 23).map((hour) => {
                        const height = hour.sampleCount > 0
                            ? (hour.avgFocusScore / maxScore) * 100
                            : 5;
                        const isPeak = profile?.peakHours.includes(hour.hour);

                        return (
                            <div
                                key={hour.hour}
                                className="flex-1 flex flex-col items-center group cursor-pointer"
                            >
                                <div className="w-full relative" style={{ height: '60px' }}>
                                    <div
                                        className={`absolute bottom-0 w-full rounded-t transition-all ${isPeak
                                                ? 'bg-gradient-to-t from-primary-600 to-primary-400'
                                                : 'bg-dark-600 group-hover:bg-dark-500'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    />

                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-dark-700 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {Math.round(hour.avgFocusScore)} score
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-xs text-dark-500 mt-1">
                    <span>6AM</span>
                    <span>12PM</span>
                    <span>6PM</span>
                    <span>11PM</span>
                </div>
            </div>

            {/* Peak Hours */}
            {profile && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-dark-400">Peak hours:</span>
                        <div className="flex gap-1">
                            {profile.peakHours.map(h => (
                                <span key={h} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                    {timeOfDayService.formatHour(h)}
                                </span>
                            ))}
                        </div>
                    </div>

                    {profile.recommendation && (
                        <p className="text-sm text-dark-300 bg-dark-700/50 rounded-lg p-3">
                            {profile.recommendation}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
