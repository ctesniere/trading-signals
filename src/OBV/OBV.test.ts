import {asserts} from '../../deps.test.ts';
import {FasterOBV, OBV} from './OBV.ts';
import {NotEnoughDataError} from '../error/NotEnoughDataError.ts';

Deno.test('OBV', async t => {
  await t.step('getResult', async t => {
    await t.step('calculates the relative strength index', () => {
      // Test data verified with:
      // https://www.investopedia.com/terms/o/onbalancevolume.asp#mntl-sc-block_1-0-27
      const prices = [10, 10.15, 10.17, 10.13, 10.11, 10.15, 10.2, 10.2, 10.22, 10.21];
      const volumes = [25200, 30000, 25600, 32000, 23000, 40000, 36000, 20500, 23000, 27500];
      const candles = prices.map((price, index) => ({
        close: price,
        high: price,
        low: price,
        open: price,
        volume: volumes[index],
      }));
      const expectations = [
        '30000.000',
        '55600.000',
        '23600.000',
        '600.000',
        '40600.000',
        '76600.000',
        '76600.000',
        '99600.000',
        '72100.000',
      ];
      const obv = new OBV();
      const fasterOBV = new FasterOBV();
      for (const candle of candles) {
        obv.update(candle);
        fasterOBV.update(candle);
        if (obv.isStable && fasterOBV.isStable) {
          const expected = expectations.shift();
          asserts.assertEquals(obv.getResult().toFixed(3), expected!);
          asserts.assertEquals(fasterOBV.getResult().toFixed(3), expected!);
        }
      }
      asserts.assertEquals(obv.isStable, true);
      asserts.assertEquals(fasterOBV.isStable, true);

      asserts.assertEquals(obv.getResult().toFixed(2), '72100.00');
      asserts.assertEquals(fasterOBV.getResult().toFixed(2), '72100.00');

      asserts.assertEquals(obv.lowest?.toFixed(2), '600.00');
      asserts.assertEquals(fasterOBV.lowest?.toFixed(2), '600.00');

      asserts.assertEquals(obv.highest?.toFixed(2), '99600.00');
      asserts.assertEquals(fasterOBV.highest?.toFixed(2), '99600.00');
    });

    await t.step('throws an error when there is not enough input data', () => {
      const obv = new OBV();
      asserts.assertEquals(obv.isStable, false);
      try {
        obv.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(obv.isStable, false);
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });
});
