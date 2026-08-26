import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateReceivablesAging,
  calculatePeriodComparison,
  calculateFleetUtilizationRate,
  getDateRangeForPeriod,
} from './report-calculations.ts';
import { buildCsvContent } from './export-engine.ts';

test('calculateReceivablesAging correctly sorts invoices into aging buckets', () => {
  const asOf = '2026-08-26T12:00:00Z';
  const invoices = [
    {
      id: 'inv-1',
      customerId: 'cus-1',
      customerName: 'Dangote Construction',
      dueDate: '2026-09-05', // Current (future due date)
      totalAmount: 1000000,
      amountPaid: 200000, // 800,000 outstanding
    },
    {
      id: 'inv-2',
      customerId: 'cus-1',
      customerName: 'Dangote Construction',
      dueDate: '2026-08-10', // 16 days overdue -> 1-30 bucket
      totalAmount: 500000,
      amountPaid: 0, // 500,000 outstanding
    },
    {
      id: 'inv-3',
      customerId: 'cus-2',
      customerName: 'Julius Berger',
      dueDate: '2026-07-10', // 47 days overdue -> 31-60 bucket
      totalAmount: 2000000,
      amountPaid: 500000, // 1,500,000 outstanding
    },
    {
      id: 'inv-4',
      customerId: 'cus-2',
      customerName: 'Julius Berger',
      dueDate: '2026-05-15', // 103 days overdue -> 90+ bucket
      totalAmount: 3000000,
      amountPaid: 1000000, // 2,000,000 outstanding
    },
  ];

  const result = calculateReceivablesAging(invoices, asOf);

  assert.equal(result.customersCount, 2);
  assert.equal(result.totalOutstanding, 4800000);
  assert.equal(result.totalCurrent, 800000);
  assert.equal(result.total1To30, 500000);
  assert.equal(result.total31To60, 1500000);
  assert.equal(result.total61To90, 0);
  assert.equal(result.total90Plus, 2000000);

  const cus1 = result.rows.find((r) => r.customerId === 'cus-1');
  assert.ok(cus1);
  assert.equal(cus1.totalOutstanding, 1300000);
  assert.equal(cus1.currentAmount, 800000);
  assert.equal(cus1.days1To30, 500000);
});

test('calculatePeriodComparison computes percentage change accurately', () => {
  const result1 = calculatePeriodComparison(24500000, 21800000);
  assert.equal(result1.percentageChange, 12.4);
  assert.equal(result1.isPositive, true);

  const result2 = calculatePeriodComparison(1800000, 2000000);
  assert.equal(result2.percentageChange, -10.0);
  assert.equal(result2.isPositive, false);

  const result3 = calculatePeriodComparison(500000, 0);
  assert.equal(result3.percentageChange, undefined);
});

test('calculateFleetUtilizationRate computes utilization percentage against target', () => {
  // 39 target trips (26 days * 1.5 trips/day), 31 trips completed = 79.5%
  const rate = calculateFleetUtilizationRate(31, 26, 1.5);
  assert.equal(rate, 79.5);
});

test('buildCsvContent preserves numeric integrity and escapes strings correctly', () => {
  const rows = [
    { name: 'Dangote, Lekki Site', tonnage: 150.5, amount: 2450000 },
    { name: 'Julius Berger "Phase 2"', tonnage: 90, amount: 1800000 },
  ];

  const columns = [
    { header: 'Customer & Site', key: 'name' as const },
    { header: 'Tonnage (Tonnes)', key: 'tonnage' as const, format: 'number' as const },
    { header: 'Total Value (NGN)', key: 'amount' as const, format: 'number' as const },
  ];

  const csv = buildCsvContent(columns, rows);
  const lines = csv.split('\r\n');

  assert.equal(lines[0], 'Customer & Site,Tonnage (Tonnes),Total Value (NGN)');
  assert.equal(lines[1], '"Dangote, Lekki Site",150.5,2450000');
  assert.equal(lines[2], '"Julius Berger ""Phase 2""",90,1800000');
});
