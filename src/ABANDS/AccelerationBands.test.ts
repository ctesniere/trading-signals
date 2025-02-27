import {asserts} from '../../deps.test.ts';
import {AccelerationBands, FasterAccelerationBands} from './AccelerationBands.ts';
import {NotEnoughDataError} from '../error/index.ts';
import {SMA} from '../SMA/SMA.ts';
import {EMA} from '../EMA/EMA.ts';
import {HighLowCloseNumber} from '../util/index.ts';

Deno.test('AccelerationBands', async t => {
  await t.step('constructor', async t => {
    await t.step('worksrc/ABANDS/AccelerationBands.test.tss with different kinds of indicators', () => {
      const accBandsWithSMA = new AccelerationBands(20, 2, SMA);
      const accBandsWithEMA = new AccelerationBands(20, 2, EMA);
      asserts.assertExists(accBandsWithSMA);
      asserts.assertExists(accBandsWithEMA);
    });
  });

  await t.step('getResult', async t => {
    await t.step('returns upper, middle and lower bands', () => {
      const accBands = new AccelerationBands(20, 4);

      asserts.assertEquals(accBands.isStable, false);
      const fasterAccBands = new FasterAccelerationBands(20, 4);
      asserts.assertEquals(fasterAccBands.isStable, false);

      // Test data from: https://github.com/QuantConnect/Lean/blob/master/Tests/TestData/spy_acceleration_bands_20_4.txt
      const candles = [
        {close: 195.55, high: 198.05, low: 194.96, open: 196.25},
        {close: 192.59, high: 193.86, low: 191.61, open: 192.88},
        {close: 197.43, high: 197.61, low: 195.17, open: 195.97},
        {close: 194.79, high: 199.47, low: 194.35, open: 199.32},
        {close: 195.85, high: 197.22, low: 194.25, open: 194.5},
        {close: 196.74, high: 196.82, low: 194.53, open: 195.32},
        {close: 196.01, high: 197.01, low: 195.43, open: 196.95},
        {close: 198.46, high: 198.99, low: 195.96, open: 196.59},
        {close: 200.18, high: 200.41, low: 198.41, open: 198.82},
        {close: 199.73, high: 202.89, low: 199.28, open: 199.96},
        {close: 195.45, high: 198.68, low: 194.96, open: 195.74},
        {close: 196.46, high: 197.68, low: 195.21, open: 196.45},
        {close: 193.91, high: 194.46, low: 192.56, open: 193.9},
        {close: 193.6, high: 194.67, low: 192.91, open: 194.13},
        {close: 192.9, high: 193.45, low: 190.56, open: 192.13},
        {close: 192.85, high: 195, low: 191.81, open: 194.61},
        {close: 188.01, high: 191.91, low: 187.64, open: 191.75},
        {close: 188.12, high: 189.74, low: 186.93, open: 188.24},
        {close: 191.63, high: 191.83, low: 189.44, open: 190.4},
        {close: 192.13, high: 192.49, low: 189.82, open: 192.03},
      ];
      for (const candle of candles) {
        const {close, high, low} = candle;
        accBands.update({close, high, low});
        fasterAccBands.update({close, high, low});
      }
      let result = accBands.getResult();
      let fasterResult = fasterAccBands.getResult();
      // See: https://github.com/QuantConnect/Lean/blob/master/Tests/TestData/spy_acceleration_bands_20_4.txt#L21

      asserts.assertEquals(accBands.isStable, true);
      asserts.assertEquals(fasterAccBands.isStable, true);

      asserts.assertEquals(result.lower.toFixed(4), '187.6891');
      asserts.assertEquals(fasterResult.lower.toFixed(4), '187.6891');

      asserts.assertEquals(result.middle.toFixed(4), '194.6195');
      asserts.assertEquals(fasterResult.middle.toFixed(4), '194.6195');

      asserts.assertEquals(result.upper.toFixed(4), '201.8016');
      asserts.assertEquals(fasterResult.upper.toFixed(4), '201.8016');

      // See: https://github.com/QuantConnect/Lean/blob/master/Tests/TestData/spy_acceleration_bands_20_4.txt#L22
      const candle: HighLowCloseNumber = {close: 195, high: 195.03, low: 189.12};
      accBands.update(candle);
      fasterAccBands.update(candle);
      result = accBands.getResult();
      fasterResult = fasterAccBands.getResult();
      asserts.assertEquals(result.lower.toFixed(4), '187.1217');
      asserts.assertEquals(fasterResult.lower.toFixed(4), '187.1217');
      asserts.assertEquals(result.middle.toFixed(4), '194.5920');
      asserts.assertEquals(fasterResult.middle.toFixed(4), '194.5920');
      asserts.assertEquals(result.upper.toFixed(4), '201.9392');
      asserts.assertEquals(fasterResult.upper.toFixed(4), '201.9392');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const accBands = new AccelerationBands(20, 2);
      try {
        accBands.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
      const fasterAccBands = new FasterAccelerationBands(20, 2);
      try {
        fasterAccBands.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });

  await t.step('update', async t => {
    await t.step("doesn't crash when supplying zeroes", () => {
      const accBands = new AccelerationBands(20, 2);
      return accBands.update({
        high: 0,
        low: 0,
        close: 0,
      });
    });
  });
});

Deno.test('FaserAccelerationBands', async t => {
  await t.step("doesn't crash when supplying zeroes", () => {
    const accBands = new FasterAccelerationBands(20, 2);
    return accBands.update({
      high: 0,
      low: 0,
      close: 0,
    });
  });
});
