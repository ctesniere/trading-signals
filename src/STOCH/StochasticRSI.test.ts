import {asserts} from '../../deps.test.ts';
import {FasterStochasticRSI, StochasticRSI} from './StochasticRSI.ts';

Deno.test('StochasticRSI', async t => {
  await t.step('getResult', async t => {
    await t.step('calculates the Stochastic RSI', () => {
      // Test data verified with:
      // https://github.com/TulipCharts/tulipindicators/blob/0bc8dfc46cfc89366bf8cef6dfad1fb6f81b3b7b/tests/untest.txt#L382-L384
      const prices = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];
      const expectations = ['0.658', '1.000', '1.000', '1.000', '1.000', '0.000'];
      const stochRSI = new StochasticRSI(5);
      const fasterStochRSI = new FasterStochasticRSI(5);
      for (const price of prices) {
        const result = stochRSI.update(price);
        const fasterResult = fasterStochRSI.update(price);
        if (result && fasterResult) {
          const expected = expectations.shift();
          asserts.assertEquals(result.toFixed(3), expected!);
          asserts.assertEquals(fasterResult.toFixed(3), expected!);
        }
      }
      asserts.assertEquals(stochRSI.isStable, true);
      asserts.assertEquals(fasterStochRSI.isStable, true);

      asserts.assertEquals(stochRSI.getResult().valueOf(), '0');
      asserts.assertEquals(fasterStochRSI.getResult(), 0);

      asserts.assertEquals(stochRSI.highest!.valueOf(), '1');
      asserts.assertEquals(fasterStochRSI.highest!.valueOf(), 1);

      asserts.assertEquals(stochRSI.lowest!.valueOf(), '0');
      asserts.assertEquals(fasterStochRSI.lowest!.valueOf(), 0);
    });

    await t.step('catches division by zero errors', () => {
      const stochRSI = new StochasticRSI(2);
      stochRSI.update(2);
      stochRSI.update(2);
      stochRSI.update(2);
      stochRSI.update(2);
      asserts.assertEquals(stochRSI.getResult().valueOf(), '100');

      const fasterStochRSI = new FasterStochasticRSI(2);
      fasterStochRSI.update(2);
      fasterStochRSI.update(2);
      fasterStochRSI.update(2);
      fasterStochRSI.update(2);
      asserts.assertEquals(fasterStochRSI.getResult().valueOf(), 100);
    });
  });
});
