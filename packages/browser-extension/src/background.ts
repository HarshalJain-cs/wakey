/**
 * Wakey Browser Extension - Background Service Worker
 * 
 * Tracks browser tab activity and sends events to the Wakey desktop app
 * via WebSocket connection on localhost:8765.
 */

const WAKEY_WS_URL = 'ws://localhost:8765';
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000; // 30 seconds max

// Current tab state for time tracking
let currentTabId: number | null = null;
let currentTabStart: number | null = null;

/**
 * Detects the browser name from user agent.
 */
function getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Brave')) return 'Brave';
    if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    return 'Unknown';
}

/**
 * Safely extracts domain from URL.
 */
function getDomain(url: string): string | null {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return null;
    }
}

/**
 * Sends an event to the Wakey desktop app.
 */
function sendEvent(event: Record<string, unknown>): void {
    if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            ...event,
            timestamp: Date.now(),
            browser: getBrowserName()
        }));
    }
}

/**
 * Connects to the Wakey desktop app WebSocket server.
 */
function connectToWakey(): void {
    if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
        return;
    }

    try {
        ws = new WebSocket(WAKEY_WS_URL);

        ws.onopen = () => {
            console.log('[Wakey] Connected to desktop app');
            reconnectAttempts = 0;
            sendEvent({ type: 'extension_connected' });

            // Send current tab on connect
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.url) {
                    const domain = getDomain(tabs[0].url);
                    if (domain) {
                        sendEvent({
                            type: 'tab_activated',
                            url: tabs[0].url,
                            title: tabs[0].title,
                            domain,
                            tabId: tabs[0].id
                        });
                        currentTabId = tabs[0].id ?? null;
                        currentTabStart = Date.now();
                    }
                }
            });
        };

        ws.onclose = () => {
            console.log('[Wakey] Disconnected from desktop app');
            ws = null;

            // Reconnect with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
            reconnectAttempts++;
            setTimeout(connectToWakey, delay);
        };

        ws.onerror = (error) => {
            console.error('[Wakey] WebSocket error:', error);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('[Wakey] Received:', data);
                // Handle any commands from desktop app here
            } catch (e) {
                console.error('[Wakey] Failed to parse message:', e);
            }
        };
    } catch (error) {
        console.error('[Wakey] Failed to connect:', error);
        // Retry connection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
        reconnectAttempts++;
        setTimeout(connectToWakey, delay);
    }
}

// ============================================
// Tab Activity Tracking
// ============================================

/**
 * Handle tab activation (user switches to a different tab).
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);

        if (tab.url) {
            const domain = getDomain(tab.url);
            if (domain) {
                sendEvent({
                    type: 'tab_activated',
                    url: tab.url,
                    title: tab.title,
                    domain,
                    tabId: tab.id
                });

                currentTabId = tab.id ?? null;
                currentTabStart = Date.now();
            }
        }
    } catch (error) {
        console.error('[Wakey] Error getting tab info:', error);
    }
});

/**
 * Handle URL changes within a tab (navigation).
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
        const domain = getDomain(changeInfo.url);
        if (domain) {
            sendEvent({
                type: 'url_changed',
                url: changeInfo.url,
                title: tab.title,
                domain,
                tabId
            });

            currentTabId = tabId;
            currentTabStart = Date.now();
        }
    }
});

/**
 * Handle tab closure.
 */
chrome.tabs.onRemoved.addListener((tabId) => {
    sendEvent({
        type: 'tab_closed',
        tabId
    });

    if (tabId === currentTabId) {
        currentTabId = null;
        currentTabStart = null;
    }
});

// ============================================
// Idle Detection
// ============================================

// Set idle detection threshold (60 seconds)
chrome.idle.setDetectionInterval(60);

chrome.idle.onStateChanged.addListener((state) => {
    sendEvent({
        type: 'idle_state',
        state
    });
});

// ============================================
// Extension Lifecycle
// ============================================

// Connect to Wakey on service worker startup
connectToWakey();

// Keep service worker alive by setting up an alarm
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        // Try to reconnect if disconnected
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            connectToWakey();
        }
    }
});

console.log('[Wakey] Browser extension service worker started');
