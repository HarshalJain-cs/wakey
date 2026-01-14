import { BrowserWindow } from 'electron';
export interface UpdateConfig {
    autoDownload: boolean;
    autoInstallOnAppQuit: boolean;
    allowPrerelease: boolean;
    checkInterval: number;
}
export declare function initAutoUpdater(window: BrowserWindow, config?: Partial<UpdateConfig>): void;
export declare function checkForUpdates(): Promise<void>;
export declare function stopPeriodicChecks(): void;
export declare function cleanup(): void;
//# sourceMappingURL=auto-updater.d.ts.map