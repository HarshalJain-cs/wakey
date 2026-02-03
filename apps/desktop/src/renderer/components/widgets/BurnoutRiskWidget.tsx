import { useState, useEffect } from 'react';
import { AlertTriangle, Heart, Brain, TrendingDown, TrendingUp, Activity, Moon, Coffee, Zap } from 'lucide-react';
import { enhancedBurnoutService, BurnoutAssessment } from '../../services/enhanced-burnout-service';

interface BurnoutMetrics {
    overallRisk: number; // 0-100
    workloadScore: number;
    restScore: number;
    stressIndicators: number;
    recoveryTrend: 'improving' | 'stable' | 'declining';
}

interface RiskFactor {
    name: string;
    value: number;
    status: 'good' | 'warning' | 'critical';
    icon: React.ReactNode;
    tip: string;
}

// Circular risk gauge
function RiskGauge({ risk }: { risk: number }) {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference * (1 - risk / 100);

    const getColor = () => {
        if (risk <= 30) return '#10b981'; // Green - Low risk
        if (risk <= 60) return '#f59e0b'; // Amber - Moderate
        return '#ef4444'; // Red - High risk
    };

    const getLabel = () => {
        if (risk <= 30) return 'Low Risk';
        if (risk <= 60) return 'Moderate';
        return 'High Risk';
    };

    const getEmoji = () => {
        if (risk <= 30) return '😊';
        if (risk <= 60) return '😐';
        return '😰';
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="8"
                    />
                    {/* Risk arc */}
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke={getColor()}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl">{getEmoji()}</span>
                    <span className="text-lg font-bold text-white">{risk}%</span>
                </div>
            </div>
            <div className="flex-1">
                <div className="text-sm text-dark-400">Burnout Risk Level</div>
                <div className="text-xl font-bold" style={{ color: getColor() }}>
                    {getLabel()}
                </div>
                {risk > 60 && (
                    <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Consider taking a break
                    </div>
                )}
                {risk <= 30 && (
                    <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        You're doing great!
                    </div>
                )}
            </div>
        </div>
    );
}

// Risk factor bar
function RiskFactorBar({ factor }: { factor: RiskFactor }) {
    const getBarColor = () => {
        if (factor.status === 'good') return 'from-green-500 to-emerald-400';
        if (factor.status === 'warning') return 'from-yellow-500 to-amber-400';
        return 'from-red-500 to-orange-400';
    };

    const getStatusColor = () => {
        if (factor.status === 'good') return 'text-green-400';
        if (factor.status === 'warning') return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="p-2 bg-dark-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <span className={getStatusColor()}>{factor.icon}</span>
                    <span className="text-sm text-dark-300">{factor.name}</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {factor.value}%
                </span>
            </div>
            <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-500`}
                    style={{ width: `${factor.value}%` }}
                />
            </div>
            <div className="text-xs text-dark-500 mt-1">{factor.tip}</div>
        </div>
    );
}

// Recovery trend indicator
function RecoveryTrend({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
    const config = {
        improving: {
            icon: <TrendingUp className="w-4 h-4" />,
            color: 'text-green-400 bg-green-500/10 border-green-500/30',
            text: 'Recovery Improving'
        },
        stable: {
            icon: <Activity className="w-4 h-4" />,
            color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
            text: 'Stable'
        },
        declining: {
            icon: <TrendingDown className="w-4 h-4" />,
            color: 'text-red-400 bg-red-500/10 border-red-500/30',
            text: 'Needs Attention'
        }
    };

    const c = config[trend];

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${c.color}`}>
            {c.icon}
            <span className="text-xs font-medium">{c.text}</span>
        </div>
    );
}

// Convert service assessment to widget metrics
function assessmentToMetrics(assessment: BurnoutAssessment): BurnoutMetrics {
    const { indicators, score } = assessment;

    // Map risk trend
    const timeline = assessment.timeline;
    let recoveryTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (timeline.length >= 2) {
        const recent = timeline[timeline.length - 1].score;
        const previous = timeline[timeline.length - 2].score;
        if (recent < previous - 5) recoveryTrend = 'improving';
        else if (recent > previous + 5) recoveryTrend = 'declining';
    }

    return {
        overallRisk: score,
        workloadScore: indicators.workHours?.score ?? 50,
        restScore: indicators.sleep?.score ?? 70,
        stressIndicators: indicators.stress?.score ?? 40,
        recoveryTrend
    };
}

export default function BurnoutRiskWidget() {
    const [metrics, setMetrics] = useState<BurnoutMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                // Get real burnout assessment from enhanced service
                const assessment = await enhancedBurnoutService.assessBurnoutRisk();
                setMetrics(assessmentToMetrics(assessment));
            } catch (error) {
                console.error('Failed to load burnout metrics:', error);
                // Fallback to mock data if service fails
                setMetrics({
                    overallRisk: 35,
                    workloadScore: 55,
                    restScore: 75,
                    stressIndicators: 30,
                    recoveryTrend: 'stable'
                });
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();

        // Refresh every 5 minutes
        const interval = setInterval(loadMetrics, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getRiskFactors = (): RiskFactor[] => {
        if (!metrics) return [];

        return [
            {
                name: 'Workload',
                value: metrics.workloadScore,
                status: metrics.workloadScore > 80 ? 'critical' : metrics.workloadScore > 60 ? 'warning' : 'good',
                icon: <Brain className="w-4 h-4" />,
                tip: metrics.workloadScore > 60 ? 'Consider delegating tasks' : 'Workload is manageable'
            },
            {
                name: 'Rest Quality',
                value: metrics.restScore,
                status: metrics.restScore < 50 ? 'critical' : metrics.restScore < 70 ? 'warning' : 'good',
                icon: <Moon className="w-4 h-4" />,
                tip: metrics.restScore < 70 ? 'Try to get more sleep' : 'Good rest habits!'
            },
            {
                name: 'Break Compliance',
                value: 100 - metrics.stressIndicators,
                status: metrics.stressIndicators > 60 ? 'critical' : metrics.stressIndicators > 40 ? 'warning' : 'good',
                icon: <Coffee className="w-4 h-4" />,
                tip: metrics.stressIndicators > 40 ? 'Take more frequent breaks' : 'Taking breaks regularly'
            },
            {
                name: 'Energy Level',
                value: 100 - metrics.overallRisk,
                status: metrics.overallRisk > 60 ? 'critical' : metrics.overallRisk > 40 ? 'warning' : 'good',
                icon: <Zap className="w-4 h-4" />,
                tip: metrics.overallRisk > 40 ? 'Recharge with light exercise' : 'Energy is good!'
            }
        ];
    };

    return (
        <div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Wellness Check
                </span>
                {metrics && <RecoveryTrend trend={metrics.recoveryTrend} />}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                </div>
            ) : metrics && (
                <div className="space-y-4">
                    {/* Main Risk Gauge */}
                    <RiskGauge risk={metrics.overallRisk} />

                    {/* Risk Factors */}
                    <div className="space-y-2">
                        <div className="text-xs text-dark-400 uppercase tracking-wider">Risk Factors</div>
                        {getRiskFactors().map((factor, i) => (
                            <RiskFactorBar key={i} factor={factor} />
                        ))}
                    </div>

                    {/* Quick Actions */}
                    {metrics.overallRisk > 50 && (
                        <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                            <div className="text-sm font-medium text-amber-400 mb-1">
                                Recommended Actions
                            </div>
                            <ul className="text-xs text-dark-400 space-y-1">
                                <li>• Take a 15-minute break now</li>
                                <li>• Go for a short walk</li>
                                <li>• Practice deep breathing</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
