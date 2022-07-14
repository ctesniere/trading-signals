import {asserts} from '../../deps.test.ts';
import {FasterMAD, MAD} from './MAD.ts';
import {NotEnoughDataError} from '../error/NotEnoughDataError.ts';

Deno.test('MAD', async t => {
  // Test data verified with:
  // https://tulipindicators.org/md
  const prices = [
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
  ];
  const expectations = ['0.88', '0.67', '0.23', '0.39', '0.51', '0.63', '0.67', '0.83', '0.91', '1.02', '0.62'];

  await t.step('getResult', async t => {
    await t.step('calculates the absolute deviation from the mean over a period', () => {
      // Test data verified with:
      // https://en.wikipedia.org/wiki/Average_absolute_deviation#Mean_absolute_deviation_around_a_central_point
      const prices = [2, 2, 3, 4, 14];
      const mad = new MAD(5);
      const fasterMAD = new FasterMAD(5);
      for (const price of prices) {
        mad.update(price);
        fasterMAD.update(price);
      }
      const actual = mad.getResult().valueOf();
      asserts.assertEquals(actual, '3.6');
      asserts.assertEquals(fasterMAD.getResult().valueOf(), 3.6);
    });

    await t.step('is compatible with results from Tulip Indicators (TI)', () => {
      const mad = new MAD(5);
      const fasterMAD = new FasterMAD(5);
      for (const price of prices) {
        mad.update(price);
        fasterMAD.update(price);
        if (mad.isStable && fasterMAD.isStable) {
          const expected = expectations.shift()!;
          asserts.assertEquals(mad.getResult().toFixed(2), expected);
          asserts.assertEquals(fasterMAD.getResult().toFixed(2), expected);
        }
      }
      asserts.assertEquals(mad.getResult().toFixed(2), '0.62');
      asserts.assertEquals(fasterMAD.getResult().toFixed(2), '0.62');
    });

    await t.step("stores the highest and lowest result throughout the indicator's lifetime", () => {
      const mad = new MAD(5);
      const fasterMAD = new FasterMAD(5);
      for (const price of prices) {
        mad.update(price);
        fasterMAD.update(price);
      }
      asserts.assertEquals(mad.highest!.valueOf(), '1.0184');
      asserts.assertEquals(mad.lowest!.valueOf(), '0.2288');
      asserts.assertEquals(fasterMAD.highest!.toFixed(4), '1.0184');
      asserts.assertEquals(fasterMAD.lowest!.toFixed(4), '0.2288');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const mad = new MAD(5);
      try {
        mad.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(true, error instanceof NotEnoughDataError);
      }

      const fasterMAD = new FasterMAD(5);
      try {
        fasterMAD.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(true, error instanceof NotEnoughDataError);
      }
    });
  });

  await t.step('getResultFromBatch', async t => {
    await t.step("doesn't crash when the array is empty", () => {
      const result = MAD.getResultFromBatch([]);
      asserts.assertEquals(result.valueOf(), '0');
    });

    await t.step('calculates the mean when no mean is given', () => {
      // Test data verified with:
      // https://en.wikipedia.org/wiki/Average_absolute_deviation#Mean_absolute_deviation_around_a_central_point
      const prices = [2, 2, 3, 4, 14];
      asserts.assertEquals(MAD.getResultFromBatch(prices).valueOf(), '3.6');
      asserts.assertEquals(FasterMAD.getResultFromBatch(prices).valueOf(), 3.6);
    });

    await t.step('accepts a supplied mean', () => {
      // Test data verified with:
      // https://en.wikipedia.org/wiki/Average_absolute_deviation#Mean_absolute_deviation_around_a_central_point
      const prices = [2, 2, 3, 4, 14];
      const mean = 5;
      asserts.assertEquals(MAD.getResultFromBatch(prices, mean).valueOf(), '3.6');
      asserts.assertEquals(FasterMAD.getResultFromBatch(prices, mean).valueOf(), 3.6);
    });
  });
});
