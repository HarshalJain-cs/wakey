'use client';

import { useState, useEffect } from 'react';
import { Trophy, Lock, Star, Flame, Clock, Target, Zap, Award, RefreshCw } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'time' | 'sessions' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  flame: <Flame className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  award: <Award className="w-5 h-5" />,
  trophy: <Trophy className="w-5 h-5" />,
};

export default function AchievementsWidget() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/achievements');
      if (!res.ok) {
        if (res.status === 404) {
          setAchievements([]);
        } else {
          throw new Error('Failed to fetch achievements');
        }
      } else {
        const data = await res.json();
        setAchievements(data.achievements || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak':
        return 'from-orange-500 to-red-500';
      case 'time':
        return 'from-blue-500 to-purple-500';
      case 'sessions':
        return 'from-teal-500 to-green-500';
      case 'special':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <WidgetCard title="Achievements" icon={<Trophy className="w-5 h-5" />}>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-square bg-dark-700 rounded-xl" />
            </div>
          ))}
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Achievements" icon={<Trophy className="w-5 h-5" />}>
        <div className="text-center py-6">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchAchievements}
            className="text-teal-400 hover:text-teal-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </WidgetCard>
    );
  }

  if (achievements.length === 0) {
    return (
      <WidgetCard title="Achievements" icon={<Trophy className="w-5 h-5" />}>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-dark-400 mb-2">No achievements yet</p>
          <p className="text-dark-500 text-sm">
            Start using Wakey to unlock achievements
          </p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Achievements"
      icon={<Trophy className="w-5 h-5" />}
      action={
        <span className="text-xs text-yellow-400">
          {unlockedCount}/{totalCount} unlocked
        </span>
      }
    >
      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-dark-900/50 rounded-lg">
        {(['all', 'unlocked', 'locked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-xs rounded-md transition-colors capitalize ${
              filter === f
                ? 'bg-dark-700 text-white'
                : 'text-dark-500 hover:text-dark-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-3 gap-3">
        {filteredAchievements.slice(0, 6).map((achievement) => (
          <div
            key={achievement.id}
            className={`relative group cursor-pointer ${
              !achievement.unlocked ? 'opacity-50' : ''
            }`}
            title={`${achievement.title}: ${achievement.description}`}
          >
            <div
              className={`w-full aspect-square rounded-xl flex items-center justify-center ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${getCategoryColor(achievement.category)}`
                  : 'bg-dark-700'
              }`}
            >
              {achievement.unlocked ? (
                ICON_MAP[achievement.icon] || <Trophy className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5 text-dark-500" />
              )}
            </div>

            {/* Progress bar for locked achievements */}
            {!achievement.unlocked && achievement.progress !== undefined && achievement.target && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600 rounded-b-xl overflow-hidden">
                <div
                  className="h-full bg-teal-500"
                  style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                />
              </div>
            )}

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {achievement.title}
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length > 6 && (
        <button className="w-full mt-4 py-2 text-sm text-dark-400 hover:text-yellow-400 transition-colors">
          View all {filteredAchievements.length} achievements
        </button>
      )}

      {/* Recent Unlock */}
      {achievements.find((a) => a.unlocked && a.unlockedAt) && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400">Recently Unlocked</span>
          </div>
          <p className="text-sm text-white mt-1">
            {achievements.find((a) => a.unlocked)?.title}
          </p>
        </div>
      )}
    </WidgetCard>
  );
}
