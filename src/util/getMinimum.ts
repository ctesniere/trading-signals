import type {BigInstance, BigSource} from '../../deps.ts';
import Big from '../../deps.ts';

export function getMinimum(values: BigSource[]): BigInstance {
  let min = new Big(Number.MAX_SAFE_INTEGER);
  for (const value of values) {
    if (min.gt(value)) {
      min = new Big(value);
    }
  }
  return min;
}
