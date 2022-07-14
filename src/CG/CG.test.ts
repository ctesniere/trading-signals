import {asserts} from '../../deps.test.ts';
import {NotEnoughDataError} from '../error/NotEnoughDataError.ts';
import {CG, FasterCG} from './CG.ts';

Deno.test('CG', async t => {
  await t.step('prices', async t => {
    await t.step('does not cache more prices than necessary to fill the interval', () => {
      const cg = new CG(3, 6);
      cg.update(1);
      cg.update(2);
      asserts.assertEquals(cg.prices.length, 2);
      cg.update(3);
      asserts.assertEquals(cg.prices.length, 3);
      cg.update(4);
      asserts.assertEquals(cg.prices.length, 3);
      cg.update(5);
      asserts.assertEquals(cg.prices.length, 3);
      cg.update(6);
      asserts.assertEquals(cg.prices.length, 3);
    });
  });

  await t.step('isStable', async t => {
    await t.step('is stable when the inputs can fill the signal interval', () => {
      const cg = new CG(5, 6);
      cg.update(10);
      cg.update(20);
      cg.update(30);
      cg.update(40);
      asserts.assertEquals(cg.isStable, false);
      cg.update(50);
      asserts.assertEquals(cg.isStable, false);
      cg.update(60);
      asserts.assertEquals(cg.isStable, true);
    });
  });

  await t.step('getResult', async t => {
    await t.step('indicates a downtrend when the center of gravity falls below the signal line', () => {
      const cg = new CG(5, 10);
      const fasterCG = new FasterCG(5, 10);
      const values = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
      for (const value of values) {
        cg.update(value);
        fasterCG.update(value);
      }
      let cgResult = cg.getResult();
      let signalResult = cg.signal.getResult();
      asserts.assertEquals(cgResult.gt(signalResult), true);
      [150, 110, 90, 130].forEach(price => {
        cg.update(price);
        fasterCG.update(price);
      });

      asserts.assertEquals(cg.isStable, true);
      asserts.assertEquals(fasterCG.isStable, true);

      cgResult = cg.getResult();
      signalResult = cg.signal.getResult();
      asserts.assertEquals(cgResult.gt(signalResult), false);

      asserts.assertEquals(cgResult.toFixed(4), '2.7059');
      asserts.assertEquals(fasterCG.getResult().toFixed(4), '2.7059');

      asserts.assertEquals(cg.lowest!.toFixed(4), '2.6081');
      asserts.assertEquals(fasterCG.lowest!.toFixed(4), '2.6081');

      asserts.assertEquals(cg.highest!.toFixed(4), '3.1176');
      asserts.assertEquals(fasterCG.highest!.toFixed(4), '3.1176');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const cg = new CG(10, 20);

      try {
        cg.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });

    await t.step('is protected against division by zero errors', () => {
      const cg = new CG(1, 1);
      cg.update(0);
      asserts.assertEquals(cg.getResult().valueOf(), '0');

      const fasterCG = new FasterCG(1, 1);
      fasterCG.update(0);
      asserts.assertEquals(fasterCG.getResult().valueOf(), 0);
    });
  });
});
