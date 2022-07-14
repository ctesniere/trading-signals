import Big from '../../deps.ts';
import {asserts} from '../../deps.test.ts';
import {FasterROC, ROC} from './ROC.ts';
import {NotEnoughDataError} from '../error/index.ts';

Deno.test('ROC', async t => {
  await t.step('getResult', async t => {
    await t.step('identifies an up-trending asset by a positive ROC', () => {
      // Test data verified with:
      // https://tulipindicators.org/roc
      const prices = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];

      const expectations = [
        0.01911999019, 0.02195904268, 0.0135151442, 0.01867469879, 0.00897021887, 0.02862297053, 0.04466441332,
        0.03452791999, 0.03808397397, 0.03473210052,
      ];

      const roc = new ROC(5);
      const fasterROC = new FasterROC(5);

      for (const price of prices) {
        roc.update(price);
        fasterROC.update(price);

        if (roc.isStable) {
          const expected = expectations.shift()!;
          asserts.assertEquals(roc.getResult().toFixed(2), expected.toFixed(2));
        }
      }

      asserts.assertEquals(roc.lowest!.toFixed(2), '0.01');
      asserts.assertEquals(fasterROC.lowest!.toFixed(2), '0.01');

      asserts.assertEquals(roc.highest!.toFixed(2), '0.04');
      asserts.assertEquals(fasterROC.highest!.toFixed(2), '0.04');
    });

    await t.step('identifies a down-trending asset by a negative ROC', () => {
      const roc = new ROC(5);

      const prices = [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100];

      prices.forEach(price => {
        roc.update(new Big(price));
      });

      asserts.assertEquals(roc.lowest!.toFixed(2), '-0.83');
      asserts.assertEquals(roc.highest!.toFixed(2), '-0.50');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const roc = new ROC(6);

      try {
        roc.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });

  await t.step('isStable', async t => {
    await t.step('returns true when it can return reliable data', () => {
      const interval = 5;
      const indicator = new ROC(interval);

      const mockedPrices = [
        new Big('0.00019040'),
        new Big('0.00019071'),
        new Big('0.00019198'),
        new Big('0.00019220'),
        new Big('0.00019214'),
        new Big('0.00019205'),
      ];

      asserts.assertEquals(mockedPrices.length, interval + 1);
      asserts.assertEquals(indicator.isStable, false);

      mockedPrices.forEach(price => indicator.update(price));

      asserts.assertEquals(indicator.isStable, true);
    });
  });
});
