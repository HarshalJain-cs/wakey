import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatedLineChart } from '../charts';
import { CHART_COLORS } from '../../constants/chart-colors';

interface DayData {
    name: string;
    value: number;
}

export default function WeekTrendWidget() {
    const [weekData, setWeekData] = useState<DayData[]>([]);
    const [trend, setTrend] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!window.wakey) {
            setLoading(false);
            return;
        }

        try {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 6);

            const startStr = weekAgo.toISOString().split('T')[0];
            const endStr = today.toISOString().split('T')[0];

            const rangeStats = await window.wakey.getStatsRange(startStr, endStr);

            // Build complete week data
            const days: DayData[] = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const realData = rangeStats.find((s: { date: string }) => s.date === dateStr);

                days.push({
                    name: dayName,
                    value: realData?.focusMinutes || 0,
                });
            }

            setWeekData(days);

            // Calculate trend (compare last 3 days vs first 4 days)
            const firstHalf = days.slice(0, 4).reduce((sum, d) => sum + d.value, 0) / 4;
            const secondHalf = days.slice(4).reduce((sum, d) => sum + d.value, 0) / 3;

            if (firstHalf > 0) {
                setTrend(Math.round(((secondHalf - firstHalf) / firstHalf) * 100));
            }
        } catch (error) {
            console.error('Failed to load week trend:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalWeek = weekData.reduce((sum, d) => sum + d.value, 0);
    const avgDaily = weekData.length > 0 ? Math.round(totalWeek / weekData.length) : 0;

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    return (
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 h-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${trend >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {trend >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Week Trend</h3>
                        <p className="text-xs text-dark-400">7-day focus</p>
                    </div>
                </div>
                <div className={`text-sm font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? '+' : ''}{trend}%
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                </div>
            ) : (
                <>
                    <div className="h-24">
                        <AnimatedLineChart
                            data={weekData}
                            height={96}
                            lineColor={CHART_COLORS.primary}
                            showGrid={false}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                        <div>
                            <span className="text-dark-400">Total: </span>
                            <span className="text-white font-medium">{formatTime(totalWeek)}</span>
                        </div>
                        <div>
                            <span className="text-dark-400">Avg: </span>
                            <span className="text-white font-medium">{formatTime(avgDaily)}/day</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
