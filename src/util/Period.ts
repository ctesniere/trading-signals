import type {BigInstance, BigSource} from '../../deps.ts';
import Big from '../../deps.ts';
import {Indicator} from '../Indicator.ts';
import {getFixedArray} from './getFixedArray.ts';
import {getMinimum} from './getMinimum.ts';
import {getMaximum} from './getMaximum.ts';

export interface PeriodResult {
  highest: BigInstance;
  lowest: BigInstance;
}

export interface FasterPeriodResult {
  highest: number;
  lowest: number;
}

export class Period implements Indicator<PeriodResult> {
  public values: BigInstance[];
  /** Highest return value during the current period. */
  public highest?: BigInstance;
  /** Lowest return value during the current period. */
  public lowest?: BigInstance;

  constructor(public readonly interval: number) {
    this.values = getFixedArray<BigInstance>(interval);
  }

  getResult(): PeriodResult {
    return {
      highest: this.highest!,
      lowest: this.lowest!,
    };
  }

  update(value: BigSource): PeriodResult | void {
    this.values.push(new Big(value));
    if (this.isStable) {
      this.lowest = getMinimum(this.values);
      this.highest = getMaximum(this.values);
      return this.getResult();
    }
  }

  get isStable(): boolean {
    return this.values.length === this.interval;
  }
}

export class FasterPeriod implements Indicator<FasterPeriodResult> {
  public values: number[];
  /** Highest return value during the current period. */
  public highest?: number;
  /** Lowest return value during the current period. */
  public lowest?: number;

  constructor(public readonly interval: number) {
    this.values = getFixedArray<number>(interval);
  }

  getResult(): FasterPeriodResult {
    return {
      highest: this.highest!,
      lowest: this.lowest!,
    };
  }

  update(value: number): FasterPeriodResult | void {
    this.values.push(value);
    if (this.isStable) {
      this.lowest = Math.min(...this.values);
      this.highest = Math.max(...this.values);
      return this.getResult();
    }
  }

  get isStable(): boolean {
    return this.values.length === this.interval;
  }
}
