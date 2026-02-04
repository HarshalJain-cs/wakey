/**
 * App Performance Monitor Widget
 * Real-time system performance and app health metrics
 */

import { useState, useEffect } from 'react';
import {
    Activity,
    Cpu,
    HardDrive,
    Wifi,
    Battery,
    Thermometer,
    MemoryStick,
    Clock,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

interface PerformanceMetrics {
    cpuUsage: number;
    memoryUsed: number;
    memoryTotal: number;
    diskUsed: number;
    diskTotal: number;
    networkLatency: number;
    batteryLevel: number;
    batteryCharging: boolean;
    uptime: number;
    activeProcesses: number;
}

function MetricBar({
    value,
    max,
    color,
    showPercentage = true
}: {
    value: number;
    max: number;
    color: string;
    showPercentage?: boolean;
}) {
    const percentage = (value / max) * 100;

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showPercentage && (
                <span className="text-xs text-dark-400 w-10 text-right">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
}

export default function PerformanceMonitorWidget() {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        cpuUsage: 32,
        memoryUsed: 6.2,
        memoryTotal: 16,
        diskUsed: 245,
        diskTotal: 512,
        networkLatency: 45,
        batteryLevel: 85,
        batteryCharging: true,
        uptime: 14400, // seconds
        activeProcesses: 42,
    });

    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 10)),
                memoryUsed: Math.max(2, Math.min(14, prev.memoryUsed + (Math.random() - 0.5) * 0.5)),
                networkLatency: Math.max(10, Math.min(200, prev.networkLatency + (Math.random() - 0.5) * 20)),
                uptime: prev.uptime + 5,
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const getHealthStatus = () => {
        if (metrics.cpuUsage > 80 || metrics.memoryUsed / metrics.memoryTotal > 0.9) {
            return { status: 'warning', label: 'High Load', color: 'text-amber-400' };
        }
        if (metrics.networkLatency > 150) {
            return { status: 'warning', label: 'Slow Network', color: 'text-amber-400' };
        }
        return { status: 'healthy', label: 'All Good', color: 'text-green-400' };
    };

    const health = getHealthStatus();

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">System Health</h3>
                        <div className="flex items-center gap-1">
                            {health.status === 'healthy' ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                            )}
                            <span className={`text-xs ${health.color}`}>{health.label}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-dark-400">Uptime</div>
                    <div className="text-sm font-medium text-white">{formatUptime(metrics.uptime)}</div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-4">
                {/* CPU */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-dark-400">
                            <Cpu className="w-4 h-4" />
                            <span className="text-sm">CPU</span>
                        </div>
                        <span className={`text-sm font-medium ${metrics.cpuUsage > 80 ? 'text-red-400' : 'text-white'}`}>
                            {Math.round(metrics.cpuUsage)}%
                        </span>
                    </div>
                    <MetricBar
                        value={metrics.cpuUsage}
                        max={100}
                        color={metrics.cpuUsage > 80 ? 'bg-red-500' : metrics.cpuUsage > 50 ? 'bg-amber-500' : 'bg-green-500'}
                        showPercentage={false}
                    />
                </div>

                {/* Memory */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-dark-400">
                            <MemoryStick className="w-4 h-4" />
                            <span className="text-sm">Memory</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                            {metrics.memoryUsed.toFixed(1)} / {metrics.memoryTotal} GB
                        </span>
                    </div>
                    <MetricBar
                        value={metrics.memoryUsed}
                        max={metrics.memoryTotal}
                        color="bg-purple-500"
                        showPercentage={false}
                    />
                </div>

                {/* Disk */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-dark-400">
                            <HardDrive className="w-4 h-4" />
                            <span className="text-sm">Disk</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                            {metrics.diskUsed} / {metrics.diskTotal} GB
                        </span>
                    </div>
                    <MetricBar
                        value={metrics.diskUsed}
                        max={metrics.diskTotal}
                        color="bg-blue-500"
                        showPercentage={false}
                    />
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-dark-700">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-dark-400 mb-1">
                        <Wifi className="w-3 h-3" />
                    </div>
                    <div className={`text-sm font-medium ${metrics.networkLatency > 100 ? 'text-amber-400' : 'text-green-400'}`}>
                        {Math.round(metrics.networkLatency)}ms
                    </div>
                    <div className="text-xs text-dark-500">Latency</div>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-dark-400 mb-1">
                        <Battery className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-medium text-white">
                        {metrics.batteryLevel}% {metrics.batteryCharging && '⚡'}
                    </div>
                    <div className="text-xs text-dark-500">Battery</div>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-dark-400 mb-1">
                        <Activity className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-medium text-white">
                        {metrics.activeProcesses}
                    </div>
                    <div className="text-xs text-dark-500">Processes</div>
                </div>
            </div>
        </div>
    );
}
