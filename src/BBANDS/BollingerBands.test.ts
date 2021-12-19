import {asserts} from '../../deps.test.ts';
import {BollingerBands, FasterBollingerBands} from './BollingerBands.ts';
import Big from '../../deps.ts';
import data from '../test/fixtures/BB/data.js';
import {NotEnoughDataError} from '../error/index.ts';

Deno.test('BollingerBands', async function (t) {
  await t.step('prices', async function (t) {
    await t.step('does not cache more prices than necessary to fill the interval', function () {
      const bb = new BollingerBands(3);
      bb.update(1);
      bb.update(2);
      asserts.assertEquals(bb.prices.length, 2);
      bb.update(3);
      asserts.assertEquals(bb.prices.length, 3);
      bb.update(4);
      asserts.assertEquals(bb.prices.length, 3);
      bb.update(5);
      asserts.assertEquals(bb.prices.length, 3);
      bb.update(6);
      asserts.assertEquals(bb.prices.length, 3);
    });
  });

  await t.step('getResult', async function (t) {
    await t.step('calculates Bollinger Bands with interval 20', function () {
      const bb = new BollingerBands(20);

      data.prices.forEach((price, index) => {
        bb.update(new Big(price));

        if (!bb.isStable) {
          return;
        }

        const resMiddle = new Big(Number(data.middle[index]));
        const resLower = new Big(Number(data.lower[index]));
        const resUpper = new Big(Number(data.upper[index]));

        const {middle, upper, lower} = bb.getResult();

        asserts.assertEquals(middle.toPrecision(12), resMiddle.toPrecision(12));
        asserts.assertEquals(lower.toPrecision(12), resLower.toPrecision(12));
        asserts.assertEquals(upper.toPrecision(12), resUpper.toPrecision(12));
      });
    });
    await t.step('has a default standard deviation multiplier configuration', function () {
      const bb = new BollingerBands(5);
      asserts.assertEquals(bb.interval, 5);
      asserts.assertEquals(bb.deviationMultiplier, 2);
    });
    await t.step('throws an error when there is not enough input data', function () {
      const bb = new BollingerBands(20);

      try {
        bb.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
    await t.step('is compatible with results from Tulip Indicators (TI)', function () {
      // Test data verified with:
      // https://tulipindicators.org/bbands
      const inputs = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];

      const expectedLows = [
        undefined,
        undefined,
        undefined,
        undefined,
        '80.53',
        '80.99',
        '82.53',
        '82.47',
        '82.42',
        '82.44',
        '82.51',
        '83.14',
        '83.54',
        '83.87',
        '85.29',
      ];

      const expectedMids = [
        undefined,
        undefined,
        undefined,
        undefined,
        '82.43',
        '82.74',
        '83.09',
        '83.32',
        '83.63',
        '83.78',
        '84.25',
        '84.99',
        '85.57',
        '86.22',
        '86.80',
      ];

      const expectedUps = [
        undefined,
        undefined,
        undefined,
        undefined,
        '84.32',
        '84.49',
        '83.65',
        '84.16',
        '84.84',
        '85.12',
        '86.00',
        '86.85',
        '87.61',
        '88.57',
        '88.32',
      ];

      const bb = new BollingerBands(5, 2);

      for (let i = 0; i < inputs.length; i++) {
        const price = inputs[i];
        bb.update(price);
        if (bb.isStable) {
          const {lower, middle, upper} = bb.getResult();
          const expectedLow = expectedLows[i];
          const expectedMid = expectedMids[i];
          const expectedUp = expectedUps[i];
          asserts.assertEquals(lower.toFixed(2), `${expectedLow}`);
          asserts.assertEquals(middle.toFixed(2), `${expectedMid}`);
          asserts.assertEquals(upper.toFixed(2), `${expectedUp}`);
        }
      }
    });
  });
});

Deno.test('FasterBollingerBands', async function (t) {
  await t.step('getResult', async function (t) {
    await t.step('only works with plain numbers', function () {
      // Test data verified with:
      // https://tulipindicators.org/bbands
      const prices = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];
      const fasterBB = new FasterBollingerBands(5, 2);
      for (const price of prices) {
        fasterBB.update(price);
      }

      asserts.assertEquals(fasterBB.isStable, true);

      const actual = fasterBB.getResult();
      asserts.assertEquals(actual.lower.toFixed(2), '85.29');
      asserts.assertEquals(actual.middle.toFixed(2), '86.80');
      asserts.assertEquals(actual.upper.toFixed(2), '88.32');
    });

    await t.step('throws an error when there is not enough input data', function () {
      const fasterBB = new FasterBollingerBands(5);
      try {
        fasterBB.getResult();
        asserts.fail('Expected error');
      } catch (error) {
        asserts.assertEquals(error instanceof NotEnoughDataError, true);
      }
    });
  });
});
