import type {BigInstance} from '../../deps.ts';
import type {FasterMovingAverage, MovingAverage} from '../MA/MovingAverage.ts';
import type {FasterMovingAverageTypes, MovingAverageTypes} from '../MA/MovingAverageTypes.ts';
import type {HighLowClose, HighLowCloseNumber} from '../util/index.ts';
import {BigIndicatorSeries, NumberIndicatorSeries} from '../Indicator.ts';
import {FasterTR, TR} from '../TR/TR.ts';
import {FasterWSMA, WSMA} from '../WSMA/WSMA.ts';

/**
 * Average True Range (ATR)
 * Type: Volatility
 *
 * The ATR was developed by **John Welles Wilder, Jr.**. The idea of ranges is that they show the commitment or
 * enthusiasm of traders. Large or increasing ranges suggest traders prepared to continue to bid up or sell down a
 * stock through the course of the day. Decreasing range indicates declining interest.
 *
 * @see https://www.investopedia.com/terms/a/atr.asp
 */
export class ATR extends BigIndicatorSeries<HighLowClose> {
  private readonly tr: TR;
  private readonly smoothing: MovingAverage;

  constructor(public readonly interval: number, SmoothingIndicator: MovingAverageTypes = WSMA) {
    super();
    this.tr = new TR();
    this.smoothing = new SmoothingIndicator(interval);
  }

  override update(candle: HighLowClose): BigInstance | void {
    const trueRange = this.tr.update(candle);
    this.smoothing.update(trueRange);
    if (this.smoothing.isStable) {
      return this.setResult(this.smoothing.getResult());
    }
  }
}

export class FasterATR extends NumberIndicatorSeries<HighLowCloseNumber> {
  private readonly tr: FasterTR;
  private readonly smoothing: FasterMovingAverage;

  constructor(public readonly interval: number, SmoothingIndicator: FasterMovingAverageTypes = FasterWSMA) {
    super();
    this.tr = new FasterTR();
    this.smoothing = new SmoothingIndicator(interval);
  }

  update(candle: HighLowCloseNumber): number | void {
    const trueRange = this.tr.update(candle);
    this.smoothing.update(trueRange);
    if (this.smoothing.isStable) {
      return this.setResult(this.smoothing.getResult());
    }
  }
}
