import {asserts} from '../../deps.test.ts';
import {FasterMovingAverage} from './MovingAverage.ts';
import {NotEnoughDataError} from '../error/index.ts';

class MyAverage extends FasterMovingAverage {
  iterations = 0;
  total = 0;

  update(price: number): number | void {
    if (this.result === undefined) {
      this.result = 0;
    }
    this.iterations += 1;
    this.total += price;
    return (this.result = this.total / this.iterations);
  }
}

Deno.test('FasterMovingAverage', async t => {
  await t.step('can be used to implement custom average calculations based on primitive numbers', () => {
    const average = new MyAverage(Infinity);
    asserts.assertEquals(average.isStable, false);

    try {
      average.getResult();
      asserts.fail('Expected error');
    } catch (error) {
      asserts.assertEquals(error instanceof NotEnoughDataError, true);
    }

    average.update(50);
    average.update(100);
    const result = average.getResult();
    asserts.assertEquals(result, 75);
  });
});
