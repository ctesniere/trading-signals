import type {BigInstance} from '../../deps.ts';
import type {FasterMovingAverage, MovingAverage} from '../MA/MovingAverage.ts';
import type {FasterMovingAverageTypes, MovingAverageTypes} from '../MA/MovingAverageTypes.ts';
import type {HighLow, HighLowNumber} from '../util/index.ts';
import Big from '../../deps.ts';
import {BigIndicatorSeries, NumberIndicatorSeries} from '../Indicator.ts';
import {FasterSMA, SMA} from '../SMA/SMA.ts';

/**
 * Awesome Oscillator (AO)
 * Type: Momentum
 *
 * The Awesome Oscillator (AO) is an indicator used to measure market momentum.
 * It has been developed by the technical analyst and charting enthusiast Bill Williams.
 *
 * When AO crosses above Zero, short term momentum is rising faster than long term momentum which signals a bullish
 * buying opportunity. When AO crosses below Zero, short term momentum is falling faster then the long term momentum
 * which signals a bearish selling opportunity.
 *
 * @see https://www.tradingview.com/support/solutions/43000501826-awesome-oscillator-ao/
 * @see https://tradingstrategyguides.com/bill-williams-awesome-oscillator-strategy/
 */
export class AO extends BigIndicatorSeries<HighLow> {
  public readonly long: MovingAverage;
  public readonly short: MovingAverage;

  constructor(
    public readonly shortInterval: number,
    public readonly longInterval: number,
    SmoothingIndicator: MovingAverageTypes = SMA
  ) {
    super();
    this.short = new SmoothingIndicator(shortInterval);
    this.long = new SmoothingIndicator(longInterval);
  }

  override update({low, high}: HighLow): void | BigInstance {
    const candleSum = new Big(low).add(high);
    const medianPrice = candleSum.div(2);

    this.short.update(medianPrice);
    this.long.update(medianPrice);

    if (this.long.isStable) {
      return this.setResult(this.short.getResult().sub(this.long.getResult()));
    }
  }
}

export class FasterAO extends NumberIndicatorSeries<HighLowNumber> {
  public readonly long: FasterMovingAverage;
  public readonly short: FasterMovingAverage;

  constructor(
    public readonly shortInterval: number,
    public readonly longInterval: number,
    SmoothingIndicator: FasterMovingAverageTypes = FasterSMA
  ) {
    super();
    this.short = new SmoothingIndicator(shortInterval);
    this.long = new SmoothingIndicator(longInterval);
  }

  override update({low, high}: HighLowNumber): void | number {
    const medianPrice = (low + high) / 2;

    this.short.update(medianPrice);
    this.long.update(medianPrice);

    if (this.long.isStable) {
      return this.setResult(this.short.getResult() - this.long.getResult());
    }
  }
}
