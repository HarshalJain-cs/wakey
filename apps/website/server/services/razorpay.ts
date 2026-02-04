import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Get config after dotenv is loaded
const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

// Initialize Razorpay instance (only if credentials are available)
let razorpay: Razorpay | null = null;

if (keyId && keySecret) {
    razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
    console.log('✅ Razorpay client initialized');
} else {
    console.warn('⚠️ Razorpay credentials not configured - payment features disabled');
}

/**
 * Create a Razorpay order for one-time payment
 */
export async function createOrder(
    amount: number,
    currency: string = 'INR',
    receipt: string,
    notes?: Record<string, string>
) {
    if (!razorpay) {
        throw new Error('Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
    }

    const order = await razorpay.orders.create({
        amount, // Amount in smallest currency unit
        currency,
        receipt,
        notes,
    });

    return order;
}

/**
 * Create a Razorpay subscription
 */
export async function createSubscription(
    planId: string,
    customerId: string,
    totalCount: number = 12,
    notes?: Record<string, string>
) {
    if (!razorpay) {
        throw new Error('Razorpay not configured');
    }

    const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        total_count: totalCount,
        notes,
    });

    return subscription;
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
    body: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
}

/**
 * Fetch payment details
 */
export async function fetchPayment(paymentId: string) {
    if (!razorpay) {
        throw new Error('Razorpay not configured');
    }
    return razorpay.payments.fetch(paymentId);
}

/**
 * Fetch order details
 */
export async function fetchOrder(orderId: string) {
    if (!razorpay) {
        throw new Error('Razorpay not configured');
    }
    return razorpay.orders.fetch(orderId);
}

/**
 * Get Razorpay Key ID for client-side
 */
export function getKeyId(): string {
    return keyId;
}

export { razorpay };
