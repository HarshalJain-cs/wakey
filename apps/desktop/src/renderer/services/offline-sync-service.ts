// apps/desktop/src/renderer/services/offline-sync-service.ts
// Phase 4 Week 15: Offline Sync with IndexedDB

interface SyncItem {
    id: string;
    type: 'task' | 'goal' | 'session' | 'setting' | 'note';
    action: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
    syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';
    retryCount: number;
    lastError?: string;
}

interface ConflictResolution {
    itemId: string;
    localVersion: any;
    serverVersion: any;
    resolvedData: any;
    resolution: 'local' | 'server' | 'merged';
    resolvedAt: number;
}

interface SyncState {
    lastSyncAt: number | null;
    pendingChanges: number;
    isSyncing: boolean;
    isOnline: boolean;
    syncErrors: string[];
}

interface CacheEntry {
    key: string;
    data: any;
    expiresAt: number;
    version: number;
}

const DB_NAME = 'wakey_offline_db';
const DB_VERSION = 1;

export class OfflineSyncService {
    private db: IDBDatabase | null = null;
    private syncQueue: SyncItem[] = [];
    private isOnline = navigator.onLine;
    private syncInProgress = false;
    private listeners = new Map<string, Set<(data: any) => void>>();
    private syncInterval: number | null = null;
    private conflictQueue: ConflictResolution[] = [];

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Initialize IndexedDB
        await this.initDatabase();

        // Load pending sync items
        await this.loadPendingSyncItems();

        // Start sync interval if online
        if (this.isOnline) {
            this.startSyncInterval();
        }

