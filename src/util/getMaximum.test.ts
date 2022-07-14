import {asserts} from '../../deps.test.ts';
import {getMaximum} from './getMaximum.ts';

Deno.test('getMaximum', async t => {
  await t.step('returns the highest from all given values', () => {
    const maximum = getMaximum([4, 5, 1, 9, 7, 8]);
    asserts.assertEquals(maximum.valueOf(), '9');
  });
});
