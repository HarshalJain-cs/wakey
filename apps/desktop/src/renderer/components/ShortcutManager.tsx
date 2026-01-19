import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * ShortcutManager Component
 * Handles application-wide keyboard shortcuts that are not global
 */
export default function ShortcutManager() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            // Context-agnostic shortcuts (always work when app is focused)
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        navigate('/');
                        break;
                    case '2':
                        e.preventDefault();
                        navigate('/focus');
                        break;
                    case '3':
                        e.preventDefault();
                        navigate('/tasks');
                        break;
                    case '4':
                        e.preventDefault();
                        navigate('/analytics');
                        break;
                    case '5':
                        e.preventDefault();
                        navigate('/goals');
                        break;
                    case ',':
                        e.preventDefault();
                        navigate('/settings');
                        break;
                    case 'n':
                        // Only prevent default and navigate if not in an input
                        if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                            e.preventDefault();
                            navigate('/tasks');
                        }
                        break;
                }
            }

            // Context-specific shortcuts
            const isInputActive = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
            if (isInputActive) return; // Don't trigger single-key shortcuts when typing

            // Focus Page Shortcuts
            if (location.pathname === '/focus') {
                switch (e.key.toLowerCase()) {
                    case ' ':
                        e.preventDefault();
                        // Trigger timer toggle via custom event since we can't access state directly
                        window.dispatchEvent(new CustomEvent('focus-timer-toggle'));
                        break;
                    case 'r':
                        window.dispatchEvent(new CustomEvent('focus-timer-reset'));
                        break;
                    case 's':
                        window.dispatchEvent(new CustomEvent('focus-timer-skip'));
                        break;
                    case '+':
                    case '=':
                        window.dispatchEvent(new CustomEvent('focus-timer-add-5'));
                        break;
                    case '-':
                    case '_':
                        window.dispatchEvent(new CustomEvent('focus-timer-sub-5'));
                        break;
                }
            }

            // Music Shortcuts (Global within app)
            switch (e.key.toLowerCase()) {
                case 'm':
                    if (!e.ctrlKey && !e.metaKey) {
                        window.dispatchEvent(new CustomEvent('music-toggle'));
                    }
                    break;
                case '[':
                    window.dispatchEvent(new CustomEvent('music-vol-down'));
                    break;
                case ']':
                    window.dispatchEvent(new CustomEvent('music-vol-up'));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, location.pathname]);

    return null; // Logic-only component
}
