import {asserts} from '../../deps.test.ts';
import {getFixedArray} from './getFixedArray.ts';

Deno.test('getFixedArray', async t => {
  await t.step('push', async t => {
    await t.step('removes items from the beginning when the amount of items exceed the maximum length', () => {
      const maxLength = 3;
      const array = getFixedArray(maxLength);
      array.push(1);
      asserts.assertEquals(array.length, 1);
      array.push(2);
      asserts.assertEquals(array.length, 2);
      array.push(3);
      asserts.assertEquals(array.length, maxLength);
      array.push(4);
      asserts.assertEquals(array.length, maxLength);
      array.push(5);
      asserts.assertEquals(array.length, maxLength);
      asserts.assertEquals(array[0], 3);
      asserts.assertEquals(array[1], 4);
      asserts.assertEquals(array[2], 5);
    });

    await t.step('works when pushing multiple items at once', () => {
      const maxLength = 3;
      const array = getFixedArray(maxLength);
      array.push(1, 2, 3, 4, 5);
      asserts.assertEquals(array.length, maxLength);
      asserts.assertEquals(array[0], 3);
      asserts.assertEquals(array[1], 4);
      asserts.assertEquals(array[2], 5);
    });
  });
});
