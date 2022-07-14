import Big from '../../deps.ts';
import {asserts} from '../../deps.test.ts';
import {DEMA, FasterDEMA} from './DEMA.ts';
import {NotEnoughDataError} from '../error/NotEnoughDataError.ts';

const dema10results = [
  81, 62.157024793388416, 65.1412471825695, 49.61361928829999, 42.570707415663364, 34.597495090487996,
  44.47997295246192, 58.6168391922143, 71.4979863711489, 48.963944850563, 60.095241192962106, 66.41965473810654,
  69.77997604557987, 49.75572911767095, 61.08641574881719, 65.56112611350791, 54.65374623818491, 57.51231851211959,
  51.73955057939423, 36.941596820151815, 27.434153499662216, 24.890025210750593, 33.14097982029734, 30.163817870645254,
  40.330715478873344, 45.63811915119551, 36.045947422710505, 53.12735486322183, 64.78921092296176, 72.9995704035162,
  83.22304838955624, 58.85287916072168, 62.841348382387075, 42.93804766689409, 36.82301007497254, 26.454331684513562,
  46.374329400503385, 53.28360623846342, 38.891184741941984,
];

Deno.test('DEMA', async t => {
  await t.step('getResult', async t => {
    await t.step('calculates the DEMA with interval 10', () => {
      const prices = [
        81, 24, 75, 21, 34, 25, 72, 92, 99, 2, 86, 80, 76, 8, 87, 75, 32, 65, 41, 9, 13, 26, 56, 28, 65, 58, 17, 90, 87,
        86, 99, 3, 70, 1, 27, 9, 92, 68, 9,
      ];

      const dema = new DEMA(10);
      const fasterDEMA = new FasterDEMA(10);

      prices.forEach((price, index) => {
        dema.update(price);
        fasterDEMA.update(price);
        if (dema.isStable) {
          const result = new Big(dema10results[index]);
          asserts.assertEquals(dema.getResult().toPrecision(12), result.toPrecision(12));
          asserts.assertEquals(fasterDEMA.getResult().toPrecision(4), result.toPrecision(4));
        }
      });

      asserts.assertEquals(dema.isStable, true);
      asserts.assertEquals(fasterDEMA.isStable, true);

      asserts.assertEquals(dema.lowest!.toFixed(2), '24.89');
      asserts.assertEquals(fasterDEMA.lowest!.toFixed(2), '24.89');

      asserts.assertEquals(dema.highest!.toFixed(2), '83.22');
      asserts.assertEquals(fasterDEMA.highest!.toFixed(2), '83.22');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const dema = new DEMA(10);

      try {
        dema.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });

  await t.step('isStable', async t => {
    await t.step('is stable when there are enough inputs to fill the interval', () => {
      const dema = new DEMA(2);
      asserts.assertEquals(dema.isStable, false);
      dema.update(1);
      dema.update(2);
      asserts.assertEquals(dema.isStable, true);
      asserts.assertEquals(dema.lowest!.toFixed(2), '1.00');
      asserts.assertEquals(dema.highest!.toFixed(2), '1.89');
    });
  });
});
