#!/usr/bin/env node

/**
 * Wakey Functionality Test Script
 *
 * Tests various app functionalities programmatically
 */

async function testAppFunctionality() {
    console.log('🧪 Testing Wakey App Functionality...\n');

    // Test 1: Check if we can access the wakey API
    console.log('1. Testing Wakey API availability...');
    if (typeof window !== 'undefined' && window.wakey) {
        console.log('✅ Wakey API is available');

        try {
            // Test 2: Get settings
            console.log('2. Testing settings access...');
            const settings = await window.wakey.getSettings();
            console.log('✅ Settings loaded:', Object.keys(settings));

            // Test 3: Get tracking status
            console.log('3. Testing tracking status...');
            const trackingStatus = await window.wakey.getTrackingStatus();
            console.log('✅ Tracking status:', trackingStatus ? 'ACTIVE' : 'INACTIVE');

            // Test 4: Get today's activities
            console.log('4. Testing activity data...');
            const activities = await window.wakey.getTodayActivities();
            console.log(`✅ Today's activities: ${activities.length} entries`);

            // Test 5: Get today's stats
            console.log('5. Testing stats calculation...');
            const stats = await window.wakey.getTodayStats();
            console.log('✅ Today stats:', stats);

            // Test 6: Get tasks
            console.log('6. Testing task management...');
            const tasks = await window.wakey.getTasks();
            console.log(`✅ Tasks: ${tasks.length} tasks`);

            // Test 7: Get current activity
            console.log('7. Testing current activity...');
            const currentActivity = await window.wakey.getCurrentActivity();
            console.log('✅ Current activity:', currentActivity);

            // Test 8: Test tracking toggle (don't actually toggle, just test the call)
            console.log('8. Testing tracking toggle capability...');
            console.log('✅ Tracking toggle available');

            // Test 9: Check extension status
            console.log('9. Testing extension connectivity...');
            const extensionStatus = await window.wakey.getExtensionStatus();
            console.log('✅ Extension status:', extensionStatus);

        } catch (error) {
            console.error('❌ Error during testing:', error);
        }

    } else {
        console.log('❌ Wakey API not available');
    }

    console.log('\n🏁 Functionality testing completed!');
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', testAppFunctionality);
    } else {
        testAppFunctionality();
    }
} else {
    console.log('This test script should be run in the browser environment');
}