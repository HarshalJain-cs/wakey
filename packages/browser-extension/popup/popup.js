/**
 * Popup script for Wakey Browser Extension
 */

// Update current tab info
async function updateCurrentSite() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];

        if (tab?.url) {
            const url = new URL(tab.url);
            const domain = url.hostname;

            document.getElementById('currentDomain').textContent = domain || 'New Tab';

            // Basic category detection
            let category = 'Browsing';
            if (domain.includes('github') || domain.includes('stackoverflow')) {
                category = '💻 Development';
            } else if (domain.includes('youtube') || domain.includes('netflix')) {
                category = '🎬 Entertainment';
            } else if (domain.includes('twitter') || domain.includes('facebook') || domain.includes('reddit')) {
                category = '📱 Social Media';
            } else if (domain.includes('slack') || domain.includes('discord') || domain.includes('mail')) {
                category = '💬 Communication';
            } else if (domain.includes('docs.google') || domain.includes('notion')) {
                category = '📝 Productivity';
            }

            document.getElementById('currentCategory').textContent = category;
        } else {
            document.getElementById('currentDomain').textContent = 'No active page';
            document.getElementById('currentCategory').textContent = '';
        }
    } catch (error) {
        console.error('Error getting current tab:', error);
    }
}

// Check connection status
async function checkConnectionStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    // Try to connect to WebSocket to check if Wakey is running
    try {
        const ws = new WebSocket('ws://localhost:8765');

        ws.onopen = () => {
            statusDot.classList.remove('disconnected');
            statusText.textContent = 'Connected to Wakey';
            ws.close();
        };

        ws.onerror = () => {
            statusDot.classList.add('disconnected');
            statusText.textContent = 'Wakey not running';
        };
    } catch {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'Wakey not running';
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentSite();
    checkConnectionStatus();
});
