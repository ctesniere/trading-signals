import {asserts} from '../../deps.test.ts';
import {DX, FasterDX} from './DX.ts';

Deno.test('DX', async t => {
  await t.step('getResult', async t => {
    await t.step('calculates the Directional Movement Index (DX)', () => {
      // Test data verified with:
      // https://tulipindicators.org/dx
      const candles = [
        {close: 81.59, high: 82.15, low: 81.29},
        {close: 81.06, high: 81.89, low: 80.64},
        {close: 82.87, high: 83.03, low: 81.31},
        {close: 83.0, high: 83.3, low: 82.65},
        {close: 83.61, high: 83.85, low: 83.07},
        {close: 83.15, high: 83.9, low: 83.11},
        {close: 82.84, high: 83.33, low: 82.49},
        {close: 83.99, high: 84.3, low: 82.3},
        {close: 84.55, high: 84.84, low: 84.15},
        {close: 84.36, high: 85.0, low: 84.11},
        {close: 85.53, high: 85.9, low: 84.03},
        {close: 86.54, high: 86.58, low: 85.39},
        {close: 86.89, high: 86.98, low: 85.76},
        {close: 87.77, high: 88.0, low: 87.17},
        {close: 87.29, high: 87.87, low: 87.01},
      ];

      const expectations = [
        '50.19',
        '51.36',
        '11.09',
        '41.52',
        '52.77',
        '55.91',
        '69.96',
        '76.90', // The official TI page has a rounding mistake here
        '80.26',
        '86.51',
        '75.61',
      ];

      const dx = new DX(5);
      const fasterDX = new FasterDX(5);

      for (const candle of candles) {
        dx.update(candle);
        fasterDX.update(candle);
        if (dx.isStable && fasterDX.isStable) {
          const expected = expectations.shift()!;
          asserts.assertEquals(dx.getResult().toFixed(2), expected);
          asserts.assertEquals(fasterDX.getResult().toFixed(2), expected);
        }
      }

      asserts.assertEquals(dx.isStable, true);
      asserts.assertEquals(fasterDX.isStable, true);

      asserts.assertEquals(dx.getResult().toFixed(2), '75.61');
      asserts.assertEquals(fasterDX.getResult().toFixed(2), '75.61');

      asserts.assertEquals(dx.lowest!.toFixed(2), '11.09');
      asserts.assertEquals(fasterDX.lowest!.toFixed(2), '11.09');

      asserts.assertEquals(dx.highest!.toFixed(2), '86.51');
      asserts.assertEquals(fasterDX.highest!.toFixed(2), '86.51');
    });

    await t.step('returns zero when there is no trend', () => {
      const candles = [
        {close: 95, high: 100, low: 90},
        {close: 95, high: 100, low: 90},
        {close: 95, high: 100, low: 90},
        {close: 95, high: 100, low: 90},
        {close: 95, high: 100, low: 90},
      ];

      const dx = new DX(5);
      const fasterDX = new FasterDX(5);

      for (const candle of candles) {
        dx.update(candle);
        fasterDX.update(candle);
      }

      asserts.assertEquals(dx.isStable, true);
      asserts.assertEquals(fasterDX.isStable, true);

      asserts.assertEquals(dx.getResult().valueOf(), '0');
      asserts.assertEquals(fasterDX.getResult().valueOf(), 0);
    });
  });
});
