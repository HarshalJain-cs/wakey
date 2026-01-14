import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getConfig, updateConfig, getStatus, getUser, markPendingChange, } from '../services/sync-service';
describe('Sync Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('Configuration', () => {
        it('should return default config', () => {
            const config = getConfig();
            expect(config).toHaveProperty('supabaseUrl');
            expect(config).toHaveProperty('supabaseKey');
            expect(config).toHaveProperty('autoSync');
            expect(config).toHaveProperty('syncInterval');
        });
        it('should update config partially', async () => {
            await updateConfig({ autoSync: false });
            const config = getConfig();
            expect(config.autoSync).toBe(false);
        });
        it('should update sync interval', async () => {
            await updateConfig({ syncInterval: 30 });
            const config = getConfig();
            expect(config.syncInterval).toBe(30);
        });
    });
    describe('Status', () => {
        it('should return status object', () => {
            const status = getStatus();
            expect(status).toHaveProperty('isAuthenticated');
            expect(status).toHaveProperty('lastSyncAt');
            expect(status).toHaveProperty('isSyncing');
            expect(status).toHaveProperty('error');
            expect(status).toHaveProperty('pendingChanges');
        });
        it('should start not authenticated', () => {
            const status = getStatus();
            expect(status.isAuthenticated).toBe(false);
        });
    });
    describe('User', () => {
        it('should return null when not authenticated', () => {
            const user = getUser();
            expect(user).toBeNull();
        });
    });
    describe('Pending Changes', () => {
        it('should increment pending changes', () => {
            const before = getStatus().pendingChanges;
            markPendingChange();
            const after = getStatus().pendingChanges;
            expect(after).toBe(before + 1);
        });
    });
});
//# sourceMappingURL=sync-service.test.js.map