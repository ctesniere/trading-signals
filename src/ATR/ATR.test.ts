import {asserts} from '../../deps.test.ts';
import {ATR, FasterATR} from './ATR.ts';
import {NotEnoughDataError} from '../index.ts';

Deno.test('ATR', async t => {
  await t.step('getResult', async t => {
    await t.step('calculates the Average True Range (ATR)', async () => {
      // Test data verified with:
      // https://tulipindicators.org/atr
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
      const expectations = ['1.12', '1.05', '1.01', '1.21', '1.14', '1.09', '1.24', '1.23', '1.23', '1.21', '1.14'];

      const atr = new ATR(5);
      const fasterATR = new FasterATR(5);

      for (const candle of candles) {
        atr.update(candle);
        fasterATR.update(candle);
        if (atr.isStable && fasterATR.isStable) {
          const expected = expectations.shift();
          asserts.assertEquals(atr.getResult().toFixed(2), expected!);
          asserts.assertEquals(fasterATR.getResult().toFixed(2), expected!);
        }
      }

      asserts.assertEquals(atr.isStable, true);
      asserts.assertEquals(fasterATR.isStable, true);

      asserts.assertEquals(atr.getResult().toFixed(2), '1.14');
      asserts.assertEquals(fasterATR.getResult().toFixed(2), '1.14');

      asserts.assertEquals(atr.lowest!.toFixed(2), '1.01');
      asserts.assertEquals(fasterATR.lowest!.toFixed(2), '1.01');

      asserts.assertEquals(atr.highest!.toFixed(2), '1.24');
      asserts.assertEquals(fasterATR.highest!.toFixed(2), '1.24');
    });

    await t.step('throws an error when there is not enough input data', async () => {
      const atr = new ATR(14);

      try {
        atr.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });
});
