/**
 * @fileoverview Plugin System Service
 * 
 * Extensible plugin architecture for third-party extensions:
 * - Plugin registration and lifecycle
 * - Hooks for extending functionality
 * - Sandboxed execution
 */

export interface Plugin {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    enabled: boolean;
    hooks: PluginHook[];
    settings?: Record<string, unknown>;
}

export interface PluginHook {
    event: PluginEvent;
    handler: string; // Function name or code
}

export type PluginEvent =
    | 'onAppStart'
    | 'onAppClose'
    | 'onFocusSessionStart'
    | 'onFocusSessionEnd'
    | 'onBreakStart'
    | 'onBreakEnd'
    | 'onTaskComplete'
    | 'onGoalProgress'
    | 'onDistractionDetected'
    | 'onDeepWorkAchieved'
    | 'onDailyReport';

export interface PluginAPI {
    // Storage
    getStorage: (key: string) => unknown;
    setStorage: (key: string, value: unknown) => void;

    // Notifications
    showNotification: (title: string, body: string) => void;

    // Data access (read-only)
    getTodayStats: () => { focusMinutes: number; distractionMinutes: number; focusScore: number };
    getCurrentSession: () => { type: string; duration: number } | null;

    // UI
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;

    // Logging
    log: (message: string) => void;
}

// Built-in example plugins
const EXAMPLE_PLUGINS: Plugin[] = [
    {
        id: 'daily-quote-reminder',
        name: 'Daily Quote Reminder',
        version: '1.0.0',
        author: 'Wakey Team',
        description: 'Shows an inspirational quote when you start your first focus session',
        enabled: true,
        hooks: [
            { event: 'onFocusSessionStart', handler: 'showDailyQuote' },
        ],
    },
    {
        id: 'streak-notification',
        name: 'Streak Notifications',
        version: '1.0.0',
        author: 'Wakey Team',
        description: 'Celebrates your focus streaks with fun notifications',
        enabled: true,
        hooks: [
            { event: 'onGoalProgress', handler: 'checkStreak' },
        ],
    },
    {
        id: 'deep-work-celebration',
        name: 'Deep Work Celebration',
        version: '1.0.0',
        author: 'Wakey Team',
        description: 'Celebrates when you achieve a deep work session',
        enabled: true,
        hooks: [
            { event: 'onDeepWorkAchieved', handler: 'celebrate' },
        ],
    },
];

class PluginSystemService {
    private plugins: Plugin[] = [];
    private eventListeners: Map<PluginEvent, Function[]> = new Map();
    private pluginStorage: Map<string, Record<string, unknown>> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_plugins');
            if (stored) {
                const data = JSON.parse(stored);
                this.plugins = data.plugins || EXAMPLE_PLUGINS;
                this.pluginStorage = new Map(Object.entries(data.storage || {}));
            } else {
                this.plugins = EXAMPLE_PLUGINS;
            }
        } catch (error) {
            console.error('Failed to load plugins:', error);
            this.plugins = EXAMPLE_PLUGINS;
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_plugins', JSON.stringify({
            plugins: this.plugins,
            storage: Object.fromEntries(this.pluginStorage),
        }));
    }

    /**
     * Get all plugins
     */
    getAllPlugins(): Plugin[] {
        return this.plugins;
    }

    /**
     * Get enabled plugins
     */
    getEnabledPlugins(): Plugin[] {
        return this.plugins.filter(p => p.enabled);
    }

    /**
     * Get plugin by ID
     */
    getPlugin(id: string): Plugin | undefined {
        return this.plugins.find(p => p.id === id);
    }

    /**
     * Register a new plugin
     */
    registerPlugin(plugin: Omit<Plugin, 'enabled'>): Plugin {
        const newPlugin: Plugin = {
            ...plugin,
            enabled: true,
        };

        // Check for duplicate
        const existingIndex = this.plugins.findIndex(p => p.id === plugin.id);
        if (existingIndex >= 0) {
            this.plugins[existingIndex] = newPlugin;
        } else {
            this.plugins.push(newPlugin);
        }

        this.saveToStorage();
        return newPlugin;
    }

    /**
     * Enable/disable plugin
     */
    setPluginEnabled(id: string, enabled: boolean): void {
        const plugin = this.getPlugin(id);
        if (plugin) {
            plugin.enabled = enabled;
            this.saveToStorage();
        }
    }

    /**
     * Uninstall plugin
     */
    uninstallPlugin(id: string): void {
        this.plugins = this.plugins.filter(p => p.id !== id);
        this.pluginStorage.delete(id);
        this.saveToStorage();
    }

    /**
     * Trigger an event for all enabled plugins
     */
    triggerEvent(event: PluginEvent, data?: unknown): void {
        const enabledPlugins = this.getEnabledPlugins();

        enabledPlugins.forEach(plugin => {
            const hooks = plugin.hooks.filter(h => h.event === event);

            hooks.forEach(hook => {
                try {
                    // In a real implementation, this would execute the handler
                    // For now, just log it
                    console.log(`[Plugin: ${plugin.name}] Triggered ${event}:`, hook.handler);

                    // Notify listeners
                    const listeners = this.eventListeners.get(event) || [];
                    listeners.forEach(listener => listener(plugin, data));
                } catch (error) {
                    console.error(`Plugin ${plugin.name} error on ${event}:`, error);
                }
            });
        });
    }

    /**
     * Subscribe to plugin events
     */
    on(event: PluginEvent, callback: Function): () => void {
        const listeners = this.eventListeners.get(event) || [];
        listeners.push(callback);
        this.eventListeners.set(event, listeners);

        // Return unsubscribe function
        return () => {
            const current = this.eventListeners.get(event) || [];
            this.eventListeners.set(event, current.filter(l => l !== callback));
        };
    }

    /**
     * Get plugin storage
     */
    getPluginStorage(pluginId: string): Record<string, unknown> {
        return this.pluginStorage.get(pluginId) || {};
    }

    /**
     * Set plugin storage
     */
    setPluginStorage(pluginId: string, key: string, value: unknown): void {
        const storage = this.pluginStorage.get(pluginId) || {};
        storage[key] = value;
        this.pluginStorage.set(pluginId, storage);
        this.saveToStorage();
    }

    /**
     * Create API for plugin
     */
    createPluginAPI(pluginId: string): PluginAPI {
        return {
            getStorage: (key) => this.getPluginStorage(pluginId)[key],
            setStorage: (key, value) => this.setPluginStorage(pluginId, key, value),
            showNotification: (title, body) => {
                console.log(`[Plugin Notification] ${title}: ${body}`);
                // Would use Notification API
            },
            getTodayStats: () => ({ focusMinutes: 0, distractionMinutes: 0, focusScore: 0 }),
            getCurrentSession: () => null,
            showToast: (message, type) => {
                console.log(`[Toast: ${type}] ${message}`);
            },
            log: (message) => {
                console.log(`[Plugin: ${pluginId}] ${message}`);
            },
        };
    }

    /**
     * Get available events
     */
    getAvailableEvents(): PluginEvent[] {
        return [
            'onAppStart', 'onAppClose',
            'onFocusSessionStart', 'onFocusSessionEnd',
            'onBreakStart', 'onBreakEnd',
            'onTaskComplete', 'onGoalProgress',
            'onDistractionDetected', 'onDeepWorkAchieved',
            'onDailyReport',
        ];
    }
}

export const pluginSystemService = new PluginSystemService();
export default pluginSystemService;
