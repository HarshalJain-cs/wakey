// apps/desktop/src/renderer/lib/__tests__/retry.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry, CircuitBreaker } from '../retry';

describe('withRetry', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('should return result on first success', async () => {
        const fn = vi.fn().mockResolvedValue('success');

        const result = await withRetry(fn);

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error('fail 1'))
            .mockRejectedValueOnce(new Error('fail 2'))
            .mockResolvedValue('success');

        const promise = withRetry(fn, { maxRetries: 3, backoffMs: 100 });

        // Advance timers for retries
        await vi.runAllTimersAsync();

        const result = await promise;

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exhausted', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));

        const promise = withRetry(fn, { maxRetries: 2, backoffMs: 100 });

        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow('persistent failure');
        expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should call onRetry callback on each retry', async () => {
        const onRetry = vi.fn();
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValue('success');

        const promise = withRetry(fn, {
            maxRetries: 2,
            backoffMs: 100,
            onRetry
        });

        await vi.runAllTimersAsync();
        await promise;

        expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should not retry non-retryable errors', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('fatal error'));

        const promise = withRetry(fn, {
            maxRetries: 3,
            backoffMs: 100,
            retryableErrors: ['timeout', 'network']
        });

        await expect(promise).rejects.toThrow('fatal error');
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe('CircuitBreaker', () => {
    it('should allow calls when closed', async () => {
        const breaker = new CircuitBreaker(3, 1000);
        const fn = vi.fn().mockResolvedValue('success');

        const result = await breaker.execute(fn);

        expect(result).toBe('success');
        expect(breaker.getState()).toBe('closed');
    });

    it('should open after threshold failures', async () => {
        const breaker = new CircuitBreaker(2, 1000);
        const fn = vi.fn().mockRejectedValue(new Error('fail'));

        // First failure
        await expect(breaker.execute(fn)).rejects.toThrow();
        expect(breaker.getState()).toBe('closed');

        // Second failure - should open
        await expect(breaker.execute(fn)).rejects.toThrow();
        expect(breaker.getState()).toBe('open');
    });

    it('should reject calls when open', async () => {
        const breaker = new CircuitBreaker(1, 1000);
        const fn = vi.fn().mockRejectedValue(new Error('fail'));

        // Open the breaker
        await expect(breaker.execute(fn)).rejects.toThrow();

        // Should reject without calling fn
        await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is open');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset to closed on success after half-open', async () => {
        vi.useFakeTimers();

        const breaker = new CircuitBreaker(1, 1000);
        const failFn = vi.fn().mockRejectedValue(new Error('fail'));
        const successFn = vi.fn().mockResolvedValue('success');

        // Open the breaker
        await expect(breaker.execute(failFn)).rejects.toThrow();
        expect(breaker.getState()).toBe('open');

        // Advance past reset timeout
        vi.advanceTimersByTime(1001);

        // Should transition to half-open and then closed on success
        const result = await breaker.execute(successFn);

        expect(result).toBe('success');
        expect(breaker.getState()).toBe('closed');

        vi.useRealTimers();
    });
});
