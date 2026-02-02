// apps/desktop/src/renderer/lib/feature-flags.ts

interface FeatureFlag {
    key: string;
    enabled: boolean;
    rolloutPercentage: number;
    conditions?: FeatureCondition[];
}

interface FeatureCondition {
    type: 'user_id' | 'version' | 'platform' | 'subscription';
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in';
    value: unknown;
}

export class FeatureFlagService {
    private flags: Map<string, FeatureFlag> = new Map();

    constructor() {
        // Initialize with default flags
        this.initializeDefaults();
    }

    private initializeDefaults(): void {
        const defaults: FeatureFlag[] = [
            { key: 'new_pomodoro_ui', enabled: true, rolloutPercentage: 100 },
            { key: 'ai_consensus', enabled: false, rolloutPercentage: 0 },
            { key: 'gamification', enabled: true, rolloutPercentage: 100 },
            { key: 'wearable_integration', enabled: false, rolloutPercentage: 0 },
            { key: 'team_collaboration', enabled: false, rolloutPercentage: 0 },
            { key: 'offline_sync', enabled: true, rolloutPercentage: 100 },
            { key: 'voice_commands', enabled: false, rolloutPercentage: 50 },
        ];

        defaults.forEach(flag => this.flags.set(flag.key, flag));
    }

    isEnabled(key: string, context?: Record<string, unknown>): boolean {
        const flag = this.flags.get(key);
        if (!flag) return false;

        if (!flag.enabled) return false;

        // Check rollout percentage
        if (flag.rolloutPercentage < 100) {
            const hash = this.hashUserId((context?.userId as string) || 'anonymous');
            if (hash > flag.rolloutPercentage) return false;
        }

        // Check conditions
        if (flag.conditions) {
            for (const condition of flag.conditions) {
                if (!this.evaluateCondition(condition, context)) {
                    return false;
                }
            }
        }

        return true;
    }

    setFlag(key: string, enabled: boolean, rolloutPercentage: number = 100): void {
        const existing = this.flags.get(key);
        this.flags.set(key, {
            key,
            enabled,
            rolloutPercentage,
            conditions: existing?.conditions
        });
    }

    getAll(): FeatureFlag[] {
        return Array.from(this.flags.values());
    }

    private evaluateCondition(condition: FeatureCondition, context?: Record<string, unknown>): boolean {
        if (!context) return false;

        const value = context[condition.type];

        switch (condition.operator) {
            case 'eq':
                return value === condition.value;
            case 'neq':
                return value !== condition.value;
            case 'gt':
                return (value as number) > (condition.value as number);
            case 'lt':
                return (value as number) < (condition.value as number);
            case 'in':
                return (condition.value as unknown[]).includes(value);
            default:
                return false;
        }
    }

    private hashUserId(userId: string): number {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash) + userId.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % 100;
    }
}

export const featureFlags = new FeatureFlagService();
export type { FeatureFlag, FeatureCondition };
