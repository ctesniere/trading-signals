import {asserts} from '../../deps.test.ts';
import Big from '../../deps.ts';
import {SMA, FasterSMA} from '../index.ts';
import {NotEnoughDataError} from '../error/NotEnoughDataError.ts';

Deno.test('SMA', async t => {
  await t.step('prices', async t => {
    await t.step('does not cache more prices than necessary to fill the interval', () => {
      const sma = new SMA(3);
      sma.update(1);
      sma.update(2);
      asserts.assertEquals(sma.prices.length, 2);
      sma.update(3);
      asserts.assertEquals(sma.prices.length, 3);
      sma.update(4);
      asserts.assertEquals(sma.prices.length, 3);
      sma.update(5);
      asserts.assertEquals(sma.prices.length, 3);
      sma.update(6);
      asserts.assertEquals(sma.prices.length, 3);
    });
  });

  await t.step('isStable', async t => {
    await t.step('knows when there is enough input data', () => {
      const sma = new SMA(3);
      sma.update(40);
      sma.update(30);
      asserts.assertEquals(sma.isStable, false);
      sma.update(20);
      asserts.assertEquals(sma.isStable, true);
      sma.update('10');
      sma.update(new Big(30));
      asserts.assertEquals(sma.getResult().valueOf(), '20');
      asserts.assertEquals(sma.lowest!.toFixed(2), '20.00');
      asserts.assertEquals(sma.highest!.toFixed(2), '30.00');
    });
  });

  await t.step('getResult', async t => {
    await t.step('calculates the moving average based on the last 5 prices', () => {
      // Test data verified with:
      // https://github.com/TulipCharts/tulipindicators/blob/v0.8.0/tests/untest.txt#L359-L361
      const prices = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];
      const expectations = [
        '82.426',
        '82.738',
        '83.094',
        '83.318',
        '83.628',
        '83.778',
        '84.254',
        '84.994',
        '85.574',
        '86.218',
        '86.804',
      ];
      const sma = new SMA(5);
      const fasterSMA = new FasterSMA(5);

      for (const price of prices) {
        const result = sma.update(price);
        const fasterResult = fasterSMA.update(price);

        if (result && fasterResult) {
          const expected = expectations.shift()!;
          asserts.assertEquals(result.toFixed(3), expected);
          asserts.assertEquals(fasterResult.toFixed(3), expected);
        }
      }

      asserts.assertEquals(sma.isStable, true);
      asserts.assertEquals(fasterSMA.isStable, true);

      asserts.assertEquals(sma.getResult().toFixed(3), '86.804');
      asserts.assertEquals(fasterSMA.getResult(), 86.804);

      asserts.assertEquals(sma.highest!.toFixed(2), '86.80');
      asserts.assertEquals(fasterSMA.highest!.toFixed(2), '86.80');

      asserts.assertEquals(sma.lowest!.toFixed(2), '82.43');
      asserts.assertEquals(fasterSMA.lowest!.toFixed(2), '82.43');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const sma = new SMA(26);

      try {
        sma.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }

      const fasterSMA = new FasterSMA(5);

      try {
        fasterSMA.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });

  await t.step('getResultFromBatch', async t => {
    await t.step("doesn't crash when the array is empty", () => {
      const result = SMA.getResultFromBatch([]);
      asserts.assertEquals(result.valueOf(), '0');
    });
  });
});
