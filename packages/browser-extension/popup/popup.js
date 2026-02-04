/**
 * Popup script for Wakey Browser Extension
 * Enhanced with trial features and premium status
 */

// Configuration
const WAKEY_WS_URL = 'ws://localhost:8765';
const TRIAL_DAYS = 7;
const FREE_DAILY_LIMIT = 60; // minutes

// State
let isConnected = false;
let isPremium = false;
let trialStartDate = null;
let dailyTrackingMinutes = 0;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateCurrentSite();
    checkConnectionStatus();
    updateUI();
});

// Load persisted state
function loadState() {
    chrome.storage.local.get(['trialStartDate', 'isPremium', 'dailyTrackingMinutes', 'lastTrackingDate'], (result) => {
        const today = new Date().toDateString();

        // Check if trial started
        if (result.trialStartDate) {
            trialStartDate = new Date(result.trialStartDate);
        }

        isPremium = result.isPremium || false;

        // Reset daily tracking if new day
        if (result.lastTrackingDate !== today) {
            dailyTrackingMinutes = 0;
            chrome.storage.local.set({ dailyTrackingMinutes: 0, lastTrackingDate: today });
        } else {
            dailyTrackingMinutes = result.dailyTrackingMinutes || 0;
        }

        updateUI();
    });
}

// Update UI based on state
function updateUI() {
    const tierBadge = document.getElementById('tierBadge');
    const trialInfo = document.getElementById('trialInfo');
    const ctaButton = document.getElementById('ctaButton');
    const trackingValue = document.getElementById('trackingValue');
    const progressFill = document.getElementById('progressFill');

    // Update tier badge
    if (isPremium) {
        tierBadge.textContent = 'PRO';
        tierBadge.style.background = 'linear-gradient(135deg, #f59e0b, #f97316)';
        tierBadge.style.color = 'white';
        trialInfo.style.display = 'none';
        ctaButton.textContent = 'Open Dashboard';

        // Mark all features as active
        ['feature1Icon', 'feature2Icon', 'feature3Icon', 'feature4Icon'].forEach(id => {
            const el = document.getElementById(id);
            el.textContent = '✓';
            el.classList.remove('inactive');
            el.classList.add('active');
        });
    } else if (trialStartDate) {
        // Show trial info
        const daysLeft = Math.max(0, TRIAL_DAYS - Math.floor((Date.now() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24)));
        trialInfo.textContent = `${daysLeft} days left in your free trial`;
        trialInfo.style.display = 'block';

        if (daysLeft > 0) {
            ctaButton.textContent = 'Upgrade to Pro';
            tierBadge.textContent = 'TRIAL';
            tierBadge.style.background = 'rgba(59, 130, 246, 0.2)';
            tierBadge.style.color = '#60a5fa';

            // Mark features as active during trial
            ['feature1Icon', 'feature2Icon', 'feature3Icon', 'feature4Icon'].forEach(id => {
                const el = document.getElementById(id);
                el.textContent = '✓';
                el.classList.remove('inactive');
                el.classList.add('active');
            });
        } else {
            trialInfo.textContent = 'Trial expired';
            trialInfo.style.color = '#ef4444';
            ctaButton.textContent = 'Upgrade to Pro';
        }
    } else {
        // Free tier, no trial started
        tierBadge.textContent = 'FREE';
        trialInfo.textContent = '7 days left in your free trial';
        ctaButton.textContent = 'Start Free Trial';
    }

    // Update tracking usage
    const displayMinutes = Math.min(dailyTrackingMinutes, FREE_DAILY_LIMIT);
    trackingValue.textContent = `${displayMinutes}/${FREE_DAILY_LIMIT} min`;
    progressFill.style.width = `${(displayMinutes / FREE_DAILY_LIMIT) * 100}%`;
}

// Handle CTA button click
function handleCTA() {
    if (isPremium) {
        // Open desktop app dashboard
        openWakeyDesktop();
    } else if (trialStartDate) {
        // Upgrade flow - open pricing page
        chrome.tabs.create({ url: 'https://wakey.app/pricing' });
    } else {
        // Start free trial
        startFreeTrial();
    }
}

// Start free trial
function startFreeTrial() {
    trialStartDate = new Date();
    chrome.storage.local.set({ trialStartDate: trialStartDate.toISOString() }, () => {
        updateUI();

        // Show success message
        const ctaButton = document.getElementById('ctaButton');
        ctaButton.textContent = '✓ Trial Started!';
        ctaButton.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

        setTimeout(() => {
            ctaButton.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
            updateUI();
        }, 2000);
    });
}

// Open Wakey Desktop
function openWakeyDesktop() {
    // Try to focus the desktop app via native messaging or URL scheme
    // For now, just show a message
    const statusText = document.getElementById('statusText');
    if (isConnected) {
        statusText.textContent = 'Desktop app is open!';
    } else {
        statusText.textContent = 'Please open Wakey Desktop';
    }
}

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
            if (domain.includes('github') || domain.includes('stackoverflow') || domain.includes('gitlab')) {
                category = '💻 Development';
            } else if (domain.includes('youtube') || domain.includes('netflix') || domain.includes('twitch')) {
                category = '🎬 Entertainment';
            } else if (domain.includes('twitter') || domain.includes('facebook') || domain.includes('reddit') || domain.includes('instagram')) {
                category = '📱 Social Media';
            } else if (domain.includes('slack') || domain.includes('discord') || domain.includes('mail') || domain.includes('teams')) {
                category = '💬 Communication';
            } else if (domain.includes('docs.google') || domain.includes('notion') || domain.includes('figma')) {
                category = '📝 Productivity';
            } else if (domain.includes('google') || domain.includes('bing') || domain.includes('duckduckgo')) {
                category = '🔍 Search';
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
    const statusBox = document.getElementById('statusBox');

    try {
        const ws = new WebSocket(WAKEY_WS_URL);

        ws.onopen = () => {
            isConnected = true;
            statusDot.classList.remove('disconnected');
            statusBox.classList.remove('disconnected');
            statusText.textContent = 'Connected to Wakey';
            ws.close();
        };

        ws.onerror = () => {
            isConnected = false;
            statusDot.classList.add('disconnected');
            statusBox.classList.add('disconnected');
            statusText.textContent = 'Wakey Desktop not running';
        };

        ws.onclose = () => {
            // Connection check complete
        };
    } catch {
        isConnected = false;
        statusDot.classList.add('disconnected');
        statusBox.classList.add('disconnected');
        statusText.textContent = 'Wakey Desktop not running';
    }
}

// Make handleCTA available globally
window.handleCTA = handleCTA;

// Handle open desktop link
document.getElementById('openDesktop')?.addEventListener('click', (e) => {
    e.preventDefault();
    openWakeyDesktop();
});
