'use client';

import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface DayStats {
  day: string;
  focusTime: number;
  date: string;
}

export default function FocusTrendsWidget() {
  const [weekData, setWeekData] = useState<DayStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats/weekly');
      if (!res.ok) {
        if (res.status === 404) {
          setWeekData([]);
        } else {
          throw new Error('Failed to fetch weekly trends');
        }
      } else {
        const data = await res.json();
        setWeekData(data.weeklyStats || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const maxFocusTime = Math.max(...weekData.map(d => d.focusTime), 60);

  if (loading) {
    return (
      <WidgetCard title="Weekly Focus Trends" icon={<BarChart3 className="w-5 h-5" />}>
        <div className="animate-pulse">
          <div className="flex justify-between items-end h-32 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-dark-700 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
                <div className="h-3 w-6 bg-dark-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Weekly Focus Trends" icon={<BarChart3 className="w-5 h-5" />}>
        <div className="text-center py-6">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchTrends}
            className="text-teal-400 hover:text-teal-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </WidgetCard>
    );
  }

  if (weekData.length === 0) {
    return (
      <WidgetCard title="Weekly Focus Trends" icon={<BarChart3 className="w-5 h-5" />}>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700/50 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-dark-500" />
          </div>
          <p className="text-dark-400 mb-2">No weekly data available</p>
          <p className="text-dark-500 text-sm">Track your focus time in the desktop app to see trends here</p>
        </div>
      </WidgetCard>
    );
  }

  const totalFocusTime = weekData.reduce((acc, day) => acc + day.focusTime, 0);
  const avgFocusTime = totalFocusTime / weekData.length;

  return (
    <WidgetCard
      title="Weekly Focus Trends"
      icon={<BarChart3 className="w-5 h-5" />}
      action={
        <button
          onClick={fetchTrends}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      {/* Bar Chart */}
      <div className="flex justify-between items-end h-32 gap-1.5 mb-4">
        {weekData.map((day, i) => {
          const heightPercent = maxFocusTime > 0 ? (day.focusTime / maxFocusTime) * 100 : 0;
          const isToday = new Date().toDateString() === new Date(day.date).toDateString();

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Bar */}
              <div className="w-full relative flex-1 flex items-end">
                <div
                  className={`w-full rounded-t transition-all group-hover:opacity-80 ${
                    isToday
                      ? 'bg-gradient-to-t from-teal-500 to-purple-500'
                      : 'bg-gradient-to-t from-teal-500/40 to-purple-500/40'
                  }`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {formatTime(day.focusTime)}
                </div>
              </div>
              {/* Day label */}
              <span className={`text-xs ${isToday ? 'text-teal-400 font-medium' : 'text-dark-500'}`}>
                {day.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl">
        <div>
          <p className="text-xs text-dark-400">This Week Total</p>
          <p className="text-lg font-semibold text-white">{formatTime(totalFocusTime)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-dark-400">Daily Average</p>
          <p className="text-lg font-semibold text-teal-400">{formatTime(avgFocusTime)}</p>
        </div>
      </div>
    </WidgetCard>
  );
}
