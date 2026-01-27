'use client';

import { useState, useEffect } from 'react';
import { Clock, Target, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface TodayStats {
  focusTime: number;
  sessions: number;
  distractions: number;
  focusScore: number;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}

function StatItem({ icon, label, value, subtext, color = 'text-teal-400' }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
      <div className={`p-2 bg-dark-800 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-dark-400">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
        {subtext && <p className="text-xs text-dark-500">{subtext}</p>}
      </div>
    </div>
  );
}

export default function TodayStatsWidget() {
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats/today');
      if (!res.ok) {
        if (res.status === 404) {
          // No stats yet - user hasn't synced from desktop app
          setStats(null);
        } else {
          throw new Error('Failed to fetch stats');
        }
      } else {
        const data = await res.json();
        setStats(data.stats);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const getFocusScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-teal-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <WidgetCard title="Today's Stats" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
              <div className="w-10 h-10 bg-dark-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-dark-700 rounded w-1/3" />
                <div className="h-5 bg-dark-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Today's Stats" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="text-center py-6">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchStats}
            className="text-teal-400 hover:text-teal-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </WidgetCard>
    );
  }

  if (!stats) {
    return (
      <WidgetCard title="Today's Stats" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700/50 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-dark-500" />
          </div>
          <p className="text-dark-400 mb-2">No stats yet for today</p>
          <p className="text-dark-500 text-sm">Open the Wakey desktop app and start tracking to see your stats here</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Today's Stats"
      icon={<TrendingUp className="w-5 h-5" />}
      action={
        <button
          onClick={fetchStats}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          title="Refresh stats"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-3">
        <StatItem
          icon={<Clock className="w-4 h-4" />}
          label="Focus Time"
          value={formatTime(stats.focusTime)}
          color="text-teal-400"
        />
        <StatItem
          icon={<Target className="w-4 h-4" />}
          label="Sessions Completed"
          value={String(stats.sessions)}
          color="text-purple-400"
        />
        <StatItem
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Distractions"
          value={String(stats.distractions)}
          subtext={stats.distractions > 10 ? 'Try to reduce distractions' : undefined}
          color={stats.distractions > 10 ? 'text-yellow-400' : 'text-dark-400'}
        />
        <StatItem
          icon={<TrendingUp className="w-4 h-4" />}
          label="Focus Score"
          value={`${stats.focusScore}%`}
          color={getFocusScoreColor(stats.focusScore)}
        />
      </div>

      {lastUpdated && (
        <p className="text-xs text-dark-500 text-center mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </WidgetCard>
  );
}
