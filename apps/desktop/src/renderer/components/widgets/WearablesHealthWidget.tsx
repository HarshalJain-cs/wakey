// apps/desktop/src/renderer/components/widgets/WearablesHealthWidget.tsx
// Phase 17-18: Wearables Health Dashboard Widget

import React, { useState, useEffect } from 'react';
import { wearablesService, type HealthMetrics, type WearableDevice } from '../../services/wearables-service';

const WearablesHealthWidget: React.FC = () => {
    const [metrics, setMetrics] = useState<HealthMetrics>({});
    const [devices, setDevices] = useState<WearableDevice[]>([]);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setMetrics(wearablesService.getMetrics());
        setDevices(wearablesService.getConnectedDevices());

        const unsubscribe = wearablesService.subscribe((newMetrics) => {
            setMetrics(newMetrics);
        });

        return () => unsubscribe();
    }, []);

    const recommendation = wearablesService.getFocusRecommendation();

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const getReadinessColor = (score: number): string => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getStressColor = (level: number): string => {
        if (level <= 30) return 'text-green-400';
        if (level <= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⌚</span>
                    <h3 className="font-semibold text-white">Health & Readiness</h3>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-dark-400 hover:text-white px-2 py-1 bg-dark-700 rounded"
                >
                    {expanded ? 'Less' : 'More'}
                </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Readiness Score */}
                <div className="bg-dark-700/50 rounded-lg p-3">
                    <div className="text-xs text-dark-400 mb-1">Readiness</div>
                    <div className={`text-2xl font-bold ${getReadinessColor(metrics.readiness?.score || 0)}`}>
                        {metrics.readiness?.score || '--'}
                    </div>
                    <div className="text-xs text-dark-500">out of 100</div>
                </div>

                {/* Heart Rate */}
                <div className="bg-dark-700/50 rounded-lg p-3">
                    <div className="text-xs text-dark-400 mb-1">Heart Rate</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-red-400">
                            {metrics.heartRate?.current || '--'}
                        </span>
                        <span className="text-xs text-dark-500">bpm</span>
                    </div>
                    <div className="text-xs text-dark-500">
                        Resting: {metrics.heartRate?.resting || '--'}
                    </div>
                </div>

                {/* Stress Level */}
                <div className="bg-dark-700/50 rounded-lg p-3">
                    <div className="text-xs text-dark-400 mb-1">Stress</div>
                    <div className={`text-2xl font-bold ${getStressColor(metrics.stress?.level || 0)}`}>
                        {metrics.stress?.level || '--'}%
                    </div>
                    <div className="text-xs text-dark-500 capitalize">
                        {metrics.stress?.trend || 'stable'}
                    </div>
                </div>

                {/* HRV */}
                <div className="bg-dark-700/50 rounded-lg p-3">
                    <div className="text-xs text-dark-400 mb-1">HRV</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-purple-400">
                            {metrics.hrv?.current || '--'}
                        </span>
                        <span className="text-xs text-dark-500">ms</span>
                    </div>
                    <div className="text-xs text-dark-500 capitalize">
                        {metrics.hrv?.trend || 'stable'}
                    </div>
                </div>
            </div>

            {/* Focus Recommendation */}
            <div className={`rounded-lg p-3 mb-3 ${recommendation.canFocus ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{recommendation.canFocus ? '✅' : '⚠️'}</span>
                    <span className={`text-sm font-medium ${recommendation.canFocus ? 'text-green-400' : 'text-yellow-400'}`}>
                        {recommendation.canFocus ? 'Ready for Focus' : 'Consider Recovery'}
                    </span>
                </div>
                <p className="text-xs text-dark-400 mb-2">{recommendation.reason}</p>
                <div className="text-xs text-dark-500">
                    Optimal session: <span className="text-white font-medium">{recommendation.optimalDuration} min</span>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <>
                    {/* Sleep */}
                    {metrics.sleep && (
                        <div className="bg-dark-700/30 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-dark-400">Last Night's Sleep</span>
                                <span className="text-sm font-medium text-white">
                                    {formatDuration(metrics.sleep.duration)}
                                </span>
                            </div>
                            <div className="flex gap-1 h-2 rounded overflow-hidden mb-2">
                                <div
                                    className="bg-gray-500"
                                    style={{ width: `${(metrics.sleep.stages.awake / metrics.sleep.duration) * 100}%` }}
                                    title="Awake"
                                />
                                <div
                                    className="bg-blue-400"
                                    style={{ width: `${(metrics.sleep.stages.light / metrics.sleep.duration) * 100}%` }}
                                    title="Light"
                                />
                                <div
                                    className="bg-blue-600"
                                    style={{ width: `${(metrics.sleep.stages.deep / metrics.sleep.duration) * 100}%` }}
                                    title="Deep"
                                />
                                <div
                                    className="bg-purple-500"
                                    style={{ width: `${(metrics.sleep.stages.rem / metrics.sleep.duration) * 100}%` }}
                                    title="REM"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-dark-500">
                                <span>Quality: {metrics.sleep.quality}%</span>
                                <span>Deep: {formatDuration(metrics.sleep.stages.deep)}</span>
                            </div>
                        </div>
                    )}

                    {/* Activity */}
                    {metrics.activity && (
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-dark-700/30 rounded">
                                <div className="text-lg font-bold text-orange-400">
                                    {metrics.activity.steps.toLocaleString()}
                                </div>
                                <div className="text-xs text-dark-500">Steps</div>
                            </div>
                            <div className="text-center p-2 bg-dark-700/30 rounded">
                                <div className="text-lg font-bold text-red-400">
                                    {metrics.activity.calories.toLocaleString()}
                                </div>
                                <div className="text-xs text-dark-500">Calories</div>
                            </div>
                            <div className="text-center p-2 bg-dark-700/30 rounded">
                                <div className="text-lg font-bold text-green-400">
                                    {metrics.activity.activeMinutes}
                                </div>
                                <div className="text-xs text-dark-500">Active Min</div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Connected Devices */}
            {devices.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-700">
                    <div className="flex items-center gap-2 text-xs text-dark-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {devices.map(d => d.name).join(', ')} connected
                    </div>
                </div>
            )}

            {devices.length === 0 && (
                <div className="mt-3 pt-3 border-t border-dark-700">
                    <p className="text-xs text-dark-500 text-center">
                        Connect a wearable device for personalized insights
                    </p>
                </div>
            )}
        </div>
    );
};

export default WearablesHealthWidget;
