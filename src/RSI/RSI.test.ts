import {asserts} from '../../deps.test.ts';
import {FasterRSI, RSI} from './RSI.ts';
import {NotEnoughDataError} from '../error/index.ts';

Deno.test('RSI', async function (t) {
  await t.step('getResult', async function (t) {
    await t.step('calculates the relative strength index', function () {
      // Test data verified with:
      // https://github.com/TulipCharts/tulipindicators/blob/v0.8.0/tests/untest.txt#L347-L349
      const prices = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];
      const expectations = [
        '72.034',
        '64.927',
        '75.936',
        '79.796',
        '74.713',
        '83.033',
        '87.478',
        '88.755',
        '91.483',
        '78.498',
      ];
      const rsi = new RSI(5);
      const fasterRSI = new FasterRSI(5);
      for (const price of prices) {
        rsi.update(price);
        fasterRSI.update(price);
        if (rsi.isStable && fasterRSI.isStable) {
          const expected = expectations.shift();
          asserts.assertEquals(rsi.getResult().toFixed(3), expected!);
          asserts.assertEquals(fasterRSI.getResult().toFixed(3), expected!);
        }
      }

      asserts.assertEquals(rsi.isStable, true);
      asserts.assertEquals(fasterRSI.isStable, true);

      asserts.assertEquals(rsi.getResult().toFixed(2), '78.50');
      asserts.assertEquals(fasterRSI.getResult().toFixed(2), '78.50');

      asserts.assertEquals(rsi.lowest?.toFixed(2), '64.93');
      asserts.assertEquals(fasterRSI.lowest?.toFixed(2), '64.93');

      asserts.assertEquals(rsi.highest?.toFixed(2), '91.48');
      asserts.assertEquals(fasterRSI.highest?.toFixed(2), '91.48');
    });

    await t.step('catches division by zero errors', function () {
      const rsi = new RSI(2);
      rsi.update(2);
      rsi.update(2);
      rsi.update(2);
      asserts.assertEquals(rsi.getResult().valueOf(), '100');

      const fasterRSI = new FasterRSI(2);
      fasterRSI.update(2);
      fasterRSI.update(2);
      fasterRSI.update(2);
      asserts.assertEquals(fasterRSI.getResult().valueOf(), 100);
    });

    await t.step('throws an error when there is not enough input data', function () {
      const rsi = new RSI(2);
      rsi.update(0);
      asserts.assertEquals(rsi.isStable, false);

      try {
        rsi.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(rsi.isStable, false);
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });
});
