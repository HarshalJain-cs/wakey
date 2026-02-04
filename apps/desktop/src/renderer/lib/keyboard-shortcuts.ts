// apps/desktop/src/renderer/lib/keyboard-shortcuts.ts
// Phase 19: Production Polish - Global Keyboard Shortcuts

/**
 * Global Keyboard Shortcuts Service
 * 
 * Provides consistent keyboard shortcuts across the application
 * with customization support and conflict detection.
 */

export interface Shortcut {
    id: string;
    name: string;
    description: string;
    keys: string[];
    category: ShortcutCategory;
    action: () => void;
    enabled: boolean;
    customizable: boolean;
}

export type ShortcutCategory =
    | 'navigation'
    | 'focus'
    | 'tasks'
    | 'general'
    | 'accessibility';

interface KeyboardShortcutsConfig {
    enabled: boolean;
    customMappings: Record<string, string[]>;
}

class KeyboardShortcutsService {
    private shortcuts: Map<string, Shortcut> = new Map();
    private config: KeyboardShortcutsConfig = { enabled: true, customMappings: {} };
    private listeners: Map<string, (e: KeyboardEvent) => void> = new Map();
    private readonly STORAGE_KEY = 'wakey-keyboard-shortcuts';

    constructor() {
        this.loadConfig();
        this.initializeShortcuts();
        this.setupGlobalListener();
    }

