'use client';

import { useState, useEffect } from 'react';
import { Flame, Trophy, Calendar, RefreshCw } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakDays: string[];
}

export default function StreakWidget() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats/streak');
      if (!res.ok) {
        if (res.status === 404) {
          setStreak(null);
        } else {
          throw new Error('Failed to fetch streak data');
        }
      } else {
        const data = await res.json();
        setStreak(data.streak);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  const getStreakMessage = (days: number) => {
    if (days === 0) return "Start your streak today!";
    if (days === 1) return "Great start! Keep it going!";
    if (days < 7) return "Building momentum!";
    if (days < 14) return "One week strong!";
    if (days < 30) return "You're on fire!";
    if (days < 100) return "Incredible dedication!";
    return "Legendary streak!";
  };

  const getFlameColor = (days: number) => {
    if (days === 0) return 'text-dark-500';
    if (days < 7) return 'text-orange-400';
    if (days < 30) return 'text-orange-500';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <WidgetCard title="Focus Streak" icon={<Flame className="w-5 h-5" />}>
        <div className="animate-pulse">
          <div className="flex justify-center items-center py-8">
            <div className="w-24 h-24 bg-dark-700 rounded-full" />
          </div>
          <div className="h-4 bg-dark-700 rounded w-1/2 mx-auto" />
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Focus Streak" icon={<Flame className="w-5 h-5" />}>
        <div className="text-center py-6">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchStreak}
            className="text-teal-400 hover:text-teal-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </WidgetCard>
    );
  }

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;

  return (
    <WidgetCard
      title="Focus Streak"
      icon={<Flame className="w-5 h-5" />}
      action={
        <button
          onClick={fetchStreak}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      {/* Main Streak Display */}
      <div className="flex flex-col items-center py-4">
        <div className={`relative ${currentStreak > 0 ? 'animate-pulse' : ''}`}>
          <div className={`text-6xl ${getFlameColor(currentStreak)}`}>
            <Flame className="w-20 h-20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white mt-2">{currentStreak}</span>
          </div>
        </div>
        <p className="text-lg font-semibold text-white mt-2">
          {currentStreak} day{currentStreak !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-dark-400">{getStreakMessage(currentStreak)}</p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl mt-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <div>
            <p className="text-xs text-dark-400">Longest Streak</p>
            <p className="text-sm font-semibold text-white">{longestStreak} days</p>
          </div>
        </div>
        {streak?.lastActiveDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <div>
              <p className="text-xs text-dark-400">Last Active</p>
              <p className="text-sm font-semibold text-white">
                {new Date(streak.lastActiveDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Activity Dots */}
      {streak?.streakDays && streak.streakDays.length > 0 && (
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];
            const isActive = streak.streakDays.includes(dateStr);

            return (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  isActive
                    ? 'bg-gradient-to-br from-teal-500 to-purple-500'
                    : 'bg-dark-700'
                }`}
                title={dateStr}
              />
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
