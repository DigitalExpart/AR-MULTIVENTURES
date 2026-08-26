import { test } from 'node:test';
import assert from 'node:assert';
import {
  calculateNetWeight,
  calculateWeightVariance,
  calculateOrderFulfillment,
  formatTonnes
} from './trip-calculations.ts';

test('calculateNetWeight correctly computes Gross - Tare = Net', () => {
  const result = calculateNetWeight(45.50, 15.20);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.netWeightTonnes, 30.30);

  // Invalid cases
  const invalidGross = calculateNetWeight(15.00, 20.00);
  assert.strictEqual(invalidGross.isValid, false);

  const negativeTare = calculateNetWeight(30.00, -5.00);
  assert.strictEqual(negativeTare.isValid, false);
});

test('calculateWeightVariance computes variance tonnes and percentage', () => {
  const result = calculateWeightVariance(30.30, 30.00);
  assert.strictEqual(result.varianceTonnes, 0.30);
  assert.strictEqual(result.variancePercent, 1.00);

  const underResult = calculateWeightVariance(28.50, 30.00);
  assert.strictEqual(underResult.varianceTonnes, -1.50);
  assert.strictEqual(underResult.variancePercent, -5.00);
});

test('calculateOrderFulfillment aggregates multi-trip order progress correctly', () => {
  const trips = [
    { status: 'DELIVERED', plannedQuantityTonnes: 30.00, netWeightTonnes: 30.00, deliveredQuantityTonnes: 30.00 },
    { status: 'DELIVERED', plannedQuantityTonnes: 30.00, netWeightTonnes: 30.00, deliveredQuantityTonnes: 30.00 },
    { status: 'IN_TRANSIT', plannedQuantityTonnes: 30.00, netWeightTonnes: 30.20 },
    { status: 'LOADING', plannedQuantityTonnes: 30.00, netWeightTonnes: 29.80 },
    { status: 'PLANNED', plannedQuantityTonnes: 30.00 },
  ];

  const progress = calculateOrderFulfillment(150.00, trips);
  assert.strictEqual(progress.ordered, 150.00);
  assert.strictEqual(progress.planned, 150.00);
  assert.strictEqual(progress.delivered, 60.00);
  assert.strictEqual(progress.dispatched, 30.20);
  assert.strictEqual(progress.remaining, 90.00);
  assert.strictEqual(progress.fulfillmentPercent, 40.0);
  assert.strictEqual(progress.isFullyDelivered, false);

  assert.strictEqual(formatTonnes(30.3), '30.30 T');
});
