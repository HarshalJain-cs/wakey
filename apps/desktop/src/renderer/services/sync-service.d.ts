export interface SyncConfig {
    supabaseUrl: string;
    supabaseKey: string;
    autoSync: boolean;
    syncInterval: number;
}
export interface SyncStatus {
    isAuthenticated: boolean;
    lastSyncAt: string | null;
    isSyncing: boolean;
    error: string | null;
    pendingChanges: number;
}
export interface UserProfile {
    id: string;
    email: string;
    createdAt: string;
}
export declare function getConfig(): SyncConfig;
export declare function updateConfig(newConfig: Partial<SyncConfig>): Promise<void>;
export declare function loadConfig(): Promise<void>;
/**
 * Sign in with email and password
 * In production, this would call Supabase Auth
 */
export declare function signIn(email: string, password: string): Promise<boolean>;
/**
 * Sign out and clear session
 */
export declare function signOut(): Promise<void>;
/**
 * Check if user is authenticated (from saved session)
 */
export declare function checkAuth(): Promise<boolean>;
/**
 * Sync all data to cloud
 */
export declare function syncToCloud(): Promise<boolean>;
/**
 * Download data from cloud and merge with local
 */
export declare function syncFromCloud(): Promise<boolean>;
export declare function getStatus(): SyncStatus;
export declare function getUser(): UserProfile | null;
export declare function markPendingChange(): void;
export declare function initialize(): Promise<void>;
//# sourceMappingURL=sync-service.d.ts.map