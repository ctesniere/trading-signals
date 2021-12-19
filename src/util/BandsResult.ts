import type {BigInstance} from '../../deps.ts';

export interface BandsResult {
  lower: BigInstance;
  middle: BigInstance;
  upper: BigInstance;
}

export interface FasterBandsResult {
  lower: number;
  middle: number;
  upper: number;
}
