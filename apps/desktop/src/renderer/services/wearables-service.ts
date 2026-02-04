// apps/desktop/src/renderer/services/wearables-service.ts
// Phase 17-18: Wearable Integration Service

/**
 * Wearables Integration Service
 * 
 * Connects to wearable devices and health platforms:
 * - Apple HealthKit (via Electron bridge)
 * - Google Fit
 * - Fitbit
 * - Garmin
 * - Whoop
 * - Oura Ring
 */

export interface WearableDevice {
    id: string;
    name: string;
    type: WearableType;
    connected: boolean;
    lastSync?: Date;
    batteryLevel?: number;
}

export type WearableType =
    | 'apple_watch'
    | 'fitbit'
    | 'garmin'
    | 'whoop'
    | 'oura'
    | 'google_fit'
    | 'samsung_health';

export interface HealthMetrics {
    heartRate?: {
        current: number;
        resting: number;
        max: number;
        zones: { zone: string; minutes: number }[];
    };
    hrv?: {
        current: number;
        average: number;
        trend: 'improving' | 'declining' | 'stable';
    };
    sleep?: {
        duration: number; // minutes
        quality: number; // 0-100
        stages: {
            awake: number;
            light: number;
            deep: number;
            rem: number;
        };
        lastNight: Date;
    };
    activity?: {
        steps: number;
        calories: number;
        distance: number; // meters
        activeMinutes: number;
        standHours: number;
    };
    stress?: {
        level: number; // 0-100
        trend: 'increasing' | 'decreasing' | 'stable';
        recoveryTime: number; // minutes
    };
    readiness?: {
        score: number; // 0-100
        factors: {
            sleep: number;
            recovery: number;
            activity: number;
        };
    };
}

export interface WearableAlert {
    type: 'high_stress' | 'low_hrv' | 'poor_sleep' | 'fatigue' | 'break_needed';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    suggestion: string;
    timestamp: Date;
}

class WearablesService {
    private devices: Map<string, WearableDevice> = new Map();
    private currentMetrics: HealthMetrics = {};
    private alerts: WearableAlert[] = [];
    private syncInterval: ReturnType<typeof setInterval> | null = null;
    private listeners: Set<(metrics: HealthMetrics) => void> = new Set();

    constructor() {
        this.initializeMockData();
    }

    // Initialize with mock data for demonstration
    private initializeMockData() {
        this.currentMetrics = {
            heartRate: {
                current: 72,
                resting: 58,
                max: 185,
                zones: [
                    { zone: 'Rest', minutes: 420 },
                    { zone: 'Fat Burn', minutes: 45 },
                    { zone: 'Cardio', minutes: 20 },
                    { zone: 'Peak', minutes: 5 }
                ]
            },
            hrv: {
                current: 45,
                average: 42,
                trend: 'stable'
            },
            sleep: {
                duration: 438, // 7h 18m
                quality: 82,
                stages: {
                    awake: 28,
                    light: 198,
                    deep: 112,
                    rem: 100
                },
                lastNight: new Date()
            },
            activity: {
                steps: 6842,
                calories: 2145,
                distance: 5230,
                activeMinutes: 42,
                standHours: 8
            },
            stress: {
                level: 35,
                trend: 'stable',
                recoveryTime: 15
            },
            readiness: {
                score: 78,
                factors: {
                    sleep: 82,
                    recovery: 75,
                    activity: 77
                }
            }
        };
    }

    // ============================================
    // Device Management
    // ============================================

    async connectDevice(type: WearableType): Promise<WearableDevice> {
        // Simulate device connection
        const deviceId = `${type}-${Date.now()}`;
        const device: WearableDevice = {
            id: deviceId,
            name: this.getDeviceName(type),
            type,
            connected: true,
            lastSync: new Date(),
            batteryLevel: 85
        };

        this.devices.set(deviceId, device);
        this.startSync();

        return device;
    }

    async disconnectDevice(deviceId: string): Promise<void> {
        this.devices.delete(deviceId);
        if (this.devices.size === 0) {
            this.stopSync();
        }
    }

    getConnectedDevices(): WearableDevice[] {
        return Array.from(this.devices.values());
    }

    private getDeviceName(type: WearableType): string {
        const names: Record<WearableType, string> = {
            apple_watch: 'Apple Watch',
            fitbit: 'Fitbit',
            garmin: 'Garmin',
            whoop: 'WHOOP',
            oura: 'Oura Ring',
            google_fit: 'Google Fit',
            samsung_health: 'Samsung Health'
        };
        return names[type];
    }

