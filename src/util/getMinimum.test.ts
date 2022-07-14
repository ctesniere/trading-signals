import {asserts} from '../../deps.test.ts';
import {getMinimum} from './getMinimum.ts';

Deno.test('getMinimum', async t => {
  await t.step('returns the lowest from all given values', () => {
    const minimum = getMinimum([4, 5, 1, 9, 7, 8]);
    asserts.assertEquals(minimum.valueOf(), '1');
  });
});
