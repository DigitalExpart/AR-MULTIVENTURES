import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNaira } from './formatters.ts';
import { calculateOrderFulfillment, calculateNetWeight } from './trip-calculations.ts';

test('Mobile Helpers — Currency formatting for mobile displays', () => {
  assert.equal(formatNaira(396000), '₦396,000.00');
  assert.equal(formatNaira(25000000), '₦25,000,000.00');
});

test('Mobile Helpers — Driver weighbridge scale math on mobile device', () => {
  const result = calculateNetWeight(45.10, 15.05);
  assert.equal(result.netWeightTonnes, 30.05);
  assert.equal(result.isValid, true);
});

test('Mobile Helpers — Customer order fulfillment progress aggregation', () => {
  const progress = calculateOrderFulfillment(150, [
    { status: 'DELIVERED', deliveredQuantityTonnes: 30.05, plannedQuantityTonnes: 30 },
    { status: 'DELIVERED', deliveredQuantityTonnes: 30.00, plannedQuantityTonnes: 30 },
    { status: 'IN_TRANSIT', plannedQuantityTonnes: 30 },
    { status: 'LOADING', plannedQuantityTonnes: 30 },
    { status: 'SCHEDULED', plannedQuantityTonnes: 30 },
  ]);

  assert.equal(progress.ordered, 150);
  assert.equal(progress.delivered, 60.05);
  assert.equal(progress.dispatched, 30);
  assert.equal(progress.loaded, 90);
  assert.equal(progress.remaining, 89.95);
  assert.equal(progress.isFullyDelivered, false);
});
