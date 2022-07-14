import {asserts} from '../../deps.test.ts';
import {FasterStochasticOscillator, StochasticOscillator} from './StochasticOscillator.ts';
import {NotEnoughDataError} from '../error/index.ts';

Deno.test('StochasticOscillator', async t => {
  await t.step('update', async t => {
    await t.step('calculates the StochasticOscillator', () => {
      // Test data verified with:
      // https://tulipindicators.org/stoch
      const candles = [
        {high: 82.15, low: 81.29, close: 81.59},
        {high: 81.89, low: 80.64, close: 81.06},
        {high: 83.03, low: 81.31, close: 82.87},
        {high: 83.3, low: 82.65, close: 83.0},
        {high: 83.85, low: 83.07, close: 83.61},
        {high: 83.9, low: 83.11, close: 83.15},
        {high: 83.33, low: 82.49, close: 82.84},
        {high: 84.3, low: 82.3, close: 83.99},
        {high: 84.84, low: 84.15, close: 84.55},
        {high: 85.0, low: 84.11, close: 84.36},
        {high: 85.9, low: 84.03, close: 85.53},
        {high: 86.58, low: 85.39, close: 86.54},
        {high: 86.98, low: 85.76, close: 86.89},
        {high: 88.0, low: 87.17, close: 87.77},
        {high: 87.87, low: 87.01, close: 87.29},
      ];

      const stochKs = ['77.39', '83.13', '84.87', '88.36', '95.25', '96.74', '91.09'];

      const stochDs = ['75.70', '78.01', '81.79', '85.45', '89.49', '93.45', '94.36'];

      const stoch = new StochasticOscillator(5, 3, 3);
      const fasterStoch = new FasterStochasticOscillator(5, 3, 3);

      for (const candle of candles) {
        const stochResult = stoch.update(candle);
        const fasterStochResult = fasterStoch.update(candle);
        if (fasterStoch.isStable && fasterStochResult && stoch.isStable && stochResult) {
          const stochD = stochDs.shift()!;
          const stochK = stochKs.shift()!;

          asserts.assertEquals(stochResult.stochD.toFixed(2), stochD);
          asserts.assertEquals(fasterStochResult.stochD.toFixed(2), stochD);

          asserts.assertEquals(stochResult.stochD.toFixed(2), stochD);
          asserts.assertEquals(fasterStochResult.stochK.toFixed(2), stochK);
        }
      }

      asserts.assertEquals(stoch.isStable, true);
      asserts.assertEquals(fasterStoch.isStable, true);

      asserts.assertEquals(stoch.getResult().stochK.toFixed(2), '91.09');
      asserts.assertEquals(fasterStoch.getResult().stochK.toFixed(2), '91.09');
    });
  });

  await t.step('getResult', async t => {
    await t.step('throws an error when there is not enough input data', () => {
      const stoch = new StochasticOscillator(5, 3, 3);

      stoch.update({close: 1, high: 1, low: 1});
      stoch.update({close: 1, high: 2, low: 1});
      stoch.update({close: 1, high: 3, low: 1});
      stoch.update({close: 1, high: 4, low: 1});
      stoch.update({close: 1, high: 5, low: 1}); // Emits 1st of 3 required values for %d period
      stoch.update({close: 1, high: 6, low: 1}); // Emits 2nd of 3 required values for %d period

      try {
        stoch.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }

      const fasterStoch = new FasterStochasticOscillator(5, 3, 3);

      try {
        fasterStoch.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });

    await t.step('prevents division by zero errors when highest high and lowest low have the same value', () => {
      const stoch = new StochasticOscillator(5, 3, 3);
      stoch.update({close: 100, high: 100, low: 100});
      stoch.update({close: 100, high: 100, low: 100});
      stoch.update({close: 100, high: 100, low: 100});
      stoch.update({close: 100, high: 100, low: 100});
      stoch.update({close: 100, high: 100, low: 100});
      stoch.update({close: 100, high: 100, low: 100});
      stoch.update({close: 100, high: 100, low: 100});
      stoch.update({close: 100, high: 100, low: 100});
      const result = stoch.update({close: 100, high: 100, low: 100})!;
      asserts.assertEquals(result.stochK.toFixed(2), '0.00');
      asserts.assertEquals(result.stochD.toFixed(2), '0.00');

      const fasterStoch = new FasterStochasticOscillator(1, 2, 2);
      fasterStoch.update({close: 100, high: 100, low: 100});
      fasterStoch.update({close: 100, high: 100, low: 100});
      const {stochK, stochD} = fasterStoch.getResult();
      asserts.assertEquals(stochK.toFixed(2), '0.00');
      asserts.assertEquals(stochD.toFixed(2), '0.00');
    });
  });
});