        console.log('OfflineSyncService initialized');
    }

    private async initDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB opened successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Sync queue store
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
                    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                    syncStore.createIndex('type', 'type', { unique: false });
                    syncStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                }

                // Cache store for offline data
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
                }

                // Tasks store
                if (!db.objectStoreNames.contains('tasks')) {
                    const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    tasksStore.createIndex('status', 'status', { unique: false });
                    tasksStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                // Goals store
                if (!db.objectStoreNames.contains('goals')) {
                    const goalsStore = db.createObjectStore('goals', { keyPath: 'id' });
                    goalsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                // Sessions store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
                    sessionsStore.createIndex('startTime', 'startTime', { unique: false });
                }

                // Conflict resolution history
                if (!db.objectStoreNames.contains('conflicts')) {
                    const conflictsStore = db.createObjectStore('conflicts', { keyPath: 'itemId' });
                    conflictsStore.createIndex('resolvedAt', 'resolvedAt', { unique: false });
                }

                console.log('IndexedDB schema created');
            };
        });
    }

    private handleOnline(): void {
        console.log('App is online');
        this.isOnline = true;
        this.emit('connectivity', { isOnline: true });
        this.startSyncInterval();
        this.syncPendingChanges();
    }

    private handleOffline(): void {
        console.log('App is offline');
        this.isOnline = false;
        this.emit('connectivity', { isOnline: false });
        this.stopSyncInterval();
    }

    private startSyncInterval(): void {
        if (this.syncInterval) return;

        // Sync every 30 seconds
        this.syncInterval = window.setInterval(() => {
            this.syncPendingChanges();
        }, 30000);
    }

    private stopSyncInterval(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Queue a change for sync
    async queueChange(type: SyncItem['type'], action: SyncItem['action'], data: any): Promise<string> {
        const syncItem: SyncItem = {
            id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            type,
            action,
            data,
            timestamp: Date.now(),
            syncStatus: 'pending',
            retryCount: 0
        };

        this.syncQueue.push(syncItem);
        await this.saveSyncItem(syncItem);

        // Store locally
        await this.storeLocally(type, data);

        // Try to sync immediately if online
        if (this.isOnline && !this.syncInProgress) {
            this.syncPendingChanges();
        }

        this.emit('queueChange', { item: syncItem, pendingCount: this.getPendingCount() });
        return syncItem.id;
    }

    private async saveSyncItem(item: SyncItem): Promise<void> {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const request = store.put(item);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private async loadPendingSyncItems(): Promise<void> {
        if (!this.db) return;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction(['syncQueue'], 'readonly');
            const store = transaction.objectStore('syncQueue');
            const index = store.index('syncStatus');
            const request = index.getAll('pending');

            request.onsuccess = () => {
                this.syncQueue = request.result || [];
                console.log(`Loaded ${this.syncQueue.length} pending sync items`);
                resolve();
            };

            request.onerror = () => {
                console.error('Failed to load sync queue:', request.error);
                resolve();
            };
        });
    }

    // Sync pending changes to server
    async syncPendingChanges(): Promise<{ synced: number; failed: number; conflicts: number }> {
        if (!this.isOnline || this.syncInProgress) {
            return { synced: 0, failed: 0, conflicts: 0 };
        }

        this.syncInProgress = true;
        this.emit('syncStart', { pendingCount: this.getPendingCount() });

        let synced = 0;
        let failed = 0;
        let conflicts = 0;

        const pendingItems = this.syncQueue.filter(item =>
            item.syncStatus === 'pending' ||
            (item.syncStatus === 'failed' && item.retryCount < 3)
        );

        for (const item of pendingItems) {
            try {
                item.syncStatus = 'syncing';
                await this.saveSyncItem(item);

                // Simulate sync (replace with actual API call)
                const result = await this.syncItemToServer(item);

                if (result.success) {
                    item.syncStatus = 'synced';
                    synced++;
                } else if (result.conflict) {
                    item.syncStatus = 'conflict';
                    conflicts++;
                    await this.handleConflict(item, result.serverData);
                } else {
                    throw new Error(result.error || 'Unknown sync error');
                }
            } catch (error) {
                item.syncStatus = 'failed';
                item.retryCount++;
                item.lastError = error instanceof Error ? error.message : String(error);
                failed++;
            }

            await this.saveSyncItem(item);
        }

        this.syncInProgress = false;
        this.emit('syncComplete', { synced, failed, conflicts });

        return { synced, failed, conflicts };
    }

    private async syncItemToServer(item: SyncItem): Promise<{ success: boolean; conflict?: boolean; serverData?: any; error?: string }> {
        // Simulate API sync
        // In real implementation, this would call the backend API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve({ success: true });
                } else if (Math.random() > 0.5) {
                    resolve({ success: false, conflict: true, serverData: { ...item.data, serverVersion: true } });
                } else {
                    resolve({ success: false, error: 'Network error' });
                }
            }, 100 + Math.random() * 200);
        });
    }

    // Conflict resolution
    private async handleConflict(item: SyncItem, serverData: any): Promise<void> {
        // Default strategy: last-write-wins
        const localTimestamp = item.timestamp;
        const serverTimestamp = serverData.updatedAt || 0;

        let resolution: ConflictResolution['resolution'];
        let resolvedData: any;

        if (localTimestamp > serverTimestamp) {
            resolution = 'local';
            resolvedData = item.data;
        } else {
            resolution = 'server';
            resolvedData = serverData;
        }

        const conflictResolution: ConflictResolution = {
            itemId: item.id,
            localVersion: item.data,
            serverVersion: serverData,
            resolvedData,
            resolution,
            resolvedAt: Date.now()
        };

        this.conflictQueue.push(conflictResolution);
        await this.saveConflictResolution(conflictResolution);

        // Update local data with resolved version
        await this.storeLocally(item.type, resolvedData);

        this.emit('conflictResolved', conflictResolution);
    }

    private async saveConflictResolution(resolution: ConflictResolution): Promise<void> {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['conflicts'], 'readwrite');
            const store = transaction.objectStore('conflicts');
            const request = store.put(resolution);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Store data locally
    private async storeLocally(type: SyncItem['type'], data: any): Promise<void> {
        if (!this.db) return;

        const storeName = this.getStoreName(type);
        if (!storeName) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ ...data, updatedAt: Date.now() });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private getStoreName(type: SyncItem['type']): string | null {
        const storeMap: Record<string, string> = {
            task: 'tasks',
            goal: 'goals',
            session: 'sessions'
        };
        return storeMap[type] || null;
    }

    // Get data from local cache
    async getLocal<T>(type: SyncItem['type'], id: string): Promise<T | null> {
        if (!this.db) return null;

        const storeName = this.getStoreName(type);
        if (!storeName) return null;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        });
    }

    // Get all items of a type
    async getAllLocal<T>(type: SyncItem['type']): Promise<T[]> {
        if (!this.db) return [];

        const storeName = this.getStoreName(type);
        if (!storeName) return [];

        return new Promise((resolve) => {
            const transaction = this.db!.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    }

    // Cache API responses
    async cacheResponse(key: string, data: any, ttlSeconds: number = 3600): Promise<void> {
        if (!this.db) return;

        const entry: CacheEntry = {
            key,
            data,
            expiresAt: Date.now() + (ttlSeconds * 1000),
            version: 1
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.put(entry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getCachedResponse<T>(key: string): Promise<T | null> {
        if (!this.db) return null;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);

            request.onsuccess = () => {
                const entry = request.result as CacheEntry | undefined;
                if (!entry || Date.now() > entry.expiresAt) {
                    resolve(null);
                } else {
                    resolve(entry.data as T);
                }
            };

            request.onerror = () => resolve(null);
        });
    }

    // Clear expired cache entries
    async clearExpiredCache(): Promise<number> {
        if (!this.db) return 0;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const index = store.index('expiresAt');
            const now = Date.now();
            let deleted = 0;

            const range = IDBKeyRange.upperBound(now);
            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    cursor.delete();
                    deleted++;
                    cursor.continue();
                } else {
                    resolve(deleted);
                }
            };

            request.onerror = () => resolve(deleted);
        });
    }

    // Get sync state
    getSyncState(): SyncState {
        return {
            lastSyncAt: this.getLastSyncTime(),
            pendingChanges: this.getPendingCount(),
            isSyncing: this.syncInProgress,
            isOnline: this.isOnline,
            syncErrors: this.syncQueue
                .filter(item => item.syncStatus === 'failed')
                .map(item => item.lastError || 'Unknown error')
        };
    }

    private getLastSyncTime(): number | null {
        const syncedItems = this.syncQueue.filter(item => item.syncStatus === 'synced');
        if (syncedItems.length === 0) return null;
        return Math.max(...syncedItems.map(item => item.timestamp));
    }

    private getPendingCount(): number {
        return this.syncQueue.filter(item =>
            item.syncStatus === 'pending' || item.syncStatus === 'failed'
        ).length;
    }

    // Force sync
    async forceSync(): Promise<{ synced: number; failed: number; conflicts: number }> {
        return this.syncPendingChanges();
    }

    // Event system
    on(event: string, callback: (data: any) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);

        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    private emit(event: string, data: any): void {
        this.listeners.get(event)?.forEach(callback => callback(data));
    }

    // Cleanup
    destroy(): void {
        this.stopSyncInterval();
        window.removeEventListener('online', () => this.handleOnline());
        window.removeEventListener('offline', () => this.handleOffline());
        this.listeners.clear();
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

export const offlineSyncService = new OfflineSyncService();
