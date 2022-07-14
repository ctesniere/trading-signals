import {asserts} from '../../deps.test.ts';
import {CCI, FasterCCI} from './CCI.ts';
import {NotEnoughDataError} from '../error/index.ts';

Deno.test('CCI', async t => {
  // Test data verified with:
  // https://tulipindicators.org/cci
  const candles = [
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
  const expectations = ['166.67', '82.02', '95.50', '130.91', '99.16', '116.34', '71.93'];

  await t.step('getResult', async t => {
    await t.step('calculates the Commodity Channel Index (CCI)', () => {
      const cci = new CCI(5);
      const fasterCCI = new FasterCCI(5);
      for (const candle of candles) {
        cci.update(candle);
        fasterCCI.update(candle);
        if (cci.isStable && fasterCCI.isStable) {
          const expected = expectations.shift();
          asserts.assertEquals(cci.getResult().toFixed(2), expected!);
          asserts.assertEquals(fasterCCI.getResult().toFixed(2), expected!);
        }
      }
      const actual = cci.getResult().toFixed(2);
      asserts.assertEquals(actual, '71.93');
    });

    await t.step("stores the highest and lowest result throughout the indicator's lifetime", () => {
      const cci = new CCI(5);
      const fasterCCI = new FasterCCI(5);
      for (const candle of candles) {
        cci.update(candle);
        fasterCCI.update(candle);
      }
      asserts.assertEquals(cci.highest!.toFixed(2), '166.67');
      asserts.assertEquals(cci.lowest!.toFixed(2), '71.93');
      asserts.assertEquals(fasterCCI.highest!.toFixed(2), '166.67');
      asserts.assertEquals(fasterCCI.lowest!.toFixed(2), '71.93');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const cci = new CCI(5);
      try {
        cci.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }

      const fasterCCI = new FasterCCI(5);
      try {
        fasterCCI.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });
});
