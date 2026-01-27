'use client';

import { useState, useEffect } from 'react';
import { Brain, Lightbulb, AlertTriangle, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface Insight {
  id: string;
  type: 'tip' | 'warning' | 'success';
  title: string;
  description: string;
  action?: string;
}

export default function AIInsightsWidget() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/insights');
      if (!res.ok) {
        if (res.status === 404) {
          setInsights([]);
        } else {
          throw new Error('Failed to fetch insights');
        }
      } else {
        const data = await res.json();
        setInsights(data.insights || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'tip':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      default:
        return 'bg-purple-500/10 border-purple-500/20';
    }
  };

  if (loading) {
    return (
      <WidgetCard title="AI Insights" icon={<Brain className="w-5 h-5" />}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 bg-dark-900/50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-dark-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-2/3" />
                  <div className="h-3 bg-dark-700 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="AI Insights" icon={<Brain className="w-5 h-5" />}>
        <div className="text-center py-6">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchInsights}
            className="text-teal-400 hover:text-teal-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </WidgetCard>
    );
  }

  if (insights.length === 0) {
    return (
      <WidgetCard title="AI Insights" icon={<Brain className="w-5 h-5" />}>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-dark-400 mb-2">No insights yet</p>
          <p className="text-dark-500 text-sm">
            Use the desktop app to track your productivity and receive personalized AI insights
          </p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="AI Insights"
      icon={<Brain className="w-5 h-5" />}
      action={
        <button
          onClick={fetchInsights}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-3">
        {insights.slice(0, 4).map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border ${getInsightBg(insight.type)} transition-colors`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-dark-800 rounded-lg flex-shrink-0">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{insight.title}</p>
                <p className="text-xs text-dark-400 mt-1">{insight.description}</p>
                {insight.action && (
                  <button className="text-xs text-teal-400 hover:text-teal-300 mt-2 transition-colors">
                    {insight.action} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {insights.length > 4 && (
        <button className="w-full mt-4 py-2 text-sm text-dark-400 hover:text-teal-400 transition-colors">
          View all {insights.length} insights
        </button>
      )}
    </WidgetCard>
  );
}
