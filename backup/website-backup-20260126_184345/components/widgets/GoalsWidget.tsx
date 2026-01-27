'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Circle, TrendingUp, RefreshCw } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  type: 'daily' | 'weekly';
  category: 'focus' | 'breaks' | 'limit' | 'custom';
}

export default function GoalsWidget() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/goals');
      if (!res.ok) {
        if (res.status === 404) {
          setGoals([]);
        } else {
          throw new Error('Failed to fetch goals');
        }
      } else {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const getProgress = (goal: Goal) => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    return Math.round(progress);
  };

  const getProgressColor = (goal: Goal) => {
    const progress = getProgress(goal);
    if (goal.category === 'limit') {
      // For limit goals, being over is bad
      if (progress >= 100) return 'bg-red-500';
      if (progress >= 80) return 'bg-yellow-500';
      return 'bg-green-500';
    }
    // For other goals, higher is better
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-teal-500';
    return 'bg-purple-500';
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'hours' || unit === 'h') {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      if (hours === 0) return `${minutes}m`;
      return `${hours}h ${minutes}m`;
    }
    return `${value}${unit}`;
  };

  if (loading) {
    return (
      <WidgetCard title="Goals" icon={<Target className="w-5 h-5" />}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-dark-700 rounded w-1/3" />
                <div className="h-4 bg-dark-700 rounded w-1/6" />
              </div>
              <div className="h-2 bg-dark-700 rounded-full" />
            </div>
          ))}
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Goals" icon={<Target className="w-5 h-5" />}>
        <div className="text-center py-6">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchGoals}
            className="text-teal-400 hover:text-teal-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </WidgetCard>
    );
  }

  if (goals.length === 0) {
    return (
      <WidgetCard title="Goals" icon={<Target className="w-5 h-5" />}>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700/50 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-dark-500" />
          </div>
          <p className="text-dark-400 mb-2">No goals set</p>
          <p className="text-dark-500 text-sm mb-4">
            Set goals in the desktop app to track your progress
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg mx-auto transition-colors">
            <Plus className="w-4 h-4" />
            Create Goal
          </button>
        </div>
      </WidgetCard>
    );
  }

  const completedGoals = goals.filter(g => getProgress(g) >= 100).length;

  return (
    <WidgetCard
      title="Goals"
      icon={<Target className="w-5 h-5" />}
      action={
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-400">
            {completedGoals}/{goals.length} completed
          </span>
          <button
            onClick={fetchGoals}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {goals.slice(0, 5).map((goal) => {
          const progress = getProgress(goal);
          const isComplete = progress >= 100;

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-dark-500" />
                  )}
                  <span className={`text-sm ${isComplete ? 'text-dark-400 line-through' : 'text-white'}`}>
                    {goal.title}
                  </span>
                </div>
                <span className="text-xs text-dark-400">
                  {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
                </span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressColor(goal)}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {goals.length > 5 && (
        <button className="w-full mt-4 py-2 text-sm text-dark-400 hover:text-teal-400 transition-colors">
          View all {goals.length} goals
        </button>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between mt-4 p-3 bg-dark-900/50 rounded-xl">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-400" />
          <span className="text-xs text-dark-400">Today&apos;s Progress</span>
        </div>
        <span className="text-sm font-semibold text-white">
          {Math.round((completedGoals / goals.length) * 100)}%
        </span>
      </div>
    </WidgetCard>
  );
}
