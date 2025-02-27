import type {BigInstance, BigSource} from '../../deps.ts';
import type {EMA, FasterEMA} from '../EMA/EMA.ts';
import type {DEMA, FasterDEMA} from '../DEMA/DEMA.ts';
import type {Indicator} from '../Indicator.ts';
import Big from '../../deps.ts';
import {NotEnoughDataError} from '../index.ts';

export type MACDConfig = {
  indicator: typeof EMA | typeof DEMA;
  longInterval: number;
  shortInterval: number;
  signalInterval: number;
};

export type MACDResult = {
  histogram: BigInstance;
  macd: BigInstance;
  signal: BigInstance;
};

export type FasterMACDResult = {
  histogram: number;
  macd: number;
  signal: number;
};

/**
 * Moving Average Convergence Divergence (MACD)
 * Type: Momentum
 *
 * The MACD triggers trading signals when it crosses above (bullish buying opportunity) or below (bearish selling
 * opportunity) its signal line. MACD can be used together with the RSI to provide a more accurate trading signal.
 *
 * @see https://www.investopedia.com/terms/m/macd.asp
 */
export class MACD implements Indicator<MACDResult> {
  public readonly prices: BigSource[] = [];
  public readonly long: EMA | DEMA;
  public readonly short: EMA | DEMA;

  private readonly signal: EMA | DEMA;
  private result: MACDResult | undefined;

  constructor(config: MACDConfig) {
    this.long = new config.indicator(config.longInterval);
    this.short = new config.indicator(config.shortInterval);
    this.signal = new config.indicator(config.signalInterval);
  }

  get isStable(): boolean {
    return this.result !== undefined;
  }

  update(_price: BigSource): void | MACDResult {
    const price = new Big(_price);
    this.prices.push(price);

    const short = this.short.update(price);
    const long = this.long.update(price);

    if (this.prices.length > this.long.interval) {
      this.prices.shift();
    }

    if (this.prices.length === this.long.interval && short && long) {
      /**
       * Standard MACD is the short (usually 12 periods) EMA less the long (usually 26 periods) EMA. Closing prices are
       * used to form the moving averages.
       */
      const macd = short.sub(long);

      /**
       * A short (usually 9 periods) EMA of MACD is plotted along side to act as a signal line to identify turns in the
       * indicator. It gets updated once the long EMA has enough input data.
       */
      const signal = this.signal.update(macd);

      if (signal) {
        /**
         * The MACD histogram is calculated as the MACD indicator minus the signal line (usually 9 periods) EMA.
         */
        return (this.result = {
          histogram: macd.sub(signal),
          macd: macd,
          signal,
        });
      }
    }
  }

  getResult(): MACDResult {
    if (!this.isStable || this.result === undefined) {
      throw new NotEnoughDataError();
    }

    return this.result;
  }
}

export class FasterMACD implements Indicator<FasterMACDResult> {
  public readonly prices: number[] = [];
  private result: FasterMACDResult | undefined;

  constructor(
    public readonly short: FasterEMA | FasterDEMA,
    public readonly long: FasterEMA | FasterDEMA,
    public readonly signal: FasterEMA | FasterDEMA
  ) {}

  getResult(): FasterMACDResult {
    if (this.result === undefined) {
      throw new NotEnoughDataError();
    }

    return this.result;
  }

  get isStable(): boolean {
    return this.result !== undefined;
  }

  update(price: number): void | FasterMACDResult {
    this.prices.push(price);

    const short = this.short.update(price);
    const long = this.long.update(price);

    if (this.prices.length > this.long.interval) {
      this.prices.shift();
    }

    if (this.prices.length === this.long.interval && short && long) {
      const macd = short - long;
      const signal = this.signal.update(macd);

      if (signal) {
        return (this.result = {
          histogram: macd - signal,
          macd,
          signal,
        });
      }
    }
  }
}
