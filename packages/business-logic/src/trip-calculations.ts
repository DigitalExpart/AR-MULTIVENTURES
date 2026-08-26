/**
 * Trip and Logistics Weight / Fulfillment Business Logic
 */

export interface NetWeightResult {
  netWeightTonnes: number;
  isValid: boolean;
  error?: string;
}

export interface WeightVarianceResult {
  varianceTonnes: number;
  variancePercent: number;
}

export interface OrderFulfillmentProgress {
  ordered: number;
  planned: number;
  loaded: number;
  dispatched: number;
  delivered: number;
  remaining: number;
  fulfillmentPercent: number;
  isFullyDelivered: boolean;
}

/**
 * Calculates net weight from weighbridge gross and tare weights (in Tonnes).
 * Net = Gross - Tare
 */
export function calculateNetWeight(grossTonnes: number, tareTonnes: number): NetWeightResult {
  if (typeof grossTonnes !== 'number' || typeof tareTonnes !== 'number' || isNaN(grossTonnes) || isNaN(tareTonnes)) {
    return { netWeightTonnes: 0, isValid: false, error: 'Gross and tare weights must be valid numbers' };
  }

  if (tareTonnes < 0) {
    return { netWeightTonnes: 0, isValid: false, error: 'Tare weight cannot be negative' };
  }

  if (grossTonnes <= tareTonnes) {
    return { netWeightTonnes: 0, isValid: false, error: 'Gross weight must be strictly greater than tare weight' };
  }

  const net = Number((grossTonnes - tareTonnes).toFixed(2));
  return {
    netWeightTonnes: net,
    isValid: true,
  };
}

/**
 * Calculates weight variance between loaded net weight and planned weight.
 */
export function calculateWeightVariance(netTonnes: number, plannedTonnes: number): WeightVarianceResult {
  if (plannedTonnes <= 0) {
    return { varianceTonnes: 0, variancePercent: 0 };
  }

  const varianceTonnes = Number((netTonnes - plannedTonnes).toFixed(2));
  const variancePercent = Number(((varianceTonnes / plannedTonnes) * 100).toFixed(2));

  return {
    varianceTonnes,
    variancePercent,
  };
}

/**
 * Aggregates multi-trip fulfillment progress for an order / requisition.
 */
export function calculateOrderFulfillment(
  orderedTonnes: number,
  trips: Array<{
    status: string;
    plannedQuantityTonnes: number;
    netWeightTonnes?: number;
    deliveredQuantityTonnes?: number;
  }>
): OrderFulfillmentProgress {
  const ordered = Math.max(0, orderedTonnes);
  let planned = 0;
  let loaded = 0;
  let dispatched = 0;
  let delivered = 0;

  for (const t of trips) {
    planned += t.plannedQuantityTonnes || 0;

    const actualWeight = t.netWeightTonnes ?? t.plannedQuantityTonnes ?? 0;

    if (['LOADED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'POD_CONFIRMED', 'COMPLETED'].includes(t.status)) {
      loaded += actualWeight;
    }

    if (['DISPATCHED', 'IN_TRANSIT', 'ARRIVED'].includes(t.status)) {
      dispatched += actualWeight;
    }

    if (['DELIVERED', 'POD_CONFIRMED', 'COMPLETED'].includes(t.status)) {
      delivered += t.deliveredQuantityTonnes ?? actualWeight;
    }
  }

  planned = Number(planned.toFixed(2));
  loaded = Number(loaded.toFixed(2));
  dispatched = Number(dispatched.toFixed(2));
  delivered = Number(delivered.toFixed(2));

  const remaining = Number(Math.max(0, ordered - delivered).toFixed(2));
  const fulfillmentPercent = ordered > 0 ? Number(Math.min(100, (delivered / ordered) * 100).toFixed(1)) : 0;
  const isFullyDelivered = ordered > 0 && delivered >= ordered;

  return {
    ordered,
    planned,
    loaded,
    dispatched,
    delivered,
    remaining,
    fulfillmentPercent,
    isFullyDelivered,
  };
}

/**
 * Formats tonnes with clean unit display (e.g. 30.00 T).
 */
export function formatTonnes(tonnes: number): string {
  if (typeof tonnes !== 'number' || isNaN(tonnes)) return '0.00 T';
  return `${tonnes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`;
}
