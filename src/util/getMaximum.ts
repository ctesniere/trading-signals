import type {BigInstance, BigSource} from '../../deps.ts';
import Big from '../../deps.ts';

export function getMaximum(values: BigSource[]): BigInstance {
  let max = new Big(Number.MIN_SAFE_INTEGER);
  for (const value of values) {
    if (max.lt(value)) {
      max = new Big(value);
    }
  }
  return max;
}
