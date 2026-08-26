import test from 'node:test';
import assert from 'node:assert/strict';
import { nairaToKobo, koboToNaira, formatNaira } from './formatters.ts';

test('Currency Helpers — nairaToKobo conversions', () => {
  assert.equal(nairaToKobo(1.00), 100);
  assert.equal(nairaToKobo(1000.00), 100000);
  assert.equal(nairaToKobo(500000.00), 50000000);
  assert.equal(nairaToKobo(500000.55), 50000055);
  assert.equal(nairaToKobo(0.01), 1);
  assert.equal(nairaToKobo(0), 0);
});

test('Currency Helpers — koboToNaira conversions', () => {
  assert.equal(koboToNaira(100), 1.00);
  assert.equal(koboToNaira(100000), 1000.00);
  assert.equal(koboToNaira(50000000), 500000.00);
  assert.equal(koboToNaira(50000055), 500000.55);
  assert.equal(koboToNaira(1), 0.01);
  assert.equal(koboToNaira(0), 0.00);
});

test('Currency Helpers — formatNaira formatting', () => {
  assert.equal(formatNaira(500000), '₦500,000.00');
  assert.equal(formatNaira(1234.56), '₦1,234.56');
});
