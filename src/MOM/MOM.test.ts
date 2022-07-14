import {asserts} from '../../deps.test.ts';
import {FasterMOM, MOM} from './MOM.ts';
import {NotEnoughDataError} from '../error/index.ts';

Deno.test('MOM', async t => {
  await t.step('getResult', async t => {
    await t.step('returns the price 5 intervals ago', () => {
      // Test data verified with:
      // https://github.com/TulipCharts/tulipindicators/blob/v0.8.0/tests/untest.txt#L286-L288
      const inputs = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];
      const outputs = [1.56, 1.78, 1.12, 1.55, 0.75, 2.38, 3.7, 2.9, 3.22, 2.93];
      const momentum = new MOM(5);
      const fasterMomentum = new FasterMOM(5);

      for (const input of inputs) {
        momentum.update(input);
        fasterMomentum.update(input);
        if (momentum.isStable && fasterMomentum.isStable) {
          const actual = momentum.getResult().toFixed(3);
          const expected = outputs.shift()!;
          asserts.assertEquals(parseFloat(actual), expected);
          asserts.assertEquals(fasterMomentum.getResult().toFixed(2), expected.toFixed(2));
        }
      }

      asserts.assertEquals(momentum.isStable, true);
      asserts.assertEquals(fasterMomentum.isStable, true);

      asserts.assertEquals(momentum.lowest!.toFixed(2), '0.75');
      asserts.assertEquals(fasterMomentum.lowest!.toFixed(2), '0.75');

      asserts.assertEquals(momentum.highest!.toFixed(2), '3.70');
      asserts.assertEquals(fasterMomentum.highest!.toFixed(2), '3.70');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const momentum = new MOM(5);

      try {
        momentum.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });
});
