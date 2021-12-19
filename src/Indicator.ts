import type {BigInstance, BigSource} from '../deps.ts';
import {NotEnoughDataError} from './error/index.ts';

export interface Indicator<Result = BigInstance, Input = BigSource> {
  getResult(): Result;

  isStable: boolean;

  update(input: Input): void | Result;
}

/**
 * Tracks results of an indicator over time and memorizes the highest & lowest result.
 */
export interface IndicatorSeries<Result = BigInstance, Input = BigSource> extends Indicator<Result, Input> {
  highest?: Result;
  lowest?: Result;
}

export abstract class BigIndicatorSeries<Input = BigSource> implements IndicatorSeries<BigInstance, Input> {
  /** Highest return value over the lifetime (not interval!) of the indicator. */
  highest?: BigInstance;
  /** Lowest return value over the lifetime (not interval!) of the indicator. */
  lowest?: BigInstance;
  protected result?: BigInstance;

  get isStable(): boolean {
    return this.result !== undefined;
  }

  getResult(): BigInstance {
    if (this.result === undefined) {
      throw new NotEnoughDataError();
    }

    return this.result;
  }

  protected setResult(value: BigInstance): BigInstance {
    if (this.highest === undefined || value.gt(this.highest)) {
      this.highest = value;
    }

    if (this.lowest === undefined || value.lt(this.lowest)) {
      this.lowest = value;
    }

    return (this.result = value);
  }

  abstract update(input: Input): void | BigInstance;
}

export abstract class NumberIndicatorSeries<Input = number> implements IndicatorSeries<number, Input> {
  /** Highest return value over the lifetime (not interval!) of the indicator. */
  highest?: number;
  /** Lowest return value over the lifetime (not interval!) of the indicator. */
  lowest?: number;
  protected result?: number;

  get isStable(): boolean {
    return this.result !== undefined;
  }

  getResult(): number {
    if (this.result === undefined) {
      throw new NotEnoughDataError();
    }

    return this.result;
  }

  protected setResult(value: number): number {
    if (this.highest === undefined || value > this.highest) {
      this.highest = value;
    }

    if (this.lowest === undefined || value < this.lowest) {
      this.lowest = value;
    }

    return (this.result = value);
  }

  abstract update(input: Input): void | number;
}