    // ============================================
    // Metrics
    // ============================================

    getMetrics(): HealthMetrics {
        return { ...this.currentMetrics };
    }

    getHeartRate(): HealthMetrics['heartRate'] {
        return this.currentMetrics.heartRate;
    }

    getHRV(): HealthMetrics['hrv'] {
        return this.currentMetrics.hrv;
    }

    getSleep(): HealthMetrics['sleep'] {
        return this.currentMetrics.sleep;
    }

    getActivity(): HealthMetrics['activity'] {
        return this.currentMetrics.activity;
    }

    getStress(): HealthMetrics['stress'] {
        return this.currentMetrics.stress;
    }

    getReadiness(): HealthMetrics['readiness'] {
        return this.currentMetrics.readiness;
    }

    // ============================================
    // Focus Recommendations
    // ============================================

    getFocusRecommendation(): {
        canFocus: boolean;
        optimalDuration: number;
        reason: string;
        suggestions: string[];
    } {
        const readiness = this.currentMetrics.readiness?.score || 70;
        const stress = this.currentMetrics.stress?.level || 50;
        const sleepQuality = this.currentMetrics.sleep?.quality || 70;

        let canFocus = true;
        let optimalDuration = 25;
        const suggestions: string[] = [];
        let reason = '';

        if (readiness < 50) {
            canFocus = false;
            reason = 'Low readiness score suggests you may struggle with focus today.';
            suggestions.push('Consider lighter tasks');
            suggestions.push('Take more breaks');
        } else if (readiness >= 80) {
            optimalDuration = 50;
            reason = 'Excellent readiness! Great time for deep work.';
            suggestions.push('Tackle your most challenging task');
        }

        if (stress > 70) {
            optimalDuration = Math.min(optimalDuration, 15);
            suggestions.push('Try breathing exercises before starting');
            suggestions.push('Use ambient sounds for relaxation');
        }

        if (sleepQuality < 60) {
            optimalDuration = Math.min(optimalDuration, 20);
            suggestions.push('Avoid complex decisions');
            suggestions.push('Consider a short power nap');
        }

        return {
            canFocus,
            optimalDuration,
            reason: reason || 'You\'re ready for focus work!',
            suggestions
        };
    }

    // ============================================
    // Alerts
    // ============================================

    getAlerts(): WearableAlert[] {
        return [...this.alerts];
    }

    checkForAlerts(): WearableAlert[] {
        const newAlerts: WearableAlert[] = [];
        const now = new Date();

        // Check stress levels
        if (this.currentMetrics.stress && this.currentMetrics.stress.level > 70) {
            newAlerts.push({
                type: 'high_stress',
                severity: 'warning',
                message: 'High stress detected',
                suggestion: 'Consider taking a break or trying breathing exercises',
                timestamp: now
            });
        }

        // Check HRV
        if (this.currentMetrics.hrv && this.currentMetrics.hrv.current < 30) {
            newAlerts.push({
                type: 'low_hrv',
                severity: 'info',
                message: 'Low HRV indicates fatigue',
                suggestion: 'Shorter focus sessions recommended today',
                timestamp: now
            });
        }

        // Check sleep
        if (this.currentMetrics.sleep && this.currentMetrics.sleep.quality < 50) {
            newAlerts.push({
                type: 'poor_sleep',
                severity: 'warning',
                message: 'Poor sleep quality last night',
                suggestion: 'Avoid demanding tasks, prioritize recovery',
                timestamp: now
            });
        }

        this.alerts = [...newAlerts, ...this.alerts].slice(0, 20);
        return newAlerts;
    }

    // ============================================
    // Sync Management
    // ============================================

    private startSync() {
        if (this.syncInterval) return;

        this.syncInterval = setInterval(() => {
            this.syncMetrics();
        }, 60000); // Sync every minute
    }

    private stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    private async syncMetrics() {
        // Simulate metric updates
        if (this.currentMetrics.heartRate) {
            this.currentMetrics.heartRate.current = 60 + Math.floor(Math.random() * 30);
        }
        if (this.currentMetrics.activity) {
            this.currentMetrics.activity.steps += Math.floor(Math.random() * 50);
        }

        // Notify listeners
        this.listeners.forEach(listener => listener(this.currentMetrics));

        // Check for alerts
        this.checkForAlerts();
    }

    // ============================================
    // Event Listeners
    // ============================================

    subscribe(callback: (metrics: HealthMetrics) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
}

export const wearablesService = new WearablesService();
export default wearablesService;
