import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { showNotification, showFocusReminder, showDistractionAlert, showGoalAchieved, scheduleNotification, cancelScheduledNotification, cancelAllScheduled, isNotificationsEnabled, setNotificationsEnabled, } from '../services/notification-service';
describe('Notification Service', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        setNotificationsEnabled(true);
    });
    afterEach(() => {
        vi.useRealTimers();
        cancelAllScheduled();
    });
    describe('showNotification', () => {
        it('should return a notification ID', () => {
            const id = showNotification({
                title: 'Test',
                body: 'Test body',
            });
            expect(id).toMatch(/^notif_/);
        });
        it('should respect notification settings', () => {
            setNotificationsEnabled(false);
            expect(isNotificationsEnabled()).toBe(false);
            setNotificationsEnabled(true);
            expect(isNotificationsEnabled()).toBe(true);
        });
    });
    describe('Preset Notifications', () => {
        it('showFocusReminder should show reminder', () => {
            // Should not throw
            expect(() => showFocusReminder(30)).not.toThrow();
        });
        it('showDistractionAlert should show alert', () => {
            expect(() => showDistractionAlert('YouTube')).not.toThrow();
        });
        it('showGoalAchieved should show celebration', () => {
            expect(() => showGoalAchieved('4 hours of focus')).not.toThrow();
        });
    });
    describe('Scheduled Notifications', () => {
        it('should schedule notification for future', () => {
            const scheduledId = scheduleNotification({ title: 'Future', body: 'Message' }, 5000);
            expect(scheduledId).toMatch(/^notif_/);
        });
        it('should cancel scheduled notification', () => {
            const scheduledId = scheduleNotification({ title: 'Cancel Test', body: 'Message' }, 5000);
            const cancelled = cancelScheduledNotification(scheduledId);
            expect(cancelled).toBe(true);
        });
        it('should return false for non-existent notification', () => {
            const cancelled = cancelScheduledNotification('non_existent_id');
            expect(cancelled).toBe(false);
        });
        it('should cancel all scheduled notifications', () => {
            scheduleNotification({ title: 'A', body: 'A' }, 1000);
            scheduleNotification({ title: 'B', body: 'B' }, 2000);
            // Should not throw
            expect(() => cancelAllScheduled()).not.toThrow();
        });
    });
});
//# sourceMappingURL=notification-service.test.js.map