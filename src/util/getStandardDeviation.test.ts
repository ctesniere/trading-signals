import {asserts} from '../../deps.test.ts';
import {SMA} from '../SMA/SMA.ts';
import {getFasterStandardDeviation, getStandardDeviation} from './getStandardDeviation.ts';

Deno.test('getStandardDeviation', async t => {
  await t.step('returns the standard deviation', () => {
    const prices = [9, 2, 5, 4, 12, 7, 8, 11, 9, 3, 7, 4, 12, 5, 4, 10, 9, 6, 9, 4];
    const std = getStandardDeviation(prices);
    asserts.assertEquals(std.toFixed(2), '2.98');
  });

  await t.step(
    'can be used to calculate a "Window Rolling Standard Deviation / Standard Deviation Over Period"',
    () => {
      // Test data verified with:
      // https://github.com/TulipCharts/tulipindicators/blob/v0.8.0/tests/untest.txt#L367-L369
      const prices = [81.59, 81.06, 82.87, 83.0, 83.61];
      const average = SMA.getResultFromBatch(prices);
      const stdDev = getStandardDeviation(prices, average);
      asserts.assertEquals(stdDev.toFixed(2), '0.95');
    }
  );
});

Deno.test('getFasterStandardDeviation', async t => {
  await t.step('only works with the primitive data type number', () => {
    const prices = [9, 2, 5, 4, 12, 7, 8, 11, 9, 3, 7, 4, 12, 5, 4, 10, 9, 6, 9, 4];
    const std = getFasterStandardDeviation(prices);
    asserts.assertEquals(std.toFixed(2), '2.98');
    const fivePrices = [81.59, 81.06, 82.87, 83.0, 83.61];
    const stdDev = getStandardDeviation(fivePrices, SMA.getResultFromBatch(fivePrices));
    asserts.assertEquals(stdDev.toFixed(2), '0.95');
  });
});
