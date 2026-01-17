/**
 * @fileoverview Multi-Device Sync Service
 * 
 * Cloud sync for settings and data across devices:
 * - Settings synchronization
 * - Goal progress sync
 * - Streak sync
 * - Conflict resolution
 */

export interface SyncConfig {
    enabled: boolean;
    provider: 'local' | 'google-drive' | 'dropbox' | 'custom';
    lastSyncTime: Date | null;
    syncInterval: number; // minutes
    autoSync: boolean;
    syncItems: SyncItem[];
}

export interface SyncItem {
    id: string;
    name: string;
    type: 'settings' | 'goals' | 'streaks' | 'journal' | 'tasks' | 'preferences';
    enabled: boolean;
    lastSynced: Date | null;
    status: 'synced' | 'pending' | 'conflict' | 'error';
}

export interface SyncConflict {
    itemId: string;
    localData: unknown;
    remoteData: unknown;
    localTimestamp: Date;
    remoteTimestamp: Date;
    resolved: boolean;
}

export interface DeviceInfo {
    id: string;
    name: string;
    platform: string;
    lastSeen: Date;
    isCurrentDevice: boolean;
}

// Default sync items
const DEFAULT_SYNC_ITEMS: SyncItem[] = [
    { id: 'settings', name: 'App Settings', type: 'settings', enabled: true, lastSynced: null, status: 'pending' },
    { id: 'goals', name: 'Goals & Progress', type: 'goals', enabled: true, lastSynced: null, status: 'pending' },
    { id: 'streaks', name: 'Productivity Streaks', type: 'streaks', enabled: true, lastSynced: null, status: 'pending' },
    { id: 'journal', name: 'Daily Journal', type: 'journal', enabled: true, lastSynced: null, status: 'pending' },
    { id: 'tasks', name: 'Tasks & Projects', type: 'tasks', enabled: true, lastSynced: null, status: 'pending' },
    { id: 'preferences', name: 'UI Preferences', type: 'preferences', enabled: true, lastSynced: null, status: 'pending' },
];

class MultiDeviceSyncService {
    private config: SyncConfig;
    private devices: DeviceInfo[] = [];
    private conflicts: SyncConflict[] = [];
    private deviceId: string;

    constructor() {
        this.deviceId = this.getOrCreateDeviceId();
        this.config = this.loadConfig();
        this.registerDevice();
    }

    private getOrCreateDeviceId(): string {
        let deviceId = localStorage.getItem('wakey_device_id');
        if (!deviceId) {
            deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('wakey_device_id', deviceId);
        }
        return deviceId;
    }

