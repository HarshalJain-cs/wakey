import { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy } from 'lucide-react';

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    streakDates: string[];
}

export default function StreakWidget() {
    const [streak, setStreak] = useState<StreakData>({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakDates: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStreak();
    }, []);

    const loadStreak = async () => {
        if (!window.wakey) {
            setLoading(false);
            return;
        }

        try {
            const settings = await window.wakey.getSettings();
            const dailyGoal = (settings.dailyFocusGoal as number) || 60;

            // Get stats for last 30 days
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 29);

            const startStr = thirtyDaysAgo.toISOString().split('T')[0];
            const endStr = today.toISOString().split('T')[0];

            const rangeStats = await window.wakey.getStatsRange(startStr, endStr);

            // Calculate streaks
            const goalMetDates: string[] = [];
            rangeStats.forEach((day: { date: string; focusMinutes: number }) => {
                if (day.focusMinutes >= dailyGoal) {
                    goalMetDates.push(day.date);
                }
            });

            // Calculate current streak (consecutive days up to today)
            let currentStreak = 0;
            const todayStr = today.toISOString().split('T')[0];
            let checkDate = new Date(today);

            // Check if today's goal is met
            const todayData = rangeStats.find((d: { date: string }) => d.date === todayStr);
            const todayGoalMet = todayData?.focusMinutes >= dailyGoal;

            // If today's goal not met, start from yesterday
            if (!todayGoalMet) {
                checkDate.setDate(checkDate.getDate() - 1);
            }

            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (goalMetDates.includes(dateStr)) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            // Calculate longest streak
            let longestStreak = 0;
            let tempStreak = 0;
            const sortedDates = goalMetDates.sort();

            for (let i = 0; i < sortedDates.length; i++) {
                if (i === 0) {
                    tempStreak = 1;
                } else {
                    const prevDate = new Date(sortedDates[i - 1]);
                    const currDate = new Date(sortedDates[i]);
                    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        tempStreak++;
                    } else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);

            setStreak({
                currentStreak,
                longestStreak,
                lastActiveDate: goalMetDates[goalMetDates.length - 1] || null,
                streakDates: goalMetDates.slice(-7),
            });
        } catch (error) {
            console.error('Failed to load streak:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate last 7 days for visual display
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
            date: date.toISOString().split('T')[0],
            day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            isActive: streak.streakDates.includes(date.toISOString().split('T')[0]),
        };
    });

    return (
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Focus Streak</h3>
                    <p className="text-xs text-dark-400">Daily goal progress</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
                </div>
            ) : (
                <>
                    {/* Current streak display */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Flame className={`w-8 h-8 ${streak.currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-dark-600'}`} />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{streak.currentStreak}</div>
                            <div className="text-xs text-dark-400">day{streak.currentStreak !== 1 ? 's' : ''}</div>
                        </div>
                    </div>

                    {/* Last 7 days visual */}
                    <div className="flex justify-between mb-3">
                        {last7Days.map((day, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                                        day.isActive
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-dark-700 text-dark-500'
                                    }`}
                                >
                                    {day.isActive ? '✓' : day.day}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1 text-dark-400">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            Best: <span className="text-white">{streak.longestStreak}</span>
                        </div>
                        <div className="flex items-center gap-1 text-dark-400">
                            <Calendar className="w-3 h-3" />
                            Goal: <span className="text-white">60m/day</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
