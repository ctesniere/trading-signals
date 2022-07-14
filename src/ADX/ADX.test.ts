import {asserts} from '../../deps.test.ts';
import {ADX, FasterADX} from './ADX.ts';

Deno.test('ADX', async t => {
  await t.step('getResult', async t => {
    await t.step('calculates the Average Directional Index (ADX)', () => {
      // Test data verified with:
      // https://tulipindicators.org/adx
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

      const expectations = [41.38, 44.29, 49.42, 54.92, 59.99, 65.29, 67.36];

      const adx = new ADX(5);
      const fasterADX = new FasterADX(5);

      for (const candle of candles) {
        adx.update(candle);
        fasterADX.update(candle);
        if (adx.isStable && fasterADX.isStable) {
          const expected = expectations.shift();
          asserts.assertEquals(adx.getResult().toFixed(2), `${expected}`);
          asserts.assertEquals(fasterADX.getResult().toFixed(2), `${expected}`);
        }
      }

      asserts.assertEquals(adx.isStable, true);
      asserts.assertEquals(fasterADX.isStable, true);

      asserts.assertEquals(adx.getResult().toFixed(2), '67.36');
      asserts.assertEquals(fasterADX.getResult().toFixed(2), '67.36');

      asserts.assertEquals(adx.lowest!.toFixed(2), '41.38');
      asserts.assertEquals(fasterADX.lowest!.toFixed(2), '41.38');

      asserts.assertEquals(adx.highest!.toFixed(2), '67.36');
      asserts.assertEquals(fasterADX.highest!.toFixed(2), '67.36');

      // Verify uptrend detection (+DI > -DI):
      asserts.assertEquals(adx.pdi!.gt(adx.mdi!), true);
      asserts.assertEquals(fasterADX.pdi > fasterADX.mdi, true);

      asserts.assertEquals(adx.pdi!.toFixed(2), '0.42');
      asserts.assertEquals(fasterADX.pdi!.toFixed(2), '0.42');

      asserts.assertEquals(adx.mdi!.toFixed(2), '0.06');
      asserts.assertEquals(fasterADX.mdi!.toFixed(2), '0.06');
    });
  });
});