    private loadConfig(): SyncConfig {
        try {
            const stored = localStorage.getItem('wakey_sync_config');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load sync config:', error);
        }

        return {
            enabled: false,
            provider: 'local',
            lastSyncTime: null,
            syncInterval: 30,
            autoSync: true,
            syncItems: DEFAULT_SYNC_ITEMS,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_sync_config', JSON.stringify(this.config));
    }

    private registerDevice(): void {
        const currentDevice: DeviceInfo = {
            id: this.deviceId,
            name: this.getDeviceName(),
            platform: navigator.platform,
            lastSeen: new Date(),
            isCurrentDevice: true,
        };

        const existingIndex = this.devices.findIndex(d => d.id === this.deviceId);
        if (existingIndex >= 0) {
            this.devices[existingIndex] = currentDevice;
        } else {
            this.devices.push(currentDevice);
        }
    }

    private getDeviceName(): string {
        const platform = navigator.platform.toLowerCase();
        if (platform.includes('win')) return 'Windows PC';
        if (platform.includes('mac')) return 'Mac';
        if (platform.includes('linux')) return 'Linux';
        return 'Unknown Device';
    }

    /**
     * Check if sync is enabled
     */
    isEnabled(): boolean {
        return this.config.enabled;
    }

    /**
     * Enable sync
     */
    enable(provider: SyncConfig['provider']): void {
        this.config.enabled = true;
        this.config.provider = provider;
        this.saveConfig();
    }

    /**
     * Disable sync
     */
    disable(): void {
        this.config.enabled = false;
        this.saveConfig();
    }

    /**
     * Get sync config
     */
    getConfig(): SyncConfig {
        return { ...this.config };
    }

    /**
     * Update sync config
     */
    updateConfig(updates: Partial<SyncConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }

    /**
     * Get sync items
     */
    getSyncItems(): SyncItem[] {
        return this.config.syncItems;
    }

    /**
     * Toggle sync item
     */
    toggleSyncItem(itemId: string, enabled: boolean): void {
        const item = this.config.syncItems.find(i => i.id === itemId);
        if (item) {
            item.enabled = enabled;
            this.saveConfig();
        }
    }

    /**
     * Perform sync
     */
    async performSync(): Promise<{ success: boolean; itemsSynced: number; errors: string[] }> {
        if (!this.config.enabled) {
            return { success: false, itemsSynced: 0, errors: ['Sync is disabled'] };
        }

        const errors: string[] = [];
        let itemsSynced = 0;

        for (const item of this.config.syncItems.filter(i => i.enabled)) {
            try {
                // Simulate sync
                await this.syncItem(item);
                item.lastSynced = new Date();
                item.status = 'synced';
                itemsSynced++;
            } catch (error) {
                item.status = 'error';
                errors.push(`Failed to sync ${item.name}: ${error}`);
            }
        }

        this.config.lastSyncTime = new Date();
        this.saveConfig();

        return {
            success: errors.length === 0,
            itemsSynced,
            errors,
        };
    }

    private async syncItem(item: SyncItem): Promise<void> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // In real implementation, would:
        // 1. Get local data
        // 2. Get remote data
        // 3. Compare timestamps
        // 4. Merge or detect conflicts
        // 5. Push/pull as needed

        console.log(`Syncing ${item.name}...`);
    }

    /**
     * Get registered devices
     */
    getDevices(): DeviceInfo[] {
        return this.devices;
    }

    /**
     * Get current device
     */
    getCurrentDevice(): DeviceInfo | undefined {
        return this.devices.find(d => d.isCurrentDevice);
    }

    /**
     * Get conflicts
     */
    getConflicts(): SyncConflict[] {
        return this.conflicts;
    }

    /**
     * Resolve conflict
     */
    resolveConflict(itemId: string, useLocal: boolean): void {
        const conflict = this.conflicts.find(c => c.itemId === itemId);
        if (conflict) {
            conflict.resolved = true;
            // Would apply the chosen version
            console.log(`Resolved conflict for ${itemId}, using ${useLocal ? 'local' : 'remote'} version`);
        }
    }

    /**
     * Get sync status
     */
    getSyncStatus(): {
        overallStatus: 'synced' | 'syncing' | 'pending' | 'error';
        lastSync: Date | null;
        pendingItems: number;
        errorItems: number;
    } {
        const items = this.config.syncItems.filter(i => i.enabled);
        const pendingItems = items.filter(i => i.status === 'pending').length;
        const errorItems = items.filter(i => i.status === 'error').length;

        let overallStatus: 'synced' | 'syncing' | 'pending' | 'error' = 'synced';
        if (errorItems > 0) overallStatus = 'error';
        else if (pendingItems > 0) overallStatus = 'pending';

        return {
            overallStatus,
            lastSync: this.config.lastSyncTime,
            pendingItems,
            errorItems,
        };
    }

    /**
     * Export data for backup
     */
    exportData(): string {
        const data = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            deviceId: this.deviceId,
            // Would include all synced data
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from backup
     */
    importData(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);
            console.log('Importing data from:', data.exportedAt);
            // Would merge/replace local data
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}

export const multiDeviceSyncService = new MultiDeviceSyncService();
export default multiDeviceSyncService;
