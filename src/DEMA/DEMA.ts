import type {BigInstance, BigSource} from '../../deps.ts';
import {EMA, FasterEMA} from '../EMA/EMA.ts';
import {BigIndicatorSeries, NumberIndicatorSeries} from '../Indicator.ts';

/**
 * Double Exponential Moving Average (DEMA)
 * Type: Trend
 *
 * The Double Exponential Moving Average (DEMA) was developed by Patrick G. Mulloy. It attempts to remove the lag
 * associated with Moving Averages by placing more weight on recent values. It has its name because the value of an EMA
 * is doubled which makes it responds more quickly to short-term price changes than a normal EMA.
 *
 * @see https://www.investopedia.com/terms/d/double-exponential-moving-average.asp
 */
export class DEMA extends BigIndicatorSeries {
  private readonly inner: EMA;
  private readonly outer: EMA;

  constructor(public readonly interval: number) {
    super();
    this.inner = new EMA(interval);
    this.outer = new EMA(interval);
  }

  override update(price: BigSource): BigInstance {
    const innerResult = this.inner.update(price);
    const outerResult = this.outer.update(innerResult);
    return this.setResult(innerResult.times(2).sub(outerResult));
  }

  override get isStable(): boolean {
    return this.outer.isStable;
  }
}

export class FasterDEMA extends NumberIndicatorSeries {
  private readonly inner: FasterEMA;
  private readonly outer: FasterEMA;

  constructor(public readonly interval: number) {
    super();
    this.inner = new FasterEMA(interval);
    this.outer = new FasterEMA(interval);
  }

  override update(price: number): number | undefined {
    const innerResult = this.inner.update(price);
    if (innerResult) {
      const outerResult = this.outer.update(innerResult);
      if (outerResult) {
        return this.setResult(innerResult * 2 - outerResult);
      }
    }
  }

  override get isStable(): boolean {
    return this.outer.isStable;
  }
}
