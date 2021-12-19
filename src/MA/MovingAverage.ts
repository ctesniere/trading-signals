import type {BigInstance, BigSource} from '../../deps.ts';
import {BigIndicatorSeries, NumberIndicatorSeries} from '../Indicator.ts';

/**
 * Moving Average (MA)
 * Type: Trend
 *
 * Base class for trend-following (lagging) indicators. The longer the moving average interval, the greater the lag.
 *
 * @see https://www.investopedia.com/terms/m/movingaverage.asp
 */
export abstract class MovingAverage extends BigIndicatorSeries {
  constructor(public readonly interval: number) {
    super();
  }

  abstract update(price: BigSource): BigInstance | void;
}

export abstract class FasterMovingAverage extends NumberIndicatorSeries {
  constructor(public readonly interval: number) {
    super();
  }

  abstract update(price: number): number | void;
}