    private initializeShortcuts() {
        // Navigation shortcuts
        this.registerShortcut({
            id: 'nav-dashboard',
            name: 'Go to Dashboard',
            description: 'Navigate to the main dashboard',
            keys: ['Ctrl', 'Shift', 'D'],
            category: 'navigation',
            action: () => this.navigateTo('/'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'nav-settings',
            name: 'Open Settings',
            description: 'Navigate to settings page',
            keys: ['Ctrl', ','],
            category: 'navigation',
            action: () => this.navigateTo('/settings'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'nav-reports',
            name: 'Go to Reports',
            description: 'Navigate to analytics reports',
            keys: ['Ctrl', 'Shift', 'R'],
            category: 'navigation',
            action: () => this.navigateTo('/reports'),
            enabled: true,
            customizable: true
        });

        // Focus shortcuts
        this.registerShortcut({
            id: 'focus-start',
            name: 'Start Focus Session',
            description: 'Start or resume a focus session',
            keys: ['Ctrl', 'Shift', 'F'],
            category: 'focus',
            action: () => this.dispatchEvent('focus:start'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'focus-stop',
            name: 'Stop Focus Session',
            description: 'Stop the current focus session',
            keys: ['Ctrl', 'Shift', 'S'],
            category: 'focus',
            action: () => this.dispatchEvent('focus:stop'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'focus-break',
            name: 'Take a Break',
            description: 'Start a short break',
            keys: ['Ctrl', 'Shift', 'B'],
            category: 'focus',
            action: () => this.dispatchEvent('focus:break'),
            enabled: true,
            customizable: true
        });

        // Task shortcuts
        this.registerShortcut({
            id: 'task-new',
            name: 'New Task',
            description: 'Create a new task quickly',
            keys: ['Ctrl', 'N'],
            category: 'tasks',
            action: () => this.dispatchEvent('task:new'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'task-complete',
            name: 'Complete Task',
            description: 'Mark selected task as complete',
            keys: ['Ctrl', 'Enter'],
            category: 'tasks',
            action: () => this.dispatchEvent('task:complete'),
            enabled: true,
            customizable: true
        });

        // General shortcuts
        this.registerShortcut({
            id: 'command-palette',
            name: 'Command Palette',
            description: 'Open the command palette',
            keys: ['Ctrl', 'K'],
            category: 'general',
            action: () => this.dispatchEvent('command-palette:open'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'search',
            name: 'Search',
            description: 'Focus the search input',
            keys: ['Ctrl', '/'],
            category: 'general',
            action: () => this.dispatchEvent('search:focus'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'toggle-sidebar',
            name: 'Toggle Sidebar',
            description: 'Show or hide the sidebar',
            keys: ['Ctrl', 'B'],
            category: 'general',
            action: () => this.dispatchEvent('sidebar:toggle'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'toggle-dark-mode',
            name: 'Toggle Dark Mode',
            description: 'Switch between light and dark modes',
            keys: ['Ctrl', 'Shift', 'L'],
            category: 'accessibility',
            action: () => this.dispatchEvent('theme:toggle'),
            enabled: true,
            customizable: true
        });

        this.registerShortcut({
            id: 'help',
            name: 'Help & Shortcuts',
            description: 'Show keyboard shortcuts reference',
            keys: ['?'],
            category: 'general',
            action: () => this.dispatchEvent('help:shortcuts'),
            enabled: true,
            customizable: false
        });
    }

    // ============================================
    // Public API
    // ============================================

    registerShortcut(shortcut: Shortcut): void {
        // Apply custom mapping if exists
        if (this.config.customMappings[shortcut.id]) {
            shortcut.keys = this.config.customMappings[shortcut.id];
        }
        this.shortcuts.set(shortcut.id, shortcut);
    }

    unregisterShortcut(id: string): void {
        this.shortcuts.delete(id);
    }

    getShortcut(id: string): Shortcut | undefined {
        return this.shortcuts.get(id);
    }

    getShortcuts(): Shortcut[] {
        return Array.from(this.shortcuts.values());
    }

    getShortcutsByCategory(category: ShortcutCategory): Shortcut[] {
        return this.getShortcuts().filter(s => s.category === category);
    }

    setCustomMapping(id: string, keys: string[]): boolean {
        const shortcut = this.shortcuts.get(id);
        if (!shortcut || !shortcut.customizable) return false;

        // Check for conflicts
        const conflict = this.findConflict(keys, id);
        if (conflict) {
            console.warn(`Shortcut conflict with: ${conflict.name}`);
            return false;
        }

        this.config.customMappings[id] = keys;
        shortcut.keys = keys;
        this.shortcuts.set(id, shortcut);
        this.saveConfig();
        return true;
    }

    resetToDefaults(): void {
        this.config.customMappings = {};
        this.initializeShortcuts();
        this.saveConfig();
    }

    enable(): void {
        this.config.enabled = true;
        this.saveConfig();
    }

    disable(): void {
        this.config.enabled = false;
        this.saveConfig();
    }

    isEnabled(): boolean {
        return this.config.enabled;
    }

    // ============================================
    // Internal Methods
    // ============================================

    private setupGlobalListener() {
        document.addEventListener('keydown', (e) => {
            if (!this.config.enabled) return;

            // Build key combo string
            const keys: string[] = [];
            if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
            if (e.altKey) keys.push('Alt');
            if (e.shiftKey) keys.push('Shift');

            // Add the actual key
            if (e.key && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
                keys.push(e.key.toUpperCase());
            }

            // Find matching shortcut
            for (const shortcut of this.shortcuts.values()) {
                if (!shortcut.enabled) continue;

                const shortcutKeys = shortcut.keys.map(k => k.toUpperCase());
                const pressedKeys = keys.map(k => k.toUpperCase());

                if (this.arraysEqual(shortcutKeys, pressedKeys)) {
                    e.preventDefault();
                    e.stopPropagation();
                    shortcut.action();
                    return;
                }
            }
        });
    }

    private arraysEqual(a: string[], b: string[]): boolean {
        if (a.length !== b.length) return false;
        return a.every((val, i) => val === b[i]);
    }

    private findConflict(keys: string[], excludeId: string): Shortcut | null {
        const normalizedKeys = keys.map(k => k.toUpperCase()).sort();

        for (const shortcut of this.shortcuts.values()) {
            if (shortcut.id === excludeId) continue;
            const shortcutKeys = shortcut.keys.map(k => k.toUpperCase()).sort();
            if (this.arraysEqual(normalizedKeys, shortcutKeys)) {
                return shortcut;
            }
        }
        return null;
    }

    private navigateTo(path: string) {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
    }

    private dispatchEvent(eventName: string, detail?: Record<string, unknown>) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    // ============================================
    // Persistence
    // ============================================

    private loadConfig() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.config = { ...this.config, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load keyboard shortcuts config:', error);
        }
    }

    private saveConfig() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
        } catch (error) {
            console.error('Failed to save keyboard shortcuts config:', error);
        }
    }

    // ============================================
    // Helper: Format keys for display
    // ============================================

    formatKeys(keys: string[]): string {
        return keys.map(key => {
            if (key === 'Ctrl') return '⌃';
            if (key === 'Alt') return '⌥';
            if (key === 'Shift') return '⇧';
            if (key === 'Meta' || key === 'Cmd') return '⌘';
            if (key === 'Enter') return '↵';
            if (key === 'Backspace') return '⌫';
            if (key === 'Escape') return 'Esc';
            return key;
        }).join('');
    }
}

export const keyboardShortcutsService = new KeyboardShortcutsService();
export default keyboardShortcutsService;
