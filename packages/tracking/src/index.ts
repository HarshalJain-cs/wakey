// Activity Tracking Module for Wakey
// Uses active-win to detect current window (Windows/macOS/Linux)

export interface ActiveWindow {
    title: string;
    id: number;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    owner: {
        name: string;
        processId: number;
        path: string;
    };
    url?: string;
}

// Will be implemented with active-win package
export async function getActiveWindow(): Promise<ActiveWindow | null> {
    try {
        // Dynamic import for active-win (ESM)
        const activeWin = await import('active-win');
        const window = await activeWin.default();

        if (!window) return null;

        return {
            title: window.title,
            id: window.id,
            bounds: window.bounds,
            owner: window.owner,
            url: (window as any).url, // Only available for browsers
        };
    } catch (error) {
        console.error('Failed to get active window:', error);
        return null;
    }
}

// Idle detection
let lastActivityTime = Date.now();

export function updateLastActivityTime(): void {
    lastActivityTime = Date.now();
}

export function getIdleTime(): number {
    return Date.now() - lastActivityTime;
}

export function isIdle(thresholdMs: number = 5 * 60 * 1000): boolean {
    return getIdleTime() > thresholdMs;
}

// Screenshot capture (optional feature - requires screenshot-desktop package)
export async function captureScreenshot(savePath: string): Promise<boolean> {
    try {
        // Dynamic import - will fail gracefully if package not installed
        const screenshotModule = await import('screenshot-desktop').catch(() => null);
        if (!screenshotModule) {
            console.warn('screenshot-desktop not installed, skipping screenshot capture');
            return false;
        }

        const img = await screenshotModule.default({ format: 'png' });

        // Write to file
        const fs = await import('fs/promises');
        const path = await import('path');

        // Ensure directory exists
        const dir = path.dirname(savePath);
        await fs.mkdir(dir, { recursive: true });

        await fs.writeFile(savePath, img);
        console.log('Screenshot saved:', savePath);
        return true;
    } catch (error) {
        console.error('Screenshot capture failed:', error);
        return false;
    }
}

// Capture screenshot with timestamp filename
export async function captureTimestampedScreenshot(directory: string): Promise<string | null> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${timestamp}.png`;
    const path = await import('path');
    const savePath = path.join(directory, filename);

    const success = await captureScreenshot(savePath);
    return success ? savePath : null;
}

// Activity change detection
export interface ActivityChange {
    previous: ActiveWindow | null;
    current: ActiveWindow | null;
    isContextSwitch: boolean;
    timestamp: number;
}

let previousWindow: ActiveWindow | null = null;

export async function detectActivityChange(): Promise<ActivityChange | null> {
    const current = await getActiveWindow();

    if (!previousWindow && !current) return null;

    const isContextSwitch = previousWindow?.owner.name !== current?.owner.name;

    const change: ActivityChange = {
        previous: previousWindow,
        current,
        isContextSwitch,
        timestamp: Date.now(),
    };

    previousWindow = current;

    return change;
}

// Tracking loop
let trackingInterval: NodeJS.Timeout | null = null;
let isTracking = false;

export type ActivityCallback = (activity: ActiveWindow) => void;

export function startTracking(
    callback: ActivityCallback,
    intervalMs: number = 5000
): void {
    if (isTracking) return;

    isTracking = true;

    trackingInterval = setInterval(async () => {
        const window = await getActiveWindow();
        if (window) {
            callback(window);
        }
    }, intervalMs);
}

export function stopTracking(): void {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    isTracking = false;
}

export function isCurrentlyTracking(): boolean {
    return isTracking;
}
