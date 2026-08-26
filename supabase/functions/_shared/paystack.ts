// ============================================================================
// AR MULTIVENTURES — EDGE FUNCTION PAYSTACK INTEGRATION UTILITIES
// ============================================================================

import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

export function nairaToKobo(naira: number): number {
  return Math.round(Number(naira.toFixed(2)) * 100);
}

export function koboToNaira(kobo: number): number {
  return Number((kobo / 100).toFixed(2));
}

/**
 * Computes HMAC-SHA512 over the raw request body string using the Paystack secret key
 * and compares it to the incoming x-paystack-signature header.
 */
export async function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string
): Promise<boolean> {
  if (!signatureHeader || !secretKey) {
    return false;
  }

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

  return calculatedHex.toLowerCase() === signatureHeader.toLowerCase();
}
