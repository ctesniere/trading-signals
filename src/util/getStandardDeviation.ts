import type {BigInstance, BigSource} from '../../deps.ts';
import {getFasterAverage, getAverage} from './getAverage.ts';
import Big from '../../deps.ts';

/**
 * Standard deviation calculates how prices for a collection of prices are spread out from the average price of these
 * prices. Standard deviation makes outliers even more visible than mean absolute deviation (MAD).
 *
 * @see https://www.mathsisfun.com/data/standard-deviation-formulas.html
 * @see https://www.youtube.com/watch?v=9-8E8L_77-8
 */
export function getStandardDeviation(values: BigSource[], average?: BigSource): BigInstance {
  const middle = average || getAverage(values);
  const squaredDifferences = values.map((value: BigSource) => new Big(value).sub(middle).pow(2));
  return getAverage(squaredDifferences).sqrt();
}

export function getFasterStandardDeviation(values: number[], average?: number): number {
  const middle = average || getFasterAverage(values);
  const squaredDifferences = values.map(value => value - middle).map(value => value * value);
  const averageDifference = getFasterAverage(squaredDifferences);
  return Math.sqrt(averageDifference);
}
