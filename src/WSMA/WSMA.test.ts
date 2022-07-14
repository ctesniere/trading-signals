import {asserts} from '../../deps.test.ts';
import {FasterWSMA, WSMA} from './WSMA.ts';
import {NotEnoughDataError} from '../error/index.ts';

Deno.test('WSMA', async t => {
  await t.step('getResult', async t => {
    await t.step('calculates the WSMA based on a SMA', () => {
      // Test data verified with:
      // https://runkit.com/anandaravindan/wema
      const prices = [11, 12, 13, 14, 15, 16, 18, 19, 22, 23, 23];
      const expectations = ['13.00', '13.60', '14.48', '15.38', '16.71', '17.97', '18.97'];
      const wsma = new WSMA(5);

      for (const price of prices) {
        wsma.update(price);
        if (wsma.isStable) {
          const expected = expectations.shift();
          asserts.assertEquals(wsma.getResult().toFixed(2), expected!);
        }
      }

      asserts.assertEquals(wsma.getResult().toFixed(2), '18.97');
    });

    await t.step('is compatible with results from Tulip Indicators (TI)', () => {
      // Test data verified with:
      // https://github.com/TulipCharts/tulipindicators/blob/v0.8.0/tests/atoz.txt#L299-L302
      const prices = [
        62.125, 61.125, 62.3438, 65.3125, 63.9688, 63.4375, 63, 63.7812, 63.4062, 63.4062, 62.4375, 61.8438,
      ];
      const expectations = ['62.9750', '63.0675', '63.0540', '63.1995', '63.2408', '63.2739', '63.1066', '62.8540'];
      const wsma = new WSMA(5);
      const fasterWSMA = new FasterWSMA(5);

      for (const price of prices) {
        wsma.update(price);
        fasterWSMA.update(price);
        if (wsma.isStable && fasterWSMA.isStable) {
          const expected = expectations.shift();
          asserts.assertEquals(wsma.getResult().toFixed(4), expected!);
          asserts.assertEquals(fasterWSMA.getResult().toFixed(4), expected!);
        }
      }

      asserts.assertEquals(wsma.isStable, true);
      asserts.assertEquals(fasterWSMA.isStable, true);

      asserts.assertEquals(wsma.getResult().toFixed(4), '62.8540');
      asserts.assertEquals(fasterWSMA.getResult().toFixed(4), '62.8540');

      asserts.assertEquals(wsma.highest!.toFixed(4), '63.2739');
      asserts.assertEquals(fasterWSMA.highest!.toFixed(4), '63.2739');

      asserts.assertEquals(wsma.lowest!.toFixed(4), '62.8540');
      asserts.assertEquals(fasterWSMA.lowest!.toFixed(4), '62.8540');
    });

    await t.step('throws an error when there is no input data', () => {
      const wsma = new WSMA(3);

      try {
        wsma.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });

    await t.step('throws an error when there is not enough input data', () => {
      const wsma = new WSMA(3);
      wsma.update(1);
      wsma.update(2);

      try {
        wsma.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });

  await t.step('isStable', async t => {
    await t.step('is stable when the inputs can fill the signal interval', () => {
      const wsma = new WSMA(3);
      wsma.update(1);
      wsma.update(2);
      asserts.assertEquals(wsma.isStable, false);
      wsma.update(3);
      asserts.assertEquals(wsma.isStable, true);
    });
  });
});
