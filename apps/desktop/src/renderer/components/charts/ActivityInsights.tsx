import { useMemo } from 'react';
import { Clock, Sun, Moon, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface HeatmapDataPoint {
    day: string;
    hour: number;
    value: number;
}

interface ActivityInsightsProps {
    data: HeatmapDataPoint[];
    previousDayData?: HeatmapDataPoint[];
}

export default function ActivityInsights({ data, previousDayData }: ActivityInsightsProps) {
    const insights = useMemo(() => {
        if (!data || data.length === 0) {
            return null;
        }

        // Find peak hour (most activity)
        const peakHour = data.reduce((max, item) =>
            item.value > max.value ? item : max,
            { day: '', hour: 0, value: 0 }
        );

        // Find least active hour (excluding zeros)
        const activeHours = data.filter(d => d.value > 0);
        const leastActiveHour = activeHours.length > 0
            ? activeHours.reduce((min, item) =>
                item.value < min.value ? item : min,
                activeHours[0]
            )
            : null;

        // Calculate productivity by time of day
        const morningHours = data.filter(d => d.hour >= 6 && d.hour < 12);
        const afternoonHours = data.filter(d => d.hour >= 12 && d.hour < 18);
        const eveningHours = data.filter(d => d.hour >= 18 && d.hour < 24);
        const nightHours = data.filter(d => d.hour >= 0 && d.hour < 6);

        const sumValues = (arr: HeatmapDataPoint[]) => arr.reduce((sum, d) => sum + d.value, 0);

        const morningTotal = sumValues(morningHours);
        const afternoonTotal = sumValues(afternoonHours);
        const eveningTotal = sumValues(eveningHours);
        const nightTotal = sumValues(nightHours);

        const allTotals = [
            { name: 'Morning', total: morningTotal, icon: Sun, hours: '6a-12p' },
            { name: 'Afternoon', total: afternoonTotal, icon: Sun, hours: '12p-6p' },
            { name: 'Evening', total: eveningTotal, icon: Moon, hours: '6p-12a' },
            { name: 'Night', total: nightTotal, icon: Moon, hours: '12a-6a' },
        ];

        const mostProductivePeriod = allTotals.reduce((max, p) =>
            p.total > max.total ? p : max,
            allTotals[0]
        );

        // Calculate daily averages
        const days = [...new Set(data.map(d => d.day))];
        const dailyTotals = days.map(day => ({
            day,
            total: data.filter(d => d.day === day).reduce((sum, d) => sum + d.value, 0)
        }));
        const avgDaily = dailyTotals.length > 0
            ? Math.round(dailyTotals.reduce((sum, d) => sum + d.total, 0) / dailyTotals.length)
            : 0;

        // Find most active day
        const mostActiveDay = dailyTotals.reduce((max, d) =>
            d.total > max.total ? d : max,
            dailyTotals[0]
        );

        // Find least active day
        const leastActiveDay = dailyTotals.filter(d => d.total > 0).reduce((min, d) =>
            d.total < min.total ? d : min,
            dailyTotals[0]
        );

        return {
            peakHour,
            leastActiveHour,
            mostProductivePeriod,
            avgDaily,
            mostActiveDay,
            leastActiveDay,
            morningTotal,
            afternoonTotal,
            eveningTotal,
            nightTotal,
        };
    }, [data]);

    // Previous day analysis
    const previousDayInsights = useMemo(() => {
        if (!previousDayData || previousDayData.length === 0) return null;

        const peak = previousDayData.reduce((max, d) => d.value > max.value ? d : max, previousDayData[0]);
        const active = previousDayData.filter(d => d.value > 0);
        const least = active.length > 0
            ? active.reduce((min, d) => d.value < min.value ? d : min, active[0])
            : null;
        const total = previousDayData.reduce((sum, d) => sum + d.value, 0);

        return { peak, least, total };
    }, [previousDayData]);

    const formatHour = (hour: number): string => {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    if (!insights) {
        // Check if there's truly no data at all (new user)
        const totalActivity = data?.reduce((sum, d) => sum + d.value, 0) || 0;

        if (totalActivity === 0) {
            return (
                <div className="mt-4 p-4 bg-gradient-to-r from-primary-500/10 to-cyan-500/10 rounded-lg border border-primary-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-primary-500/20 rounded-lg">
                            <Clock className="w-4 h-4 text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-white">Welcome to Activity Insights!</span>
                    </div>
                    <p className="text-xs text-dark-400 leading-relaxed">
                        Start using your computer and we'll track your activity patterns here.
                        You'll see your peak hours, productivity breakdown, and more as data comes in.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-primary-400">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                        <span>Tracking is active</span>
                    </div>
                </div>
            );
        }

        return null;
    }

    return (
        <div className="mt-4 space-y-3">
            {/* Peak & Least Active Hours */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-900/50 rounded-lg p-3 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-xs text-dark-400">Peak Activity</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                        {formatHour(insights.peakHour.hour)}
                    </div>
                    <div className="text-xs text-dark-500">
                        {insights.peakHour.day} • {formatDuration(insights.peakHour.value)}
                    </div>
                </div>

                <div className="bg-dark-900/50 rounded-lg p-3 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-orange-500/20 rounded-lg">
                            <TrendingDown className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="text-xs text-dark-400">Least Active</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                        {insights.leastActiveHour ? formatHour(insights.leastActiveHour.hour) : 'N/A'}
                    </div>
                    <div className="text-xs text-dark-500">
                        {insights.leastActiveHour
                            ? `${insights.leastActiveHour.day} • ${formatDuration(insights.leastActiveHour.value)}`
                            : 'No data'}
                    </div>
                </div>
            </div>

            {/* Time of Day Distribution */}
            <div className="bg-dark-900/50 rounded-lg p-3 border border-dark-700">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary-400" />
                    <span className="text-xs text-dark-400">Activity by Time of Day</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { name: 'Morning', value: insights.morningTotal, time: '6a-12p', icon: Sun, color: 'text-yellow-400' },
                        { name: 'Afternoon', value: insights.afternoonTotal, time: '12p-6p', icon: Sun, color: 'text-orange-400' },
                        { name: 'Evening', value: insights.eveningTotal, time: '6p-12a', icon: Moon, color: 'text-purple-400' },
                        { name: 'Night', value: insights.nightTotal, time: '12a-6a', icon: Moon, color: 'text-blue-400' },
                    ].map((period) => {
                        const Icon = period.icon;
                        const isHighest = period.name === insights.mostProductivePeriod.name;
                        return (
                            <div
                                key={period.name}
                                className={`text-center p-2 rounded-lg ${isHighest ? 'bg-primary-500/10 ring-1 ring-primary-500/30' : ''}`}
                            >
                                <Icon className={`w-4 h-4 mx-auto mb-1 ${period.color}`} />
                                <div className="text-xs text-dark-400">{period.name}</div>
                                <div className="text-sm font-semibold text-white">{formatDuration(period.value)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Previous Day Comparison */}
            {previousDayInsights && (
                <div className="bg-gradient-to-r from-primary-500/10 to-cyan-500/10 rounded-lg p-3 border border-primary-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-primary-400" />
                        <span className="text-xs text-primary-300">Yesterday's Highlights</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-xs text-dark-400">Peak Hour</div>
                            <div className="text-sm font-semibold text-white">
                                {formatHour(previousDayInsights.peak.hour)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-dark-400">Least Active</div>
                            <div className="text-sm font-semibold text-white">
                                {previousDayInsights.least ? formatHour(previousDayInsights.least.hour) : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-dark-400">Total Time</div>
                            <div className="text-sm font-semibold text-white">
                                {formatDuration(previousDayInsights.total)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Stats Row */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-dark-700">
                <div className="flex items-center gap-1.5">
                    <span className="text-dark-400">Best Day:</span>
                    <span className="text-white font-medium">{insights.mostActiveDay?.day}</span>
                    <span className="text-dark-500">({formatDuration(insights.mostActiveDay?.total || 0)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-dark-400">Daily Avg:</span>
                    <span className="text-primary-400 font-medium">{formatDuration(insights.avgDaily)}</span>
                </div>
            </div>
        </div>
    );
}
