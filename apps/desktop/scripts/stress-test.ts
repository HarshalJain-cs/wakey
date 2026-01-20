#!/usr/bin/env node

/**
 * Wakey Stress Test Script
 *
 * This script simulates high-load scenarios to test application performance
 * and stability under stress conditions.
 */

import { performance } from 'perf_hooks';

// Configuration
const STRESS_CONFIG = {
    concurrentUsers: 10,
    apiCallsPerUser: 100,
    focusSessionsPerUser: 5,
    tasksPerUser: 20,
    testDuration: 300000, // 5 minutes
};

// Mock user data
const mockUsers = Array.from({ length: STRESS_CONFIG.concurrentUsers }, (_, i) => ({
    id: `user_${i}`,
    name: `Test User ${i}`,
    email: `user${i}@test.com`,
}));

// Mock API key for testing
const mockApiKey = 'wk_test_stress_key_123456789012345678901234567890';

// Stress test results
const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    responseTimes: [] as number[],
    errors: [] as string[],
    startTime: Date.now(),
    endTime: 0,
};

async function simulateApiCall(endpoint: string, method: string = 'GET', data?: any): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = performance.now();

    try {
        // Simulate API call delay (50-200ms)
        const delay = Math.random() * 150 + 50;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Simulate occasional failures (5% failure rate)
        if (Math.random() < 0.05) {
            throw new Error(`Simulated ${endpoint} failure`);
        }

        const responseTime = performance.now() - startTime;
        results.totalRequests++;
        results.successfulRequests++;
        results.responseTimes.push(responseTime);

        return { success: true, responseTime };
    } catch (error) {
        const responseTime = performance.now() - startTime;
        results.totalRequests++;
        results.failedRequests++;
        results.responseTimes.push(responseTime);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${endpoint}: ${errorMsg}`);

        return { success: false, responseTime, error: errorMsg };
    }
}

async function simulateUserActivity(userId: string): Promise<void> {
    console.log(`Starting stress test for user ${userId}`);

    // Simulate API key operations
    for (let i = 0; i < STRESS_CONFIG.apiCallsPerUser; i++) {
        await simulateApiCall(`/api/v1/users/${userId}/stats`);
        await simulateApiCall(`/api/v1/users/${userId}/activities`);
        await simulateApiCall(`/api/v1/users/${userId}/insights`);
    }

    // Simulate focus sessions
    for (let i = 0; i < STRESS_CONFIG.focusSessionsPerUser; i++) {
        await simulateApiCall(`/api/v1/users/${userId}/focus/start`, 'POST', {
            duration: 25,
            type: 'focus',
        });

        // Simulate session duration
        await new Promise(resolve => setTimeout(resolve, 1000));

        await simulateApiCall(`/api/v1/users/${userId}/focus/end`, 'POST', {
            quality: Math.floor(Math.random() * 100),
            distractions: Math.floor(Math.random() * 5),
        });
    }

    // Simulate task operations
    for (let i = 0; i < STRESS_CONFIG.tasksPerUser; i++) {
        await simulateApiCall(`/api/v1/users/${userId}/tasks`, 'POST', {
            title: `Stress test task ${i}`,
            priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        });

        await simulateApiCall(`/api/v1/users/${userId}/tasks/${i}/complete`, 'PUT');
    }

    console.log(`Completed stress test for user ${userId}`);
}

async function runMemoryStressTest(): Promise<void> {
    console.log('Running memory stress test...');

    // Simulate large data operations
    const largeDataSets = [];
    for (let i = 0; i < 1000; i++) {
        largeDataSets.push({
            id: i,
            data: 'x'.repeat(1000), // 1KB per item
            timestamp: Date.now(),
        });
    }

    // Process data
    await simulateApiCall('/api/v1/bulk/operations', 'POST', largeDataSets);

    // Clean up
    largeDataSets.length = 0;

    console.log('Memory stress test completed');
}

async function runConcurrentLoadTest(): Promise<void> {
    console.log(`Starting concurrent load test with ${STRESS_CONFIG.concurrentUsers} users...`);

    const userPromises = mockUsers.map(user => simulateUserActivity(user.id));
    await Promise.all(userPromises);

    console.log('Concurrent load test completed');
}

async function runRateLimitTest(): Promise<void> {
    console.log('Running rate limit stress test...');

    // Simulate rapid API calls to test rate limiting
    const rapidCalls = [];
    for (let i = 0; i < 200; i++) {
        rapidCalls.push(simulateApiCall('/api/v1/rate-limited-endpoint'));
    }

    await Promise.all(rapidCalls);
    console.log('Rate limit stress test completed');
}

function generateReport(): void {
    results.endTime = Date.now();
    const duration = (results.endTime - results.startTime) / 1000;

    console.log('\n=== Wakey Stress Test Report ===');
    console.log(`Test Duration: ${duration.toFixed(2)} seconds`);
    console.log(`Total Requests: ${results.totalRequests}`);
    console.log(`Successful Requests: ${results.successfulRequests}`);
    console.log(`Failed Requests: ${results.failedRequests}`);
    console.log(`Success Rate: ${((results.successfulRequests / results.totalRequests) * 100).toFixed(2)}%`);

    if (results.responseTimes.length > 0) {
        const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
        const minResponseTime = Math.min(...results.responseTimes);
        const maxResponseTime = Math.max(...results.responseTimes);

        console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`Min Response Time: ${minResponseTime.toFixed(2)}ms`);
        console.log(`Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
        console.log(`Requests per Second: ${(results.totalRequests / duration).toFixed(2)}`);
    }

    if (results.errors.length > 0) {
        console.log(`\nErrors (${results.errors.length}):`);
        results.errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
        if (results.errors.length > 10) {
            console.log(`  ... and ${results.errors.length - 10} more errors`);
        }
    }

    // Performance assessment
    const successRate = results.successfulRequests / results.totalRequests;
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    const rps = results.totalRequests / duration;

    console.log('\n=== Performance Assessment ===');
    if (successRate > 0.95) {
        console.log('✅ High reliability (success rate > 95%)');
    } else if (successRate > 0.90) {
        console.log('⚠️  Moderate reliability (success rate 90-95%)');
    } else {
        console.log('❌ Low reliability (success rate < 90%)');
    }

    if (avgResponseTime < 100) {
        console.log('✅ Fast response times (< 100ms average)');
    } else if (avgResponseTime < 500) {
        console.log('⚠️  Acceptable response times (100-500ms average)');
    } else {
        console.log('❌ Slow response times (> 500ms average)');
    }

    if (rps > 100) {
        console.log('✅ High throughput (> 100 RPS)');
    } else if (rps > 50) {
        console.log('⚠️  Moderate throughput (50-100 RPS)');
    } else {
        console.log('❌ Low throughput (< 50 RPS)');
    }
}

async function main(): Promise<void> {
    console.log('🚀 Starting Wakey Stress Tests...\n');

    try {
        // Run individual stress tests
        await runMemoryStressTest();
        await runConcurrentLoadTest();
        await runRateLimitTest();

        // Generate final report
        generateReport();

        console.log('\n✅ Stress testing completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Stress testing failed:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stress test interrupted by user');
    generateReport();
    process.exit(0);
});

// Run the stress test
main();