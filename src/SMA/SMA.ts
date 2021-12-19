import type {BigInstance, BigSource} from '../../deps.ts';
import Big from '../../deps.ts';
import {FasterMovingAverage, MovingAverage} from '../MA/MovingAverage.ts';

/**
 * Simple Moving Average (SMA)
 * Type: Trend
 *
 * The Simple Moving Average (SMA) creates an average of all prices within a fixed interval. The SMA weights the prices
 * of all periods equally which makes it not as responsive to recent prices as the EMA.
 *
 * @see https://www.investopedia.com/terms/s/sma.asp
 */
export class SMA extends MovingAverage {
  public readonly prices: BigSource[] = [];

  override update(price: BigSource): BigInstance | void {
    this.prices.push(price);

    if (this.prices.length > this.interval) {
      this.prices.shift();
    }

    if (this.prices.length === this.interval) {
      return this.setResult(SMA.getResultFromBatch(this.prices));
    }
  }

  static getResultFromBatch(prices: BigSource[]): BigInstance {
    const sum = prices.reduce((a: BigInstance, b: BigSource) => a.plus(b), new Big('0'));
    return sum.div(prices.length || 1);
  }
}

export class FasterSMA extends FasterMovingAverage {
  protected declare result?: number;
  public readonly prices: number[] = [];

  update(price: number): void | number {
    this.prices.push(price);

    if (this.prices.length > this.interval) {
      this.prices.shift();
    }

    if (this.prices.length === this.interval) {
      const sum = this.prices.reduce((a, b) => a + b, 0);
      return this.setResult(sum / this.prices.length);
    }
  }
}
