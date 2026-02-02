import { useState, useEffect } from 'react';
import {
    Heart, Activity, Moon, TrendingUp, AlertTriangle,
    Zap, Coffee, Watch, Battery, RefreshCw, Sun,
    CheckCircle2, ChevronRight,
} from 'lucide-react';
import { enhancedBurnoutService, BurnoutAssessment } from '../services/enhanced-burnout-service';
import { enhancedSleepService, SleepProfile, BedtimeReminder } from '../services/enhanced-sleep-service';
import { wearableIntegrationService, WearableData } from '../services/wearable-integration-service';

export default function HealthPage() {
    const [burnoutData, setBurnoutData] = useState<BurnoutAssessment | null>(null);
    const [sleepProfile, setSleepProfile] = useState<SleepProfile | null>(null);
    const [bedtimeReminder, setBedtimeReminder] = useState<BedtimeReminder | null>(null);
    const [wearableData, setWearableData] = useState<WearableData | null>(null);
    const [circadianPhase, setCircadianPhase] = useState<{ phase: string; optimalActivities: string[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'burnout' | 'sleep' | 'wearables'>('overview');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [burnout, sleep, reminder, phase] = await Promise.all([
                enhancedBurnoutService.assessBurnoutRisk(),
                enhancedSleepService.getSleepProfile(),
                enhancedSleepService.getBedtimeReminder(),
                enhancedSleepService.getCircadianPhase(),
            ]);
            setBurnoutData(burnout);
            setSleepProfile(sleep);
            setBedtimeReminder(reminder);
            setCircadianPhase(phase);
            setWearableData(wearableIntegrationService.getLatestData());
        } catch (error) {
            console.error('Failed to load health data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            default: return 'text-green-400 bg-green-500/20 border-green-500/30';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-red-400';
        if (score >= 55) return 'text-orange-400';
        if (score >= 35) return 'text-yellow-400';
        return 'text-green-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Heart className="w-12 h-12 text-primary-400 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Heart className="w-8 h-8 text-pink-400" />
                        Health & Wellness
                        <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                            Enhanced
                        </span>
                    </h1>
                    <p className="text-dark-400">Monitor your wellbeing and prevent burnout</p>
                </div>
                <button
                    onClick={loadData}
                    className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-white transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {(['overview', 'burnout', 'sleep', 'wearables'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg capitalize transition-all ${activeTab === tab
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-800 text-dark-400 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-6">
                    {/* Burnout Risk Card */}
                    <div className={`rounded-xl p-6 border ${getRiskColor(burnoutData?.riskLevel || 'low')}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Burnout Risk
                            </h3>
                            <span className="text-2xl font-bold capitalize">{burnoutData?.riskLevel}</span>
                        </div>
                        <div className="h-3 bg-dark-700 rounded-full overflow-hidden mb-2">
                            <div
                                className={`h-full transition-all ${(burnoutData?.score || 0) >= 75 ? 'bg-red-500' :
                                    (burnoutData?.score || 0) >= 55 ? 'bg-orange-500' :
                                        (burnoutData?.score || 0) >= 35 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${burnoutData?.score || 0}%` }}
                            />
                        </div>
                        <p className="text-sm text-dark-400">
                            Score: {burnoutData ? burnoutData.score.toFixed(0) : '0'}%
                        </p>
                        {(burnoutData?.primaryCauses?.length ?? 0) > 0 && (
                            <div className="mt-3 text-sm">
                                <span className="text-dark-400">Causes: </span>
                                {burnoutData?.primaryCauses?.slice(0, 2).join(', ')}
                            </div>
                        )}
                    </div>

                    {/* Circadian Phase Card */}
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-4">
                            <Sun className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">Circadian Phase</h3>
                        </div>
                        <div className="text-2xl font-bold text-white capitalize mb-2">
                            {circadianPhase?.phase.replace('-', ' ')}
                        </div>
                        <div className="space-y-1">
                            {circadianPhase?.optimalActivities.slice(0, 3).map((activity, i) => (
                                <div key={i} className="text-sm text-dark-300 flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 text-primary-400" />
                                    {activity}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sleep Profile Card */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <div className="flex items-center gap-2 mb-4">
                            <Moon className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-lg font-semibold text-white">Sleep Profile</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-white">{sleepProfile?.averageDuration.toFixed(1)}h</div>
                                <div className="text-sm text-dark-400">Avg Duration</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white capitalize">{sleepProfile?.chronotype.replace('-', ' ')}</div>
                                <div className="text-sm text-dark-400">Chronotype</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-400">{sleepProfile?.sleepDebt.toFixed(1)}h</div>
                                <div className="text-sm text-dark-400">Sleep Debt</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white">
                                    {sleepProfile?.optimalSleepWindow.start} - {sleepProfile?.optimalSleepWindow.end}
                                </div>
                                <div className="text-sm text-dark-400">Optimal Window</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-left transition-colors">
                                <Coffee className="w-5 h-5 text-yellow-400 mb-1" />
                                <div className="text-sm font-medium text-white">Take a Break</div>
                            </button>
                            <button className="p-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-left transition-colors">
                                <Activity className="w-5 h-5 text-green-400 mb-1" />
                                <div className="text-sm font-medium text-white">Stretch</div>
                            </button>
                            <button className="p-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-left transition-colors">
                                <Moon className="w-5 h-5 text-indigo-400 mb-1" />
                                <div className="text-sm font-medium text-white">Bedtime Reminder</div>
                            </button>
                            <button className="p-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-left transition-colors">
                                <Heart className="w-5 h-5 text-pink-400 mb-1" />
                                <div className="text-sm font-medium text-white">Breathe</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Burnout Tab */}
            {activeTab === 'burnout' && burnoutData && (
                <div className="space-y-6">
                    {/* Score */}
                    <div className={`rounded-xl p-6 border ${getRiskColor(burnoutData.riskLevel)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Burnout Risk Assessment</h3>
                                <p className="text-dark-400">Based on 7 key indicators</p>
                            </div>
                            <div className="text-right">
                                <div className={`text-4xl font-bold ${getScoreColor(burnoutData.score)}`}>
                                    {burnoutData.score.toFixed(0)}
                                </div>
                                <div className="text-sm text-dark-400 capitalize">{burnoutData.riskLevel} Risk</div>
                            </div>
                        </div>
                    </div>

                    {/* Indicators */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Risk Indicators</h3>
                        <div className="space-y-4">
                            {Object.entries(burnoutData.indicators).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-dark-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        {value.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                                        {value.trend === 'down' && <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getScoreColor(value.score).replace('text-', 'bg-')}`}
                                                style={{ width: `${value.score}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-medium w-10 ${getScoreColor(value.score)}`}>
                                            {value.score.toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interventions */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Recommended Actions</h3>
                        <div className="space-y-3">
                            {burnoutData.interventions.map(intervention => (
                                <div
                                    key={intervention.id}
                                    className={`p-4 rounded-lg border ${intervention.type === 'immediate'
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : intervention.type === 'short-term'
                                            ? 'bg-yellow-500/10 border-yellow-500/30'
                                            : 'bg-blue-500/10 border-blue-500/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-white">{intervention.title}</div>
                                            <p className="text-sm text-dark-400">{intervention.description}</p>
                                        </div>
                                        {intervention.actionable && (
                                            <button className="px-3 py-1 rounded bg-dark-700 text-dark-300 text-sm hover:bg-dark-600">
                                                Start
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sleep Tab */}
            {activeTab === 'sleep' && sleepProfile && (
                <div className="space-y-6">
                    {/* Sleep Profile */}
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-500/30">
                        <div className="grid grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{sleepProfile.averageDuration.toFixed(1)}h</div>
                                <div className="text-sm text-dark-400">Avg Sleep</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{sleepProfile.averageBedtime}</div>
                                <div className="text-sm text-dark-400">Avg Bedtime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{sleepProfile.averageWakeTime}</div>
                                <div className="text-sm text-dark-400">Avg Wake</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-400">{sleepProfile.sleepDebt.toFixed(1)}h</div>
                                <div className="text-sm text-dark-400">Sleep Debt</div>
                            </div>
                        </div>
                    </div>

                    {/* Chronotype */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Chronotype</h3>
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">
                                {sleepProfile.chronotype === 'morning-lark' ? '🐦' :
                                    sleepProfile.chronotype === 'night-owl' ? '🦉' : '🕐'}
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white capitalize">
                                    {sleepProfile.chronotype.replace('-', ' ')}
                                </div>
                                <p className="text-dark-400">
                                    {sleepProfile.chronotype === 'morning-lark'
                                        ? 'You naturally wake early and are most productive in the morning.'
                                        : sleepProfile.chronotype === 'night-owl'
                                            ? 'You tend to stay up late and are most productive in the evening.'
                                            : 'You have a balanced sleep-wake cycle.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bedtime Reminder */}
                    {bedtimeReminder && (
                        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Moon className="w-5 h-5 text-indigo-400" />
                                Tonight's Wind-Down Routine
                            </h3>
                            <div className="space-y-3">
                                {bedtimeReminder.activities.map((activity, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-20 text-sm text-dark-400">
                                            {activity.time === 0 ? 'Bedtime' : `${Math.abs(activity.time)} min before`}
                                        </div>
                                        <div className="flex-1 p-3 rounded-lg bg-dark-700 text-dark-200">
                                            {activity.activity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Wearables Tab */}
            {activeTab === 'wearables' && (
                <div className="space-y-6">
                    {/* Connected Devices */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Watch className="w-5 h-5 text-primary-400" />
                            Connected Devices
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {wearableIntegrationService.getAvailableProviders().map(providerInfo => {
                                return (
                                    <div
                                        key={providerInfo.provider}
                                        className={`p-4 rounded-lg border flex items-center justify-between ${providerInfo.connected
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-dark-700 border-dark-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Watch className={`w-5 h-5 ${providerInfo.connected ? 'text-green-400' : 'text-dark-400'}`} />
                                            <span className="font-medium text-white">{providerInfo.name}</span>
                                        </div>
                                        {providerInfo.connected ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <button className="px-3 py-1 rounded bg-primary-500 text-white text-sm hover:bg-primary-600">
                                                Connect
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Wearable Data */}
                    {wearableData ? (
                        <div className="grid grid-cols-2 gap-6">
                            {/* Heart Rate */}
                            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <Heart className="w-5 h-5 text-red-400" />
                                    <h3 className="font-semibold text-white">Heart Rate</h3>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {wearableData.heartRate.current} BPM
                                </div>
                                <div className="flex gap-4 text-sm text-dark-400">
                                    <span>Resting: {wearableData.heartRate.resting}</span>
                                    <span>HRV: {wearableData.heartRate.variability} ms</span>
                                </div>
                            </div>

                            {/* Sleep */}
                            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <Moon className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-semibold text-white">Last Night's Sleep</h3>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {(wearableData.sleep.duration / 60).toFixed(1)}h
                                </div>
                                <div className="text-sm text-dark-400">
                                    Score: {wearableData.sleep.score}/100
                                </div>
                            </div>

                            {/* Activity */}
                            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="w-5 h-5 text-green-400" />
                                    <h3 className="font-semibold text-white">Activity</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-xl font-bold text-white">{wearableData.activity.steps.toLocaleString()}</div>
                                        <div className="text-xs text-dark-400">Steps</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">{wearableData.activity.activeMinutes}</div>
                                        <div className="text-xs text-dark-400">Active Min</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">{wearableData.activity.calories}</div>
                                        <div className="text-xs text-dark-400">Calories</div>
                                    </div>
                                </div>
                            </div>

                            {/* Readiness */}
                            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <Battery className="w-5 h-5 text-yellow-400" />
                                    <h3 className="font-semibold text-white">Readiness</h3>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {wearableData.readiness.score}/100
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(wearableData.readiness.factors).map(([factor, score]) => (
                                        <span key={factor} className="text-xs bg-dark-700 px-2 py-1 rounded text-dark-300">
                                            {factor}: {score}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-dark-800 rounded-xl p-8 border border-dark-700 text-center">
                            <Watch className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Wearable Connected</h3>
                            <p className="text-dark-400">
                                Connect a wearable device to see your health metrics
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
