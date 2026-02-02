// apps/desktop/src/renderer/lib/retry.ts

interface RetryOptions {
    maxRetries: number;
    backoffMs: number;
    maxBackoffMs: number;
    backoffMultiplier: number;
    retryableErrors?: string[];
    onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
    maxRetries: 3,
    backoffMs: 1000,
    maxBackoffMs: 30000,
    backoffMultiplier: 2,
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error;
    let backoff = opts.backoffMs;

    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Check if error is retryable
            if (opts.retryableErrors && !opts.retryableErrors.some(e => lastError.message.includes(e))) {
                throw lastError;
            }

            if (attempt <= opts.maxRetries) {
                opts.onRetry?.(attempt, lastError);

                // Wait with exponential backoff
                await sleep(backoff);
                backoff = Math.min(backoff * opts.backoffMultiplier, opts.maxBackoffMs);
            }
        }
    }

    throw lastError!;
}

// Circuit breaker pattern
export class CircuitBreaker {
    private failures = 0;
    private lastFailure: Date | null = null;
    private state: 'closed' | 'open' | 'half-open' = 'closed';

    constructor(
        private threshold: number = 5,
        private resetTimeout: number = 30000
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailure!.getTime() > this.resetTimeout) {
                this.state = 'half-open';
            } else {
                throw new Error('Circuit breaker is open');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failures = 0;
        this.state = 'closed';
    }

    private onFailure(): void {
        this.failures++;
        this.lastFailure = new Date();

        if (this.failures >= this.threshold) {
            this.state = 'open';
        }
    }

    getState(): string {
        return this.state;
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type { RetryOptions };
