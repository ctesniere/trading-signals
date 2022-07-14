import {asserts} from '../../deps.test.ts';
import {getFasterAverage, getAverage} from './getAverage.ts';

Deno.test('getAverage', async t => {
  await t.step('does not fail when entering an empty array', () => {
    const average = getAverage([]);
    asserts.assertEquals(average.valueOf(), '0');
  });

  await t.step('returns the average of all given prices', () => {
    const prices = [20, 30, 40];
    const average = getAverage(prices);
    asserts.assertEquals(average.valueOf(), '30');
  });
});

Deno.test('getFasterAverage', async t => {
  await t.step('does not fail when entering an empty array', () => {
    const average = getFasterAverage([]);
    asserts.assertEquals(average, 0);
  });

  await t.step('only works with the primitive data type number', () => {
    const prices = [20, 30, 40];
    const average = getFasterAverage(prices);
    asserts.assertEquals(average, 30);
  });
});
