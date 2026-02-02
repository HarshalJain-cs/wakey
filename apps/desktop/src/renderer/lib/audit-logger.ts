// apps/desktop/src/renderer/lib/audit-logger.ts

import { v4 as generateId } from 'uuid';

interface AuditEvent {
    id: string;
    timestamp: Date;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    error?: string;
}

export class AuditLogger {
    private events: AuditEvent[] = [];
    private maxEvents = 10000;

    log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
        const auditEvent: AuditEvent = {
            ...event,
            id: generateId(),
            timestamp: new Date()
        };

        this.events.push(auditEvent);

        // Limit stored events
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        this.persist(auditEvent);

        // Critical security events
        if (this.isCriticalEvent(event.action)) {
            this.alertSecurityTeam(auditEvent);
        }
    }

    private isCriticalEvent(action: string): boolean {
        const criticalActions = [
            'auth.failed_login',
            'auth.password_changed',
            'data.export',
            'integration.connected',
            'settings.security_changed'
        ];
        return criticalActions.includes(action);
    }

    async getAuditTrail(filter: {
        userId?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<AuditEvent[]> {
        let filtered = this.events;

        if (filter.userId) {
            filtered = filtered.filter(e => e.userId === filter.userId);
        }
        if (filter.action) {
            filtered = filtered.filter(e => e.action === filter.action);
        }
        if (filter.startDate) {
            filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
        }
        if (filter.endDate) {
            filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
        }

        return filtered;
    }

    private async persist(event: AuditEvent): Promise<void> {
        // Write to localStorage for now, will be migrated to encrypted storage
        try {
            const existing = localStorage.getItem('wakey_audit_log');
            const logs: AuditEvent[] = existing ? JSON.parse(existing) : [];
            logs.push(event);

            // Keep only last 1000 events in localStorage
            const trimmed = logs.slice(-1000);
            localStorage.setItem('wakey_audit_log', JSON.stringify(trimmed));
        } catch (error) {
            console.error('Failed to persist audit event:', error);
        }
    }

    private async alertSecurityTeam(event: AuditEvent): Promise<void> {
        // Send notification for critical events
        console.warn('Critical security event:', event);
        // In production, this would send to a monitoring service
    }
}

export const auditLogger = new AuditLogger();
export type { AuditEvent };
