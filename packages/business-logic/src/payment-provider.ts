// ============================================================================
// AR MULTIVENTURES — PAYMENT PROVIDER ABSTRACTION
// Gateway abstraction layer supporting Paystack and future providers (e.g. Flutterwave)
// ============================================================================

import type { PaymentEnvironment, PaymentGatewayProvider } from '@ar-multiventures/types';
import { nairaToKobo, koboToNaira } from './formatters';

export interface PaymentInitParams {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitResult {
  success: boolean;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amountKobo: number;
}

export interface PaymentVerifyResult {
  success: boolean;
  reference: string;
  amountNaira: number;
  currency: string;
  status: 'success' | 'failed' | 'abandoned';
  gatewayResponse?: string;
  paidAt?: string;
  channel?: string;
}

export interface WebhookEventPayload {
  event: string;
  data: {
    id?: number;
    reference: string;
    amount: number; // in smallest unit (kobo)
    currency: string;
    status: string;
    gateway_response?: string;
    paid_at?: string;
    channel?: string;
    customer?: {
      email?: string;
      customer_code?: string;
    };
    metadata?: Record<string, any>;
  };
}

export interface IPaymentProvider {
  readonly providerId: PaymentGatewayProvider;
  initializeTransaction(params: PaymentInitParams): Promise<PaymentInitResult>;
  verifyTransaction(reference: string): Promise<PaymentVerifyResult>;
  parseWebhook(rawBody: string): WebhookEventPayload;
  verifyWebhookSignature(rawBody: string, signature: string, secretKey: string): Promise<boolean>;
}

/**
 * Paystack Implementation of IPaymentProvider
 */
export class PaystackPaymentProvider implements IPaymentProvider {
  readonly providerId: PaymentGatewayProvider = 'PAYSTACK';
  private secretKey?: string;
  private environment: PaymentEnvironment;

  constructor(secretKey?: string, environment: PaymentEnvironment = 'TEST') {
    this.secretKey = secretKey;
    this.environment = environment;
  }

  async initializeTransaction(params: PaymentInitParams): Promise<PaymentInitResult> {
    const amountKobo = nairaToKobo(params.amountNaira);

    if (!this.secretKey) {
      // Mock / Offline Test Mode fallback
      return {
        success: true,
        reference: params.reference,
        authorizationUrl: `/app/payments?mock_reference=${encodeURIComponent(params.reference)}&status=success`,
        accessCode: `MOCK_ACCESS_${params.reference}`,
        amountKobo,
      };
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountKobo,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(`Paystack initialization error: ${data.message || 'Unknown error'}`);
    }

    return {
      success: true,
      reference: params.reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      amountKobo,
    };
  }

  async verifyTransaction(reference: string): Promise<PaymentVerifyResult> {
    if (!this.secretKey) {
      // Mock / Test verification fallback
      return {
        success: true,
        reference,
        amountNaira: 0,
        currency: 'NGN',
        status: 'success',
        gatewayResponse: 'Successful mock transaction',
      };
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    const data = await response.json();
    if (!data.status || data.data.status !== 'success') {
      return {
        success: false,
        reference,
        amountNaira: data.data?.amount ? koboToNaira(data.data.amount) : 0,
        currency: data.data?.currency || 'NGN',
        status: data.data?.status || 'failed',
        gatewayResponse: data.data?.gateway_response || data.message || 'Payment not successful',
      };
    }

    return {
      success: true,
      reference: data.data.reference,
      amountNaira: koboToNaira(data.data.amount),
      currency: data.data.currency || 'NGN',
      status: 'success',
      gatewayResponse: data.data.gateway_response,
      paidAt: data.data.paid_at,
      channel: data.data.channel,
    };
  }

  parseWebhook(rawBody: string): WebhookEventPayload {
    return JSON.parse(rawBody);
  }

  async verifyWebhookSignature(rawBody: string, signature: string, secretKey: string): Promise<boolean> {
    if (!signature || !secretKey) return false;

    // Standard Web Crypto HMAC-SHA512
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const msgData = encoder.encode(rawBody);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, msgData);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const calculatedHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return calculatedHex.toLowerCase() === signature.toLowerCase();
  }
}
