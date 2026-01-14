// Activity Tracking Module for Wakey
// Uses active-win to detect current window (Windows/macOS/Linux)
// Will be implemented with active-win package
export async function getActiveWindow() {
    try {
        // Dynamic import for active-win (ESM)
        const activeWin = await import('active-win');
        const window = await activeWin.default();
        if (!window)
            return null;
        return {
            title: window.title,
            id: window.id,
            bounds: window.bounds,
            owner: window.owner,
            url: window.url, // Only available for browsers
        };
    }
    catch (error) {
        console.error('Failed to get active window:', error);
        return null;
    }
}
// Idle detection
let lastActivityTime = Date.now();
export function updateLastActivityTime() {
    lastActivityTime = Date.now();
}
export function getIdleTime() {
    return Date.now() - lastActivityTime;
}
export function isIdle(thresholdMs = 5 * 60 * 1000) {
    return getIdleTime() > thresholdMs;
}
// Screenshot capture (placeholder - will use native module)
export async function captureScreenshot(savePath) {
    // Will be implemented with screenshot-desktop or native module
    console.log('Screenshot capture not yet implemented:', savePath);
    return false;
}
let previousWindow = null;
export async function detectActivityChange() {
    const current = await getActiveWindow();
    if (!previousWindow && !current)
        return null;
    const isContextSwitch = previousWindow?.owner.name !== current?.owner.name;
    const change = {
        previous: previousWindow,
        current,
        isContextSwitch,
        timestamp: Date.now(),
    };
    previousWindow = current;
    return change;
}
// Tracking loop
let trackingInterval = null;
let isTracking = false;
export function startTracking(callback, intervalMs = 5000) {
    if (isTracking)
        return;
    isTracking = true;
    trackingInterval = setInterval(async () => {
        const window = await getActiveWindow();
        if (window) {
            callback(window);
        }
    }, intervalMs);
}
export function stopTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    isTracking = false;
}
export function isCurrentlyTracking() {
    return isTracking;
}
//# sourceMappingURL=index.js.map