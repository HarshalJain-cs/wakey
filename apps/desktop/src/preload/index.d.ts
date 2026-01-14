declare global {
    interface Window {
        wakey: {
            minimize: () => Promise<void>;
            maximize: () => Promise<void>;
            close: () => Promise<void>;
            getSettings: () => Promise<Record<string, unknown>>;
            setSetting: (key: string, value: unknown) => Promise<boolean>;
            getTrackingStatus: () => Promise<boolean>;
            setTrackingStatus: (status: boolean) => Promise<boolean>;
            getTodayActivities: () => Promise<unknown[]>;
            getTodayStats: () => Promise<{
                focusTime: number;
                sessions: number;
                distractions: number;
                topApps: {
                    app: string;
                    minutes: number;
                }[];
            }>;
            getCurrentActivity: () => Promise<{
                app: string;
                category: string;
            } | null>;
            startFocusSession: (type: 'focus' | 'break', duration: number) => Promise<number>;
            endFocusSession: (id: number, quality: number, distractions: number) => Promise<void>;
            getTasks: () => Promise<unknown[]>;
            createTask: (title: string, priority: string) => Promise<number>;
            updateTaskStatus: (id: number, status: string) => Promise<void>;
            deleteTask: (id: number) => Promise<void>;
            getNotes: () => Promise<any[]>;
            saveNotes: (notes: any[]) => Promise<boolean>;
            getKnowledgeGraph: () => Promise<{
                nodes: any[];
                edges: any[];
            }>;
            saveKnowledgeGraph: (data: {
                nodes: any[];
                edges: any[];
            }) => Promise<boolean>;
            getFlashcards: () => Promise<any[]>;
            saveFlashcards: (cards: any[]) => Promise<boolean>;
            getAgentTasks: () => Promise<any[]>;
            saveAgentTasks: (tasks: any[]) => Promise<boolean>;
            onTrackingToggle: (callback: (status: boolean) => void) => void;
            onFocusStart: (callback: () => void) => void;
            onNavigate: (callback: (route: string) => void) => void;
            onActivityUpdate: (callback: (activity: {
                app: string;
                title: string;
                category: string;
                isDistraction: boolean;
            }) => void) => void;
            onDistractionDetected: (callback: (data: {
                app: string;
                title: string;
            }) => void) => void;
            checkForUpdates: () => Promise<any>;
            downloadUpdate: () => Promise<boolean>;
            installUpdate: () => Promise<void>;
            getAppVersion: () => Promise<string>;
            getUpdateConfig: () => Promise<{
                autoDownload: boolean;
                autoInstallOnAppQuit: boolean;
                allowPrerelease: boolean;
                checkInterval: number;
            }>;
            setUpdateConfig: (config: {
                autoDownload?: boolean;
                autoInstallOnAppQuit?: boolean;
                allowPrerelease?: boolean;
                checkInterval?: number;
            }) => Promise<any>;
            onUpdateStatus: (callback: (status: {
                status: string;
                version?: string;
                percent?: number;
                error?: string;
            }) => void) => void;
            removeAllListeners: (channel: string) => void;
        };
    }
}
export {};
//# sourceMappingURL=index.d.ts.map