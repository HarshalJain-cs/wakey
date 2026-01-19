import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DistractionAlert, { useDistractionAlert } from './DistractionAlert';
import WorkBreakReminder, { useWorkBreakReminder } from './WorkBreakReminder';

/**
 * ProductivityCoach Component
 * 
 * Central orchestrator for all productivity-related popups and reminders.
 * Manages priorities between different popup types and handles user actions.
 */
export default function ProductivityCoach() {
    const navigate = useNavigate();
    const distraction = useDistractionAlert();
    const breakReminder = useWorkBreakReminder();
    const [blockerDisabled, setBlockerDisabled] = useState(false);

    // Check if blocker is temporarily disabled
    useEffect(() => {
        const checkBlockerStatus = async () => {
            if (!window.wakey) return;
            const settings = await window.wakey.getSettings();
            const disabledUntil = settings.blockerDisabledUntil as number;
            if (disabledUntil && Date.now() < disabledUntil) {
                setBlockerDisabled(true);
            } else {
                setBlockerDisabled(false);
            }
        };

        checkBlockerStatus();
        const interval = setInterval(checkBlockerStatus, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleOpenSettings = () => {
        navigate('/settings');
        distraction.dismiss();
    };

    // Don't show distraction alert if blocker is disabled
    const showDistractionAlert = distraction.alert && !blockerDisabled;

    return (
        <>
            {/* Distraction Alert - Highest priority */}
            {showDistractionAlert && distraction.alert && (
                <DistractionAlert
                    app={distraction.alert.app}
                    title={distraction.alert.title}
                    onDismiss={distraction.dismiss}
                    onNotDistraction={distraction.notDistraction}
                    onEndSession={distraction.endSession}
                    onDisableBlocker={distraction.disableBlocker}
                    onOpenSettings={handleOpenSettings}
                />
            )}

            {/* Work Break Reminder - Shows when no distraction alert */}
            {!showDistractionAlert && (
                <WorkBreakReminder
                    enabled={breakReminder.isEnabled}
                    workDurationMinutes={breakReminder.settings.workDurationMinutes}
                    breakDurationMinutes={breakReminder.settings.breakDurationMinutes}
                    snoozeDurationMinutes={breakReminder.settings.snoozeDurationMinutes}
                    maxSnoozes={breakReminder.settings.maxSnoozes}
                />
            )}
        </>
    );
}
